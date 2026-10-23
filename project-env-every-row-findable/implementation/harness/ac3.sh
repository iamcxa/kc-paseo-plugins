#!/bin/bash
# Test summary across a 720 px round trip. $1 = width the run is made at, $2 = height, $3 = width crossed to (default 700).
. "$(dirname "$0")/lib.sh"
W=${1:-1280}; H=${2:-1400}; X=${3:-700}
summary() { ab eval "(()=>{const m=document.body.innerText.match(/(All \d+ set|\d+ failed[^\n]*|Not tested since changes|Testing…)/);return m?m[0].replace(/\n/g,' ').trim():'(none)'})()"; }
fresh 2 $W $H
echo "[$W] before Test: $(summary)"
jsclick Test >/dev/null; sleep 3
A=$(summary); echo "[$W] after Test:  $A"
view $X $H; sleep 3
B=$(summary); echo "[$X] crossed:     $B"
view $W $H; sleep 3
C=$(summary); echo "[$W] back:        $C"
[ -n "$A" ] && [ "$A" != "\"(none)\"" ] && [ "$A" = "$C" ] && echo "RESULT: summary survived the round trip" || echo "RESULT: summary did NOT survive"
