#!/usr/bin/env python3
"""Run the new row-bounds/action test against the unmodified prior Board."""
import argparse,json,shutil,subprocess,tempfile
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument("--worktree",type=Path,required=True)
p.add_argument("--output",type=Path,required=True)
a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
root=Path(tempfile.mkdtemp(prefix=".row-bounds-base-",dir=a.worktree))
try:
 plugin=root/"spacedock-bridge"
 shutil.copytree(a.worktree/"spacedock-bridge",plugin,ignore=shutil.ignore_patterns("node_modules"))
 (plugin/"node_modules").symlink_to((a.worktree/"spacedock-bridge/node_modules").resolve(),target_is_directory=True)
 original=subprocess.check_output(["git","-C",str(a.worktree),"show","4d5d8982cf1e8262be808be6ad81bc04bcede5f5:spacedock-bridge/client/board.tsx"])
 (plugin/"client/board.tsx").write_bytes(original)
 r=subprocess.run([str(plugin/"node_modules/.bin/tsx"),"--test","test/board-row-bounds.test.mts"],cwd=plugin,text=True,capture_output=True)
 (a.output/"base-test.log").write_text(r.stdout+r.stderr)
 assert r.returncode==1 and "screen readers need sibling row and link controls" in r.stdout+r.stderr,(r.returncode,r.stdout,r.stderr)
 (a.output/"result.json").write_text(json.dumps(dict(base="4d5d8982cf1e8262be808be6ad81bc04bcede5f5",exit=r.returncode,expectedFailure="row and link are nested accessibility elements"),indent=2)+"\n")
 print("PASS: prior Board fails the new sibling-accessibility test")
finally:
 shutil.rmtree(root)
 (a.output/"cleanup.json").write_text(json.dumps(dict(root=str(root),removed=not root.exists()),indent=2)+"\n")
