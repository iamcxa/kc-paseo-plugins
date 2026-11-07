import assert from "node:assert/strict";
import {test} from "node:test";
import {act} from "react";
import {mountBridge} from "./helpers/bridge-host.mjs";
import type {ChiefState} from "../shared/chief";
for(const compact of [false,true])test(`sidebar total and call survive entry without replay (${compact?360:1440})`,async t=>{
 const state:ChiefState={agentId:"co",total:"4",phase:"quiet",batch:null,focus:null,entered:false,soundAttempted:true,error:null};
 const marks:string[]=[];
 const h=await mountBridge(t,compact,rpc=>{
  rpc["chief.read"]=async()=>({...state});
  rpc["chief.mark"]=async({action}:any)=>{marks.push(action);if(action==="sound"){if(state.soundAttempted)return {accepted:false};state.soundAttempted=true;}else state.entered=true;return {accepted:true};};
 },true,{foregroundMuted:"gray",statusDanger:"red"});
 assert.ok(h.find("未結束待辦 · 4"));assert.equal(h.audio.length,0);assert.equal(h.sent.length,0);
 Object.assign(state,{phase:"calling",soundAttempted:false,batch:{id:"fictional-batch",events:[],reason:"threshold",checkedAt:"2026-11-06T00:00:00Z",score:19.5},focus:{batchId:"fictional-batch",targetKey:"gate",sentence:"範例關卡仍在等你。"}});
 await h.poll();assert.equal(h.audio.length,1);assert.equal(h.audio[0].mimeType,"audio/wav");
 assert.ok(h.find("幕僚長找你 · 4 件未結束待辦"));
 assert.equal(h.find("幕僚長找你 · 4 件未結束待辦")!.firstElementChild!.getAttribute("style")?.includes("red"),true);
 assert.ok([...h.timers.values()].some(timer=>timer.ms===300));
 await h.click("幕僚長找你 · 4 件未結束待辦");
 assert.equal(state.entered,true);assert.equal(state.total,"4");assert.equal(h.screens.at(-1).params.item,"comms");
 assert.ok(![...h.timers.values()].some(timer=>timer.ms===300));
 await h.poll();await h.render();assert.equal(h.audio.length,1);assert.equal(marks.filter(m=>m==="sound").length,1);assert.equal(h.sent.length,0);
});
test("unknown and zero are displayed as totals without model calls",async t=>{
 let total="?";
 const h=await mountBridge(t,false,rpc=>{rpc["chief.read"]=async()=>({agentId:null,total,phase:"quiet",batch:null,focus:null,entered:false,soundAttempted:true,error:null});},true);
 assert.ok(h.find("未結束待辦 · ?"));total="0";await h.poll();assert.ok(h.find("未結束待辦 · 0"));assert.equal(h.sent.length,0);
});
