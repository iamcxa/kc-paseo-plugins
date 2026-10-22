#!/bin/sh
# usage: capture.sh <width> <height> <prefix> <dark|light>
. /tmp/pe-tsfm/bin/lib.sh
W=$1; H=$2; P=$3; SCHEME=$4; O=/tmp/pe-tsfm/shots
shot() { $A screenshot $O/$P-$SCHEME-$1.png >/dev/null 2>&1; }
measure() { echo "$P $SCHEME $1: $($A eval "$(cat /tmp/pe-tsfm/bin/measure.js)" 2>&1)"; }
mark() { r=$(ref_of "button \"$1 failed"); [ -n "$r" ] && $A click @$r >/dev/null 2>&1; sleep 0.7; }
$A set viewport $W $H >/dev/null 2>&1; $A set media $SCHEME >/dev/null 2>&1; sleep 1
reopen; btn "Browse vault"; sleep 2.5
shot before-test
btn Test; sleep 1; shot testing; sleep 6.5
shot results
mark SENTRY_PROJECT; shot tip-open; measure SENTRY_PROJECT
mark STRIPE_KEY; shot tip-open-stripe; measure STRIPE_KEY
mark STRIPE_KEY; $A hover @$(ref_of "button \"Test\"") >/dev/null 2>&1; sleep 0.5; echo "$P $SCHEME closed (pin off, pointer away): alerts=$($A eval "document.querySelectorAll(\"[role=alert]\").length")"
if [ "$P" = desktop ]; then
  r=$(ref_of 'button "SENTRY_PROJECT failed'); $A hover @$r >/dev/null 2>&1; sleep 0.7; shot tip-hover; measure hover-SENTRY_PROJECT
  $A hover @$(ref_of 'button "Test"') >/dev/null 2>&1; sleep 0.5; echo "$P $SCHEME hover-away: $($A eval "String(!!document.querySelector('[role=alert]'))")"
fi
btn "Field for STRIPE_KEY"; sleep 1; r=$(ref_of 'button "op://V/TWILIO/TWILIO_AUTH_TOKEN"'); $A click @$r >/dev/null 2>&1; sleep 1
shot not-tested
echo "$P $SCHEME stale summary: $($A snapshot 2>&1 | grep -c 'Not tested since changes')  marks: $($A snapshot -i 2>&1 | grep -c ' failed. ')"
