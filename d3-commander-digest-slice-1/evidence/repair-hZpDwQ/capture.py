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
 if width==360:
  click('Open menu');browser('wait',450)
 click('Bridge')
 wait(lambda:evaluate('Boolean(__d3.change)'))
 wait(lambda:evaluate('Boolean('+el('Replay trial')+')'))
 snapshot('digest',width)
 click('立即收集')
 assert evaluate('__d3.calls.filter(x=>x.name==="collect").length')==1
 snapshot('collect-now',width)
 click('Replay trial')
 wait(lambda:evaluate('document.body.innerText.includes("引用原文")'))
 snapshot('replay-three-lines',width)
 def fully_visible(label, within=None):
  return evaluate('(()=>{const e='+el(label)+';if(!e)return false;const r=e.getBoundingClientRect();const p='+('('+el(within)+').getBoundingClientRect()' if within else '{top:0,bottom:innerHeight,left:0,right:innerWidth}')+';return r.width>0&&r.top>=p.top&&r.bottom<=p.bottom&&r.left>=p.left&&r.right<=p.right})()')
 for kind in ['about','before','now']:
  assert fully_visible('Replay 脈絡 '+kind,'Replay 內容'),(kind,'initial context clipped')
 for label in ['開啟 FO','繼續討論','回覆新決定']:
  assert fully_visible(label),(label,'initial exit clipped')
 for label in ['about-0','before-0','now-0']:
  click('原文 '+label)
  wait(lambda:evaluate('document.body.innerText.includes("引用原文")&&!document.body.innerText.includes("正在讀取原文")'))
  last=evaluate('__d3.calls.filter(x=>x.name==="replay").at(-1).input.source')
  assert last['seqStart']=={'about-0':3,'before-0':5,'now-0':7}[label]
  snapshot('source-'+label,width)
 click('更早的對話');click('更後的對話')
 scroll=el('Replay 內容')
 evaluate(scroll+'.scrollTop='+scroll+'.scrollHeight')
 browser('wait',200)
 snapshot('replay-expanded-bottom',width)
 assert fully_visible('Replay 選定摘要點'), 'selected point clipped at true bottom'
 assert evaluate(scroll+'.scrollTop+'+scroll+'.clientHeight>='+scroll+'.scrollHeight-1'), 'not true bottom' 
 def visible(label):
  return evaluate('(()=>{const e='+el(label)+';if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()')
 for label in ['開啟 FO','繼續討論','回覆新決定']:assert visible(label),(label,'exit clipped')
 click('繼續討論')
 wait(lambda:visible('Message Comms officer'))
 wait(lambda:evaluate('document.activeElement.getAttribute("aria-label")')=='Message Comms officer')
 assert evaluate('__d3.sent.length')==0
 snapshot('exit-discuss',width)
 fill('Message Comms officer','先說明這次試用的範圍。')
 click('Send to Comms officer')
 wait(lambda:evaluate('__d3.sent.length===1'))
 assert evaluate('__d3.sent[0].text.includes("[Replay point context")&&__d3.sent[0].text.endsWith("先說明這次試用的範圍。")')
 snapshot('context-sent',width)
 click('Replay trial');wait(lambda:evaluate('document.body.innerText.includes("引用原文")'))
 click('回覆新決定')
 assert evaluate('__d3.sent.length')==1
 wait(lambda:evaluate('document.activeElement.getAttribute("aria-label")')=='Message Comms officer')
 assert evaluate('Array.from(document.querySelectorAll("[aria-label] ")).filter(e=>e.checkVisibility()).every(e=>!e.getAttribute("aria-label").startsWith("Choose "))')
 snapshot('exit-new-decision',width)
 click('移除摘要上下文')
 fill('Message Comms officer','保留的 Commander 草稿')
 click('Replay trial');wait(lambda:evaluate('document.body.innerText.includes("引用原文")'))
 click('開啟 FO')
 wait(lambda:visible('Message 試用 FO'))
 assert evaluate('document.body.innerText.includes("範例團隊試用範圍")')
 assert visible('Back to Commander')
 assert not evaluate('Array.from(document.querySelectorAll("[aria-label]")).filter(e=>e.checkVisibility()).some(e=>e.getAttribute("aria-label").startsWith("Choose "))')
 fill('Message 試用 FO','保留的 FO 草稿')
 snapshot('exit-open-fo-arrival',width)
 click('Back to Commander')
 wait(lambda:visible('Message Comms officer'))
 assert evaluate(el('Message Comms officer')+'.value')=='保留的 Commander 草稿'
 snapshot('open-fo-return',width)
 click('Replay trial');click('開啟 FO')
 wait(lambda:visible('Message 試用 FO'))
 assert evaluate(el('Message 試用 FO')+'.value')=='保留的 FO 草稿'
 assert evaluate('__d3.sent.length')==1
 click('Back to Commander')
 click('Replay booking');wait(lambda:evaluate('document.body.innerText.includes("引用原文")'))
 assert evaluate('__d3.calls.filter(x=>x.name==="replay").at(-1).input.source.agentId')=='booking-fo'
 snapshot('point-booking',width)
 click('繼續討論');click('Replay trial');wait(lambda:evaluate('document.body.innerText.includes("引用原文")'))
 assert evaluate('__d3.calls.filter(x=>x.name==="replay").at(-1).input.source.agentId')=='trial-fo'
 snapshot('point-trial-again',width)
 click('繼續討論')
 evaluate('__d3.change("long")')
 wait(lambda:evaluate('Boolean('+el('Replay trial')+')'))
 click('Replay trial');wait(lambda:evaluate('document.body.innerText.includes("長原文 35")'))
 snapshot('long-original-top',width)
 scroll=el('Replay 內容')
 evaluate(scroll+'.scrollTop='+scroll+'.scrollHeight')
 browser('wait',200)
 assert fully_visible('Replay 選定摘要點')
 assert evaluate(scroll+'.scrollTop+'+scroll+'.clientHeight>='+scroll+'.scrollHeight-1')
 for label in ['開啟 FO','繼續討論','回覆新決定']: assert fully_visible(label)
 snapshot('long-original-bottom',width)
 click('繼續討論')
 evaluate('__d3.change("missing")')
 wait(lambda:evaluate('Boolean('+el('Replay trial')+')'))
 click('Replay trial');wait(lambda:evaluate('document.body.innerText.includes("來源不可用")'))
 snapshot('source-unavailable',width)
 assert not evaluate('Boolean('+el('Replay 脈絡 about')+')')
 assert evaluate('document.body.innerText.includes("請求的原文 · 試用 FO · #3")')
 assert fully_visible('Replay 選定摘要點')
 browser('press','Escape');browser('wait',300)
 evaluate('__d3.change("switch")')
 wait(lambda:visible('換用新的通訊官'))
 snapshot('switch-offer',width)
 click('換用新的通訊官')
 assert evaluate('__d3.archive.length')==0
 snapshot('switch-confirm',width)
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
