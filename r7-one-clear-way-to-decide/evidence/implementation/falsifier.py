#!/usr/bin/env python3
"""Prove that wiring the decision to the message draft breaks the named tests."""
import argparse, json, shutil, subprocess, tempfile
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument("--worktree",type=Path,required=True)
p.add_argument("--output",type=Path,required=True)
a=p.parse_args()
a.output.mkdir(parents=True,exist_ok=False)
root=Path(tempfile.mkdtemp(prefix=".composer-falsifier-",dir=a.worktree))
try:
 plugin=root/"spacedock-bridge"
 shutil.copytree(a.worktree/"spacedock-bridge",plugin,ignore=shutil.ignore_patterns("node_modules"))
 (plugin/"node_modules").symlink_to((a.worktree/"spacedock-bridge/node_modules").resolve(),target_is_directory=True)
 source=plugin/"shared/decision-composer.ts"
 text=source.read_text()
 original="draft: () => readDecisionDraft(key).reason,"
 assert text.count(original)==1
 source.write_text(text.replace(original,"draft: ports.draft,"))
 result=subprocess.run([str(plugin/"node_modules/.bin/tsx"),"--test","test/decision-composer.test.mts"],cwd=plugin,text=True,capture_output=True)
 (a.output/"mutation.log").write_text(result.stdout+result.stderr)
 assert result.returncode!=0, "wrong reason wiring escaped all tests"
 assert "decision uses only its reason" in result.stdout and "both actions keep the other draft" in result.stdout
 (a.output/"result.json").write_text(json.dumps(dict(mutation="decision reads message draft",exit=result.returncode,expectedFailure=True),indent=2)+"\n")
 print("PASS: named tests reject decision wired to message draft")
finally:
 shutil.rmtree(root)
 (a.output/"cleanup.json").write_text(json.dumps(dict(root=str(root),removed=not root.exists()),indent=2)+"\n")
