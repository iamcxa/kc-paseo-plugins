#!/bin/sh
S=/tmp/draft-remount-spike; ab=$S/ab.sh
url=http://127.0.0.1:6862/settings/hosts/srv_EHT67YCehQmg/plugins/draft-remount-spike/projects
F=$S/home/plugin-settings/draft-remount-spike/projects.json
ref() { $ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
python3 $S/fx.py
$ab set viewport 1280 1980 >/dev/null; $ab open $url >/dev/null; $ab wait 2500 >/dev/null
$ab click @$(ref 'button "Edit"') >/dev/null; $ab wait 1500 >/dev/null
$ab fill @$(ref 'textbox "Appended') "Edited before the other writer." >/dev/null; $ab wait 500 >/dev/null
python3 - <<'P'
import json
F="/tmp/draft-remount-spike/home/plugin-settings/draft-remount-spike/projects.json"
d=json.load(open(F)); d["values"]["projects"][0]["prompt"]="written by someone else"; json.dump(d,open(F,"w"))
P
$ab set viewport 400 2450 >/dev/null; $ab wait 1200 >/dev/null
$ab click @$(ref 'button "Save"') >/dev/null; $ab wait 1500 >/dev/null
echo "file prompt after Save: $(python3 -c "import json;print(json.load(open('$F'))['values']['projects'][0]['prompt'])")"
echo "editor still open: $($ab snapshot -i | grep -c 'button "Save"')"
$ab screenshot $S/after-f-400-conflict.png >/dev/null
python3 $S/fx.py
