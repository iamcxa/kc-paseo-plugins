#!/bin/bash
# Usage: resize.sh <plugin-id> <tag> <screenshot-dir>
# Drives the settings screen in the real Paseo web client, resizing across the 720 px
# breakpoint, and asserts what is on screen by counting accessibility-tree rows
# (names and labels only; no secret is read or typed).
PLUGIN=$1; TAG=$2; OUT=$3
S=/tmp/draft-remount-impl; H=$(cd "$(dirname "$0")" && pwd)
ab() { agent-browser --session draft-remount-impl "$@"; }
SRV=$(cat $S/home/server-id)
url=http://127.0.0.1:6872/settings/hosts/$SRV/plugins/$PLUGIN/projects
F=$S/home/plugin-settings/$PLUGIN/projects.json
mkdir -p "$OUT"
FAILS=0
ref() { ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
click() { r=$(ref "$1"); [ -n "$r" ] && ab click @$r >/dev/null; }
fill() { r=$(ref "$1"); [ -n "$r" ] && ab fill @$r "$2" >/dev/null; }
shot() { ab screenshot "$OUT/$TAG-$1.png" >/dev/null; }
count() { ab snapshot ${SNAPFLAG--i} | grep -cE "$1"; }
expect() { # label, regex, want(1|0)
  n=$(count "$2")
  if { [ "$3" = 1 ] && [ "$n" -gt 0 ]; } || { [ "$3" = 0 ] && [ "$n" -eq 0 ]; }; then echo "PASS $1"; else echo "FAIL $1 (rows matching: $n, wanted $([ "$3" = 1 ] && echo some || echo none))"; FAILS=$((FAILS+1)); fi
}
editor_kept() { # step
  expect "$1: editor open" 'textbox "Appended' 1
  expect "$1: added row LINEAR_API_KEY" 'Remove LINEAR_API_KEY' 1
  expect "$1: typed prompt" 'every key' 1
}
open_url() { ab set viewport $1 $2 >/dev/null; ab open $url >/dev/null; ab wait 2500 >/dev/null; }
size() { ab set viewport $1 $2 >/dev/null; ab wait 1200 >/dev/null; }
edit() {
  fill 'textbox "New variable name"' LINEAR_API_KEY
  click 'button "Add"'
  fill 'textbox "Appended' "Use the demo-dev vault for every key."
  ab wait 600 >/dev/null
}
begin_edit() { python3 $H/fx.py $PLUGIN; open_url $1 $2; click 'button "Edit"'; ab wait 1500 >/dev/null; }

echo "== A: edit at 1280, cross to 719, 400, back to 1280"
begin_edit 1280 1980; edit; shot a1-desktop-edited; editor_kept a1-1280
size 719 2450; shot a2-719; editor_kept a2-719
size 400 2450; shot a3-400; editor_kept a3-400
size 1280 1980; shot a4-desktop-grown-back; editor_kept a4-1280-again

echo "== B: edit at 400, grow to 1280"
begin_edit 400 2450; edit; shot b1-400-edited; editor_kept b1-400
size 1280 1980; shot b2-desktop-grown; editor_kept b2-1280

echo "== C: new unsaved project, cross to 400 and back"
python3 $H/fx.py $PLUGIN; open_url 1280 1980
click 'button "Add a project'; ab wait 500 >/dev/null; click 'menuitem "billing-api"'; ab wait 1500 >/dev/null
fill 'textbox "1Password service account"' sa-a
fill 'textbox "New variable name"' STRIPE_KEY; click 'button "Add"'
fill 'textbox "Appended' "Billing agents use the stripe item."; ab wait 800 >/dev/null
shot c1-desktop-new-project
newp() { expect "$1: new project editor open" 'textbox "Appended' 1; expect "$1: added row STRIPE_KEY" 'Remove STRIPE_KEY' 1; expect "$1: typed prompt" 'stripe item' 1; }
newp c1-1280
size 400 2450; shot c2-400-new-project; newp c2-400
size 1280 1980; newp c3-1280

echo "== D: Save at 400 after a crossing"
begin_edit 1280 1980; edit; size 400 2450
click 'button "Save"'; ab wait 1500 >/dev/null; shot d-400-after-save
n=$(grep -c LINEAR_API_KEY $F); [ "$n" -gt 0 ] && echo "PASS d: settings file has LINEAR_API_KEY after Save" || { echo "FAIL d: settings file lacks LINEAR_API_KEY after Save"; FAILS=$((FAILS+1)); }
expect "d: back on the project list" 'button "Edit"' 1
expect "d: editor closed" 'textbox "Appended' 0

echo "== E: Discard at 400 after a crossing, then reopen"
begin_edit 1280 1980; edit; size 400 2450
click 'button "Discard"'; ab wait 1000 >/dev/null; shot e-400-after-discard
expect "e: back on the project list" 'button "Edit"' 1
size 1280 1980; expect "e: still the list after growing" 'button "Edit"' 1
click 'button "Edit"'; ab wait 1500 >/dev/null
expect "e: reopened editor has no discarded row" 'Remove LINEAR_API_KEY' 0
expect "e: reopened editor is open" 'textbox "Appended' 1

echo "== F: another client saved first, Save after a crossing is refused"
begin_edit 1280 1980; fill 'textbox "Appended' "Edited before the other writer."; ab wait 500 >/dev/null
python3 - "$F" <<'P'
import json, sys
d = json.load(open(sys.argv[1])); d["values"]["projects"][0]["prompt"] = "written by someone else"; json.dump(d, open(sys.argv[1], "w"))
P
size 400 2450; click 'button "Save"'; ab wait 1500 >/dev/null; shot f-400-conflict-refused
p=$(python3 -c "import json;print(json.load(open('$F'))['values']['projects'][0]['prompt'])")
[ "$p" = "written by someone else" ] && echo "PASS f: other writer's prompt still in the file" || { echo "FAIL f: file prompt is '$p'"; FAILS=$((FAILS+1)); }
expect "f: editor still open after the refusal" 'textbox "Appended' 1
SNAPFLAG="" expect "f: refusal message shown" 'Settings changed on another client' 1

echo "== G: Stop managing dialog open, cross to 400"
begin_edit 1280 1980; edit; click 'button "Stop managing"'; ab wait 800 >/dev/null; shot g1-desktop-stop-dialog-open
expect "g: dialog open at 1280" 'button "Keep"' 1
size 400 2450; shot g2-400-dialog-closed-draft-kept
expect "g: dialog closed after the crossing" 'button "Keep"' 0
expect "g: draft kept after the crossing" 'Remove LINEAR_API_KEY' 1

python3 $H/fx.py $PLUGIN
echo "RESULT $TAG: $FAILS check(s) failed"
exit $([ $FAILS -eq 0 ] && echo 0 || echo 1)
