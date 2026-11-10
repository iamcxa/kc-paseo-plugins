import os,json,socket,subprocess,signal,time,shutil,sys
from pathlib import Path
E=Path(__file__).resolve().parent
D=json.loads((E/'runtime.json').read_text());R=Path(D['root']);action=sys.argv[1];n=sys.argv[2]
def pairs():return [tuple(map(int,s.split())) for s in subprocess.check_output(['ps','-axo','pid=,ppid='],text=True).splitlines()]
def closed(port):
 s=socket.socket();s.settimeout(.4);v=s.connect_ex(('127.0.0.1',port))!=0;s.close();return v
if action=='start':
 assert all(closed(p) for p in [D['daemonPort'],D['fleetPort']])
 env={k:v for k,v in os.environ.items() if not k.startswith(('PASEO_','BRIDGE_'))};env['PATH']=str(R/'bin')+os.pathsep+env['PATH'];env.update(PASEO_HOME=str(R/'home'),BRIDGE_DATA_HOME=str(R/'data'),BRIDGE_FLEET_PORT=str(D['fleetPort']),BRIDGE_REVIEW_POLLING='off')
 with (E/f'daemon-{n}-console.log').open('x') as out:p=subprocess.Popen(['/Users/kent/.local/bin/paseo','daemon','run','--home',str(R/'home')],cwd=R/'fictional',env=env,stdout=out,stderr=subprocess.STDOUT,start_new_session=True)
 with (E/f'daemon-{n}-process.json').open('x') as f:json.dump({'launcherPid':p.pid,'ownedRuntime':str(R),'ports':[D['daemonPort'],D['fleetPort']]},f,indent=2)
 print(json.dumps({'generation':n,'capturedLauncherPid':p.pid}))
elif action in ['stop','finish']:
 root=json.loads((E/f'daemon-{n}-process.json').read_text())['launcherPid'];p=pairs();assert any(pid==root for pid,_ in p);owned={root}
 while True:
  next_owned=owned|{pid for pid,parent in p if parent in owned}
  if next_owned==owned:break
  owned=next_owned
 os.kill(root,signal.SIGTERM)
 for _ in range(30):
  remaining=owned&{pid for pid,_ in pairs()}
  if not remaining:break
  time.sleep(.2)
 for pid in remaining:
  try:os.kill(pid,signal.SIGTERM)
  except ProcessLookupError:pass
 for _ in range(30):
  remaining=owned&{pid for pid,_ in pairs()}
  if not remaining:break
  time.sleep(.2)
 for pid in remaining:
  try:os.kill(pid,signal.SIGKILL)
  except ProcessLookupError:pass
 time.sleep(.5);remaining=owned&{pid for pid,_ in pairs()};ports={str(p):closed(p) for p in [D['daemonPort'],D['fleetPort']]};assert not remaining and all(ports.values()),(remaining,ports)
 if action=='finish':
  assert R.parent==Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d7-list-chief-of-staff/spacedock-bridge/node_modules') and R.name.startswith('.d7-proof-cycle5-');shutil.rmtree(R)
 result={'generation':n,'capturedLauncherPid':root,'capturedOwnedPids':sorted(owned),'remainingOwnedPids':sorted(remaining),'portsClosed':ports,'runtimePreserved':R.exists(),'runtimeDeleted':not R.exists(),'noPatternKill':True}
 with (E/('cleanup.json' if action=='finish' else f'daemon-{n}-stop.json')).open('x') as f:json.dump(result,f,indent=2)
 print(json.dumps(result))
else:raise ValueError(action)
