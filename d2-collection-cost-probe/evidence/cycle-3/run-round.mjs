import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createPaseoClient} from '/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js';
const dir=new URL('.',import.meta.url), info=JSON.parse(fs.readFileSync(new URL('runtime.json',dir))),round=process.argv[2];if(!['probe','baseline'].includes(round))throw Error('Specify one authorized round');
const resultUrl=new URL(`${round}-run.json`,dir);if(fs.existsSync(resultUrl))throw Error('Refusing duplicate round');
const c=createPaseoClient({url:`ws://127.0.0.1:${info.port}/ws`,connectTimeoutMs:10000,reconnect:{enabled:false}});
await c.connect();const record={round,provider:'claude/claude-opus-5-5',cachePolicy:'DISABLE_PROMPT_CACHING=1 on both fresh Commanders to prevent cross-round prompt-cache inheritance',createdAt:new Date().toISOString()};const save=()=>fs.writeFileSync(resultUrl,JSON.stringify(record,null,2));save();
try{const a=await c.agents.create({config:{provider:record.provider,systemPrompt:fs.readFileSync(new URL('coordinator-system-prompt.txt',dir),'utf8'),options:JSON.parse(fs.readFileSync(new URL('coordinator-options.json',dir)))},cwd:info.cwd,title:`Fictional Commander ${round}`,env:{DISABLE_PROMPT_CACHING:'1'},labels:{role:'comms-officer',experiment:round}});record.agentId=a.id;record.initialSnapshot=a.current();save();
const eventsUrl=new URL(`${round}-events.jsonl`,dir);fs.writeFileSync(eventsUrl,'',{flag:'wx'});const sub=a.timeline.subscribe(e=>fs.appendFileSync(eventsUrl,JSON.stringify(e)+'\n'));await sub.ready;
try{record.prompt=round==='probe'?fs.readFileSync(new URL('../probe-prompt.md',dir),'utf8'):"What is the fleet's status?";record.startedAt=new Date().toISOString();save();const start=performance.now();record.result=await a.run(record.prompt,{timeoutMs:600000});record.wallMs=performance.now()-start;record.completedAt=new Date().toISOString();await a.refresh();record.finalSnapshot=a.current();save();const t=await a.timeline.refetch({limit:200});fs.writeFileSync(new URL(`${round}-timeline.json`,dir),JSON.stringify(t,null,2));console.log(JSON.stringify({round,status:a.status,wallMs:record.wallMs,error:a.lastError,usage:a.lastUsage}));if(a.lastError)process.exitCode=1;
}finally{await sub();}
}catch(error){record.error=String(error);save();throw error;}finally{await c.close();}
