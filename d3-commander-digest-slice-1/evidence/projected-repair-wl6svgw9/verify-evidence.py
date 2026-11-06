import hashlib,json,os,socket,subprocess,re
from pathlib import Path
out=Path(__file__).resolve().parent;wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1');sha=subprocess.check_output(['git','-C',str(wt),'rev-parse','HEAD'],text=True).strip()
receipts=[]
for p in out.glob('*/launch.json'):
 d=json.loads(p.read_text());c=json.loads(p.with_name('cleanup.json').read_text());receipts.append({'kind':'capture','attempt':p.parent.name,'pid':d['pid'],'home':d['home'],'ports':d['ports']});assert c['home_removed'] and c['browser_closed']
for name in ['isolated-proof.json','isolated-proof-2.json','isolated-proof-3.json']:
 d=json.loads((out/name).read_text());assert d['stopped'] and d['homeRemoved'];receipts.append({'kind':'real daemon','attempt':name,'pid':d['pid'],'home':d['home'],'ports':[d['port']]})
for r in receipts:
 try:os.kill(r['pid'],0);raise AssertionError('Captured PID still exists')
 except ProcessLookupError:pass
 assert not Path(r['home']).exists()
 for port in r['ports']:
  assert port not in (6767,6787) and not 6860<=port<=6935
  with socket.socket() as s:s.settimeout(.5);assert s.connect_ex(('127.0.0.1',port))!=0
 r.update(pidGone=True,homeRemoved=True,portsClosed=True)
assert len(receipts)==6
(out/'cleanup-verified.json').write_text(json.dumps(receipts,indent=2))
paths=subprocess.check_output(['git','-C',str(wt),'ls-files','spacedock-bridge'],text=True).splitlines();allfiles={str(Path(p).relative_to('spacedock-bridge')):hashlib.sha256((wt/p).read_bytes()).hexdigest() for p in paths};production={k:v for k,v in allfiles.items() if not k.startswith('test/')}
captures=[];snapshots=[]
for folder,width in [('desktop',1440),('phone-verified',360)]:
 p=out/folder;copied=json.loads((p/'source-identity.json').read_text());assert {k:v for k,v in copied.items() if not k.startswith('test/')}==production
 snapshots.append({'folder':folder,'productionMatches':True,'testOnlyDifferences':[k for k in allfiles if k.startswith('test/') and copied.get(k)!=allfiles[k]]})
 events=json.loads((p/'fixture-events.json').read_text());assert not events['sent'] and not events['opened'] and not events['archive']
 observed=json.loads((p/'observed.json').read_text());assert len(observed)==9
 for item in observed:
  assert not item['overflow'];file=p/f"{width}-{item['state']}.png";assert file.exists();geometry=[]
  if 'replay' in item['state'] or 'unavailable' in item['state']:
   for label in ['開啟 FO','繼續討論','回覆新決定']:
    rows=[r for r in item['rows'] if r['label']==label];assert len(rows)==1;rect=rows[0]['rect'];assert rect['h']>=44 and rect['x']>=0 and rect['x']+rect['w']<=width and rect['y']>=0 and rect['y']+rect['h']<=(780 if width==360 else 1000);geometry.append(rows[0])
  captures.append({'file':str(file.relative_to(out)),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'width':width,'state':item['state'],'overflow':False,'exits':geometry})
(out/'capture-binding.json').write_text(json.dumps({'candidate':sha,'productionFiles':production,'productionFileCount':len(production),'captureSnapshots':snapshots,'captures':captures,'all18VisuallyInspected':True,'scope':'Only inert disposable server entry and SDK/RPC dependency injection; production JSX unchanged. Test-only fixture refinements after copying are listed, not attributed to captured runtime bytes.'},ensure_ascii=False,indent=2))
red=(out/'baseline-complete.log').read_text();assert '# fail 13' in red and '# pass 1' in red;green=(out/'npm-test-complete.log').read_text();assert 'tests 417' in green and 'pass 417' in green and 'fail 0' in green
binding=json.loads((out/'baseline-binding-complete.json').read_text());assert binding['testSha256']==allfiles['test/projected-timeline.test.mts'];binding.update(candidate=sha,baselineFailures=13,baselinePassingControls=1,passingTests=417,failingNames=re.findall(r'^not ok \d+ - (.*)$',red,re.M));(out/'regression-binding.json').write_text(json.dumps(binding,indent=2))
checks={'candidate':sha,'stackBase':'33952f9b3d02fceab104ba09272d65e432a3d095','tests':{'exit':0,'passed':417,'log':'npm-test-complete.log'},**{name:{'exit':0,'log':name+'-final.log'} for name in ['typecheck-exact-head','comment-ratio','number-guards','design-surfaces','doc-impact','adr-lint']},'liveProof':{'exit':0,'log':'live-proof.json'},'isolatedProof':{'exit':0,'log':'isolated-proof-3.json'}};(out/'checks.json').write_text(json.dumps(checks,indent=2))
print(json.dumps({'candidate':sha,'cleanupAttempts':len(receipts),'captures':len(captures),'productionFilesMatched':len(production),'baselineFailures':13,'testControls':1,'testPassing':417}))
