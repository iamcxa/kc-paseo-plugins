import sys,json,re
for line in open(sys.argv[1]):
    m=re.match(r'(\S+) (\d+) (measure|focus-\w+): (.*)$',line)
    if not m: continue
    d=json.loads(json.loads(m.group(4)))
    print(m.group(2),m.group(3))
    for p in d['pills']:
        print('   ',p['label'].split(':')[0][10:],p['borderStyle'],p['borderWidth'],p['borderColor'],'| outline',p['outline'],'| focused',p['focused'])
