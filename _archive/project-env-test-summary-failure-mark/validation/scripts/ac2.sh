#!/bin/sh
# AC-2 on the isolated Paseo: summary text and the rows that carry a (!), read from the accessibility tree.
. /tmp/pe-val-dir/bin/lib.sh
fresh; $A set viewport 1280 1900 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
state() { echo "  $1: summary=[$($A snapshot 2>&1 | grep -o 'StaticText "[0-9A-Za-z ·…]*\(failed\|set\|changes\|Testing…\|no field\)[^"]*"' | head -1)] marks=$($A snapshot -i 2>&1 | grep ' failed. ' | grep -o 'button "[A-Z_]* ' | tr -d 'button"' | tr '\n' ' ')"; }
reopen; btn Test; sleep 10; state "after Test"
pick STRIPE_KEY "TWILIO TWILIO_AUTH_TOKEN"; state "edit STRIPE_KEY (only its mark clears)"
pick STRIPE_KEY "stripe secret-key"; state "edit STRIPE_KEY back to the tested field"
reopen; btn Test; sleep 0.8; pick SENTRY_PROJECT "POSTHOG POSTHOG_CLI_HOST"; sleep 9; state "SENTRY_PROJECT edited while Test runs, after it finished"
reopen; btn Test; sleep 10; state "fresh Test"
btn "Change the 1Password connection"; sleep 1.5
r=$(ref_of 'textbox "1Password service account"'); $A fill @$r "sa-b" >/dev/null 2>&1; sleep 3; state "service account sa-a -> sa-b (every mark clears)"
$A fill @$r "sa-a" >/dev/null 2>&1; sleep 3; state "service account back to sa-a"
