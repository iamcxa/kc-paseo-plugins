#!/bin/bash
# usage: RUN=<label> PORT=<n> CHECKOUT=<repo root holding project-env> resume-check.sh
# Builds an isolated Paseo 0.14.0 with the idle period cut to 20 s (see setup.sh), then for three agents records the
# agent.session_open reason, which variables came back blank, and the plugin rows in the conversation:
#   healthy  every variable readable at create and at resume
#   lost     readable at create; the field is renamed in 1Password (the mapping now points at a field that is gone) before the resume
#   blank    unreadable at create and still unreadable at both resumes
set -e
. "$(dirname "$0")/env.sh"
export IDLE_MS=${IDLE_MS:-20000} PASEO_PKG
bash "$HERE/setup.sh" >/dev/null
pa() { "$PASEO" --home "$S/home" "$@"; }
tl() { (cd /tmp && PASEO_PKG=$PASEO_PKG node "$HERE/timeline.mjs" "$PORT" "$1" 400 | grep -E "plugin|items" || true); }
new() { pa run --provider mock/ten-second-stream --cwd "$S/$1" --no-wait --json "start $1" 2>&1 | python3 -I -c 'import json,sys;t=sys.stdin.read();print(json.loads(t[t.index("{"):])["agentId"])'; }
released() { for _ in $(seq 1 30); do sleep 10; [ "$(grep -c "\"agent.closed\",\"agentId\":\"$1\"" "$S/events.jsonl")" -ge "$2" ] && return; done; echo "agent $1 was not released"; exit 1; }
turns() { grep -c "\"agent.turn_started\",\"agentId\":\"$1\"" "$S/events.jsonl"; }
ended() { grep -c "\"agent.turn_ended\",\"agentId\":\"$1\"" "$S/events.jsonl"; }
resume() { local n e; n=$(turns "$1"); e=$(ended "$1"); pa send "$1" "$2" --no-wait >/dev/null; for _ in $(seq 1 30); do sleep 1; [ "$(turns "$1")" -gt "$n" ] && break; done; for _ in $(seq 1 40); do sleep 1; [ "$(ended "$1")" -gt "$e" ] && break; done; sleep 2; tl "$1" > "$S/tl-$1-${2// /-}.txt"; }
H=$(new healthy); L=$(new lost); B=$(new blank)
released $H 1; released $L 1; released $B 1
python3 -I - "$S" <<'P'
import json,sys
p=sys.argv[1]+"/home/plugin-settings/pe-resume/projects.json"; d=json.load(open(p))
for pr in d["values"]["projects"]:
    if pr["root"].endswith("/lost"): pr["variables"][1]["ref"]="op://Dev/stripe/renamed-in-1password"
json.dump(d,open(p,"w"))
P
resume $H "resume 1"; resume $L "resume 1"; resume $B "resume 1"
released $H 2; released $L 2; released $B 2
resume $H "resume 2"; resume $L "resume 2"; resume $B "resume 2"
for a in "healthy $H" "lost $L" "blank $B"; do set -- $a; echo "== $1"; grep "\"agentId\":\"$2\"" "$S/events.jsonl" | python3 -I -c '
import sys,json
for l in sys.stdin:
    d=json.loads(l)
    print("  session_open reason=%s env=%s"%(d["reason"],json.dumps(d["env"])) if "hook" in d else "  event %s"%d["event"])'; for f in "$S"/tl-$2-*.txt; do echo "  -- conversation after ${f##*/tl-$2-}"; sed "s/^/     /" "$f"; done; done
echo "agents: healthy=$H lost=$L blank=$B"
