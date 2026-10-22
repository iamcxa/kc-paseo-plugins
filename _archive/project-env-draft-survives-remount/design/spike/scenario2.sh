#!/bin/sh
S=/tmp/draft-remount-spike; ab=$S/ab.sh; tag=$1
url=http://127.0.0.1:6862/settings/hosts/srv_EHT67YCehQmg/plugins/draft-remount-spike/projects
F=$S/home/plugin-settings/draft-remount-spike/projects.json
ref() { $ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
edit() {
  $ab fill @$(ref 'textbox "New variable name"') LINEAR_API_KEY >/dev/null
  $ab click @$(ref 'button "Add"') >/dev/null
  $ab fill @$(ref 'textbox "Appended') "Use the demo-dev vault for every key." >/dev/null
  $ab wait 600 >/dev/null
}
saved() { echo "$1: file_has_LINEAR=$(grep -c LINEAR_API_KEY $F)"; }
python3 $S/fx.py
echo "== D: edit wide, shrink, Save at 400"
$ab set viewport 1280 1980 >/dev/null; $ab open $url >/dev/null; $ab wait 2500 >/dev/null
$ab click @$(ref 'button "Edit"') >/dev/null; $ab wait 1500 >/dev/null; edit
$ab set viewport 400 2450 >/dev/null; $ab wait 1200 >/dev/null
$ab click @$(ref 'button "Save"') >/dev/null; $ab wait 1500 >/dev/null
saved d-after-save; echo "list_shown=$($ab snapshot -i | grep -c 'button "Edit"')"
$ab screenshot $S/$tag-d-400-after-save.png >/dev/null
echo "== E: edit, shrink, Discard at 400, reopen"
python3 $S/fx.py
$ab set viewport 1280 1980 >/dev/null; $ab open $url >/dev/null; $ab wait 2500 >/dev/null
$ab click @$(ref 'button "Edit"') >/dev/null; $ab wait 1500 >/dev/null; edit
$ab set viewport 400 2450 >/dev/null; $ab wait 1200 >/dev/null
$ab click @$(ref 'button "Discard"') >/dev/null; $ab wait 1000 >/dev/null
$ab set viewport 1280 1980 >/dev/null; $ab wait 1000 >/dev/null
echo "after discard + grow: list_shown=$($ab snapshot -i | grep -c 'button "Edit"') draft_leaked=$($ab snapshot -i | grep -c 'Remove LINEAR')"
$ab click @$(ref 'button "Edit"') >/dev/null; $ab wait 1500 >/dev/null
echo "reopened: draft_leaked=$($ab snapshot -i | grep -c 'Remove LINEAR')"
python3 $S/fx.py
