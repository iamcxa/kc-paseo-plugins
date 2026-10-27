import sys,os,re
from html.parser import HTMLParser
site=sys.argv[1]; base='/kc-paseo-plugins'
files=[]
for r,_,fs in os.walk(site):
    for f in fs: files.append(os.path.relpath(os.path.join(r,f),site))
files.sort()
print("BUILT FILES:"); [print(" ",f) for f in files]
internal=[f for f in files if re.match(r'(docs/(adr|dev2|dev2-poc|journey)|project-env/(client|server|shared|test)|spacedock-bridge)/',f) or f.endswith(('.ts','.tsx','.json','.yaml','.yml'))]
print("INTERNAL PATHS PRESENT:",internal or "none")
class P(HTMLParser):
    def __init__(s): super().__init__(); s.links=[]; s.ids=set()
    def handle_starttag(s,t,a):
        a=dict(a)
        if 'id' in a: s.ids.add(a['id'])
        for k in ('href','src'):
            if k in a: s.links.append((t,a[k]))
pages={}
for f in files:
    if f.endswith('.html'):
        p=P(); p.feed(open(os.path.join(site,f)).read()); pages[f]=p
bad=0
for f,p in pages.items():
    for t,l in p.links:
        if l.startswith(('http://','https://','mailto:','data:')): 
            continue
        path,_,frag=l.partition('#')
        if path=='' : tgt=f
        else:
            if path.startswith(base+'/'): tgt=path[len(base)+1:]
            elif path.startswith('/'): print("ABSOLUTE-NO-BASE",f,l); bad+=1; continue
            else: tgt=os.path.normpath(os.path.join(os.path.dirname(f),path))
            if tgt.endswith('/') or tgt=='' : tgt=os.path.join(tgt,'index.html')
        if not os.path.exists(os.path.join(site,tgt)): print("MISSING",f,l,'->',tgt); bad+=1; continue
        if frag and tgt in pages and frag not in pages[tgt].ids: print("NO ANCHOR",f,l); bad+=1
print("LINK/IMAGE PROBLEMS:",bad)
ext=sorted({l for p in pages.values() for t,l in p.links if l.startswith('http') and 'iamcxa.github.io' not in l})
print("EXTERNAL LINKS:"); [print(" ",e) for e in ext]
