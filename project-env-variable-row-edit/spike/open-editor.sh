#!/bin/sh
ab=/tmp/variable-row-edit-spike-r15/ab.sh
$ab open http://127.0.0.1:6812/settings/hosts/srv_tc4QdKMOKPlC/plugins/row-edit-spike/projects >/dev/null
$ab wait 2500 >/dev/null
ref=$($ab snapshot -i | grep 'button "Edit"' | grep -v Editor | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/' | head -1)
$ab click @$ref >/dev/null
$ab wait 1500 >/dev/null
