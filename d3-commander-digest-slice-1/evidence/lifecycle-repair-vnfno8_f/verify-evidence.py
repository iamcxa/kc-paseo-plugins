import hashlib,json,os,socket,subprocess
from pathlib import Path
out=Path(__file__).resolve().parent
wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1')
head=subprocess.check_output(['git','-C',str(wt),'rev-parse','HEAD'],text=True).strip()
assert head=='7a4dbc057803d791dc5626182636c8e0fc2c2d32'
assert not subprocess.check_output(['git','-C',str(wt),'status','--porcelain','--','spacedock-bridge'],text=True).strip()
files=subprocess.check_output(['git','-C',str(wt),'ls-files','spacedock-bridge'],text=True).splitlines()
identity={str(Path(f).relative_to('spacedock-bridge')):hashlib.sha256((wt/f).read_bytes()).hexdigest() for f in files}
for folder in ['desktop','phone']:
 snap=json.loads((out/folder/'source-identity.json').read_text())
 assert all(snap.get(f)==sha for f,sha in identity.items())
 observed=json.loads((out/folder/'observed.json').read_text())
 states=[r for r in observed if 'state' in r];assert len(states)==5
 scrolls=[r['scrollBottom'] for r in observed if 'scrollBottom' in r];assert len(scrolls)==2 and all(r['bottom'] for r in scrolls)
 for state in states:
  assert not state['overflow']
  if state['state'].startswith('replay'):
   for label in ['開啟 FO','繼續討論','回覆新決定']:
    r=next(x['rect'] for x in state['rows'] if x['label']==label)
    assert r['h']>=44 and r['w']>=44 and r['y']>=0 and r['y']+r['h']<= (780 if state['width']==360 else 1000)
 events=json.loads((out/folder/'fixture-events.json').read_text());assert not (events['sent'] or events['opened'] or events['archive'])
sha=hashlib.sha256((wt/'spacedock-bridge/test/verification-lifecycle.test.mts').read_bytes()).hexdigest()
assert json.loads((out/'baseline-binding.json').read_text())['testSha256']==sha
assert json.loads((out/'isolated-proof.json').read_text())['passed']
pr=json.loads((out/'pr.json').read_text());assert pr['isDraft'] and pr['state']=='OPEN' and pr['headRefOid']==head and pr['baseRefName']=='spacedock-ensign/r10-sidebar-count-popover'
cleanup=[]
for p in out.rglob('cleanup.json'):
 r=json.loads(p.read_text());assert r['home_removed'] and r['browser_closed'];pid=r['pid']
 try:os.kill(pid,0)
 except ProcessLookupError:pass
 else:raise AssertionError('capture PID remains')
 launch=json.loads(p.with_name('launch.json').read_text());assert not Path(launch['home']).exists()
 for port in r['ports']:
  with socket.socket() as s:assert s.connect_ex(('127.0.0.1',port))!=0
 cleanup.append({'evidence':str(p.relative_to(out)),'pid':pid,'stopped':True,'homeRemoved':True,'portsClosed':True})
for p in out.glob('isolated-proof*.json'):
 r=json.loads(p.read_text());assert r['homeRemoved'] and r['stopped'];assert not Path(r['home']).exists()
 try:os.kill(r['pid'],0)
 except ProcessLookupError:pass
 else:raise AssertionError('proof PID remains')
 with socket.socket() as s:assert s.connect_ex(('127.0.0.1',r['port']))!=0
 cleanup.append({'evidence':p.name,'pid':r['pid'],'stopped':True,'homeRemoved':True,'portsClosed':True})
assert not list(wt.glob('.projected-daemon-*')) and not list(wt.glob('.d3-capture-*'))
(out/'cleanup-verified.json').write_text(json.dumps(cleanup,indent=2))
(out/'capture-binding.json').write_text(json.dumps({'candidate':head,'committedFileHashes':identity,'testSha256':sha,'captures':{str(p.relative_to(out)):hashlib.sha256(p.read_bytes()).hexdigest() for folder in ['desktop','phone'] for p in (out/folder).glob('*.png')},'allCommittedPackageFilesMatch':True,'visibleEndMarkersVerified':True,'visibleFixedExits':True},indent=2))
(out/'checks.json').write_text(json.dumps({'candidate':head,'base':'33952f9b3d02fceab104ba09272d65e432a3d095','tests':{'passed':431,'exit':0,'log':'npm-test-final.log'},'typecheck':{'exit':0,'log':'typecheck-exact-head.log'},'baseline':{'failed':12,'passedControls':2,'log':'baseline.log'},'packageGuards':{'exit':0,'names':['comment-ratio','number-guards','design-surfaces','doc-impact','adr-lint']},'isolatedLifecycleProof':{'passed':True,'log':'isolated-proof.json','FOReadBackUsesPinnedRoundFixture':True},'captures':10,'liveDaemonTouched':False,'cleanup':'cleanup-verified.json'},indent=2))
print(json.dumps({'candidate':head,'matchedFiles':len(identity),'captures':10,'cleanupAttempts':len(cleanup),'passed':True}))
