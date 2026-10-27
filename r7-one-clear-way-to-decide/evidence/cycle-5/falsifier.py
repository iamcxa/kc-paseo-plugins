#!/usr/bin/env python3
"""Run both mounted regression checks against unchanged cycle-4 product modules."""
import argparse,json,shutil,subprocess,tempfile
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument("--worktree",type=Path,required=True)
p.add_argument("--output",type=Path,required=True)
a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
base="04f90b876bf0f2765343477513fabd08b7b3a2d0"
root=Path(tempfile.mkdtemp(prefix=".cycle5-base-",dir=a.worktree))
try:
 plugin=root/"spacedock-bridge"
 shutil.copytree(a.worktree/"spacedock-bridge",plugin,ignore=shutil.ignore_patterns("node_modules"))
 (plugin/"node_modules").symlink_to((a.worktree/"spacedock-bridge/node_modules").resolve(),target_is_directory=True)
 for path in ("client/board.tsx","client/co-chat.tsx"):
  (plugin/path).write_bytes(subprocess.check_output(["git","-C",str(a.worktree),"show",base+":spacedock-bridge/"+path]))
 results=[]
 for name,expected in (("board-row-bounds","every review action must visibly retain its pull request number"),("composer-scroll","both composers must share a scroll area")):
  r=subprocess.run([str(plugin/"node_modules/.bin/tsx"),"--test","test/"+name+".test.mts"],cwd=plugin,text=True,capture_output=True)
  (a.output/(name+".log")).write_text(r.stdout+r.stderr)
  assert r.returncode==1 and expected in r.stdout+r.stderr,(name,r.returncode,r.stdout,r.stderr)
  results.append(dict(test=name,exit=r.returncode,expectedFailure=expected))
 (a.output/"result.json").write_text(json.dumps(dict(base=base,results=results),indent=2)+"\n")
 print("PASS: unchanged cycle-4 Board and CoChat fail their new mounted checks")
finally:
 shutil.rmtree(root)
 (a.output/"cleanup.json").write_text(json.dumps(dict(root=str(root),removed=not root.exists()),indent=2)+"\n")
