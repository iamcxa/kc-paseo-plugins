from pathlib import Path
import json,collections
r=Path(__file__).resolve().parent
m=json.loads((r/'measurements.json').read_text());assert len(m)==9 and len({x['agentId'] for x in m})==9
assert collections.Counter(x['configuration'] for x in m)=={'haiku-off':3,'haiku-low':3,'terra-low':3}
checks=[]
for row in m:
 run=json.loads((r/row['runFile']).read_text());meta=json.loads((r/row['metadataFile']).read_text());stem=row['runFile'].removesuffix('-run.json')
 events=[json.loads(x) for x in (r/(stem+'-events.jsonl')).read_text().splitlines() if x.strip()]
 terminal=[x for x in events if x.get('event',{}).get('type')=='turn_completed'];assert len(terminal)==1
 assert terminal[0]['agentId']==row['agentId'] and terminal[0]['event']['turnId']==row['turnId']
 assert row['success'] and 0<row['firstTextMs']<=row['wallMs'] and row['requests']==1 and row['toolCalls']==[]
 sums=meta['tokenSums'];usage=terminal[0]['event']['usage']
 cached='cache_read_input_tokens' if meta['provider']=='claude' else 'cached_input_tokens'
 assert sums['input_tokens']==usage['inputTokens'] and sums[cached]==usage['cachedInputTokens'] and sums['output_tokens']==usage['outputTokens']
 if meta['provider']=='claude':
  assert len(meta['requests'])==len({x['messageId'] for x in meta['responses']})==row['requests']
  request=meta['requests'][0]
  observed_off=(request.get('thinking') or {}).get('type')=='disabled'
  expected_thinking=observed_off if row['requestedThinking']=='off' else (request.get('outputConfig') or {}).get('effort')==row['requestedThinking']
 else:
  assert len({x['response_id'] for x in meta['responseRecords']})==row['requests']
  expected_thinking=meta['context'][-1].get('effort')==row['requestedThinking']
 assert row['thinkingVerified']==expected_thinking
 expected_input=sums['input_tokens']+sums['cache_creation_input_tokens']+sums['cache_read_input_tokens'] if meta['provider']=='claude' else sums['input_tokens']
 assert expected_input==row['totalInputTokens'] and sums[cached]==row['cachedInputTokens']
 checks.append({'id':row['id'],'turnUsageAndTimingReconciled':True,'thinkingVerified':row['thinkingVerified'],'actualThinking':row['nativeActualThinking']})
s=json.loads((r/'safety.json').read_text());assert all(s[k] for k in ['liveObservedFieldsEqual','stoppedOnlyCapturedPid','pidGone','portClosed','runtimeHomeDeleted','runtimeRootDeleted'])
assert not Path(json.loads((r/'runtime.json').read_text())['runtimeRoot']).exists()
result={'dataRunsReconciled':len(checks),'confirmedThinkingRuns':sum(x['thinkingVerified'] for x in checks),'unconfirmedThinkingRuns':sum(not x['thinkingVerified'] for x in checks),'withinFiveSecondsFinished':sum(x['wallMs']<=5000 for x in m),'checks':checks,'cleanupFlagsVerified':True,'falsifiers':['Changing a terminal input/cache/output value breaks the native-to-stream reconciliation.','Dropping a run or duplicating its agent ID breaks the nine-fresh-agent check.','Marking off as confirmed would contradict its captured adaptive/medium request parameters.']}
assert result['confirmedThinkingRuns']==6 and result['unconfirmedThinkingRuns']==3
(r/'verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['checks','falsifiers']}))
