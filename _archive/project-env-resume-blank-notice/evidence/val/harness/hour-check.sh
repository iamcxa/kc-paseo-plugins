#!/bin/bash
# usage: RUN=<label> PORT=<n> CHECKOUT=<repo root holding project-env> resume-check.sh
# Builds an isolated Paseo 0.14.0 with the idle period cut to 20 s (see setup.sh), then for three agents records the
# agent.session_open reason, which variables came back blank, and the plugin rows in the conversation:
#   healthy  every variable readable at create and at resume
#   lost     readable at create; the field is renamed in 1Password (the mapping now points at a field that is gone) before the resume
#   blank    unreadable at create and still unreadable at both resumes
set -e
. "$(dirname "$0")/env.sh"
unset IDLE_MS; export PASEO_PKG
bash "$HERE/setup.sh" >/dev/null
pa() { "$PASEO" --home "$S/home" "$@"; }
tl() { (cd /tmp && PASEO_PKG=$PASEO_PKG node "$HERE/timeline.mjs" "$PORT" "$1" 400 | grep -E "plugin|items" || true); }
new() { pa run --provider mock/ten-second-stream --cwd "$S/$1" --no-wait --json "start $1" 2>&1 | python3 -I -c 'import json,sys;t=sys.stdin.read();print(json.loads(t[t.index("{"):])["agentId"])'; }
released() { for _ in $(seq 1 30); do sleep 10; [ "$(grep -c "\"agent.closed\",\"agentId\":\"$1\"" "$S/events.jsonl")" -ge "$2" ] && return; done; echo "agent $1 was not released"; exit 1; }
turns() { grep -c "\"agent.turn_started\",\"agentId\":\"$1\"" "$S/events.jsonl"; }
ended() { grep -c "\"agent.turn_ended\",\"agentId\":\"$1\"" "$S/events.jsonl"; }
resume() { local n e; n=$(turns "$1"); e=$(ended "$1"); pa send "$1" "$2" --no-wait >/dev/null; for _ in $(seq 1 30); do sleep 1; [ "$(turns "$1")" -gt "$n" ] && break; done; for _ in $(seq 1 40); do sleep 1; [ "$(ended "$1")" -gt "$e" ] && break; done; sleep 2; tl "$1" > "$S/tl-$1-${2// /-}.txt"; }
H=$(new healthy); L=$(new lost)
echo "created at $(date +%T): healthy=$H lost=$L"
for _ in $(seq 1 130); do sleep 30; [ "$(grep -c "\"agent.closed\",\"agentId\":\"$L\"" "$S/events.jsonl")" -ge 1 ] && [ "$(grep -c "\"agent.closed\",\"agentId\":\"$H\"" "$S/events.jsonl")" -ge 1 ] && break; done
echo "released at $(date +%T)"; grep -c "Collected idle agent runtime" "$S/home/daemon.log" || true
python3 -I - "$S" <<'P'
import json,sys
p=sys.argv[1]+"/home/plugin-settings/pe-resume/projects.json"; d=json.load(open(p))
for pr in d["values"]["projects"]:
    if pr["root"].endswith("/lost"): pr["variables"][1]["ref"]="op://Dev/stripe/renamed-in-1password"
json.dump(d,open(p,"w"))
P
resume $L "resume 1"
resume $H "resume 1"
for a in "healthy $H" "lost $L"; do set -- $a; echo "== $1"; grep "\"agentId\":\"$2\"" "$S/events.jsonl" | python3 -I -c '
import sys,json
for l in sys.stdin:
    d=json.loads(l)
    print("  at=%s session_open reason=%s purpose=%s env=%s"%(d["at"],d["reason"],d.get("purpose"),json.dumps(d["env"])) if "hook" in d else "  at=%s event %s"%(d["at"],d["event"]))'; for f in "$S"/tl-$2-*.txt; do echo "  -- conversation after ${f##*/tl-$2-}"; sed "s/^/     /" "$f"; done; done
echo "agents: healthy=$H lost=$L"
