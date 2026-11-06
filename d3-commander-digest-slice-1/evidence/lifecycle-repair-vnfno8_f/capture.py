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
root=Path(tempfile.mkdtemp(prefix='.d3-capture-',dir=wt)); session='d3-'+uuid.uuid4().hex[:10]
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
 browser('wait',700)
 def locate():return evaluate('(()=>{const e='+el(label)+';if(!e)return {hit:false};e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {x:r.x+r.width/2,y:r.y+r.height/2,hit:r.width>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&e.contains(h)}})()')
 wait(lambda:locate()['hit'])
 position=locate()
 assert position['hit'],(label,position)
 browser('mouse','move',round(position['x']),round(position['y']));browser('mouse','down');browser('wait',30);browser('mouse','up')
 if label.startswith('Replay '):browser('wait',1000)

def bottom():
 before=evaluate("(()=>{const label=document.body.innerText.includes('後段未能讀取')?'更後的對話 · 重試':'沒有更後的對話';const target=Array.from(document.querySelectorAll('*')).find(e=>e.checkVisibility()&&e.children.length===0&&e.textContent.trim()===label);const footer=Array.from(document.querySelectorAll('[aria-label]')).find(e=>e.checkVisibility()&&e.getAttribute('aria-label')==='開啟 FO');const title=Array.from(document.querySelectorAll('[aria-label]')).find(e=>e.checkVisibility()&&e.getAttribute('aria-label')==='Replay 選定摘要點');if(!target||!footer||!title)throw Error('missing Replay geometry');const r=target.getBoundingClientRect(),f=footer.getBoundingClientRect(),t=title.getBoundingClientRect();return {label,y:r.y,bottomY:r.bottom,h:r.height,footerY:f.y,titleBottom:t.bottom,x:innerWidth/2,mouseY:(t.bottom+f.y)/2,visible:r.height>0&&r.y>t.bottom&&r.bottom<=f.y};})()")
 browser('mouse','move',round(before['x']),round(before['mouseY']))
 browser('mouse','wheel',1800);browser('wait',300)
 one=evaluate("(()=>{const label=document.body.innerText.includes('後段未能讀取')?'更後的對話 · 重試':'沒有更後的對話';const target=Array.from(document.querySelectorAll('*')).find(e=>e.checkVisibility()&&e.children.length===0&&e.textContent.trim()===label);const footer=Array.from(document.querySelectorAll('[aria-label]')).find(e=>e.checkVisibility()&&e.getAttribute('aria-label')==='開啟 FO');const title=Array.from(document.querySelectorAll('[aria-label]')).find(e=>e.checkVisibility()&&e.getAttribute('aria-label')==='Replay 選定摘要點');if(!target||!footer||!title)throw Error('missing Replay geometry');const r=target.getBoundingClientRect(),f=footer.getBoundingClientRect(),t=title.getBoundingClientRect();return {label,y:r.y,bottomY:r.bottom,h:r.height,footerY:f.y,titleBottom:t.bottom,x:innerWidth/2,mouseY:(t.bottom+f.y)/2,visible:r.height>0&&r.y>t.bottom&&r.bottom<=f.y};})()")
 browser('mouse','wheel',1800);browser('wait',300)
 two=evaluate("(()=>{const label=document.body.innerText.includes('後段未能讀取')?'更後的對話 · 重試':'沒有更後的對話';const target=Array.from(document.querySelectorAll('*')).find(e=>e.checkVisibility()&&e.children.length===0&&e.textContent.trim()===label);const footer=Array.from(document.querySelectorAll('[aria-label]')).find(e=>e.checkVisibility()&&e.getAttribute('aria-label')==='開啟 FO');const title=Array.from(document.querySelectorAll('[aria-label]')).find(e=>e.checkVisibility()&&e.getAttribute('aria-label')==='Replay 選定摘要點');if(!target||!footer||!title)throw Error('missing Replay geometry');const r=target.getBoundingClientRect(),f=footer.getBoundingClientRect(),t=title.getBoundingClientRect();return {label,y:r.y,bottomY:r.bottom,h:r.height,footerY:f.y,titleBottom:t.bottom,x:innerWidth/2,mouseY:(t.bottom+f.y)/2,visible:r.height>0&&r.y>t.bottom&&r.bottom<=f.y};})()")
 if not two['visible']:
  diagnostic=evaluate("""(()=>{const label=document.body.innerText.includes('後段未能讀取')?'更後的對話 · 重試':'沒有更後的對話';const target=Array.from(document.querySelectorAll('*')).find(e=>e.checkVisibility()&&e.children.length===0&&e.textContent.trim()===label);const ancestors=[];for(let e=target;e;e=e.parentElement)ancestors.push({tag:e.tagName,label:e.getAttribute('aria-label'),h:e.clientHeight,total:e.scrollHeight,top:e.scrollTop,overflow:getComputedStyle(e).overflowY,rect:{y:e.getBoundingClientRect().y,h:e.getBoundingClientRect().height}});target.scrollIntoView({block:'end'});return ancestors;})()""")
  observations.append({'scrollAncestors':diagnostic})
  browser('wait',300)
  one=evaluate("(()=>{const label=document.body.innerText.includes('後段未能讀取')?'更後的對話 · 重試':'沒有更後的對話';const target=Array.from(document.querySelectorAll('*')).find(e=>e.checkVisibility()&&e.children.length===0&&e.textContent.trim()===label);const footer=Array.from(document.querySelectorAll('[aria-label]')).find(e=>e.checkVisibility()&&e.getAttribute('aria-label')==='開啟 FO');const title=Array.from(document.querySelectorAll('[aria-label]')).find(e=>e.checkVisibility()&&e.getAttribute('aria-label')==='Replay 選定摘要點');if(!target||!footer||!title)throw Error('missing Replay geometry');const r=target.getBoundingClientRect(),f=footer.getBoundingClientRect(),t=title.getBoundingClientRect();return {label,y:r.y,bottomY:r.bottom,h:r.height,footerY:f.y,titleBottom:t.bottom,x:innerWidth/2,mouseY:(t.bottom+f.y)/2,visible:r.height>0&&r.y>t.bottom&&r.bottom<=f.y};})()")
  two=one
 assert two['visible'] and abs(two['y']-one['y'])<1 and abs(two['footerY']-before['footerY'])<1 and abs(two['titleBottom']-before['titleBottom'])<1,(before,one,two)
 observations.append({'scrollBottom':{'bottom':True,'method':'wheel and native end-marker scrolling; visible marker and stationary fixed areas','before':before,'after':two}})

def fill(label,text):
 wait(lambda:evaluate('Boolean('+el(label)+')'))
 evaluate('(()=>{const e='+el(label)+';e.focus();e.select()})()');browser('keyboard','inserttext',text)
 assert evaluate(el(label)+'.value')==text,(label,'visible value did not retain input')

def prefix(text): return 'Array.from(document.querySelectorAll("[role=button],[role=tab]")).filter(e=>e.checkVisibility()).find(e=>e.textContent.trim().startsWith('+json.dumps(text)+'))'
def textclick(text): evaluate(prefix(text)+'.click()')
def open_gate(): click('Accept the retry proof before continuing? — Demo FO')
def snapshot(name,width):
 browser('wait',900)
 browser('screenshot',dest/f'{width}-{name}.png')
 info=evaluate('''(()=>({text:document.body.innerText,overflow:document.documentElement.scrollWidth>innerWidth,rows:Array.from(document.querySelectorAll('[role=button],[role=link]')).filter(e=>e.checkVisibility()).map(e=>({label:e.getAttribute('aria-label'),text:e.textContent,rect:(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()}))}))()''')
 info.update(state=name,width=width,active=evaluate('document.activeElement.getAttribute("aria-label")')); observations.append(info)
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
 for name in ['bridge.tsx','board.tsx','co-chat.tsx','decision-card.tsx','use-co-ask.ts','use-waiting.ts','digest.tsx','use-verification.ts']:
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
 (root/'browser.json').write_text(json.dumps({'profile':str(root/'browser-profile'),'plugins':[],'colorScheme':args.appearance,'args':'--host-resolver-rules=MAP localhost ~NOTFOUND'}))
 with (dest/'daemon.log').open('w') as log: process=subprocess.Popen([str(args.paseo),'daemon','run','--home',str(root/'daemon')],cwd=wt,env=env,stdout=log,stderr=log,start_new_session=True)
 wait(lambda:(root/'daemon/paseo.pid').exists());pid=json.loads((root/'daemon/paseo.pid').read_text())['pid']
 (dest/'launch.json').write_text(json.dumps({'pid':pid,'home':str(root),'ports':[port,fleet_port],'browser_session':session,'browser_namespace':session}))
 installed=run([args.paseo,'plugin','install',plugin,'--home',root/'daemon','--json'],input='y\n');(dest/'install.json').write_text(installed)
 (dest/'plugin-list.json').write_text(run([args.paseo,'plugin','ls','--home',root/'daemon','--json']))
 browser('open',f'http://127.0.0.1:{port}');browser('set','viewport',1440,1000)
 wait(lambda:evaluate('document.body.innerText.includes("Direct connection")'))
 browser('find','text','Direct connection','click');browser('fill','[aria-label="Host"]','127.0.0.1');browser('fill','[aria-label="Port"]',str(port));textclick('Connect')
 wait(lambda:evaluate('Boolean(globalThis.__d3)'))

 width=args.width
 browser('set','viewport',width,780 if width==360 else 1000)
 if width==360:click('Open menu')
 wait(lambda:evaluate('Boolean('+el('2 gates and questions waiting for you')+')'))

 click('2 gates and questions waiting for you')
 wait(lambda:evaluate('document.body.innerText.includes("Waiting for you")'))
 click('Open Bridge');browser('wait',700)
 if not evaluate('Boolean(__d3.change)'):click('Open Bridge')
 wait(lambda:evaluate('Boolean(__d3.change)'))
 if width==360 and evaluate('Boolean('+el('Board')+')'):click('Board')
 wait(lambda:evaluate('document.body.innerText.includes("Choose the fictional direction")'))

 click('Back to Commander' if width==360 else 'Commander')
 evaluate('__d3.change("projected")')
 click('Back to Commander' if width==360 else 'Commander')
 wait(lambda:evaluate('Boolean('+el('Replay trial')+')'))
 evaluate('__d3.phase("source-running")')
 wait(lambda:evaluate('Boolean('+el('重新核對摘要')+')&&!Boolean('+el('Replay trial')+')'))
 snapshot('pinned-source-streaming',width)
 evaluate('__d3.phase("source-completed")')
 wait(lambda:evaluate('Boolean('+el('Replay trial')+')'))
 snapshot('digest-completion-recovered',width)
 evaluate('__d3.phase("neighbour-running")')
 wait(lambda:evaluate('Boolean('+el('Replay trial')+')'))
 evaluate('__d3.pending=true')
 click('Replay trial')
 wait(lambda:evaluate('document.body.innerText.includes("正在讀取原文")'))
 snapshot('replay-verification-pending',width)
 evaluate('__d3.pending=false;__d3.release()')
 wait(lambda:evaluate('document.body.innerText.includes("後段未能讀取")'))
 bottom()
 snapshot('replay-neighbour-streaming',width)
 evaluate('__d3.phase("neighbour-completed")')
 wait(lambda:evaluate('document.body.innerText.includes("FO 回報 · #16–20")&&document.body.innerText.includes("沒有更後的對話")'))
 bottom()
 snapshot('replay-neighbour-completed',width)
 assert not evaluate('__d3.sent.length||__d3.opened.length||__d3.archive.length')
 (dest/'fixture-events.json').write_text(json.dumps(evaluate('({calls:__d3.calls,sent:__d3.sent,opened:__d3.opened,archive:__d3.archive})'),ensure_ascii=False,indent=2))
 print(json.dumps({'width':width,'captures':sum('state' in x for x in observations)}),flush=True)
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
