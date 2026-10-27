#!/bin/bash
# usage: LABEL=main|cand PORT=n [THEME=Light] drive.sh   Writes $OUT/$TAG-<width>[-page]-<state>.png and $OUT/$TAG-log.txt
. "$(dirname "$0")/env.sh"
OUT=${OUT:-$S/out}; TAG=${TAG:-$LABEL}
SID=$(cat $S/home/server-id)
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
LOG=$OUT/$TAG-log.txt
r() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
say() { echo "$TAG $W $*" >> $LOG; echo "$TAG $W $*" | cut -c1-${CUT:-300}; }
shot() { if [ $W -ge 600 ]; then ab screenshot --full $OUT/$TAG-$W-$1.png >/dev/null; else ab screenshot $OUT/$TAG-$W-$1.png >/dev/null; ab set viewport 400 2600 >/dev/null; sleep 1; ab screenshot --full $OUT/$TAG-$W-page-$1.png >/dev/null; ab set viewport 400 900 >/dev/null; sleep 1; fi; }
enter() { ab set viewport $W $H >/dev/null; ab open "$URL" >/dev/null; sleep 3; ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n ${1}p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2; }
body() { ab get text body | sed -n '/^work/,$p' | tr '\n' '|'; }
ab close >/dev/null 2>&1; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4
if [ -n "$THEME" ]; then
  TAG=$TAG-$(echo $THEME | tr 'A-Z' 'a-z'); LOG=$OUT/$TAG-log.txt
  ab set viewport 1280 1000 >/dev/null; ab open "http://127.0.0.1:$PORT/settings/hosts/$SID/appearance" >/dev/null; sleep 3
  ab click $(r 'button "Appearance"') >/dev/null; sleep 2; ab click $(r 'Theme: ') >/dev/null; sleep 1; ab click $(r "menuitem \"$THEME\"") >/dev/null; sleep 1
fi
for geom in "1280 1400" "400 900"; do
  set -- $geom; W=$1; H=$2
  python3 "$HERE/fx.py" $S $PLUGIN_ID
  enter 1; say "work: $(body)"; shot work
  ab click $(r 'button "Test"') >/dev/null; sleep 4; say "work after Test: $(ab get text body | grep -m1 'set')"
  enter 4; say "work-mixed: $(body)"; ab click $(r 'button "Test"') >/dev/null; sleep 4; shot mixed-after-test
  enter 2; say "work-legacy: $(body)"; shot legacy
  ab click $(r 'button "Stop managing"') >/dev/null; sleep 1; say "stop modal: $(ab get text body | grep -m1 'This deletes')"; shot stop-modal
done
