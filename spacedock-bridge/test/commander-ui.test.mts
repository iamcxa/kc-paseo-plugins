import assert from "node:assert/strict";
import {test} from "node:test";
import {mountBridge} from "./helpers/bridge-host.mjs";
const entry=(seq:number,type:string,text:string)=>({seqStart:seq,seqEnd:seq,timestamp:"2026-11-05T10:00:00Z",item:{type,text}});
const collect=entry(1,"user_message","[Bridge plugin, automated — not the Captain]\nCollect now.");
const rejected="UNVERIFIED BODY\nNext: False collection question (you)";
const source={hostId:"fixture-host",agentId:"a",epoch:"epoch",seqStart:3,seqEnd:3,timestamp:"2026-11-05T10:00:00Z",textHash:"a".repeat(64)};
const point={pointId:"split",sentence:"One sourced point",sources:[source],contextLines:["about","before","now"].map(kind=>({kind,sentence:kind,refs:[source]}))};
for(const parts of [2,3]) test(`client groups ${parts} fragments: a server-only join cannot render one digest and Replay`,async t=>{
 const positions:any[]=[];const h=await mountBridge(t,true,rpc=>{rpc["digest.read"]=async(p:any)=>{positions.push(p);return p.seqStart===2&&p.seqEnd===1+parts?{roundId:"r",collectedAt:source.timestamp,points:[{valid:true,point}]}:null;};rpc["digest.replay"]=async(p:any)=>{assert.deepEqual([p.position.seqStart,p.position.seqEnd],[2,1+parts]);return {source,entries:[{seqStart:3,seqEnd:3,timestamp:source.timestamp,kind:"assistant_message",text:"Exact original"}],older:"end",newer:"end"};};},false,{},true);
 const text=JSON.stringify({roundId:"r",collectedAt:source.timestamp,points:[point]});h.timeline.set("co",[collect,...Array.from({length:parts},(_,i)=>entry(i+2,"assistant_message",text.slice(Math.floor(i*text.length/parts),Math.floor((i+1)*text.length/parts))))]);await h.refresh("co");
 assert.equal(positions.length,1);assert.ok(h.find("Replay split"));await h.click("Replay split");assert.match(h.text(),/Exact original/);
});
for(const format of ["prose","structured"]) for(const compact of [false,true]) for(const notice of ["none","agent-message","agent-notification","automated","unknown"]) test(`no rejected collection ${format} question in ${compact?"compact board views":"desktop card and header"} after ${notice}`,async t=>{
 const h=await mountBridge(t,compact,rpc=>{rpc["digest.read"]=async()=>null;},false,{},true);
 const mid=notice.startsWith("agent-")?[entry(2,"user_message",`<paseo-system kind="${notice}" source-agent-id="fo">Notice</paseo-system>`)]:notice==="automated"?[entry(2,"user_message","[Bridge plugin, automated — not the Captain] Review notice")]:[];
 h.timeline.set("co",[...(notice==="unknown"?[]:[collect]),...mid,entry(mid.length?3:notice==="unknown"?3:2,"assistant_message",format==="structured"?'{"roundId":"wrong"}\nNext: False collection question (you)':rejected)]);await h.refresh("co");
 assert.ok(!h.text().includes("False collection question"));assert.ok(!h.text().includes("UNVERIFIED BODY"));
 if(compact){await h.click("Board");assert.equal(h.find("Comms officer question"),undefined);await h.click("By FO");assert.equal(h.find("Comms officer question"),undefined);}else assert.ok(!h.find("Commander")!.textContent!.includes("False collection question"));
 assert.equal(h.sent.length,0);
});
for(const event of ["initial","retry","reload"]) test(`sidebar-only ${event} excludes collection badge, count, label and popover target but retains real gates`,async t=>{
 const h=await mountBridge(t,true,undefined,true,{},true);
 h.timeline.set("co",[collect,entry(2,"assistant_message",rejected)]);await h.refresh("co");
 if(event==="retry"){h.readFailures.add("co:canonical");h.readFailures.add("co:projected");await h.refresh("co");await h.click("Waiting items: sources incomplete");h.readFailures.clear();await h.click("Check waiting sources again");}
 if(event==="reload"){await h.emitTimeline("co","turn_completed");await h.refresh("co");}
 assert.ok(h.find("2 gates and questions waiting for you"));assert.equal(h.find("3 gates and questions waiting for you"),undefined);assert.equal(h.screens.length,0);
 await h.click("2 gates and questions waiting for you");assert.match(h.text(),/Questions · 0/);assert.equal(h.find("Open False collection question (you)"),undefined);assert.ok(!h.text().includes("False collection question"));
});
for(const missing of ["previous officer","host"]) test(`${missing} cannot fall through to ordinary collection rendering`,async t=>{
 const h=await mountBridge(t,true,rpc=>{rpc["coordinator.open"]=async()=>({agentId:"co",previousAgentId:"old"});rpc["digest.read"]=async()=>null;},false,{},true,missing!=="host");
 h.timeline.set(missing==="host"?"co":"old",[collect,entry(2,"assistant_message",rejected)]);
 if(missing==="host") await h.refresh("co");else await h.click("讀取舊通訊官對話");
 assert.ok(!h.text().includes("UNVERIFIED BODY"));assert.ok(!h.text().includes("False collection question"));
 assert.match(h.text(),missing==="host"?/Could not read/:/摘要無法驗證/);
});
test("known Captain discussion joins ordinary chunks and keeps genuine questions and Markdown/JSON",async t=>{
 const h=await mountBridge(t,true,undefined,false,{},true);
 h.timeline.set("co",[entry(1,"user_message","Discuss examples"),entry(2,"assistant_message",'[Design](https://example.invalid) {"count":3}\nNext: Choose '),entry(3,"assistant_message","the direction (you)")]);await h.refresh("co");
 assert.match(h.text(),/Choose the direction \(you\)/);assert.match(h.text(),/\{"count":3\}/);await h.click("Board");assert.match(h.find("Comms officer question")!.textContent!,/Choose the direction/);
});

for(const fault of ["agent","epoch","gap","reset","stale","collapsed","sequence","projection"]) test(`Commander render and question reads refuse canonical ${fault} corruption`,async t=>{
 const h=await mountBridge(t,false,undefined,false,{},true);
 const entries=[entry(1,"user_message","Discuss this"),entry(2,"assistant_message","Next: False collection question (you)")].map(e=>({...e,collapsed:[],sourceSeqRanges:[{startSeq:e.seqStart,endSeq:e.seqEnd}]}));
 const page:any={agentId:"co",epoch:"epoch",projection:"canonical",reset:false,gap:false,staleCursor:false,error:null,entries};
 if(fault==="agent")page.agentId="other";if(fault==="epoch")page.epoch="";if(fault==="projection")page.projection="projected";
 if(["gap","reset","stale"].includes(fault))page[fault==="stale"?"staleCursor":fault]=true;
 if(fault==="collapsed")page.entries[1].collapsed=[{}];if(fault==="sequence")page.entries[1].seqStart=3;
 h.readOverrides.set("co:canonical",async()=>page);h.readOverrides.set("co:projected",async()=>page);await h.refresh("co");
 assert.ok(!h.text().includes("False collection question"));assert.match(h.text(),/Could not read/);
});
for(const recovery of ["retry","reload"]) test(`active Commander ${recovery} cannot publish a new rejected collection over an ordinary question`,async t=>{
 const h=await mountBridge(t,false,rpc=>{rpc["digest.read"]=async()=>null;},false,{},true);
 h.timeline.set("co",[entry(1,"user_message","Discuss this"),entry(2,"assistant_message","Next: Genuine earlier question (you)")]);await h.refresh("co");assert.match(h.find("Commander")!.textContent!,/Genuine earlier question/);
 h.timeline.set("co",[collect,entry(2,"assistant_message",rejected)]);
 if(recovery==="retry"){h.readFailures.add("co:canonical");h.readFailures.add("co:projected");await h.refresh("co");h.readFailures.clear();await h.click("Retry conversation with Comms officer");}
 else {await h.emitTimeline("co","turn_completed");await h.refresh("co");}
 assert.ok(!h.text().includes("False collection question"));assert.ok(!h.text().includes("Genuine earlier question"));assert.match(h.text(),/摘要無法驗證/);
});
test("known non-Captain Next lines stay ordinary and do not create questions",async t=>{
 const h=await mountBridge(t,false,undefined,false,{},true);h.timeline.set("co",[entry(1,"user_message","Discuss this"),entry(2,"assistant_message","Next: Run the check (me)")]);await h.refresh("co");assert.match(h.text(),/Run the check/);assert.ok(!h.find("Commander")!.textContent!.includes("Run the check"));
});
