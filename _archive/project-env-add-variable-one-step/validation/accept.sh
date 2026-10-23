#!/bin/bash
# Drive the built Add flow in a browser against the isolated Paseo from setup.sh and assert what is on screen.
# Usage: accept.sh [desktop|compact]   (default desktop = 1280x1300; compact = 400x1300)
. "$(dirname "$0")/env.sh"
MODE=${1:-desktop}; W=1280; [ "$MODE" = compact ] && W=400
O=$S/out; FAIL=0
ID=$(cat "$S/home/server-id")
URL="http://127.0.0.1:$PORT/settings/hosts/$ID/plugins/$PLUGIN_ID/projects"
ref() { ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'; }
click() { r=$(ref "$1"); [ -n "$r" ] || { echo "  NOREF $1"; FAIL=1; return 1; }; ab click "@$r" >/dev/null; ab wait 900 >/dev/null; }
fill() { r=$(ref "$1"); [ -n "$r" ] || { echo "  NOREF $1"; FAIL=1; return 1; }; ab fill "@$r" "$2" >/dev/null; ab wait 600 >/dev/null; }
shot() { ab screenshot "$O/$MODE-$1.png" >/dev/null; }
page() { ab snapshot 2>/dev/null; }
has() { page | grep -qE "$2" && echo "  ok   $1" || { echo "  FAIL $1 (expected /$2/)"; FAIL=1; }; }
lacks() { page | grep -qE "$2" && { echo "  FAIL $1 (found /$2/)"; FAIL=1; } || echo "  ok   $1"; }
edit_nth() { r=$(ab snapshot -i | grep 'button "Edit"' | grep -v Editor | sed -n "${1}p" | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'); ab click "@$r" >/dev/null; ab wait 1800 >/dev/null; }
open_project() { ab open "$URL" >/dev/null; ab wait 2500 >/dev/null; edit_nth "$1"; }
add() { click 'button "\+ Add"'; ab wait 2500 >/dev/null; }
settings() { python3 -c "
import json,sys
d=json.load(open('$S/home/plugin-settings/$PLUGIN_ID/projects.json'))
p=[x for x in d['values']['projects'] if x['root'].endswith('$1')][0]
print(json.dumps(p['variables']))"; }

python3 "$HERE/fx.py" "$S" "$PLUGIN_ID"
ab set viewport $W 1300 >/dev/null; ab wait 800 >/dev/null

echo "[1] picking a field names the row from its label (project 'work')"
open_project 1
add; has "picker opens with a search box that also takes a name" 'textbox "Search fields'
shot 02-picker-open
click 'button "stripe STRIPE_WEBHOOK_SECRET"'; ab wait 700 >/dev/null
has "kept name shown as plain text" 'Remove STRIPE_WEBHOOK_SECRET'
lacks "no name input for a kept name" 'textbox "Variable name"'
shot 03-kept
add; click 'button "stripe Publishable key"'; ab wait 700 >/dev/null
has "converted name is in an editable input" 'textbox "Variable name"'
shot 04-converted
ab press Enter >/dev/null; ab wait 700 >/dev/null
has "Enter commits the converted name" 'Remove PUBLISHABLE_KEY'
add; click 'button "TWILIO PATH"'; ab wait 700 >/dev/null
has "reserved label leaves the name empty with the reason" 'PATH is reserved'
has "Save blocked note" 'Name 1 variable first'
shot 05-reserved
add; click 'button "SENTRY SENTRY_AUTH_TOKEN"'; ab wait 700 >/dev/null
has "used label: reason" 'SENTRY_AUTH_TOKEN is already in this project'
has "two unnamed rows counted" 'Name 2 variables first'
shot 06-used
r=$(ref 'button "Save"'); ab snapshot -i | grep -q 'button "Save" \[disabled' && echo "  ok   Save disabled while rows are unnamed" || { echo "  FAIL Save not disabled"; FAIL=1; }

echo "[2] a named row with no field shows 'Pick a field', saves, and Test says field not found (project 'work-empty')"
open_project 2
add
fill 'textbox "Search fields' "NEW_API_KEY"
click 'button "Add NEW_API_KEY and pick the field later"'; ab wait 800 >/dev/null
has "row named NEW_API_KEY" 'Remove NEW_API_KEY'
has "dashed pill reads Pick a field" 'Pick a field'
has "fieldless note under Save" '1 without a field will read failed until you pick one'
lacks "no red 'No field picked' before Test" 'No field picked'
shot 09-name-only-row
click 'button "Save"'; ab wait 2000 >/dev/null
echo "  saved variables: $(settings work-empty)"
[ "$(settings work-empty)" = '[{"name": "NEW_API_KEY", "ref": ""}]' ] && echo "  ok   settings file holds the row with an empty ref" || { echo "  FAIL settings file"; FAIL=1; }
open_project 4
click 'button "Test"'; ab wait 3500 >/dev/null
shot 18-name-only-after-test
echo "  (after Test: text 'field not found in the vault' present? $(page | grep -c 'field not found in the vault'))"

echo "[3] typed text: refused shows the reason, nothing to press"
open_project 1
add; fill 'textbox "Search fields' "!!!"
has "no letters reason" 'no letters or digits'
lacks "no add button for refused text" 'pick the field later'
fill 'textbox "Search fields' "stripe key"
has "typed name that is used is refused" 'STRIPE_KEY is already in this project'
shot 08-typed-refused
echo "[4] the field pill still picks a field for a name-only row, and Save then writes the reference (project 'work-empty')"
open_project 4
click 'button "Field for NEW_API_KEY'; ab wait 2500 >/dev/null
has "row-mode picker is titled for the variable" 'Field for NEW_API_KEY'
has "row-mode picker has no add-by-name row" 'textbox "Search fields"'
click 'button "stripe STRIPE_WEBHOOK_SECRET"'; ab wait 800 >/dev/null
has "pill now shows the picked field" 'Field for NEW_API_KEY: stripe STRIPE_WEBHOOK_SECRET'
has "save bar counts one unsaved change" '1 unsaved change'
click 'button "Save"'; ab wait 2000 >/dev/null
echo "  saved variables: $(settings work-empty)"
[ "$(settings work-empty)" = '[{"name": "NEW_API_KEY", "ref": "op://Dev/stripe/STRIPE_WEBHOOK_SECRET"}]' ] && echo "  ok   settings file holds the picked reference" || { echo "  FAIL settings file"; FAIL=1; }

echo "[5] a 12-variable project: the new row is added and scrolled into view (project 'work-many')"
open_project 2
add; fill 'textbox "Search fields' "publish"; click 'button "stripe Publishable key"'; ab wait 1200 >/dev/null
has "converted name row exists with an input" 'textbox "Variable name"'
shot 15-many-rows-new-row-in-view
r=$(ab eval "(()=>{const i=document.querySelector('[aria-label=\"Variable name\"]');if(!i)return 'none';const b=i.getBoundingClientRect();return (b.top>=0&&b.bottom<=innerHeight)?'in-view':'OUT-OF-VIEW '+b.top})()" 2>/dev/null | tr -d '"')
echo "  rows on screen: $(page | grep -c 'Remove ') (12 variables plus the new one)"
echo "  new name input: $r"; [ "$r" = "in-view" ] && echo "  ok   new row in view" || { echo "  FAIL new row not in view"; FAIL=1; }

echo "[6] no vault connection: + Add still opens, typing a name still offers add (project 'work-bare')"
open_project 3
add; fill 'textbox "Search fields' "linear api key"
has "name-only add is offered while the vault is unavailable" 'Add LINEAR_API_KEY and pick the field later'
shot 12-unavailable-picker
echo "RESULT: $([ $FAIL = 0 ] && echo PASS || echo FAIL) ($MODE)"
exit $FAIL
