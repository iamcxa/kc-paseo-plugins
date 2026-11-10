import json,re,datetime
from pathlib import Path
E=Path(__file__).resolve().parent
D=json.loads((E/'real-proof.json').read_text());A=json.loads((E/'agents-created.json').read_text());F=json.loads((E/'fixture.json').read_text())
chief=D['chiefId'];load=lambda name:json.loads((E/name).read_text())
lp=load(f'list-{chief}-timeline.json')['entries'];pp=load(f'preview-{chief}-timeline.json')['entries']
text=lambda entries,turn:'\n'.join(e['item']['text']for e in entries if e['item']['type']=='assistant_message' and e.get('turnId')==turn)
listing=text(lp,'foreground-turn-1');preview=text(pp,'foreground-turn-2')
checks=[]
def check(name,value):
 checks.append({'name':name,'status':'passed' if value else 'failed'});assert value,name
check('observer reaches calling with one admitted gate and one question',D['last']['phase']=='calling' and sorted(e['kind']for e in D['last']['batch']['events'])==['ask','gate'])
for name,body in [('list',listing),('preview',preview)]:
 check(name+' is a markdown table',bool(re.search(r'^\|.*\|\s*\n\|[\s:|\-]+\|',body,re.M)))
 check(name+' has no ui/app blocks',not re.search(r'```\s*(ui|app)\b',body))
calls=[e['item']for e in pp if e['item']['type']=='tool_call' and e['item']['status']=='completed']
gates=[c for c in calls if c['name']=='mcp__fleet__gate_briefing'];reads=[c for c in calls if c['name']=='mcp__paseo__get_agent_activity']
check('exact admitted gate briefing is read',len(gates)==1 and gates[0]['detail']['input']['key']==next(e['key']for e in D['last']['batch']['events']if e['kind']=='gate'))
check('gate recommendation cites briefing evidence',F['gateBriefingId']in listing and 'Alpha' in listing and 'CSV' in listing and '12' in listing and '回滾' in listing)
check('native recent FO activity is read',len(reads)==1 and reads[0]['detail']['input']['agentId']==F['questionFo'] and 'CSV' in json.dumps(reads[0]['detail']['output'],ensure_ascii=False))
check('question recommendation cites actual message',F['questionFo']in listing and '我讀了' in listing and '選甲' in listing)
check('all recommendations is only the separate preview user turn',any(e.get('turnId')=='foreground-turn-2'and e['item']['type']=='user_message'and e['item']['text']=='全照建議'for e in pp))
check('preview includes every exact destination and proposed message',all(t['id']in preview for t in A['targets'])and 'Captain' in preview and '全照建議' in preview and '確認' in preview and 'Reason:'in preview)
check('numeric or keyword choices',bool(re.search(r'1[.．]|確認送出',preview)))
check('one preparation call and zero outward/model-permission tools',sum(c['name']=='mcp__fleet__prepare_batch'for c in calls)==1 and not any(re.search(r'(send_agent_prompt|create_agent|respond_to_permission|render_ui)$',e['item'].get('name',''))for e in pp if e['item']['type']=='tool_call'))
for t in A['targets']:
 p=load(f'preview-{t["id"]}-timeline.json')['entries'];snapshot=next(x for x in load('final-agents.json')if x['id']==t['id'])
 check('no prompt, relay or model turn for '+t['title'],not any(e['item']['type']=='user_message'for e in p)and snapshot['lastUsage']is None and snapshot['lastError']is None)
check('no failed or incomplete candidate source match',load('runtime-source-manifest.json')['allRuntimeCandidateFilesMatch'])
measurements=[]
for folder,generation,label in [(E/'rehearsal',2,'misconfigured isolated rehearsal'),(E,3,'corrected native-tool proof')]:
 for p in sorted(folder.glob('events-*.jsonl')):
  starts={}
  for row in map(json.loads,p.read_text().splitlines()):
   event=row['event'];turn=event.get('turnId');key=(row['agentId'],turn)
   if event['type']=='turn_started':starts[key]=row['timestamp']
   elif event['type']=='turn_completed':
    start=starts.get(key);end=row['timestamp'];elapsed=(datetime.datetime.fromisoformat(end.replace('Z','+00:00'))-datetime.datetime.fromisoformat(start.replace('Z','+00:00'))).total_seconds()if start else None
    measurements.append({'scenario':label,'daemonGeneration':generation,'agentId':row['agentId'],'turnId':turn,'startedAt':start,'completedAt':end,'elapsedSeconds':elapsed,'providerReportedUsage':event.get('usage'),'note':'Provider-reported token counts and cost only; no inferred billing. Codex turn IDs restart after daemon restart; generation and timestamps disambiguate.'})
check('corrected proof has three native measured model turns',sum(x['daemonGeneration']==3 for x in measurements)==3 and all(x['elapsedSeconds']is not None for x in measurements))
(E/'model-measurement.json').write_text(json.dumps(measurements,indent=2))
(E/'acceptance.json').write_text(json.dumps({'checks':checks,'candidate':load('runtime-source-manifest.json')['head'],'scope':'Gate briefing + FO recent read + table list + no-relay preview only; no explicit-confirmation send, permission decision or live installation tested.'},ensure_ascii=False,indent=2))
print(json.dumps({'passed':len(checks),'failed':0,'measuredTurns':len(measurements),'correctedProofTurns':sum(x['daemonGeneration']==3 for x in measurements)}))
