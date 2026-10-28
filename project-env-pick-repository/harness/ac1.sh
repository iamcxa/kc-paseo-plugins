#!/bin/bash
# AC-1 runs. Usage: ac1.sh <a|b|c|d>. Isolated Paseo per run (own home, port 871x, fake op/security), this branch's project-env.
set -e
HD=$(cd "$(dirname "$0")" && pwd); EV=$HD/../evidence; mkdir -p "$EV"
M=${1:?mode}
case $M in a) PORT=8712;; b) PORT=8713;; c) PORT=8714;; d) PORT=8715;; esac
WD=/tmp/pr-impl-$M
. "$HD/lib.sh"
case $M in
  a) export PROJECTS="";;
  b) export PROJECTS="shop-api web-app";;
  c) export PROJECTS="shop-api" FAIL=1;;
  d) export PROJECTS="shop-api";;
esac
"$HD/setup.sh" "$WD" $PORT >/dev/null
if [ $M = b ]; then
  python3 - "$WD" <<'P'
import json,sys
S=sys.argv[1]
json.dump({"version":1,"values":{"projects":[{"root":f"{S}/{d}","serviceAccount":"","vault":"","variables":[]} for d in ("shop-api","web-app")]}},open(f"{S}/home/plugin-settings/paseo-project-env/projects.json","w"))
P
fi
ab close >/dev/null 2>&1 || true
ab open about:blank >/dev/null; ab set viewport 1280 1400 >/dev/null
open_screen
case $M in a) WANT="Add project";; b) WANT="Add project";; c) WANT="did not return its project list";; d) WANT="Choose…";; esac
wait_text "$WANT" 45
URL=$(ab eval 'location.pathname' | tr -d '"')
echo "$URL" > "$WD/url"
OUT=$EV/ac1-$M.txt; : > "$OUT"
for w in 1280 400; do
  if [ $w = 400 ]; then ab set viewport 400 1700 >/dev/null; ab open "http://127.0.0.1:$PORT$URL" >/dev/null; ab wait 2500 >/dev/null; wait_text "$WANT" 45; fi
  ab screenshot "$EV/ac1-$M-$w.png" >/dev/null
  [ $M = c ] || ab screenshot --full "$EV/ac1-$M-$w-full.png" >/dev/null
  { echo "== run $M at $w px (page scrollWidth/scrollHeight: $(ab eval 'document.documentElement.scrollWidth+"/"+document.documentElement.scrollHeight'))";
    ab eval 'document.body.innerText' | sed -e 's/^"//' -e 's/"$//' -e 's/\\n/\n/g' | sed -n '/^Back to plugins/,$p' | head -20;
    echo "-- accessibility lines for the row:"; ab snapshot 2>&1 | grep -E 'Add a project|Add project|Search for directory|Open this path|did not return|Try again|Loading|Choose' ; } >> "$OUT"
done
echo "done $M"
