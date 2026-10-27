#!/usr/bin/env python3
"""Five-step local acceptance; uses the declared local Paseo/browser executables and creates fresh output only."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,tempfile,json,os,time
WT=Path("/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r6-queue-you-can-scan")
HERE=Path(__file__).resolve().parent
HEAD="f10a3f29a43fb09adff4beda268799f514f7b43b"
PASEO=Path("/Users/kent/.local/bin/paseo")
BROWSER=Path("/Users/kent/.npm-global/bin/agent-browser")
WEB=Path("/Applications/Paseo.app/Contents/Resources/app-dist")

def main():
 start=time.monotonic()
 assert subprocess.check_output(["git","-C",str(WT),"rev-parse","HEAD"],text=True).strip()==HEAD
 assert not subprocess.check_output(["git","-C",str(WT),"status","--porcelain"],text=True).strip(), "candidate must be clean"
 for path in (PASEO,BROWSER,WEB/"index.html"):
  assert path.exists(), str(path)
 out=Path(tempfile.mkdtemp(prefix="acceptance-",dir=HERE))
 print("PASS 1: exact candidate and declared runtime prerequisites",flush=True)
 def run(name,command,cwd=WT):
  r=subprocess.run([str(s) for s in command],cwd=cwd,text=True,capture_output=True)
  (out/(name+".log")).write_text(r.stdout+r.stderr)
  if r.returncode: raise RuntimeError(f"{name}: exit {r.returncode}; see {out/(name+'.log')}")
  return r.stdout
 run("npm-ci",["npm","ci","--no-audit","--no-fund"],WT/"spacedock-bridge")
 run("typecheck",["npm","run","typecheck"],WT/"spacedock-bridge")
 tests=run("tests",["npm","test"],WT/"spacedock-bridge")
 assert "pass 133" in tests and "fail 0" in tests
 print("PASS 2: npm ci, typecheck and 133 tests",flush=True)
 def capture(script,width,name,gate=False):
  command=["python3",HERE/script,"--worktree",WT,"--paseo",PASEO,"--browser",BROWSER,"--web-dist",WEB,"--width",str(width),"--port","0","--output",out/name]
  if gate:command.extend(["--mode","gate"])
  run(name,command)
 with ThreadPoolExecutor(max_workers=2) as pool:
  jobs=[pool.submit(capture,"capture-ac1.py",width,"ac1-"+str(width),True) for width in (360,1440)]
  for job in jobs:job.result()
 print("PASS 3: 360/1440 rows, destinations, counts and honest ages",flush=True)
 with ThreadPoolExecutor(max_workers=2) as pool:
  jobs=[pool.submit(capture,"capture-question.py",1440,"question-1440"),pool.submit(capture,"capture-runtime.py",360,"runtime-360")]
  for job in jobs:job.result()
 print("PASS 4: unread previews, pending/loaded/failed retry and review next check",flush=True)
 run("mutation",["python3",HERE/"mutate-question.py",out/"mutation"])
 for cleanup in out.glob("*/cleanup.json"):
  data=json.loads(cleanup.read_text());assert data["home_removed"] and data["browser_closed"]
  assert not Path(data["isolated_root"]).exists()
  try:os.kill(data["captured_daemon_pid"],0)
  except ProcessLookupError:pass
  else:raise AssertionError("isolated daemon still running")
 assert len(list(out.glob("*/cleanup.json")))==4
 assert not subprocess.check_output(["git","-C",str(WT),"status","--porcelain"],text=True).strip()
 print("PASS 5: shared-builder mutation rejected; isolated homes/PIDs cleaned",flush=True)
 print(f"Evidence: {out}; elapsed {time.monotonic()-start:.1f}s",flush=True)
if __name__=="__main__":main()
