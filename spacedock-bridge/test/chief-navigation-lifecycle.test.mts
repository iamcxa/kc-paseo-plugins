process.env.BRIDGE_CHIEF_AUTOCALL = "on";
import assert from "node:assert/strict";
import { test } from "node:test";
import { mountBridge } from "./helpers/bridge-host.mjs";
import { chiefBoard, ChiefObserver } from "../server/chief";
import { BATCH_MARKER, batchResponse } from "../shared/chief";
import { commanderReplies } from "../shared/commander-replies";
import { COORDINATOR_VERSION } from "../shared/coordinator";
const at="2026-11-06T10:00:00Z";
const event={key:'["g","/workflow-a","a","validation","brief-a"]',version:"v1",kind:"gate" as const,title:"Approve a?",since:at,agentId:"a",target:"gate"};
const batch={id:"fictional-batch",events:[event],reason:"exception" as const,score:4,checkedAt:at};
const focus={batchId:batch.id,targetKey:event.key,sentence:"Fictional focus awaits your choice."};
const state=():any=>({agentId:"co",total:"2",phase:"calling",batch,focus,entered:true,soundAttempted:true,error:null});
const entry=(seq:number,type:string,text:string):any=>({seqStart:seq,seqEnd:seq,sourceSeqRanges:[{startSeq:seq,endSeq:seq}],collapsed:[],timestamp:at,item:{type,text}});
const page=(id:string,entries:any[],hasOlder=false):any=>({agentId:id,epoch:"epoch",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder,hasNewer:false});
const envelope=(kind:string,body="Passive peer data")=>`<paseo-system version="1" kind="${kind}" source-agent-id="peer" source-agent-title="Peer">${body}</paseo-system>`;
const prepared=():any=>({...entry(2,"tool_call",""),item:{type:"tool_call",callId:"prep",name:"mcp__fleet__prepare_batch",status:"completed",error:null,detail:{type:"unknown",input:{batchId:batch.id},output:{content:[{type:"text",text:JSON.stringify({batchId:batch.id,facts:batch.events,preparation:"Supplied facts only"})}]}}}});
for(const surface of ["bridge","fleet"] as const)for(const compact of [false,true])for(const way of ["row","named"] as const)for(const kind of ["permission","gate","question","owned review","ownerless review","status"] as const)test(`semantic destination ${kind} by ${way} at ${compact?360:1440} (${surface})`,async t=>{
 const review={owner:"fictional",repo:kind==="owned review"?"a":"unowned",number:1,url:"https://github.com/fictional/repo/pull/1",title:"Fictional review",author:"peer",firstSeenAt:1};
 const h=await mountBridge(t,compact,rpc=>{rpc["reviews.read"]=async()=>({requests:kind.includes("review")?[review]:[],checkedAt:1,error:null,nextCheckAt:null});},surface==="bridge",{},false,true,undefined,surface);
 if(kind==="permission")Object.assign(h.agents[0],{requiresAttention:true,attentionReason:"permission",pendingPermissions:[{id:"permission-1",name:"Fictional permission"}]});
 if(kind==="question")Object.assign(h.agents[0],{requiresAttention:true,attentionReason:"finished",labels:{...h.agents[0].labels,"next-owner":"captain","next":"Choose fictional direction"}});
 await h.publishAgents();if(surface==="bridge"){await h.click("Bridge");await h.click("Board");}
 let key=event.key,label="Approve a? — A FO";
 if(kind==="permission"){key="p:a";label=[...h.container.querySelectorAll<HTMLElement>("[aria-label]")].map(e=>e.getAttribute("aria-label")!).find(x=>x.endsWith(" — A FO")&&!x.startsWith("Approve"))!;}
 if(kind==="question"){key=JSON.stringify(["q","a",null,null,"Choose fictional direction"]);label="Choose fictional direction — A FO";}
 if(kind.includes("review")){key=`r:${review.url}`;label=`Fictional review — ${kind==="owned review"?"A FO":"no FO"}`;}
 if(kind==="status"){key="f:a";label="Conversation with A FO";}
 if(way==="row")await h.click(label);else await h.navigate({item:key,request:`named:${kind}`});
 if(kind==="permission"){assert.deepEqual(h.opened,[{agentId:"a"}]);assert.equal(h.find("Message A FO"),undefined);await h.render();assert.equal(h.opened.length,1);}
 else if(kind==="ownerless review" && surface==="fleet"){assert.deepEqual(h.opened,[{agentId:"co"}]);}
 else if(kind==="ownerless review"){assert.ok(h.find("Message Chief of staff"));assert.match((h.find("Message Chief of staff") as HTMLTextAreaElement).value,/Who should review fictional\/unowned#1/);}
 else {assert.ok(h.find("Message A FO"),h.text());if(kind==="gate")assert.ok(h.find("Choose 准"));await h.click("Back to list");assert.ok(h.find("Conversation with A FO"));if(surface==="bridge"){if(!compact)assert.match(h.text(),/Choose an item/);await h.click(compact?"Back to Chief of staff":"Chief of staff");assert.ok(h.find("Message Chief of staff"));}}
 assert.equal(h.sent.length,0);assert.equal(h.claims.size,0);assert.equal(h.audio.length,0);
});
for(const kind of ["agent-message","agent-notification"])test(`one conversation fold preserves ${kind} across pages and restart without new runs`,async t=>{
 const messages=[entry(1,"user_message",BATCH_MARKER+JSON.stringify(batch)),prepared(),entry(3,"user_message",envelope(kind)),entry(4,"assistant_message",JSON.stringify(focus))];
 const api:any={agents:{list:async({filter}:any)=>({entries:filter.labels.role==="fo"?[]:[{agent:{id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),ref:(id:string)=>({status:"idle",timeline:{refetch:async(options:any)=>options.direction==="before"?page(id,messages.slice(0,2)):page(id,messages.slice(2),true)},run:async()=>assert.fail("recovery must run no model")})}};
 assert.equal(commanderReplies(page("co",messages),"co")?.at(-1)?.provenance,"automated");
 const counted=await chiefBoard(api,async()=>({requests:[],checkedAt:1,error:null,nextCheckAt:null}));assert.equal(counted.total,"0");assert.equal(counted.events.length,0);
 const observer=new ChiefObserver(async()=>({events:[event],total:"1",complete:true,rows:[]}));const restored=await observer.read(api);assert.equal(restored.phase,"calling");assert.equal(restored.focus?.targetKey,event.key);assert.equal(restored.entered,true);assert.equal(restored.soundAttempted,true);await observer.read(api);
 const h=await mountBridge(t,false,undefined,true);h.readOverrides.set("co:projected",api.agents.ref("co").timeline.refetch);await h.click("Bridge");assert.match(h.text(),/Fictional focus awaits your choice/);assert.doesNotMatch(h.text(),/"targetKey"/);assert.equal(h.audio.length,0);assert.equal(h.sent.length,0);
});
for(const mutation of ["no preparation","failed preparation","ordinary boundary","wrong batch","wrong target","matching response","unrelated response","quoted response","malformed response"] as const)test(`history provenance: ${mutation}`,async()=>{
 const messages=[entry(1,"user_message",BATCH_MARKER+JSON.stringify(batch)),prepared()];if(mutation==="no preparation")messages.pop();if(mutation==="failed preparation")messages[1].item.status="failed";if(mutation==="ordinary boundary")messages.push(entry(3,"user_message","Ordinary Captain words"));
 messages.push(entry(4,"assistant_message",JSON.stringify({...focus,...(mutation==="wrong batch"?{batchId:"other"}:mutation==="wrong target"?{targetKey:"other"}:{})})));
 if(mutation.includes("response"))messages.push(entry(5,"user_message",mutation==="quoted response"?envelope("agent-message",batchResponse(batch.id,"quoted")):mutation==="malformed response"?`[Bridge batch response: ${batch.id}] no newline`:batchResponse(mutation==="matching response"?batch.id:"other","Answer")));
 const api:any={agents:{list:async()=>({entries:[{agent:{id:"co",status:"running",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),ref:(id:string)=>({timeline:{refetch:async()=>page(id,messages)},run:async()=>assert.fail("no models")})}};
 const observer=new ChiefObserver(async()=>({events:[event],total:"1",complete:true,rows:[]}));const result=await observer.read(api);if(["unrelated response","quoted response","malformed response"].includes(mutation))assert.equal(result.phase,"calling");else assert.notEqual(result.phase,"calling");
});

test("the registered response hook reads only the owning chief; peer envelopes and foreign markers cannot resolve",async t=>{
 const Module=(await import("node:module")).default as any;const {createRequire}=await import("node:module");const require=createRequire(import.meta.url);const original=Module._load;
 const {chiefObserver}=require("../server/chief");const oldState=chiefObserver.state;t.after(()=>{chiefObserver.state=oldState;});
 const callbacks:Function[]=[];let closed=0;
 const restore=t.mock.method(Module,"_load",function(this:any,id:string,...args:any[]){
   if(id==="./server/fleet-mcp")return {startFleetServer:async()=>({server:{close(){closed++;}}}),rememberPaseo(){},rememberedPaseo(){}};
   if(id==="./server/reviews")return {...original.call(this,id,...args),startReviewPoller:()=>()=>{}};
   return original.call(this,id,...args);
 });
 const path=require.resolve("../index.server");delete require.cache[path];const contribute=require("../index.server").default;
 const cleanup=contribute({handle(){},before(){},on(name:string,callback:Function){if(name==="agent.turn_ended")callbacks.push(callback);}});restore.mock.restore();
 let text=batchResponse(batch.id,"Exact Captain response"),reads=0;
 const api:any={agents:{ref:(id:string)=>{assert.equal(id,"co");reads++;return {timeline:{refetch:async()=>page(id,[entry(1,"user_message",BATCH_MARKER+JSON.stringify(batch)),prepared(),entry(4,"assistant_message",JSON.stringify(focus)),entry(5,"user_message",text)])}};}}};
 t.mock.method(chiefObserver,"board",async()=>({events:[event],total:"1",complete:true,rows:[]}));
 chiefObserver.state=state();for(const callback of callbacks)await callback({agent:{id:"foreign"},timeline:[{type:"user_message",text}]},{paseo:api});assert.equal(chiefObserver.state.phase,"calling");assert.equal(reads,0);
 for(const other of [envelope("agent-message",text),envelope("agent-notification",text),"> "+text,`[Bridge batch response: ${batch.id}] no newline`]){text=other;for(const callback of callbacks)await callback({agent:{id:"co"},timeline:[]},{paseo:api});assert.equal(chiefObserver.state.phase,"calling");}
 text=batchResponse(batch.id,"Exact Captain response");for(const callback of callbacks)await callback({agent:{id:"co"},timeline:[]},{paseo:api});assert.equal(chiefObserver.state.phase,"quiet");const before=reads;for(const callback of callbacks)await callback({agent:{id:"co"},timeline:[]},{paseo:api});assert.equal(reads,before);await cleanup();assert.equal(closed,1);
});

test("an owning response during the one model-stub turn prevents late completion from resurrecting a call",async()=>{
 const {prepareBatch}=await import("../server/chief");let events:any[]=[],release!:()=>void,started!:()=>void;const ready=new Promise<void>(r=>{started=r;});const wait=new Promise<void>(r=>{release=r;});const messages:any[]=[];let runs=0,helpers=0;
 const api:any={agents:{list:async()=>({entries:[{agent:{id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),create:async()=>({id:"helper",status:"idle",lastUsage:{outputTokens:1},refresh:async()=>{},run:async()=>{helpers++;}}),ref:(id:string)=>({status:"idle",lastError:null,timeline:{refetch:async()=>page(id,id==="co"?messages:[entry(1,"assistant_message","Facts")])},run:async(text:string)=>{runs++;messages.push(entry(1,"user_message",text));const request=JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);await prepareBatch(request.id);started();await wait;messages.push(entry(5,"assistant_message",JSON.stringify({...focus,batchId:request.id,targetKey:request.events[0].key})));}})}};
 const observer=new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}));await observer.read(api);events=[{...event,since:"2000-01-01T00:00:00Z"}];await observer.read(api);await ready;
 const id=observer.state.batch!.id;messages.push(entry(4,"user_message",batchResponse(id,"Answer elsewhere")));observer.responded(id,"co");assert.equal(observer.state.phase,"quiet");release();await new Promise(setImmediate);assert.equal(observer.state.phase,"quiet");assert.equal(observer.state.focus,null);await observer.read(api);assert.deepEqual([runs,helpers],[1,1]);
});

test("named requests wait for source identity, then fail visibly instead of substituting after change",async t=>{
 const {act}=await import("react");let release!:(v:any)=>void;
 const h=await mountBridge(t,true,undefined,true);await h.click("Bridge");
 const ordinary=h.rpc["gates.read"];h.rpc["gates.read"]=()=>new Promise(resolve=>{release=resolve;});await h.pollGates();await h.navigate({item:event.key,request:"waiting"});assert.ok(h.find("Message Chief of staff"));assert.doesNotMatch(h.text(),/no longer available/);
 await act(async()=>release(await ordinary({})));assert.ok(h.find("Message A FO"));await h.click("Back to list");
 h.attempts.set("a",{briefingId:"new-attempt",stage:"validation",title:"Approve a?"});h.rpc["gates.read"]=ordinary;await h.pollGates();await h.navigate({item:event.key,request:"changed"});assert.match(h.text(),/no longer available or has changed/);assert.equal(h.find("Message A FO"),undefined);assert.equal(h.sent.length,0);assert.equal(h.claims.size,0);
});
