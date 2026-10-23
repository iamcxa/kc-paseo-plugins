ab() { agent-browser --session pe-add-step "$@"; }
ID=$(cat /tmp/pe-add-step/home/server-id)
URL="http://127.0.0.1:6897/settings/hosts/$ID/plugins/pe-add-step/projects"
ref() { ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'; }
click() { r=$(ref "$1"); [ -n "$r" ] || { echo "NOREF $1"; return 1; }; ab click "@$r" >/dev/null; ab wait 900 >/dev/null; }
fill() { r=$(ref "$1"); [ -n "$r" ] || { echo "NOREF $1"; return 1; }; ab fill "@$r" "$2" >/dev/null; ab wait 500 >/dev/null; }
shot() { ab screenshot "$1" >/dev/null; }
size() { ab set viewport $1 $2 >/dev/null; ab wait 800 >/dev/null; }
opened() { ab open "$URL" >/dev/null; ab wait 2500 >/dev/null; }
edit_nth() { # 1-based Edit button
  r=$(ab snapshot -i | grep 'button "Edit"' | grep -v Editor | sed -n "${1}p" | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'); ab click "@$r" >/dev/null; ab wait 1500 >/dev/null; }
