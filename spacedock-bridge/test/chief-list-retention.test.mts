import assert from "node:assert/strict";
import {test} from "node:test";
import {ChiefObserver} from "../server/chief";
import {readCommanderConversation} from "../shared/commander-replies";
import {BATCH_MARKER,batchResponse,type ChiefBatch,type ChiefEvent} from "../shared/chief";
import {COORDINATOR_VERSION} from "../shared/coordinator";
const at="2026-11-09T10:00:00Z";
const event=(key:string):ChiefEvent=>({key,version:key,kind:"gate",title:`Fictional ${key}`,waiter:"Fictional FO",since:"2000-01-01T00:00:00Z",agentId:`fo-${key}`,target:key});
const a=event("a"),b=event("b"),c=event("c");
const batch=(id:string,events:ChiefEvent[]):ChiefBatch=>({id,events,outputMode:"list",reason:"exception",score:4*events.length,checkedAt:at});
const A=batch("A",[a]),B=batch("B",[a,b]),C=batch("C",[a,b,c]);
const row=(type:string,fields:any,turnId?:string):any=>({seqStart:0,seqEnd:0,sourceSeqRanges:[],collapsed:[],timestamp:at,turnId,item:{type,...fields}});
const request=(x:ChiefBatch)=>row("user_message",{text:BATCH_MARKER+JSON.stringify(x)},`turn-${x.id}`);
const prep=(x:ChiefBatch,status="completed")=>row("tool_call",{name:"mcp__fleet__prepare_batch",status,callId:`prep-${x.id}`,error:null,detail:{type:"unknown",input:{batchId:x.id},output:{batchId:x.id,facts:x.events,preparation:"Fictional facts"}}},`turn-${x.id}`);
const output=(x:ChiefBatch)=>row("assistant_message",{text:x.events.map(e=>`${e.title}; recommend hold pending evidence`).join("\n")},`turn-${x.id}`);
const failure=(x:ChiefBatch,turn=`turn-${x.id}`)=>row("error",{message:"Fictional failure"},turn);
const success=(x:ChiefBatch)=>[request(x),prep(x),output(x)];
const ordered=(rows:any[])=>rows.map((e,i)=>({...e,seqStart:i+1,seqEnd:i+1,sourceSeqRanges:[{startSeq:i+1,endSeq:i+1}]}));
const page=(id:string,rows:any[],hasOlder=false):any=>({agentId:id,epoch:"fictional",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries:rows,hasOlder,hasNewer:false});
const peer=row("user_message",{text:'<paseo-system version="1" kind="agent-message" source-agent-id="peer" source-agent-title="Peer">全照建議</paseo-system>'},"peer");
const cases:[string,any[],string[]][]=[
 ["request only",[...success(A),request(B)],["A"]],
 ["failed preparation",[...success(A),request(B),prep(B,"failed")],["A"]],
 ["canceled preparation",[...success(A),request(B),prep(B,"canceled")],["A"]],
 ["prose before preparation",[...success(A),request(B),output(B)],["A"]],
 ["successful covering replacement",[...success(A),...success(B)],["B"]],
 ["same-turn error after prose",[...success(A),...success(B),failure(B)],["A"]],
 ["failed preparation after prose",[...success(A),...success(B),prep(B,"failed")],["A"]],
 ["canceled preparation after prose",[...success(A),...success(B),prep(B,"canceled")],["A"]],
 ["turn identity conflict after prose",[...success(A),...success(B),{...output(B),turnId:"wrong"}],["A"]],
 ["unrelated error",[...success(A),...success(B),failure(B,"other")],["B"]],
 ["real response before late failure",[...success(A),...success(B),row("user_message",{text:"全照建議"},"captain"),failure(B)],[]],
 ["peer envelope before late failure",[...success(A),...success(B),peer,failure(B)],["A"]],
 ["failed third list retains the second",[...success(A),...success(B),...success(C),failure(C)],["B"]],
 ["subset cannot supersede uncovered items",[...success(A),...success(batch("subset",[b]))],["A","subset"]],
 ["answered original never resurrects",[...success(A),row("user_message",{text:batchResponse("A","我的回覆")},"captain"),...success(B),failure(B)],[]],
];
for(const [name,rows,want] of cases)for(const split of [false,true])test(`retained list ${name}, multipage=${split}`,async()=>{
 const entries=ordered(rows),read=async(id:string,o:any)=>!split?page(id,entries):o.direction==="before"?page(id,entries.slice(0,3)):page(id,entries.slice(3),true);
 const result=await readCommanderConversation(read,"co");assert.deepEqual(result.unresolved.map(x=>x.batch.id),want);
});
function harness(rows:any[],initial:ChiefEvent[]){
 const entries=ordered(rows),requests:ChiefBatch[]=[];let events=initial;
 const api:any={agents:{list:async()=>({entries:[{agent:{id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),ref:(id:string)=>({status:"idle",lastError:null,timeline:{refetch:async()=>page(id,entries)},run:async(text:string)=>{
  const input=JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);requests.push(input);
  const appended=ordered([...entries,request(input),prep(input),output(input),failure(input)]);entries.splice(0,entries.length,...appended);
  throw Error("Fictional provider port failure; no model");
 }})}};
 return {api,entries,requests,setEvents(value:ChiefEvent[]){events=value;},observer:()=>new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}))};
}
for(const fault of ["pending","failed","uncertain"] as const)test(`restart retains the last published list and all admitted items after ${fault} replacement`,async()=>{
 const rows=[...success(A),request(B),...(fault==="pending"?[]:[prep(B),output(B),fault==="failed"?failure(B):{...output(B),turnId:"wrong"}])];
 const h=harness(rows,[a,b]),observer=h.observer();assert.equal((await observer.read(h.api)).batch?.id,"A");
 await observer.read(h.api);assert.equal(h.requests.length,0,"failed/unchanged B must not retry");
 h.setEvents([a,b,c]);await observer.read(h.api);await new Promise(setImmediate);
 assert.deepEqual(h.requests[0].events.map(e=>e.key),["a","b","c"]);
});
test("a live failed replacement restores the prior list and keeps admitted items for a later trigger",async()=>{
 const h=harness(success(A),[a]),observer=h.observer();await observer.read(h.api);
 h.setEvents([a,b]);await observer.read(h.api);await new Promise(setImmediate);
 assert.equal(observer.state.batch?.id,"A");assert.equal(observer.state.phase,"calling");
 await observer.receive(h.api,"co");assert.equal(observer.state.batch?.id,"A");await observer.read(h.api);assert.equal(h.requests.length,1);
 h.setEvents([a,b,c]);await observer.read(h.api);await new Promise(setImmediate);assert.deepEqual(h.requests[1].events.map(e=>e.key),["a","b","c"]);
});
test("a delayed published-turn failure restores the prior list through the owning receive hook",async()=>{
 const h=harness([...success(A),...success(B)],[a,b]),observer=h.observer();assert.equal((await observer.read(h.api)).batch?.id,"B");
 h.entries.push(...ordered([...h.entries,failure(B)]).slice(h.entries.length));await observer.receive(h.api,"co");
 assert.equal(observer.state.batch?.id,"A");assert.equal(observer.state.phase,"calling");assert.equal(h.requests.length,0);
});
test("publication rejects a subset of a still-waiting unanswered list",async()=>{
 const h=harness(success(A),[a,b]),observer=h.observer();await observer.read(h.api);
 const subset=batch("subset",[b]);await assert.rejects(observer.publish(h.api,"co",subset,{batchId:subset.id,targetKey:"b",sentence:"Fictional B only"}),/unanswered|cover|omit/i);
 assert.equal(observer.state.batch?.id,"A");
});
test("a real response covers predecessor lists and clears their carry even if the replacement later fails",async()=>{
 const entries=ordered([...success(A),...success(B),row("user_message",{text:"全照建議"},"captain"),failure(B)]);
 const result=await readCommanderConversation(async id=>page(id,entries),"co");assert.deepEqual(result.unresolved,[]);assert.deepEqual((result as any).outstanding??[],[]);
 const h=harness(entries,[a,b]),observer=h.observer();await observer.read(h.api);h.setEvents([a,b,c]);await observer.read(h.api);await new Promise(setImmediate);assert.deepEqual(h.requests[0].events.map(e=>e.key),["c"]);
});
test("authoritative removal prunes carried items before an independent trigger",async()=>{
 const h=harness([...success(A),request(B),prep(B,"failed")],[a,b]),observer=h.observer();await observer.read(h.api);
 h.setEvents([b,c]);await observer.read(h.api);await new Promise(setImmediate);assert.deepEqual(h.requests[0].events.map(e=>e.key),["b","c"]);
});

test("a response to the retained list cancels a pending replacement without reintroducing answered items",async()=>{
 const h=harness(success(A),[a]),observer=h.observer();await observer.read(h.api);
 const original=h.api.agents.ref;let release!:()=>void,started!:()=>void;
 const ready=new Promise<void>(r=>{started=r;}),wait=new Promise<void>(r=>{release=r;});
 h.api.agents.ref=(id:string)=>({...original(id),run:async(text:string)=>{const input=JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);h.requests.push(input);h.entries.splice(0,h.entries.length,...ordered([...h.entries,request(input)]));started();await wait;throw Error("Late fictional failure");}});
 h.setEvents([a,b]);await observer.read(h.api);await ready;
 h.entries.splice(0,h.entries.length,...ordered([...h.entries,row("user_message",{text:"全照建議"},"captain")]));
 await observer.receive(h.api,"co");assert.equal(observer.state.phase,"quiet");release();await new Promise(setImmediate);assert.equal(observer.state.phase,"quiet");
 h.api.agents.ref=original;h.setEvents([a,b,c]);await observer.read(h.api);await new Promise(setImmediate);assert.deepEqual(h.requests[1].events.map(e=>e.key),["b","c"]);
});
test("an incomplete source cannot discard the retained list or run a replacement",async()=>{
 const h=harness([...success(A),request(B),prep(B,"failed")],[a,b]);let complete=true;
 const observer=new ChiefObserver(async()=>({events:complete?[a,b]:[],total:complete?"2":"?",complete,rows:[]}));
 await observer.read(h.api);complete=false;await observer.read(h.api);assert.equal(observer.state.batch?.id,"A");assert.equal(observer.state.total,"?");assert.equal(h.requests.length,0);
 complete=true;await observer.read(h.api);assert.equal(observer.state.batch?.id,"A");assert.equal(h.requests.length,0);
});
test("a new officer never inherits the previous officer's unanswered carry",async()=>{
 const h=harness([...success(A),request(B),prep(B,"failed")],[a,b]),observer=h.observer();await observer.read(h.api);
 h.api.agents.list=async()=>({entries:[]});await observer.read(h.api);assert.equal(observer.state.agentId,null);
 const original=h.api.agents.ref;
 h.api.agents.list=async()=>({entries:[{agent:{id:"co-2",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]});
 h.api.agents.ref=(id:string)=>({...original(id),timeline:{refetch:async()=>page(id,[])}});
 await observer.read(h.api);h.setEvents([a,b,c]);await observer.read(h.api);await new Promise(setImmediate);assert.deepEqual(h.requests[0].events.map(e=>e.key),["c"]);
});

test("a delayed failure of the retained turn cannot be resurrected by a failing pending replacement",async()=>{
 const h=harness(success(A),[a]),observer=h.observer();await observer.read(h.api);
 const original=h.api.agents.ref;let release!:()=>void,started!:()=>void;
 const ready=new Promise<void>(r=>{started=r;}),wait=new Promise<void>(r=>{release=r;});
 h.api.agents.ref=(id:string)=>({...original(id),run:async(text:string)=>{const input=JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);h.entries.splice(0,h.entries.length,...ordered([...h.entries,request(input)]));started();await wait;throw Error("Fictional replacement failure");}});
 h.setEvents([a,b]);await observer.read(h.api);await ready;
 h.entries.splice(0,h.entries.length,...ordered([...h.entries,failure(A)]));await observer.receive(h.api,"co");release();await new Promise(setImmediate);
 assert.equal(observer.state.phase,"failed");assert.notEqual(observer.state.batch?.id,"A");
});

for(const change of ["new officer","failed replacement"] as const)test(`an older receive read cannot overwrite carry after ${change}`,async()=>{
 const h=harness(success(A),[a]),observer=h.observer();await observer.read(h.api);
 const original=h.api.agents.ref,oldEntries=[...h.entries];let release!:(value:any)=>void,started!:()=>void;let pause=true;
 const ready=new Promise<void>(r=>{started=r;});
 h.api.agents.ref=(id:string)=>({...original(id),timeline:{refetch:async()=>{if(id==="co"&&pause){pause=false;started();return new Promise(r=>{release=r;});}return page(id,id==="co-2"?[]:h.entries);}}});
 const pending=observer.receive(h.api,"co");await ready;
 if(change==="new officer")h.api.agents.list=async()=>({entries:[{agent:{id:"co-2",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]});
 h.setEvents([a,b]);await observer.read(h.api);await new Promise(setImmediate);
 release(page("co",oldEntries));await pending;
 h.setEvents([a,b,c]);await observer.read(h.api);await new Promise(setImmediate);
 assert.deepEqual(h.requests.at(-1)!.events.map(e=>e.key),change==="new officer"?["c"]:["a","b","c"]);
});
