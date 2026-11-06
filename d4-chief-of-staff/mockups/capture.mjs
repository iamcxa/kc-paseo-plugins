import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url));
const chrome=process.argv[2];
if(!chrome)throw Error('Pass the absolute Chromium executable as the first argument');
const states=JSON.parse(await readFile(join(root,'states.json'),'utf8'));
const sessions=[],captures=[],checks=[];
const sha=x=>createHash('sha256').update(x).digest('hex');
const pass=(name,detail)=>checks.push({name,status:'passed',detail});
await mkdir(join(root,'screenshots'),{recursive:true});
await mkdir(join(root,'checks'),{recursive:true});
for(const file of ['index.html','review.html']){
 const s=await readFile(join(root,file),'utf8');
 assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(|localStorage|sessionStorage/.test(s));
 assert(s.includes("img-src 'self' file: data:"));
}
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
    await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Network.setBlockedURLs', { urls: ['http://*', 'https://*', 'ws://*', 'wss://*'] });
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

let focusText;
for(const [width,height] of [[1440,1000],[360,780]]){
 for(const state of states){
  await freshBrowser(async({evaluate,go,resize,screenshot})=>{
   await resize(width,height);
   await go(pathToFileURL(join(root,'index.html')).href+'?state='+state.id,'!!window.mock');
   const geometry=await evaluate(`(()=>{const main=document.querySelector('.main');const visible=x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0};return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,navWidth:document.querySelector('.appnav').getBoundingClientRect().width,boardVisible:visible(document.querySelector('.board')),times:[...document.querySelectorAll('[data-time]')].map(x=>x.dataset.time),kinds:[...document.querySelectorAll('[data-kind]')].map(x=>x.dataset.kind),actions:[...document.querySelectorAll('.targetlink,.send,.back,.phoneback,.choice,.confirm')].filter(visible).map(x=>{const r=x.getBoundingClientRect();return {text:x.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,disabled:x.disabled}}),focusText:document.querySelector('[data-focus]')?.innerText,focusCount:document.querySelectorAll('[data-focus]').length,chatText:document.querySelector('.chatwidth')?.innerText}})()`);
   assert.equal(geometry.width,width);assert.equal(geometry.height,height);
   assert(geometry.documentWidth<=width, state.id+' no outer horizontal overflow');
   assert(geometry.documentHeight<=height,state.id+' no outer vertical overflow');
   assert.equal(geometry.navWidth,width===1440?320:0);
   assert.deepEqual(geometry.times,[...geometry.times].sort().reverse(),'one newest-first order');
   if(state.id!=='empty')assert(geometry.kinds.filter(x=>x==='狀態').length===2,'FO status rows retained');
   for(const a of geometry.actions){assert(a.height>=44,'44px action height');assert(a.x>=0&&a.x+a.width<=width+1,'action fits horizontally');assert(a.y>=0&&a.bottom<=height+1,'fixed action fits vertically')}
   if(state.id==='entry')focusText=geometry.focusText;
   if(state.id==='unchanged'){assert.equal(geometry.focusText,focusText);assert.equal(geometry.focusCount,1);assert(geometry.chatText.includes('14:35 已檢查'));}
   if(['failed','stale'].includes(state.id))assert(await evaluate('document.querySelector(".targetlink").disabled'));
   if(state.id==='target')assert(await evaluate('document.querySelector(".confirm").disabled'));
   if(state.id==='returned')assert.equal(await evaluate('document.querySelector("#message").value'),'我先看這個關卡。');
   if(state.id==='board')assert(geometry.boardVisible);
   const file='screenshots/'+width+'-'+state.id+'.png';await screenshot(file);
   const png=await readFile(join(root,file));assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);
   captures.push({state:state.id,viewport:`${width}x${height}`,file,sha256:sha(png),geometry});
  });
  process.stdout.write(`Captured ${width} ${state.id}\n`);
 }
 pass(`${width}: ${states.length} states`, 'PNG dimensions, viewport bounds, one ordered Board, visible actions, and unchanged example text checked; no product runtime or model was exercised.');
 await freshBrowser(async({evaluate,go,resize,click,fill})=>{
  await resize(width,height);await go(pathToFileURL(join(root,'index.html')).href,'!!window.mock');
  await fill('#message','這是留在幕僚長的虛構草稿。');await click('[data-act="target"]');
  assert.equal((await evaluate('mock.snapshot()')).view,'target');
  assert(await evaluate('document.querySelector(".confirm").disabled'));
  await click('[data-choice="修改"]');assert(await evaluate('document.querySelector(".confirm").disabled'));
  await fill('#reason','先補齊範例限制。');assert.equal(await evaluate('document.querySelector(".confirm").disabled'),false);
  await click('.back');assert.equal(await evaluate('document.querySelector("#message").value'),'這是留在幕僚長的虛構草稿。');
  await click('[data-act="board"]');assert.equal((await evaluate('mock.snapshot()')).view,'board');
  if(width===360)await click('.phoneback');else await click('.pinned');
  assert.equal((await evaluate('mock.snapshot()')).view,'chief');
  assert.equal(await evaluate('document.querySelectorAll("[data-focus]").length'),1);
 });
 pass(`${width}: named target and return`, 'Actual DOM clicks open only the named mock gate; modify needs a reason; chief draft and single focus survive the detour.');
}
const question=(await readFile(join(root,'../design/DESIGN.md'),'utf8')).split('**留給艦長的一個問題（總監審完再問）：**「')[1].split('」')[0];
const embedded=[];
for(const state of states)embedded.push({...state,image:'data:image/png;base64,'+(await readFile(join(root,'screenshots/360-'+state.id+'.png'))).toString('base64')});
const phone=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline';script-src 'unsafe-inline';img-src 'self' file: data:;connect-src 'none';base-uri 'none';form-action 'none'"><title>幕僚長 · 手機審查</title><style>:root{color-scheme:dark;font:14px -apple-system,BlinkMacSystemFont,'PingFang TC',sans-serif;background:#111613;color:#e3ebe5}*{box-sizing:border-box}body{margin:0;padding:18px 12px}small{color:#a6b6ac;font-size:11px}h1{font-size:17px;line-height:1.8;font-weight:550;margin:10px 0 18px}.controls{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:7px}button,select{min-height:44px;min-width:0;background:#202923;border:1px solid #435948;border-radius:7px;color:inherit;font:inherit}select{font-size:12px;padding:0 5px}p{font-size:12px;line-height:1.8;color:#b5c3ba}img{display:block;width:100%;max-width:360px;height:auto;margin:auto;border:1px solid #3c4b41;border-radius:8px}button:focus-visible,select:focus-visible{outline:2px solid #a9dcbb;outline-offset:2px}</style></head><body><small>單檔離線圖稿 · 全部手機 PNG 已內嵌</small><h1>${question}</h1><div class="controls"><button id="prev" aria-label="上一態">←</button><select id="state" aria-label="審查狀態"></select><button id="next" aria-label="下一態">→</button></div><p id="note"></p><img id="preview" alt="手機圖稿"><p>全部資料虛構；沒有連接代理、發訊或正式決定。靜態圖不能證明真實重開、模型或手機鍵盤行為。</p><script id="phone-data" type="application/json">${JSON.stringify(embedded)}</script><script>const states=JSON.parse(document.querySelector('#phone-data').textContent);let i=0;document.querySelector('#state').innerHTML=states.map((s,j)=>'<option value="'+j+'">'+(j+1)+' · '+s.title+'</option>').join('');function show(j){i=(j+states.length)%states.length;document.querySelector('#state').value=String(i);document.querySelector('#note').textContent=states[i].note;document.querySelector('#preview').src=states[i].image;document.querySelector('#preview').alt=states[i].title}document.querySelector('#state').onchange=e=>show(Number(e.target.value));document.querySelector('#prev').onclick=()=>show(i-1);document.querySelector('#next').onclick=()=>show(i+1);document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});window.phoneReview={show,get current(){return states[i].id}};show(0);</script></body></html>`;
await writeFile(join(root,'review-phone.html'),phone);
await freshBrowser(async({evaluate,go,resize,click,cdp,waitFor})=>{
 await resize(1440,1000);await go(pathToFileURL(join(root,'review.html')).href,'!!window.review');
 assert.equal(await evaluate('document.querySelector("h1").textContent'),question);
 for(let i=0;i<states.length;i++){await evaluate(`review.show(${i})`);await waitFor('document.querySelector("#desktop").complete&&document.querySelector("#desktop").naturalWidth===1440&&document.querySelector("#phone").complete&&document.querySelector("#phone").naturalWidth===360');}
 await evaluate('review.show(0)');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});assert.equal(await evaluate('review.current'),'unchanged');
 await click('[data-mode="phone"]');assert(await evaluate('document.querySelector(".frames").classList.contains("phone")'));
 await click('[data-mode="desktop"]');assert(await evaluate('document.querySelector(".frames").classList.contains("desktop")'));
});
pass('Desktop review', 'All 22 PNG references resolve, direction question matches DESIGN.md, arrow key and size switches exercised.');
const standalone=await mkdtemp(join(root,'.standalone-'));
try{
 await writeFile(join(standalone,'review-phone.html'),phone);
 await freshBrowser(async({evaluate,go,resize,waitFor})=>{
  await resize(360,780);await go(pathToFileURL(join(standalone,'review-phone.html')).href,'!!window.phoneReview');
  for(let i=0;i<states.length;i++){await evaluate(`phoneReview.show(${i})`);await waitFor('document.querySelector("#preview").complete&&document.querySelector("#preview").naturalWidth===360&&document.querySelector("#preview").naturalHeight===780');assert((await evaluate('document.querySelector("#preview").src')).startsWith('data:image/png;base64,'));}
  assert(await evaluate('document.documentElement.scrollWidth<=360'));
 });
}finally{await rm(standalone,{recursive:true,force:true});await assert.rejects(access(standalone));}
pass('Standalone phone review', 'All 11 embedded PNGs load in a directory containing only this HTML; no sibling files or network needed; own temporary directory removed.');
const artifacts=[];
for(const file of ['ASSUMPTIONS.md','index.html','review.html','review-phone.html','states.json','capture.mjs',...captures.map(c=>c.file)]){const b=await readFile(join(root,file));artifacts.push({file,bytes:b.length,sha256:sha(b)});}
await writeFile(join(root,'artifacts.json'),JSON.stringify({scope:'Offline static mockups only; fictional facts',artifacts},null,2)+'\n');
await writeFile(join(root,'checks/capture-evidence.json'),JSON.stringify({policy:{transport:'remote-debugging-pipe; no listening port',blockedURLs:['http://*','https://*','ws://*','wss://*'],freshProfilePerCapture:true,oneBrowserAtATime:true},captures,sessions,standaloneRemoved:true,limits:['No live daemon or agent prompts','No actual model-call accounting or persisted scan-identity test','No real-device or keyboard acceptance']},null,2)+'\n');
await writeFile(join(root,'checks/tests.json'),JSON.stringify(checks,null,2)+'\n');
process.stdout.write(`Completed ${captures.length} PNGs; ${sessions.length} fresh browser profiles closed and removed.\n`);
