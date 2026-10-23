#!/bin/sh
# usage: capture.sh <width> <height> <prefix> <dark|light>   (shots into /tmp/pe-tsfm-impl/shots)
. /tmp/pe-tsfm-impl/bin/lib.sh
W=$1; H=$2; P=$3; SCHEME=$4; O=/tmp/pe-tsfm-impl/shots
shot() { $A screenshot $O/$P-$SCHEME-$1.png >/dev/null 2>&1 || { echo "SHOT FAIL $1"; $A screenshot $O/$P-$SCHEME-$1.png >/dev/null 2>&1 || echo "SHOT FAIL AGAIN $1"; }; }
measure() { echo "$P $SCHEME $1: $($A eval "$(cat /tmp/pe-tsfm-impl/bin/measure.js)" 2>&1)"; }
alerts() { $A eval "document.querySelectorAll('[role=alert]').length" | tr -d '"'; }
mark() { r=$(ref_of "button \"$1 failed"); [ -n "$r" ] && $A click @$r >/dev/null 2>&1; sleep 0.7; }
fresh; $A set viewport $W $H >/dev/null 2>&1; $A set media $SCHEME >/dev/null 2>&1; sleep 1
reopen
shot before-test
btn Test; sleep 0.6; shot testing; sleep 7
shot results
mark SENTRY_PROJECT; shot tip-open-first; measure first-SENTRY_PROJECT
mark STRIPE_KEY; echo "$P $SCHEME another (!) closes the first: alerts=$(alerts)"; measure middle-STRIPE_KEY
mark POSTHOG_CLI_API_KEY; shot tip-open; measure last-POSTHOG_CLI_API_KEY-unexpected
mark POSTHOG_CLI_API_KEY; echo "$P $SCHEME second press closes while the pointer stays on the (!): alerts=$(alerts)"
mark SENTRY_PROJECT; btn Test; sleep 7; echo "$P $SCHEME Test closes an open reason: alerts=$(alerts)"
if [ "$P" = desktop ]; then
  r=$(ref_of 'button "SENTRY_PROJECT failed'); $A hover @$r >/dev/null 2>&1; sleep 0.7; measure hover-SENTRY_PROJECT
  $A hover @$(ref_of 'button "Test"') >/dev/null 2>&1; sleep 0.5; echo "$P $SCHEME hover-away: alerts=$(alerts)"
fi
pick STRIPE_KEY "TWILIO TWILIO_AUTH_TOKEN"; sleep 0.5
shot not-tested
echo "$P $SCHEME after editing STRIPE_KEY: summary-not-tested=$($A snapshot 2>&1 | grep -c 'Not tested since changes')  marks: $($A snapshot -i 2>&1 | grep ' failed. ' | grep -o 'button "[A-Z_]* ' | tr -d 'button"' | tr '\n' ' ')"
if [ "$SCHEME" = dark ]; then
  r=$(ref_of 'button "About Variables"')
  if [ "$P" = desktop ]; then $A hover @$r >/dev/null 2>&1; sleep 0.5; $A mouse move 529 349 >/dev/null 2>&1; else $A click @$r >/dev/null 2>&1; fi
  sleep 2; shot info-open
fi
