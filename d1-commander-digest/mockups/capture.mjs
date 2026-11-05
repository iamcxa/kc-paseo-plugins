import { spawn, execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = dirname(fileURLToPath(import.meta.url));
const chrome = process.argv[2];
const before = process.argv.includes('--before');
if (!chrome) throw new Error('Usage: node capture.mjs <absolute Chromium executable>');
const source = await readFile(join(root, 'index.html'), 'utf8');
const reviewSource = await readFile(join(root, 'review.html'), 'utf8');
const states = JSON.parse(source.match(/<script id="scenarios" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const reviewStates = JSON.parse(reviewSource.match(/<script id="review-scenarios" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(states, reviewStates);
for (const html of [source, reviewSource]) {
  assert(!/(?:src|href)=["']https?:/i.test(html));
  assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(|localStorage|sessionStorage/.test(html));
}
await mkdir(join(root, 'screenshots'), { recursive: true });
await mkdir(join(root, 'checks'), { recursive: true });
const tests = [], captures = [], sessions = [], reviewImages = [];
const beforeFindings = [];
const pass = name => tests.push({ name, status: 'passed' });
const sha = text => createHash('sha256').update(text).digest('hex');

async function freshBrowser(run) {
  const profile = await mkdtemp(join(root, '.capture-profile-'));
  const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run',
    '--no-default-browser-check', '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--disable-crash-reporter', '--host-resolver-rules=MAP * ~NOTFOUND',
    '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank'],
    { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
  let sequence = 0, buffer = '', stderr = '';
  const pending = new Map(), exceptions = [], requests = [], violations = [];
  child.stderr.on('data', chunk => { stderr += chunk.toString(); });
  child.stdio[4].on('data', chunk => {
    buffer += chunk.toString();
    let end;
    while ((end = buffer.indexOf('\0')) !== -1) {
      const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
      if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
      if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
      const waiter = pending.get(message.id);
      if (waiter) {
        clearTimeout(waiter.timeout); pending.delete(message.id);
        message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result);
      }
    }
  });
  const call = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => {
      pending.delete(id); reject(new Error(`Chromium pipe timed out: ${method}; ${stderr.slice(-700)}`));
    }, 12000);
    pending.set(id, { resolve, reject, timeout });
    child.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
  });
  try {
    const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
    const cdp = (method, params) => call(method, params, sessionId);
    await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
    await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.policyViolations=[];document.addEventListener('securitypolicyviolation',e=>policyViolations.push(e.violatedDirective));` });
    const evaluate = async expression => {
      const value = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (value.exceptionDetails) throw new Error(JSON.stringify(value.exceptionDetails));
      return value.result.value;
    };
    const waitFor = async expression => {
      for (let i = 0; i < 160; i++) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      throw new Error('Condition failed: ' + expression);
    };
    const go = async (file, ready) => {
      await cdp('Page.navigate', { url: file });
      await waitFor(`document.readyState==='complete' && ${ready}`);
      await evaluate('document.fonts.ready');
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    };
    const click = async selector => {
      const rect = await evaluate(`(()=>{const x=document.querySelector(${JSON.stringify(selector)});if(!x)throw Error('Missing '+${JSON.stringify(selector)});x.scrollIntoView({block:'nearest'});const r=x.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height,disabled:x.disabled}})()`);
      assert(rect.w > 0 && rect.h > 0 && !rect.disabled, `Clickable target: ${selector}`);
      await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
      await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
      await evaluate('new Promise(resolve=>requestAnimationFrame(resolve))');
    };
    const fill = (selector, value) => evaluate(`(()=>{const x=document.querySelector(${JSON.stringify(selector)});x.focus();x.value=${JSON.stringify(value)};x.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    const resize = (width, height) => cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 760 });
    const screenshot = async file => {
      const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(join(root, file), Buffer.from(shot.data, 'base64'));
    };
    await run({ cdp, evaluate, waitFor, go, click, fill, resize, screenshot });
    violations.push(...await evaluate('window.policyViolations||[]'));
    assert.deepEqual(exceptions, [], 'No script exceptions');
    assert.deepEqual(violations, [], 'No content policy violations');
    assert(requests.every(url => url.startsWith('file:') || url.startsWith('data:')), 'Only local files requested');
  } finally {
    await call('Browser.close').catch(() => child.kill('SIGTERM'));
    if (child.exitCode === null && child.signalCode === null) await new Promise((resolve, reject) => {
      const soft = setTimeout(() => child.kill('SIGTERM'), 2500);
      const hard = setTimeout(() => child.kill('SIGKILL'), 5000);
      const limit = setTimeout(() => reject(new Error('Chromium did not exit')), 9000);
      child.once('exit', () => { clearTimeout(soft); clearTimeout(hard); clearTimeout(limit); resolve(); });
    });
    for (const waiter of pending.values()) clearTimeout(waiter.timeout);
    assert(child.exitCode !== null || child.signalCode !== null);
    await rm(profile, { recursive: true, force: true });
    await assert.rejects(access(profile));
    sessions.push({ freshProfile: true, browserStopped: true, ownEmptyProfileRemoved: true,
      scriptExceptions: exceptions.length, policyViolations: violations.length,
      requestedOnlyFiles: requests.every(url => url.startsWith('file:') || url.startsWith('data:')) });
  }
}

try {
for (const [width, height] of [[1440, 1000], [360, 780]]) {
  await freshBrowser(async ({ evaluate, go, click, fill, resize, screenshot }) => {
    await resize(width, height);
    const url = pathToFileURL(join(root, 'index.html')).href;
    const state = id => go(url + '?state=' + id, '!!window.mock');
    const snapshot = () => evaluate('mock.snapshot()');
    const named = width < 760 ? '.mobile-gate .named-gate' : '.board .named-gate';
    if (before) {
      await state('digest');
      await click('[data-replay="2"]'); await click('[data-action=discuss]');
      await fill('#message', '請先補齊取消預約的試用步驟。'); await click('[data-action=send]');
      const reply = await snapshot();
      await click(named); await click('[data-choice="准"]'); await click('#confirm');
      await click('.back');
      const boardText = await evaluate(`document.querySelector(${JSON.stringify(named)}).textContent`);
      await click(named);
      const reopened = await snapshot();
      beforeFindings.push({ viewport: `${width}x${height}`, sentReply: reply.sent,
        boardAfterConfirm: boardText, reopenedChoice: reopened.chosen,
        reopenedSent: reopened.gateSent, canChooseAgain: await evaluate('!!document.querySelector("[data-choice]")'),
        hostSidebarWidth: await evaluate('document.querySelector(".appnav").getBoundingClientRect().width') });
      return;
    }
    for (const scenario of states) {
      await state(scenario.id);
      const geometry = await evaluate(`(()=>{const rect=x=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,modal:document.querySelector('.replay-card')?rect(document.querySelector('.replay-card')):null,controls:[...document.querySelectorAll('.replay-card button,.gate-controls button,.send')].filter(x=>x.getClientRects().length).map(x=>({text:x.textContent.trim(),disabled:x.disabled,...rect(x)})),unknownVisible:(()=>{const x=document.querySelector('.unknown');if(!x)return null;const r=x.getBoundingClientRect();const c=x.closest('.conversation').getBoundingClientRect();return r.top>=c.top&&r.bottom<=c.bottom})(),confirmDisabled:document.querySelector('#confirm')?.disabled}})()`);
      assert.equal(geometry.width, width); assert.equal(geometry.height, height);
      assert(geometry.documentWidth <= width, scenario.id + ' horizontal overflow');
      assert(geometry.documentHeight <= height, scenario.id + ' outer vertical overflow');
      assert.equal(await evaluate('document.querySelector(".appnav").getBoundingClientRect().width'), width === 1440 ? 320 : 0);
      assert.equal(await evaluate('document.querySelector(".subhead").textContent.includes("虛構示意")'), false);
      for (const control of geometry.controls) {
        assert(control.height >= 34 && control.width >= 32, 'Control has a usable visual target');
        assert(control.y >= 0 && control.bottom <= height + 1, scenario.id + ': action inside viewport');
      }
      if (scenario.id === 'digest') assert(geometry.unknownVisible, 'Unknown report line is visible');
      if (scenario.id === 'context-sent') assert(await evaluate('(()=>{const box=document.querySelector(".conversation").getBoundingClientRect();return [...document.querySelectorAll(".sent-context,[data-sent-message]")].every(x=>{const r=x.getBoundingClientRect();return r.top>=box.top&&r.bottom<=box.bottom})})()'), 'Both sent context and Captain words are visible');
      if (scenario.id === 'gate-reason-empty') assert.equal(geometry.confirmDisabled, true);
      if (scenario.id === 'gate-reason-ready' || scenario.id === 'gate-confirm') assert.equal(geometry.confirmDisabled, false);
      if (geometry.modal && width === 360) assert(Math.abs(geometry.modal.bottom - height) < 1, 'Phone is a bottom sheet');
      const file = `screenshots/${width}-${scenario.id}.png`;
      await screenshot(file);
      captures.push({ state: scenario.id, viewport: `${width}x${height}`, file, geometry });
    }
    pass(`${width}: all ${states.length} states fit their viewport; action exits visible; unknown visible on digest`);
    await state('digest');
    assert.equal(await evaluate('document.querySelectorAll(".point").length'), 3);
    assert.equal(await evaluate('document.querySelectorAll("blockquote").length'), 0);
    for (let i = 0; i < 3; i++) {
      await click(`[data-replay="${i}"]`);
      assert.equal(await evaluate('document.querySelector(".quote").textContent'), await evaluate(`'「'+points[${i}].original+'」'`));
      assert.equal((await snapshot()).point, i);
      await click('[data-action=close]');
      assert.equal(await evaluate('document.activeElement.dataset.replay'), String(i));
    }
    pass(`${width}: three distinct exact fictional sources; close restores each Replay focus`);
    await fill('#message', '保留我的方向草稿。');
    for (const action of ['discuss', 'new-decision']) {
      await click('[data-replay="2"]');
      await click(`[data-action=${action}]`);
      const value = await snapshot();
      assert.equal(value.view, 'commander'); assert.equal(value.chosen, null);
      assert.equal(value.context, 2); assert.equal(value.draft, '保留我的方向草稿。');
      assert.equal(value.sent.length, 0); assert.equal(await evaluate('document.activeElement.id'), 'message');
    }
    await click('[data-action=remove-context]');
    assert.equal((await snapshot()).draft, '保留我的方向草稿。');
    pass(`${width}: both reply exits keep draft, focus Commander, send nothing, select no gate`);
    for (const point of [0, 2]) {
      await state('digest');
      await click(`[data-replay="${point}"]`); await click('[data-action=discuss]');
      await fill('#message', '請先補齊取消預約的試用步驟。'); await click('[data-action=send]');
      const message = (await snapshot()).sent[0];
      assert.equal(message.words, '請先補齊取消預約的試用步驟。');
      assert.equal(message.context.pointId, await evaluate(`points[${point}].id`));
      assert.equal(message.context.digestId, 'fictional-digest-1420');
      assert.equal(message.context.sentence, await evaluate(`points[${point}].sentence`));
      assert.equal(await evaluate('document.querySelector("[data-sent-message]").textContent'), message.words);
      assert.equal(await evaluate('document.querySelector(".sent-context span").textContent'), message.context.sentence);
      assert.equal(await evaluate('document.querySelector(".sent-context").dataset.pointId'), message.context.pointId);
      assert.equal((await snapshot()).context, null, 'Clearing composer cannot remove sent context');
      await click(named); await click('.back');
      assert.deepEqual((await snapshot()).sent[0], message, 'Context survives leaving and returning');
    }
    pass(`${width}: sent replies retain distinct digest point identity and sentence, separate from identical Captain words`);
    await state('source-missing');
    assert.equal(await evaluate('document.querySelectorAll(".quote").length'), 0);
    await click('[data-action=open-fo]');
    assert.equal((await snapshot()).view, 'fo'); assert.equal((await snapshot()).point, 2);
    await click('.back'); assert.equal((await snapshot()).view, 'commander');
    pass(`${width}: missing source has no substitute quote; correct fictional FO and return reachable`);
    await state('digest');
    await click('.mainhead [data-action=board]');
    assert.equal((await snapshot()).view, 'board');
    assert(await evaluate('document.querySelector(".board-mobile .named-gate").getBoundingClientRect().height>0'));
    await click('.back'); assert.equal((await snapshot()).view, 'commander');
    pass(`${width}: existing Board exit shows the named gate and returns to Commander`);
    await state('digest');
    await fill('#message', '先完成試用安排，再處理其他改動。');
    assert.equal((await snapshot()).sent.length, 0);
    await click('[data-action=send]');
    const sent = await snapshot();
    assert.equal(sent.sent.length, 1); assert.equal(sent.view, 'commander');
    assert.equal(sent.context, null); assert.equal(sent.chosen, null); assert.equal(sent.gateSent, false);
    pass(`${width}: type then send works without Replay and cannot record a gate`);
    await state('digest');
    await click('[data-replay="2"]'); await click('[data-action=new-decision]');
    assert.equal((await snapshot()).view, 'commander');
    assert.equal((await snapshot()).chosen, null);
    await click(named); assert.equal((await snapshot()).view, 'gate');
    assert(await evaluate('document.querySelector(".briefing").textContent.includes("不包含正式上線")'));
    await click('[data-choice="准"]'); assert.equal((await snapshot()).gateSent, false);
    await click('#confirm'); assert.equal((await snapshot()).gateSent, true);
    assert(await evaluate('document.querySelector(".sent-status").textContent.includes("尚未記錄")'));
    pass(`${width}: five explicit clicks from Replay path; named gate, full briefing, choose and Confirm remain distinct`);
    for (const phase of ['sent', 'relayed', 'recorded']) {
      await evaluate(`mock.setGateProgress(${JSON.stringify(phase)})`);
      await click('.back');
      const label = await evaluate(`document.querySelector(${JSON.stringify(named)}).textContent`);
      assert(!label.includes('等你決定'), 'Confirmed gate cannot wait on the Captain');
      assert(label.includes({ sent: '已送出', relayed: '已轉交', recorded: '已記錄' }[phase]));
      await click(named);
      const reopened = await snapshot();
      assert.equal(reopened.gateProgress, phase); assert.equal(reopened.chosen, '准');
      assert.equal(reopened.confirmCount, 1); assert.equal(reopened.gateSent, true);
      assert.equal(await evaluate('document.querySelectorAll("#confirm,[data-choice]").length'), 0);
      await evaluate('action("confirm")');
      assert.equal((await snapshot()).confirmCount, 1, 'Direct duplicate Confirm is also refused');
    }
    pass(`${width}: sent, relayed and recorded gate entries keep the decision on reopen and refuse duplicate Confirm`);
    for (const word of ['要求修改', '暫緩']) {
      await state('gate-briefing'); await click(`[data-choice="${word}"]`);
      assert.equal(await evaluate('document.querySelector("#confirm").disabled'), true);
      await fill('#reason', '   '); assert.equal(await evaluate('document.querySelector("#confirm").disabled'), true);
      await fill('#reason', '請先補齊取消預約的試用步驟。');
      assert.equal(await evaluate('document.querySelector("#confirm").disabled'), false);
      assert.equal((await snapshot()).gateSent, false);
      await click('#confirm'); assert.equal((await snapshot()).gateSent, true);
      await click('.back'); await click(named);
      assert.equal((await snapshot()).chosen, word);
      assert.equal((await snapshot()).reason, '請先補齊取消預約的試用步驟。');
      assert.equal(await evaluate('document.querySelectorAll("#confirm").length'), 0);
    }
    pass(`${width}: revise and hold require nonblank reasons and explicit confirmation`);
    await state('replay-long');
    assert.equal(await evaluate('document.querySelectorAll(".source-block").length'), 3);
    const scroll = await evaluate('(()=>{const x=document.querySelector(".replay-scroll");return {height:x.clientHeight,total:x.scrollHeight}})()');
    assert(scroll.total > scroll.height, 'Long originals require an actual scroll area');
    await evaluate('(()=>{const x=document.querySelector(".replay-scroll");x.scrollTop=x.scrollHeight})()');
    assert(await evaluate('(()=>{const x=document.querySelector(".replay-scroll");return Math.abs(x.scrollHeight-x.clientHeight-x.scrollTop)<1})()'));
    for (const action of ['open-fo', 'discuss', 'new-decision']) {
      assert(await evaluate(`(()=>{const r=document.querySelector('[data-action=${action}]').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()`));
    }
    await click('[data-action=open-fo]');
    assert.equal((await snapshot()).view, 'commander', 'Several FOs require a named choice');
    await click('[data-fo-source="1"]');
    assert.equal((await snapshot()).foTarget.fo, '預約 FO');
    assert.equal((await snapshot()).view, 'fo'); await click('.back');
    for (const action of ['discuss', 'new-decision']) {
      await state('replay-long-end'); await click(`[data-action=${action}]`);
      assert.equal((await snapshot()).context, 2); assert.equal((await snapshot()).sent.length, 0);
      assert.equal(await evaluate('document.activeElement.id'), 'message');
    }
    pass(`${width}: three long exact sources scroll to their true bottom while all exits remain reachable; FO target is explicit`);
    console.log(`Captured and exercised ${width}x${height}: ${states.length} states.`);
  });
}
if (before) {
  await writeFile(join(root, 'checks/cycle-4-before.json'), JSON.stringify({ findings: beforeFindings, sessions }, null, 2) + '\n');
  console.log('Recorded the two cycle 3 state failures in both viewport sizes; browsers closed.');
} else {
await freshBrowser(async ({ cdp, evaluate, go, click, resize, screenshot, waitFor }) => {
  await resize(1440, 1000);
  await go(pathToFileURL(join(root, 'review.html')).href, '!!window.review');
  const imagesFor = async id => {
    await waitFor(`review.current===${JSON.stringify(id)} && [...document.images].every(x=>x.complete&&x.naturalWidth>0)`);
    const images = await evaluate('[...document.images].map(x=>({src:x.getAttribute("src"),naturalWidth:x.naturalWidth,naturalHeight:x.naturalHeight}))');
    assert.equal(images[0].naturalWidth, 1440); assert.equal(images[0].naturalHeight, 1000);
    assert.equal(images[1].naturalWidth, 360); assert.equal(images[1].naturalHeight, 780);
    reviewImages.push({ state: id, images });
  };
  await imagesFor('digest');
  await click(`[data-index="${states.findIndex(state => state.id === 'replay-long-end')}"]`);
  await imagesFor('replay-long-end');
  await click('[data-index="0"]');
  await imagesFor('digest');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".layout")).gridTemplateColumns.split(" ").length'), 2);
  await click('[data-size=phone]'); assert.equal(await evaluate('review.size'), 'phone');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  await imagesFor('replay');
  await click('[data-size=desktop]'); assert.equal(await evaluate('review.size'), 'desktop');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 });
  await imagesFor('digest');
  await click('[data-size=both]'); assert.equal(await evaluate('review.size'), 'both');
  await screenshot('review-entry.png');
  pass('Fresh file:// review: two columns, positive natural image sizes for digest and replay, size toggles and both arrow keys');
});
const version = execFileSync(chrome, ['--version'], { encoding: 'utf8' }).trim();
await writeFile(join(root, 'checks/capture-evidence.json'), JSON.stringify({
  mockSha256: sha(source), reviewSha256: sha(reviewSource), browser: version,
  executable: chrome, sequential: true, noLocalhostService: true, noPaseoDaemon: true,
  captures, sessions, reviewImages, limits: ['Offline prototype only', 'No native host, physical phone, live source or delivery proof'],
}, null, 2) + '\n');
await writeFile(join(root, 'checks/tests.json'), JSON.stringify(tests, null, 2) + '\n');
console.log(`PASS: ${captures.length} state PNGs; ${tests.length} offline checks; review images loaded via file://; all three fresh browsers stopped.`);
}
} catch (error) {
  tests.push({ name: 'Capture and offline verification', status: 'failed', message: error.stack });
  await writeFile(join(root, 'checks/tests.json'), JSON.stringify(tests, null, 2) + '\n');
  await writeFile(join(root, 'checks/capture-failure.json'), JSON.stringify({ message: error.message, captures, sessions }, null, 2) + '\n');
  throw error;
}
