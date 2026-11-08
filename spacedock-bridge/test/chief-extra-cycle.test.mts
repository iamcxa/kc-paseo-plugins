import assert from "node:assert/strict";
import {test} from "node:test";
import {toRows,withReplies,needsQuestion,readQuestion,observeBoard} from "../shared/board";
import {buildQueue} from "../shared/queue";
import {chiefBoard,ChiefObserver,prepareBatch} from "../server/chief";
import {BatchTracker,BATCH_MARKER,batchResponse} from "../shared/chief";
import {readCommanderConversation} from "../shared/commander-replies";
import {COORDINATOR_VERSION} from "../shared/coordinator";
import {mountBridge} from "./helpers/bridge-host.mjs";
const at="2026-11-06T10:00:00Z";
const entry=(seq:number,item:any,turnId?:string):any=>({provider:"fixture",turnId,seqStart:seq,seqEnd:seq,sourceSeqRanges:[{startSeq:seq,endSeq:seq}],collapsed:[],timestamp:at,item:item.type==="assistant_message"?{messageId:`fictional-${seq}`,...item}:item});
const page=(id:string,entries:any[],hasOlder=false):any=>({agentId:id,epoch:"fixture",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder,hasNewer:false});
const fo=(id:string,owner?:string):any=>({id,title:`Fictional ${id}`,cwd:"/fictional",status:"idle",updatedAt:at,requiresAttention:true,attentionReason:"finished",labels:{role:"fo",...(owner?{"next-owner":owner}:{})}});
const reviews=async()=>({requests:[],checkedAt:1,error:null,nextCheckAt:null});
const event={key:"fictional-gate",version:"v1",kind:"gate" as const,title:"Fictional gate",since:at,agentId:"fo",target:"fictional-gate"};
const batch={id:"fictional-batch",events:[event],reason:"exception" as const,score:4,checkedAt:at};
const focus={batchId:batch.id,targetKey:event.key,sentence:"Fictional successful focus"};
const prep=(seq=2,id=batch.id,events:any[]=batch.events,turnId?:string):any=>entry(seq,{type:"tool_call",callId:`prep-${seq}`,name:"mcp__fleet__prepare_batch",status:"completed",error:null,detail:{type:"unknown",input:{batchId:id},output:{content:[{type:"text",text:JSON.stringify({batchId:id,facts:events,preparation:"Supplied facts only"})}]}}},turnId);
const apiFor=(read:(id:string,options:any)=>Promise<any>,agents:any[]=[])=>({agents:{list:async({filter}:any)=>({entries:filter.labels.role==="fo"?agents.map(agent=>({agent})):[{agent:{id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),ref:(id:string)=>({status:"idle",timeline:{refetch:(o:any)=>read(id,o)},run:async()=>assert.fail("no product model may run")})}} as any);

for(const owner of ["fo","captain",undefined,"unsupported"])for(const text of ["Next: Choose direction (you)","Next: Continue research (me)","Fictional plain question"])test(`explicit FO ownership at admission/consumption: ${owner??"absent"}, ${text}`,async()=>{
 const agent=fo("a",owner),api=apiFor(async id=>page(id,id==="co"?[]:[entry(1,{type:"assistant_message",text})]),[agent]);
 const expected=!text.includes("(me)")&&(owner==="captain"||!owner&&text.includes("(you)"));const row=toRows([agent])[0];
 const fact=await (readQuestion as any)(api,"a",owner);
 assert.equal(fact.onCaptain,expected);assert.equal(needsQuestion(row),owner!=="fo"&&owner!=="unsupported");
 const stale={preview:"Choose direction (you)",onCaptain:true,messageId:"fixture:1:1",since:at};
 const effective=owner==="fo"||owner==="unsupported"?stale:fact;
 const projected=withReplies([row],{a:effective});if(owner==="fo"||owner==="unsupported")assert.equal(projected[0].status,"new reply");
 const queued=buildQueue(projected,[],projected,{a:owner==="fo"||owner==="unsupported"?stale:fact});assert.equal(queued.filter(x=>x.kind==="ask").length,Number(expected));
 const result=await chiefBoard(api,reviews);assert.equal(result.total,expected?"1":"0");assert.equal(result.events.length,expected?1:0);
});

test("four explicitly FO-owned replies never qualify; independent permissions/gates/reviews remain",async()=>{
 const agents=[1,2,3,4].map(n=>fo(`a${n}`,"fo"));const api=apiFor(async id=>page(id,id==="co"?[]:[entry(1,{type:"assistant_message",text:"Next: Choose direction (you)"})]),agents);
 const result=await chiefBoard(api,reviews),tracker=new BatchTracker();tracker.observe([],Date.parse(at)+600000,true);assert.equal(tracker.observe(result.events,Date.parse(at)+600000,true),null);assert.equal(result.total,"0");
 const row={...toRows([agents[0]])[0],permission:"Permission: Fictional",gates:[{slug:"gate",stage:"validation",title:"Fictional gate",preparedAt:at}],next:"Continue work"};
 const review={owner:"fictional",repo:"fictional",number:1,url:"https://github.com/fictional/fictional/pull/1",title:"Review",author:"peer",firstSeenAt:1};
 assert.deepEqual(buildQueue([row],[review],[],{[row.id]:{onCaptain:true,preview:"Wrong stale ask"}}).map(x=>x.kind).sort(),["gate","permission","review"]);
});

test("observeBoard re-evaluates ownership changes without a new message/activity timestamp",async()=>{
 let listener:any;let latest:any;let reads=0;const agent=fo("a","captain");
 const api:any={agents:{list:async()=>({subscription:{subscribe:(value:any)=>{listener=value;},release(){}}}),ref:(id:string)=>({timeline:{refetch:async()=>{reads++;return page(id,[entry(1,{type:"assistant_message",text:"Next: Continue research (me)"})]);}}})}};
 const stop=await observeBoard(api,(rows,facts,state)=>{latest={rows,facts,state};});
 const publish=async()=>{listener.snapshot({entries:[{agent}]});await new Promise(setImmediate);};
 await publish();assert.equal(latest.facts.a.onCaptain,false);agent.labels["next-owner"]="fo";await publish();assert.equal(latest.state,"loaded");assert.equal(buildQueue(withReplies(latest.rows,latest.facts),[],latest.rows,latest.facts).length,0);
 delete agent.labels["next-owner"];await publish();assert.equal(latest.facts.a.onCaptain,false);assert.equal(reads,2);stop();
});

for(const scenario of ["success","error before focus","error after focus","delayed matching error","different turn error","missing id error","ordinary later error","failed preparation after focus","canceled preparation after focus","focus turn mismatch","focus after failure","response"])test(`one terminal attempt outcome across fold/restart: ${scenario}`,async()=>{
 const turn=scenario.includes("missing")||scenario==="ordinary later error"?undefined:"opus-A";
 const entries=[entry(1,{type:"user_message",text:BATCH_MARKER+JSON.stringify(batch)},turn),prep(2,batch.id,batch.events,turn)];
 if(scenario==="error before focus"||scenario==="focus after failure")entries.push(entry(3,{type:"error",message:"Fictional failed turn"},turn));
 entries.push(entry(4,{type:"assistant_message",text:JSON.stringify(focus)},scenario==="focus turn mismatch"?"different":turn));
 if(scenario==="delayed matching error"||scenario==="ordinary later error")entries.push(entry(5,{type:"user_message",text:"Unrelated ordinary discussion"},"ordinary"));
 if(["error after focus","delayed matching error","different turn error","missing id error","ordinary later error"].includes(scenario))entries.push(entry(6,{type:"error",message:"Fictional failed turn"},scenario==="different turn error"?"different":turn));
 if(scenario.includes("preparation after")){const failed=prep(6,batch.id,batch.events,turn);failed.item.status=scenario.startsWith("failed")?"failed":"canceled";entries.push(failed);}
 if(scenario==="response")entries.push(entry(7,{type:"user_message",text:batchResponse(batch.id,"Exact response")},"response"));
 const read=async(id:string,o:any)=>o.direction==="before"?page(id,entries.slice(0,2)):page(id,entries.slice(2),true);
 const folded=await readCommanderConversation(read,"co");const valid=["success","different turn error","ordinary later error","response"].includes(scenario);
 if(!valid){assert.equal(folded.unresolved.length,0);assert.equal(folded.replies.filter(x=>x.focus).length,0);}else assert.equal(folded.unresolved.length,scenario==="response"?0:1);
 const observer=new ChiefObserver(async()=>({events:[event],total:"1",complete:true,rows:[]}));const result=await observer.read(apiFor(read));assert.equal(result.phase==="calling",valid&&scenario!=="response");if(result.phase==="calling"){assert.equal(result.entered,true);assert.equal(result.soundAttempted,true);}await observer.read(apiFor(read));
});

test("terminal failure is consumed by the owning hook read and cannot be republished",async()=>{
 const entries=[entry(1,{type:"user_message",text:BATCH_MARKER+JSON.stringify(batch)},"opus-A"),prep(2,batch.id,batch.events,"opus-A"),entry(3,{type:"assistant_message",text:JSON.stringify(focus)},"opus-A")];
 const api=apiFor(async id=>page(id,entries));const observer=new ChiefObserver(async()=>({events:[event],total:"1",complete:true,rows:[]}));await observer.read(api);assert.equal(observer.state.phase,"calling");
 entries.push(entry(4,{type:"error",message:"Failed after focus"},"opus-A"));await observer.receive(api,"co");assert.notEqual(observer.state.phase,"calling");assert.equal(observer.state.focus,null);await assert.rejects(observer.publish(api,"co",batch,focus));
});

function longRead(count:number,patch:Record<number,any>={}){let reads=0;return {get reads(){return reads;},read:async(id:string,o:any)=>{reads++;const end=o.cursor?o.cursor.seq-1:count,start=Math.max(1,end-119);return page(id,Array.from({length:end-start+1},(_,i)=>{const seq=start+i;return patch[seq]??entry(seq,{type:seq===count-1?"user_message":"assistant_message",text:seq===count-1?"Ordinary Captain words":seq===count?"Next: Choose recent direction (you)":"Fictional historical output"});}),start>1);}};}
for(const count of [12000,12001])test(`bounded read retains healthy recent entries at ${count}`,async()=>{
 const source=longRead(count);const result=await readCommanderConversation(source.read,"co");assert.equal(source.reads,100);assert.equal((result as any).coverage,count===12000?"complete":"older-unavailable");assert.equal(result.replies.at(-1)?.provenance,"ordinary");assert.match((result.replies.at(-1)!.item as any).text,/Choose recent direction/);
 const board=await chiefBoard(apiFor(source.read),reviews);assert.equal(board.total,"1");assert.equal(board.complete,true);
});
for(const mode of ["known successful batch","failed batch","origin outside window","ordinary recent response"])test(`partial history lifecycle stays bounded: ${mode}`,async()=>{
 const patch:Record<number,any>={};if(mode==="origin outside window")patch[1]=entry(1,{type:"user_message",text:BATCH_MARKER+JSON.stringify(batch)},"opus-A");else patch[11997]=entry(11997,{type:"user_message",text:BATCH_MARKER+JSON.stringify(batch)},"opus-A");
 patch[11998]=prep(11998,batch.id,batch.events,"opus-A");patch[11999]=entry(11999,{type:"assistant_message",text:JSON.stringify(focus)},"opus-A");patch[12000]=entry(12000,{type:"reasoning",text:"Supplied facts only"},"opus-A");patch[12001]=mode==="failed batch"?entry(12001,{type:"error",message:"Failed"},"opus-A"):mode==="ordinary recent response"?entry(12001,{type:"user_message",text:batchResponse(batch.id,"Answer")},"reply"):entry(12001,{type:"notification",level:"info",message:"Passive update"});
 const source=longRead(12001,patch),observer=new ChiefObserver(async()=>({events:[event],total:"1",complete:true,rows:[]}));const api=apiFor(source.read);const result=await observer.read(api);assert.equal(result.phase==="calling",mode==="known successful batch");if(mode==="origin outside window")assert.equal(result.phase,"unknown");await observer.read(api);assert.equal(source.reads,100,"initial bounded recovery need not repeat a known coverage limit");
});
for(const compact of [false,true])test(`real Bridge keeps recent long conversation/question with an explicit coverage notice (${compact?360:1440})`,async t=>{
 const h=await mountBridge(t,compact,undefined,true);const source=longRead(12001);h.readOverrides.set("co:projected",(o:any)=>source.read("co",o));await h.click("Bridge");assert.match(h.text(),/Choose recent direction/);assert.match(h.text(),/較早.*對話.*上限/);assert.doesNotMatch(h.text(),/Could not read|Retry conversation/);assert.equal(h.sent.length,0);assert.equal(h.audio.length,0);
});

test("unknown truncated prefix never becomes a known chief question, and fresh events do not run a model",async()=>{
 const patch:Record<number,any>={12000:entry(12000,{type:"assistant_message",text:"Unknown earlier context"}),12001:entry(12001,{type:"assistant_message",text:"Next: Is this for you? (you)"})};const source=longRead(12001,patch),api=apiFor(source.read);
 const board=await chiefBoard(api,reviews);assert.equal(board.complete,false);assert.equal(board.total,"?");
 let events:any[]=[];const observer=new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}));await observer.read(api);events=[{...event,since:"2000-01-01T00:00:00Z"}];const result=await observer.read(api);assert.equal(result.phase,"unknown");assert.match(result.error??"",/older history|Older history/);
});
for(const defect of ["gap","epoch","nonadvancing"])test(`coverage metadata never masks ${defect} corruption`,async()=>{
 let n=0;await assert.rejects(readCommanderConversation(async id=>{n++;return {...page(id,[entry(n===1?2:1,{type:"user_message",text:"Ordinary"})],true),...(defect==="gap"?{gap:true}:defect==="epoch"?{epoch:String(n)}:n>1?{entries:[entry(2,{type:"assistant_message",text:"Wrong cursor"})]}:{})};},"co"));assert.ok(n<=2);
});

test("a failed attempt cannot hide a later independent successful batch",async()=>{
 const nextEvent={...event,key:"new-gate",version:"v2",target:"new-gate"},nextBatch={...batch,id:"batch-B",events:[nextEvent]},nextFocus={...focus,batchId:nextBatch.id,targetKey:nextEvent.key};
 const entries=[entry(1,{type:"user_message",text:BATCH_MARKER+JSON.stringify(batch)},"opus-A"),prep(2,batch.id,batch.events,"opus-A"),entry(3,{type:"assistant_message",text:JSON.stringify(focus)},"opus-A"),entry(4,{type:"error",message:"Failed A"},"opus-A"),entry(5,{type:"user_message",text:BATCH_MARKER+JSON.stringify(nextBatch)},"opus-B"),prep(6,nextBatch.id,nextBatch.events,"opus-B"),entry(7,{type:"assistant_message",text:JSON.stringify(nextFocus)},"opus-B")];
 const read=async(id:string)=>page(id,entries),result=await readCommanderConversation(read,"co");assert.deepEqual(result.unresolved.map(x=>x.batch.id),[nextBatch.id]);assert.deepEqual(result.replies.filter(x=>x.focus).map(x=>x.focus!.batchId),[nextBatch.id]);
 const observer=new ChiefObserver(async()=>({events:[event,nextEvent],total:"2",complete:true,rows:[]}));assert.equal((await observer.read(apiFor(read))).batch?.id,nextBatch.id);
});

test("live extraction rejects a persisted same-turn error even when the handle is now idle",async()=>{
 let events:any[]=[],runs=0,helpers=0;const messages:any[]=[];
 const api:any={agents:{list:async()=>({entries:[{agent:{id:"co",cwd:"/fictional",status:"idle",labels:{role:"comms-officer","coordinator-version":COORDINATOR_VERSION}}}]}),create:async()=>({id:"helper",status:"idle",lastUsage:{outputTokens:1},refresh:async()=>{},run:async()=>{helpers++;}}),ref:(id:string)=>({status:"idle",lastError:null,timeline:{refetch:async()=>page(id,id==="co"?messages:[entry(1,{type:"assistant_message",text:"Supplied facts"})])},run:async(text:string)=>{runs++;const request=JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);messages.push(entry(1,{type:"user_message",text},"opus-A"));await prepareBatch(request.id);messages.push(prep(2,request.id,request.events,"opus-A"),entry(3,{type:"assistant_message",text:JSON.stringify({...focus,batchId:request.id,targetKey:request.events[0].key})},"opus-A"),entry(4,{type:"error",message:"Failed turn retained in projection"},"opus-A"));}})}};
 const observer=new ChiefObserver(async()=>({events,total:String(events.length),complete:true,rows:[]}));await observer.read(api);events=[{...event,since:"2000-01-01T00:00:00Z"}];await observer.read(api);await new Promise(setImmediate);assert.equal(observer.state.phase,"failed");assert.equal(observer.state.focus,null);await observer.read(api);assert.deepEqual([runs,helpers],[1,1]);
});

test("a recent known response still resolves within partial history; an origin outside it does not",async()=>{
 for(const known of [false,true]){
  const patch:Record<number,any>={12000:entry(12000,{type:"reasoning",text:"Passive"}),12001:entry(12001,{type:"user_message",text:batchResponse(batch.id,"Recent answer")})};
  if(known){patch[11997]=entry(11997,{type:"user_message",text:BATCH_MARKER+JSON.stringify(batch)});patch[11998]=prep(11998);patch[11999]=entry(11999,{type:"assistant_message",text:JSON.stringify(focus)});}
  const source=longRead(12001,patch),api=apiFor(source.read),observer=new ChiefObserver(async()=>({events:[event],total:"1",complete:true,rows:[]}));await observer.publish(api,"co",batch,focus);await observer.receive(api,"co");assert.equal(observer.state.phase,known?"quiet":"calling");assert.equal(source.reads,100);
 }
});
