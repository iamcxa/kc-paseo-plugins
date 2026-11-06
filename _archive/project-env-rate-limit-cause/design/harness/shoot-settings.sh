#!/bin/bash
# usage: RUN=<label> PORT=<n> TAG=<cand|main> OUT=<dir> shoot-settings.sh   At 1280 and at 400 px, each a fresh pass: the Test result, an open failure bubble, then the field picker (a bottom sheet at 400 px that no key closes, so it goes last).
. "$(dirname "$0")/env.sh"; . "$HERE/lib.sh"
OUT=${OUT:?out dir}; TAG=${TAG:?tag}; mkdir -p "$OUT"; SESSION=pe-rl-shoot-$RUN-$$
for w in 1280 400; do
  ab close >/dev/null 2>&1 || true
  ab open about:blank >/dev/null; ab set viewport $w 900 >/dev/null
  ab open "http://127.0.0.1:$PORT/settings" >/dev/null; ab wait 2500 >/dev/null
  press 'button "Plugins"' 1500
  press 'Actions for pe-rl' 700
  press 'menuitem "Project environment"' 2500
  press 'button "Edit"' 2500
  press 'button "Test"' 3500
  ab screenshot "$OUT/$TAG-test-$w.png" >/dev/null
  r=$(ref 'STRIPE_SECRET_KEY failed'); [ -n "$r" ] && { ab click "@$r" >/dev/null; ab wait 800 >/dev/null; }
  ab screenshot "$OUT/$TAG-test-bubble-$w.png" >/dev/null
  echo "$TAG test $w scrollWidth=$(ab eval 'document.documentElement.scrollWidth')" >> "$OUT/$TAG-text.txt"
  ab get text body | grep -E "failed|1 set|rate limit|unexpected|recognise" | sed "s/^/$TAG test $w: /" >> "$OUT/$TAG-text.txt"
  press '"+ Add"' 5000
  ab screenshot "$OUT/$TAG-picker-$w.png" >/dev/null
  echo "$TAG picker $w scrollWidth=$(ab eval 'document.documentElement.scrollWidth')" >> "$OUT/$TAG-text.txt"
  ab get text body | grep -E "rate limit|could not read|Not listed|Close this list" | sed "s/^/$TAG picker $w: /" >> "$OUT/$TAG-text.txt"
done
ab close >/dev/null 2>&1
