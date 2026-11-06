#!/bin/bash
# usage: RUN=<label> PORT=<n> TAG=<main|cand> OUT=<dir> [WARM=<n> COLD=<n> STOP=<n> FAIL=<n>] cases.sh
# For each case starts an agent in the "blank" project (one variable unreadable at create) and, once its first turn has ended,
# prints one line: where the "Started without" row sits in the timeline and whether its text is on the page of the default
# Chat display at 1280 and 400 px (a picture of each page goes to $OUT). Cases: warm (daemon already serving), cold (daemon just
# restarted), stop (first turn stopped after 3 s), fail (first turn fails). The page is read straight after the run, because
# a daemon restart drops plugin rows.
. "$(dirname "$0")/env.sh"
OUT=${OUT:?}; TAG=${TAG:?}; mkdir -p "$OUT"
WARM=${WARM:-0}; COLD=${COLD:-0}; STOP=${STOP:-0}; FAIL=${FAIL:-0}
pa() { "$PASEO" --home "$S/home" "$@"; }
SID=$(cat "$S/home/server-id" 2>/dev/null)
SESSION=cases-$RUN-$$
ab() { agent-browser --session $SESSION "$@"; }
wsids() { pa workspace ls --json | python3 -I -c 'import json,sys;t=sys.stdin.read();print("\n".join(sorted(w["workspaceId"] for w in json.loads(t[t.index("["):]))))'; }
ended() { grep -c "\"agent.turn_ended\",\"agentId\":\"$1\"" "$S/events.jsonl"; }
one() { # case label prompt [stop-after-seconds]
  local case=$1 label=$2 prompt=$3 stop=${4:-}
  SID=$(cat "$S/home/server-id")
  local before; before=$(wsids)
  local id; id=$(pa run --provider mock/ten-second-stream --cwd "$S/blank" --no-wait --json "$prompt" 2>&1 | python3 -I -c 'import json,sys;t=sys.stdin.read();print(json.loads(t[t.index("{"):])["agentId"])')
  [ -n "$stop" ] && { sleep $stop; pa stop $id >/dev/null 2>&1; }
  for _ in $(seq 1 60); do sleep 1; [ "$(ended $id)" -ge 1 ] && break; done
  sleep 2
  local W; W=$(comm -13 <(echo "$before") <(wsids) | head -1)
  local pos; pos=$(cd /tmp && PASEO_PKG=$PASEO_PKG node "$HERE/timeline.mjs" "$PORT" "$id" 200 | python3 -I -c '
import sys,re
rows=[l.split() for l in sys.stdin if re.match(r"^\d+ ",l)]
user=[int(r[0]) for r in rows if r[1]=="user_message"]; plug=[int(r[0]) for r in rows if r[1]=="plugin"]; asst=[int(r[0]) for r in rows if r[1]=="assistant_message"]
if not plug: print("no-row"); sys.exit()
p=plug[0]; u=user[0] if user else None; a=asst[-1] if asst else None
where="before-user-message" if u is not None and p<u else ("after-last-assistant-message" if a is not None and p>a else "between-user-message-and-last-assistant-message")
print("seq=%d user=%s last-assistant=%s %s"%(p,u,a,where))')
  local vis=""
  for width in 1280 400; do
    ab close >/dev/null 2>&1
    ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4; ab set viewport $width 900 >/dev/null; ab open "http://127.0.0.1:$PORT/h/$SID/workspace/$W" >/dev/null
    local body=""
    for _ in $(seq 1 20); do sleep 1; body=$(ab get text body); echo "$body" | grep -q "${prompt:0:20}" && break; done
    sleep 2; body=$(ab get text body)
    local n; n=$(echo "$body" | grep -c "Started without" || true)
    local iw; iw=$(ab eval "window.innerWidth" 2>/dev/null | tr -dc 0-9)
    ab screenshot "$OUT/$TAG-$label-$width.png" >/dev/null
    [ "$iw" = "$width" ] || n="viewport-is-$iw"
    echo "$body" | grep -q "${prompt:0:20}" || n="page-did-not-load"
    case "$n" in page-did-not-load) r=NOT-LOADED;; viewport-is-*) r=$n;; *) r=$([ "$n" -ge 1 ] && echo visible || echo ABSENT);; esac; vis="$vis $width=$r"
  done
  echo "$TAG $case $label agent=${id:0:8} row: $pos |$vis"
}
ab close >/dev/null 2>&1
for i in $([ $WARM -gt 0 ] && seq 1 $WARM); do one warm warm-$i "warm $i"; done
for i in $([ $COLD -gt 0 ] && seq 1 $COLD); do
  "$PASEO" daemon stop --home "$S/home" >/dev/null 2>&1
  PASEO_NODE_ENV=development "$PASEO" daemon start --home "$S/home" --timeout 120 >/dev/null 2>&1
  one cold cold-$i "cold $i"
done
for i in $([ $STOP -gt 0 ] && seq 1 $STOP); do one stop stop-$i "stop $i" 3; done
for i in $([ $FAIL -gt 0 ] && seq 1 $FAIL); do one fail fail-$i "emit a synthetic turn failure $i"; done
ab close >/dev/null 2>&1
