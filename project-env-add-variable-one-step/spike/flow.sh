# usage: flow.sh <prefix d|m> <width> <height>
. /tmp/pe-add-step/lib.sh
P=$1; W=$2; H=$3; O=/tmp/pe-add-step/out
full() { ab screenshot "$O/$P-$1.png" >/dev/null; }
view() { ab screenshot "$O/$P-$1.png" >/dev/null; }
add() { click 'button "\+ Add"'; sleep 2.5; }
pick() { click "button \"$1\""; sleep 0.8; }
size $W $H; opened; edit_nth 1; sleep 2
full 01-start
add; sleep 1; view 02-picker-open
pick "stripe STRIPE_WEBHOOK_SECRET"; full 03-picked-name-kept
add; pick "stripe Publishable key"; full 04-picked-name-converted
# commit the converted name by pressing Enter in the focused input
ab press Enter >/dev/null; sleep 0.6
add; pick "TWILIO PATH"; full 05-picked-name-reserved
add; pick "SENTRY SENTRY_AUTH_TOKEN"; full 06-picked-name-used
add; fill 'textbox "Search fields"' "my token"; view 07-typed-name
fill 'textbox "Search fields"' "stripe key"; view 08-typed-name-refused
fill 'textbox "Search fields"' "NEW_API_KEY"; click 'button "Add NEW_API_KEY and pick the field later"'; sleep 0.6; full 09-name-only-row
