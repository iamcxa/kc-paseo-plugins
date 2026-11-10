import hashlib,json
from pathlib import Path
E=Path(__file__).resolve().parent
capture=json.loads((E/'capture-evidence.json').read_text());messages=json.loads((E/'fixture/messages.json').read_text());manifest=json.loads((E/'capture-source-manifest.json').read_text())
checks=[]
def check(name,result):
 checks.append({'name':name,'status':'passed'if result else 'failed'});assert result,name
check('four ordered captures',[(x['width'],x['stage'])for x in capture['captures']]==[(1440,'list'),(1440,'preview'),(360,'list'),(360,'preview')])
check('four clean, isolated browser sessions',len(capture['sessions'])==4 and all(s['freshProfile']and s['browserStopped']and s['ownEmptyProfileRemoved']and s['requestedOnlyFiles']and s['scriptExceptions']==0 and s['policyViolations']==0 for s in capture['sessions']))
check('no owned profile remains',not list(E.glob('.capture-profile-*')))
check('bundle bytes match recorded source manifest',hashlib.sha256((E/'fixture/bundle.js').read_bytes()).hexdigest()==manifest['bundleSha256'])
for stage,item in messages.items():
 check(stage+' message bytes match native cycle-5 artifact',hashlib.sha256(item['entry']['item']['text'].encode()).hexdigest()==item['sha256'] and any(e['item'].get('text')==item['entry']['item']['text']for e in json.loads((E.parents[2]/item['source']).read_text())['entries']))
for shot in capture['captures']:
 name=f'{shot["width"]}-{shot["stage"]}';m=shot['metrics']
 check(name+' screenshot bytes',hashlib.sha256((E/shot['file']).read_bytes()).hexdigest()==shot['sha256'])
 check(name+' no horizontal overflow',m['documentWidth']<=shot['width']and m['table']['left']>=0 and m['table']['right']<=shot['width']and m['maxCellOverflow']<=2 and m['maxScrollOverflow']<=2)
 check(name+' exact saved source and zero sends',m['fixture']['sourceSha']==messages[shot['stage']]['sha256'] and m['fixture']['sends']==0)
(E/'acceptance.json').write_text(json.dumps({'head':manifest['head'],'checks':checks,'scope':'Actual Bridge components in offline SDK/RN DOM fixture, not native-device or live-daemon acceptance; no model turn.'},indent=2))
print(json.dumps({'passed':len(checks),'failed':0}))
