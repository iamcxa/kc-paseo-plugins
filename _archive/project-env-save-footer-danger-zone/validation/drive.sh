#!/bin/sh
# Drives the editor on the isolated daemon started by up.sh; prints PASS/FAIL per check, exit 1 on any FAIL.
S=/tmp/sfdz-val
F=$S/home/plugin-settings/sfdz-val/projects.json
HERE=$(cd "$(dirname "$0")" && pwd)
SID=$(tr -d '\n' < "$S/home/server-id")
ab() { agent-browser --session sfdz-val "$@"; }
FAILS=0
check() { if [ "$2" = "$3" ]; then echo "PASS $1"; else echo "FAIL $1: expected [$2] got [$3]"; FAILS=$((FAILS+1)); fi; }
ref() { ab snapshot -i | grep -E "$1" | sed 's/.*ref=\(e[0-9]*\)\].*/\1/' | head -1; }
reflast() { ab snapshot -i | grep -E "$1" | sed 's/.*ref=\(e[0-9]*\)\].*/\1/' | tail -1; }
tail3() { ab get text body | tail -3 | head -1; }
has() { ab get text body | grep -c "$1"; }
nvars() { python3 -c "import json;p=json.load(open('$F'))['values']['projects'];print(len(p[0]['variables']) if p else 0)"; }
nproj() { python3 -c "import json;print(len(json.load(open('$F'))['values']['projects']))"; }
prompt() { python3 -c "import json;print(json.load(open('$F'))['values']['projects'][0]['prompt'])"; }
open_editor() {
  ab set viewport 1280 2700 >/dev/null
  ab open "http://127.0.0.1:6911/settings/hosts/$SID/plugins/sfdz-val/projects" >/dev/null; ab wait 3000 >/dev/null
  ab click "@$(ref 'button "Edit"' )" >/dev/null; ab wait 1500 >/dev/null
}
edit3() {
  for n in SENTRY_PROJECT STRIPE_KEY; do ab click "@$(ref "button \"Remove $n\"")" >/dev/null; ab wait 300 >/dev/null; done
  ab fill "@$(ref 'textbox "Appended')" "Use the demo-dev vault for every key." >/dev/null; ab wait 400 >/dev/null
}
python3 "$HERE/fx.py"
open_editor
check "open: bar says no changes" "No unsaved changes" "$(ab get text body | grep 'unsaved changes' )"
check "open: Danger zone shown for a saved project" 1 "$(has 'Danger zone')"
edit3
check "3 edits: bar counts 3" "3 unsaved changes" "$(ab get text body | grep 'unsaved changes')"
ab screenshot "$S/shots/acc-edited-3.png" >/dev/null
ab click "@$(ref 'button "Discard"')" >/dev/null; ab wait 600 >/dev/null
check "Discard asks first" 1 "$(has 'Discard 3 unsaved changes?')"
ab click "@$(ref 'button "Keep editing"')" >/dev/null; ab wait 500 >/dev/null
check "Keep editing returns with draft intact" "3 unsaved changes" "$(ab get text body | grep 'unsaved changes')"
ab click "@$(ref 'button "Discard"')" >/dev/null; ab wait 600 >/dev/null
ab click "@$(ref 'button "Discard changes"')" >/dev/null; ab wait 1200 >/dev/null
check "Discard changes: saved file unchanged (6 variables)" 6 "$(nvars)"
open_editor; edit3
ab click "@$(ref 'button "Save"')" >/dev/null
T=0; for i in 1 2 3 4 5 6; do ab snapshot | grep -q "Saved demo-app" && { T=1; break; }; sleep 0.3; done
ab screenshot "$S/shots/acc-saved-toast.png" >/dev/null
check "Save: toast 'Saved demo-app' shows" 1 "$T"
ab wait 1000 >/dev/null
check "Save: file now has 4 variables" 4 "$(nvars)"
check "Save: prompt written" "Use the demo-dev vault for every key." "$(prompt)"
python3 "$HERE/fx.py"; open_editor
ab click "@$(ref 'button "Stop managing"')" >/dev/null; ab wait 700 >/dev/null
ab screenshot "$S/shots/acc-stop-dialog.png" >/dev/null
ab click "@$(ref 'button "Keep this project"')" >/dev/null; ab wait 600 >/dev/null
check "Keep this project: project still saved" 1 "$(nproj)"
ab click "@$(ref 'button "Stop managing"')" >/dev/null; ab wait 600 >/dev/null
ab click "@$(reflast 'button "Stop managing"')" >/dev/null
ab wait 1500 >/dev/null
check "Stop managing: project removed at once" 0 "$(nproj)"
# new, not yet saved project: no Danger zone
ab click "@$(ref 'button "Add a project')" >/dev/null; ab wait 800 >/dev/null
ab click "@$(ref 'menuitem "billing-api"')" >/dev/null; ab wait 1500 >/dev/null
check "unsaved project: editor opened (bar says not saved yet)" 1 "$(has 'New project, not saved yet')"
check "unsaved project: bar offers Discard" 1 "$(ab snapshot -i | grep -c 'button "Discard"')"
check "unsaved project: Save is on" 0 "$(ab snapshot -i | grep 'button "Save"' | grep -c disabled)"
check "unsaved project: no Danger zone" 0 "$(has 'Danger zone')"
ab screenshot "$S/shots/acc-new-project.png" >/dev/null
ab click "@$(ref 'button "Save"')" >/dev/null; ab wait 1500 >/dev/null
check "unsaved project: Save with no edits writes the project" 1 "$(nproj)"
echo "screenshots: $S/shots/acc-*.png"
[ "$FAILS" = 0 ] && echo "ALL PASS" || { echo "$FAILS FAILED"; exit 1; }
