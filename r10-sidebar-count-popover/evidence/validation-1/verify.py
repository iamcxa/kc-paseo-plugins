#!/usr/bin/env python3
import argparse,hashlib,json,os,subprocess
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('--worktree',type=Path,required=True);ap.add_argument('--output',type=Path,required=True);a=ap.parse_args()
head='2a31ef49e8f152623c1e04e046bcbf34777da85f'
assert subprocess.check_output(['git','-C',str(a.worktree),'rev-parse','HEAD'],text=True).strip()==head
results=[]
for theme,width in [('dark',1440),('light',1440),('dark',360),('light',360)]:
 p=a.output/f'{theme}-{width}-final'
 identity=json.loads((p/'source-identity.json').read_text())
 for name,digest in identity.items():
  content=subprocess.check_output(['git','-C',str(a.worktree),'show',head+':spacedock-bridge/'+name])
  assert hashlib.sha256(content).hexdigest()==digest,(p.name,name,'candidate mismatch')
 obs=json.loads((p/'observed.json').read_text());by_state={x['state']:x for x in obs if 'state'in x}
 assert '4' in by_state['sidebar-count']['text']
 for state in ['loading','failed']:
  row=next(x for x in obs if x.get('scenario')==state);assert row['sidebar_count_controls']==['Waiting items: sources incomplete']
 assert next(x for x in obs if x.get('scenario')=='none')['sidebar_count_controls']==[]
 assert next(x for x in obs if x.get('scenario')=='captain-empty')['sidebar_count_controls']==['1 gates and questions waiting for you']
 order=next(x['oldest_first_items'] for x in obs if 'oldest_first_items'in x);assert len(order)==4
 assert all(next(x['navigation'] for x in obs if 'navigation'in x).values())
 cleanup=json.loads((p/'cleanup.json').read_text());assert cleanup['home_removed'] and cleanup['browser_closed']
 try:os.kill(cleanup['pid'],0)
 except ProcessLookupError:pass
 else:raise AssertionError(('capture daemon still running',cleanup['pid']))
 assert all(n not in (6767,6787) and not 6860<=n<=6935 for n in cleanup['ports'])
 contrast=json.loads((p/'contrast.json').read_text());assert len(contrast)==3 and all(x['contrast']>=4.5 and x['opacity']==1 for x in contrast)
 results.append({'appearance':theme,'width':width,'candidate':head,'source_files':len(identity),'captures':len(by_state),'navigation':True,'cleanup':True,'minimum_contrast':min(x['contrast'] for x in contrast)})
mutants=json.loads((a.output/'mutations/results.json').read_text());assert len(mutants)==2 and all(x['exit']==1 for x in mutants)
assert not subprocess.check_output(['git','-C',str(a.worktree),'status','--porcelain'],text=True).strip(),'candidate worktree dirty'
(a.output/'verification.json').write_text(json.dumps(results,indent=2))
print('PASS: AC-1 and AC-2; 4 sequential host runs; candidate hashes match; both mutants fail; daemons stopped and homes removed')
