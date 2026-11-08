import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chiefBoard, ChiefObserver } from "../server/chief";
import { BatchTracker, BATCH_MARKER, batchResponse } from "../shared/chief";
import { COORDINATOR_VERSION } from "../shared/coordinator";
import { mountBridge } from "./helpers/bridge-host.mjs";

const at = "2026-11-06T10:00:00Z";
const page = (id: string, entries: any[] = [], epoch = "epoch"): any => ({ agentId:id,epoch,projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder:false,hasNewer:false });
const entry = (seq: number, type: string, text: string): any => ({provider:"fixture",seqStart:seq,seqEnd:seq,sourceSeqRanges:[{startSeq:seq,endSeq:seq}],collapsed:[],timestamp:at,item:{type,text,...(type==="assistant_message"?{messageId:`fictional-${seq}`}:{})}});
const event = {key:"fictional-gate",version:"v1",kind:"gate" as const,title:"Fictional gate",since:at,agentId:"a",target:"fictional-gate"};
const batch = {id:"fictional-batch",events:[event],reason:"exception" as const,score:4,checkedAt:at};
const focus = {batchId:batch.id,targetKey:event.key,sentence:"Fictional gate awaits your choice."};
function chiefApi(messages: any[] = []) {
  return {agents:{list:async()=>({entries:[{agent:{id:"co",cwd:"/fictional",status:"running",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),ref:(id:string)=>({timeline:{refetch:async()=>page(id,messages)},run:async()=>assert.fail("no model may run in recovery")})}} as any;
}

test("completed two-key switch advances once only after confirmation and archive retry reuses the new chief", async t => {
  const dir=await mkdtemp(join(tmpdir(),"d5-switch-"));t.after(()=>rm(dir,{recursive:true,force:true}));
  process.env.BRIDGE_DATA_HOME=dir;
  const {ensureCoordinator,switchCoordinatorHandler}=await import("../server/coordinator");
  const agents=new Map<string,any>([["pre",{id:"pre",archivedAt:at,status:"idle",labels:{role:"comms-officer"}}],["slice",{id:"slice",status:"idle",labels:{role:"comms-officer","digest-version":"sourced-digest-v1"}}]]);
  let saved={agentId:"slice",previousAgentId:"pre"},creates=0,failArchive=true;
  const actions:string[]=[];
  const persist=async(r:any)=>{saved=r;actions.push("persist");await writeFile(join(dir,"coordinator-switch.json"),JSON.stringify(r));};await persist(saved);actions.length=0;
  const api:any={agents:{list:async()=>({entries:[...agents.values()].map(agent=>({agent}))}),ref:(id:string)=>({refresh:async()=>agents.has(id)?{agent:agents.get(id)}:null,archive:async()=>{actions.push(`archive:${id}`);if(failArchive){failArchive=false;throw Error("archive unavailable");}agents.get(id).archivedAt=at;},timeline:{refetch:async()=>page(id,[entry(1,"assistant_message","Old conversation")])}}),create:async(config:any)=>{const id=`new-${++creates}`;agents.set(id,{id,status:"idle",labels:config.labels});actions.push(`create:${id}`);return {id};}}};
  const store={read:async()=>saved,write:persist};
  assert.equal((await ensureCoordinator(api)).agentId,"slice");assert.equal(creates,0);
  await assert.rejects(switchCoordinatorHandler(api,{oldAgentId:"slice",confirm:false},store));assert.deepEqual(actions,[]);
  await assert.rejects(switchCoordinatorHandler(api,{oldAgentId:"slice",confirm:true},store),/archive unavailable/);
  assert.deepEqual(saved,{agentId:"new-1",previousAgentId:"slice"});assert.deepEqual(actions,["create:new-1","persist","archive:slice"]);
  assert.equal((await ensureCoordinator(api)).agentId,"slice");
  await switchCoordinatorHandler(api,{oldAgentId:"slice",confirm:true},store);assert.equal(creates,1);
  assert.equal((await ensureCoordinator(api)).agentId,"new-1");
  agents.get("new-1").labels["coordinator-version"]="older-version";
  await switchCoordinatorHandler(api,{oldAgentId:"new-1",confirm:true},store);
  assert.deepEqual(saved,{agentId:"new-2",previousAgentId:"new-1"});assert.equal(creates,2);
  assert.equal((await ensureCoordinator(api)).agentId,"new-2");
  assert.equal((await api.agents.ref("slice").timeline.refetch()).entries.length,1);
  await assert.rejects(switchCoordinatorHandler(api,{oldAgentId:"slice",confirm:true},store));assert.equal(creates,2);
  for(const mutate of [()=>agents.delete("new-2"),()=>{agents.get("new-2").labels.role="fo";},()=>{agents.get("new-2").labels["coordinator-version"]="legacy";agents.get("new-1").archivedAt=null;}]) {
    const backup=new Map([...agents].map(([id,a])=>[id,structuredClone(a)]));mutate();
    await assert.rejects(switchCoordinatorHandler(api,{oldAgentId:"new-1",confirm:true},store));assert.equal(creates,2);
    agents.clear();backup.forEach((a,id)=>agents.set(id,a));
  }
});

for(const labeled of [false,true])test(`server question opens its exact Board destination, including merged range and epoch changes (${labeled})`,async t=>{
 const h=await mountBridge(t,false,undefined,true);
 const a=h.agents[0];Object.assign(a,{requiresAttention:true,attentionReason:"finished",labels:{...a.labels,...(labeled?{"next-owner":"captain"}: {})}});
 const msg={...entry(7,"assistant_message","Next: Choose fictional release (you)"),seqEnd:9,sourceSeqRanges:[{startSeq:7,endSeq:9}],collapsed:["assistant_merge"]};
 let epoch="epoch";
 h.readOverrides.set("a:projected",async()=>page("a",[msg],epoch));
 const api:any={agents:{list:async({filter}:any)=>({entries:filter.labels.role==="fo"?[{agent:{...a,labels:{...a.labels,"workflow-dir":""}}}]:[]}),ref:(id:string)=>({timeline:{refetch:async()=>page(id,[msg],epoch)}})}};
 const reviews=async()=>({requests:[],checkedAt:1,error:null,nextCheckAt:null});
 const first=await chiefBoard(api,reviews);const key=first.events[0].key;
 assert.deepEqual(JSON.parse(JSON.parse(key)[2]),["fixture","message","fictional-7"]);
 const state:any={agentId:"co",total:"1",phase:"calling",batch:{...batch,id:"question"},focus:{batchId:"question",targetKey:key,sentence:"Choose fictional release"},entered:true,soundAttempted:true,error:null};
 h.rpc["chief.read"]=async()=>state;await h.publishAgents();await h.poll();await h.click("Bridge");await h.click("開啟幕僚長的焦點");
 assert.ok(h.find("Message A FO"),"server identity must open actual question");
 epoch="epoch-2";a.updatedAt="2026-11-06T10:01:00Z";const next=await chiefBoard(api,reviews);assert.equal(next.events[0].key,key);
 msg.item.messageId="fictional-new-message";a.updatedAt="2026-11-06T10:02:00Z";assert.notEqual((await chiefBoard(api,reviews)).events[0].key,key);
 await h.publishAgents();await h.click("Chief of staff");await h.click("開啟幕僚長的焦點");
 assert.match(h.text(),/no longer available|無法確認|已變更/i,"stale focus must explain why it cannot open");
 assert.ok(h.find("Message Chief of staff"));assert.equal(h.sent.length,0);
});

for(const fault of ["partial","throw"])test(`source ${fault} retains call/marks, healthy disappearance alone resolves it`,async()=>{
 let mode="good";const api=chiefApi();
 const observer=new ChiefObserver(async()=>{if(mode==="throw")throw Error("read failed");return {events:mode==="partial"||mode==="removed"?[]:[event],total:mode==="good"?"1":"?",complete:mode!=="partial",rows:[]};});
 await observer.read(api);await observer.publish(api,"co",batch,focus);observer.mark(batch.id,"sound");observer.mark(batch.id,"entered");
 mode=fault;let state=await observer.read(api);assert.equal(state.batch?.id,batch.id);assert.equal(state.total,"?");
 mode="good";state=await observer.read(api);assert.equal(state.phase,"calling");assert.equal(state.focus?.targetKey,event.key);assert.equal(state.entered,true);assert.equal(state.soundAttempted,true);
 mode="removed";state=await observer.read(api);assert.equal(state.phase,"quiet");
});
test("incomplete observation cannot remove pending items or replay old ones across a gap",()=>{
 const tracker=new BatchTracker(),now=Date.parse(at)+360000;
 tracker.observe([],now,true);const four=["a","b","c","d"].map(key=>({...event,key,version:key}));
 assert.ok(tracker.observe(four,now,true));
 tracker.observe([],now,false);
 assert.equal(tracker.observe(four,now,true),null,"first healthy observation after gap is baseline, not a fresh batch");
 assert.equal(tracker.observe(four,now,true),null);
});
for(const response of ["none","unrelated","matching","failed","gap"])test(`restart restores only a successful unresolved batch, never sound or models (${response})`,async()=>{
 const messages=[entry(1,"user_message",BATCH_MARKER+JSON.stringify(batch)),{...entry(2,"tool_call",""),item:{type:"tool_call",name:"mcp__fleet__prepare_batch",callId:"prep",status:"completed",error:null,detail:{type:"unknown",input:{batchId:batch.id},output:{content:[{type:"text",text:JSON.stringify({batchId:batch.id,facts:batch.events,preparation:"Supplied facts only"})}]}}}},entry(3,"assistant_message",response==="failed"?"Preparation failed":JSON.stringify(focus))];
 if(["unrelated","matching"].includes(response))messages.push(entry(4,"user_message",batchResponse(response==="matching"?batch.id:"another-batch","My answer")));
 const api=chiefApi(messages);if(response==="gap")api.agents.ref=(id:string)=>({timeline:{refetch:async()=>({...page(id,messages),gap:true})}});
 const observer=new ChiefObserver(async()=>({events:[event],total:"1",complete:true,rows:[]}));
 const state=await observer.read(api);
 assert.equal(state.phase,response==="gap"?"unknown":["matching","failed"].includes(response)?"quiet":"calling");
 if(state.phase==="calling"){assert.equal(state.focus?.targetKey,event.key);assert.equal(state.entered,true);assert.equal(state.soundAttempted,true);}
});

for(const compact of [false,true])test(`new sidebar intent wins after focus without losing draft (${compact})`,async t=>{
 const state:any={agentId:"co",total:"2",phase:"calling",batch,focus:{...focus,targetKey:'["g","/workflow-a","a","validation","brief-a"]'},entered:true,soundAttempted:true,error:null};
 const h=await mountBridge(t,compact,rpc=>{rpc["chief.read"]=async()=>state;},true);
 await h.click("Bridge");await h.type("Message Chief of staff","Fictional draft");await h.click("開啟幕僚長的焦點");assert.ok(h.find("Choose 准"));
 await new Promise(resolve=>setTimeout(resolve,2));await h.click("Bridge");
 assert.ok(h.find("Message Chief of staff"));assert.equal((h.find("Message Chief of staff") as HTMLTextAreaElement).value,"Fictional draft");
 state.focus.targetKey='["g","/workflow-b","b","validation","brief-b"]';await h.poll();await h.click("開啟幕僚長的焦點");assert.ok(h.find("Message B FO"));
 await new Promise(resolve=>setTimeout(resolve,2));await h.click("Bridge");assert.ok(h.find("Message Chief of staff"));
 await h.click("開啟幕僚長的焦點");await h.navigate({item:"queue",request:"external-queue"});
 if(compact)assert.ok(h.find("Conversation with A FO"));
 await h.navigate({item:"comms",request:"external-comms"});assert.ok(h.find("Message Chief of staff"));assert.equal(h.audio.length,0);assert.equal(h.sent.length,0);
});

test("fleet response preserves unknown-time board matters separately from trigger eligibility",async t=>{
 const Module=(await import("node:module")).default as any;
 const original=Module._load;
 const row:any={id:"a",title:"A FO",repo:"a",task:"g",workflowDir:"/fictional",status:"new reply",gates:[],permission:"",next:"",hasNextOwner:false,lastActivityAt:at,offline:false,tabClosed:false};
 const gates=[{workflowDir:"/fictional",slug:"g",title:"Known gate",stage:"validation",preparedAt:at},{workflowDir:"/fictional",slug:"unknown",title:"Unknown-time gate",stage:"validation"}];
 const review={owner:"fictional",repo:"repo",number:1,url:"https://github.com/fictional/repo/pull/1",title:"Fictional review",author:"fictional",firstSeenAt:1};
 let failed=false;
 t.mock.method(Module,"_load",function(this:any,id:string,...args:any[]){if(id==="./tasks")return {readGatesHandler:async()=>({gates,failedWorkflowDirs:failed?["/fictional"]:[]})};if(id==="./reviews")return {readReviewsHandler:async()=>({requests:[review],checkedAt:1,error:failed?"offline":null})};return original.call(this,id,...args);});
 const {createRequire}=await import("node:module");const require=createRequire(import.meta.url);const chiefPath=require.resolve("../server/chief");const fleetPath=require.resolve("../server/fleet-mcp");delete require.cache[chiefPath];delete require.cache[fleetPath];const {fleetSnapshot:read}=require("../server/fleet-mcp");
 const api:any={agents:{list:async({filter}:any)=>({entries:filter.labels.role==="fo"?[{agent:{id:"a",cwd:"/fictional",title:"A FO",status:"idle",requiresAttention:true,attentionReason:"finished",updatedAt:at,labels:{role:"fo","workflow-dir":"/fictional"}}}]:[]}),ref:(id:string)=>({timeline:{refetch:async()=>page(id,[entry(7,"assistant_message","Next: Choose fictional release (you)")])}})}};
 const result=await read(api);
 assert.equal(result.fleet[0].gates.length,2);assert.equal(result.fleet[0].status,"waiting on Kent");
 assert.equal(result.queue.length,4);assert.equal(result.events.length,2);assert.equal(result.queue.find((x:any)=>x.title==="Unknown-time gate").waitingSince,null);assert.equal(result.queue.find((x:any)=>x.kind==="review").waitingSince,null);
 failed=true;assert.equal((await read(api)).complete,false);
});
