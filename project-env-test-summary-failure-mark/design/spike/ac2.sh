#!/bin/sh
. /tmp/pe-tsfm/bin/lib.sh
$A set viewport 1280 1900 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
state() { echo "  $1: summary=[$($A snapshot 2>&1 | grep -o 'StaticText "[0-9A-Za-z ·…]*\(failed\|set\|changes\|Testing…\|no field\)[^"]*"' | head -1)] marks=$($A snapshot -i 2>&1 | grep ' failed. ' | grep -o 'button "[A-Z_]* ' | tr -d 'button"' | tr '\n' ' ')"; }
pick() { btn "Field for $1"; sleep 1; r=$(ref_of "button \"$2\""); $A click @$r >/dev/null 2>&1; sleep 0.8; }
reopen; btn "Browse vault"; sleep 2.5; btn Test; sleep 6.5; state "after Test"
pick STRIPE_KEY "op://V/TWILIO/TWILIO_AUTH_TOKEN"; state "edit STRIPE_KEY (AC-2: only its mark clears)"
pick STRIPE_KEY "op://V/stripe/secret-key"; state "edit STRIPE_KEY back to the tested field"
r=$(ref_of 'textbox "1Password service account"'); $A fill @$r "sa-b" >/dev/null 2>&1; sleep 1.5; state "account sa-a -> sa-b"
$A fill @$r "sa-a" >/dev/null 2>&1; sleep 1.5; state "account back to sa-a"
reopen; btn "Browse vault"; sleep 2.5; btn Test; sleep 1; pick SENTRY_PROJECT "op://V/POSTHOG/POSTHOG_CLI_HOST"; sleep 6; state "SENTRY_PROJECT edited while Test runs, after it finished"
