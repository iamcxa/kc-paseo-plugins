#!/bin/sh
# usage: open.sh WIDTH HEIGHT [project label]  -> opens the editor of the first project
S=/tmp/save-footer-spike
ab=$S/ab.sh
$ab set viewport $1 $2 >/dev/null
$ab open http://127.0.0.1:6831/settings/hosts/srv_4p1OMrAfu8XM/plugins/save-footer-spike/projects >/dev/null
$ab wait 3000 >/dev/null
ref=$($ab snapshot -i | grep 'button "Edit"' | grep -v Editor | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/' | head -1)
$ab click @$ref >/dev/null
$ab wait 1500 >/dev/null
