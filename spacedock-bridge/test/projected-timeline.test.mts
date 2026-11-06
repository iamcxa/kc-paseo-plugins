import assert from "node:assert/strict";
import { test } from "node:test";
import { commanderReplies } from "../shared/commander-replies";
import { goodPage, reportSource, readSource, replayWindow, validateDigest } from "../server/report-sources";
import { collectDigestHandler, readDigestHandler, readReplayHandler } from "../server/digest";
import { DIGEST_VERSION } from "../shared/coordinator";
import { mountBridge } from "./helpers/bridge-host.mjs";
const at="2026-11-05T10:00:00Z";
const row=(start:number,end:number,type:string,text:string):any=>({seqStart:start,seqEnd:end,sourceSeqRanges:[{startSeq:start,endSeq:end}],collapsed:start===end?[]:[type==="tool_call"?"tool_lifecycle":"assistant_merge"],timestamp:at,provider:"fixture",item:{type,text}});
const page=(id:string,entries:any[],extra:any={}):any=>({agentId:id,epoch:"e",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder:false,hasNewer:false,...extra});
const ordinary=[row(1,1,"user_message","Discuss fictional direction"),row(2,6,"assistant_message","Next: Choose fictional direction (you)")];
for(const name of ["first","empty new agent","empty end","merged tool","distinct assistant entries","120 display rows"]) test(`projected ${name} is a healthy page without fabricated singleton sequences`,()=>{
 const entries=name.startsWith("empty")?[]:name==="distinct assistant entries"?[...ordinary,row(7,10,"assistant_message","A separate fictional display message")]:name==="merged tool"?[ordinary[0],row(2,6,"tool_call","tool fixture"),row(7,9,"assistant_message","Fictional reply")]:name==="120 display rows"?Array.from({length:120},(_,i)=>row(i*5+1,i*5+5,i%2?"assistant_message":"user_message","Fictional")):ordinary;
 const p=page("co",entries);assert.ok(goodPage(p,"co"));const replies=commanderReplies(p,"co");assert.ok(replies);assert.equal(replies.length,entries.length);assert.deepEqual(replies.map(e=>[e.seqStart,e.seqEnd]),entries.map(e=>[e.seqStart,e.seqEnd]));
});
for(const compact of [false,true]) test(`real-shaped merged discussion loads Commander, board questions and old history (${compact})`,async t=>{
 const h=await mountBridge(t,compact,rpc=>{rpc["coordinator.open"]=async()=>({agentId:"co",previousAgentId:"old"});},false,{},true);
 h.readOverrides.set("co:projected",async()=>page("co",ordinary));h.readOverrides.set("co:canonical",async()=>page("co",ordinary));
 h.readOverrides.set("old:projected",async()=>page("old",ordinary));h.readOverrides.set("old:canonical",async()=>page("old",ordinary));await h.refresh("co");
 assert.match(h.text(),/Choose fictional direction/);assert.ok(!h.text().includes("Commander timeline unavailable"));
 if(compact){await h.click("Board");assert.match(h.find("Comms officer question")!.textContent!,/Choose fictional direction/);await h.click("Back to Commander");}else assert.match(h.find("Commander")!.textContent!,/Choose fictional direction/);
 await h.click("讀取舊通訊官對話");assert.match(h.container.querySelector('[role="dialog"]')!.textContent!,/Choose fictional direction/);assert.equal(h.sent.length,0);
});
test("sidebar-only projected ordinary question is counted while collection and unknown remain withheld",async t=>{
 const h=await mountBridge(t,true,undefined,true,{},true);let entries=ordinary;
 h.readOverrides.set("co:projected",async()=>page("co",entries));h.readOverrides.set("co:canonical",async()=>page("co",entries));await h.refresh("co");assert.ok(h.find("3 gates and questions waiting for you"));
 entries=[row(1,1,"user_message","[Bridge plugin, automated — not the Captain]\nCollect now."),ordinary[1]];await h.refresh("co");assert.ok(h.find("2 gates and questions waiting for you"));assert.ok(!h.text().includes("Choose fictional direction"));
 entries=[ordinary[1]];await h.refresh("co");assert.ok(h.find("2 gates and questions waiting for you"));
});
test("healthy empty projected Commander and question read settle without a failure",async t=>{
 const h=await mountBridge(t,false,undefined,false,{},true);h.readOverrides.set("co:projected",async()=>page("co",[]));h.readOverrides.set("co:canonical",async()=>page("co",[]));await h.refresh("co");assert.ok(!h.text().includes("Could not read"));assert.ok(!h.text().includes("Could not check the comms officer"));
});
test("a projected source hashes the entire merged entry and Replay pages by display entries",async()=>{
 const rows=[row(0,0,"user_message","Fictional request"),row(1,4,"assistant_message","Earlier merged report"),row(5,8,"tool_call","Merged tool"),row(9,14,"assistant_message","Full fictional report"),row(15,15,"user_message","Follow-up"),row(16,20,"assistant_message","Later merged report")];
 const calls:any[]=[];const read:any=async(id:string,o:any)=>{calls.push(o);const list=o.direction==="before"?rows.filter(e=>e.seqEnd<o.cursor.seq).slice(-o.limit):rows.filter(e=>!o.cursor||e.seqStart>o.cursor.seq).slice(0,o.limit);return page(id,list,{hasOlder:!!list.length&&list[0].seqStart>0,hasNewer:!!list.length&&list.at(-1).seqEnd<20});};
 const source=reportSource("host","fo","e",rows[3]);assert.ok(source);assert.deepEqual([source.seqStart,source.seqEnd],[9,14]);assert.equal(((await readSource(read,"host",source))?.item as any).text,"Full fictional report");
 const w=await replayWindow(read,"host",source);assert.deepEqual(w?.entries.map(e=>[e.seqStart,e.seqEnd]),[[1,4],[5,8],[9,14],[15,15],[16,20]]);assert.equal(w?.older,"more");assert.equal(w?.newer,"end");
 const older=await replayWindow(read,"host",source,"before",1);assert.deepEqual(older?.entries.map(e=>e.seqStart),[0]);assert.equal(older?.older,"end");
 const end=await replayWindow(read,"host",source,"after",20);assert.equal(end?.newer,"end");assert.deepEqual(end?.entries,[]);assert.ok(calls.every(c=>c.projection==="projected"));
 const data:any={roundId:"r",collectedAt:at,points:[{pointId:"p",sentence:"Fictional point",sources:[source],contextLines:["about","before","now"].map(kind=>({kind,sentence:kind,refs:[source]}))}]};const round={...data,hostId:"host",agentId:"co",sources:[source]};assert.equal((await validateDigest(data,round,read))?.points[0].valid,true);
 for(const changed of ["text","range"]){const bad:any=async(id:string,o:any)=>{const p=await read(id,o);p.entries=structuredClone(p.entries);const e=p.entries.find((e:any)=>e.seqStart===9);if(e){if(changed==="text")e.item.text+=" ongoing";else {e.seqEnd++;e.sourceSeqRanges[0].endSeq++;}}return p;};assert.equal(await readSource(bad,"host",source),null);assert.equal(await replayWindow(bad,"host",source),null);}
});
test("collection, full projected digest range and Replay use the same real-shaped reader",async()=>{
 const rows=[row(1,1,"user_message","Fictional request"),row(2,6,"assistant_message","Fictional FO report")];let co:any[]=[];const calls:any[]=[];
 const api:any={agents:{list:async()=>({entries:[{agent:{id:"fo",title:"Fixture FO",status:"idle",updatedAt:at,labels:{role:"fo"}}}]}),ref:(id:string)=>({refresh:async()=>({agent:{status:"idle",labels:{"digest-version":DIGEST_VERSION}}}),send:async()=>{},timeline:{refetch:async(o:any)=>{calls.push(o);const all=id==="co"?co:rows;return page(id,o.direction==="tail"?all:all.filter(e=>o.direction==="before"?e.seqEnd<o.cursor.seq:!o.cursor||e.seqStart>o.cursor.seq).slice(0,o.limit));}}})}};
 const r=await collectDigestHandler({hostId:"host",agentId:"co"},api),source=reportSource("host","fo","e",rows[1])!;assert.ok(source);
 const data={...r,points:[{pointId:"p",sentence:"Sourced fictional point",sources:[source],contextLines:["about","before","now"].map(kind=>({kind,sentence:kind,refs:[source]}))}]};co=[row(2,600,"assistant_message",JSON.stringify(data))];const position={hostId:"host",agentId:"co",epoch:"e",seqStart:2,seqEnd:600};
 assert.equal((await readDigestHandler(position,api))?.points[0].valid,true);assert.ok(await readReplayHandler({position,pointId:"p",source,direction:"anchor"},api));assert.ok(calls.every(o=>o.projection==="projected"&&o.limit<=120));
});

test("the decision relay reader retains projected user-message identity across a comms detour",async t=>{
 const h=await mountBridge(t);await h.click("Approve a? — A FO");await h.click("Choose 准");await h.click("Confirm 准 via comms officer");const claim=h.claims.get("brief-a");
 const relay=async()=>page("a",[row(1,1,"user_message",claim.decisionId),row(2,6,"assistant_message","Fictional acknowledgement")]);h.readOverrides.set("a:projected",relay);h.readOverrides.set("a:canonical",relay);
 await h.poll();await h.click("Commander");await h.click("Approve a? — A FO");assert.match(h.text(),/Relayed to A FO/);assert.equal(h.sent.length,1);
});
test("an assistant entry still being written is not an exact source",async()=>{
 const e=row(2,6,"assistant_message","Fictional unfinished report"),s=reportSource("host","fo","e",e)!;assert.ok(s);
 const read:any=async()=>page("fo",[e],{agent:{status:"running"}});assert.equal(await readSource(read,"host",s),null);assert.equal(await replayWindow(read,"host",s),null);
});
