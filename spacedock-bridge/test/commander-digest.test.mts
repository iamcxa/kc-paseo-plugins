import assert from "node:assert/strict";
import { test } from "node:test";
import { collectDigestHandler, readDigestHandler, readReplayHandler } from "../server/digest";
import { DIGEST_VERSION } from "../shared/coordinator";
import { reportSource } from "../server/report-sources";
const at="2026-11-05T10:00:00Z";
const entry=(seq:number,text:string,type="assistant_message"):any=>({seqStart:seq,seqEnd:seq,sourceSeqRanges:[{startSeq:seq,endSeq:seq}],collapsed:[],timestamp:at,provider:"fixture",item:{type,text}});
async function fixture(parts:number) {
  const fo=[entry(1,"before"),entry(2,"question","user_message"),entry(3,"Existing report"),entry(4,"follow-up","user_message"),entry(5,"after")];
  let entries:any[]=[];const reads:any[]=[];let corrupt=(p:any)=>p;
  const api:any={agents:{list:async()=>({entries:[{agent:{id:"fo",title:"Fixture FO",status:"idle",updatedAt:at,labels:{role:"fo"}}}]}),ref:(id:string)=>({refresh:async()=>({agent:{status:"idle",labels:{"digest-version":DIGEST_VERSION}}}),send:async()=>{},timeline:{refetch:async(o:any)=>{reads.push({id,...o});const all=id==="co"?entries:fo;const selected=o.direction==="tail"?all:all.filter(e=>o.direction==="before"?e.seqEnd<o.cursor.seq:e.seqStart>o.cursor.seq).slice(o.direction==="before"?-o.limit:0,o.direction==="before"?undefined:o.limit);const page={agentId:id,epoch:"epoch",projection:"projected",reset:false,gap:false,staleCursor:false,error:null,entries:selected,hasOlder:false,hasNewer:false};return id==="co"?corrupt(page):page;}}})}};
  const round=await collectDigestHandler({hostId:"host",agentId:"co"},api),source=reportSource("host","fo","epoch",fo[2])!;
  const data={...round,points:[{pointId:"p",sentence:"Sourced point",sources:[source],contextLines:["about","before","now"].map(kind=>({kind,sentence:kind,refs:[source]}))}]};
  const text=JSON.stringify(data);entries=[{...entry(10,text),seqEnd:9+parts,sourceSeqRanges:[{startSeq:10,endSeq:9+parts}],collapsed:parts>1?["assistant_merge"]:[]}];
  return {api,source,data,text,reads,get entries(){return entries;},set entries(v){entries=v;},set corrupt(fn:(p:any)=>any){corrupt=fn;},position:{hostId:"host",agentId:"co",epoch:"epoch",seqStart:10,seqEnd:9+parts}};
}
for(const parts of [1,2,3,120]) test(`server reads one projected entry spanning ${parts} sequences for digest and Replay`,async()=>{
 const f=await fixture(parts);const value=await readDigestHandler(f.position,f.api);assert.equal(value?.points[0].valid,true);
 assert.equal(f.reads.filter(r=>r.id==="co").at(-1).limit,120);
 assert.equal((await readReplayHandler({position:f.position,pointId:"p",source:f.source,direction:"anchor"},f.api))?.entries.length,5);
});
for(const kind of ["missing","reordered","interposed","epoch","agent","collapsed","range","gap","stale","reset","projection","first-truncated","last-truncated","oversized","reversed","wrong-round","wrong-hash","one-fragment-only"]) test(`digest interval refuses ${kind}`,async()=>{
 const f=await fixture(2);
 if(kind==="missing") f.entries.splice(0,1);
 if(kind==="reordered") f.corrupt=p=>({...p,entries:[...p.entries,entry(1,"out of order")]});
 if(kind==="interposed") f.entries[0].item.type="user_message";
 if(kind==="epoch"||kind==="agent") f.corrupt=p=>({...p,[kind==="agent"?"agentId":"epoch"]:"other"});
 if(kind==="collapsed") f.entries[0].collapsed=[{}];
 if(kind==="range") f.entries[0].sourceSeqRanges[0].endSeq++;
 if(["gap","reset","stale"].includes(kind)) f.corrupt=p=>({...p,[kind==="stale"?"staleCursor":kind]:true});
 if(kind==="projection") f.corrupt=p=>({...p,projection:"canonical"});
 if(kind==="first-truncated") f.entries[0].item.text=f.entries[0].item.text.slice(1);
 if(kind==="last-truncated") f.entries[0].item.text=f.entries[0].item.text.slice(0,-1);
 if(kind==="oversized") f.position.seqEnd=130;
 if(kind==="reversed") f.position.seqEnd=9;
 if(kind==="wrong-round"||kind==="wrong-hash") {const data=structuredClone(f.data);if(kind==="wrong-round") data.roundId="other";else data.points[0].sources[0].textHash="a".repeat(64);const text=JSON.stringify(data);f.entries=[{...entry(10,text),seqEnd:11,sourceSeqRanges:[{startSeq:10,endSeq:11}],collapsed:["assistant_merge"]}];}
 if(kind==="one-fragment-only") f.entries=[entry(10,f.text),entry(11,"TRAILING INVALID TEXT")];
 const result=await readDigestHandler(f.position,f.api);assert.ok(!result||result.points.every(p=>!p.valid));
});
