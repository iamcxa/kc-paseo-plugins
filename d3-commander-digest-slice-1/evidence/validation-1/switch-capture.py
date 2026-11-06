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
parser.add_argument('--width',type=int,choices=[360,1440],required=True)
parser.add_argument('--appearance',choices=['dark','light'],required=True)


args=parser.parse_args()
wt=args.worktree.resolve(); dest=args.output.resolve(); dest.mkdir(parents=True,exist_ok=False)
root=Path(tempfile.mkdtemp(prefix='.d3-capture-',dir=wt)); session='d3-'+uuid.uuid4().hex[:6]
with socket.socket() as s:
 s.bind(('127.0.0.1',0)); port=s.getsockname()[1]
assert port not in (6767,6787) and not 6860<=port<=6935
with socket.socket() as s:
 s.bind(('127.0.0.1',0)); fleet_port=s.getsockname()[1]
assert fleet_port not in (6767,6787) and not 6860<=fleet_port<=6935
assert port!=fleet_port
socket_root=Path(tempfile.mkdtemp(prefix='v1-',dir='/tmp'))
process=None; pid=None; observations=[]
env={k:v for k,v in os.environ.items() if not k.startswith('PASEO_')}
env.update(AGENT_BROWSER_SOCKET_DIR=str(socket_root),HOME=str(root/'home'),PASEO_HOME=str(root/'daemon'),PASEO_LISTEN=f'127.0.0.1:{port}',PASEO_RELAY_ENABLED='false',PASEO_WEB_UI_ENABLED='true',PASEO_WEB_UI_DIST_DIR=str(args.web_dist),PASEO_SERVICE_PROXY_ENABLED='false',PATH=str(root/'bin')+':'+os.environ['PATH'])
def run(command,command_env=None,**kwargs):
 p=subprocess.run([str(x) for x in command],cwd=wt,env=command_env or env,text=True,capture_output=True,timeout=kwargs.pop("timeout",90),**kwargs)
 if p.returncode: raise RuntimeError(p.stderr.strip() or p.stdout.strip())
 return p.stdout.strip()
def browser(*command): return run([args.browser,'--namespace',session,'--session',session,'--config',root/'browser.json',*command],command_env=env,timeout=25)
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
 def locate():return evaluate('(()=>{const e='+el(label)+';if(!e)return {hit:false};e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {x:r.x+r.width/2,y:r.y+r.height/2,hit:r.width>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&e.contains(h)}})()')
 wait(lambda:locate()['hit'])
 position=locate()
 assert position['hit'],(label,position)
 browser('mouse','move',round(position['x']),round(position['y']));browser('mouse','down');browser('wait',30);browser('mouse','up')
 if label.startswith('Replay '):browser('wait',1000)

def fill(label,text):
 wait(lambda:evaluate('Boolean('+el(label)+')'))
 evaluate('(()=>{const e='+el(label)+';e.focus();e.select()})()');browser('keyboard','inserttext',text)
 assert evaluate(el(label)+'.value')==text,(label,'visible value did not retain input')

def prefix(text): return 'Array.from(document.querySelectorAll("[role=button],[role=tab]")).filter(e=>e.checkVisibility()).find(e=>e.textContent.trim().startsWith('+json.dumps(text)+'))'
def textclick(text): evaluate(prefix(text)+'.click()')
def open_gate(): click('Accept the retry proof before continuing? — Demo FO')
def visible(label):
 return evaluate('(()=>{const e='+el(label)+';if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()')
def snapshot(name,width):
 browser('wait',900)
 browser('screenshot',dest/f'{width}-{name}.png')
 info=evaluate('''(()=>({text:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth,rows:Array.from(document.querySelectorAll('[role=button],[role=link]')).filter(e=>e.checkVisibility()).map(e=>({label:e.getAttribute('aria-label'),text:e.textContent,rect:(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()}))}))()''')
 info.update(state=name,width=width,active=evaluate('document.activeElement.getAttribute("aria-label")'),events=evaluate('({calls:__d3.calls,sent:__d3.sent,archive:__d3.archive})')); observations.append(info)
 if name in ['exit-discuss','exit-new-decision']:assert info['active']=='Message Comms officer'
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
 (plugin/'index.server.ts').write_text('export default function contribute() { return () => {}; }\n')
 shutil.copyfile(Path(__file__).with_name('proof-host.tsx'),plugin/'client/proof-host.tsx')
 # Only dependency injection changes in the disposable copy; production component JSX is retained.
 for name in ['bridge.tsx','board.tsx','co-chat.tsx','decision-card.tsx','use-co-ask.ts','use-waiting.ts','digest.tsx']:
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
 p=plugin/'index.client.tsx';p.write_text(p.read_text().replace('import { BoardItem } from "./client/sidebar-waiting";','import { ProofSidebar as BoardItem } from "./client/proof-host";'))
 p=plugin/'index.client.tsx';s=p.read_text().replace('import { Bridge } from \"./client/bridge\";', 'import { ProofScreen as Bridge } from \"./client/proof-host\";');p.write_text(s)
 (root/'browser.json').write_text(json.dumps({'profile':str(root/'browser-profile'),'plugins':[],'colorScheme':args.appearance,'executablePath':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','args':'--host-resolver-rules=MAP localhost ~NOTFOUND'}))
 with (dest/'daemon.log').open('w') as log: process=subprocess.Popen([str(args.paseo),'daemon','run','--home',str(root/'daemon')],cwd=wt,env=env,stdout=log,stderr=log,start_new_session=True)
 wait(lambda:(root/'daemon/paseo.pid').exists());pid=json.loads((root/'daemon/paseo.pid').read_text())['pid']
 (dest/'launch.json').write_text(json.dumps({'pid':pid,'home':str(root),'ports':[port,fleet_port],'browser_session':session,'browser_namespace':session}))
 installed=run([args.paseo,'plugin','install',plugin,'--home',root/'daemon','--json'],input='y\n');(dest/'install.json').write_text(installed)
 (dest/'plugin-list.json').write_text(run([args.paseo,'plugin','ls','--home',root/'daemon','--json']))
 browser('open',f'http://127.0.0.1:{port}');browser('set','viewport',1440,1000)
 evaluate('localStorage.setItem("@paseo:app-settings",JSON.stringify({language:"en",theme:'+json.dumps(args.appearance)+'}));true')
 browser('reload')
 wait(lambda:evaluate('document.body.innerText.includes("Direct connection")'))
 browser('find','text','Direct connection','click');browser('fill','[aria-label="Host"]','127.0.0.1');browser('fill','[aria-label="Port"]',str(port));textclick('Connect')
 wait(lambda:evaluate('Boolean(globalThis.__d3)'))

 width=args.width
 browser('set','viewport',width,780 if width==360 else 1000)
 if width==360:
  click('Open menu');browser('wait',450)
 click('Bridge')
 wait(lambda:evaluate('Boolean(__d3.change)'))
 wait(lambda:evaluate('Boolean('+el('Replay trial')+')'))
 evaluate('__d3.change("switch")')
 wait(lambda:visible('換用新的通訊官'))
 snapshot('switch-offer',width)
 click('換用新的通訊官')
 assert evaluate('__d3.archive.length')==0
 snapshot('switch-confirm',width)
 click('取消換用')
 browser('wait',1800)
 wait(lambda:not evaluate('Boolean('+el('確認換用並封存舊官')+')'))
 assert evaluate('__d3.archive.length')==0
 click('換用新的通訊官')
 browser('wait',1800)
 click('確認換用並封存舊官')
 wait(lambda:visible('讀取舊通訊官對話'))
 assert evaluate('__d3.archive.length')==1
 click('讀取舊通訊官對話')
 wait(lambda:evaluate('document.body.innerText.includes("舊通訊官：先前的虛構討論保留在這裡")'))
 assert not evaluate('Boolean('+el('Message Previous comms officer')+')')
 snapshot('old-conversation-after-switch',width)
 (dest/'fixture-events.json').write_text(json.dumps(evaluate('({calls:__d3.calls,sent:__d3.sent,opened:__d3.opened,archive:__d3.archive})'),ensure_ascii=False,indent=2))
 print(json.dumps({'width':width,'captures':sum('state' in x for x in observations)}),flush=True)
except BaseException:
 try:
  (dest/'error-events.json').write_text(json.dumps(evaluate('({calls:__d3.calls,archive:__d3.archive,switched:__d3.switched})'),ensure_ascii=False,indent=2))
  browser('screenshot',dest/'error.png')
  (dest/'error-snapshot.txt').write_text(browser('snapshot'))
 except Exception:pass
 raise
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
 shutil.rmtree(socket_root)
 (dest/'cleanup.json').write_text(json.dumps({'pid':pid,'home_removed':not root.exists(),'ports':[port,fleet_port],'browser_closed':True}))
