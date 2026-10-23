#!/bin/sh
. /tmp/pe-tsfm/bin/lib.sh
W=$1; H=$2; P=$3; O=/tmp/pe-tsfm/shots
$A set viewport $W $H >/dev/null 2>&1; $A set media ${4:-dark} >/dev/null 2>&1; sleep 1
reopen; btn "Browse vault"; sleep 2.5
pick() { btn "Field for $1"; sleep 1; r=$(ref_of "button \"$2\""); $A click @$r >/dev/null 2>&1; sleep 0.8; }
btn Test; sleep 6.5
pick SENTRY_PROJECT "op://V/POSTHOG/POSTHOG_CLI_HOST"
pick STRIPE_KEY "op://V/TWILIO/TWILIO_ACCOUNT_SID"
btn Test; sleep 6.5; $A screenshot $O/$P-${4:-dark}-set-no-field.png >/dev/null 2>&1
echo "$P after fixes: $($A snapshot 2>&1 | grep -o '5 set · 1 no field\|All [0-9] set\|[0-9] failed[^"]*' | head -2)"
btn "Remove POSTHOG_CLI_HOST"
echo "$P after remove: $($A snapshot 2>&1 | grep -o 'Not tested since changes' | head -1)"
btn Test; sleep 6.5; $A screenshot $O/$P-${4:-dark}-all-set.png >/dev/null 2>&1
echo "$P final: $($A snapshot 2>&1 | grep -o 'All [0-9] set' | head -1)  marks: $($A snapshot -i 2>&1 | grep -c ' failed. ')"
