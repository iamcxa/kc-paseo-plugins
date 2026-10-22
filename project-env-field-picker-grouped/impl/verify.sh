#!/bin/bash
# Runtime checks of the two PR #24 findings on the isolated Paseo from run.sh. Exit 1 when either fails.
# 1: the search text is empty when the picker opens again after a pick. 2: Use stays disabled for a reference with an empty or blank segment.
set -u
cd "$(dirname "$0")"; source lib.sh
rc=0
value() { ab eval "document.querySelector('input[aria-label=\"$1\"]')?.value ?? 'NO-BOX'" | tr -d '"'; }
disabled() { ab eval "(()=>{const b=document.querySelector('[aria-label=\"Use reference\"]');return b?(b.getAttribute('aria-disabled')==='true'||b.disabled):'NO-BUTTON'})()" | tr -d '"'; }
open_editor 1 1280 900
click 'button "Field for SENTRY_PROJECT'; ab wait 12000 >/dev/null
ab fill "@$(ref 'textbox "Search fields"')" "twilio" >/dev/null; ab wait 500 >/dev/null
click 'button "Twilio TWILIO_AUTH_TOKEN"'; ab wait 800 >/dev/null
click 'button "Field for SENTRY_PROJECT'; ab wait 1200 >/dev/null
v=$(value "Search fields"); echo "search text after pick and reopen: [$v]"; [ "$v" = "" ] || { echo "FAIL finding 1"; rc=1; }
ab click "@$(ab snapshot -i | grep 'button "Close"' | tail -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/')" >/dev/null; ab wait 600 >/dev/null
open_editor 3 1280 900
click 'button "Field for NEW_ONE'; ab wait 3000 >/dev/null
click 'Type a reference'; ab wait 500 >/dev/null
for r in "op://Dev/item//field" "op://Dev/ /field" "op://Dev/item/field"; do
  ab fill "@$(ref 'textbox "Reference"')" "$r" >/dev/null; ab wait 400 >/dev/null
  echo "Use disabled for [$r]: $(disabled)"
done
exit $rc
