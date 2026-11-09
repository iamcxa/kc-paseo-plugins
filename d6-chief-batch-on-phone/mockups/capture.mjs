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
  child.stdio[3].on('error', error => { for (const waiter of pending.values()) { clearTimeout(waiter.timeout); waiter.reject(new Error('Browser pipe failed: '+error.message+'; '+stderr.slice(-2000))); } pending.clear(); });
  child.on('error', error => { for (const waiter of pending.values()) { clearTimeout(waiter.timeout); waiter.reject(error); } pending.clear(); });
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
    if (child.exitCode === null && child.signalCode === null) await call('Browser.close').catch(() => child.kill('SIGTERM'));
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

const sourceHash=sha(await readFile(join(root,'index.html')));
const preview=process.argv.includes('--preview');
const refresh=process.argv.find(x=>x.startsWith('--refresh='))?.slice(10).split(',')||null;
if(refresh){const previous=JSON.parse(await readFile(join(root,'checks/capture-first-pass.json'),'utf8'));const previousHash=sha(await readFile(join(root,'checks/capture-source-1.html')));captures.push(...previous.captures.filter(c=>!refresh.includes(c.state)).map(c=>({...c,htmlSha256:previousHash,htmlSource:'checks/capture-source-1.html'})));sessions.push(...previous.sessions);}
const widths=preview?[[360,780]]:[[360,780],[1440,1000]];
const planned=preview?states.filter(s=>['landing','reason-typed','unsupported','keyboard'].includes(s.id)):refresh?states.filter(s=>refresh.includes(s.id)):states;
for(const [width,height] of widths){
 for(const state of planned){
  await freshBrowser(async({evaluate,go,resize,screenshot})=>{
   await resize(width,height);await go(pathToFileURL(join(root,'index.html')).href+'?state='+state.id,'!!window.mock');
   const geometry=await evaluate(`(()=>{const r=x=>{if(!x)return null;const a=x.getBoundingClientRect();return {x:a.x,y:a.y,width:a.width,height:a.height,bottom:a.bottom,right:a.right}};const target=({question:'q1',sent:'q1',relayed:'q1',gate:'g1',chosen:'g1',reason:'g1','reason-typed':'g1',recorded:'g1',stale:'g1',permission:'permission',keyboard:'q1'})[mock.snapshot().scene];const item=target?document.getElementById(target):null;return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,header:document.querySelector('.headname').textContent,surface:mock.snapshot().surface,sidebar:r(document.querySelector('.sidebar')),timeline:r(document.querySelector('.timeline')),keyboard:r(document.querySelector('.keyboard')),overviewCount:document.querySelectorAll('[data-four-items] .overview-row').length,progress:document.querySelector('.batchprogress').textContent,active:target,item:r(item),title:r(item?.querySelector('h2')),recipient:r(item?.querySelector('.recipient')),send:r(item?.querySelector('.send-answer,.confirm,.go-fo')),actions:[...document.querySelectorAll('.menu,.send-answer,.choice,.confirm,.go-fo,.read-new,.cancel')].map(x=>({text:x.textContent.trim(),...r(x),disabled:x.disabled})),snapshot:mock.snapshot()}})()`);
   assert.equal(geometry.width,width);assert.equal(geometry.height,height);assert(geometry.documentWidth<=width,'No outer horizontal overflow');assert(geometry.documentHeight<=height,'No outer vertical overflow');
   assert.equal(geometry.surface,state.id==='fallback-bridge'?'bridge':'native');
   if(state.id!=='fallback-bridge')assert(geometry.header.includes('幕僚長')&&!geometry.header.includes('Bridge'));
   assert.equal(geometry.overviewCount,4);
   for(const a of geometry.actions.filter(a=>a.width>0&&a.height>0))assert(a.height>=44,'44px action: '+a.text);
   if(width===360&&state.id==='landing')assert(await evaluate(`(()=>{const rows=[...document.querySelectorAll('.overview-row')];const t=document.querySelector('.timeline').getBoundingClientRect();return rows.every(x=>{const r=x.getBoundingClientRect();return r.y>=t.y&&r.bottom<=t.bottom})})()`),'All four overview rows visible');
   if(state.id==='reason')assert.equal(await evaluate('document.querySelector("[data-confirm]").disabled'),true);
   if(state.id==='reason-typed'||state.id==='chosen')assert.equal(await evaluate('document.querySelector("[data-confirm]").disabled'),false);
   if(state.id==='stale'){assert.equal(await evaluate('document.querySelector("[data-confirm]").disabled'),true);assert(await evaluate(`(()=>{const t=document.querySelector('.timeline').getBoundingClientRect();return ['.warn','.read-new','#reason','[data-confirm]'].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.y>=t.y&&r.bottom<=t.bottom})})()`),'Refusal, reload, preserved reason and disabled Confirm all visible');}
   if(state.id==='sent')assert(await evaluate('document.querySelector("#q1").textContent.includes("尚未確認 FO 收件")'));
   if(state.id==='relayed')assert(await evaluate('document.querySelector("#q1").textContent.includes("已轉達給 範例 FO 乙")'));
   if(state.id==='recorded')assert(await evaluate('document.querySelector("#g1").textContent.includes("demo-decision-01")&&document.querySelector("#g1").textContent.includes("准，僅範例環境。")'));
   if(state.id==='permission'){assert(geometry.title.y>=geometry.timeline.y&&geometry.title.y<geometry.timeline.y+80,'Permission heading at top of focused view');assert(geometry.send.bottom<=geometry.timeline.bottom,'Permission route fully visible');}if(state.id==='permission')assert.deepEqual(await evaluate('[...document.querySelectorAll(".permission-card button")].map(x=>x.textContent.trim())'),['到範例 FO 戊處理']);
   if(state.id==='half')assert(await evaluate('document.querySelector(".batchprogress").textContent.includes("已送出 2／4")&&[...document.querySelectorAll(".overview-row")].filter(x=>x.textContent.includes("未答")).length===2'));
   if(state.id==='unsupported')assert(await evaluate('document.querySelector("[data-original]").textContent.includes("開側欄 → 點 Bridge")&&document.querySelector("[data-unavailable]").textContent.includes("unavailable")'));
   if(width===360&&state.id==='keyboard'){
    assert.equal(geometry.keyboard.height,240);
    for(const k of ['title','recipient','send']){assert(geometry[k].y>=geometry.timeline.y,`${k} visible above keyboard`);assert(geometry[k].bottom<=geometry.keyboard.y,`${k} does not overlap keyboard`);}
    assert(geometry.send.bottom<=geometry.timeline.bottom,'Send within remaining timeline');
   }
   const file=`screenshots/${width}-${state.id}.png`;await screenshot(file);const png=await readFile(join(root,file));assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);
   captures.push({htmlSha256:sourceHash,htmlSource:'index.html',state:state.id,viewport:`${width}x${height}`,file,sha256:sha(png),geometry});
  });
  process.stdout.write(`Captured ${width} ${state.id}\n`);
 }
 pass(`${width}: ${refresh?'refined '+refresh.join('/'):'native batch'} screenshot states`,'Exact PNG dimensions, no outer overflow, four-item overview, native vs fallback chrome, 44px controls, per-item states and simulated phone keyboard geometry; no native-device claim.');
}
if(preview){await writeFile(join(root,'checks/preview-evidence.json'),JSON.stringify({captures,sessions},null,2)+'\n');process.stdout.write('Preview capture complete.\n');process.exit(0)}
for(const [width,height] of [[360,780],[1440,1000]]){
 await freshBrowser(async({evaluate,go,resize,click,fill})=>{
  await resize(width,height);await go(pathToFileURL(join(root,'index.html')).href+'?state=question','!!window.mock');
  assert.equal((await evaluate('mock.snapshot()')).events.length,0);
  await fill('#answer-q1','日期請用 YYYY-MM-DD，僅範例。');assert.equal((await evaluate('mock.snapshot()')).events.length,0);
  await click('[data-send="q1"]');const sent=await evaluate('mock.snapshot()');assert.equal(sent.events.length,1);assert.equal(sent.events[0].words,'日期請用 YYYY-MM-DD，僅範例。');assert.equal(sent.events[0].recipient,'範例 FO 乙');assert.equal(sent.qstatus,'sent');assert.equal(await evaluate('document.querySelectorAll("#q1 [data-send]").length'),0);
  await evaluate('mock.setScenario("gate")');await click('[data-choice="要求修改"]');assert.equal((await evaluate('mock.snapshot()')).events.length,0);assert(await evaluate('document.querySelector("[data-confirm]").disabled'));
  await fill('#reason','先補上範例資料的回復步驟。');await click('[data-act="cancel"]');assert.equal((await evaluate('mock.snapshot()')).events.length,0);assert.equal((await evaluate('mock.snapshot()')).reason,'先補上範例資料的回復步驟。');await click('[data-choice="要求修改"]');await click('[data-confirm]');const decided=await evaluate('mock.snapshot()');assert.equal(decided.events.length,1);assert.equal(decided.events[0].words,'要求修改，先補上範例資料的回復步驟。');assert.equal(decided.events[0].version,1);
  await evaluate('mock.setScenario("stale")');assert(await evaluate('document.querySelector("[data-confirm]").disabled'));assert.equal((await evaluate('mock.snapshot()')).events.length,0);assert.equal((await evaluate('mock.snapshot()')).reason,'先補上範例資料的回復步驟。');
  await click('[data-act="read-new"]');assert.equal((await evaluate('mock.snapshot()')).gateVersion,2);assert.equal((await evaluate('mock.snapshot()')).reason,'先補上範例資料的回復步驟。');await click('[data-choice="准"]');await click('[data-confirm]');assert.equal((await evaluate('mock.snapshot()')).events[0].version,2);
  await evaluate('mock.setScenario("question")');await click('[data-send="q1"]');await click('[data-choice="准"]');await click('[data-confirm]');await fill('#answer-q2','請保留舊的範例資料。');await click('[data-send="q2"]');await click('[data-second-choice="暫緩"]');assert(await evaluate('document.querySelector("[data-confirm-g2]").disabled'));await fill('#reason-g2','等範例檢查齊全。');await click('[data-confirm-g2]');const whole=await evaluate('mock.snapshot()');assert.equal(whole.events.length,4);assert.equal(new Set(whole.events.map(x=>x.id)).size,4);assert(whole.q2done&&whole.g2done);assert(await evaluate('document.querySelector(".batchprogress").textContent.includes("已送出 4／4")'));
  await evaluate('mock.setScenario("permission")');await click('[data-act="permission"]');const nav=await evaluate('mock.snapshot()');assert.equal(nav.events.length,1);assert.equal(nav.events[0].kind,'navigation');assert.equal(nav.events[0].route,'bridge-named-permission-to-native-fo');
  await evaluate('mock.setScenario("unsupported")');if(width===360){await click('[data-act="menu"]');assert.equal((await evaluate('mock.snapshot()')).drawer,true);}await click('[data-act="bridge"]');const back=await evaluate('mock.snapshot()');assert.equal(back.surface,'bridge');assert.equal(back.events.length,0);assert.equal(back.qstatus,'relayed');assert.equal(back.gstatus,'recorded');
 });
 pass(`${width}: mock interaction boundaries`,'Typing/choosing/cancelling send nothing; exact question recipient/words and named Confirm reason are retained; stale Confirm disabled; permission only navigates; Bridge fallback preserves answered states without resend. These are offline mock interactions.');
}
const question='點推播後，直接在她的原生對話逐件處理，這樣合用嗎？';
const embedded=[];for(const s of states)embedded.push({...s,image:'data:image/png;base64,'+(await readFile(join(root,`screenshots/360-${s.id}.png`))).toString('base64')});
const phone=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline';script-src 'unsafe-inline';img-src 'self' file: data:;connect-src 'none';base-uri 'none';form-action 'none'"><title>幕僚長 · 手機單檔審查</title><style>:root{color-scheme:dark;font:14px -apple-system,BlinkMacSystemFont,'PingFang TC',sans-serif;background:#111613;color:#e3ebe5}*{box-sizing:border-box}body{margin:0;padding:16px 12px}small{font-size:10px;color:#a6b6ac}h1{font-size:17px;font-weight:550;line-height:1.8;margin:9px 0 14px}p{font-size:12px;line-height:1.85;color:#b5c3ba}.controls{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:7px}button,select{min-height:44px;min-width:0;font:inherit;background:#202923;border:1px solid #435948;border-radius:8px;color:inherit}select{font-size:12px;padding:0 4px}img{width:100%;max-width:360px;height:auto;display:block;margin:auto;border:1px solid #3c4b41;border-radius:8px}button:focus-visible,select:focus-visible{outline:2px solid #a9dcbb;outline-offset:2px}</style></head><body><small>單檔離線圖稿 · 全部 16 張手機 PNG 已內嵌</small><h1>${question}</h1><p>原生入口 1 次＋原位 8 次；理由另加 2。元件不支援時，Bridge 入口 3 次。手機能力檢查未做。</p><div class="controls"><button id="prev" aria-label="上一態">←</button><select id="state" aria-label="審查狀態"></select><button id="next" aria-label="下一態">→</button></div><p id="note"></p><img id="preview" alt="手機圖稿"><p>人物、資料與送達皆為虛構；沒有代理、通知、權限或正式關卡操作。鍵盤只為靜態示意。</p><script id="phone-data" type="application/json">${JSON.stringify(embedded)}</script><script>const states=JSON.parse(document.querySelector('#phone-data').textContent);let i=0;document.querySelector('#state').innerHTML=states.map((s,j)=>'<option value="'+j+'">'+(j+1)+' · '+s.title+'</option>').join('');function show(j){i=(j+states.length)%states.length;document.querySelector('#state').value=String(i);document.querySelector('#note').textContent=states[i].note;document.querySelector('#preview').src=states[i].image;document.querySelector('#preview').alt=states[i].title}document.querySelector('#state').onchange=e=>show(Number(e.target.value));document.querySelector('#prev').onclick=()=>show(i-1);document.querySelector('#next').onclick=()=>show(i+1);document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});window.phoneReview={show,get current(){return states[i].id}};show(0);</script></body></html>`;
await writeFile(join(root,'review-phone.html'),phone);
await freshBrowser(async({evaluate,go,resize,waitFor,click,cdp})=>{
 await resize(1440,1000);await go(pathToFileURL(join(root,'review.html')).href,'!!window.review');assert.equal(await evaluate('document.querySelector("h1").textContent'),question);
 for(let i=0;i<states.length;i++){await evaluate(`review.show(${i})`);await waitFor('document.querySelector("#desktop").complete&&document.querySelector("#desktop").naturalWidth===1440&&document.querySelector("#phone").complete&&document.querySelector("#phone").naturalWidth===360');}
 await evaluate('review.show(0)');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});assert.equal(await evaluate('review.current'),'question');await click('[data-mode="phone"]');assert(await evaluate('document.querySelector(".frames").classList.contains("phone")'));await click('[data-mode="desktop"]');assert(await evaluate('document.querySelector(".frames").classList.contains("desktop")'));
});
pass('Review page: one direction question and 32 PNGs','All state images load; arrow navigation and phone/desktop modes exercised over file://.');
const standalone=await mkdtemp(join(root,'.standalone-'));
try{await writeFile(join(standalone,'review-phone.html'),phone);await freshBrowser(async({evaluate,go,resize,waitFor})=>{
 await resize(360,780);await go(pathToFileURL(join(standalone,'review-phone.html')).href,'!!window.phoneReview');for(let i=0;i<states.length;i++){await evaluate(`phoneReview.show(${i})`);await waitFor('document.querySelector("#preview").complete&&document.querySelector("#preview").naturalWidth===360&&document.querySelector("#preview").naturalHeight===780');assert((await evaluate('document.querySelector("#preview").src')).startsWith('data:image/png;base64,'));}assert(await evaluate('document.documentElement.scrollWidth<=360'));
});}finally{await rm(standalone,{recursive:true,force:true});await assert.rejects(access(standalone));}
pass('Standalone phone review: 16 embedded images','Every 360 PNG loads with this HTML alone in an otherwise empty folder; no sibling assets or network.');
const artifacts=[];for(const file of ['checks/capture-source-1.html','ASSUMPTIONS.md','index.html','review.html','review-phone.html','states.json','capture.mjs',...captures.map(c=>c.file)]){const b=await readFile(join(root,file));artifacts.push({file,bytes:b.length,sha256:sha(b)});}
await writeFile(join(root,'artifacts.json'),JSON.stringify({scope:'Captain amendment 1; static native-conversation design only; fictional content',artifacts},null,2)+'\n');
await writeFile(join(root,'checks/capture-evidence.json'),JSON.stringify({policy:{transport:'remote-debugging-pipe; no listener',blockedURLs:['http://*','https://*','ws://*','wss://*'],freshProfilePerCapture:true,oneBrowserAtATime:true,audioPlayed:false},captures,sessions,standaloneRemoved:true,limits:['No live daemon, agent prompt, notification, model or plugin RPC','Keyboard is a 240px static illustration, not an OS keyboard','No physical-phone capability or product delivery proof']},null,2)+'\n');
await writeFile(join(root,'checks/tests.json'),JSON.stringify(checks,null,2)+'\n');
process.stdout.write(`Completed ${captures.length} PNGs; ${sessions.length} fresh profiles closed and removed.\n`);
process.exit(0);
