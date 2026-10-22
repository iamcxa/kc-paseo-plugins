#!/bin/bash
# usage: p2.sh <rev> <before|after>   Builds <rev> on the throwaway Paseo and reproduces the picker-stuck-on-Loading case:
# the vault list answers after 4 s (token check pending) and the project is saved with no vault.
# Presses a pill at once, then prints what the dialog says at 1, 5, 9, 14 and 20 s and how many item list reads happened.
H=$(cd "$(dirname "$0")" && pwd); AB=$H/ab.sh
paseo daemon stop --home /tmp/fp-val-spike/home >/dev/null 2>&1; "$AB" close >/dev/null 2>&1
REV=$1 "$H/setup.sh" >/dev/null 2>&1
MODE=slowtoken SCENARIO=novault "$H/restart.sh" >/dev/null 2>&1; sleep 3
"$H/open-editor.sh" 1280 1700
reads() { cat /tmp/fp-val-spike/project-env-world-*/calls.jsonl 2>/dev/null | grep -c '"item","list"'; }
R=$("$AB" snapshot -i | grep 'Field for SENTRY_PROJECT' | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/')
"$AB" click "@$R" >/dev/null; t0=$(date +%s)
for t in 1 5 9 14 20; do
  while [ $(( $(date +%s) - t0 )) -lt $t ]; do sleep 0.5; done
  T=$("$AB" get text body)
  echo "t=${t}s  Loading-the-vault: $(echo "$T" | grep -c 'Loading the vault')  field-list-shown(SENTRY_ORG): $(echo "$T" | grep -c 'SENTRY_ORG')  item-list reads: $(reads)  vault shown: $(echo "$T" | grep -c 'demo-dev')"
done
"$AB" set viewport 1280 1700 >/dev/null; mkdir -p "$H/../shots-p2/$2"; "$AB" screenshot "$H/../shots-p2/$2/1280-picker-20s-after-press.png" >/dev/null
