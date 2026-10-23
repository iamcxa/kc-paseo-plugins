#!/bin/bash
# Pictures of today's build (main d540a04), for comparison. usage: on.sh base-shots shoot-today.sh <dir>
. "$(dirname "$0")/lib.sh"
D=$1; mkdir -p "$D"; ab set media dark >/dev/null
summary() { ab eval "(()=>{const m=document.body.innerText.match(/(All \d+ set|\d+ failed[^\n]*|Not tested since changes)/);return m?m[0]:'(none)'})()"; }
for W in 1280 400; do
  if [ $W = 1280 ]; then WH=800; FH=1750; N=desktop; else WH=900; FH=2900; N=compact; fi
  P="$D/today-$N"
  fresh 2 $W $WH; addbare NEW_VAR; ab screenshot "$P-1-new-row-under-bar.png" >/dev/null
  fresh 2 $W $FH; ab screenshot --full "$P-2-long-name-breaks-mid-word.png" >/dev/null
  jsclick Test >/dev/null; sleep 3; if [ $W = 1280 ]; then X=700; else X=1280; fi; view $X $FH; sleep 3; view $W $FH; sleep 3; ab screenshot --full "$P-3-test-summary-gone-after-round-trip.png" >/dev/null; echo "[$W] summary after round trip: $(summary)"
done
