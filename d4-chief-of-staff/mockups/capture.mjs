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
  child.once('exit', (code,signal) => { for(const waiter of pending.values()){clearTimeout(waiter.timeout);waiter.reject(new Error('Chrome exited '+code+'/'+signal+'; '+stderr.slice(-2000)));}pending.clear(); });
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
    }, 30000);
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


const drawerStates=['rest','call','exception','entered','source'];
for(const [width,height] of [[1440,1000],[360,780]]){
 for(const state of states){
  await freshBrowser(async({evaluate,go,resize,screenshot})=>{
   await resize(width,height);
   await go(pathToFileURL(join(root,'index.html')).href+'?state='+state.id,'!!window.mock');
   const pulse=await evaluate(`(()=>{const e=document.querySelector('.count'),a=e.getAnimations()[0];if(!a)return null;a.pause();a.currentTime=0;const before=getComputedStyle(e).transform;a.currentTime=425;return {name:getComputedStyle(e).animationName,iterations:a.effect.getTiming().iterations,before,after:getComputedStyle(e).transform}})()`);
   if(['call','exception'].includes(state.id)){assert.equal(pulse.iterations,3);assert.equal(pulse.name,'chief-call');assert.notEqual(pulse.before,pulse.after)}else assert.equal(pulse,null);
   const geometry=await evaluate(`(()=>{const visible=x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0};const selector=innerWidth<760&&mock.snapshot().drawer?'.navrow.active,.navclose':'.targetlink,.send,.back,.phoneback,.choice,.confirm,.menu';return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,navWidth:document.querySelector('.appnav').getBoundingClientRect().width,boardVisible:visible(document.querySelector('.board')),times:[...document.querySelectorAll('[data-time]')].map(x=>x.dataset.time),kinds:[...document.querySelectorAll('[data-kind]')].map(x=>x.dataset.kind),actions:[...document.querySelectorAll(selector)].filter(visible).map(x=>{const r=x.getBoundingClientRect();return {text:x.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,disabled:x.disabled}}),focusText:document.querySelector('[data-focus]')?.innerText,focusCount:document.querySelectorAll('[data-focus]').length,count:document.querySelector('.count').textContent,countClass:document.querySelector('.count').className,audioElements:document.querySelectorAll('audio,video').length,snapshot:mock.snapshot()}})()`);
   assert.equal(geometry.width,width);assert.equal(geometry.height,height);
   assert(geometry.documentWidth<=width,state.id+' no outer horizontal overflow');assert(geometry.documentHeight<=height,state.id+' no outer vertical overflow');
   assert.equal(geometry.navWidth,width===1440||drawerStates.includes(state.id)?320:0);
   assert.deepEqual(geometry.times,[...geometry.times].sort().reverse(),'one newest-first order');
   assert.equal(geometry.kinds.filter(x=>x==='狀態').length,2,'FO status rows retained');
   assert.equal(geometry.count,state.id==='exception'?'1':state.id==='empty'?'0':state.id==='source'?'?':'4');
   assert.equal(geometry.audioElements,0);
   for(const a of geometry.actions){assert(a.height>=44,'44px action height');assert(a.x>=0&&a.x+a.width<=width+1,'action fits horizontally');assert(a.y>=0&&a.bottom<=height+1,state.id+' fixed action fits vertically: '+JSON.stringify(a))}
   assert.equal(geometry.focusCount,['focus','entered','returned'].includes(state.id)?1:0);
   if(['focus','entered','returned'].includes(state.id))assert(geometry.countClass.includes('attended'));
   if(state.id==='target')assert(await evaluate('document.querySelector(".confirm").disabled'));
   if(state.id==='returned')assert.equal(await evaluate('document.querySelector("#message").value'),'我先看這個關卡。');
   if(state.id==='board')assert(geometry.boardVisible);
   if(state.id==='source')assert(await evaluate('document.querySelector(".sourcegap").textContent.includes("?")'));
   const file='screenshots/'+width+'-'+state.id+'.png';await screenshot(file);
   const png=await readFile(join(root,file));assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);
   captures.push({state:state.id,viewport:`${width}x${height}`,file,sha256:sha(png),geometry,pulse});
  });
  process.stdout.write(`Captured ${width} ${state.id}\n`);
 }
 pass(`${width}: ${states.length} states`,'PNG dimensions, no outer overflow, newest-first Board, 44px visible controls, sidebar totals and 3-cycle mock pulse checked; no audio or model run.');
 await freshBrowser(async({evaluate,go,resize,click,fill})=>{
  await resize(width,height);await go(pathToFileURL(join(root,'index.html')).href+'?state=call','!!window.mock');
  assert.equal((await evaluate('mock.snapshot()')).calling,true);
  await click('[data-act="enter"]');assert.equal((await evaluate('mock.snapshot()')).calling,false);
  assert.equal(await evaluate('document.querySelector(".count").textContent'),'4');assert.equal(await evaluate('document.querySelector(".count").getAnimations().length'),0);
  assert.equal(await evaluate('document.querySelectorAll("[data-focus]").length'),1);
  await fill('#message','這是留在幕僚長的虛構草稿。');await click('[data-act="target"]');
  assert.equal((await evaluate('mock.snapshot()')).view,'target');assert(await evaluate('document.querySelector(".confirm").disabled'));
  await click('[data-choice="修改"]');assert(await evaluate('document.querySelector(".confirm").disabled'));
  await fill('#reason','先補齊範例限制。');assert.equal(await evaluate('document.querySelector(".confirm").disabled'),false);
  await click('.back');assert.equal(await evaluate('document.querySelector("#message").value'),'這是留在幕僚長的虛構草稿。');
  await click('[data-act="board"]');assert.equal((await evaluate('mock.snapshot()')).view,'board');
  await click(width===360?'.phoneback':'.pinned');assert.equal((await evaluate('mock.snapshot()')).view,'chief');assert.equal(await evaluate('document.querySelectorAll("[data-focus]").length'),1);
  await evaluate('mock.setScenario("exception")');await click('[data-act="enter"]');assert.equal(await evaluate('document.querySelector(".count").textContent'),'1');assert((await evaluate('document.querySelector("[data-focus]").innerText')).includes('31 分鐘'));assert.equal(await evaluate('document.querySelector(".count").getAnimations().length'),0);
 });
 pass(`${width}: call → focus → named target → return`,'DOM clicks stop the pulse, preserve total 4 (exception 1), open one named gate, require modify reason, and retain chief draft and focus. No real decision sent.');
}
const normal=(age,after,score)=>age>=300&&after>=3&&score>8;
const exception=(kind,age,notified)=>['gate','permission'].includes(kind)&&age>1800&&!notified;
assert(!normal(240,3,19.5));assert(normal(360,3,(4+4+2+3)*1.5));assert(!normal(360,3,8));assert(!normal(360,2,19.5));assert(!exception('gate',1800,false));assert(exception('gate',1860,false));assert(exception('permission',1860,false));assert(!exception('question',1860,false));assert(!exception('review',1860,false));assert(!exception('gate',1860,true));
pass('Illustrated threshold arithmetic','Design examples only: 4 minutes fails normal; 6 minutes +3 matters +19.5 passes; strict >8 and >1800 seconds; one gate/permission once. This is not a product timer or identity-dedup test.');
const index=await readFile(join(root,'index.html'),'utf8');assert(!/new\s+Audio\b|\.play\s*\(|AudioContext|playAudio\s*\(|setInterval\s*\(/.test(index));
pass('No real audio or scheduler','Source has no audio player, playback API, network request, storage, model prompt, or background interval; pulse is mock CSS only.');
const question='事情累積後由她找你，再進對話談一件，這樣合用嗎？';
const embedded=[];
for(const state of states)embedded.push({...state,image:'data:image/png;base64,'+(await readFile(join(root,'screenshots/360-'+state.id+'.png'))).toString('base64')});
const phone=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline';script-src 'unsafe-inline';img-src 'self' file: data:;connect-src 'none';base-uri 'none';form-action 'none'"><title>幕僚長 · 手機審查</title><style>:root{color-scheme:dark;font:14px -apple-system,BlinkMacSystemFont,'PingFang TC',sans-serif;background:#111613;color:#e3ebe5}*{box-sizing:border-box}body{margin:0;padding:18px 12px}small{color:#a6b6ac;font-size:11px}h1{font-size:17px;line-height:1.8;font-weight:550;margin:10px 0 18px}.controls{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:7px}button,select{min-height:44px;min-width:0;background:#202923;border:1px solid #435948;border-radius:7px;color:inherit;font:inherit}select{font-size:12px;padding:0 5px}p{font-size:12px;line-height:1.8;color:#b5c3ba}img{display:block;width:100%;max-width:360px;height:auto;margin:auto;border:1px solid #3c4b41;border-radius:8px}button:focus-visible,select:focus-visible{outline:2px solid #a9dcbb;outline-offset:2px}</style></head><body><small>單檔離線圖稿 · 全部手機 PNG 已內嵌</small><h1>${question}</h1><p>已定 X＝3、Y＝8、原權重；單一關卡／權限超過 30 分鐘找一次。</p><div class="controls"><button id="prev" aria-label="上一態">←</button><select id="state" aria-label="審查狀態"></select><button id="next" aria-label="下一態">→</button></div><p id="note"></p><img id="preview" alt="手機圖稿"><p>全部資料虛構；沒有連接代理、發訊或正式決定。短音僅註記，未播放。靜態圖不能證明背景計時、真實重開、模型、通知或手機鍵盤行為。</p><script id="phone-data" type="application/json">${JSON.stringify(embedded)}</script><script>const states=JSON.parse(document.querySelector('#phone-data').textContent);let i=0;document.querySelector('#state').innerHTML=states.map((s,j)=>'<option value="'+j+'">'+(j+1)+' · '+s.title+'</option>').join('');function show(j){i=(j+states.length)%states.length;document.querySelector('#state').value=String(i);document.querySelector('#note').textContent=states[i].note;document.querySelector('#preview').src=states[i].image;document.querySelector('#preview').alt=states[i].title}document.querySelector('#state').onchange=e=>show(Number(e.target.value));document.querySelector('#prev').onclick=()=>show(i-1);document.querySelector('#next').onclick=()=>show(i+1);document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});window.phoneReview={show,get current(){return states[i].id}};show(0);</script></body></html>`;
await writeFile(join(root,'review-phone.html'),phone);

await freshBrowser(async({evaluate,go,resize,click,cdp,waitFor})=>{
 await resize(1440,1000);await go(pathToFileURL(join(root,'review.html')).href,'!!window.review');
 assert.equal(await evaluate('document.querySelector("h1").textContent'),question);
 for(let i=0;i<states.length;i++){await evaluate(`review.show(${i})`);await waitFor('document.querySelector("#desktop").complete&&document.querySelector("#desktop").naturalWidth===1440&&document.querySelector("#phone").complete&&document.querySelector("#phone").naturalWidth===360');}
 await evaluate('review.show(0)');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});assert.equal(await evaluate('review.current'),'board');
 await click('[data-mode="phone"]');assert(await evaluate('document.querySelector(".frames").classList.contains("phone")'));await click('[data-mode="desktop"]');assert(await evaluate('document.querySelector(".frames").classList.contains("desktop")'));
});
pass('Desktop review','All 22 PNG references load; adopted rule shown, one direction question, arrow key and size switches exercised.');
const standalone=await mkdtemp(join(root,'.standalone-'));
try{
 await writeFile(join(standalone,'review-phone.html'),phone);
 await freshBrowser(async({evaluate,go,resize,waitFor})=>{
  await resize(360,780);await go(pathToFileURL(join(standalone,'review-phone.html')).href,'!!window.phoneReview');
  for(let i=0;i<states.length;i++){await evaluate(`phoneReview.show(${i})`);await waitFor('document.querySelector("#preview").complete&&document.querySelector("#preview").naturalWidth===360&&document.querySelector("#preview").naturalHeight===780');assert((await evaluate('document.querySelector("#preview").src')).startsWith('data:image/png;base64,'));}
  assert(await evaluate('document.documentElement.scrollWidth<=360'));
 });
}finally{await rm(standalone,{recursive:true,force:true});await assert.rejects(access(standalone));}
pass('Standalone phone review','All 11 embedded PNGs load with only this HTML present; no sibling files or network needed. Own temporary directory removed.');
const artifacts=[];
for(const file of ['ASSUMPTIONS.md','index.html','review.html','review-phone.html','states.json','capture.mjs',...captures.map(c=>c.file)]){const b=await readFile(join(root,file));artifacts.push({file,bytes:b.length,sha256:sha(b)});}
await writeFile(join(root,'artifacts.json'),JSON.stringify({scope:'Amendment 1 + Captain ruling; offline static mockups only; fictional facts',artifacts},null,2)+'\n');
await writeFile(join(root,'checks/capture-evidence.json'),JSON.stringify({policy:{transport:'remote-debugging-pipe; no listening port',blockedURLs:['http://*','https://*','ws://*','wss://*'],freshProfilePerCapture:true,oneBrowserAtATime:true,audioPlayed:false},captures,sessions,standaloneRemoved:true,limits:['No live daemon, agent prompts, or real audio','No real model accounting, persisted batch-identity dedup, or product timer test','No native notification merge or real-device/keyboard acceptance']},null,2)+'\n');
await writeFile(join(root,'checks/tests.json'),JSON.stringify(checks,null,2)+'\n');
process.stdout.write(`Completed ${captures.length} PNGs; ${sessions.length} fresh browser profiles closed and removed.\n`);
