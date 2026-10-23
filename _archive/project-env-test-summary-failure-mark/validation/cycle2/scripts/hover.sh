#!/bin/sh
# 1280 px with a mouse: hover opens, press pins, a second press closes while the pointer stays, leaving closes a hover-only reason.
. /tmp/pe-val2-dir/bin/lib.sh
n() { $A eval "document.querySelectorAll('[role=alert]').length" | tr -d '"'; }
fresh; $A set viewport 1280 1900 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
reopen; btn Test; sleep 8
r=$(ref_of 'button "STRIPE_KEY failed'); $A hover @$r >/dev/null 2>&1; sleep 0.8; echo "hover opens: alerts=$(n)"
$A screenshot /tmp/pe-val2-dir/shots/desktop-dark-hover.png >/dev/null 2>&1
$A hover @$(ref_of 'button "Test"') >/dev/null 2>&1; sleep 0.6; echo "pointer leaves a hover-only reason: alerts=$(n)"
$A click @$r >/dev/null 2>&1; sleep 0.6; echo "press 1 pins: alerts=$(n)"
$A click @$r >/dev/null 2>&1; sleep 0.6; echo "press 2 with the pointer still on the (!): alerts=$(n)"
