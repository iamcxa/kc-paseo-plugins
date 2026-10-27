import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const chrome = process.argv[2] || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const states = ['list', 'open', 'reason-empty', 'reason-typed', 'sent', 'relayed', 'recorded', 'back-list', 'comms'];
const results = [];
const source = await readFile(join(root, 'index.html'), 'utf8');
assert(!/https?:\/\//.test(source), 'The mockup must have no remote URLs');

for (const [width, height] of [[1440, 1000], [360, 780]]) {
  const profile = await mkdtemp(join(tmpdir(), 'bridge-r8-capture-'));
  const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
  let browserErrors = '';
  browser.stderr.on('data', chunk => { browserErrors += chunk.toString(); });
  let sequence = 0;
  let buffer = '';
  const pending = new Map();
  browser.stdio[4].on('data', chunk => {
    buffer += chunk.toString();
    let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
      const message = JSON.parse(buffer.slice(0, end));
      buffer = buffer.slice(end + 1);
      if (!message.id) continue;
      const request = pending.get(message.id);
      if (!request) continue;
      pending.delete(message.id);
      clearTimeout(request.timeout);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    }
  });
  function call(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}; ${browserErrors.slice(-1200)}`)); }, 15000);
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
    await cdp('Page.enable');
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 });
    async function waitState(state) {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(`document.readyState === 'complete' && typeof state !== 'undefined' && state === ${JSON.stringify(state)}`)) return;
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      throw new Error(`State did not load: ${state}`);
    }
    const go = async state => {
      await cdp('Page.navigate', { url: pathToFileURL(join(root, 'index.html')).href + '?state=' + state });
      await waitState(state);
    };
    for (const state of states) {
      await go(state);
      const geometry = await evaluate(`({ width: innerWidth, height: innerHeight, pageWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight, bridge: document.querySelector('.bridge').getBoundingClientRect().toJSON(), buttons: [...document.querySelectorAll('.control')].map(b=>({label:b.textContent.trim(),width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height,bottom:b.getBoundingClientRect().bottom})), confirmDisabled: document.querySelector('#confirm')?.disabled, reason: document.querySelector('#reason')?.value })`);
      assert.equal(geometry.width, width);
      assert.equal(geometry.height, height);
      assert.equal(geometry.pageWidth, width, 'No horizontal overflow');
      assert.equal(geometry.pageHeight, height, 'No document overflow hiding controls');
      assert.equal(geometry.bridge.width, width === 1440 ? 1120 : 360);
      for (const button of geometry.buttons) {
        if (width === 1440) assert.equal(button.height, 32, 'Desktop decisions and Send must share a 32px height');
        else assert(button.height >= 44);
        assert(button.width >= (width === 360 ? 44 : 32));
        assert(button.bottom <= height, `${button.label} must fit in the viewport`);
      }
      if (state === 'reason-empty') assert.equal(geometry.confirmDisabled, true);
      if (state === 'reason-typed') {
        assert.equal(geometry.confirmDisabled, false);
        assert.equal(geometry.reason, 'Please add the missing rollback check.');
      }
      const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(join(root, `${width}-${state}.png`), Buffer.from(data, 'base64'));
      results.push({ viewport: `${width}x${height}`, state, ...geometry });
    }
    await go('list');
    await evaluate(`document.querySelector('a[href="?state=open"]').click()`);
    await waitState('open');
    assert.equal(await evaluate(`document.querySelectorAll('.conversation').length`), 1);
    await evaluate(`document.querySelector('details').open=true`);
    assert(await evaluate(`document.querySelector('.full').getBoundingClientRect().height > 0`));
    await evaluate(`document.querySelector('details').open=false; const m=document.querySelector('#message');m.value='Is the rollback check included?';m.dispatchEvent(new Event('input'));document.querySelector('[data-choice="要求修改"]').click()`);
    assert.equal(await evaluate(`document.querySelector('#message').value`), 'Is the rollback check included?');
    assert.equal(await evaluate(`document.querySelector('#send').disabled`), false);
    assert.equal(await evaluate(`document.querySelector('#confirm').disabled`), true);
    await evaluate(`const r=document.querySelector('#reason');r.value='Please add the missing rollback check.';r.dispatchEvent(new Event('input'));document.querySelector('#cancel').click();document.querySelector('[data-choice="要求修改"]').click()`);
    assert.equal(await evaluate(`document.querySelector('#reason').value`), 'Please add the missing rollback check.');
    assert.equal(await evaluate(`document.querySelector('#message').value`), 'Is the rollback check included?');
    assert.equal(await evaluate(`document.querySelector('#send').disabled`), false);
    await evaluate(`document.querySelector('#confirm').click()`);
    await waitState('sent');
    assert(await evaluate(`document.querySelector('.result').textContent.includes('Sent to comms officer')`));
    assert.equal(await evaluate(`document.querySelectorAll('[data-choice]').length`), 0);
    await evaluate(`document.querySelector('.back').click()`);
    await waitState('back-list');
    assert.equal(await evaluate(`document.querySelectorAll('a[href="?state=open"]').length`), 0);
    await evaluate(`document.querySelector('a[href="?state=comms"]').click()`);
    await waitState('comms');
    assert(await evaluate(`document.querySelector('.scope').textContent.includes('Conversation with Comms officer')`));
    await evaluate(`const m=document.querySelector('#message');m.value='Use the morning review window.';m.dispatchEvent(new Event('input'));document.querySelector('#send').click()`);
    assert.equal(await evaluate(`document.querySelector('.bubble').textContent`), 'Use the morning review window.');
    assert.equal(await evaluate(`document.querySelectorAll('.result').length`), 0);
    await go('open');
    await evaluate(`document.querySelector('[data-choice="准"]').click()`);
    assert.equal(await evaluate(`document.querySelector('#confirm').disabled`), false);
    await evaluate(`document.querySelector('#confirm').click()`);
    assert(await evaluate(`document.querySelector('.result').textContent.includes('准')`));
    await go('open');
    await evaluate(`document.querySelector('[data-choice="暫緩"]').click()`);
    assert.equal(await evaluate(`document.querySelector('#confirm').disabled`), true);
    results.push({ viewport: `${width}x${height}`, interaction: 'PASS: list → open → choose → required reason → cancel/reselect retains separate drafts → confirm → sent → back to queue → comms message; approve optional reason; hold required reason; full briefing expands' });
  } finally {
    await call('Browser.close').catch(() => browser.kill());
    if (browser.exitCode === null && browser.signalCode === null) await new Promise(resolve => { browser.once('exit', resolve); setTimeout(() => { browser.kill(); resolve(); }, 3000); });
    await rm(profile, { recursive: true, force: true });
  }
}
await writeFile(join(root, 'capture-evidence.json'), JSON.stringify({ htmlSha256: createHash('sha256').update(source).digest('hex'), browser: chrome, node: process.version, network: 'file URLs only; CDP pipe, no server; fresh temporary profile per viewport, removed after run', screenshots: results.filter(x=>x.state).length, results }, null, 2) + '\n');
console.log(`PASS: ${results.filter(x=>x.state).length} viewport PNGs, two offline interaction walks, geometry and required-reason checks`);
