#!/bin/bash
# usage: drive-extra.sh discard|mixedsave|cancelbar|reach. Extra validation scenarios on the same fixtures as drive.sh.
. "$(dirname "$0")/env.sh"
SC=$1; OUT=${OUT:-$S/out}; TAG=val-$SC; W=1280; H=1400
SID=$(cat $S/home/server-id)
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
LOG=$OUT/$TAG-log.txt
r() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
say() { echo "$TAG $*" | tee -a $LOG | cut -c1-${CUT:-300}; }
section() { ab get text body | sed -n '/^1Password$/,/^Variables/p' | tr '\n' '|'; }
pills() { ab snapshot -i | grep 'Field for' | sed 's/^ *- button //;s/ \[ref.*//' | tr '\n' ';'; }
enter() { ab set viewport $W $H >/dev/null; ab open "$URL" >/dev/null; sleep 3; ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n ${1}p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2; }
change() { ab click $(r 'Change the 1Password') >/dev/null; sleep 2; }
pick() { ab click $(r 'Vault: ') >/dev/null; sleep 1; ab click $(r "menuitem \"$1\"") >/dev/null; sleep 2; }
projects() { rtk proxy python3 -I -c "
import json;d=json.load(open('$S/home/plugin-settings/$PLUGIN_ID/projects.json'))
for p in d['values']['projects']:
  if p['root'].endswith('/$1'): print(p['vault'],[v['ref'] for v in p['variables']])"; }
bar() { ab get text body | grep -m3 -i 'unsaved\|No unsaved' | tr '\n' '|'; }
ab close >/dev/null 2>&1; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4
python3 -I "$(dirname "$0")/fx.py" $S $PLUGIN_ID
if [ -n "$THEME" ]; then
  TAG=$TAG-$(echo $THEME | tr 'A-Z' 'a-z'); LOG=$OUT/$TAG-log.txt
  ab set viewport 1280 1000 >/dev/null; ab open "http://127.0.0.1:$PORT/settings/hosts/$SID/appearance" >/dev/null; sleep 3
  ab click $(r 'button "Appearance"') >/dev/null; sleep 2; ab click $(r 'Theme: ') >/dev/null; sleep 1; ab click $(r "menuitem \"$THEME\"") >/dev/null; sleep 1
fi
case $SC in
discard) enter 2; say "disk-before: $(projects work-renamed)"; change; pick agent-dev; ab click $(r 'button "Done"') >/dev/null; sleep 2
  say "after-Done: $(section) bar=$(bar)"; ab screenshot --full $OUT/$TAG-1280-after-done.png >/dev/null
  ab click $(r 'button "Discard"') >/dev/null; sleep 1; ab click $(r 'button "Discard changes"') >/dev/null; sleep 2; say "after-Discard: $(section) bar=$(bar)"; say "pills: $(pills)"; ab screenshot --full $OUT/$TAG-1280-after-discard.png >/dev/null
  say "disk-after: $(projects work-renamed)"; enter 2; say "reopened: $(section) pills=$(pills)" ;;
mixedsave) enter 3; change; pick agent-dev; ab click $(r 'button "Done"') >/dev/null; sleep 2; say "after-Done bar=$(bar) pills=$(pills)"
  ab click $(r 'button "Save"') >/dev/null; sleep 2; say "saved: $(projects work-mixed)"; enter 3; say "reopened: $(section) pills=$(pills)"
  ab click $(r 'button "Test"') >/dev/null; sleep 4; say "test: $(ab get text body | grep -i -m4 'failed\|set\|Outside' | tr '\n' '|')"; ab screenshot --full $OUT/$TAG-1280-after-test.png >/dev/null ;;
cancelbar) enter 2; change; pick agent-dev; ab click $(r 'button "Keep the current connection"') >/dev/null; sleep 2; say "after-Cancel: $(section | cut -c1-60) bar=$(bar) pills=$(pills)"; say "disk: $(projects work-renamed)" ;;
reach) ab set viewport 400 900 >/dev/null; ab open "$URL" >/dev/null; sleep 3; ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n 5p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2; change; pick agent-subspace-relay-production
  ab eval "document.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight+50 && getComputedStyle(e).overflowY.match(/auto|scroll/)) e.scrollTop=e.scrollHeight});window.scrollTo(0,document.body.scrollHeight)" >/dev/null; sleep 1
  say "after scroll: $(ab eval "$(cat "$(dirname "$0")/measure.js")")"; ab click $(r 'button "Done"') >/dev/null 2>&1 && say "Done clicked: $(section)" || say "Done click failed"
  ab screenshot $OUT/$TAG-400-scrolled.png >/dev/null ;;
focusshot) for W in 1280 400; do H=900; enter 4
    ab eval "document.querySelector('[aria-label^=\"Field for STRIPE_KEY\"]').focus()" >/dev/null; sleep 1; ab screenshot $OUT/$TAG-$W-focus-outside.png >/dev/null
    ab eval "document.querySelector('[aria-label^=\"Field for LINEAR_API_KEY\"]').focus()" >/dev/null; sleep 1; ab screenshot $OUT/$TAG-$W-focus-empty.png >/dev/null; say "shots $W"; done ;;
lightpicked) for W in 1280 400; do H=900; [ $W = 1280 ] && H=1400; enter 2; change; pick agent-dev; say "picked $W: $(section | cut -c1-40)"
    ab screenshot --full $OUT/$TAG-$W-picked.png >/dev/null; done ;;
esac
