import os,json,subprocess,socket,tempfile,time,signal,shutil,uuid
from pathlib import Path
wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1');out=Path(__file__).resolve().parent
root=Path(tempfile.mkdtemp(prefix='.projected-daemon-',dir=wt));home=root/'home';data=root/'daemon';home.mkdir();data.mkdir();(root/'work').mkdir()
with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
assert port not in (6767,6787) and not 6860<=port<=6935
cli='/Users/kent/.local/bin/paseo';env={k:v for k,v in os.environ.items() if k in ['PATH','TMPDIR','LANG','LC_ALL','SHELL']};env.update(HOME=str(home),PASEO_HOME=str(data),PASEO_LISTEN=f'127.0.0.1:{port}',PASEO_RELAY_ENABLED='false',PASEO_WEB_UI_ENABLED='false',PASEO_SERVICE_PROXY_ENABLED='false')
process=None;pid=None;result={'port':port,'noBridgeStartup':True,'home':str(root)}
def run(args,timeout=60):
 p=subprocess.run(args,cwd=wt,env=env,capture_output=True,text=True,timeout=timeout)
 if p.returncode:raise RuntimeError('subprocess failed: '+json.dumps([json.loads(l[5:]) for l in p.stdout.splitlines() if l.startswith('SAFE:')]))
 return p.stdout
try:
 (root/'payload.json').write_text(json.dumps({'text':'Fictional projected report'}));env['PROOF_PAYLOAD']=str(root/'payload.json')
 (root/'bin').mkdir()
 fake=root/'bin/codex';fake.write_text((out/'fictional-codex.py').read_text());fake.chmod(0o755);env['PATH']=str(root/'bin')+':'+env['PATH']
 log=open(root/'daemon.log','w');process=subprocess.Popen([cli,'daemon','run','--home',str(data)],cwd=wt,env=env,stdout=log,stderr=log,start_new_session=True)
 deadline=time.monotonic()+45
 while not (data/'paseo.pid').exists():
  if process.poll() is not None or time.monotonic()>deadline:raise RuntimeError('isolated daemon unavailable')
  time.sleep(.2)
 pid=json.loads((data/'paseo.pid').read_text())['pid'];result['pid']=pid
 imported=json.loads(run([cli,'run','--provider','codex','--cwd',str(root/'work'),'--label','role=fo','--home',str(data),'--json','Fictional first request']))
 result['importKeys']=list(imported);agent=imported.get('agentId',imported.get('id'));assert agent
 for text in ['Fictional middle request','Fictional last request']:
  run([cli,'wait',agent,'--home',str(data),'--json'])
  run([cli,'send',agent,text,'--home',str(data),'--json'])
 run([cli,'wait',agent,'--home',str(data),'--json'])
 js=r'''
 (async()=>{
 const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url');const base='/Applications/Paseo.app/Contents/Resources/app.asar/node_modules/@getpaseo/cli/dist/utils/client.js',req=createRequire(base);
 const {connectToDaemon}=await import(pathToFileURL(base).href);const wt=process.env.PROOF_WT,preq=createRequire(wt+'/spacedock-bridge/package.json');preq('tsx/cjs');
 const {createPaseoApi}=await import(pathToFileURL(wt+'/spacedock-bridge/node_modules/@getpaseo/client/dist/index.js').href);
 const {fleetSnapshot}=preq(wt+'/spacedock-bridge/server/fleet-mcp.ts');const {validateDigest,replayWindow}=preq(wt+'/spacedock-bridge/server/report-sources.ts');const assert=require('node:assert/strict');
 const client=await connectToDaemon({target:{kind:'instance',home:process.env.PASEO_HOME}});try{
 const api=createPaseoApi(client);const initial=await api.agents.ref(process.env.PROOF_AGENT).timeline.refetch({projection:'projected',direction:'tail',limit:120});console.log('SAFE:'+JSON.stringify({diagnostic:{count:initial.entries.length,kinds:initial.entries.map(e=>e.item.type),projection:initial.projection}}));const snapshot=await fleetSnapshot(api,'isolated-host');const report=snapshot.reports.find(r=>r.agentId===process.env.PROOF_AGENT);assert.equal(report.state,'reports');assert.ok(report.sources.length>=2);
 const source=report.sources[0].source;const raw={roundId:snapshot.roundId,collectedAt:snapshot.collectedAt,points:[{pointId:'p',sentence:'Fictional digest',sources:[source],contextLines:['about','before','now'].map(kind=>({kind,sentence:'Fictional '+kind,refs:[source]}))}]};
 const round={...snapshot,agentId:'fictional-co',sources:report.sources.map(s=>s.source)};const read=(id,opts)=>api.agents.ref(id).timeline.refetch(opts);const digest=await validateDigest(raw,round,read);assert.equal(digest.points[0].valid,true);
 const windows=[];for(const {source:s} of [report.sources[0],report.sources.at(-1)]){const w=await replayWindow(read,'isolated-host',s);assert.ok(w);assert.ok(w.entries.some(e=>e.seqStart===s.seqStart&&e.seqEnd===s.seqEnd));const before=await replayWindow(read,'isolated-host',s,'before',w.entries[0].seqStart),after=await replayWindow(read,'isolated-host',s,'after',w.entries.at(-1).seqEnd);assert.equal(before.older,'end');assert.equal(after.newer,'end');windows.push({anchor:[s.seqStart,s.seqEnd],ranges:w.entries.map(e=>[e.seqStart,e.seqEnd]),older:w.older,newer:w.newer,beforeEdge:before.older,afterEdge:after.newer});}
 console.log('SAFE:'+JSON.stringify({sourceCount:report.sources.length,sourceRanges:report.sources.map(s=>[s.source.seqStart,s.source.seqEnd]),digestValid:true,windows,actualSdkResponses:true}));
 }finally{await client.close()}
 })().catch(e=>{console.log('SAFE:'+JSON.stringify({errorType:e.name,message:e.message}));process.exitCode=1});
 '''
 env.update(ELECTRON_RUN_AS_NODE='1',PROOF_WT=str(wt),PROOF_AGENT=agent)
 output=run(['/Applications/Paseo.app/Contents/Frameworks/Paseo Helper.app/Contents/MacOS/Paseo Helper','-e',js],90)
 safe=[json.loads(l[5:]) for l in output.splitlines() if l.startswith('SAFE:')];result['proof']=safe;assert safe[-1].get('digestValid');result['passed']=True
except Exception as e:
 result['passed']=False;result['failure']=str(e);raise
finally:
 if pid:
  try:os.kill(pid,signal.SIGTERM)
  except ProcessLookupError:pass
 if process:
  try:process.wait(timeout=15)
  except subprocess.TimeoutExpired:
   if pid:os.kill(pid,signal.SIGKILL)
   process.wait(timeout=10)
 shutil.rmtree(root);result['homeRemoved']=not root.exists();result['stopped']=process is None or process.poll() is not None
 (out/'edge-proof.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
