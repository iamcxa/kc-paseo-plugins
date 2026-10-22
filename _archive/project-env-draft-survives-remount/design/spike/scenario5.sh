#!/bin/sh
S=/tmp/draft-remount-spike; ab=$S/ab.sh
url=http://127.0.0.1:6862/settings/hosts/srv_EHT67YCehQmg/plugins/draft-remount-spike/projects
ref() { $ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
edit() {
  $ab fill @$(ref 'textbox "New variable name"') LINEAR_API_KEY >/dev/null
  $ab click @$(ref 'button "Add"') >/dev/null
  $ab fill @$(ref 'textbox "Appended') "Use the demo-dev vault for every key." >/dev/null
  $ab wait 600 >/dev/null
}
python3 $S/fx.py
echo "== G: Stop managing dialog open, cross to 400"
$ab set viewport 1280 1980 >/dev/null; $ab open $url >/dev/null; $ab wait 2500 >/dev/null
$ab click @$(ref 'button "Edit"') >/dev/null; $ab wait 1500 >/dev/null; edit
$ab click @$(ref 'button "Stop managing"') >/dev/null; $ab wait 800 >/dev/null
$ab screenshot $S/g1-desktop-stop-dialog-open.png >/dev/null
echo "dialog open: $($ab snapshot -i | grep -c 'Keep')"
$ab set viewport 400 2450 >/dev/null; $ab wait 1200 >/dev/null
$ab screenshot $S/g2-400-after-crossing-dialog.png >/dev/null
echo "after crossing: dialog=$($ab snapshot -i | grep -c 'button "Keep"') draft=$($ab snapshot -i | grep -c 'Remove LINEAR')"
echo "== H: Discard at 400 after crossing"
python3 $S/fx.py
$ab set viewport 1280 1980 >/dev/null; $ab open $url >/dev/null; $ab wait 2500 >/dev/null
$ab click @$(ref 'button "Edit"') >/dev/null; $ab wait 1500 >/dev/null; edit
$ab set viewport 400 2450 >/dev/null; $ab wait 1200 >/dev/null
$ab click @$(ref 'button "Discard"') >/dev/null; $ab wait 1000 >/dev/null
$ab screenshot $S/h-400-after-discard.png >/dev/null
echo "list=$($ab snapshot -i | grep -c 'button "Edit"')"
python3 $S/fx.py
