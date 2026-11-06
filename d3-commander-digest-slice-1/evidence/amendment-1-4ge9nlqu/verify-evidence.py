import hashlib,json,os,socket,subprocess
from pathlib import Path
root=Path(__file__).resolve().parent
wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1')
sha=subprocess.check_output(['git','-C',str(wt),'rev-parse','HEAD'],text=True).strip()
launches=[]
for path in sorted(root.glob('*/launch.json')):
 data=json.loads(path.read_text());cleanup=json.loads(path.with_name('cleanup.json').read_text())
 try:os.kill(data['pid'],0);gone=False
 except ProcessLookupError:gone=True
 ports=[]
 for port in data['ports']:
  assert port not in (6767,6787) and not 6860<=port<=6935
  with socket.socket() as s:
   s.settimeout(.5);closed=s.connect_ex(('127.0.0.1',port))!=0
  ports.append({'port':port,'closed':closed});assert closed
 assert gone and not Path(data['home']).exists() and cleanup['home_removed'] and cleanup['browser_closed']
 launches.append({'attempt':path.parent.name,'pid':data['pid'],'pidGone':gone,'homeRemoved':True,'ports':ports,'browserClosed':True})
(root/'cleanup-verified.json').write_text(json.dumps(launches,indent=2))
assert len(launches)==6
tracked=subprocess.check_output(['git','-C',str(wt),'ls-files','spacedock-bridge'],text=True).splitlines()
files={str(Path(p).relative_to('spacedock-bridge')):hashlib.sha256((wt/p).read_bytes()).hexdigest() for p in tracked}
captures=[]
for folder in ['desktop-verified','phone-proof']:
 d=root/folder;copied=json.loads((d/'source-identity.json').read_text())
 assert copied==files,(folder,'copied bytes differ from candidate')
 events=json.loads((d/'fixture-events.json').read_text())
 assert not events['sent'] and not events['archive'] and not events['opened']
 observed=json.loads((d/'observed.json').read_text());assert len(observed)==4
 for item in observed:
  assert not item['overflow']
  exits=[]
  for label in ['開啟 FO','繼續討論','回覆新決定']:
   rows=[x for x in item['rows'] if x['label']==label];assert len(rows)==1
   rect=rows[0]['rect'];assert rect['h']>=44 and rect['x']>=0 and rect['x']+rect['w']<=item['width']
   assert rect['y']>=0 and rect['y']+rect['h']<=(780 if item['width']==360 else 1000)
   exits.append({'label':label,**rect})
  picture=d/f"{item['width']}-{item['state']}.png";assert picture.exists()
  captures.append({'file':str(picture.relative_to(root)),'sha256':hashlib.sha256(picture.read_bytes()).hexdigest(),'width':item['width'],'state':item['state'],'horizontalOverflow':False,'exits':exits})
(root/'capture-binding.json').write_text(json.dumps({'candidate':sha,'files':files,'fileCount':len(files),'captures':captures,'injection':'Only disposable usePaseo/useRpc wiring and inactive server entry; production JSX unchanged.','visuallyInspected':True},ensure_ascii=False,indent=2))
print(json.dumps({'candidate':sha,'verifiedLaunchCleanup':len(launches),'captures':len(captures),'copiedFilesMatched':len(files),'allExitsVisibleAtLeast44px':True}))
