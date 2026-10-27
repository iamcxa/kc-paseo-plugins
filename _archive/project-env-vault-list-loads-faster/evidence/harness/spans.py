# usage: spans.py <calls.jsonl>  -> JSON: server span of the last listRefs (token lookup start -> last op item get end), split by phase
import json,sys
import os
rd=lambda p:[json.loads(l) for l in open(p) if l.strip()]
L=rd(sys.argv[1]); ends={e["pid"]:e["at"] for e in rd(os.path.join(os.path.dirname(sys.argv[1]),"ends.jsonl"))}
S=[dict(s,end=ends[s["pid"]]) for s in L if s["pid"] in ends]
lists=[s for s in S if s["tool"]=="op" and s["argv"][:2]==["item","list"]]
li=lists[-1]
sec=max((s for s in S if s["tool"]=="security" and s["start"]<=li["start"]),key=lambda s:s["start"])
gets=[s for s in S if s["tool"]=="op" and s["argv"][:2]==["item","get"] and s["start"]>=li["start"]]
peak=max(sum(1 for o in gets if o["start"]<=g["start"]<o["end"]) for g in gets) if gets else 0
print(json.dumps({"server_start":sec["start"],"server_end":max(g["end"] for g in gets) if gets else li["end"],
 "server_span_ms":(max(g["end"] for g in gets) if gets else li["end"])-sec["start"],
 "token_lookup_ms":sec["end"]-sec["start"],"token_to_list_ms":li["start"]-sec["end"],"item_list_ms":li["end"]-li["start"],
 "list_to_first_get_ms":(min(g["start"] for g in gets)-li["end"]) if gets else None,"gets":len(gets),"peak_gets_in_flight":peak}))
