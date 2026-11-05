import json,re,sys
from pathlib import Path
s=Path(sys.argv[1]).read_text()
for label,value in [('tests',267),('pass',267),('fail',0)]:
 assert re.search(r'^(?:#|ℹ) '+label+' '+str(value)+r'$',s,re.M),'unexpected full-suite summary: '+label
rows=[{'name':m[1], 'status':'passed' if m[0]=='✔' else 'failed'} for m in re.findall(r'^\s*([✔✖]) (.+?) \([0-9.]+ms\)$',s,re.M)]
if not rows:rows=[{'name':m[1], 'status':'passed' if m[0]=='ok' else 'failed'} for m in re.findall(r'^\s*(ok|not ok) \d+ - (.+)$',s,re.M)]
assert len(rows)==267,len(rows)
Path(sys.argv[2]).write_text(json.dumps(rows,indent=2))
