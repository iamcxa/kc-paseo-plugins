import assert from "node:assert/strict";
import {test} from "node:test";
import {commanderReplies} from "../shared/commander-replies";
import {healthyTimeline as goodPage} from "../shared/timeline";
import {mountBridge} from "./helpers/bridge-host.mjs";
const at="2026-11-05T10:00:00Z";
const row=(start:number,end:number,type:string,text:string):any=>({seqStart:start,seqEnd:end,sourceSeqRanges:[{startSeq:start,endSeq:end}],collapsed:start===end?[]:[type==="tool_call"?"tool_lifecycle":"assistant_merge"],timestamp:at,provider:"fixture",item:{type,text}});
const page=(id:string,entries:any[],extra:any={}):any=>({agentId:id,epoch:"e",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder:false,hasNewer:false,...extra});
const ordinary=[row(1,1,"user_message","Discuss fictional direction"),row(2,6,"assistant_message","Next: Choose fictional direction (you)")];
for(const name of ["first","empty new agent","empty end","merged tool","distinct assistant entries","120 display rows"]) test(`projected ${name} is a healthy page without fabricated singleton sequences`,()=>{
 const entries=name.startsWith("empty")?[]:name==="distinct assistant entries"?[...ordinary,row(7,10,"assistant_message","A separate fictional display message")]:name==="merged tool"?[ordinary[0],row(2,6,"tool_call","tool fixture"),row(7,9,"assistant_message","Fictional reply")]:name==="120 display rows"?Array.from({length:120},(_,i)=>row(i*5+1,i*5+5,i%2?"assistant_message":"user_message","Fictional")):ordinary;
 const p=page("co",entries);assert.ok(goodPage(p,"co"));const replies=commanderReplies(p,"co");assert.ok(replies);assert.equal(replies.length,entries.length);assert.deepEqual(replies.map(e=>[e.seqStart,e.seqEnd]),entries.map(e=>[e.seqStart,e.seqEnd]));
});
for(const compact of [false,true]) test(`real-shaped merged discussion loads Chief of staff, board questions and old history (${compact})`,async t=>{
 const h=await mountBridge(t,compact,rpc=>{rpc["coordinator.open"]=async()=>({agentId:"co",previousAgentId:"old"});},false,{},true);
 h.readOverrides.set("co:projected",async()=>page("co",ordinary));h.readOverrides.set("co:canonical",async()=>page("co",ordinary));
 h.readOverrides.set("old:projected",async()=>page("old",ordinary));h.readOverrides.set("old:canonical",async()=>page("old",ordinary));await h.refresh("co");
 assert.match(h.text(),/Choose fictional direction/);assert.ok(!h.text().includes("Chief of staff timeline unavailable"));
 if(compact){await h.click("Board");assert.match(h.find("Chief of staff question")!.textContent!,/Choose fictional direction/);await h.click("Back to Chief of staff");}else assert.match(h.find("Chief of staff")!.textContent!,/Choose fictional direction/);
 await h.click("讀取舊通訊官對話");assert.match(h.container.querySelector('[role="dialog"]')!.textContent!,/Choose fictional direction/);assert.equal(h.sent.length,0);
});
test("healthy empty projected Chief of staff and question read settle without a failure",async t=>{
 const h=await mountBridge(t,false,undefined,false,{},true);h.readOverrides.set("co:projected",async()=>page("co",[]));h.readOverrides.set("co:canonical",async()=>page("co",[]));await h.refresh("co");assert.ok(!h.text().includes("Could not read"));assert.ok(!h.text().includes("Could not check the chief of staff"));
});
