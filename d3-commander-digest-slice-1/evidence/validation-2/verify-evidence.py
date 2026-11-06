from pathlib import Path
import json,hashlib,subprocess,socket,struct,os

out=Path(__file__).resolve().parent
wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1')
candidate='7a4dbc057803d791dc5626182636c8e0fc2c2d32'
read=lambda name:json.loads((out/name).read_text())
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
git=lambda p,*args:subprocess.check_output(['git','-C',str(p),*args],text=True).strip()
binding=read('candidate-binding.json')
assert git(wt,'rev-parse','HEAD')==candidate
assert git(wt,'branch','--show-current')=='spacedock-ensign/d3-commander-digest-slice-1'
assert not git(wt,'status','--porcelain')
assert all(digest(wt/path)==expected for path,expected in binding['files'].items())
mutations=read('mutations.json')
assert len(mutations)==10 and all(r['baseline_exit']==0 and r['baseline_tests']>0 and r['detected'] and r['failed_tests'] for r in mutations)
assert read('mutation-cleanup.json')['removed']
assert all(r['exit']==0 for r in read('package-checks.json'))
live=read('live-final.json')
assert live['exit']==0 and len(live['safeOutput'][0]['results'])==3
assert all(p['loaded'] for p in live['safeOutput'][0]['results'])
lifecycle=read('isolated-proof.json')
proof=lifecycle['proof'][-1]
assert lifecycle['passed'] and proof['actualSdkLifecycleEvents']
assert all(proof[k]['runningRejected'] and proof[k]['completedAutomatically'] and proof[k]['identicalEntry'] and proof[k]['replay'] for k in ['commander','fo'])
assert proof['fo']['omittedFromCollection'] and proof['fo']['pinnedRoundFixture']
edges=read('edge-merged-proof.json');edge=edges['proof'][-1]
assert edges['passed'] and edge['digestValid'] and edge['actualSdkResponses']
assert any(end>start for start,end in edge['sourceRanges'])
assert len(edge['windows'])==2 and all(w['beforeEdge']=='end' and w['afterEdge']=='end' for w in edge['windows'])
pr=read('pr-final.json' if (out/'pr-final.json').exists() else 'pr.json')
assert pr['state']=='OPEN' and pr['isDraft'] and pr['headRefOid']==candidate
assert pr['baseRefName']=='spacedock-ensign/r10-sidebar-count-popover'
captures=[]
groups={'desktop-main':1440,'phone':360,'desktop-switch-final':1440,'phone-switch-final':360}
for name,width in groups.items():
 folder=out/name
 source=json.loads((folder/'source-identity.json').read_text())
 assert all(source[path.removeprefix('spacedock-bridge/')]==expected for path,expected in binding['files'].items())
 observations=json.loads((folder/'observed.json').read_text())
 states=[r for r in observations if 'state' in r]
 assert len(states)==(3 if 'switch' in name else 14)
 assert all(not r['overflow'] and r['width']==width for r in states)
 for state in states:
  image=folder/f'{width}-{state["state"]}.png'
  assert struct.unpack('>II',image.read_bytes()[16:24])==(width,780 if width==360 else 1000)
  captures.append({'file':str(image.relative_to(out)),'state':state['state'],'sha256':digest(image),'width':width})
 if 'switch' in name:
  events=json.loads((folder/'fixture-events.json').read_text())
  assert len(events['archive'])==1
 else:
  assert any('scrollBottom' in r and r['scrollBottom']['bottom'] for r in observations)
  assert next(r for r in states if r['state']=='exit-discuss')['active']=='Message Comms officer'
  assert next(r for r in states if r['state']=='exit-new-decision')['active']=='Message Comms officer'
  events=json.loads((folder/'fixture-events.json').read_text())
  assert events['sent']==[] and events['archive']==[]
cleanup=[]
def dead(pid):
 try:os.kill(pid,0);return False
 except ProcessLookupError:return True
def closed(port):
 with socket.socket() as s:
  s.settimeout(.2);return s.connect_ex(('127.0.0.1',port))!=0
for path in sorted(out.glob('*/cleanup.json')):
 value=json.loads(path.read_text());launch=json.loads(path.with_name('launch.json').read_text())
 row={'attempt':path.parent.name,'pid':value['pid'],'pidAbsent':dead(value['pid']),'homeRemoved':not Path(launch['home']).exists(),'ports':value['ports'],'portsClosed':all(closed(p) for p in value['ports'])}
 assert row['pidAbsent'] and row['homeRemoved'] and row['portsClosed']
 cleanup.append(row)
for name in ['isolated-proof.json','edge-proof.json','edge-merged-proof.json']:
 value=read(name)
 row={'attempt':name,'pid':value['pid'],'pidAbsent':dead(value['pid']),'homeRemoved':not Path(value['home']).exists(),'ports':[value['port']],'portsClosed':closed(value['port'])}
 assert value['stopped'] and value['homeRemoved'] and row['pidAbsent'] and row['portsClosed']
 cleanup.append(row)
assert all(p not in [6767,6787] and not 6860<=p<=6935 for row in cleanup for p in row['ports'])
initial=read('initial-state.json')
protected=[]
for record in initial[:3]:
 path=Path(record['path']);value={'path':str(path),'head':git(path,'rev-parse','HEAD'),'branch':git(path,'branch','--show-current'),'status':git(path,'status','--porcelain')}
 assert value['head']==record['head'] and value['branch']==record['branch'] and value['status']==record['status']
 protected.append(value)
(out/'capture-binding.json').write_text(json.dumps({'candidate':candidate,'packageFilesMatched':len(binding['files']),'groups':groups,'captures':captures},indent=2))
(out/'cleanup-verified.json').write_text(json.dumps(cleanup,indent=2))
(out/'final-protected-state.json').write_text(json.dumps(protected,indent=2))
print(json.dumps({'candidate':candidate,'mutationsDetected':len(mutations),'livePagesLoaded':3,'realDaemonLifecycle':True,'realMergedSourceEdges':True,'captures':len(captures),'cleanedAttempts':len(cleanup),'protectedTreesUnchanged':True}))
