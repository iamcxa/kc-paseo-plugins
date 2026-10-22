#!/bin/sh
. /tmp/pe-val-dir/bin/lib.sh
fresh; $A set viewport 1280 1900 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
reopen; btn Test; sleep 8
r=$(ref_of 'button "STRIPE_KEY failed'); $A hover @$r >/dev/null 2>&1; sleep 0.8
echo "alerts=$($A eval "document.querySelectorAll('[role=alert]').length" | tr -d '"')"
$A screenshot /tmp/pe-val-dir/shots/desktop-dark-hover.png; echo "shot exit $?"
