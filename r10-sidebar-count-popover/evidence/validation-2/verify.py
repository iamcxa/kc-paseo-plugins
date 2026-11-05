#!/usr/bin/env python3
import argparse,hashlib,json,os,subprocess
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('--worktree',type=Path,required=True);ap.add_argument('--output',type=Path,required=True);a=ap.parse_args()
head='33952f9b3d02fceab104ba09272d65e432a3d095'
assert subprocess.check_output(['git','-C',str(a.worktree),'rev-parse','HEAD'],text=True).strip()==head
results=[]
intervals=[]
for theme,width in [('dark',1440),('light',1440),('dark',360),('light',360)]:
 p=a.output/f'{theme}-{width}-final'
 identity=json.loads((p/'source-identity.json').read_text())
 tracked=subprocess.check_output(['git','-C',str(a.worktree),'ls-tree','-r','--name-only',head,'--','spacedock-bridge/'],text=True).splitlines()
 assert set(identity)=={name.removeprefix('spacedock-bridge/') for name in tracked},'source file set mismatch'
 intervals.append(((p/'launch.json').stat().st_mtime,(p/'cleanup.json').stat().st_mtime))
 for name,digest in identity.items():
  content=subprocess.check_output(['git','-C',str(a.worktree),'show',head+':spacedock-bridge/'+name])
  assert hashlib.sha256(content).hexdigest()==digest,(p.name,name,'candidate mismatch')
 obs=json.loads((p/'observed.json').read_text());by_state={x['state']:x for x in obs if 'state'in x}
 assert '4' in by_state['sidebar-count']['text']
 for state in ['loading','failed']:
  row=next(x for x in obs if x.get('scenario')==state);assert row['sidebar_count_controls']==['Waiting items: sources incomplete']
 assert next(x for x in obs if x.get('scenario')=='none')['sidebar_count_controls']==[]
 assert next(x for x in obs if x.get('scenario')=='captain-empty')['sidebar_count_controls']==['1 gates and questions waiting for you']
 order=next(x['newest_first_items'] for x in obs if 'newest_first_items'in x);assert [row['label'] for row in order]==['Open Should I ask for the next proof? (you)','Open Accept the export result?','Open Which retry limit should we use?','Open Accept the retry proof?']
 assert all(age in row['text'] for row,age in zip(order,['5m ago','12m ago','35m ago','1h ago']))
 assert all(next(x['navigation'] for x in obs if 'navigation'in x).values())
 cleanup=json.loads((p/'cleanup.json').read_text());assert cleanup['home_removed'] and cleanup['browser_closed']
 try:os.kill(cleanup['pid'],0)
 except ProcessLookupError:pass
 else:raise AssertionError(('capture daemon still running',cleanup['pid']))
 assert all(n not in (6767,6787) and not 6860<=n<=6935 for n in cleanup['ports'])
 contrast=json.loads((p/'contrast.json').read_text());assert len(contrast)==3 and all(x['contrast']>=4.5 and x['opacity']==1 for x in contrast)
 results.append({'appearance':theme,'width':width,'candidate':head,'source_files':len(identity),'captures':len(by_state),'navigation':True,'cleanup':True,'minimum_contrast':min(x['contrast'] for x in contrast)})
mutants=json.loads((a.output/'mutations/results.json').read_text());assert len(mutants)==1 and all(x['exit']==1 for x in mutants)
assert not subprocess.check_output(['git','-C',str(a.worktree),'status','--porcelain'],text=True).strip(),'candidate worktree dirty'
intervals.sort()
assert all(previous[1]<=following[0] for previous,following in zip(intervals,intervals[1:])),'captures overlapped'
initial=json.loads(Path(__file__).with_name('initial-state.json').read_text())
for state in initial:
 def git(*args):return subprocess.check_output(['git','-C',state['path'],*args],text=True).strip()
 assert git('rev-parse','HEAD')==state['head'] and git('branch','--show-current')==state['branch']
 assert git('status','--porcelain')==state['status']==''
(a.output/'verification.json').write_text(json.dumps(results,indent=2))
print('PASS: AC-1 and AC-3; 4 sequential host runs; candidate hashes match; order mutant fail; daemons stopped and homes removed')
