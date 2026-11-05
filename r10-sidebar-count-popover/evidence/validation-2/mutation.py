#!/usr/bin/env python3
import argparse,json,shutil,subprocess,tempfile
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('--worktree',type=Path,required=True);ap.add_argument('--output',type=Path,required=True);a=ap.parse_args()
a.output.mkdir(exist_ok=False,parents=True)
root=Path(tempfile.mkdtemp(prefix='.r10-order-mutation-',dir=a.worktree))
try:
 plugin=root/'plugin';shutil.copytree(a.worktree/'spacedock-bridge',plugin,ignore=shutil.ignore_patterns('node_modules'))
 (plugin/'node_modules').symlink_to(a.worktree/'spacedock-bridge/node_modules',target_is_directory=True)
 file=plugin/'client/sidebar-waiting.tsx';s=file.read_text()
 old='b.since.localeCompare(a.since)';new='a.since.localeCompare(b.since)'
 assert s.count(old)==1;file.write_text(s.replace(old,new))
 r=subprocess.run(['node','--import','tsx','--test','--test-reporter=junit','test/sidebar-waiting.test.mts'],cwd=plugin,capture_output=True,text=True,timeout=90)
 (a.output/'oldest-first.xml').write_text(r.stdout);(a.output/'oldest-first.stderr').write_text(r.stderr)
 assert r.returncode==1,(r.returncode,r.stderr)
 assert '<failure' in r.stdout and 'newer gate must precede the older question' in r.stdout,'order assertion did not reject oldest-first'
 (a.output/'results.json').write_text(json.dumps([{'name':'oldest-first','exit':r.returncode,'mutated_file':'client/sidebar-waiting.tsx','replacement':new,'assertion':'newer gate must precede the older question'}],indent=2))
 print('PASS: oldest-first order mutant rejected by the ordering assertion; candidate untouched')
finally:shutil.rmtree(root)
