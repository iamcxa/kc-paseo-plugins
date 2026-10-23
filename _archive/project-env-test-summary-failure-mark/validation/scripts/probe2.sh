#!/bin/sh
. /tmp/pe-val-dir/bin/lib.sh
n() { $A eval "document.querySelectorAll('[role=alert]').length" | tr -d '"'; }
fresh; $A set viewport 1280 1900 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
reopen; btn Test; sleep 8
echo "after Test alerts=$(n)"
r=$(ref_of 'button "SENTRY_PROJECT failed'); $A click @$r >/dev/null 2>&1; sleep 0.7; echo "click 1 (pointer stays) alerts=$(n)"
$A click @$r >/dev/null 2>&1; sleep 0.7; echo "click 2 (pointer stays) alerts=$(n)"
$A click @$r >/dev/null 2>&1; sleep 0.7; echo "click 3 (pointer stays) alerts=$(n)"
$A hover @$(ref_of 'button "Test"') >/dev/null 2>&1; sleep 0.6; echo "pointer moved off alerts=$(n)"
