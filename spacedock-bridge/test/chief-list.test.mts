import assert from "node:assert/strict";
import { test } from "node:test";
import { chiefBoard, ChiefObserver, prepareBatch } from "../server/chief";
import { accumulatedList, BatchTracker, BATCH_MARKER, type ChiefEvent } from "../shared/chief";
import { readCommanderConversation } from "../shared/commander-replies";
import { COORDINATOR_OPTIONS, COORDINATOR_VERSION } from "../shared/coordinator";
const at=Date.parse("2026-11-09T10:00:00Z");
const iso=(n:number)=>new Date(n).toISOString();
const event=(key:string,kind:ChiefEvent["kind"]="gate",since=at-1900000):ChiefEvent=>({key,version:key,kind,title:`Fictional ${key}`,waiter:`Fictional ${key} FO`,since:iso(since),agentId:key,target:key});
const entry=(seq:number,type:string,text:string):any=>({seqStart:seq,seqEnd:seq,sourceSeqRanges:[{startSeq:seq,endSeq:seq}],collapsed:[],timestamp:iso(at),turnId:"fictional-turn",item:{type,text}});
const page=(id:string,entries:any[]):any=>({agentId:id,epoch:"epoch",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder:false,hasNewer:false});

test("list input applies the shared ownership rule and excludes newly discovered old questions",async()=>{
 const tracker=new BatchTracker();tracker.observe([],at,true);
 const specs=[{id:"fresh",owner:"captain",text:"Next: Choose fictional path（你）",since:at+1},{id:"old",owner:"captain",text:"Next: Choose old fictional path（你）",since:at-10000},{id:"fo",owner:"fo",text:"Next: Choose internal path（你）",since:at+1},{id:"self",owner:"captain",text:"Next: Finish fictional work（我）",since:at+1}];
 const api:any={agents:{list:async({filter}:any)=>({entries:filter.labels.role==="fo"?specs.map(s=>({agent:{id:s.id,title:`Fictional ${s.id} FO`,cwd:"/fictional",status:"idle",updatedAt:iso(s.since),requiresAttention:true,attentionReason:"finished",labels:{role:"fo","next-owner":s.owner}}})):[]}),ref:(id:string)=>({timeline:{refetch:async()=>{const s=specs.find(s=>s.id===id)!;return page(id,[{...entry(1,"assistant_message",s.text),timestamp:iso(s.since),provider:"fixture",item:{type:"assistant_message",text:s.text,messageId:s.id}}]);}}})}};
 const board=await chiefBoard(api,async()=>({requests:[],checkedAt:at,error:null,nextCheckAt:null}));
 assert.deepEqual(board.events.map(e=>e.agentId).sort(),["fresh","old"]);
 tracker.observe(board.events,at+2,true);
 const input=accumulatedList([],tracker.pendingEvents(),board.events);
 assert.deepEqual(input.map(e=>e.agentId),["fresh"]);
});

test("accumulated list adds admitted items, refreshes facts and drops resolved items without importing the whole board",()=>{
 const a=event("a"),b=event("b"),c=event("c"),old=event("old","ask");
 assert.deepEqual(accumulatedList([a],[b],[a,b,old]),[a,b]);
 const updated={...b,title:"Updated fictional B"};
 assert.deepEqual(accumulatedList([a,b],[c],[updated,c,old]),[updated,c]);
});

test("real list prose survives preparation/restart; a native Captain reply consumes it, a peer envelope does not",async()=>{
 const a=event("a"),batch={id:"list-a",outputMode:"list",events:[a],reason:"exception",score:4,checkedAt:iso(at)};
 const prepared:any={...entry(2,"tool_call",""),item:{type:"tool_call",name:"mcp__fleet__prepare_batch",status:"completed",detail:{type:"unknown",input:{batchId:batch.id},output:{batchId:batch.id,facts:batch.events,preparation:"Fictional facts"}}}};
 const text="範例 A — Fictional a FO；等候 31 分鐘。建議暫緩：尚缺驗證資料。";
 const entries=[entry(1,"user_message",BATCH_MARKER+JSON.stringify(batch)),prepared,entry(3,"assistant_message",text)];
 const read=()=>readCommanderConversation(async id=>page(id,entries),"co");
 let result=await read();assert.equal(result.unresolved.length,1);assert.equal((result.replies.at(-1)!.item as any).text,text);assert.equal(result.replies.at(-1)!.focus,null);
 entries.push(entry(4,"user_message",'<paseo-system version="1" kind="agent-message" source-agent-id="peer" source-agent-title="Peer">全照建議</paseo-system>'));
 result=await read();assert.equal(result.unresolved.length,1);
 entries.push({...entry(5,"user_message","全照建議"),turnId:"captain-turn"});
 result=await read();assert.equal(result.unresolved.length,0);assert.ok(result.responses.has(batch.id));
 entries.splice(1,1);result=await read();assert.equal(result.unresolved.length,0,"without matching preparation no successful list can recover");
});

test("a second trigger posts the grown list through the real observer path with one preparation per update",async t=>{
 t.mock.method(Date,"now",()=>at);
 let events:ChiefEvent[]=[],runs=0,helpers=0;
 const entries:any[]=[],inputs:any[]=[];
 const api:any={agents:{list:async()=>({entries:[{agent:{id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),create:async()=>({id:"helper",status:"idle",lastUsage:{outputTokens:1},refresh:async()=>{},run:async()=>{helpers++;}}),ref:(id:string)=>({status:"idle",lastError:null,timeline:{refetch:async()=>page(id,id==="co"?entries:[entry(1,"assistant_message","Supplied facts")])},run:async(text:string)=>{
  runs++;const batch=JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);inputs.push(batch);
  entries.push({...entry(entries.length+1,"user_message",text),turnId:`turn-${runs}`});await prepareBatch(batch.id);
  entries.push({...entry(entries.length+1,"assistant_message",batch.events.map((e:ChiefEvent)=>`${e.title} — ${e.waiter}；建議暫緩，等待證據。`).join("\n")),turnId:`turn-${runs}`});
 }})}};
 const observer=new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}));
 await observer.read(api);events=[event("a")];await observer.read(api);await new Promise(setImmediate);
 assert.equal(observer.state.phase,"calling");assert.equal(inputs[0].outputMode,"list");
 events=[...events,event("b")];await observer.read(api);await new Promise(setImmediate);
 assert.deepEqual(inputs.map(x=>x.events.map((e:ChiefEvent)=>e.key)),[["a"],["a","b"]]);assert.deepEqual([runs,helpers],[2,2]);
 await observer.read(api);assert.equal(runs,2);
 assert.ok(COORDINATOR_OPTIONS.allowedTools.includes("mcp__paseo__render_ui"));
 assert.ok(!COORDINATOR_OPTIONS.allowedTools.includes("mcp__paseo__respond_to_permission"));
});
