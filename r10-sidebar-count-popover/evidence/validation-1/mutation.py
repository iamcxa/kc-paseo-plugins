#!/usr/bin/env python3
import argparse,json,shutil,subprocess,tempfile
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('--worktree',type=Path,required=True);ap.add_argument('--output',type=Path,required=True);a=ap.parse_args()
a.output.mkdir(exist_ok=False,parents=True)
results=[]
for name,old,new in [
 ('sent-relayed','(item.kind === "gate" || item.kind === "ask") && itemStatus(item).state === "your-turn"','(item.kind === "gate" || item.kind === "ask") && !item.recorded && !item.closed'),
 ('unchecked-zero','if (audience === "captain" && states.some(state => state !== "loaded")) return "?";','if (audience === "captain" && states.some(state => state !== "loaded")) return "0";')]:
 root=Path(tempfile.mkdtemp(prefix='.r10-mutation-',dir=a.worktree))
 try:
  plugin=root/'plugin';shutil.copytree(a.worktree/'spacedock-bridge',plugin,ignore=shutil.ignore_patterns('node_modules'))
  (plugin/'node_modules').symlink_to(a.worktree/'spacedock-bridge/node_modules',target_is_directory=True)
  file=plugin/'shared/list-status.ts';s=file.read_text();assert s.count(old)==1;file.write_text(s.replace(old,new))
  command=['node','--import','tsx','--test','--test-reporter=junit','test/sidebar-waiting.test.mts']
  r=subprocess.run(command,cwd=plugin,capture_output=True,text=True,timeout=90)
  (a.output/(name+'.xml')).write_text(r.stdout);(a.output/(name+'.stderr')).write_text(r.stderr)
  assert r.returncode==1,(name,r.returncode,r.stderr)
  assert '<failure' in r.stdout,(name,'no assertion failure')
  results.append({'name':name,'exit':r.returncode,'expected':'assertion failures','mutated_file':'shared/list-status.ts','replacement':new})
 finally:shutil.rmtree(root)
(a.output/'results.json').write_text(json.dumps(results,indent=2));print('PASS: both shared-count mutants rejected; candidate untouched')
