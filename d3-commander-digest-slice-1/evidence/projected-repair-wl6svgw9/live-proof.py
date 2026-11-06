import os,subprocess,json
from pathlib import Path
out=Path(__file__).resolve().parent
code=r'''
(async()=>{
 const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url');const base='/Applications/Paseo.app/Contents/Resources/app.asar/node_modules/@getpaseo/cli/dist/utils/client.js',req=createRequire(base);
 const {connectToDaemon}=await import(pathToFileURL(base).href),{resolvePaseoHome}=await import(pathToFileURL(req.resolve('@getpaseo/server/daemon-control')).href);
 const wt='/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1',preq=createRequire(wt+'/spacedock-bridge/package.json');preq('tsx/cjs');const {createPaseoApi}=await import(pathToFileURL(wt+'/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js').href);
 const {readTimeline}=preq(wt+'/spacedock-bridge/shared/timeline.ts'),{commanderReplies}=preq(wt+'/spacedock-bridge/shared/commander-replies.ts');const client=await connectToDaemon({target:{kind:'instance',home:resolvePaseoHome(process.env)}});
 try{const api=createPaseoApi(client),fo=(await api.agents.list({filter:{labels:{role:'fo'}}})).entries.find(e=>!e.agent.archivedAt)?.agent;const results=[];
 for(const [kind,prefix] of [['new','5179b1f8'],['old','bccc97d3'],['fo',fo?.id]]){if(!prefix)throw Error('No FO for proof');const a=(await client.fetchAgent({agentId:prefix})).agent;const p=await readTimeline((id,o)=>api.agents.ref(id).timeline.refetch(o),a.id,{direction:'tail',limit:120});const replies=commanderReplies(p,a.id);if(!replies)throw Error('Repaired reader refused real page');results.push({kind,prefix:a.id.slice(0,8),archived:Boolean(a.archivedAt),projection:p.projection,count:p.entries.length,ranges:p.entries.map(e=>[e.seqStart,e.seqEnd]),kinds:p.entries.reduce((m,e)=>(m[e.item.type]=(m[e.item.type]??0)+1,m),{}),loaded:true});}
 console.log('SAFE:'+JSON.stringify({readOnly:true,results}));}finally{await client.close()}
})().catch(e=>{console.log('SAFE:'+JSON.stringify({errorType:e.name,errorCode:e.code??null}));process.exitCode=1});
'''
p=subprocess.run(['/Applications/Paseo.app/Contents/Frameworks/Paseo Helper.app/Contents/MacOS/Paseo Helper','-e',code],env=dict(os.environ,ELECTRON_RUN_AS_NODE='1'),capture_output=True,text=True,timeout=60)
values=[json.loads(l[5:]) for l in p.stdout.splitlines() if l.startswith('SAFE:')]
(out/'live-proof.json').write_text(json.dumps({'exit':p.returncode,'safeOutput':values},indent=2));assert p.returncode==0
print(json.dumps({'exit':p.returncode,'pages':[{'kind':x['kind'],'count':x['count'],'loaded':x['loaded']} for x in values[0]['results']]}))
