# Source after setting PORT. Own browser session, never the docs capture's.
SESSION=pr-val-pick
ab() { agent-browser --session $SESSION "$@"; }
ref() { ab snapshot -i 2>&1 | grep -F "$1" | head -1 | sed -E 's/.*ref=(e[0-9]+)\].*/\1/'; }
press() { local r; r=$(ref "$1"); [ -n "$r" ] || { echo "no control: $1"; return 1; }; ab click "@$r" >/dev/null; ab wait "${2:-1200}" >/dev/null; }
# open_screen: Settings, Plugins, enable plugins, actions menu, Project environment
open_screen() {
  ab open "http://127.0.0.1:$PORT/settings/plugins" >/dev/null; ab wait 2500 >/dev/null
  press 'button "Plugins"' || true
  if ab snapshot -i 2>&1 | grep -qF 'switch "Enable plugins" [checked=false'; then press 'switch "Enable plugins"' 4000; fi
  press 'Actions for paseo-project-env' 700
  press 'menuitem "Project environment"' 2500
}
# wait_text <text> [seconds]
wait_text() { local i; for i in $(seq 1 ${2:-30}); do ab eval 'document.body.innerText' 2>/dev/null | grep -qF "$1" && return 0; sleep 1; done; echo "timeout waiting for: $1"; return 1; }
