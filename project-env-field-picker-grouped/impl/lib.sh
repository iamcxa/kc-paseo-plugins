# Source me. Drives the isolated Paseo from run.sh with its own agent-browser session.
S=/tmp/fp-grouped-impl
ab() { agent-browser --session fp-grouped-impl "$@"; }
ID=$(cat $S/home/server-id)
URL="http://127.0.0.1:6874/settings/hosts/$ID/plugins/fp-grouped-impl/projects"
ref() { ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'; }
click() { ab click "@$(ref "$1")" >/dev/null; }
open_editor() { # $1 = project index (1-based Edit button), $2 = width, $3 = height
  ab set viewport "${2:-1280}" "${3:-1500}" >/dev/null
  ab open "$URL" >/dev/null; ab wait 2500 >/dev/null
  ab click "@$(ab snapshot -i | grep 'button "Edit"' | grep -v Editor | sed -n "${1:-1}p" | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/')" >/dev/null
  ab wait 2000 >/dev/null
}
shot() { ab screenshot "$1" >/dev/null && echo "saved $1"; }
