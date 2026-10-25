from pathlib import Path
import subprocess,concurrent.futures,json
p=Path(__file__).parent
base=['python3',str(p/'capture.py'),'--worktree','/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth','--paseo','/Users/kent/.local/bin/paseo','--browser','/Users/kent/.npm-global/bin/agent-browser','--web-dist','/Applications/Paseo.app/Contents/Resources/app-dist']
def run(item):
 name,mode,port,extra=item
 r=subprocess.run(base+['--mode',mode,'--port',str(port),'--output',str(p/name)]+extra,capture_output=True,text=True,timeout=180)
 (p/(name+'.log')).write_text(r.stdout+r.stderr);print(name,'exit',r.returncode,flush=True)
 return dict(run=name,exit=r.returncode)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:result=list(pool.map(run,[('final-empty','empty',7203,[]),('final-gate','gate',7205,[]),('final-long','gate',7207,['--long-feedback'])]))
(p/'matrix.json').write_text(json.dumps(result,indent=2)+'\n');assert all(x['exit']==0 for x in result),result
