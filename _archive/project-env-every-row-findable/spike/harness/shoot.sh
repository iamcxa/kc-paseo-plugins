#!/bin/bash
# Draws the preview set. usage: on.sh spike-shots shoot.sh dark|light <dir>      (today's build: on.sh base-shots shoot-today.sh <dir>)
. "$(dirname "$0")/lib.sh"
T=$1; D=$2; mkdir -p "$D"
ab set media $T >/dev/null
note() { local r; r=$(lastref "with no field picked yet"); ab click "@$r" >/dev/null; sleep 1; }
summary() { ab eval "(()=>{const m=document.body.innerText.match(/(All \d+ set|\d+ failed[^\n]*|Not tested since changes)/);return m?m[0]:'(none)'})()"; }
for W in 1280 400; do
  if [ $W = 1280 ]; then WH=800; FH=1750; N=desktop; else WH=900; FH=2900; N=compact; fi
  P="$D/preview-$N-$T"
  if [ $T = dark ]; then
    # window shots: what the person sees at a real window size
    fresh 2 $W $WH; addbare NEW_VAR; ab screenshot "$P-1-new-row-above-bar.png" >/dev/null
    fresh 2 $W $WH; note; ab screenshot "$P-2-note-first-press.png" >/dev/null
    note; note; note; ab screenshot "$P-3-note-fourth-press.png" >/dev/null
    note; ab screenshot "$P-4-note-fifth-press-wraps.png" >/dev/null
    fresh 2 $W $WH; jsclick Change >/dev/null; sleep 1; fillbox "1Password service account" "sa-typo"; jsclick Check >/dev/null; sleep 3; note
    ab screenshot "$P-5-note-with-change-reason.png" >/dev/null
    # whole page: Test summary, long name, then the 720 px round trip
    fresh 2 $W $FH; jsclick Test >/dev/null; sleep 3; ab screenshot --full "$P-6-test-summary.png" >/dev/null; echo "[$W] summary: $(summary)"
    if [ $W = 1280 ]; then X=700; else X=1280; fi
    view $X $FH; sleep 3; ab screenshot --full "$P-7-test-summary-at-$X.png" >/dev/null; echo "[$X] summary: $(summary)"
    view $W $FH; sleep 3; ab screenshot --full "$P-8-test-summary-after-round-trip.png" >/dev/null; echo "[$W back] summary: $(summary)"
    fresh 2 $W $FH; r=$(ref "Why STRIPE_KEY is marked different"); ab click "@$r" >/dev/null; sleep 1; ab screenshot --full "$P-9-not-equal-explanation.png" >/dev/null
  else
    fresh 2 $W $WH; note; ab screenshot "$P-2-note-first-press.png" >/dev/null
  fi
done
