from pathlib import Path
import concurrent.futures,subprocess,json
p=Path(__file__).parent
base=['python3',str(p/'capture.py'),'--worktree','/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth','--paseo','/Users/kent/.local/bin/paseo','--browser','/Users/kent/.npm-global/bin/agent-browser','--web-dist','/Applications/Paseo.app/Contents/Resources/app-dist']
def run(item):
 name,port,mode,extra,expected=item
 r=subprocess.run(base+['--port',str(port),'--output',str(p/name),'--mode',mode]+extra,capture_output=True,text=True,timeout=180)
 (p/(name+'.log')).write_text(r.stdout+r.stderr)
 ok=r.returncode==0 if expected==0 else r.returncode!=0 and 'Loading source was rendered as a false empty list' in r.stderr
 print(name, 'PASS' if ok else 'FAIL', 'exit',r.returncode,flush=True)
 return {'run':name,'exit':r.returncode,'expected':expected,'passed':ok}
items=[('final-empty',7183,'empty',[],0),('final-gate',7185,'gate',[],0),('red-old-empty-condition',7187,'empty',['--mutate-empty'],1)]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(run,items))
(p/'matrix.json').write_text(json.dumps(results,indent=2)+'\n')
assert all(r['passed'] for r in results),results
