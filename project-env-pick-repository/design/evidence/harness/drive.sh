#!/bin/bash
# usage: drive.sh <work> <port>   Opens the plugin screen in a fresh browser session.
export S=${1:?} PORT=${2:?}
. "$(dirname "$0")/env.sh"
ref() { ab snapshot -i 2>&1 | grep -F "$1" | head -1 | sed -E 's/.*ref=(e[0-9]+)\].*/\1/'; }
press() { local r; r=$(ref "$1"); [ -n "$r" ] || { echo "no control: $1"; return 1; }; ab click "@$r" >/dev/null; ab wait "${2:-1200}" >/dev/null; }
ab close >/dev/null 2>&1 || true
ab open about:blank >/dev/null; ab set viewport 1280 900 >/dev/null
ab open "http://127.0.0.1:$PORT/settings/plugins" >/dev/null; ab wait 2500 >/dev/null
press 'button "Plugins"'
press 'switch "Enable plugins"' 4000
press 'Actions for paseo-project-env' 700
press 'menuitem "Project environment"' 3500
