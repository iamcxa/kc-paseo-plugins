ab() { agent-browser --session ac2-fake "$@"; }
ref() { ab snapshot -i 2>&1 | grep -F "$1" | head -1 | sed -E 's/.*ref=(e[0-9]+)\].*/\1/'; }
press() { local r; r=$(ref "$1"); [ -n "$r" ] || { echo "NO CONTROL: $1"; return 1; }; ab click "@$r" >/dev/null; ab wait "${2:-1200}" >/dev/null; echo "pressed: $1"; }
