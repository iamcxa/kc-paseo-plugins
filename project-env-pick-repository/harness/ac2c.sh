#!/bin/bash
# AC-2 failed-retry sequence on run c's daemon (still up from ac1.sh c).
HD=$(cd "$(dirname "$0")" && pwd); EV=$HD/../evidence; PORT=8714
. "$HD/lib.sh"
row() { ab snapshot 2>&1 | grep -E 'Add a project|did not return|Try again|Loading|Choose' | sed -e 's/^ *//'; }
{
ab close >/dev/null 2>&1 || true; ab open about:blank >/dev/null; ab set viewport 1280 1400 >/dev/null
open_screen; wait_text "did not return its project list" 45
echo "== 1. opened, cause present (localStorage pe_ok=$(ab eval 'localStorage.getItem("pe_ok")')):"; row
press 'button "Try again"' 300
echo "== 2. Try again pressed while the cause remains, right after the press:"; row
ab screenshot "$EV/ac2-c-retry-loading-1280.png" >/dev/null
wait_text "did not return its project list" 45
echo "== 3. after the retry fails again:"; row
ab screenshot "$EV/ac2-c-retry-failed-again-1280.png" >/dev/null
ab eval 'localStorage.setItem("pe_ok","1")' >/dev/null
echo "== 4. cause lifted (localStorage pe_ok=1), Try again pressed:"
press 'button "Try again"' 300; row
wait_text "Choose…" 45
echo "== 5. after the retry succeeds:"; row
ab screenshot "$EV/ac2-c-after-retry-1280.png" >/dev/null
} > "$EV/ac2-c-retry.txt" 2>&1
cat "$EV/ac2-c-retry.txt"
