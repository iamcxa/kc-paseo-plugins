import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createPaseoClient} from '/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js';
const dir=new URL('.',import.meta.url),runtime=JSON.parse(fs.readFileSync(new URL('runtime.json',dir))),prompt=fs.readFileSync(new URL('prompt.txt',dir),'utf8');
const configs=[{key:'haiku-off',provider:'claude/claude-haiku-5-5',thinking:'off'},{key:'haiku-low',provider:'claude/claude-haiku-5-5',thinking:'low'},{key:'terra-low',provider:'codex/gpt-6.1-terra',thinking:'low'}];
const client=createPaseoClient({url:`ws://127.0.0.1:${runtime.port}/ws`,connectTimeoutMs:10000,reconnect:{enabled:false}});await client.connect();
const start=Number(process.argv[2]??0),end=Number(process.argv[3]??9);
try{for(let index=start;index<end;index++){
 const config=configs[index%3],repeat=Math.floor(index/3)+1,id=`${String(index+1).padStart(2,'0')}-${config.key}-${repeat}`;
 for(let attempt=1;attempt<=2;attempt++){
 const filename=`${id}-attempt-${attempt}`,resultUrl=new URL(filename+'-run.json',dir);if(fs.existsSync(resultUrl))throw Error('Refusing duplicate attempt '+filename);
 const record={id,index,repeat,attempt,config,createdAt:new Date().toISOString(),cachePolicy:'Default provider caching; no explicit warmup; fresh agent and one user message per attempt',inputFile:'prompt.txt'};
 const save=()=>fs.writeFileSync(resultUrl,JSON.stringify(record,null,2)+'\n');save();
 const options=config.provider.startsWith('claude/')?{allowedTools:[],settings:{permissions:{deny:['Bash','Read','Write','Edit','NotebookEdit','Grep','Glob','WebFetch','WebSearch','Agent','Task','mcp__paseo__*']}}}:{approval_policy:'never',sandbox_mode:'read-only',web_search:'disabled'};
 let sub;let phase='create';try{
 const createStart=performance.now();const agent=await client.agents.create({config:{provider:config.provider,thinkingOptionId:config.thinking,options},cwd:runtime.cwd,title:`Fictional focus ${id} attempt ${attempt}`,labels:{experiment:'d4-latency',configuration:config.key,repeat:String(repeat)}});record.createMs=performance.now()-createStart;record.agentId=agent.id;record.initialSnapshot=agent.current();save();
 const eventUrl=new URL(filename+'-events.jsonl',dir);fs.writeFileSync(eventUrl,'',{flag:'wx'});let sendStart=null;
 sub=agent.timeline.subscribe(event=>{const receivedAt=new Date().toISOString(),elapsed=sendStart===null?null:performance.now()-sendStart;fs.appendFileSync(eventUrl,JSON.stringify({receivedAt,elapsedSinceSendMs:elapsed,...event})+'\n');const item=event.event?.item;if(sendStart!==null&&record.firstAssistantTextMs===undefined&&event.event?.type==='timeline'&&item?.type==='assistant_message'&&typeof item.text==='string'&&item.text.trim()){record.firstAssistantTextMs=elapsed;record.firstAssistantServerTimestamp=event.timestamp;record.firstAssistantText=item.text;save();}});
 const subscribeStart=performance.now();await sub.ready;record.subscribeMs=performance.now()-subscribeStart;record.startedAt=new Date().toISOString();phase='turn';save();sendStart=performance.now();
 record.result=await agent.run(prompt,{timeoutMs:180000});record.wallMs=performance.now()-sendStart;record.completedAt=new Date().toISOString();await agent.refresh();record.finalSnapshot=agent.current();record.status=agent.status;record.lastError=agent.lastError;save();
 const timeline=await agent.timeline.refetch({limit:200});fs.writeFileSync(new URL(filename+'-timeline.json',dir),JSON.stringify(timeline,null,2)+'\n');
 const answer=timeline.entries.filter(e=>e.item.type==='assistant_message').map(e=>e.item.text).join('\n\n');fs.writeFileSync(new URL(filename+'-answer.txt',dir),answer+'\n');record.answer=answer;record.toolCalls=timeline.entries.filter(e=>e.item.type==='tool_call').map(e=>({name:e.item.name,status:e.item.status}));record.success=agent.status==='idle'&&!agent.lastError;save();
 }catch(error){record.error=String(error);record.errorPhase=phase;record.success=false;save();}finally{if(sub)await sub();}
 const error=String(record.lastError??record.error??'');record.environmentFailure=!record.success&&/capacity|overload|503|502|timed out|timeout|connection|transport|rate.?limit|429|temporar/i.test(error);record.authenticationFailure=/not logged|unauthorized|authentication|credential|login|401/i.test(error);save();
 console.log(JSON.stringify({id,attempt,success:record.success,wallMs:record.wallMs,firstAssistantTextMs:record.firstAssistantTextMs,error:error||null}));
 if(record.authenticationFailure)throw Error('Provider authentication failed; no credential workaround permitted');
 if(record.success||!record.environmentFailure||attempt===2)break;
 }
}}finally{await client.close();}
