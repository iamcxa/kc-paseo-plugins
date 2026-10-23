#!/bin/sh
# click offsets from the centre of the (!) glyph at 400 px: which still open the reason
. /tmp/pe-tsfm/bin/lib.sh
$A set viewport 400 2100 >/dev/null 2>&1; reopen; btn "Browse vault"; sleep 2.5; btn Test; sleep 6.5
G=$($A eval "(()=>{const b=document.querySelector('[aria-label*=\" failed. \"] > div').getBoundingClientRect();return Math.round(b.left+b.width/2)+' '+Math.round(b.top+b.height/2)})()" | tr -d '"'); GX=$(echo $G | cut -d' ' -f1); GY=$(echo $G | cut -d' ' -f2)
n() { $A eval "document.querySelectorAll('[role=alert]').length"; }
try() { $A mouse move $1 $2 >/dev/null 2>&1; $A mouse down >/dev/null 2>&1; $A mouse up >/dev/null 2>&1; sleep 0.6; echo "click offset ($(($1-GX)),$(($2-GY))) alerts=$(n)"; r=$(ref_of 'button "SENTRY_PROJECT failed'); [ "$(n)" != 0 ] && $A click @$r >/dev/null 2>&1; sleep 0.4; }
try $GX $GY; try $GX $((GY-20)); try $GX $((GY+20)); try $((GX-18)) $GY; try $((GX+18)) $GY; try $GX $((GY-24)); try $((GX+24)) $GY
