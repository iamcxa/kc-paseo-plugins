import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { mountBridge } from './helpers/bridge-host.mjs';
const req=createRequire(import.meta.url);
const {collectDigestHandler,readDigestHandler,readReplayHandler}=req('../server/digest.ts');
const {reportSource,readSource,replayWindow}=req('../server/report-sources.ts');
const {fleetSnapshot}=req('../server/fleet-mcp.ts');
const {DIGEST_VERSION}=req('../shared/coordinator.ts');
const at='2026-11-05T10:00:00Z';
const row=(s:number,e:number,type:string,text:string):any=>({seqStart:s,seqEnd:e,sourceSeqRanges:[{startSeq:s,endSeq:e}],collapsed:s===e?[]:['assistant_merge'],timestamp:at,item:{type,text}});
const page=(id:string,entries:any[],status='idle'):any=>({agentId:id,epoch:'e',projection:'projected',reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder:false,hasNewer:false,agent:{status}});
async function fixture(){
 const f:any={co:'idle',fo:'idle',rows:[row(1,1,'user_message','Fictional request'),row(2,6,'assistant_message','Fictional FO report')],coRows:[]};
 const read=async(id:string,o:any)=>{const all=id==='co'?f.coRows:f.rows;const entries=o.direction==='tail'?all:o.direction==='before'?all.filter((e:any)=>e.seqEnd<o.cursor.seq).slice(-o.limit):all.filter((e:any)=>!o.cursor||e.seqStart>o.cursor.seq).slice(0,o.limit);return page(id,entries,id==='co'?f.co:f.fo);};
 const api={agents:{list:async()=>({entries:[{agent:{id:'fo',title:'Fictional FO',status:'idle',updatedAt:at,labels:{role:'fo'}}}]}),ref:(id:string)=>({refresh:async()=>({agent:{status:'idle',labels:{'digest-version':DIGEST_VERSION}}}),send:async()=>{},timeline:{refetch:(o:any)=>read(id,o)}})}};
 const round=await collectDigestHandler({hostId:'fixture-host',agentId:'co'},api);
 const source=reportSource('fixture-host','fo','e',f.rows[1]);
 const raw={...round,points:[{pointId:'p',sentence:'Verified fictional point',sources:[source],contextLines:['about','before','now'].map(kind=>({kind,sentence:`${kind} fiction`,refs:[source]}))}]};
 f.coRows=[row(1,1,'user_message','[Bridge plugin, automated — not the Captain]\nCollect now.'),row(2,6,'assistant_message',JSON.stringify(raw))];
 return {f,read,api,source,position:{hostId:'fixture-host',agentId:'co',epoch:'e',seqStart:2,seqEnd:6}};
}
test('server readers reject streaming then accept identical completed content on an explicit fresh read',async()=>{
 const {f,read,api,source,position}=await fixture();const original=JSON.stringify({co:f.coRows,fo:f.rows});
 f.co='running';assert.equal(await readDigestHandler(position,api),null);f.co='idle';assert.equal((await readDigestHandler(position,api)).points[0].valid,true);
 f.fo='running';assert.equal(await readSource(read,'fixture-host',source),null);assert.equal(await replayWindow(read,'fixture-host',source),null);assert.equal((await readDigestHandler(position,api)).points[0].valid,false);assert.equal((await fleetSnapshot(api,'fixture-host')).reports[0].sources.length,0);
 f.fo='idle';assert.ok(await readSource(read,'fixture-host',source));assert.ok(await replayWindow(read,'fixture-host',source));assert.equal((await readDigestHandler(position,api)).points[0].valid,true);assert.equal((await fleetSnapshot(api,'fixture-host')).reports[0].sources.length,1);assert.equal(JSON.stringify({co:f.coRows,fo:f.rows}),original);
});
for (const event of ['turn_completed','turn_failed','turn_canceled','status']) test(`Commander ${event} re-verifies identical completed content without a click`,async t=>{
 const {f,read,api}=await fixture();f.co='running';let reads=0;
 const h=await mountBridge(t,false,rpc=>{rpc['digest.read']=async (p:any)=>{reads++;return readDigestHandler(p,api);};},false,{},true);
 h.readOverrides.set('co:projected',o=>read('co',o));await h.refresh('co');assert.match(h.text(),/摘要無法驗證/);const n=reads;
 h.statuses.set('co','running');await h.refresh('co');f.co='idle';h.statuses.set('co','idle');if(event!=='status')await h.emitTimeline('co',event);await h.refresh('co');assert.ok(reads>n);assert.match(h.text(),/Verified fictional point/);
});
test('pinned FO completion re-verifies an invalid digest point without changing the round',async t=>{
 const {f,read,api}=await fixture();f.fo='running';let reads=0;
 const h=await mountBridge(t,false,rpc=>{rpc['digest.read']=async (p:any)=>{reads++;return readDigestHandler(p,api);};},false,{},true);
 h.readOverrides.set('co:projected',o=>read('co',o));await h.refresh('co');assert.match(h.text(),/摘要無法驗證/);const n=reads;
 assert.ok(h.find('重新核對摘要'));f.fo='idle';await h.emitTimeline('fo','turn_completed');await h.refresh('fo');assert.ok(reads>n);assert.match(h.text(),/Verified fictional point/);assert.equal(h.sent.length,0);
});
test('open Replay anchor recovers from streaming rejection on identical completion',async t=>{
 const {f,read,api}=await fixture();let reads=0;
 const h=await mountBridge(t,false,rpc=>{rpc['digest.read']= (p:any)=>readDigestHandler(p,api);rpc['digest.replay']=async (p:any)=>{reads++;return readReplayHandler(p,api);};},false,{},true);
 h.readOverrides.set('co:projected',o=>read('co',o));await h.refresh('co');f.fo='running';await h.click('Replay p');assert.match(h.text(),/來源不可用/);const n=reads;
 f.fo='idle';await h.emitTimeline('fo','turn_completed');await h.refresh('fo');assert.ok(reads>n);assert.ok(h.container.querySelector('[role=dialog]'));assert.match(h.text(),/Fictional FO report/);
});
test('Replay withholds a running neighbour and exposes a retryable side, then recovers on completion',async t=>{
 const {f,read,api,source}=await fixture();f.rows.push(row(7,7,'user_message','Fictional follow-up'),row(8,10,'assistant_message','Still being written'));f.fo='running';
 const w=await replayWindow(read,'fixture-host',source);assert.ok(!w.entries.some((e:any)=>e.seqStart===8));assert.equal(w.newer,'unavailable');assert.ok(w.entries.some((e:any)=>e.seqStart===7));
 const h=await mountBridge(t,false,rpc=>{rpc['digest.read']= (p:any)=>readDigestHandler(p,api);rpc['digest.replay']= (p:any)=>readReplayHandler(p,api);},false,{},true);
 h.readOverrides.set('co:projected',o=>read('co',o));await h.refresh('co');await h.click('Replay p');assert.match(h.text(),/後段未能讀取/);assert.ok(h.find('更後的對話'));assert.ok(!h.text().includes('Still being written'));
 f.fo='idle';await h.emitTimeline('fo','turn_completed');await h.refresh('fo');assert.match(h.text(),/Still being written/);assert.match(h.text(),/沒有更後的對話/);assert.equal(h.sent.length,0);
});
test('question reader already recovers after completion with unchanged content and range',async t=>{
 const {f,read}=await fixture();f.coRows=[row(1,1,'user_message','Discuss fictional direction'),row(2,6,'assistant_message','Next: Choose fictional direction (you)')];f.co='running';
 const h=await mountBridge(t,false,undefined,false,{},true);h.readOverrides.set('co:projected',o=>read('co',o));await h.refresh('co');assert.ok(!h.find('Commander')!.textContent!.includes('Choose fictional direction'));const n=h.reads.length;
 f.co='idle';await h.emitTimeline('co','turn_completed');await h.refresh('co');assert.ok(h.reads.length>n);assert.match(h.find('Commander')!.textContent!,/Choose fictional direction/);
});

for (const change of ['epoch','range','hash']) test(`completion cannot revive a source with changed ${change}`,async t=>{
 const {f,read,api,source}=await fixture();
 const h=await mountBridge(t,false,rpc=>{rpc['digest.read']= (p:any)=>readDigestHandler(p,api);rpc['digest.replay']= (p:any)=>readReplayHandler(p,api);},false,{},true);
 h.readOverrides.set('co:projected',o=>read('co',o));await h.refresh('co');await h.click('Replay p');assert.match(h.text(),/Fictional FO report/);
 if(change==='hash')f.rows[1].item.text='Changed report';else if(change==='range'){f.rows[1].seqEnd=5;f.rows[1].sourceSeqRanges[0].endSeq=5;}else {const ref=api.agents.ref;api.agents.ref=(id:string)=>{const h=ref(id);if(id==='fo'){const fetch=h.timeline.refetch;h.timeline.refetch=async (o:any)=>({...await fetch(o),epoch:'changed'});}return h;};}
 await h.emitTimeline('fo','turn_completed');await h.refresh('fo');assert.match(h.text(),/來源不可用/);assert.ok(!h.text().includes('Fictional FO report'));assert.ok(!h.text().includes('Changed report'));assert.equal(h.sent.length,0);
});
test('an errored verification subscription hides stale content until explicit reconnection',async t=>{
 const {read,api}=await fixture();const h=await mountBridge(t,false,rpc=>{rpc['digest.read']= (p:any)=>readDigestHandler(p,api);},false,{},true);h.readOverrides.set('co:projected',o=>read('co',o));await h.refresh('co');assert.match(h.text(),/Verified fictional point/);
 await h.emitTimeline('fo','error');assert.ok(!h.text().includes('Verified fictional point'));assert.ok(h.find('重新核對摘要'));await h.refresh('fo');assert.ok(!h.text().includes('Verified fictional point'));await h.click('重新核對摘要');assert.match(h.text(),/Verified fictional point/);
});

test('a late Replay response cannot replace the window re-verified after completion',async t=>{
 const {read,api,source}=await fixture();let oldResolve!: (value:any)=>void;let calls=0;
 const h=await mountBridge(t,false,rpc=>{rpc['digest.read']= (p:any)=>readDigestHandler(p,api);rpc['digest.replay']= (p:any)=>++calls===1?new Promise(resolve=>{oldResolve=resolve;}):readReplayHandler(p,api);},false,{},true);
 h.readOverrides.set('co:projected',o=>read('co',o));await h.refresh('co');await h.click('Replay p');assert.equal(calls,1);
 await h.emitTimeline('fo','turn_completed');await h.refresh('fo');assert.ok(calls>1);assert.match(h.text(),/Fictional FO report/);
 const {act}=req('react');await act(async()=>oldResolve({source,entries:[{seqStart:2,seqEnd:6,timestamp:at,kind:'assistant_message',text:'STALE BEFORE COMPLETION'}],older:'end',newer:'end'}));
 assert.ok(!h.text().includes('STALE BEFORE COMPLETION'));assert.match(h.text(),/Fictional FO report/);
});
