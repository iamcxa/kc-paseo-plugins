(async()=>{
 const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url'),fs=require('node:fs'),assert=require('node:assert/strict');
 const base='/Applications/Paseo.app/Contents/Resources/app.asar/node_modules/@getpaseo/cli/dist/utils/client.js';
 const {connectToDaemon}=await import(pathToFileURL(base).href);const wt=process.env.PROOF_WT,req=createRequire(wt+'/spacedock-bridge/package.json');process.chdir(wt+'/spacedock-bridge');req('tsx/cjs');
 const {createPaseoApi}=await import(pathToFileURL(wt+'/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js').href);
 const {collectDigestHandler,readDigestHandler,readReplayHandler}=req('./server/digest.ts');
 const {reportSource,readSource,validateDigest,replayWindow}=req('./server/report-sources.ts');
 const {fleetSnapshot}=req('./server/fleet-mcp.ts');const {mountBridge}=req('./test/helpers/bridge-host.mts');const {act}=req('react');const {mock}=require('node:test');
 const client=await connectToDaemon({target:{kind:'instance',home:process.env.PASEO_HOME}});let cleanup=[];let api;
 const t={mock,after:fn=>cleanup.push(fn)};
 const clean=async()=>{for(const fn of cleanup.reverse())await fn();cleanup=[];mock.restoreAll();};
 const wait=async(fn)=>{const end=Date.now()+20000;while(Date.now()<end){let value;await act(async()=>{value=await fn();await new Promise(r=>setTimeout(r,100));});if(value)return value;}throw Error('isolated lifecycle proof timed out');};
 try{
  api=createPaseoApi(client);const co=process.env.PROOF_CO,fo=process.env.PROOF_FO;
  const read=(id,o)=>api.agents.ref(id).timeline.refetch(o),tail=id=>read(id,{projection:'projected',direction:'tail',limit:120});
  const payload=(text,gate)=>fs.writeFileSync(process.env.PROOF_PAYLOAD,JSON.stringify({text,gate}));
  let collectedSource;
  const facade={agents:{...api.agents,ref:id=>{
   const h=api.agents.ref(id);if(id!==co)return h;
   return {refresh:()=>h.refresh(),send:async text=>{
    const snapshot=JSON.parse(text.slice(text.lastIndexOf('\n')+1));collectedSource=snapshot.reports.find(r=>r.agentId===fo).sources.at(-1).source;
    const raw={roundId:snapshot.roundId,collectedAt:snapshot.collectedAt,points:[{pointId:'co-proof',sentence:'Fictional Commander lifecycle verified',sources:[collectedSource],contextLines:['about','before','now'].map(kind=>({kind,sentence:'Fictional '+kind,refs:[collectedSource]}))}]};
    payload(JSON.stringify(raw),process.env.PROOF_CO_GATE);return h.send(text);
   }};
  }}};
  await collectDigestHandler({hostId:'fixture-host',agentId:co},facade);
  const streaming=await wait(async()=>{const p=await tail(co);return p.agent.status==='running'&&p.entries.at(-1)?.item.type==='assistant_message'&&p.entries.at(-1).item.text.includes('co-proof')?p:null;});
  const entry=streaming.entries.at(-1),position={hostId:'fixture-host',agentId:co,epoch:streaming.epoch,seqStart:entry.seqStart,seqEnd:entry.seqEnd};
  assert.equal(await readDigestHandler(position,api),null);
  let digestReads=0;
  let h=await mountBridge(t,false,rpc=>{rpc['coordinator.open']=async()=>({agentId:co});rpc['digest.read']=p=>{digestReads++;return readDigestHandler(p,api);};rpc['digest.replay']=p=>readReplayHandler(p,api);},false,{},true,true,api);
  await wait(()=>h.text().includes('摘要無法驗證'));const count=digestReads;
  fs.writeFileSync(process.env.PROOF_CO_GATE,'release');
  const completed=await wait(async()=>{const p=await tail(co);return p.agent.status==='idle'?p:null;});
  assert.deepEqual(completed.entries.at(-1),entry);await wait(()=>h.text().includes('Fictional Commander lifecycle verified'));assert.ok(digestReads>count);
  await h.click('Replay co-proof');await wait(()=>h.text().includes('Fictional report'));assert.ok(await readReplayHandler({position,pointId:'co-proof',source:collectedSource,direction:'anchor'},api));
  const commander={runningRejected:true,completedAutomatically:true,identicalEntry:true,range:[entry.seqStart,entry.seqEnd],replay:true};await clean();
  payload('Fictional streaming source unchanged at completion',process.env.PROOF_FO_GATE);await api.agents.ref(fo).send('Fictional paused source request');
  const foStreaming=await wait(async()=>{const p=await tail(fo);return p.agent.status==='running'&&p.entries.at(-1)?.item.text==='Fictional streaming source unchanged at completion'?p:null;});
  const foEntry=foStreaming.entries.at(-1),source=reportSource('fixture-host',fo,foStreaming.epoch,foEntry);assert.ok(source);assert.equal(await readSource(read,'fixture-host',source),null);
  const snapshot=await fleetSnapshot(api,'fixture-host');assert.ok(!snapshot.reports.find(r=>r.agentId===fo).sources.some(s=>s.source.seqStart===source.seqStart));
  // This in-memory fixture pins the real streaming entry to exercise read-back, not collection admission.
  const raw={roundId:'fictional-pinned-source-proof',collectedAt:new Date().toISOString(),points:[{pointId:'fo-proof',sentence:'Fictional FO lifecycle verified',sources:[source],contextLines:['about','before','now'].map(kind=>({kind,sentence:'Fictional '+kind,refs:[source]}))}]};
  const round={...raw,hostId:'fixture-host',agentId:co,sources:[source],sourceLabels:{[fo]:'Fictional FO'}};
  let sourceReads=0;
  h=await mountBridge(t,false,rpc=>{rpc['coordinator.open']=async()=>({agentId:co});rpc['digest.read']=()=>{sourceReads++;return validateDigest(raw,round,read);};rpc['digest.replay']=async input=>{const valid=await validateDigest(raw,round,read);return valid.points[0].valid?replayWindow(read,'fixture-host',input.source,input.direction,input.edge):null;};},false,{},true,true,api);
  await wait(()=>h.text().includes('摘要無法驗證')&&h.find('重新核對摘要'));const sourceCount=sourceReads;fs.writeFileSync(process.env.PROOF_FO_GATE,'release');
  const foComplete=await wait(async()=>{const p=await tail(fo);return p.agent.status==='idle'?p:null;});assert.deepEqual(foComplete.entries.at(-1),foEntry);
  await wait(()=>h.text().includes('Fictional FO lifecycle verified'));assert.ok(sourceReads>sourceCount);assert.ok(await readSource(read,'fixture-host',source));await h.click('Replay fo-proof');await wait(()=>h.text().includes('Fictional streaming source unchanged at completion'));
  console.log('SAFE:'+JSON.stringify({passed:true,commander,fo:{runningRejected:true,omittedFromCollection:true,completedAutomatically:true,identicalEntry:true,range:[foEntry.seqStart,foEntry.seqEnd],replay:true,pinnedRoundFixture:true},actualSdkLifecycleEvents:true,liveDaemonTouched:false}));
 }finally{await clean();await api?.dispose();await client.close();}
})().catch(e=>{console.log('SAFE:'+JSON.stringify({passed:false,error:e.name,message:e.message}));process.exitCode=1;});
