from pathlib import Path
import json,re,sys,hashlib,collections
root=Path(__file__).resolve().parent
round_name=sys.argv[1]
assert round_name in ['probe','baseline']
run=json.loads((root/f'{round_name}-run.json').read_text())
events=[json.loads(line) for line in (root/f'{round_name}-events.jsonl').read_text().splitlines() if line.strip()]
terminals=[e for e in events if e.get('event',{}).get('type') in ['turn_completed','turn_failed','turn_canceled']]
assert len(terminals)==1, 'Exactly one terminal event required'
terminal=terminals[0];turn_id=terminal['event'].get('turnId')
assert turn_id and terminal['agentId']==run['agentId']
snapshot=run['finalSnapshot'];sid=snapshot['runtimeInfo']['sessionId']
assert re.fullmatch(r'[0-9a-f-]{36}',sid)
cwd=Path(snapshot['cwd']).resolve();runtime=json.loads((root/'runtime.json').read_text())
assert cwd==Path(runtime['cwd']).resolve()
encoded=re.sub('[^a-zA-Z0-9]','-',str(cwd))
transcript=Path('/Users/kent/.claude/projects')/encoded/(sid+'.jsonl')
assert transcript.is_file(), 'Only the exact newly-created fictional session transcript may be read'
rows=[json.loads(line) for line in transcript.read_text().splitlines() if line.strip()]
requests={x['id']: {'id':x['id'],'at':x.get('timestamp'),'querySource':x.get('querySource')} for x in rows if x.get('type')=='api-request' and x.get('querySource')=='sdk'}
responses={}
for row in rows:
 if row.get('type')=='assistant' and row.get('message',{}).get('id'):
  msg=row['message'];responses[msg['id']]={'messageId':msg['id'],'requestId':row.get('requestId'),'usage':msg.get('usage',{})}
fields=['input_tokens','cache_creation_input_tokens','cache_read_input_tokens','output_tokens']
sums={key:sum(x['usage'].get(key,0) for x in responses.values()) for key in fields}
final_usage=terminal['event'].get('usage',{})
validation={raw: sums[raw]==final_usage.get(final) for raw,final in [('input_tokens','inputTokens'),('cache_read_input_tokens','cachedInputTokens'),('output_tokens','outputTokens')]}
metric={'round':round_name,'agentId':run['agentId'],'sessionId':sid,'turnId':turn_id,'terminalType':terminal['event']['type'],'wallMs':run['wallMs'],'requestCount':len(requests),'successfulResponseCount':len(responses),'requests':list(requests.values()),'responses':list(responses.values()),'rawTokenSums':sums,'totalInputTokens':sum(sums[k] for k in fields[:3]),'uncachedInputTokens':sums['input_tokens']+sums['cache_creation_input_tokens'],'cacheReadInputTokens':sums['cache_read_input_tokens'],'cacheCreationInputTokens':sums['cache_creation_input_tokens'],'outputTokens':sums['output_tokens'],'turnCompletedUsage':final_usage,'tokenSumMatchesTerminal':validation,'usageUpdatedCount':sum(e.get('event',{}).get('type')=='usage_updated' for e in events),'cachePolicy':run['cachePolicy'],'nativeTranscript':{'path':str(transcript),'sha256':hashlib.sha256(transcript.read_bytes()).hexdigest(),'selection':'Exact session ID emitted by this isolated synthetic Commander; no other transcript or credential file read.'}}
(root/f'{round_name}-metrics.json').write_text(json.dumps(metric,indent=2)+'\n')
print(json.dumps({k:metric[k] for k in ['round','turnId','requestCount','successfulResponseCount','totalInputTokens','cacheReadInputTokens','cacheCreationInputTokens','outputTokens','wallMs','tokenSumMatchesTerminal']}))
