#!/bin/bash
# usage: RUN=<label> PORT=<n> TAG=<cand|main> OUT=<dir> pictures-shoot.sh <state>...   after pictures-prepare.sh on the same run.
# Writes $OUT/$TAG-<state>-<width>[-light].png for width 1280 (window) and 400 (window). Chat display stays at Paseo's default.
. "$(dirname "$0")/env.sh"
OUT=${OUT:?out dir}; TAG=${TAG:?tag}; mkdir -p "$OUT"
SESSION=pe-pics-$RUN-$$
ab() { agent-browser --session $SESSION "$@"; }
SID=$(cat "$S/home/server-id")
ws() { "$PASEO" --home "$S/home" workspace ls --json | python3 -I -c 'import json,sys;t=sys.stdin.read();d=json.loads(t[t.index("["):]);print({w["project"]:w["workspaceId"] for w in d}[sys.argv[1]])' "$1"; }
ab close >/dev/null 2>&1; ab open about:blank >/dev/null; ab set viewport 1280 900 >/dev/null; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4
setdark() { :; }
for theme in dark; do
  if [ $theme = light ]; then
    ab set viewport 1280 900 >/dev/null; ab open "http://127.0.0.1:$PORT/settings/hosts/$SID/appearance" >/dev/null; sleep 3
    r() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
    ab click $(r 'button "Appearance"') >/dev/null; sleep 2; ab click $(r 'Theme: ') >/dev/null; sleep 1; ab click $(r 'menuitem "Light"') >/dev/null; sleep 1
  fi
  for state in "$@"; do
    W=$(ws $state)
    for width in 1280 400; do
      ab set viewport $width 900 >/dev/null; ab open "http://127.0.0.1:$PORT/h/$SID/workspace/$W" >/dev/null; sleep 6
      suffix=""; [ $theme = light ] && suffix="-light"
      ab screenshot --full "$OUT/$TAG-$state-full-$width$suffix.png" >/dev/null
      ab get text body | grep -E "Started without|Resumed without" | sed "s/^/$TAG $state $width $theme: /" >> "$OUT/$TAG-seen.txt"
    done
  done
done
ab close >/dev/null 2>&1
