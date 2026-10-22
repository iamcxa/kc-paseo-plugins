#!/bin/sh
# Tab reaches the (!) and Enter opens its reason; a click 18 px beside the glyph opens it, 24 px does not.
. /tmp/pe-val-dir/bin/lib.sh
W=$1; fresh; $A set viewport $1 2100 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
n() { $A eval "document.querySelectorAll('[role=alert]').length" | tr -d '"'; }
reopen; btn Test; sleep 7
r=$(ref_of 'button "Field for SENTRY_PROJECT:'); $A focus @$r >/dev/null 2>&1
$A press Tab >/dev/null 2>&1; echo "$1 px: after one Tab from the field control, focus is on: $($A eval "document.activeElement.getAttribute('aria-label')" | tr -d '"')"
$A press Enter >/dev/null 2>&1; sleep 0.6; echo "$1 px: Enter opens it: alerts=$(n)"
$A press Enter >/dev/null 2>&1; sleep 0.6; echo "$1 px: Enter again closes it: alerts=$(n)"
G=$($A eval "(()=>{const b=document.querySelector('[aria-label*=\" failed. \"] > div').getBoundingClientRect();return Math.round(b.left+b.width/2)+' '+Math.round(b.top+b.height/2)})()" | tr -d '"'); GX=${G% *}; GY=${G#* }
try() { $A mouse move $1 $2 >/dev/null 2>&1; $A mouse down >/dev/null 2>&1; $A mouse up >/dev/null 2>&1; sleep 0.6; echo "$W px: click offset ($(($1-GX)),$(($2-GY))) alerts=$(n)"; r=$(ref_of 'button "Test"'); $A hover @$r >/dev/null 2>&1; sleep 0.3; if [ "$(n)" != 0 ]; then $A mouse move $GX $GY >/dev/null 2>&1; $A mouse down >/dev/null 2>&1; $A mouse up >/dev/null 2>&1; sleep 0.5; $A hover @$r >/dev/null 2>&1; fi; }
try $((GX-18)) $GY; try $((GX+18)) $GY; try $GX $((GY-20)); try $((GX+24)) $GY; try $((GX-24)) $GY
