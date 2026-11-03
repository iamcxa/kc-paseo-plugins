import json, shutil, subprocess, tempfile
from pathlib import Path
wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r9-list-and-detail-layout')
e=Path(__file__).parent
root=Path(tempfile.mkdtemp(prefix='.r9-validation-mutations-',dir=wt))
results=[]
try:
 for name,rel,old,new,test in [
  ('status','shared/list-status.ts','if (item.sourceState === "failed" || item.problem || item.overdue)','if (false)','list-status.test.mts'),
  ('continuity','client/decision-card.tsx','active.current && visibleRef.current && !finishedRef.current && currentTarget.current === target','active.current && !finishedRef.current && currentTarget.current === target','bridge-continuity.test.mts')]:
  copy=root/name;shutil.copytree(wt/'spacedock-bridge',copy,ignore=shutil.ignore_patterns('node_modules'))
  (copy/'node_modules').symlink_to(wt/'spacedock-bridge/node_modules',target_is_directory=True)
  p=copy/rel;s=p.read_text();assert s.count(old)==1;p.write_text(s.replace(old,new))
  r=subprocess.run(['node','--import','tsx','--test','test/'+test],cwd=copy,text=True,capture_output=True,timeout=90)
  (e/(name+'-mutation.log')).write_text(r.stdout+r.stderr)
  results.append({'name':name,'file':rel,'old':old,'new':new,'exit':r.returncode,'detected':r.returncode!=0})
finally:
 shutil.rmtree(root)
 (e/'mutations.json').write_text(json.dumps({'results':results,'temporary_root_removed':not root.exists()},indent=2))
assert len(results)==2 and all(x['detected'] for x in results),results
print(json.dumps(results))
