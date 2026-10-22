#!/bin/sh
# usage: allset.sh <width> <height> <prefix> <dark|light>: fix the failed rows, Test again (set + no field), then give the last row a field (All N set)
. /tmp/pe-tsfm-impl/bin/lib.sh
W=$1; H=$2; P=$3; SCHEME=$4; O=/tmp/pe-tsfm-impl/shots
shot() { $A screenshot $O/$P-$SCHEME-$1.png >/dev/null 2>&1 || echo "SHOT FAIL $1"; }
sum() { $A snapshot 2>&1 | grep -o 'StaticText "[0-9A-Za-z ·…]*\(failed\|set\|changes\|no field\)[^"]*"' | head -1; }
fresh; $A set viewport $W $H >/dev/null 2>&1; $A set media $SCHEME >/dev/null 2>&1
reopen; btn Test; sleep 10
pick SENTRY_PROJECT "POSTHOG POSTHOG_CLI_HOST"; pick STRIPE_KEY "TWILIO TWILIO_AUTH_TOKEN"; pick POSTHOG_CLI_API_KEY "SENTRY SENTRY_AUTH_TOKEN"
btn Test; sleep 10; shot set-no-field; echo "$P $SCHEME fixed: $(sum)"
pick POSTHOG_CLI_HOST "TWILIO TWILIO_ACCOUNT_SID"; echo "$P $SCHEME field picked: $(sum)"
btn Test; sleep 10; shot all-set; echo "$P $SCHEME final: $(sum) marks=$($A snapshot -i 2>&1 | grep -c ' failed. ')"
