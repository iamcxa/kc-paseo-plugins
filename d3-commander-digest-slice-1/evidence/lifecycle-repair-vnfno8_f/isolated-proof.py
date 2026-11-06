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
 (root/'payload.json').write_text(json.dumps({'text':'Fictional report seed'}));env['PROOF_PAYLOAD']=str(root/'payload.json')
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
 run([cli,'wait',agent,'--home',str(data),'--json'])
 (root/'payload.json').write_text(json.dumps({'text':'Fictional comms ready'}))
 co=json.loads(run([cli,'run','--provider','codex','--cwd',str(root/'work'),'--label','role=comms-officer','--label','digest-version=sourced-digest-v1','--home',str(data),'--json','Fictional Commander seed']))
 co=co.get('agentId',co.get('id'));assert co
 run([cli,'wait',co,'--home',str(data),'--json'])
 env.update(PROOF_CO=co,PROOF_FO=agent,PROOF_CO_GATE=str(root/'co-release'),PROOF_FO_GATE=str(root/'fo-release'))
 js=(out/'daemon-proof.cjs').read_text()
 env.update(ELECTRON_RUN_AS_NODE='1',PROOF_WT=str(wt),PROOF_AGENT=agent)
 output=run(['/Applications/Paseo.app/Contents/Frameworks/Paseo Helper.app/Contents/MacOS/Paseo Helper','-e',js],90)
 safe=[json.loads(l[5:]) for l in output.splitlines() if l.startswith('SAFE:')];result['proof']=safe;assert safe[-1].get('passed');result['passed']=True
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
 (out/'isolated-proof.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
