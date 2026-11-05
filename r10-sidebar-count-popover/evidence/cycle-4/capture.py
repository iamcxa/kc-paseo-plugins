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
root=Path(tempfile.mkdtemp(prefix='.r10-c4-capture-',dir=wt)); session='r10-'+uuid.uuid4().hex[:10]
with socket.socket() as s:
 s.bind(('127.0.0.1',0)); port=s.getsockname()[1]
assert port not in (6767,6787) and not 6860<=port<=6935
with socket.socket() as s:
 s.bind(('127.0.0.1',0)); fleet_port=s.getsockname()[1]
assert fleet_port not in (6767,6787) and not 6860<=fleet_port<=6935
assert port!=fleet_port
process=None; pid=None; observations=[]
env={k:v for k,v in os.environ.items() if not k.startswith('PASEO_')}
env.update(HOME=str(root/'home'),PASEO_HOME=str(root/'daemon'),PASEO_LISTEN=f'127.0.0.1:{port}',PASEO_RELAY_ENABLED='false',PASEO_WEB_UI_ENABLED='true',PASEO_WEB_UI_DIST_DIR=str(args.web_dist),PASEO_SERVICE_PROXY_ENABLED='false',PATH=str(root/'bin')+':'+os.environ['PATH'])
def run(command,command_env=None,**kwargs):
 p=subprocess.run([str(x) for x in command],cwd=wt,env=command_env or env,text=True,capture_output=True,timeout=kwargs.pop("timeout",90),**kwargs)
 if p.returncode: raise RuntimeError(p.stderr.strip() or p.stdout.strip())
 return p.stdout.strip()
def browser(*command): return run([args.browser,'--namespace',session,'--session',session,'--config',root/'browser.json',*command],command_env=dict(env,HOME=os.environ['HOME']),timeout=25)
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
 for name in ['bridge.tsx','board.tsx','co-chat.tsx','decision-card.tsx','use-co-ask.ts','use-waiting.ts']:
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
 (root/'browser.json').write_text(json.dumps({'profile':str(root/'browser-profile'),'plugins':[],'colorScheme':args.appearance,'args':'--host-resolver-rules=MAP localhost ~NOTFOUND'}))
 with (dest/'daemon.log').open('w') as log: process=subprocess.Popen([str(args.paseo),'daemon','run','--home',str(root/'daemon')],cwd=wt,env=env,stdout=log,stderr=log,start_new_session=True)
 wait(lambda:(root/'daemon/paseo.pid').exists());pid=json.loads((root/'daemon/paseo.pid').read_text())['pid']
 (dest/'launch.json').write_text(json.dumps({'pid':pid,'home':str(root),'ports':[port,fleet_port],'browser_session':session,'browser_namespace':session}))
 installed=run([args.paseo,'plugin','install',plugin,'--home',root/'daemon','--json'],input='y\n');(dest/'install.json').write_text(installed)
 (dest/'plugin-list.json').write_text(run([args.paseo,'plugin','ls','--home',root/'daemon','--json']))
 browser('open',f'http://127.0.0.1:{port}');browser('set','viewport',1440,1000)
 wait(lambda:evaluate('document.body.innerText.includes("Direct connection")'))
 browser('find','text','Direct connection','click');browser('fill','[aria-label="Host"]','127.0.0.1');browser('fill','[aria-label="Port"]',str(port));textclick('Connect')
 wait(lambda:evaluate('Boolean(globalThis.__r10)'))

 width=args.width
 browser('set','viewport',width,780 if width==360 else 1000);browser('wait',500)
 def onscreen(label):
  return evaluate('(()=>{const e='+el(label)+';if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()')
 def show_sidebar():
  if width==360 and not evaluate('(()=>{const e='+el('Bridge')+';if(!e)return false;const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()'):
   browser('find','role','button','click','--name','Open menu','--exact');browser('wait',350)
 def has_popover():return evaluate('document.body.innerText.includes("Waiting for you")')
 def dismiss():
  if width==360:
   click('Open Bridge');browser('wait',700);click('Back');browser('wait',350)
   return
  browser('press','Escape');browser('wait',350)
  if has_popover():
   browser('mouse','move',180 if width==360 else 1000,100);browser('mouse','down');browser('mouse','up');browser('wait',350)
  wait(lambda:not has_popover())
 def count_controls():
  return evaluate('Array.from(document.querySelectorAll("[aria-label]")).filter(e=>e.checkVisibility()&&e.getBoundingClientRect().left>=0&&e.getBoundingClientRect().right<=innerWidth&&(/^[0-9]+ gates and questions waiting for you$/.test(e.getAttribute("aria-label"))||e.getAttribute("aria-label")==="Waiting items: sources incomplete")).map(e=>e.getAttribute("aria-label"))')
 def measured(label):
  return evaluate('''(()=>{const control=__CONTROL__;const leaf=[...control.querySelectorAll('*')].reverse().find(e=>!e.children.length&&e.textContent.trim())||control;const foreground=getComputedStyle(leaf).color;let parent=leaf,background='';while(parent){const c=getComputedStyle(parent).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){background=c;break;}parent=parent.parentElement;}const chain=[];for(let n=leaf;n;n=n.parentElement)chain.push(Number(getComputedStyle(n).opacity));const rgb=c=>(c.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);const lum=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const a=lum(foreground),b=lum(background);return {foreground,background,opacity:chain.reduce((a,b)=>a*b,1),contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};})()'''.replace('__CONTROL__', el(label)))
 show_sidebar()
 wait(lambda:'4 gates and questions waiting for you' in count_controls())
 snapshot('sidebar-count',width)
 click('4 gates and questions waiting for you')
 wait(has_popover)
 wait(lambda:evaluate('document.body.innerText.includes("Gates · 2")&&document.body.innerText.includes("Questions · 2")'))
 browser('wait',400)
 expected=[
  'Open Should I ask for the next proof? (you)',
  'Open Accept the export result?',
  'Open Which retry limit should we use?',
  'Open Accept the retry proof?'
 ]
 actual=evaluate("Array.from(("+el('Waiting items')+").querySelectorAll('[role=button]')).map(e=>e.getAttribute('aria-label'))")
 assert actual==expected,('newest-first order',actual,expected)
 cue=evaluate('document.body.innerText.includes("Scroll to see all 4 items")')
 assert cue==(width==360),(width,'unexpected cue',cue)
 assert onscreen('Open Bridge'),'Open Bridge clipped'
 snapshot('popover-count',width)
 if width==360:
  scroll=el('Waiting items')
  evaluate(scroll+'.scrollTop=1000');browser('wait',200)
  assert onscreen(expected[-1]),'oldest item unreachable'
  assert onscreen('Open Bridge')
  snapshot('popover-tail',width)
 identity={
  'head':run(['git','-C',wt,'rev-parse','HEAD']),
  'appearance':args.appearance,'width':width,'order':actual,
  'ages_minutes':[5,12,35,60],'counts':{'gates':2,'questions':2},
  'compact_scroll_cue':cue,'open_bridge_reachable':True,
  'method':'Production components in installed isolated Paseo web host, deterministic SDK/RPC source injection.'
 }
 (dest/'verification.json').write_text(json.dumps(identity,ensure_ascii=False,indent=2))
 print(json.dumps(identity),flush=True)
except BaseException:
 try:
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
 (dest/'cleanup.json').write_text(json.dumps({'pid':pid,'home_removed':not root.exists(),'ports':[port,fleet_port],'browser_closed':True}))
