import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = dirname(fileURLToPath(import.meta.url));
const chrome = process.argv[2] || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const html = await readFile(join(root, 'review.html'), 'utf8');
const profile = await mkdtemp(join(tmpdir(), 'r9-review-file-'));
const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND', '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
let sequence = 0, buffer = '', stderr = '';
const pending = new Map(), requests = [], exceptions = [], observed = [];
browser.stderr.on('data', part => { stderr += part; });
browser.stdio[4].on('data', part => {
  buffer += part;
  let end;
  while ((end = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
    if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
    const waiter = pending.get(message.id);
    if (waiter) { clearTimeout(waiter.timer); pending.delete(message.id); message.error ? waiter.reject(new Error(JSON.stringify(message.error))) : waiter.resolve(message.result); }
  }
});
function call(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout ${method}: ${stderr.slice(-600)}`)); }, 15000);
    pending.set(id, { resolve, reject, timer });
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
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.filePolicyViolations=[];document.addEventListener('securitypolicyviolation',event=>filePolicyViolations.push({directive:event.violatedDirective,blocked:event.blockedURI}));` });
  const url = pathToFileURL(join(root, 'review.html')).href;
  await cdp('Page.navigate', { url });
  async function imagesFor(id) {
    for (let i = 0; i < 160; i++) {
      const result = await evaluate(`(() => {const a=document.getElementById('desktop'),b=document.getElementById('phone');if(!a||!b)return null;return {title:document.getElementById('title').textContent,url:location.href,images:[a,b].map(x=>({src:x.currentSrc,width:x.naturalWidth,height:x.naturalHeight,complete:x.complete}))};})()`);
      if (result?.images.every(x => x.complete && x.width > 0 && x.src.endsWith('-' + id + '.png'))) return result;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    throw new Error('Both local images did not load for ' + id);
  }
  observed.push({ state: 'home', ...(await imagesFor('home')) });
  assert.equal(observed[0].title, '首頁 · 指揮官');
  await evaluate(`document.querySelectorAll('.state')[states.findIndex(x=>x.id==='progress-board')].click()`);
  observed.push({ state: 'progress-board', ...(await imagesFor('progress-board')) });
  assert(await evaluate(`getComputedStyle(document.querySelector('.layout')).gridTemplateColumns.split(' ').length===2`));
  await evaluate(`document.querySelector('[data-mode=phone]').click()`);
  assert(await evaluate(`document.querySelector('.screens').classList.contains('phone')`));
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await imagesFor('progress-detail');
  await evaluate(`document.querySelector('[data-mode=desktop]').click()`);
  assert(await evaluate(`document.querySelector('.screens').classList.contains('desktop')`));
  await evaluate(`document.querySelectorAll('.state')[states.findIndex(x=>x.id==='home')].click()`);
  await evaluate(`document.querySelector('[data-mode=both]').click()`);
  await imagesFor('home');
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(join(root, 'review-entry.png'), Buffer.from(shot.data, 'base64'));
  assert.deepEqual(await evaluate('filePolicyViolations'), [], 'No content-policy violation');
  assert.deepEqual(exceptions, [], 'No script exceptions');
  assert(requests.every(x => x.startsWith('file:') || x.startsWith('data:')), 'No remote requests');
} finally {
  await call('Browser.close').catch(() => browser.kill());
  if (browser.exitCode === null && browser.signalCode === null) await new Promise((resolve, reject) => {
    const soft = setTimeout(() => browser.kill('SIGTERM'), 3000), hard = setTimeout(() => browser.kill('SIGKILL'), 6000), limit = setTimeout(() => reject(new Error('Browser did not exit')), 10000);
    browser.once('exit', () => { clearTimeout(soft); clearTimeout(hard); clearTimeout(limit); resolve(); });
  });
  assert(browser.exitCode !== null || browser.signalCode !== null);
  for (const waiter of pending.values()) clearTimeout(waiter.timer);
  await rm(profile, { recursive: true, force: true });
  await assert.rejects(access(profile));
}
await writeFile(join(root, 'review-file-check.json'), JSON.stringify({ reviewSha256: createHash('sha256').update(html).digest('hex'), url: pathToFileURL(join(root, 'review.html')).href, browser: chrome, freshProfile: true, securityBypassFlags: false, viewport: '1440x1000', observed, pageRequests: requests, twoColumnLayout: true, sizeToggles: true, arrowKeys: true, preselectedState: 'home', contentPolicyViolations: 0, scriptExceptions: 0, screenshot: 'review-entry.png', cleanup: { browserPid: browser.pid, browserStopped: true, profileRemoved: true } }, null, 2) + '\n');
console.log('PASS: file:// review loads both desktop/phone images for home and progress-board; no CSP violations; review-entry.png saved; browser stopped and fresh profile removed.');
