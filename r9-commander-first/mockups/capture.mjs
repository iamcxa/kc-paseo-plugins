import { spawn, execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = dirname(fileURLToPath(import.meta.url));
const chrome = process.argv[2] || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const cycleOne=execFileSync('git',['-C',join(root,'../..'),'show','73250c176526eedc534afb512e7b46bd5e2b0b97:r9-commander-first/mockups/index.html'],{encoding:'utf8'});
const baselineFile=join(root,'.cycle-1-baseline.html');
await writeFile(baselineFile,cycleOne,{flag:'wx'});
const source = await readFile(join(root, 'index.html'), 'utf8');
const review = await readFile(join(root, 'review.html'), 'utf8');
const states = JSON.parse(source.match(/<script id="scenarios" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const reviewStates = JSON.parse(review.match(/<script id="review-scenarios" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(states, reviewStates, 'Review entry and prototype must cover the same states');
for (const text of [source, review]) {
  assert(!/(?:src|href)=["']https?:/i.test(text), 'No remote resources or destinations');
  assert(!/localStorage|sessionStorage|fetch\(|XMLHttpRequest|WebSocket\(/.test(text), 'No storage or network APIs');
}
const results = [], tests = [], cleanup = [], baseline = [];
const pass = name => tests.push({ name, status: 'passed' });
const hash = text => createHash('sha256').update(text).digest('hex');

try {
for (const [width, height] of [[1440, 1000], [360, 780]]) {
  const profile = await mkdtemp(join(tmpdir(), 'r9-commander-' ));
  const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND', '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
  let seq = 0, buffer = '', errors = '';
  const pending = new Map(), runtimeErrors = [], requests = [];
  browser.stderr.on('data', chunk => { errors += chunk.toString(); });
  browser.stdio[4].on('data', chunk => {
    buffer += chunk.toString();
    let end;
    while ((end = buffer.indexOf('\0')) !== -1) {
      const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
      if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
      if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
      const waiter = pending.get(message.id);
      if (waiter) { clearTimeout(waiter.timeout); pending.delete(message.id); message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result); }
    }
  });
  function call(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++seq;
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout ${method}: ${errors.slice(-800)}`)); }, 15000);
      pending.set(id, { resolve, reject, timeout });
      browser.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
    });
  }
  try {
    const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
    const cdp = (method, params) => call(method, params, sessionId);
    const evaluate = async expression => {
      const value = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (value.exceptionDetails) throw new Error(JSON.stringify(value.exceptionDetails));
      return value.result.value;
    };
    await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
    const resize = (w, h) => cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 760 });
    await resize(width, height);
    async function waitFor(expression) {
      for (let attempt = 0; attempt < 150; attempt++) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      throw new Error('Condition did not become true: ' + expression);
    }
    const file = pathToFileURL(join(root, 'index.html')).href;
    const go = async state => {
      await cdp('Page.navigate', { url: file + '?state=' + state });
      await waitFor(`document.readyState === 'complete' && !!window.mock`);
      await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    };
    const click = selector => evaluate(`(() => {const x=document.querySelector(${JSON.stringify(selector)});if(!x)throw Error('Missing target '+${JSON.stringify(selector)});x.scrollIntoView({block:'nearest'});if(!x.getBoundingClientRect().height)throw Error('Hidden target '+${JSON.stringify(selector)});x.click();})()`);
    const fill = (selector, value) => evaluate(`(() => {const input=document.querySelector(${JSON.stringify(selector)});input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    const snap = () => evaluate('mock.snapshot()');
    const openFrom = async id => {
      if (width < 760 && (await snap()).view !== 'list') await click('.back');
      await click(`[data-open="${id}"]`);
    };
    const previousFile=pathToFileURL(join(root,'../../r8-list-and-wide-detail/mockups/index.html')).href;
    await cdp('Page.navigate',{url:previousFile});
    await waitFor(`document.readyState==='complete'&&!!window.mock`);
    assert.equal((await snap()).view,'list');
    assert.equal(await evaluate(`document.querySelectorAll('.commander-home,.commander-pinned').length`),0);
    let returnClicks=1;
    if(width===360){await click('[data-open=gate]');await click('.back');await click('.item[data-open=comms]');assert.equal((await snap()).view,'comms');returnClicks=2;}
    baseline.push({viewport:`${width}x${height}`,source:previousFile,defaultView:'list',commanderPinned:false,returnToCommsClicks:returnClicks,goal:'fails commander-default/top; phone return takes two clicks'});
    await cdp('Page.navigate',{url:pathToFileURL(baselineFile).href+'?state=board'});
    await waitFor(`document.readyState==='complete'&&!!window.mock`);
    const previousGeometry=await evaluate(`({queueScroll:document.querySelector('.queue-scroll').clientHeight,pinned:document.querySelector('.commander-pinned').getBoundingClientRect().height})`);
    await click('[data-by=fo]');
    assert.equal(await evaluate(`document.querySelectorAll('[data-open=fo-research]').length`),0);
    await go('board');
    const currentGeometry=await evaluate(`({queueScroll:document.querySelector('.queue-scroll').clientHeight,pinned:document.querySelector('.commander-pinned').getBoundingClientRect().height})`);
    baseline.push({cycle:1,viewport:`${width}x${height}`,sourceSha256:hash(cycleOne),before:previousGeometry,after:currentGeometry,regainedListHeight:currentGeometry.queueScroll-previousGeometry.queueScroll,noWaitingFoReachableBefore:false});
    if(width===360){assert(previousGeometry.pinned>90);assert.equal(currentGeometry.pinned,0);assert(Math.abs(currentGeometry.queueScroll-previousGeometry.queueScroll-previousGeometry.pinned)<1);}
    for (const state of states) {
      await go(state.id);
      if(width===360&&state.id==='progress-board') await evaluate(`document.querySelector('.item[data-open=gate2]').scrollIntoView({block:'center'})`);
      if(state.id.startsWith('source-')) await evaluate(`(() => {const list=document.querySelector('.queue');if(list?.offsetHeight)document.querySelector('.item[data-open=comms]')?.scrollIntoView({block:'center'});})()`);
      const geometry = await evaluate(`(() => {const rect=s=>{const x=document.querySelector(s);return x?.offsetHeight?x.getBoundingClientRect().toJSON():null;};return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,queue:rect('.queue'),detail:rect('.detail'),dock:rect('.dock'),controls:[...document.querySelectorAll('.control')].filter(x=>x.getClientRects().length).map(x=>({label:x.textContent.trim(),...x.getBoundingClientRect().toJSON()})),rows:[...document.querySelectorAll('.item')].map(x=>({id:x.dataset.open,statuses:x.querySelectorAll('.status').length,phase:x.querySelector('.status')?.dataset.state,icon:x.querySelector('.status-icon')?.textContent,text:x.querySelector('.status-text')?.textContent})),confirmDisabled:document.querySelector('#confirm')?.disabled,reason:document.querySelector('#reason')?.value}})()`);
      assert.equal(geometry.width, width); assert.equal(geometry.height, height);
      assert.equal(geometry.documentWidth, width, state.id + ': horizontal overflow');
      assert.equal(geometry.documentHeight, height, state.id + ': document overflow');
      geometry.rows.forEach(row => {assert.equal(row.statuses, 1, 'One main status per item');assert.equal(row.icon,({your:'◆',waiting:'◷',done:'✓',error:'!'})[row.phase]);assert(row.text.length>3);});
      if (width === 1440 && geometry.queue) assert(geometry.detail.width > 2 * geometry.queue.width, 'Detail must be materially wider than list');
      if (geometry.dock) assert(Math.abs(geometry.dock.bottom - height) <= 1, state.id + ': actions stay at viewport bottom');
      geometry.controls.forEach(control => {
        assert.equal(control.height, width === 1440 ? 32 : 44, control.label + ': platform proportion');
        assert(control.width >= (width === 1440 ? 32 : 44));
        assert(control.bottom <= height + 1 && control.top >= 0 && control.right <= width + 1, control.label + ': control must fit');
      });
      if (state.id === 'reason-empty') assert.equal(geometry.confirmDisabled, true);
      if (state.id === 'reason-typed') { assert.equal(geometry.confirmDisabled, false); assert.equal(geometry.reason, 'Please add the missing rollback check.'); }
      if (state.id === 'review-ask') assert(await evaluate(`document.querySelector('#message').scrollHeight <= document.querySelector('#message').clientHeight`), 'Prefill readable without field scrolling');
      if (state.id === 'permission') { assert(await evaluate(`!!document.querySelector('.native') && !document.querySelector('.workspace')`)); assert.equal(await evaluate(`document.querySelectorAll('[data-choice],#confirm').length`), 0); }
      if (['recorded','recorded-reopened'].includes(state.id)) assert(await evaluate(`document.querySelector('.result-box').getBoundingClientRect().top < document.querySelector('.briefing h1').getBoundingClientRect().top`), 'Recorded result before question');
      const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(join(root, `${width}-${state.id}.png`), Buffer.from(data, 'base64'));
      results.push({ viewport: `${width}x${height}`, state: state.id, ...geometry });
    }
    pass(`${width}: all ${states.length} fixtures render; geometry, one status, platform controls, bottom dock, source and native destination checks`);


    await go('home');
    assert.equal((await snap()).view,'comms');
    assert.equal(await evaluate(`document.querySelector('.commander-pinned').nextElementSibling.className`),'queue-head');
    assert.equal(await evaluate(`document.querySelector('.commander-pinned .commander-title').textContent.trim().replace(/\\s+/g,' ')`),'◉ Commander');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.filter b')].map(x=>x.textContent)`),['6','1','2','2','1']);
    assert.equal(await evaluate(`document.querySelectorAll('.item[data-open=comms]').length`),0);
    assert.equal(await evaluate(`!!document.querySelector('.detail').offsetHeight`),true);
    assert.equal(await evaluate(`!!document.querySelector('.queue').offsetHeight`),width===1440);
    await fill('#message','Direction draft stays here.');
    await click('.back');
    assert.equal((await snap()).view,'list');
    assert(await evaluate(`document.querySelector('.queue').offsetHeight>0`));
    await click('.commander-home');
    assert.equal((await snap()).view,'comms');
    assert.equal(await evaluate('document.querySelector("#message").value'),'Direction draft stays here.');
    pass(`${width}: actual home defaults to Commander; pinned card precedes Board; mobile opens Board in one click; one click back keeps draft; no-ask counts 6/1/2/2/1`);

    await go('commander-question');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.filter b')].map(x=>x.textContent)`),['7','1','2','2','2']);
    assert.equal(await evaluate(`document.querySelectorAll('.item[data-open=comms]').length`),1);
    assert.equal(await evaluate(`document.querySelectorAll('.commander-card .status').length`),1);
    assert.equal(await evaluate(`document.querySelector('.briefing h1').textContent`),'Which review window should we use?');
    await click('.back');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.kind-group')].map(x=>x.dataset.group)`),['permission','review','gate','ask']);
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.kind-group .group-count')].map(x=>x.textContent)`),['1','2','2','2']);
    await click('[data-filter=ask]');
    assert.equal(await evaluate(`document.querySelectorAll('.item').length`),2);
    assert.equal(await evaluate(`document.querySelector('.filter[data-filter=ask] b').textContent`),'2');
    assert.equal(await evaluate(`document.querySelector('.countline').textContent`),'2 question items shown');
    assert(await evaluate(`document.querySelector('${width===360?'.commander-home':'.commander-card'}').getBoundingClientRect().height>0`));
    await click('[data-filter=gate]');
    assert.equal(await evaluate('document.querySelectorAll(".item").length'),2);
    assert.equal(await evaluate(`document.querySelector('.filter[data-filter=all] b').textContent`),'7');
    assert(await evaluate(`document.querySelector('${width===360?'.commander-home':'.commander-card'}').getBoundingClientRect().height>0`));
    await click('[data-filter=all]');
    pass(`${width}: commander ask counted once at top; four kind groups stay; Questions 2 means commander ask + one FO row (phone in group, desktop pinned); Gate filter shows 2 and keeps top return`);

    await go('home');let rosterClicks=0;
    if(width===360){await click('.back');rosterClicks++;}
    await click('[data-by=fo]');rosterClicks++;
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.fo-row')].map(x=>x.dataset.open)`),['fo-demo','fo-export','fo-review','fo-research']);
    assert(await evaluate(`document.querySelector('.fo-row[data-open=fo-research]').textContent.includes('0 waiting items')`));
    assert.equal(await evaluate(`document.querySelectorAll('.filter').length`),0);
    await click('[data-open=fo-research]');rosterClicks++;
    assert.equal(rosterClicks,width===360?3:2);
    assert.equal((await snap()).view,'fo-research');
    assert.equal(await evaluate(`document.querySelector('.message-head').textContent.trim()`),'Message to Research FO');
    assert.equal(await evaluate(`document.querySelectorAll('[data-choice],#confirm').length`),0);
    await fill('#message','Tell me more about the two approaches.');await click('#send');
    assert.deepEqual((await snap()).messages['fo-research'],['Tell me more about the two approaches.']);
    assert.equal((await snap()).messages.comms,undefined);
    await fill('#message','Keep a follow-up draft.');await click('.commander-home');
    await openFrom('fo-research');
    assert.equal(await evaluate(`document.querySelector('#message').value`),'Keep a follow-up draft.');
    await click('.commander-home');
    assert.equal((await snap()).view,'comms');
    pass(`${width}: all four FOs reachable regardless of pending items; no-waiting Research FO opens in ${rosterClicks} clicks, has correct conversation/send target and preserved draft, one-click Commander return`);
    await go('home');
    assert(await evaluate(`document.querySelector('.example-label').textContent.includes('Example')`));
    assert(await evaluate(`document.querySelector('.example-thread').textContent.includes('Captain')&&document.querySelector('.example-thread').textContent.includes('Demo FO says:')`));
    if(width===360){
      await click('.back');assert.equal(await evaluate(`document.querySelector('.commander-pinned').getBoundingClientRect().height`),0);
      await click('.commander-home');assert.equal(await evaluate(`document.querySelector('.home-intro').getBoundingClientRect().height`),0);
      assert.equal(await evaluate(`document.querySelector('.commander-navowner').getBoundingClientRect().height`),0);
    }
    pass(`${width}: marked fictional Captain-direction / named FO-relay example; phone has no repeated entry card or home introduction; measured list height saved against cycle 1`);
    for(const id of ['gate','gate2','fo','assigned','review','permission']){
      await go('board');await click(`[data-open="${id}"]`);
      assert.equal((await snap()).view,id);
      assert(await evaluate(`document.querySelector('.commander-home').getBoundingClientRect().top>=0`));
      if(id==='permission')assert.equal(await evaluate(`document.querySelectorAll('[data-choice],#confirm').length`),0);
      await click('.commander-home');
      assert.equal((await snap()).view,'comms');
    }
    pass(`${width}: each local drilldown has visible one-click Commander return; native permission is an offline destination, has no local decision widget`);

    await go('board');await click('[data-open=review]');
    assert.equal(await evaluate('document.querySelector("#message").value'),await evaluate('mock.reviewAsk'));
    await click('#send');assert.equal((await snap()).messages.comms.length,1);
    assert.equal((await snap()).gates.gate.stage,'open');
    await click('.commander-home');await fill('#message','Keep existing commander draft.');
    await openFrom('review');assert.equal(await evaluate('document.querySelector("#message").value'),'Keep existing commander draft.');
    pass(`${width}: unassigned review still opens prefilled inquiry then Send; shares commander draft without overwriting existing text or deciding gate`);

    for(const choice of ['Approve','Request changes','Hold']){
      await go('home');await fill('#message',`Commander draft for ${choice}`);
      await openFrom('gate');await fill('#message',`FO draft for ${choice}`);
      await click(`[data-choice="${choice}"]`);
      assert.equal(await evaluate('document.querySelector("#confirm").disabled'),choice!=='Approve');
      const reason=choice==='Approve'?'':`Reason for ${choice}`;
      if(reason)await fill('#reason',reason);
      await click('.commander-home');
      assert.equal(await evaluate('document.querySelector("#message").value'),`Commander draft for ${choice}`);
      await openFrom('gate');
      assert.equal((await snap()).gates.gate.choice,choice);
      assert.equal((await snap()).gates.gate.reason,reason);
      assert.equal(await evaluate('document.querySelector("#message").value'),`FO draft for ${choice}`);
      await click('#confirm');
      assert.equal((await snap()).gates.gate.stage,'sent');
      assert.equal((await snap()).messages.gate,undefined);
      for(const stage of ['sent','relayed']){
        if(stage==='relayed')await evaluate('mock.receive("relayed")');
        await click('.commander-home');await click('#send');
        await openFrom('gate');
        assert.equal((await snap()).gates.gate.stage,stage);
        assert.deepEqual((await snap()).gates.gate.confirmed,{choice,reason});
        assert.equal(await evaluate('document.querySelector("#message").value'),`FO draft for ${choice}`);
        assert.equal(await evaluate('document.querySelectorAll("[data-choice],#confirm").length'),0);
        assert(await evaluate(`!!document.querySelector('.item[data-open=gate]')`));
      }
      await evaluate('mock.receive("recorded")');
      assert(!await evaluate(`!!document.querySelector('.item[data-open=gate]')`));
      assert.equal(await evaluate('document.querySelector(".filter b").textContent'),'5');
      await click('.commander-home');await evaluate('history.back()');await waitFor('mock.snapshot().view==="gate"');
      assert.equal((await snap()).gates.gate.stage,'recorded');
      assert.deepEqual((await snap()).gates.gate.confirmed,{choice,reason});
      assert.equal(await evaluate('document.querySelector(".result-decision").textContent'),choice);
      assert(await evaluate(`document.querySelector('.result-box').getBoundingClientRect().top<document.querySelector('.briefing h1').getBoundingClientRect().top`));
    }
    pass(`${width}: all three choices and exact reasons survive Commander round trips before Confirm, sent, relayed, and recorded reopen; drafts isolated, sent rows stay, recorded row leaves; no extra send or history`);

    await go('progress-board');
    assert.equal(await evaluate(`document.querySelector('.item[data-open=gate2] .status').dataset.state`),'waiting');
    assert.equal(await evaluate(`document.querySelector('.item[data-open=gate2] .status-icon').textContent`),'◷');
    assert.equal(await evaluate(`document.querySelector('.item[data-open=gate] .status').dataset.state`),'your');
    await click('[data-open=gate2]');
    assert(await evaluate(`document.querySelector('.result-box').textContent.includes('Relayed to Export FO')`));
    assert(!await evaluate(`document.querySelector('.result-box').textContent.includes('Demo FO')`));
    await click('.commander-home');await openFrom('gate2');
    assert.equal((await snap()).gates.gate2.stage,'relayed');
    await evaluate('mock.receive("recorded","gate2")');
    assert(await evaluate(`document.querySelector('.result-state').textContent.includes('recorded by Export FO')`));
    assert.equal((await snap()).gates.gate.stage,'open');
    pass(`${width}: checking existing progress preserves waiting/your-turn icons and Export FO receipt ownership; no aggregate progress data`);

    await go('commander-question');await evaluate('mock.setSource("failed")');
    assert.equal(await evaluate(`document.querySelector('.commander-card .status').dataset.state`),'error');
    assert.equal(await evaluate(`document.querySelectorAll('.conversation-error').length`),1);
    await openFrom('fo');
    assert.equal(await evaluate(`document.querySelectorAll('.conversation-error,.conversation-loading').length`),0);
    assert.equal(await evaluate(`document.querySelector('.item[data-open=fo] .status').dataset.state`),'your');
    await click('.commander-home');await evaluate('mock.setSource("loading")');
    assert.equal(await evaluate(`document.querySelector('.commander-card .status').dataset.state`),'waiting');
    await openFrom('fo');assert.equal(await evaluate(`document.querySelectorAll('.conversation-error,.conversation-loading').length`),0);
    pass(`${width}: commander failure/loading stays scoped to its source, card and conversation; unrelated FO stays normal`);

    if(width===360){
      await go('board');await evaluate('document.querySelector(".queue-scroll").scrollTop=100');
      const scroll=await evaluate('document.querySelector(".queue-scroll").scrollTop');
      await click('[data-open=gate]');await click('.back');
      assert.equal(await evaluate('document.querySelector(".queue-scroll").scrollTop'),scroll);
      await click('[data-open=gate]');await click('[data-choice=Hold]');await fill('#reason','Keep the check.');
      await resize(360,480);
      assert(await evaluate(`document.querySelector('.dock').getBoundingClientRect().bottom<=innerHeight+1&&document.querySelector('#confirm').getBoundingClientRect().bottom<=innerHeight&&document.querySelector('#send').getBoundingClientRect().bottom<=innerHeight`));
      await resize(width,height);
      pass('360: Board return preserves scroll; Confirm and Send fit 360x480 simulation; physical keyboard remains unverified');
    }
    assert.deepEqual(runtimeErrors, [], 'No runtime exceptions');
    assert(requests.every(url => url.startsWith('file:') || url.startsWith('data:')), 'Only local file requests');
    results.push({ viewport: `${width}x${height}`, fileRequestsOnly: true, runtimeErrors: 0 });
  } finally {
    await call('Browser.close').catch(() => browser.kill());
    if (browser.exitCode === null && browser.signalCode === null) await new Promise((resolve, reject) => {
      const soft = setTimeout(() => browser.kill('SIGTERM'), 3000);
      const hard = setTimeout(() => browser.kill('SIGKILL'), 6000);
      const limit = setTimeout(() => reject(new Error('Capture browser did not exit')), 10000);
      browser.once('exit', () => { clearTimeout(soft); clearTimeout(hard); clearTimeout(limit); resolve(); });
    });
    assert(browser.exitCode !== null || browser.signalCode !== null, 'Browser exit must be observed before removing profile');
    for (const waiter of pending.values()) clearTimeout(waiter.timeout);
    await rm(profile, { recursive: true, force: true });
    cleanup.push({ viewport: `${width}x${height}`, browserPid: browser.pid, browserStopped: browser.exitCode !== null || browser.signalCode !== null, freshProfileRemoved: true });
  }
}
} finally { await rm(baselineFile); }
await writeFile(join(root, 'capture-evidence.json'), JSON.stringify({ htmlSha256: hash(source), reviewSha256: hash(review), browser: chrome, node: process.version, screenshotCount: results.filter(x=>x.state).length, reviewScreenshot: 'review-entry.png (separate file check)', network: 'Local file URLs only; CDP pipe; no localhost, server or daemon; sequential capture; fresh temporary profile per viewport', tests, baseline, cleanup, results }, null, 2) + '\n');
console.log(`PASS: ${results.filter(x=>x.state).length} state PNGs, ${tests.length} checks; browsers stopped and profiles removed`);
