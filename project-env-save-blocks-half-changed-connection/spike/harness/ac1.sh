#!/bin/bash
# AC-1 and AC-2 runtime: Save is blocked while Change is open, survives a 720 px remount, works after Cancel; saved project keeps its place.
. "$(dirname "$0")/lib.sh"
W=${1:-1280}; H=${2:-1750}
PJ="$S/home/plugin-settings/$PLUGIN_ID/projects.json"
hash() { shasum "$PJ" | cut -c1-12; }
saveState() { ab snapshot -i | grep -E 'button "Save"' | grep -c disabled; }
barText() { ab eval "(()=>{const t=document.body.innerText;return t.slice(-170).replace(/\n/g,' | ')})()"; }
view $W $H; reopen; openproject 1          # work-empty: the second of four
echo "order before: $(projects_json)"
H0=$(hash)
pr=$(ref 'textbox "Appended'); ab fill @$pr "Use the staging database" >/dev/null
jsclick Change >/dev/null; sleep 1
fillbox "1Password service account" "sa-typo"; jsclick Check >/dev/null; sleep 3
echo "[$W] Change open, typo checked: Save disabled=$(saveState)  bar: $(barText)"
jsclick Save >/dev/null; sleep 1
echo "[$W] after pressing Save during Change: projects.json unchanged=$([ "$(hash)" = "$H0" ] && echo yes || echo NO)"
view 700 $H; sleep 2; view $W $H; sleep 2
echo "[$W] after crossing 720 px: Save disabled=$(saveState)  bar: $(barText)"
jsclick Cancel >/dev/null; sleep 1
echo "[$W] after Cancel: Save disabled=$(saveState)  bar: $(barText)"
jsclick Save >/dev/null; sleep 2
echo "[$W] after Save: projects.json changed=$([ "$(hash)" != "$H0" ] && echo yes || echo NO)"
echo "order after:  $(projects_json)"
body | sed -n '/Projects/,$p' | head -14 | tr '\n' '|'; echo
