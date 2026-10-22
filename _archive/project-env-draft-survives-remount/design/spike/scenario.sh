#!/bin/sh
S=/tmp/draft-remount-spike; ab=$S/ab.sh; tag=$1
url=http://127.0.0.1:6862/settings/hosts/srv_EHT67YCehQmg/plugins/draft-remount-spike/projects
ref() { $ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
edit() {
  $ab fill @$(ref 'textbox "New variable name"') LINEAR_API_KEY >/dev/null
  $ab click @$(ref 'button "Add"') >/dev/null
  $ab fill @$(ref 'textbox "Appended') "Use the demo-dev vault for every key." >/dev/null
  $ab wait 600 >/dev/null
}
have() { echo "$1: draft_present=$($ab snapshot -i | grep -cE 'Remove LINEAR') prompt_present=$($ab snapshot -i | grep -c 'every key')"; }
echo "== A: edit wide, shrink to 400, grow back"
$ab set viewport 1280 1980 >/dev/null; $ab open $url >/dev/null; $ab wait 2500 >/dev/null
$ab click @$(ref 'button "Edit"') >/dev/null; $ab wait 1500 >/dev/null
edit; $ab screenshot $S/$tag-a1-desktop-edited.png >/dev/null; have a1
$ab set viewport 400 2450 >/dev/null; $ab wait 1200 >/dev/null; $ab screenshot $S/$tag-a2-400-after-shrink.png >/dev/null; have a2
$ab set viewport 1280 1980 >/dev/null; $ab wait 1200 >/dev/null; $ab screenshot $S/$tag-a3-desktop-after-grow.png >/dev/null; have a3
echo "== B: edit narrow, grow to desktop"
$ab set viewport 400 2450 >/dev/null; $ab open $url >/dev/null; $ab wait 2500 >/dev/null
$ab click @$(ref 'button "Edit"') >/dev/null; $ab wait 1500 >/dev/null
edit; $ab screenshot $S/$tag-b1-400-edited.png >/dev/null; have b1
$ab set viewport 1280 1980 >/dev/null; $ab wait 1200 >/dev/null; $ab screenshot $S/$tag-b2-desktop-after-grow.png >/dev/null; have b2
