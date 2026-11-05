import fs from 'node:fs';
import {createPaseoClient} from '/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js';
const dir=new URL('.',import.meta.url);const info=JSON.parse(fs.readFileSync(new URL('runtime.json',dir)));
const client=createPaseoClient({url:`ws://127.0.0.1:${info.port}/ws`,connectTimeoutMs:10000,reconnect:{enabled:false}});
try {await client.connect();const models=await client.providers.listModels('claude',{cwd:info.cwd});fs.writeFileSync(new URL('models.json',dir),JSON.stringify(models,null,2)); console.log(JSON.stringify({connected:true,modelCount:models.models?.length,models:Object.keys(models)}));} catch(error){console.log(JSON.stringify({error:String(error)}));process.exitCode=1;} finally {await client.close();}
