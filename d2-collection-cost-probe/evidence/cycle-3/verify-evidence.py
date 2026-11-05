from pathlib import Path
import json,sys
r=Path(__file__).resolve().parent
checks=[]
for name in ['probe','baseline']:
 m=json.loads((r/f'{name}-metrics.json').read_text());meta=json.loads((r/f'{name}-provider-metadata.json').read_text())
 events=[json.loads(x) for x in (r/f'{name}-events.jsonl').read_text().splitlines() if x.strip()]
 ends=[x for x in events if x.get('event',{}).get('type')=='turn_completed']
 assert len(ends)==1 and ends[0]['agentId']==m['agentId'] and ends[0]['event']['turnId']==m['turnId']
 assert len({x['id'] for x in meta['requests']})==m['requestCount']
 unique={x['messageId']:x for x in meta['responses']};assert len(unique)==len(meta['responses'])==m['successfulResponseCount']==m['requestCount']
 for raw,final in [('input_tokens','inputTokens'),('cache_read_input_tokens','cachedInputTokens'),('output_tokens','outputTokens')]:
  total=sum(x['usage'].get(raw,0) for x in unique.values());assert total==ends[0]['event']['usage'][final]==m['rawTokenSums'][raw]
 assert m['cacheReadInputTokens']==m['cacheCreationInputTokens']==0
 checks.append({'name':name+' turn attribution, request deduplication and token reconciliation','status':'passed','falsifier':'Changing a terminal token count or duplicating a provider response causes failure.'})
 p=json.loads((r/f'{name}-per-fo.json').read_text());assert len(p['agents'])==18
 for key in p['totals']:assert p['totals'][key]==sum(x[key] for x in p['agents'])
 checks.append({'name':name+' per-FO byte/read totals','status':'passed','falsifier':'Dropping an FO or changing a per-FO byte count without its total causes failure.'})
s=json.loads((r/'safety.json').read_text());assert all(s[k] for k in ['observedLiveFieldsEqual','stoppedByCapturedPid','pidGone','portClosed','homeDeleted','runtimeRootDeleted'])
assert not Path(json.loads((r/'runtime.json').read_text())['runtimeRoot']).exists()
checks.append({'name':'isolated PID, port, files and allowed live fields','status':'passed','falsifier':'A retained runtime directory or any failed cleanup/live-state flag causes failure.'})
(r/'verification.json').write_text(json.dumps(checks,indent=2)+'\n');print(json.dumps({'passed':len(checks)}))
