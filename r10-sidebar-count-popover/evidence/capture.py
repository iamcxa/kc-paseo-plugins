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


args=parser.parse_args()
wt=args.worktree.resolve(); dest=args.output.resolve(); dest.mkdir(parents=True,exist_ok=False)
root=Path(tempfile.mkdtemp(prefix='.r10-capture-',dir=wt)); session='r10-'+uuid.uuid4().hex[:10]
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
 (root/'browser.json').write_text(json.dumps({'profile':str(root/'browser-profile'),'plugins':[],'colorScheme':'dark','args':'--host-resolver-rules=MAP localhost ~NOTFOUND'}))
 with (dest/'daemon.log').open('w') as log: process=subprocess.Popen([str(args.paseo),'daemon','run','--home',str(root/'daemon')],cwd=wt,env=env,stdout=log,stderr=log,start_new_session=True)
 wait(lambda:(root/'daemon/paseo.pid').exists());pid=json.loads((root/'daemon/paseo.pid').read_text())['pid']
 (dest/'launch.json').write_text(json.dumps({'pid':pid,'home':str(root),'ports':[port,fleet_port]}))
 installed=run([args.paseo,'plugin','install',plugin,'--home',root/'daemon','--json'],input='y\n');(dest/'install.json').write_text(installed)
 (dest/'plugin-list.json').write_text(run([args.paseo,'plugin','ls','--home',root/'daemon','--json']))
 browser('open',f'http://127.0.0.1:{port}');browser('set','viewport',1440,1000)
 wait(lambda:evaluate('document.body.innerText.includes("Direct connection")'))
 browser('find','text','Direct connection','click');browser('fill','[aria-label="Host"]','127.0.0.1');browser('fill','[aria-label="Port"]',str(port));textclick('Connect')
 wait(lambda:evaluate('Boolean(globalThis.__r10)'))

 for width,height in [(w,h) for w,h in [(1440,1000),(360,780)] if not args.width or w==args.width]:
  browser('set','viewport',width,height)
  browser('wait',400)
  def sidebar():
   if width==360 and not evaluate('Boolean('+el('4 gates and questions waiting for you')+')') and not evaluate('Boolean('+el('Waiting items: sources incomplete')+')'):
    browser('find','role','button','click','--name','Open menu','--exact')
    browser('wait',200)
  for state in ['count','loading','failed','none']:
   evaluate('globalThis.__r10.change('+json.dumps(state)+')');browser('wait',400)
   if state=='count':
    if width==360:
     # The host drawer must be opened before its sidebar row is visible.
     if not evaluate('Boolean('+el('4 gates and questions waiting for you')+')'):
      (dest/f'{width}-menu-snapshot.txt').write_text(browser('snapshot'))
      browser('find','role','button','click','--name','Open menu','--exact');browser('wait',200)
    wait(lambda:evaluate('Boolean('+el('4 gates and questions waiting for you')+')'))
   if state in ['loading','failed']:wait(lambda:evaluate('Boolean('+el('Waiting items: sources incomplete')+')'))
   if state=='none':
    assert not evaluate('Boolean('+el('4 gates and questions waiting for you')+')')
    assert not evaluate('Boolean('+el('Waiting items: sources incomplete')+')')
   snapshot('sidebar-'+state,width)
   if state in ['count','failed']:
    click('4 gates and questions waiting for you' if state=='count' else 'Waiting items: sources incomplete')
    wait(lambda:evaluate('document.body.innerText.includes("Waiting for you")'))
    snapshot('popover-'+state,width)
    if width==360:
     assert evaluate('(()=>{const r='+el('Open Bridge')+'.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()'),'Open Bridge clipped'
     if state=='count':
      scroll='(()=>{let e='+el('Open Should I ask for the next proof? (you)')+';while(e&&!(e.scrollHeight>e.clientHeight&&["auto","scroll"].includes(getComputedStyle(e).overflowY)))e=e.parentElement;return e})()'
      assert evaluate('Boolean('+scroll+')'),'list has no scroll container'
      evaluate(scroll+'.scrollTop=1000');snapshot('popover-tail',width)
      evaluate(scroll+'.scrollTop=0');browser('wait',150)
    if state=='count':
     text=evaluate('document.body.innerText')
     assert 'Gates · 2' in text and 'Questions · 2' in text,text
     assert text.index('Accept the retry proof?')<text.index('Which retry limit should we use?')<text.index('Accept the export result?')<text.index('Should I ask for the next proof?'),text
     click('Open Accept the retry proof?')
     wait(lambda:evaluate('Boolean('+el('Choose 要求修改')+')'))
     assert evaluate('location.href.includes("item=")')
     observations.append({'width':width,'item_opens_detail':True})
    else:
     assert evaluate('document.body.innerText.includes("this list may be incomplete")')
     click('Open Bridge')
     wait(lambda:evaluate('document.body.innerText.includes("By decision")'))
     observations.append({'width':width,'open_bridge_opens_board':True})
    if width==360:
     browser('wait',700)
     click('Back')
     wait(lambda:evaluate('Boolean('+el('Open menu')+')'))
     browser('find','role','button','click','--name','Open menu','--exact');browser('wait',300)
 (dest/'observed.json').write_text(json.dumps(observations,ensure_ascii=False,indent=2))
 print(json.dumps({'captures':sum('state' in x for x in observations),'widths':sorted(set(x['width'] for x in observations))}),flush=True)
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
