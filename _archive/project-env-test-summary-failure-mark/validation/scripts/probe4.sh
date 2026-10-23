#!/bin/sh
. /tmp/pe-val-dir/bin/lib.sh
W=$1
fresh; $A set viewport $W 2100 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
reopen; btn Test; sleep 8
Y='(()=>{const a=document.querySelector("[aria-label^=\"Field for SENTRY_AUTH_TOKEN\"]").getBoundingClientRect();const b=document.querySelector("[aria-label^=\"Field for POSTHOG_CLI_API_KEY\"]").getBoundingClientRect();const c=document.querySelector("[aria-label=\"Remove POSTHOG_CLI_API_KEY\"]").getBoundingClientRect();return Math.round(a.top)+" "+Math.round(b.top)+" "+Math.round(c.top)})()'
echo "$W closed: $($A eval "$Y")"
r=$(ref_of 'button "SENTRY_PROJECT failed'); $A click @$r >/dev/null 2>&1; sleep 0.7
echo "$W SENTRY_PROJECT reason open (rows below: SENTRY_AUTH_TOKEN pill, POSTHOG pill, POSTHOG remove): $($A eval "$Y")"
