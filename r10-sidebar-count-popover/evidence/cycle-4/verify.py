#!/usr/bin/env python3
"""Check the cycle-4 captures against the exact committed source and rendered rows."""
import hashlib, json, os, subprocess
from pathlib import Path
base=Path(__file__).resolve().parent
wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r10-sidebar-count-popover')
head=subprocess.check_output(['git','-C',str(wt),'rev-parse','HEAD'],text=True).strip()
tracked=subprocess.check_output(['git','-C',str(wt),'ls-files','spacedock-bridge'],text=True).splitlines()
expected=['Open Should I ask for the next proof? (you)','Open Accept the export result?','Open Which retry limit should we use?','Open Accept the retry proof?']
metadata=['Commander · Question · 5m ago','Export FO · Gate · 12m ago','Demo FO · Question · 35m ago','Demo FO · Gate · 1h ago']
results=[]
for theme,width in [('dark',1440),('light',1440),('dark',360),('light',360)]:
 folder=base/f'{theme}-{width}'
 proof=json.loads((folder/'verification.json').read_text())
 assert proof['head']==head and proof['order']==expected
 hashes=json.loads((folder/'source-identity.json').read_text())
 for rel in tracked:
  key=str(Path(rel).relative_to('spacedock-bridge'))
  blob=subprocess.check_output(['git','-C',str(wt),'show',head+':'+rel])
  assert hashes[key]==hashlib.sha256(blob).hexdigest(),(folder,rel)
 observed=json.loads((folder/'observed.json').read_text())
 popup=next(x for x in observed if x.get('state')=='popover-count')
 buttons=[x for x in popup['rows'] if x['label'] in expected]
 assert [x['label'] for x in buttons]==expected
 assert all(row['text'].endswith(meta) for row,meta in zip(buttons,metadata)),buttons
 assert 'Gates · 2' in popup['text'] and 'Questions · 2' in popup['text']
 assert ('Scroll to see all 4 items' in popup['text'])==(width==360)
 assert not any(x['overflow'] for x in observed if 'overflow' in x)
 cleanup=json.loads((folder/'cleanup.json').read_text());launch=json.loads((folder/'launch.json').read_text())
 assert cleanup['home_removed'] and not Path(launch['home']).exists()
 try:os.kill(cleanup['pid'],0)
 except ProcessLookupError:pass
 else:raise AssertionError(('daemon still running',cleanup['pid']))
 results.append({'theme':theme,'width':width,'source_files_matched':len(tracked),'owner_age_order_verified':True,'daemon_stopped':True,'home_removed':True,'png_count':len(list(folder.glob('*.png')))})
summary={'head':head,'total_pngs':sum(x['png_count'] for x in results),'captures':results}
(base/'verification.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
