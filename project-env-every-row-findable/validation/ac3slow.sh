#!/bin/bash
# A window crossing 720 px while a Test is running. $1 = width the Test starts at, $2 = height, $3 = width crossed to. Needs the slow daemon (setup-slow.sh).
. /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-every-row-findable/implementation/harness/lib.sh
W=${1:-1280}; H=${2:-1400}; X=${3:-700}
summary() { ab eval "(()=>{const m=document.body.innerText.match(/(All \d+ set|\d+ failed[^\n]*|Not tested since changes|Testing…|Test failed[^\n]*)/);return m?m[0].replace(/\n/g,' ').trim():'(none)'})()" | tr -d '"'; }
testbtn() { ab snapshot -i | grep -F 'button "Test"' | head -1 | grep -q disabled && echo disabled || echo enabled; }
fresh 2 $W $H
echo "[$W] before Test: $(summary), Test button $(testbtn)"
jsclick Test >/dev/null; sleep 2
echo "[$W] Test running: $(summary), Test button $(testbtn)"
view $X $H; sleep 2
echo "[$X] crossed while running: $(summary), Test button $(testbtn)"
jsclick Test >/dev/null; sleep 1
echo "[$X] second press ignored: $(summary)"
view $W $H; sleep 2
echo "[$W] back while running: $(summary), Test button $(testbtn)"
sleep 10
R=$(summary); echo "[$W] after the run ends: $R, Test button $(testbtn)"
view $X $H; sleep 3; R2=$(summary); echo "[$X] after the run, crossed again: $R2"
[ "$R" = "1 failed · 7 set · 4 no field" ] && [ "$R2" = "$R" ] && echo "RESULT: remount during a running Test kept Testing… and ended with the run" || echo "RESULT: FAIL"
