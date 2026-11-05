import fs from 'node:fs';
import {createPaseoClient} from '/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js';
const dir=new URL('.',import.meta.url), info=JSON.parse(fs.readFileSync(new URL('runtime.json',dir))), targets=[6000,7000,8000,8500,9000,9000,10000,12000,14000,17000];
const client=createPaseoClient({url:`ws://127.0.0.1:${info.port}/ws`,connectTimeoutMs:10000,reconnect:{enabled:false}});
const manifestUrl=new URL('fleet.json',dir);const manifest=fs.existsSync(manifestUrl)?JSON.parse(fs.readFileSync(manifestUrl)):[];
const save=()=>fs.writeFileSync(manifestUrl,JSON.stringify(manifest,null,2)+'\n');
const start=Number(process.argv[2]??0),end=Number(process.argv[3]??10);
await client.connect();
try {for(let i=start;i<end;i++){
 if(manifest.some(x=>x.index===i))throw Error('Refusing duplicate seed '+i);
 const agent=await client.agents.create({config:{provider:'claude/claude-haiku-4-5',options:{allowedTools:[],settings:{permissions:{deny:['Bash','Read','Write','Edit','Grep','Glob','WebFetch','WebSearch','Agent','Task','mcp__paseo__*']}}},systemPrompt:'Produce fictional project status reports only. Never use tools, read files or refer to any real person, project or conversation. Follow the requested output length.'},cwd:info.cwd,title:`Fictional FO ${String(i+1).padStart(2,'0')}`,labels:{role:'fo',repo:`fictional-project-${i+1}`}});
 const row={index:i,agentId:agent.id,title:`Fictional FO ${String(i+1).padStart(2,'0')}`,targetBytes:targets[i]??0,provider:'claude/claude-haiku-4-5'};manifest.push(row);save();
 const events=[];const sub=agent.timeline.subscribe(e=>{events.push(e);fs.writeFileSync(new URL(`seed-${i+1}-events.json`,dir),JSON.stringify(events,null,2));});await sub.ready;
 try {if(i<10){
 const prompt=`Write a fictional status report for Project Lantern ${i+1}, a pretend community-library appointment pilot. Use plain ASCII English only. Target ${targets[i]} characters (approximately ${Math.round(targets[i]/6)} words). Write 10 dated report entries in chronological order, with about ${Math.round(targets[i]/10)} characters per entry. Describe concrete fictional scope, earlier testing, a discovered cancellation-flow gap, its repair, evidence limitations, and a pending Captain decision about a pretend internal trial. Keep all names and facts fictional. State what would happen if the trial is postponed. Include mundane test details to reach the requested length. Output the complete report, not a summary. Do not use tools or add setup commentary.`;
 row.seedPrompt=prompt;save();
 const result=await agent.run(prompt,{timeoutMs:480000});row.result=result;
 } else {await agent.refresh();}
 const timeline=await agent.timeline.refetch({limit:200});fs.writeFileSync(new URL(`seed-${i+1}-timeline.json`,dir),JSON.stringify(timeline,null,2));
 await agent.refresh();row.snapshot=agent.current();row.eventCount=events.length;save();
 console.log(JSON.stringify({index:i,id:agent.id,status:agent.status,eventCount:events.length,error:agent.lastError??null}));
 if(agent.lastError)throw Error('Seed provider failed: '+agent.lastError);
 }finally{await sub();}
 }}finally{await client.close();}
