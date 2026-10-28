import sys, urllib.request
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(s): super().__init__(); s.pre=0; s.cur=[]; s.blocks=[]
    def handle_starttag(s,t,a):
        if t=='pre': s.pre=1; s.cur=[]
    def handle_endtag(s,t):
        if t=='pre': s.pre=0; s.blocks.append(''.join(s.cur).rstrip('\n'))
    def handle_data(s,d):
        if s.pre: s.cur.append(d)
p=P(); p.feed(urllib.request.urlopen(sys.argv[1]).read().decode())
for i,b in enumerate(p.blocks,1): print(f"--- block {i}\n{b}")
