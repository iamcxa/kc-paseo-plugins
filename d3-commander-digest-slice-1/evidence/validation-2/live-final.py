from pathlib import Path
import subprocess,os,json
out=Path(__file__).parent
code=r'''
let stage='connection';
(async()=>{
 const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url');
 const base='/Applications/Paseo.app/Contents/Resources/app.asar/node_modules/@getpaseo/cli/dist/utils/client.js',req=createRequire(base);
 const {connectToDaemon}=await import(pathToFileURL(base).href),{resolvePaseoHome}=await import(pathToFileURL(req.resolve('@getpaseo/server/daemon-control')).href);
 const wt='/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1',preq=createRequire(wt+'/spacedock-bridge/package.json');preq('tsx/cjs');
 const {createPaseoApi}=await import(pathToFileURL(wt+'/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js').href);
 const {readTimeline,healthyTimeline,displayEntry}=preq(wt+'/spacedock-bridge/shared/timeline.ts'),{commanderReplies}=preq(wt+'/spacedock-bridge/shared/commander-replies.ts');
 const client=await connectToDaemon({target:{kind:'instance',home:resolvePaseoHome(process.env)}});let api;
 try {
  api=createPaseoApi(client);stage='inventory';
  const officers=(await api.agents.list({filter:{labels:{role:'comms-officer'}}})).entries.map(e=>e.agent);
  const fos=(await api.agents.list({filter:{labels:{role:'fo'}}})).entries.map(e=>e.agent);
  const current=officers.find(a=>!a.archivedAt&&a.id.startsWith('5179b1f8'))??officers.find(a=>!a.archivedAt);
  const fo=fos.find(a=>!a.archivedAt);const results=[];
  for(const [kind,prefix] of [['current',current?.id],['previous','bccc97d3'],['fo',fo?.id]]){
   stage=kind;let page;let agent;
   try {
    if(!prefix)throw Error('Unavailable');
    agent=(await client.fetchAgent({agentId:prefix})).agent;
    page=await readTimeline(async(id,o)=>{page=await api.agents.ref(id).timeline.refetch(o);return page;},agent.id,{direction:'tail',limit:120});
    if(!commanderReplies(page,agent.id))throw Error('Refused');
    results.push({kind,count:page.entries.length,ranges:page.entries.map(e=>[e.seqStart,e.seqEnd]),loaded:true});
   } catch {
    results.push({kind,count:page?.entries?.length??0,ranges:page?.entries?.map(e=>[e.seqStart,e.seqEnd])??[],loaded:false});
   }
  }
  console.log('SAFE:'+JSON.stringify({readOnly:true,results}));
 } finally {await api?.dispose();await client.close();}
})().catch(()=>{console.log('SAFE:'+JSON.stringify({kind:stage,count:0,ranges:[],loaded:false}));process.exitCode=1;});
'''
p=subprocess.run(['/Applications/Paseo.app/Contents/Frameworks/Paseo Helper.app/Contents/MacOS/Paseo Helper','-e',code],env=dict(os.environ,ELECTRON_RUN_AS_NODE='1'),text=True,capture_output=True,timeout=60)
safe=[json.loads(line[5:]) for line in p.stdout.splitlines() if line.startswith('SAFE:')]
(out/'live-final.json').write_text(json.dumps({'exit':p.returncode,'safeOutput':safe},indent=2))
print(json.dumps({'exit':p.returncode,'outcomes':[{k:v for k,v in r.items() if k!='ranges'} for r in safe[0].get('results',[safe[0]])]}))
