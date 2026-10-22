#!/bin/sh
# usage: edit3.sh WIDTH  -> fresh fixture, editor open at WIDTHx2700 with 3 unsaved changes
S=/tmp/save-footer-spike; ab=$S/ab.sh
python3 $S/fx.py; $S/open.sh $1 2700
r=$($ab snapshot -i | grep 'button "Remove SENTRY_PROJECT"' | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'); $ab click @$r >/dev/null; $ab wait 300 >/dev/null
r=$($ab snapshot -i | grep 'button "Remove STRIPE_KEY"' | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'); $ab click @$r >/dev/null; $ab wait 300 >/dev/null
r=$($ab snapshot -i | grep 'textbox "Appended' | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'); $ab fill @$r "Use the demo-dev vault for every key." >/dev/null; $ab wait 400 >/dev/null
