import assert from "node:assert/strict";
import { test } from "node:test";
import { BatchTracker, eligibleBatch, BATCH_MARKER, batchResponse, type ChiefEvent } from "../shared/chief";
import { ChiefObserver, prepareBatch } from "../server/chief";
import { COORDINATOR_VERSION } from "../shared/coordinator";
import { commanderReplies } from "../shared/commander-replies";
import { readTimeline } from "../shared/timeline";

const now = Date.parse("2026-11-06T10:00:00Z");
const event = (key: string, kind: ChiefEvent["kind"] = "gate", age = 360_000): ChiefEvent => ({ key, version: key, kind, title: `Fictional ${key}`, since: new Date(now-age).toISOString(), agentId: "fo", target: key });
test("threshold needs five minutes, three further distinct matters and strictly more than eight points", () => {
  const four = [event("a"),event("b"),event("c"),event("d")];
  assert.equal(eligibleBatch(four.slice(0,3),now),null);
  assert.equal(eligibleBatch(four.map(e=>({...e,since:new Date(now-299_999).toISOString()})),now),null);
  assert.equal(eligibleBatch(four.map(e=>({...e,kind:"review"})),now),null);
  assert.equal(eligibleBatch(four,now)?.reason,"threshold");
  assert.equal(eligibleBatch([...four.slice(0,3),four[0]],now),null);
});
test("frequency counts distinct current items only and expires with the window", () => {
  const reviews=[event("a","review"),event("b","review",299_999),event("c","review",200_000),event("d","review",100_000)];
  assert.equal(eligibleBatch(reviews,now)?.score,12);
  assert.equal(eligibleBatch(reviews,now+300_001),null);
  assert.equal(eligibleBatch([reviews[0],reviews[1],reviews[1],reviews[1]],now),null);
});
test("only a confirmed gate or permission strictly over thirty minutes gets the exception", () => {
  for(const kind of ["gate","permission","ask","review"] as const) {
    assert.equal(eligibleBatch([event("a",kind,1_800_000)],now),null);
    assert.equal(eligibleBatch([event("a",kind,1_800_001)],now)?.reason,["gate","permission"].includes(kind)?"exception":undefined);
  }
  assert.equal(eligibleBatch([{...event("a"),since:""}],now),null);
  assert.equal(eligibleBatch([{...event("a"),since:new Date(now+1).toISOString()}],now),null);
});
test("unknown time is excluded without guessing; source incompleteness blocks normal batches", () => {
  const four=[event("a"),event("b"),event("c"),event("d")];
  assert.equal(eligibleBatch([...four,{...event("unknown","review"),since:""}],now)?.events.length,4);
  assert.equal(eligibleBatch(four,now,false),null);
  assert.equal(eligibleBatch([event("old","gate",1_800_001)],now,false)?.reason,"exception");
});
test("baseline, restart and duplicates are quiet; answered or removed events cannot fill X", () => {
  const tracker=new BatchTracker(),four=[event("a"),event("b"),event("c"),event("d")];
  assert.equal(tracker.observe(four,now,true),null);
  assert.equal(tracker.observe(four,now+1_000_000,true),null);
  tracker.reset(); assert.equal(tracker.observe([],now,true),null);
  assert.ok(tracker.observe(four,now,true));
  tracker.consume([four[0]]); assert.equal(tracker.observe(four,now,true),null);
  tracker.consume(four); assert.equal(tracker.observe(four,now+2_000_000,true),null);
  tracker.reset(); assert.equal(tracker.observe(four,now,true),null);
});
const entry=(seq:number,type:string,text:string):any=>({seqStart:seq,seqEnd:seq,collapsed:[],sourceSeqRanges:[{startSeq:seq,endSeq:seq}],timestamp:new Date(now).toISOString(),item:{type,text}});
const page=(id:string,entries:any[]):any=>({agentId:id,epoch:"epoch",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder:false,hasNewer:false});
test("projected reader keeps merged ranges and rejects gaps, stale cursors, wrong epochs and overlapping ranges",async()=>{
  const merged={...entry(1,"assistant_message","Complete message"),seqEnd:3,sourceSeqRanges:[{startSeq:1,endSeq:3}],collapsed:["assistant_merge"]};
  assert.equal((await readTimeline(async()=>page("co",[merged]),"co",{})).entries[0].seqEnd,3);
  for(const patch of [{gap:true},{staleCursor:true},{reset:true},{epoch:"other"},{entries:[merged,entry(2,"user_message","Overlap")]}]) {
    await assert.rejects(readTimeline(async()=>({...page("co",[merged]),...patch}),"co",{},"epoch"));
  }
});
test("automated batch and its assistant response never become a Captain question",()=>{
  const messages=[entry(1,"user_message",`${BATCH_MARKER}{}`),entry(2,"assistant_message","Next: review this (you)")];
  assert.equal(commanderReplies(page("co",messages),"co")?.at(-1)?.provenance,"automated");
});
test("one qualifying batch persists its request before one Terra pass and one Opus choice; unchanged and restarted observers run nothing",async t=>{
  t.mock.method(Date,"now",()=>now);
  let events:ChiefEvent[]=[],helperRuns=0,chiefRuns=0;
  const messages:any[]=[];
  const chief={id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}};
  const api:any={agents:{
    list:async()=>({entries:[{agent:chief}]}),
    create:async(config:any)=>{assert.equal(config.config.provider,"codex/gpt-6.1-terra");assert.equal(config.config.thinkingOptionId,"low");return {id:"helper",status:"idle",lastUsage:{outputTokens:1},refresh:async()=>{},run:async()=>{helperRuns++;assert.ok(messages[0].item.text.startsWith(BATCH_MARKER));}};},
    ref:(id:string)=>({status:"idle",lastError:null,timeline:{refetch:async()=>page(id,id==="co"?messages:[entry(1,"assistant_message","Supplied board facts only")])},run:async(text:string)=>{
      chiefRuns++;messages.push(entry(1,"user_message",text));
      const batch=JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);
      await prepareBatch(batch.id);await assert.rejects(prepareBatch(batch.id),/unused Terra pass/);
      messages.push(entry(2,"assistant_message",JSON.stringify({batchId:batch.id,targetKey:batch.events[0].key,sentence:"範例關卡仍在等你，請開啟確認。"})));
    }}),
  }};
  const board=async()=>({events,total:String(events.length),complete:true,rows:[]});
  const observer=new ChiefObserver(board);
  await observer.read(api);events=[event("a"),event("b"),event("c"),event("d")];
  await observer.read(api);await new Promise(setImmediate);
  assert.equal(observer.state.phase,"calling");assert.deepEqual([chiefRuns,helperRuns],[1,1]);
  assert.equal(observer.mark(observer.state.batch!.id,"sound").accepted,true);
  assert.equal(observer.mark(observer.state.batch!.id,"sound").accepted,false);
  observer.mark(observer.state.batch!.id,"entered");assert.equal(observer.state.total,"4");
  await observer.read(api);assert.deepEqual([chiefRuns,helperRuns],[1,1]);
  observer.responded(observer.state.batch!.id);await observer.read(api);assert.equal(observer.state.phase,"quiet");assert.deepEqual([chiefRuns,helperRuns],[1,1]);
  const restarted=new ChiefObserver(board);await restarted.read(api);await restarted.read(api);assert.deepEqual([chiefRuns,helperRuns],[1,1]);
  assert.ok(batchResponse("batch","我的回覆").includes("我的回覆"));
});

test("a provider refusal before preparation makes no call and never retries the unchanged exception",async t=>{
  t.mock.method(Date,"now",()=>now);
  let events:ChiefEvent[]=[],runs=0;
  const api:any={agents:{list:async()=>({entries:[{agent:{id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),ref:(id:string)=>({status:"idle",lastError:null,timeline:{refetch:async()=>page(id,[])},run:async()=>{runs++;}})}};
  const observer=new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}));
  await observer.read(api);events=[event("old","gate",1_800_001)];await observer.read(api);await new Promise(setImmediate);
  assert.equal(observer.state.phase,"failed");assert.equal(observer.state.focus,null);
  await observer.read(api);assert.equal(runs,1);
});
test("publishing rechecks the named source version and never substitutes another target",async()=>{
  const old=event("gate");
  const observer=new ChiefObserver(async()=>({events:[{...old,version:"changed"}],total:"1",complete:true,rows:[]}));
  await assert.rejects(observer.publish({} as any,"co",{id:"batch",events:[old],reason:"exception",score:4,checkedAt:new Date(now).toISOString()},{batchId:"batch",targetKey:old.key,sentence:"A focus"}),/no longer awaits/);
  assert.notEqual(observer.state.phase,"calling");
});
test("restart reads before the tail window to consume earlier attempted batches",async t=>{
  t.mock.method(Date,"now",()=>now);
  const four=[event("a"),event("b"),event("c"),event("d")];let events:ChiefEvent[]=[],reads=0;
  const batch={id:"old-batch",events:four,reason:"threshold",score:16,checkedAt:new Date(now).toISOString()};
  const api:any={agents:{list:async()=>({entries:[{agent:{id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),ref:(id:string)=>({timeline:{refetch:async(options:any)=>{reads++;return options.direction==="before"?page(id,[entry(1,"user_message",BATCH_MARKER+JSON.stringify(batch))]):{...page(id,[entry(200,"user_message","Ordinary chat")]),hasOlder:true};}},run:async()=>assert.fail("an old batch must not run")})}};
  const observer=new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}));
  await observer.read(api);events=four;await observer.read(api);await new Promise(setImmediate);
  assert.equal(reads,2);assert.equal(observer.state.phase,"quiet");
});
