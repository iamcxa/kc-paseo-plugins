import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = dirname(fileURLToPath(import.meta.url));
const chrome = process.argv[2] || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const source = await readFile(join(root, 'index.html'), 'utf8');
const review = await readFile(join(root, 'review.html'), 'utf8');
const states = JSON.parse(source.match(/<script id="scenarios" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const reviewStates = JSON.parse(review.match(/<script id="review-scenarios" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(states, reviewStates, 'Review entry and prototype must cover the same states');
for (const text of [source, review]) {
  assert(!/(?:src|href)=["']https?:/i.test(text), 'No remote resources or destinations');
  assert(!/localStorage|sessionStorage|fetch\(|XMLHttpRequest|WebSocket\(/.test(text), 'No storage or network APIs');
}
const results = [], tests = [], cleanup = [];
const pass = name => tests.push({ name, status: 'passed' });
const hash = text => createHash('sha256').update(text).digest('hex');

for (const [width, height] of [[1440, 1000], [360, 780]]) {
  const profile = await mkdtemp(join(tmpdir(), 'r8-list-detail-'));
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
    const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    const fill = (selector, value) => evaluate(`(() => {const input=document.querySelector(${JSON.stringify(selector)});input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    const snap = () => evaluate('mock.snapshot()');
    const openFrom = async id => {
      if (width < 760 && (await snap()).view !== 'list') await click('.back');
      await click(`[data-open="${id}"]`);
    };
    for (const state of states) {
      await go(state.id);
      if(width===360&&['list-sent','list-relayed'].includes(state.id)) await evaluate(`document.querySelector('.item[data-open=gate]').scrollIntoView({block:'center'})`);
      if(state.id.startsWith('source-')) await evaluate(`(() => {const list=document.querySelector('.queue');if(list?.offsetHeight)document.querySelector('.item[data-open=comms]')?.scrollIntoView({block:'center'});})()`);
      const geometry = await evaluate(`(() => {const rect=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,queue:rect('.queue'),detail:rect('.detail'),dock:rect('.dock'),controls:[...document.querySelectorAll('.control')].filter(x=>x.getClientRects().length).map(x=>({label:x.textContent.trim(),...x.getBoundingClientRect().toJSON()})),rows:[...document.querySelectorAll('.item')].map(x=>({id:x.dataset.open,statuses:x.querySelectorAll('.status').length,phase:x.querySelector('.status')?.dataset.state,icon:x.querySelector('.status-icon')?.textContent,text:x.querySelector('.status-text')?.textContent})),confirmDisabled:document.querySelector('#confirm')?.disabled,reason:document.querySelector('#reason')?.value}})()`);
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

    await go('list');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.kind-group')].map(x=>x.dataset.group)`),['permission','review','gate','ask']);
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.kind-group .group-count')].map(x=>x.textContent)`),['1','2','2','2']);
    assert(await evaluate(`[...document.querySelectorAll('.item .status')].every(x=>x.dataset.state==='your' && x.querySelector('.status-icon').textContent==='◆' && x.textContent.includes('Your turn'))`));
    for(const stage of ['list-sent','list-relayed']){await go(stage);assert.equal(await evaluate(`document.querySelector('.item[data-open=gate] .status').dataset.state`),'waiting');assert.equal(await evaluate(`document.querySelector('.item[data-open=gate] .status-icon').textContent`),'◷');assert.equal(await evaluate(`document.querySelector('.item[data-open=gate2] .status').dataset.state`),'your');}
    await go('recorded');assert.equal(await evaluate(`document.querySelector('.result-state .status').dataset.state`),'done');assert.equal(await evaluate(`document.querySelector('.result-state .status-icon').textContent`),'✓');
    await go('closed');assert.equal(await evaluate(`document.querySelector('.result-state .status').dataset.state`),'done');
    pass(`${width}: four kind groups and counts; diamond/text for your turn, clock/text for waiting, check/text in terminal detail; no done-history rows`);
    await go('list');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.filter b')].map(x=>x.textContent)`), ['7','1','2','2','2']);
    await click('[data-filter="gate"]');
    assert.equal(await evaluate('document.querySelectorAll(".item").length'), 2);
    assert.equal(await evaluate('document.querySelector(".filter b").textContent'), '7');
    await click('[data-filter="all"]'); await click('[data-open="permission"]');
    assert.equal((await snap()).view, 'permission');
    assert.equal(await evaluate('document.querySelectorAll(".choice,#confirm").length'), 0);
    pass(`${width}: kind counts 7/1/2/2/2; filter preserves global counts; permission row directly opens native destination without local approval`);

    await go('list'); await click('[data-open="review"]');
    assert.equal(await evaluate('document.querySelector("#message").value'), await evaluate('mock.reviewAsk'));
    await click('#send');
    assert.equal((await snap()).messages.comms.length, 1);
    assert.equal((await snap()).gates.gate.stage, 'open');
    assert.equal(await evaluate('document.querySelector("#send").disabled'), true);
    await openFrom('gate'); await openFrom('comms');
    await fill('#message', 'Keep this existing coordinator draft.');
    await openFrom('review');
    assert.equal(await evaluate('document.querySelector("#message").value'), 'Keep this existing coordinator draft.');
    pass(`${width}: unassigned review opens prefilled coordinator then Send in two clicks; no decision sent; existing coordinator draft not overwritten`);

    for (const choice of ['Approve', 'Request changes', 'Hold']) {
      await go('list'); await click('[data-open="gate"]');
      await fill('#message', `Question kept for ${choice}`);
      await click(`[data-choice="${choice}"]`);
      const reason = choice === 'Approve' ? '' : `Specific reason for ${choice}`;
      assert.equal(await evaluate('document.querySelector("#confirm").disabled'), choice !== 'Approve');
      if (reason) await fill('#reason', reason);
      assert.equal(await evaluate('document.querySelector("#message").value'), `Question kept for ${choice}`);
      await click('#confirm');
      assert.equal((await snap()).gates.gate.stage, 'sent');
      await click('.back'); assert(await evaluate('!!document.querySelector(".item[data-open=gate]")'));
      await click('.item[data-open="gate"]');
      assert.deepEqual((await snap()).gates.gate.confirmed, { choice, reason });
      assert.equal(await evaluate('document.querySelector(".result-decision").textContent'), choice);
      for (const stage of ['sent', 'relayed']) {
        if (stage === 'relayed') await evaluate('mock.receive("relayed")');
        await openFrom('comms'); await fill('#message', `Coordinator note for ${choice}`); await click('#send');
        await openFrom('gate');
        assert.equal((await snap()).gates.gate.stage, stage);
        assert.equal(await evaluate('document.querySelector(".result-decision").textContent'), choice);
        assert.equal(await evaluate('document.querySelector("#message").value'), `Question kept for ${choice}`);
        assert.equal(await evaluate('document.querySelectorAll("[data-choice],#confirm").length'), 0);
      }
      await evaluate('mock.receive("recorded")');
      assert(!await evaluate('!!document.querySelector(".item[data-open=gate]")'), 'Only recorded gate leaves waiting list');
      assert.equal(await evaluate('document.querySelector(".filter b").textContent'), '6');
      await click('.back');
      await evaluate('history.back()'); await waitFor('mock.snapshot().view === "gate"');
      assert.equal((await snap()).gates.gate.stage, 'recorded');
      assert.deepEqual((await snap()).gates.gate.confirmed, { choice, reason });
      assert.equal(await evaluate('document.querySelector(".result-decision").textContent'), choice);
      assert.equal(await evaluate('document.querySelectorAll("details,[data-choice],#confirm").length'), 0);
      assert(await evaluate(`document.querySelector('.result-box').getBoundingClientRect().top < document.querySelector('.briefing h1').getBoundingClientRect().top`));
    }
    pass(`${width}: all three exact choices/reasons survive reopen, coordinator round trips at sent and relayed, receipt to recorded, and browser-back reopen; no reset, resend controls or history page`);

    await go('open'); await click('[data-choice="Hold"]'); await fill('#reason', 'Keep this reason.'); await fill('#message', 'Keep this message.');
    await click('#cancel'); await click('[data-choice="Hold"]');
    assert.equal(await evaluate('document.querySelector("#reason").value'), 'Keep this reason.');
    await openFrom('gate2'); await click('[data-choice="Request changes"]');
    assert.equal(await evaluate('document.querySelector("#reason").value'), '');
    await openFrom('gate');
    assert.equal(await evaluate('document.querySelector("#reason").value'), 'Keep this reason.');
    assert.equal(await evaluate('document.querySelector("#message").value'), 'Keep this message.');
    await click('[data-by="fo"]');
    assert.equal(await evaluate('document.querySelectorAll(".item").length'), 7);
    pass(`${width}: cancel/reselect retains separate reason/message drafts; another gate is isolated; By FO retains all individual items`);

    await go('source-failed-list');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.filter b')].map(x=>x.textContent)`), ['≥7','1','2','2','≥2']);
    await click('[data-retry]');
    assert.equal((await snap()).commsSource, 'loaded');
    await go('source-failed'); assert(await evaluate('!!document.querySelector(".conversation-error")'));
    assert.equal((await snap()).view,'comms');
    assert.equal(await evaluate(`document.querySelector('.item[data-open=comms] .status').dataset.state`),'error');
    assert.equal(await evaluate(`document.querySelector('.item[data-open=fo] .status').dataset.state`),'your');
    assert(!await evaluate('document.body.textContent.includes("No messages yet")'));
    await openFrom('fo');assert.equal(await evaluate('document.querySelectorAll(".conversation-error,.conversation-loading").length'),0);
    assert(await evaluate(`document.querySelector('.transcript').textContent.includes('The preview is ready')`));
    await go('source-loading');assert(await evaluate('!!document.querySelector(".conversation-loading")'));
    assert.equal(await evaluate(`document.querySelector('.item[data-open=comms] .status').dataset.state`),'waiting');
    assert.equal(await evaluate(`document.querySelector('.item[data-open=fo] .status').dataset.state`),'your');
    await openFrom('fo');assert.equal(await evaluate('document.querySelectorAll(".conversation-error,.conversation-loading").length'),0);
    pass(`${width}: failed/loading comms source affects only comms item and conversation; separate FO row and transcript stay healthy; scoped counts and retry`);

    await go('list');await click('[data-open="gate2"]');await click('[data-choice="Hold"]');await fill('#reason','Reason bound to the export owner.');await click('#confirm');
    assert(await evaluate(`document.querySelector('.result-box').textContent.includes('relay to Export FO')`));
    await evaluate('mock.receive("relayed","gate2")');
    assert(await evaluate(`document.querySelector('.result-box').textContent.includes('Relayed to Export FO')`));
    assert(!await evaluate(`document.querySelector('.result-box').textContent.includes('Demo FO')`));
    await evaluate('mock.receive("recorded","gate2")');
    assert(await evaluate(`document.querySelector('.result-state').textContent.includes('recorded by Export FO')`));
    assert(!await evaluate(`document.querySelector('.result-box').textContent.includes('Demo FO')`));
    assert.equal((await snap()).gates.gate.stage,'open');
    pass(`${width}: second gate relay and record target Export FO; first gate remains open and is not the receipt owner`);

    if (width === 360) {
      await go('list'); await evaluate('document.querySelector(".queue-scroll").scrollTop=120');
      const scroll = await evaluate('document.querySelector(".queue-scroll").scrollTop');
      assert(scroll > 0); await click('[data-open="gate"]'); await click('.back');
      assert.equal(await evaluate('document.querySelector(".queue-scroll").scrollTop'), scroll);
      await go('reason-typed'); await resize(360, 480);
      assert(await evaluate(`document.querySelector('.dock').getBoundingClientRect().bottom <= innerHeight+1 && document.querySelector('#confirm').getBoundingClientRect().bottom <= innerHeight && document.querySelector('#send').getBoundingClientRect().bottom <= innerHeight`));
      await resize(width, height);
      pass('360: return keeps list scroll; fixed actions remain reachable in 360x480 viewport (not physical keyboard proof)');
    }
    if (width === 360) {
      await resize(1440, 1000);
      await cdp('Page.navigate', { url: pathToFileURL(join(root, 'review.html')).href });
      await waitFor('document.readyState === "complete" && document.querySelectorAll(".state").length === 23 && [...document.images].every(x=>x.complete && x.naturalWidth>0)');
      assert.equal(await evaluate('document.querySelector("header h1").textContent'), '照這個方向往下做，還是有哪裡要改？');
      const openIndex=states.findIndex(x=>x.id==='open');
      assert.equal(await evaluate('document.getElementById("title").textContent'),states[openIndex].title);
      await click('[data-mode="phone"]'); assert(await evaluate('document.querySelector(".screens").classList.contains("phone")'));
      await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
      await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
      assert.equal(await evaluate('document.getElementById("title").textContent'), states[states.findIndex(x=>x.id==='open')+1].title);
      await click(`.state[data-index="${openIndex}"]`); await click('[data-mode="both"]');
      await waitFor('[...document.images].every(x=>x.complete && x.naturalWidth>0)');
      const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(join(root, 'review-entry.png'), Buffer.from(shot.data, 'base64'));
      pass('Review entry: ${states.length} local image pairs; open gate preselected, two-column navigation, mode toggle and arrow key work offline');
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
await writeFile(join(root, 'capture-evidence.json'), JSON.stringify({ htmlSha256: hash(source), reviewSha256: hash(review), browser: chrome, node: process.version, screenshotCount: results.filter(x=>x.state).length, reviewScreenshot: 'review-entry.png', network: 'Local file URLs only; CDP pipe; no localhost, server or daemon; sequential capture; fresh temporary profile per viewport', tests, cleanup, results }, null, 2) + '\n');
console.log(`PASS: ${results.filter(x=>x.state).length} state PNGs, review entry, ${tests.length} checks; browsers stopped and profiles removed`);
