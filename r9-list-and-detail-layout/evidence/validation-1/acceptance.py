#!/usr/bin/env python3
import argparse,hashlib,json,os,socket,subprocess,tempfile
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path);args=ap.parse_args()
wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r9-list-and-detail-layout')
source=Path(__file__).parent
out=args.output.resolve() if args.output else Path(tempfile.mkdtemp(prefix='r9-acceptance-'))
if args.output:out.mkdir(exist_ok=False,parents=True)
head='224b03f2da6eefc89d7a055ac95be2d858eaa5c5'
def run(name,cmd,cwd=wt):
 with (out/(name+'.log')).open('x') as f:
  r=subprocess.run([str(v) for v in cmd],cwd=cwd,stdout=f,stderr=subprocess.STDOUT,timeout=120)
 assert r.returncode==0,(name,r.returncode,str(out/(name+'.log')))
def git(*args):return subprocess.check_output(['git','-C',str(wt),*args],text=True).strip()
assert git('rev-parse','HEAD')==head
assert git('branch','--show-current')=='spacedock-ensign/r9-list-and-detail-layout'
assert git('status','--porcelain')==''
print('STEP 1 PASS: exact candidate and clean assigned branch',flush=True)
for name,cmd in [('npm-ci',['npm','ci']),('typecheck',['npm','run','typecheck']),('npm-test',['npm','test'])]:run(name,cmd,wt/'spacedock-bridge')
assert 'tests 254' in (out/'npm-test.log').read_text() and 'fail 0' in (out/'npm-test.log').read_text()
print('STEP 2 PASS: npm ci, typecheck, 254 tests / 0 failed',flush=True)
for index,width in [(3,1440),(4,360)]:
 run('capture-'+str(width),['python3',source/'combined_capture.py','--worktree',wt,'--output',out/str(width),'--paseo','/Users/kent/.local/bin/paseo','--browser','/Users/kent/.npm-global/bin/agent-browser','--web-dist','/Applications/Paseo.app/Contents/Resources/app-dist','--probe','--width',width])
 print('STEP '+str(index)+' PASS: '+str(width)+' board, both views, long links, hover/focus',flush=True)
for width in [1440,360]:
 d=out/str(width);cleanup=json.loads((d/'cleanup.json').read_text());launch=json.loads((d/'launch.json').read_text())
 assert cleanup['home_removed'] and not Path(launch['home']).exists()
 try:os.kill(launch['pid'],0)
 except ProcessLookupError:pass
 else:raise AssertionError('isolated daemon still alive')
 for port in launch['ports']:
  assert port not in (6767,6787) and not 6860<=port<=6935
  with socket.socket() as s:s.settimeout(.2);assert s.connect_ex(('127.0.0.1',port))!=0
 for rel,digest in json.loads((d/'source-identity.json').read_text()).items():assert hashlib.sha256((wt/'spacedock-bridge'/rel).read_bytes()).hexdigest()==digest,rel
 assert len(list(d.glob('*.png')))==8
assert git('rev-parse','HEAD')==head and git('status','--porcelain')==''
print('STEP 5 PASS: source hashes match, daemon stopped, ports closed, homes removed, candidate clean',flush=True)
print('Evidence: '+str(out),flush=True)
