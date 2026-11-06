from pathlib import Path
import json,re,hashlib,datetime,collections
r=Path(__file__).resolve().parent
runtime=json.loads((r/'runtime.json').read_text())
def ms(a,b):return (datetime.datetime.fromisoformat(a.replace('Z','+00:00'))-datetime.datetime.fromisoformat(b.replace('Z','+00:00'))).total_seconds()*1000
summaries=[];native_paths=[]
for file in sorted(r.glob('*-run.json')):
 run=json.loads(file.read_text());stem=file.name.removesuffix('-run.json');events=[json.loads(x) for x in (r/(stem+'-events.jsonl')).read_text().splitlines() if x.strip()]
 terminal=[x for x in events if x.get('event',{}).get('type') in ['turn_completed','turn_failed','turn_canceled']];assert len(terminal)==1
 end=terminal[0];assert end['agentId']==run['agentId'];usage=end['event'].get('usage',{});snapshot=run['finalSnapshot'];sid=snapshot['runtimeInfo']['sessionId'];assert re.fullmatch('[0-9a-f-]{36}',sid)
 cwd=Path(snapshot['cwd']).resolve();assert cwd==Path(runtime['cwd']).resolve()
 metadata={'agentId':run['agentId'],'paseoTurnId':end['event'].get('turnId'),'sessionId':sid,'provider':snapshot['provider'],'method':'Only the exact new fictional session transcript, selected by its emitted session ID; no unrelated history or credentials.'}
 result={'id':run['id'],'attempt':run['attempt'],'configuration':run['config']['key'],'requestedProvider':run['config']['provider'],'requestedThinking':run['config']['thinking'],'agentId':run['agentId'],'turnId':end['event'].get('turnId'),'sessionId':sid,'success':run['success'],'wallMs':run['wallMs'],'firstTextMs':run.get('firstAssistantTextMs'),'creationMs':run['createMs'],'subscribeMs':run['subscribeMs'],'toolCalls':run['toolCalls'],'nativeActualModel':snapshot['runtimeInfo'].get('model'),'nativeActualThinking':None,'thinkingVerified':False,'cachePolicy':run['cachePolicy']}
 if snapshot['provider']=='claude':
  path=Path('/Users/kent/.claude/projects')/re.sub('[^a-zA-Z0-9]','-',str(cwd))/(sid+'.jsonl');assert path.is_file();rows=[json.loads(x) for x in path.read_text().splitlines() if x.strip()]
  requests={x['id']:{'id':x['id'],'timestamp':x.get('timestamp'),'querySource':x.get('querySource'),'model':x.get('params',{}).get('model'),'thinking':x.get('params',{}).get('thinking'),'outputConfig':x.get('params',{}).get('output_config')} for x in rows if x.get('type')=='api-request' and x.get('querySource')=='sdk'}
  responses={}
  for x in rows:
   if x.get('type')=='assistant' and x.get('message',{}).get('id'):
    m=x['message'];responses[m['id']]={'messageId':m['id'],'requestId':x.get('requestId'),'model':m.get('model'),'usage':m.get('usage',{})}
  sums={k:sum(x['usage'].get(k,0) for x in responses.values()) for k in ['input_tokens','cache_creation_input_tokens','cache_read_input_tokens','output_tokens']}
  assert all(sums[k]==usage[v] for k,v in [('input_tokens','inputTokens'),('cache_read_input_tokens','cachedInputTokens'),('output_tokens','outputTokens')])
  metadata.update({'requests':list(requests.values()),'responses':list(responses.values()),'tokenSums':sums})
  result.update({'totalInputTokens':sum(sums[k] for k in ['input_tokens','cache_creation_input_tokens','cache_read_input_tokens']),'cachedInputTokens':sums['cache_read_input_tokens'],'cacheWriteInputTokens':sums['cache_creation_input_tokens'],'outputTokens':sums['output_tokens'],'requests':len(requests),'observedResponseCount':len(responses),'thinkingOutputTokens':sum(x['usage'].get('output_tokens_details',{}).get('thinking_tokens',0) for x in responses.values())})
  req=next(iter(requests.values()));think=req['thinking'];effort=(req['outputConfig'] or {}).get('effort');result['nativeActualThinking']={'thinking':think,'effort':effort}
  result['thinkingVerified']=(think or {}).get('type')=='disabled' if run['config']['thinking']=='off' else effort==run['config']['thinking']
  api_ms=ms(req['timestamp'],run['startedAt']);result['firstApiRequestAfterSendMs']=api_ms;result['apiStartToFirstTextMs']=run['firstAssistantTextMs']-api_ms;result['apiStartToFinishMs']=run['wallMs']-api_ms
 else:
  matches=list(Path('/Users/kent/.codex/sessions/2026/11/06').glob('*'+sid+'*'));assert len(matches)==1;path=matches[0];rows=[json.loads(x) for x in path.read_text().splitlines() if x.strip()]
  records={x['payload']['response_id']:x['payload'] for x in rows if x.get('type')=='token_usage_record'};assert records
  turn_ids={x['turn_id'] for x in records.values()};assert len(turn_ids)==1
  context=[x['payload'] for x in rows if x.get('type')=='turn_context'];native_turn=next(iter(turn_ids))
  sums={k:sum(x['usage'].get(k,0) for x in records.values()) for k in ['input_tokens','cached_input_tokens','cache_write_input_tokens','output_tokens','reasoning_output_tokens']}
  assert all(sums[k]==usage[v] for k,v in [('input_tokens','inputTokens'),('cached_input_tokens','cachedInputTokens'),('output_tokens','outputTokens')])
  completion=next(x['payload'] for x in rows if x.get('type')=='event_msg' and x.get('payload',{}).get('type')=='task_complete')
  safe_records=[{k:x.get(k) for k in ['thread_id','turn_id','session_id','root_turn_id','response_id','usage','turn_token_usage','thread_token_usage']} for x in records.values()]
  effort=context[-1].get('effort');native_model=context[-1].get('model');result.update({'totalInputTokens':sums['input_tokens'],'cachedInputTokens':sums['cached_input_tokens'],'cacheWriteInputTokens':sums['cache_write_input_tokens'],'outputTokens':sums['output_tokens'],'requests':len(records),'observedResponseCount':len(records),'thinkingOutputTokens':sums['reasoning_output_tokens'],'nativeActualThinking':effort,'thinkingVerified':effort==run['config']['thinking'],'nativeActualModel':native_model,'nativeTurnId':native_turn,'codexNativeDurationMs':completion.get('duration_ms'),'codexNativeFirstTokenMs':completion.get('time_to_first_token_ms')})
  metadata.update({'responseRecords':safe_records,'tokenSums':sums,'context':[{k:x.get(k) for k in ['turn_id','model','effort']} for x in context],'completion':{k:completion.get(k) for k in ['turn_id','root_turn_id','duration_ms','time_to_first_token_ms','started_at','completed_at']}})
 metadata['source']={'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()};metadata['turnCompletedUsage']=usage
 (r/(stem+'-provider-metadata.json')).write_text(json.dumps(metadata,indent=2)+'\n');result['metadataFile']=stem+'-provider-metadata.json';result['runFile']=file.name
 assert result['requests']==result['observedResponseCount']==1 and not result['toolCalls'] and result['firstTextMs']<=result['wallMs']
 summaries.append(result);native_paths.append({'path':str(path),'sessionId':sid,'provider':snapshot['provider']})
(r/'measurements.json').write_text(json.dumps(summaries,indent=2)+'\n');(r/'native-artifacts.json').write_text(json.dumps(native_paths,indent=2)+'\n')
print(json.dumps([{'id':x['id'],'wallMs':x['wallMs'],'firstTextMs':x['firstTextMs'],'input':x['totalInputTokens'],'cached':x['cachedInputTokens'],'output':x['outputTokens'],'requests':x['requests'],'thinkingVerified':x['thinkingVerified'],'actualThinking':x['nativeActualThinking'],'preApiMs':x.get('firstApiRequestAfterSendMs')} for x in summaries],indent=2))
