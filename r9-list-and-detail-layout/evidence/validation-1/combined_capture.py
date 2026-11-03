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
 pid=process.pid
 (dest/'launch-pending.json').write_text(json.dumps({'pid':pid,'home':str(root),'ports':[port,fleet_port]}))
 def pid_ready():
  try: return isinstance(json.loads((root/'daemon/paseo.pid').read_text()).get('pid'),int)
  except (OSError,ValueError): return False
 wait(pid_ready);pid=json.loads((root/'daemon/paseo.pid').read_text())['pid']
 (dest/'launch.json').write_text(json.dumps({'pid':pid,'home':str(root),'ports':[port,fleet_port]}))
 installed=run([args.paseo,'plugin','install',plugin,'--home',root/'daemon','--json'],input='y\n');(dest/'install.json').write_text(installed)
 (dest/'plugin-list.json').write_text(run([args.paseo,'plugin','ls','--home',root/'daemon','--json']))
 browser('open',f'http://127.0.0.1:{port}');browser('set','viewport',1440,1000)
 wait(lambda:evaluate('document.body.innerText.includes("Direct connection")'))
 browser('find','text','Direct connection','click');browser('fill','[aria-label="Host"]','127.0.0.1');browser('fill','[aria-label="Port"]',str(port));textclick('Connect')
 wait(lambda:evaluate('Boolean('+prefix('Bridge')+')'));textclick('Bridge')
 wait(lambda:evaluate('Boolean(globalThis.__r9)'))
 scenarios=['home','commander-question','board','permission','open','reason-empty','reason-typed','sent','relayed','recorded','recorded-reopened','fo-question','comms','review-assigned','review-ask','review-sent','source-failed','source-failed-list','source-failed-fo','source-loading','filter-gates','list-sent','list-relayed','back-list','closed','return-commander','progress-board','progress-detail','all-fos','fo-no-waiting','long-titles','list']
 for width,height in [(w,h) for w,h in [(1440,1000),(360,780)] if not args.width or w==args.width]:
  browser('set','viewport',width,height);browser('wait',400)
  if not evaluate('Boolean('+el('Message Comms officer')+')'):
   evaluate('document.querySelector(\'[aria-label="Open menu"]\')?.click()');browser('wait',200);textclick('Bridge');evaluate('document.querySelector(\'[aria-label="Close menu"]\')?.click()')
  wait(lambda:evaluate('Boolean('+el('Message Comms officer')+')'))
  for scenario in ([] if args.scroll_only else ['board'] if args.probe else scenarios):
   evaluate('globalThis.__r9.scenarioChange('+json.dumps(scenario)+')');browser('wait',250)
   if scenario in ['source-failed','source-loading','home','commander-question','comms']: pass
   else:
    if width==360: click('Board');browser('wait',300)
    if scenario in ['sent','relayed','recorded','recorded-reopened','list-sent','list-relayed','back-list','return-commander','progress-board','progress-detail']:
     state='recorded' if scenario in ['recorded','recorded-reopened','back-list'] else 'relayed' if scenario in ['relayed','list-relayed','progress-board','progress-detail'] else 'sent'
     evaluate('globalThis.__r9.progress('+json.dumps(state)+')')
    if scenario=='permission':click('Permission: Run the requested command — Permission FO')
    elif scenario in ['open','reason-empty','reason-typed','sent','relayed','recorded','recorded-reopened','closed','return-commander','progress-detail']:
     open_gate()
     if scenario in ['reason-empty','reason-typed']:
      click('Choose 要求修改')
      if scenario=='reason-typed':fill('Reason for 要求修改','Keep the failure visible')
     if scenario=='return-commander': click('Back to Commander')
    elif scenario in ['fo-question','source-failed-fo']: click('Which retry limit should we use? (you) — Demo FO')
    elif scenario=='review-assigned': click('Review the adapter proof — Demo FO')
    elif scenario in ['review-ask','review-sent']:
     click('Review the unassigned change — no FO')
     if scenario=='review-sent':click('Send to Comms officer')
    elif scenario in ['list-sent','list-relayed','back-list','progress-board']:
     open_gate();click('Board')
     if scenario=='progress-board':click('Filter gate')
    elif scenario=='filter-gates':click('Filter gate')
    elif scenario in ['all-fos','fo-no-waiting']:
     textclick('By FO')
     if scenario=='fo-no-waiting':click('Conversation with Research FO')
   if scenario=='recorded-reopened':
    click('Back to Commander')
    if width==360:click('Board')
    open_gate()
   snapshot(scenario,width)
   if scenario in ['board','list','list-sent','list-relayed','back-list','source-failed-list']:
    textclick('By FO');snapshot(scenario+'-by-fo',width)
  if not args.probe:
   evaluate('globalThis.__r9.scenarioChange("continuity")');browser('wait',400)
   fill('Message Comms officer','Commander draft stays here')
   scroll=el('Conversation messages with Comms officer')
   try:wait(lambda:evaluate(scroll+'.scrollHeight>'+scroll+'.clientHeight+100'))
   except Exception:
    (dest/'scroll-timeout.json').write_text(json.dumps(evaluate('(()=>Array.from(document.querySelectorAll("[aria-label] a,[aria-label] div,[aria-label]")).filter(e=>e.getAttribute("aria-label")?.includes("Conversation messages")).map(e=>({label:e.getAttribute("aria-label"),height:e.clientHeight,scroll:e.scrollHeight,html:e.outerHTML.slice(0,700),text:e.textContent.slice(0,400),parent:e.parentElement.outerHTML.slice(0,200)})))()'),indent=2))
    browser('screenshot',dest/'scroll-timeout.png')
    raise
   browser('wait',400)
   evaluate(scroll+'.scrollTop=60');browser('wait',200)
   before=evaluate(scroll+'.scrollTop')
   if before<=0:
    (dest/'scroll-info.json').write_text(json.dumps(evaluate('(()=>{const e='+scroll+';return {html:e.outerHTML.slice(0,1000),height:e.clientHeight,content:e.scrollHeight,overflow:getComputedStyle(e).overflowY,containers:Array.from(e.querySelectorAll("div")).filter(x=>x.scrollHeight>x.clientHeight).map(x=>({height:x.clientHeight,content:x.scrollHeight,overflow:getComputedStyle(x).overflowY,html:x.outerHTML.slice(0,200)}))}})()'),indent=2))
    browser('screenshot',dest/'scroll-error.png')
   assert before>0
   if width==360:click('Board')
   open_gate();click('Choose 要求修改');fill('Reason for 要求修改','Keep the error visible')
   fill('Message Demo FO','Independent FO message')
   click('Back to Commander');browser('wait',200)
   assert evaluate(el('Message Comms officer')+'.value')=='Commander draft stays here'
   after=evaluate(scroll+'.scrollTop');assert abs(before-after)<2,(width,before,after)
   if width==360:click('Board')
   open_gate()
   assert evaluate('document.querySelector("[aria-label=\\"Reason for \\u8981\\u6c42\\u4fee\\u6539\\"]").value')=='Keep the error visible'
   assert evaluate(el('Message Demo FO')+'.value')=='Independent FO message'
   click('Confirm 要求修改 via comms officer');click('Back to Commander')
   if width==360:click('Board')
   open_gate();assert evaluate('document.body.innerText.includes("Sent to the comms officer")')
   observations.append({'width':width,'continuity':{'scroll_before':before,'scroll_after':after,'independent_drafts':True,'sent_once':evaluate('globalThis.__r9.sent.length')==1}})
   snapshot('continuity-return',width)
  # Both views with long references; hover and focus must stay within each row wrapper.
  evaluate('globalThis.__r9.scenarioChange("long-titles")');browser('wait',200)
  if width==360:click('Board')
  for view in ['decision','FO']:
   textclick('By '+view);browser('wait',150)
   snapshot('long-'+view,width)
   bounds=evaluate('''(()=>Array.from(document.querySelectorAll('[role=link][aria-label^="Open "]')).filter(e=>e.checkVisibility()&&e.getAttribute('aria-label').endsWith(' on GitHub')).map(e=>{const r=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return {label:e.getAttribute('aria-label'),link:{x:r.x,y:r.y,w:r.width,h:r.height},parent:{x:p.x,y:p.y,w:p.width,h:p.height},inside:r.left>=p.left&&r.right<=p.right&&r.top>=p.top&&r.bottom<=p.bottom}}))()''')
   assert bounds and all(x['inside'] for x in bounds),(width,view,bounds)
   observations.append({'width':width,'view':view,'bounds':bounds})
   label=bounds[0]['label']
   pos=evaluate('(()=>{const e='+el(label)+';e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})()')
   assert pos['hit'],(label,pos)
   browser('mouse','move',round(pos['x']),round(pos['y']));browser('screenshot',dest/f'{width}-{view}-hover.png')
   evaluate(el(label)+'.focus()');assert evaluate(el(label)+'===document.activeElement');browser('screenshot',dest/f'{width}-{view}-focus.png')
 (dest/'observed.json').write_text(json.dumps(observations,ensure_ascii=False,indent=2))
 print(json.dumps({'captures':len([x for x in observations if 'state'in x]),'reference_states':len(scenarios),'states_captured':len(set(x['state'] for x in observations if 'state' in x)),'widths':sorted(set(x['width'] for x in observations))}),flush=True)
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
