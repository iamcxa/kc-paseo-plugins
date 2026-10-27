import { readFileSync } from "node:fs"; import { join } from "node:path";
const root = join(process.argv[2], "project-env");
const { createSecrets } = await import(join(root, "server/secrets.ts")); const { makeWorld } = await import(join(root, "test/world.ts"));
const items = Array.from({length:40},(_,i)=>({id:`i${i}`,title:`Item ${i}`,category:"SECURE_NOTE",fields:[{label:`K${i}`}]}));
const world = makeWorld({keychain:{"sa-a":"a"},op:{accounts:{a:{items}},callDelayMs:100,fail:{"item get i0":{stderr:"[ERROR] 401 Authentication: invalid service account token"}}}});
try { await createSecrets(world.tools).listRefs("sa-a","Dev"); } catch(e){ console.log("threw:", e.message); }
const g = readFileSync(join(world.dir,"calls.jsonl"),"utf8").split("\n").filter(Boolean).map(JSON.parse).filter(c=>c.tool==="op"&&c.argv[1]==="get").length;
console.log(process.argv[3], "gets started:", g); world.cleanup();
