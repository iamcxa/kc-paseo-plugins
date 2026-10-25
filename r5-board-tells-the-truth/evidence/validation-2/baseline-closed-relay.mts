import { createPaseoClient } from "/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js";
import { readGateBriefingHandler } from "/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth/spacedock-bridge/server/gate.ts";
import { findOpenAttempt } from "/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth/spacedock-bridge/shared/gate.ts";
import { readFile } from "node:fs/promises";
import { parse } from "/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth/spacedock-bridge/node_modules/yaml/dist/index.js";
const client = createPaseoClient({url: "ws://127.0.0.1:6767/ws", reconnect: {enabled:false}});
try {
 await client.connect();
 const {entries} = await client.agents.list({filter:{labels:{role:"fo"}}});
 const relay = entries.map(e=>e.agent).find(a => a.labels?.["workflow-dir"]?.includes("subspace-relay"));
 if (!relay) throw Error("No relay FO with workflow directory");
 const workflowDir=relay.labels!["workflow-dir"];
 const readme=await readFile(workflowDir+"/README.md","utf8");
 const fm=(s:string)=>{const m=/^---\n([\s\S]*?)\n---/.exec(s);return m?parse(m[1]):null;};
 const {resolve}=await import("node:path");
 const {readdir}=await import("node:fs/promises");
 const state=resolve(workflowDir,fm(readme).state??".spacedock-state");
 let found=false;
 for(const file of await readdir(state)) {
  if(!file.endsWith(".md"))continue;
  const entity=fm(await readFile(state+"/"+file,"utf8"));
  for(const record of entity?.gates?.records??[]) {
   if(findOpenAttempt(entity,record.stage))continue;
   const a=record.attempts?.findLast((a:any)=>a.resolution);
   if(!a)continue;
   const input={workflowDir,slug:file.slice(0,-3),stage:record.stage};
   const without=await readGateBriefingHandler(input);
   const withId=await readGateBriefingHandler({...input,briefingId:a.briefing.id});
   if (!without.recorded || without.error || without.briefing) throw Error("Closed no-ID gate did not return a clean record");
   console.log(JSON.stringify({workflowDir,slug:input.slug,stage:record.stage,withoutId:{briefing:without.briefing,recorded:!!without.recorded,error:without.error},withId:{recorded:!!withId.recorded,error:withId.error}}));
   found=true;break;
  }
  if(found)break;
 }
 if(!found)throw Error("No closed relay gate found");
}finally{await client.close();}
