import {spawn}from'node:child_process';import{mkdtemp,mkdir,readFile,writeFile,rm,access}from'node:fs/promises';import{dirname,join}from'node:path';import{fileURLToPath,pathToFileURL}from'node:url';import{createHash}from'node:crypto';import assert from'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),chrome=process.argv[2];if(!chrome)throw Error('Chromium path required');
const sessions=[],captures=[];await mkdir(join(root,'screenshots'),{recursive:true});
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



try{
 for(const width of [1440,360])for(const stage of ['list','preview']){
  await freshBrowser(async({evaluate,go,resize,screenshot})=>{
   let height=950;await resize(width,height);await go(pathToFileURL(join(root,'fixture/index.html')).href+'?stage='+stage,`!!document.querySelector('[aria-label="Markdown table"]')`);
   for(let i=0;i<6;i++){
    const overflow=await evaluate(`Math.max(0,...[...document.querySelectorAll('[data-scroll]')].map(x=>x.scrollHeight-x.clientHeight))`);
    if(overflow<=2)break;height+=overflow+40;assert(height<20000,'reasonable wrapped height');await resize(width,height);await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
   }
   const metrics=await evaluate(`(()=>{const t=document.querySelector('[aria-label="Markdown table"]'),r=t.getBoundingClientRect();const visible=e=>!!e.getClientRects().length;const spans=[...t.querySelectorAll('span')].filter(e=>visible(e)&&getComputedStyle(e).display==='block');return {width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,table:{left:r.left,right:r.right,width:r.width,height:r.height},maxCellOverflow:Math.max(0,...spans.map(e=>e.scrollWidth-e.clientWidth)),maxScrollOverflow:Math.max(0,...[...document.querySelectorAll('[data-scroll]')].map(e=>e.scrollWidth-e.clientWidth)),headers:[...t.querySelectorAll('[role="columnheader"]')].map(x=>x.textContent),text:t.innerText,fixture:window.fixture}})()`);
   assert.equal(metrics.width,width);assert(metrics.documentWidth<=width,'no outer overflow');assert(metrics.table.left>=0&&metrics.table.right<=width,'table fits viewport');assert(metrics.maxCellOverflow<=2,'cell text wraps');assert(metrics.maxScrollOverflow<=2,'chat does not overflow horizontally');assert.equal(metrics.fixture.sends,0);assert(metrics.text.includes('Alpha')&&metrics.text.includes('CSV'));assert(metrics.headers.length>=5,'headers rendered');
   const file=`screenshots/${width}-${stage}.png`;await screenshot(file);captures.push({stage,width,height,file,sha256:createHash('sha256').update(await readFile(join(root,file))).digest('hex'),metrics});
  });
 }
}finally{await writeFile(join(root,'capture-evidence.json'),JSON.stringify({captures,sessions,method:'Actual Bridge, CoChat, MarkdownView and parser with a fixture SDK + RN DOM adapter; saved cycle-5 assistant text unchanged. Each capture uses its own fresh profile, CDP pipe, all http/https/ws/wss blocked including localhost; no daemon, model or server.',runtimeSourceHead:'working tree candidate'},null,2));}
assert.equal(captures.length,4);assert.equal(sessions.length,4);console.log(JSON.stringify({captures:captures.map(x=>({stage:x.stage,width:x.width,height:x.height})),sessions:sessions.length}));
