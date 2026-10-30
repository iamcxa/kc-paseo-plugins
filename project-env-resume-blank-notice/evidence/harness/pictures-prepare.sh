#!/bin/bash
# usage: RUN=<label> PORT=<n> pictures-prepare.sh   On a run already built by resume-check.sh (setup.sh), creates three short conversations
# (each turn interrupted after two seconds) whose variables become unreadable between a release and the resume:
#   one    1 variable, short name, cause "field not found"
#   three  3 variables, long names, three different causes
#   both   starts without 1 variable (the "Started without" line), then resumes with a different set of 2
. "$(dirname "$0")/env.sh"
pa() { "$PASEO" --home "$S/home" "$@"; }
W=$(cat "$S/world-dir")
python3 -I - "$S" "$W" <<'P'
import json,sys,os,subprocess
S,W=sys.argv[1:3]
v=lambda n,r:{"name":n,"ref":r}
OK="op://Dev/stripe/secret-key"; SEN="op://Dev/SENTRY/SENTRY_AUTH_TOKEN"
sc=json.load(open(W+"/scenario.json"))
refs=sc["op"]["accounts"]["a"]["refs"]
refs[OK]=refs.get(OK,"fake"); refs[SEN]=refs.get(SEN,"fake")
refs["op://Dev/stripe/blank-field"]=""
sc["op"]["fail"]={"op://Dev/stripe/unreachable-field":{"stderr":"[ERROR] network is unreachable","code":1}}
json.dump(sc,open(W+"/scenario.json","w"))
p=S+"/home/plugin-settings/pe-resume/projects.json"; d=json.load(open(p))
def proj(n,vs): 
    os.makedirs(S+"/"+n,exist_ok=True); subprocess.run(["git","-C",S+"/"+n,"init","-q"])
    d["values"]["projects"].append({"root":S+"/"+n,"serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":vs})
proj("one",[v("SENTRY_AUTH_TOKEN",SEN),v("STRIPE_KEY",OK)])
proj("three",[v("SENTRY_AUTH_TOKEN",SEN),v("STRIPE_WEBHOOK_SIGNING_SECRET_FOR_PRODUCTION",OK),v("POSTHOG_PERSONAL_API_KEY_FOR_RELEASES",OK),v("SENTRY_RELEASE_AUTOMATION_TOKEN",OK)])
proj("both",[v("SENTRY_AUTH_TOKEN",SEN),v("STRIPE_KEY","op://Dev/stripe/gone-at-start")])
json.dump(d,open(p,"w"))
P
remap() { python3 -I - "$S" "$1" "$2" <<'P'
import json,sys
S,name,spec=sys.argv[1:4]
p=S+"/home/plugin-settings/pe-resume/projects.json"; d=json.load(open(p))
m=dict(x.split("=",1) for x in spec.split(","))
for pr in d["values"]["projects"]:
    if pr["root"].endswith("/"+name):
        for var in pr["variables"]:
            if var["name"] in m: var["ref"]=m[var["name"]]
json.dump(d,open(p,"w"))
P
}
turns() { grep -c "\"agent.turn_started\",\"agentId\":\"$1\"" "$S/events.jsonl"; }
closed() { grep -c "\"agent.closed\",\"agentId\":\"$1\"" "$S/events.jsonl"; }
newagent() { pa run --provider mock/ten-second-stream --cwd "$S/$1" --no-wait --json "start $1" 2>&1 | python3 -I -c 'import json,sys;t=sys.stdin.read();print(json.loads(t[t.index("{"):])["agentId"])'; }
wait_closed() { for _ in $(seq 1 30); do sleep 10; [ "$(closed "$1")" -ge 1 ] && return; done; echo "not released"; exit 1; }
resume() { local n; n=$(turns "$1"); pa send "$1" "continue" --no-wait >/dev/null; for _ in $(seq 1 30); do sleep 1; [ "$(turns "$1")" -gt "$n" ] && break; done; sleep 2; pa stop "$1" >/dev/null 2>&1; }
O=OP://x
ONE=$(newagent one); sleep 2; pa stop $ONE >/dev/null 2>&1
THREE=$(newagent three); sleep 2; pa stop $THREE >/dev/null 2>&1
BOTH=$(newagent both); sleep 2; pa stop $BOTH >/dev/null 2>&1
wait_closed $ONE; wait_closed $THREE; wait_closed $BOTH
remap one "STRIPE_KEY=op://Dev/stripe/renamed-in-1password"
remap three "STRIPE_WEBHOOK_SIGNING_SECRET_FOR_PRODUCTION=op://Dev/stripe/renamed-in-1password,POSTHOG_PERSONAL_API_KEY_FOR_RELEASES=op://Dev/stripe/blank-field,SENTRY_RELEASE_AUTOMATION_TOKEN=op://Dev/stripe/unreachable-field"
remap both "SENTRY_AUTH_TOKEN=op://Dev/SENTRY/unreachable-now,STRIPE_KEY=op://Dev/stripe/gone-at-start"
resume $ONE; resume $THREE; resume $BOTH
echo "one=$ONE three=$THREE both=$BOTH"
