#!/usr/bin/env python3
"""Capture the candidate Bridge with deterministic SDK/RPC fixtures in an isolated Paseo host."""
import argparse, hashlib, json, os, shutil, signal, socket, subprocess, tempfile, time, uuid
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--worktree',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
parser.add_argument('--paseo',type=Path,default=Path('/Users/kent/.local/bin/paseo'))
parser.add_argument('--browser',type=Path,default=Path('/Users/kent/.npm-global/bin/agent-browser'))
parser.add_argument('--web-dist',type=Path,default=Path('/Applications/Paseo.app/Contents/Resources/app-dist'))
parser.add_argument('--width',type=int,choices=[360,1440])
parser.add_argument('--probe',action='store_true')
parser.add_argument('--scroll-only',action='store_true')
args=parser.parse_args()
assert args.width in (1440,360), 'capture one width per invocation'
wt=args.worktree.resolve(); dest=args.output.resolve(); dest.mkdir(parents=True,exist_ok=False)
root=Path(tempfile.mkdtemp(prefix='.r9-capture-',dir=wt)); session='r9-'+uuid.uuid4().hex[:10]
def free_port():
 while True:
  with socket.socket() as s:
   s.bind(('127.0.0.1',0)); value=s.getsockname()[1]
  if value not in (6767,6787) and not 6860<=value<=6935: return value
port=free_port(); fleet_port=free_port()
while fleet_port==port: fleet_port=free_port()
process=None; pid=None; observations=[]
env={k:v for k,v in os.environ.items() if not k.startswith('PASEO_')}
env.update(HOME=str(root/'home'),PASEO_HOME=str(root/'daemon'),PASEO_LISTEN=f'127.0.0.1:{port}',PASEO_RELAY_ENABLED='false',PASEO_WEB_UI_ENABLED='true',PASEO_WEB_UI_DIST_DIR=str(args.web_dist),PASEO_SERVICE_PROXY_ENABLED='false',PATH=str(root/'bin')+':'+os.environ['PATH'])
def run(command,command_env=None,**kwargs):
 p=subprocess.run([str(x) for x in command],cwd=wt,env=command_env or env,text=True,capture_output=True,timeout=90,**kwargs)
 if p.returncode: raise RuntimeError(p.stderr.strip() or p.stdout.strip())
 return p.stdout.strip()
def browser(*command): return run([args.browser,'--session',session,'--config',root/'browser.json',*command],command_env=dict(env,HOME=os.environ['HOME']))
def evaluate(code): return json.loads(browser('eval',code))
def wait(predicate):
 end=time.monotonic()+45
 while time.monotonic()<end:
  if predicate(): return
  time.sleep(.2)
 raise TimeoutError('fixture did not become ready')
def el(label): return 'Array.from(document.querySelectorAll("[aria-label]")).filter(e=>e.checkVisibility()).find(e=>e.getAttribute("aria-label")==='+json.dumps(label,ensure_ascii=False)+')'
def click(label):
 wait(lambda:evaluate('Boolean('+el(label)+')'))
 position=evaluate('(()=>{const e='+el(label)+';e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(h)}})()')
 assert position['hit'],(label,position)
 browser('mouse','move',round(position['x']),round(position['y']));browser('mouse','down');browser('wait',30);browser('mouse','up')

def fill(label,text):
 wait(lambda:evaluate('Boolean('+el(label)+')'))
 evaluate('(()=>{const e='+el(label)+';e.focus();e.select()})()');browser('keyboard','inserttext',text)
 assert evaluate(el(label)+'.value')==text,(label,'visible value did not retain input')

def prefix(text): return 'Array.from(document.querySelectorAll("[role=button],[role=tab]")).filter(e=>e.checkVisibility()).find(e=>e.textContent.trim().startsWith('+json.dumps(text)+'))'
def textclick(text): evaluate(prefix(text)+'.click()')
def open_gate(): click('Accept the retry proof before continuing? — Demo FO')
def snapshot(name,width):
 browser('wait',200)
 browser('screenshot',dest/f'{width}-{name}.png')
 info=evaluate('''(()=>({text:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth,rows:Array.from(document.querySelectorAll('[role=button],[role=link]')).filter(e=>e.checkVisibility()).map(e=>({label:e.getAttribute('aria-label'),text:e.textContent,rect:(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()}))}))()''')
 info.update(state=name,width=width); observations.append(info)
 (dest/'observed.json').write_text(json.dumps(observations,ensure_ascii=False,indent=2))
 assert not info['overflow'], (name,width,'horizontal overflow')
try:
 for p in ['home','daemon','bin']: (root/p).mkdir()
 (root/'daemon/config.json').write_text(json.dumps({'pluginsEnabled':True}))
 for name in ['gh','spacedock']:
  p=root/'bin'/name;p.write_text('#!/bin/sh\nprintf \'[]\\n\'\n');p.chmod(0o755)
 plugin=root/'plugin';shutil.copytree(wt/'spacedock-bridge',plugin,ignore=shutil.ignore_patterns('node_modules'))
 (dest/'source-identity.json').write_text(json.dumps({str(p.relative_to(plugin)):hashlib.sha256(p.read_bytes()).hexdigest() for p in plugin.rglob('*') if p.is_file()},indent=2))
 (plugin/'node_modules').symlink_to(wt/'spacedock-bridge/node_modules',target_is_directory=True)
 p=plugin/'server/fleet-mcp.ts';s=p.read_text();assert 'const PORT = 6787;' in s;p.write_text(s.replace('const PORT = 6787;',f'const PORT = {fleet_port};'))
 shutil.copyfile(Path(__file__).with_name('proof-host.tsx'),plugin/'client/proof-host.tsx')
 # Only dependency injection changes in the disposable copy; production component JSX is retained.
 for name in ['bridge.tsx','board.tsx','co-chat.tsx','decision-card.tsx','use-co-ask.ts']:
  p=plugin/'client'/name;s=p.read_text()
  import re
  used=[]
  def replace(m):
   names=[x.strip() for x in m.group(1).split(',')]
   mocks=[x for x in names if x in ('usePaseo','useRpc')]; used.extend(mocks)
   keep=[x for x in names if x not in mocks]
   return 'import { '+', '.join(keep)+' } from "@getpaseo/plugin/client";' if keep else ''
  s=re.sub(r'import \{ ([^\n]+) \} from "@getpaseo/plugin/client";',replace,s)
  if used:s='import { '+', '.join(used)+' } from "./proof-host";\n'+s
  p.write_text(s)
 p=plugin/'index.client.tsx';p.write_text(p.read_text().replace('import { Bridge } from "./client/bridge";','import { ProofBridge as Bridge } from "./client/proof-host";'))
 (root/'browser.json').write_text(json.dumps({'profile':str(root/'browser-profile'),'plugins':[],'colorScheme':'dark','args':'--host-resolver-rules=MAP localhost ~NOTFOUND'}))
 with (dest/'daemon.log').open('w') as log: process=subprocess.Popen([str(args.paseo),'daemon','run','--home',str(root/'daemon')],cwd=wt,env=env,stdout=log,stderr=log,start_new_session=True)
 wait(lambda:(root/'daemon/paseo.pid').exists());pid=json.loads((root/'daemon/paseo.pid').read_text())['pid']
 (dest/'launch.json').write_text(json.dumps({'pid':pid,'home':str(root),'ports':[port,fleet_port]}))
 installed=run([args.paseo,'plugin','install',plugin,'--home',root/'daemon','--json'],input='y\n');(dest/'install.json').write_text(installed)
 (dest/'plugin-list.json').write_text(run([args.paseo,'plugin','ls','--home',root/'daemon','--json']))
 browser('open',f'http://127.0.0.1:{port}');browser('set','viewport',1440,1000)
 wait(lambda:evaluate('document.body.innerText.includes("Direct connection")'))
 browser('find','text','Direct connection','click');browser('fill','[aria-label="Host"]','127.0.0.1');browser('fill','[aria-label="Port"]',str(port));textclick('Connect')
 wait(lambda:evaluate('Boolean('+prefix('Bridge')+')'));textclick('Bridge')
 wait(lambda:evaluate('Boolean(globalThis.__r9)'))
 width=args.width; height=1000 if width==1440 else 780
 browser('set','viewport',width,height);browser('wait',400)
 if not evaluate('Boolean('+el('Message Comms officer')+')'):
  (dest/'phone-before-menu.txt').write_text(browser('snapshot','-i'))
  evaluate('document.querySelector(\'[aria-label="Open menu"]\')?.click()')
  wait(lambda:evaluate('Boolean('+prefix('Bridge')+')'))
  textclick('Bridge');evaluate('document.querySelector(\'[aria-label="Close menu"]\')?.click()')
 wait(lambda:evaluate('Boolean('+el('Message Comms officer')+')'))
 (dest/'head.json').write_text(json.dumps({'sha':run(['git','rev-parse','HEAD']),'width':width,'hostFixture':'proof-host.tsx','fixtureHash':hashlib.sha256(Path(__file__).with_name('proof-host.tsx').read_bytes()).hexdigest()}))
 for state in ['board','sent','relayed']:
  evaluate('globalThis.__r9.scenarioChange("'+('board' if state=='board' else 'list-'+state)+'")');browser('wait',300)
  if state!='board':evaluate('globalThis.__r9.progress("'+state+'")')
  if width==360:click('Board')
  if state!='board':
   open_gate();click('Board')
  for view in ['decision','FO']:
   textclick('By '+view);browser('wait',200)
   text=evaluate('document.body.innerText')
   assert 'Board · 7' in text, (state,view,width,text)
   assert 'Waiting on you' not in text
   if state!='board':assert ('Waiting for relay' if state=='sent' else 'Waiting for record') in text
   header=evaluate('(()=>{const e=Array.from(document.querySelectorAll(\'div\')).find(e=>e.checkVisibility()&&!e.children.length&&e.textContent===\'Board · 7\');e.scrollIntoView({block: "nearest"});const r=e.getBoundingClientRect();return {y:r.y,bottom:r.bottom}})()')
   assert header['y']>=0 and header['bottom']<=height,(width,state,view,header)
   snapshot(state+'-by-'+view,width)
 evaluate('globalThis.__r9.scenarioChange("fo-no-waiting")');browser('wait',300)
 if width==360:click('Board')
 textclick('By FO');click('Conversation with Research FO')
 detail=evaluate('(()=>{let e='+el('Message Research FO')+';while(e&&!e.querySelector(\'[aria-label=\"Back to list\"]\'))e=e.parentElement;return {text:e?.innerText,hasBriefingControls:Boolean(e?.querySelector(\'[aria-label=\"Hide briefing\"],[aria-label=\"Show briefing\"],[role=\"adjustable\"]\'))}})()')
 assert detail['text'] and 'Research FO' in detail['text']
 assert 'QUESTION' not in detail['text'] and not detail['hasBriefingControls']
 import re
 assert not re.search(r'waiting \d+[smhd]',detail['text']),detail
 snapshot('fo-no-waiting',width)
 (dest/'detail-assertion.json').write_text(json.dumps(detail,ensure_ascii=False,indent=2))
 print(json.dumps({'captures':len(observations),'width':width,'states':[o['state'] for o in observations]}),flush=True)

finally:
 try:browser('close')
 except Exception:pass
 if pid:
  try:os.kill(pid,signal.SIGTERM)
  except ProcessLookupError:pass
 if process:
  try:process.wait(timeout=15)
  except subprocess.TimeoutExpired:
   if pid:os.kill(pid,signal.SIGKILL)
   process.wait(timeout=5)
 for _ in range(5):
  try:shutil.rmtree(root);break
  except OSError:time.sleep(.2)
 closed_ports=[]
 for value in [port,fleet_port]:
  with socket.socket() as probe:
   probe.settimeout(.2);closed_ports.append(probe.connect_ex(('127.0.0.1',value))!=0)
 (dest/'cleanup.json').write_text(json.dumps({'pid':pid,'home_removed':not root.exists(),'ports':[port,fleet_port],'browser_closed':True,'portsClosed':closed_ports}))
