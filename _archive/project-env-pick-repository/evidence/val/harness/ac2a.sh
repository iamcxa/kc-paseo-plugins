#!/bin/bash
# AC-2 return flow on a fresh run-a Paseo (no project): add a repository through the sidebar, reopen the screen in the same browser session (no reload; window.__nr survives).
HD=$(cd "$(dirname "$0")" && pwd); EV=${OUT:?evidence dir}; mkdir -p "$EV"; PORT=8812; WD=/tmp/pr-val-a
. "$HD/lib.sh"
row() { ab snapshot 2>&1 | grep -E 'Add a project|Choose|Paseo has no|shop-api|menuitem|option' | sed -e 's/^ *//'; }
export PROJECTS=""; "$HD/setup.sh" "$WD" $PORT >/dev/null
{
ab close >/dev/null 2>&1 || true; ab open about:blank >/dev/null; ab set viewport 1280 1400 >/dev/null
open_screen; wait_text "Paseo has no project yet" 30
ab eval 'window.__nr = 1' >/dev/null
echo "== 1. screen opened, Paseo has no project:"; row
press 'button "Back"' 1500
press 'Add a projectOpen a folder' 1500
press 'Search for directory' 1500
r=$(ref 'textbox "Search directories'); ab fill "@$r" "$WD/shop-api" >/dev/null; ab wait 1500 >/dev/null
press 'Open this path' 3000
echo "== 2. repository added through the sidebar (Add project, Search for directory, Open this path); sidebar now lists:"; ab snapshot -i 2>&1 | grep -E 'shop-api' | head -2 | sed -e 's/^ *//'
press 'button "Settings"' 2000; press 'button "Plugins"' 1500; press 'Actions for paseo-project-env' 700; press 'menuitem "Project environment"' 2500
wait_text "Add a project" 20
echo "== 3. screen opened again in the same session (no reload: window.__nr=$(ab eval 'window.__nr')):"; row
press 'button "Add a project: Choose' 800
echo "== 4. the select opened lists:"; ab snapshot -i 2>&1 | grep -E 'shop-api|web-app' | head -3 | sed -e 's/^ *//'
ab screenshot "$EV/ac2-a-after-add-1280.png" >/dev/null
} > "$EV/ac2-a-return-flow.txt" 2>&1
cat "$EV/ac2-a-return-flow.txt"
