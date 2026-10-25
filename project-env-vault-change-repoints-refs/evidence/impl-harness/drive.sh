#!/bin/bash
# usage: LABEL=main|cand PORT=n drive.sh SCENARIO   Writes $OUT/$TAG-*.png and $OUT/$TAG-log.txt
. "$(dirname "$0")/env.sh"
SC=${1:-rename}; OUT=${OUT:-$S/out}; TAG=${TAG:-$LABEL-$SC}
SID=$(cat $S/home/server-id)
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
LOG=$OUT/$TAG-log.txt
r() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
say() { echo "$TAG $W $*" >> $LOG; echo "$TAG $W $*" | cut -c1-${CUT:-260}; }
section() { ab get text body | sed -n '/^1Password$/,/^Variables/p' | tr '\n' '|'; }
pills() { ab snapshot -i | grep 'Field for' | sed 's/^ *- button //;s/ \[ref.*//' | tr '\n' ';'; }
measure() { ab eval "$(cat "$(dirname "$0")/measure.js")"; }
shot() { if [ $W -ge 600 ]; then ab screenshot --full $OUT/$TAG-$W-$1.png >/dev/null; else ab screenshot $OUT/$TAG-$W-$1.png >/dev/null; ab set viewport 400 2600 >/dev/null; sleep 1; ab screenshot --full $OUT/$TAG-$W-page-$1.png >/dev/null; ab set viewport 400 900 >/dev/null; sleep 1; fi; }
enter() { # project index (1-based Edit button)
  ab set viewport $W $H >/dev/null; ab open "$URL" >/dev/null; sleep 3
  ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n ${1}p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2
}
change() { ab click $(r 'Change the 1Password') >/dev/null; sleep 2; }
pick() { ab click $(r 'Vault: ') >/dev/null; sleep 1; ab click $(r "menuitem \"$1\"") >/dev/null; sleep 2; }
projects() { rtk proxy python3 -c "
import json;d=json.load(open('$S/home/plugin-settings/$PLUGIN_ID/projects.json'))
for p in d['values']['projects']:
  if p['root'].endswith('/$1'): print(p['vault'],[v['ref'] for v in p['variables']])"; }
ab close >/dev/null 2>&1; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4
if [ -n "$THEME" ]; then
  TAG=$TAG-$(echo $THEME | tr 'A-Z' 'a-z'); LOG=$OUT/$TAG-log.txt
  ab set viewport 1280 1000 >/dev/null; ab open "http://127.0.0.1:$PORT/settings/hosts/$SID/appearance" >/dev/null; sleep 3
  ab click $(r 'button "Appearance"') >/dev/null; sleep 2; ab click $(r 'Theme: ') >/dev/null; sleep 1; ab click $(r "menuitem \"$THEME\"") >/dev/null; sleep 1
fi
GEOMS=${GEOMS:-"1280 1400;400 900"}
IFS=';' read -ra GL <<< "$GEOMS"
for geom in "${GL[@]}"; do
  set -- $geom; W=$1; H=$2
  python3 "$(dirname "$0")/fx.py" $S $PLUGIN_ID
  case $SC in
  rename) # work-renamed (project 2): pick, Cancel, pick, Done, Save, Test
    enter 2; say "open: $(section)"; shot opened
    change; pick agent-dev; say "picked: $(section)"; say "picked measure: $(measure)"; shot picked
    ab click $(r 'button "Keep the current connection"\|button "Cancel"') >/dev/null; sleep 2; say "after-Cancel: $(section) pills=$(pills)"
    change; pick agent-dev; ab click $(r 'button "Done"') >/dev/null; sleep 2
    say "after-Done: $(section) pills=$(pills)"; say "after-Done bar: $(ab get text body | grep -m3 -i 'unsaved\|No unsaved' | tr '\n' '|')"; shot after-done
    ab click $(r 'button "Save"') >/dev/null; sleep 2; say "saved: $(projects work-renamed)"
    enter 2; say "reopened: $(section)"; ab click $(r 'button "Test"') >/dev/null; sleep 4; say "test: $(ab get text body | grep -i -m3 'All 3\|failed\|set' | tr '\n' '|')"; shot after-test ;;
  mixed) # work-mixed (project 3): third vault left alone
    enter 3; say "open: $(section) pills=$(pills)"; change; pick agent-dev; say "picked: $(section)"; say "picked measure: $(measure)"; shot picked
    ab click $(r 'button "Done"') >/dev/null; sleep 2; say "after-Done: pills=$(pills)"; say "after-Done measure: $(measure)"; shot after-done ;;
  outside) # work-outside (project 4): marks before Test, focus ring
    enter 4; say "open: pills=$(pills)"; say "outside-line: $(ab get text body | grep -i 'outside the chosen' | tr '\n' '|')"; say "measure: $(measure)"; shot outside
    ab eval "document.querySelector('[aria-label^=\"Field for STRIPE_KEY\"]').focus()" >/dev/null; sleep 1; say "focus-outside: $(measure)"; shot focus-outside
    ab eval "document.querySelector('[aria-label^=\"Field for SENTRY_AUTH_TOKEN\"]').focus()" >/dev/null; sleep 1; say "focus-ok: $(measure)"; shot focus-ok
    ab eval "document.querySelector('[aria-label^=\"Field for LINEAR_API_KEY\"]').focus()" >/dev/null; sleep 1; say "focus-empty: $(measure)"; shot focus-empty
    ab click $(r 'button "Test"') >/dev/null; sleep 4; say "after-test: $(ab get text body | grep -i -m3 'failed\|set\|outside the chosen' | tr '\n' '|')"; shot after-test ;;
  single) # work-single (project 6): a token that reads one vault; clearance at 400
    enter 6; change; pick agent-dev; say "picked: $(section)"; say "picked measure: $(measure)" ;;
  long) # work-long (project 5): both vault names long, worst case for the line at 400
    enter 5; change; pick agent-subspace-relay-production; say "picked: $(section)"; say "picked measure: $(measure)"; shot picked
    ab click $(r 'button "Done"') >/dev/null; sleep 2; say "after-Done: $(section) pills=$(pills)" ;;
  esac
done
