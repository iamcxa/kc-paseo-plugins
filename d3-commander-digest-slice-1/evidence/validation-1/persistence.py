from pathlib import Path
import tempfile,subprocess,os,json,shutil
E=Path(__file__).parent
WT=Path("/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1")
root=Path(tempfile.mkdtemp(prefix=".validation-state-",dir=WT))
try:
 (root/"node_modules").symlink_to(WT/"spacedock-bridge/node_modules")
 script=root/"probe.mts";script.write_bytes((E/"persistence-probe.mts").read_bytes())
 env=dict(os.environ,HOME=str(root/"home"));results=[]
 for n in range(2):
  p=subprocess.run(["node","--import",str(WT/"spacedock-bridge/node_modules/tsx/dist/loader.mjs"),str(script)],cwd=root,env=env,text=True,capture_output=True,timeout=20)
  assert p.returncode==0,p.stderr
  results.append(json.loads(p.stdout))
 assert results[0]["creates"]==1 and results[1]["creates"]==0
 print(json.dumps(results))
finally:shutil.rmtree(root)
