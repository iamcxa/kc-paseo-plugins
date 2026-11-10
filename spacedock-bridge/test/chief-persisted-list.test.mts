process.env.BRIDGE_CHIEF_AUTOCALL = "on";
import assert from "node:assert/strict";
import fs from "node:fs";
import {test} from "node:test";
import {ChiefObserver,prepareBatch} from "../server/chief";
import {readCommanderConversation} from "../shared/commander-replies";
import {BATCH_MARKER,batchResponse,type ChiefBatch,type ChiefEvent} from "../shared/chief";
import {COORDINATOR_VERSION} from "../shared/coordinator";
const native=JSON.parse(fs.readFileSync(new URL("./fixtures/chief-native-list.json",import.meta.url),"utf8"));
const event=(key:string):ChiefEvent=>({key,version:key,kind:"gate",title:`Fictional ${key}`,waiter:"FO",since:"2000-01-01T00:00:00Z",agentId:`fo-${key}`,target:key});
const a=event("a"),b=event("b"),c=event("c");
const batch=(id:string,events:ChiefEvent[]):ChiefBatch=>({id,events,outputMode:"list",reason:"exception",score:4*events.length,checkedAt:"2026-11-09T10:00:00Z"});
const A=batch("A",[a,b]),B=batch("B",[b]);
const row=(type:string,data:any,turnId?:string):any=>({item:{type,...data},turnId,timestamp:"2026-11-09T10:00:00Z",collapsed:[]});
const prepared=(x:ChiefBatch)=>row("tool_call",{name:"mcp__fleet__prepare_batch",callId:`prep-${x.id}`,status:"completed",error:null,detail:{type:"unknown",input:{batchId:x.id},output:{batchId:x.id,facts:x.events,preparation:"Fictional facts"}}},`batch-${x.id}`);
const success=(x:ChiefBatch)=>[row("user_message",{text:BATCH_MARKER+JSON.stringify(x)},`batch-${x.id}`),prepared(x),row("assistant_message",{text:"Fictional list"},`batch-${x.id}`)];
const ordered=(rows:any[])=>rows.map((r,i)=>({...r,seqStart:i+1,seqEnd:i+1,sourceSeqRanges:[{startSeq:i+1,endSeq:i+1}]}));
const page=(id:string,rows:any[],hasOlder=false):any=>({agentId:id,epoch:"fictional",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,hasOlder,hasNewer:false,entries:rows});
const reader=(rows:any[],split=false)=>async(id:string,o:any)=>page(id,!split?ordered(rows):o.direction==="before"?ordered(rows).slice(0,3):ordered(rows).slice(3),split&&o.direction!=="before");
function port(rows:()=>any[],id="co",read?:any){
 const requests:ChiefBatch[]=[];
 const api:any={agents:{list:async()=>({entries:[{agent:{id,cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),ref:(agentId:string)=>({status:"idle",lastError:null,timeline:{refetch:read?((options:any)=>read(agentId,options)):(async()=>page(agentId,ordered(rows())))},run:async(text:string)=>{requests.push(JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]));throw Error("No real model in regression");}})}};
 return {api,requests};
}
const peer=(kind:string)=>kind.startsWith("native")?row("tool_call",{name:"agent_message",callId:"peer",status:"completed",error:null,detail:{type:"plain_text",text:"Peer data"},agentMessage:{event:kind==="native message"?"message":"finished",sender:{id:"peer",title:"Peer"},text:batchResponse("A","全照建議")}},"peer-turn"):row("user_message",{text:`<paseo-system version="1" kind="${kind}" source-agent-id="peer" source-agent-title="Peer">${batchResponse("A","全照建議")}</paseo-system>`},"peer-turn");
for(const kind of ["agent-message","agent-notification","native message","native finished"])for(const split of [false,true])test(`peer-owned ${kind} acknowledgement cannot invalidate a published list, split=${split}`,async()=>{
 const rows=[...success(A),peer(kind),row("assistant_message",{text:"Acknowledged peer. Next: await peer evidence（我）"},"peer-turn")];
 const result=await readCommanderConversation(reader(rows,split),"co");assert.deepEqual(result.unresolved.map(x=>x.batch.id),["A"]);assert.equal(result.uncertain.size,0);assert.equal(result.responses.size,0);assert.equal(result.replies.at(-1)?.batchId,null);assert.notEqual(result.replies.at(-1)?.provenance,"ordinary");
 const h=port(()=>rows,"co",reader(rows,split)),o=new ChiefObserver(async()=>({events:[a,b],total:"2",complete:true,rows:[]}));assert.equal((await o.read(h.api)).phase,"calling");await o.receive(h.api,"co");assert.equal(o.state.batch?.id,"A");assert.equal(h.requests.length,0);
});
for(const kind of ["agent-message","native message"])test(`peer-owned ${kind} preparation and quoted response cannot affect batch proof`,async()=>{
 const poison=prepared(batch("wrong",[c]));poison.turnId="peer-turn";poison.item.status="failed";
 const rows=[...success(A),peer(kind),poison,row("user_message",{text:batchResponse("A","全照建議")},"peer-turn"),row("assistant_message",{text:"Peer acknowledgement"},"peer-turn")];
 const x=await readCommanderConversation(reader(rows),"co");assert.deepEqual(x.unresolved.map(v=>v.batch.id),["A"]);assert.equal(x.failed.size,0);assert.equal(x.responses.size,0);
});
test("an interleaved peer turn cannot erase a legitimate in-flight batch result or mask its late failure",async()=>{
 const rows=[...success(A).slice(0,2),peer("native finished"),row("assistant_message",{text:"Peer acknowledgement"},"peer-turn"),success(A)[2]];
 let x=await readCommanderConversation(reader(rows),"co");assert.deepEqual(x.unresolved.map(v=>v.batch.id),["A"]);
 rows.push(row("error",{message:"Real batch failed"},"batch-A"));x=await readCommanderConversation(reader(rows),"co");assert.equal(x.unresolved.length,0);assert(x.failed.has("A"));
});
for(const reply of ["全照建議",batchResponse("B","全照建議")])for(const split of [false,true])test(`resolved predecessor and answered successor never resurrect on restart, explicit=${reply.startsWith("[")}, split=${split}`,async()=>{
 let rows=[...success(A),...success(B)];const h=port(()=>rows,"co",async(id:string,o:any)=>reader(rows,split)(id,o));let events=[b];
 const observer=()=>new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}));const live=observer();assert.equal((await live.read(h.api)).batch?.id,"B");rows.push(row("user_message",{text:reply},"captain"));await live.receive(h.api,"co");assert.equal(live.state.phase,"quiet");
 const fold=await readCommanderConversation(reader(rows,split),"co",{events,complete:true} as any);assert.deepEqual(fold.unresolved,[]);assert.deepEqual(fold.outstanding,[]);assert(fold.responses.has("A"));
 const restarted=observer();assert.equal((await restarted.read(h.api)).phase,"quiet");await restarted.read(h.api);assert.equal(h.requests.length,0);events=[b,c];await restarted.read(h.api);await new Promise(setImmediate);assert.deepEqual(h.requests[0].events.map(v=>v.key),["c"]);
});
for(const complete of [false,true])test(`subset cannot retire a still-current unanswered predecessor, complete=${complete}`,async()=>{
 const x=await readCommanderConversation(reader([...success(A),...success(B)]),"co",{events:[a,b],complete} as any);assert.deepEqual(x.unresolved.map(v=>v.batch.id),["A","B"]);
});
test("incomplete source cannot infer that a missing predecessor obligation was resolved",async()=>{
 const x=await readCommanderConversation(reader([...success(A),...success(B),row("user_message",{text:"全照建議"},"captain")]),"co",{events:[b],complete:false} as any);assert.deepEqual(x.unresolved.map(v=>v.batch.id),["A"]);assert.deepEqual(x.outstanding.map(v=>v.key),["a"]);
});
for(const shape of ["native","direct","string","content"])test(`persisted preparation ${shape} proves the same list without a live shortcut`,async()=>{
 const p=structuredClone(native),tool=p.entries.find((x:any)=>x.item.name==="mcp__fleet__prepare_batch").item,payload=tool.detail.output.output;
 if(shape==="direct")tool.detail.output=payload;if(shape==="string")tool.detail.output=JSON.stringify(payload);if(shape==="content")tool.detail.output={content:[{type:"text",text:JSON.stringify(payload)}]};
 const read=async()=>p,x=await readCommanderConversation(read,p.agentId);assert.equal(x.unresolved.length,1);assert.equal(x.uncertain.size,0);
 const h=port(()=>[],p.agentId,read),o=new ChiefObserver(async()=>({events:x.attempts[0].events,total:"4",complete:true,rows:[]}));assert.equal((await o.read(h.api)).phase,"calling");await o.receive(h.api,p.agentId);assert.equal(o.state.phase,"calling");assert.equal(h.requests.length,0);
});
for(const defect of ["outer error","inner error","wrong batch","wrong facts","empty preparation","failed","canceled","duplicate","late error","wrong turn"])test(`native persisted preparation holds on ${defect}`,async()=>{
 const p=structuredClone(native),entry=p.entries.find((x:any)=>x.item.name==="mcp__fleet__prepare_batch"),tool=entry.item;
 if(defect==="outer error")tool.detail.output.isError=true;if(defect==="inner error")tool.detail.output.output.isError=true;if(defect==="wrong batch")tool.detail.output.output.batchId="wrong";if(defect==="wrong facts")tool.detail.output.output.facts=[];if(defect==="empty preparation")tool.detail.output.output.preparation=" ";if(["failed","canceled"].includes(defect))tool.status=defect;if(defect==="wrong turn")entry.turnId="wrong";
 if(defect==="duplicate")p.entries.push(structuredClone(entry));if(defect==="late error")p.entries.push({...structuredClone(entry),item:{type:"error",message:"Late provider failure"}});
 delete p.window;p.entries=ordered(p.entries);const x=await readCommanderConversation(async()=>p,p.agentId);assert.equal(x.unresolved.length,0);assert(x.failed.size+x.uncertain.size>0);
});
test("turn-ended receive before analyze returns cannot terminalize a valid native preparation",async()=>{
 let events:ChiefEvent[]=[],rows:any[]=[],observer:ChiefObserver,helpers=0;
 const h=port(()=>rows);h.api.agents.create=async()=>({id:"helper",status:"idle",lastError:null,lastUsage:{outputTokens:1},refresh:async()=>{},run:async()=>{helpers++;}});
 h.api.agents.ref=(id:string)=>({status:"idle",lastError:null,timeline:{refetch:async()=>page(id,ordered(id==="helper"?[row("assistant_message",{text:"Fictional facts"})]:rows))},run:async(text:string)=>{
  const x=JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);rows.push(row("user_message",{text},"batch-native"));const result=await prepareBatch(x.id);const tool=prepared(x);tool.turnId="batch-native";tool.item.detail.output={output:result};rows.push(tool,row("assistant_message",{text:"Fictional complete list"},"batch-native"));await observer.receive(h.api,"co");assert.equal(observer.state.phase,"preparing");
 }});
 observer=new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}));await observer.read(h.api);events=[a];await observer.read(h.api);await new Promise(setImmediate);assert.equal(observer.state.phase,"calling");assert.equal(helpers,1);
});
