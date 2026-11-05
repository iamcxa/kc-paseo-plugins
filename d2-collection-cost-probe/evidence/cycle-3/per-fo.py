from pathlib import Path
import json,sys
root=Path(__file__).resolve().parent
round_name=sys.argv[1]
fixture=json.loads((root/'fixture.json').read_text());rows={x['agentId']:{'agentId':x['agentId'],'title':x['title'],'initialStatus':x['fixtureStatus'],'seedAssistantBytes':x['assistantBytes'],'seedVisibleTextBytes':x['visibleTextBytes'],'activityCalls':0,'curatedTextBytes':0,'modelVisibleReportTextBytes':0,'previewResponses':0,'serializedToolOutputBytes':0,'sourceEntriesReturned':0,'calls':[]} for x in fixture['agents']}
timeline=json.loads((root/f'{round_name}-timeline.json').read_text())
for entry in timeline['entries']:
 item=entry['item']
 if item.get('type')!='tool_call' or 'get_agent_activity' not in item.get('name',''):continue
 detail=item.get('detail',{});args=detail.get('input',{});agent_id=args.get('agentId')
 if agent_id not in rows:continue
 output=detail.get('output');payload=output
 for _ in range(5):
  if isinstance(payload,dict) and 'content' in payload and isinstance(payload['content'],str):break
  if isinstance(payload,dict) and 'output' in payload:payload=payload['output']
  else:break
 text=payload.get('content','') if isinstance(payload,dict) else ''
 preview=payload if isinstance(payload,str) else ''
 visible_bytes=len((text or preview).encode())
 row=rows[agent_id];row['activityCalls']+=1;row['curatedTextBytes']+=len(text.encode());row['modelVisibleReportTextBytes']+=visible_bytes;row['previewResponses']+=int(bool(preview));serialized=len(json.dumps(output,ensure_ascii=False,separators=(',',':')).encode());row['serializedToolOutputBytes']+=serialized
 count=payload.get('updateCount',0) if isinstance(payload,dict) else 0;row['sourceEntriesReturned']+=count
 row['calls'].append({'callId':item.get('callId'),'input':args,'status':item.get('status'),'summaryBytes':len(text.encode()),'modelVisibleReportTextBytes':visible_bytes,'persistedPreviewOnly':bool(preview),'serializedOutputBytes':serialized,'updateCount':count,'summaryHeader':text.split('\n',1)[0]})
result={'round':round_name,'byteUnits':'UTF-8. modelVisibleReportTextBytes counts complete curated content strings plus any persisted-output preview string actually delivered; it excludes JSON framing of structured tool results. serialized bytes use normalized compact JSON, not measured transport framing.','pageDefinition':'One get_agent_activity response is one curated summary read, limited by entry count. The tool exposes no cursor/pagination; this is not a count of backend pages.','agents':list(rows.values()),'totals':{key:sum(row[key] for row in rows.values()) for key in ['activityCalls','curatedTextBytes','modelVisibleReportTextBytes','previewResponses','serializedToolOutputBytes','sourceEntriesReturned']}}
(root/f'{round_name}-per-fo.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result['totals']))
