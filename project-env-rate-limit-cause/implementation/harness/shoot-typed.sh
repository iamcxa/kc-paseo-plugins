#!/bin/bash
# usage: RUN PORT CHECKOUT OUT TAG. Opens the picker in its error state, types a new name, photographs the offer.
. "$(dirname "$0")/env.sh"; . "$HERE/lib.sh"
OUT=${OUT:?}; TAG=${TAG:?}; SESSION=pe-rl-typed-$RUN-$$
ab close >/dev/null 2>&1 || true
ab open about:blank >/dev/null; ab set viewport 1280 900 >/dev/null
ab open "http://127.0.0.1:$PORT/settings" >/dev/null; ab wait 2500 >/dev/null
press 'button "Plugins"' 1500; press 'Actions for pe-rl' 700; press 'menuitem "Project environment"' 2500; press 'button "Edit"' 2500
press '"+ Add"' 5000
r=$(ref 'Search fields'); ab fill "@$r" "NEW_KEY" >/dev/null; ab wait 800 >/dev/null
ab screenshot "$OUT/$TAG-picker-typed-name-1280.png" >/dev/null
ab get text body | grep -E "rate limit|Add NEW_KEY" | sed "s/^/$TAG typed: /" >> "$OUT/$TAG-text.txt"
ab close >/dev/null 2>&1
