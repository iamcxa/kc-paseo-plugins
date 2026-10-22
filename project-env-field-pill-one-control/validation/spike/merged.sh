#!/bin/bash
# Drives the merged page (pill rows plus save bar and Danger zone from main) on the throwaway Paseo from setup.sh and restart.sh.
# Prints PASS/FAIL per check; screenshots go to $SHOTS (default ../shots-merged). Fake op/security/git, no secret.
H=$(cd "$(dirname "$0")" && pwd); AB=$H/ab.sh; S=/tmp/fp-val-spike
SHOTS=${SHOTS:-$H/../shots-merged}; mkdir -p "$SHOTS"
F=$S/home/plugin-settings/field-pill-spike/projects.json
FAILS=0
check() { if [ "$2" = "$3" ]; then echo "PASS $1"; else echo "FAIL $1: expected [$2] got [$3]"; FAILS=$((FAILS+1)); fi; }
ref() { $AB snapshot -i | grep -E "$1" | head -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
reflast() { $AB snapshot -i | grep -E "$1" | tail -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
has() { $AB get text body | grep -c -F -- "$1"; }
nvars() { python3 -c "import json;p=json.load(open('$F'))['values']['projects'];print(len(p[0]['variables']) if p else 0)"; }
nproj() { python3 -c "import json;print(len(json.load(open('$F'))['values']['projects']))"; }
press() { for try in 1 2 3 4 5 6 7 8 9 10; do r=$(ref "$1"); [ -z "$r" ] && { sleep 0.8; continue; }; $AB scrollintoview "@$r" >/dev/null 2>&1; $AB wait 300 >/dev/null; out=$($AB click "@$r" 2>&1); echo "$out" | grep -q "✗" || return 0; sleep 0.8; done; echo "COULD NOT PRESS $1"; }
pressend() { for try in 1 2 3 4 5 6 7 8 9 10; do r=$(reflast "$1"); [ -z "$r" ] && { sleep 0.8; continue; }; $AB scrollintoview "@$r" >/dev/null 2>&1; $AB wait 300 >/dev/null; out=$($AB click "@$r" 2>&1); echo "$out" | grep -q "✗" || return 0; sleep 0.8; done; echo "COULD NOT PRESS $1"; }
shot() { $AB set viewport $W $HT >/dev/null; $AB wait 400 >/dev/null; $AB screenshot "$SHOTS/$W-$1.png" >/dev/null; echo "shot $W-$1"; }
fresh() { python3 "$H/fixture.py" "$S" base; }
openproj() { "$H/open-editor.sh" $W $HT; $AB wait 2500 >/dev/null; }
barline() { $AB get text body | grep -E "unsaved change|New project, not saved|No unsaved changes" | head -1; }
for sz in ${SIZES:-1280:1700 400:2400}; do W=${sz%%:*}; HT=${sz##*:}; echo "-- $W px"
  fresh; openproj
  check "$W open: bar says no changes" "No unsaved changes" "$(barline)"
  check "$W open: Danger zone shown for a saved project" 1 "$(has 'Danger zone')"
  check "$W open: Save is disabled" 1 "$($AB snapshot -i | grep 'button "Save"' | grep -c disabled)"
  shot m01-open-clean
  press 'Remove SENTRY_AUTH_TOKEN'; $AB wait 600 >/dev/null
  check "$W after one X: bar counts 1" "1 unsaved change" "$(barline)"
  check "$W after one X: Discard offered" 1 "$($AB snapshot -i | grep -c 'button "Discard"')"
  check "$W after one X: Save is on" 0 "$($AB snapshot -i | grep 'button "Save"' | grep -c disabled)"
  check "$W after one X: nothing saved yet (6 in file)" 6 "$(nvars)"
  shot m02-after-remove
  press 'Field for POSTHOG_CLI_HOST'; $AB wait 1500 >/dev/null
  press 'button "POSTHOG POSTHOG_CLI_HOST"'; $AB wait 800 >/dev/null
  check "$W after a pick: bar counts 2" "2 unsaved changes" "$(barline)"
  press 'button "Discard"'; $AB wait 600 >/dev/null
  check "$W Discard asks first" 1 "$(has 'Discard 2 unsaved changes?')"
  shot m03-discard-dialog
  press 'button "Keep editing"'; $AB wait 1200 >/dev/null
  check "$W Keep editing: draft intact" "2 unsaved changes" "$(barline)"
  press 'button "Discard"'; $AB wait 600 >/dev/null
  press 'button "Discard changes"'; $AB wait 1500 >/dev/null
  check "$W Discard changes: file unchanged (6)" 6 "$(nvars)"
  check "$W Discard changes: back on the project list" 1 "$($AB snapshot -i | grep -c 'button "Edit"')"
  shot m04-after-discard-list
  openproj
  check "$W reopened: all six rows back (pills)" 6 "$($AB snapshot -i | grep -c 'button "Remove ')"
  press 'Remove SENTRY_AUTH_TOKEN'; $AB wait 500 >/dev/null
  press 'button "Save"'
  T=0; for i in $(seq 1 20); do $AB snapshot | grep -q "Saved demo-app" && { T=1; break; }; sleep 0.3; done
  shot m05-saved-toast
  check "$W Save: toast 'Saved demo-app' shows" 1 "$T"
  $AB wait 1000 >/dev/null
  check "$W Save: file now has 5 variables" 5 "$(nvars)"
  fresh; openproj
  $AB scrollintoview "@$(ref 'button "Stop managing"')" >/dev/null 2>&1; shot m06a-page-bottom-danger-zone
  press 'button "Stop managing"'; $AB wait 900 >/dev/null
  shot m06-stop-dialog
  press 'button "Keep this project"'; $AB wait 600 >/dev/null
  check "$W Keep this project: still saved" 1 "$(nproj)"
  press 'button "Stop managing"'; $AB wait 900 >/dev/null
  pressend 'button "Stop managing"'; $AB wait 1800 >/dev/null
  check "$W Stop managing: project removed at once" 0 "$(nproj)"
  $AB wait 2500 >/dev/null; press 'button "Add a project'; $AB wait 800 >/dev/null
  press 'menuitem "billing-api"'; $AB wait 2000 >/dev/null
  check "$W unsaved project: bar says not saved yet" 1 "$(has 'New project, not saved yet')"
  check "$W unsaved project: no Danger zone" 0 "$(has 'Danger zone')"
  shot m07-new-project
done
[ "$FAILS" = 0 ] && echo "ALL PASS" || { echo "$FAILS FAILED"; }
