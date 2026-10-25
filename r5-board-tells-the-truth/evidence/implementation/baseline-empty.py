import json,os,signal,subprocess,tempfile,time,shutil,socket
from pathlib import Path
work=Path("/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth")
evidence=Path(__file__).parent
root=Path(tempfile.mkdtemp(prefix=".empty-proof-",dir=work))
env={k:v for k,v in os.environ.items() if not k.startswith("PASEO_")}
env.update(HOME=str(root/"home"),PASEO_HOME=str(root/"daemon"),PASEO_LISTEN="127.0.0.1:7171",PASEO_RELAY_ENABLED="false",PASEO_WEB_UI_ENABLED="true",PASEO_WEB_UI_DIST_DIR="/Applications/Paseo.app/Contents/Resources/app-dist",PASEO_SERVICE_PROXY_ENABLED="false")
(root/"home").mkdir();(root/"daemon").mkdir()
pid=None; proc=None
try:
 with (root/"daemon.log").open("w") as log:
  proc=subprocess.Popen(["/Users/kent/.local/bin/paseo","daemon","run","--home",str(root/"daemon")],cwd=work,env=env,stdout=log,stderr=log,start_new_session=True)
 for _ in range(150):
  if (root/"daemon/paseo.pid").exists():break
  if proc.poll() is not None:raise RuntimeError("isolated daemon exited")
  time.sleep(.2)
 pid=json.loads((root/"daemon/paseo.pid").read_text())["pid"]
 for _ in range(150):
  try:
   with socket.create_connection(("127.0.0.1",7171),timeout=.2):pass
   break
  except OSError:time.sleep(.2)
 time.sleep(2)
 r=subprocess.run(["node","--import","tsx",str(evidence/"baseline-observe.mts"),"ws://127.0.0.1:7171/ws"],cwd=work/"spacedock-bridge",capture_output=True,text=True,timeout=20)
 (evidence/"baseline-empty.log").write_text(r.stdout+r.stderr)
 print(r.stdout+r.stderr)
 assert r.returncode==0
finally:
 if pid:
  try:os.kill(pid,signal.SIGTERM)
  except ProcessLookupError:pass
 if proc:proc.wait(timeout=15)
 if pid:
  try:os.kill(pid,0)
  except ProcessLookupError:pass
  else:raise RuntimeError("isolated daemon still alive")
 (evidence/"baseline-daemon.log").write_text((root/"daemon.log").read_text())
 shutil.rmtree(root)
 (evidence/"baseline-cleanup.json").write_text(json.dumps(dict(pid=pid,home_removed=not root.exists()))+"\n")
