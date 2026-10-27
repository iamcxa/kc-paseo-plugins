#!/bin/bash
# Revision 2: the project editor's way back to the project list, next to the host's "Back to plugins".
# usage: LABEL=main|cand PORT=n ROOT=/tmp/pe-bn2 SESSION=name [THEME=Light] drive2.sh
# Writes $OUT/$TAG-<width>[-page]-<state>.png and $OUT/$TAG-log.txt. States: work, list (editor first, then the link where the build has one), discard-modal (a change made, then the link; cand only).
. "$(dirname "$0")/env.sh"
OUT=${OUT:-$S/out}; TAG=${TAG:-$LABEL}
SID=$(cat $S/home/server-id)
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
LOG=$OUT/$TAG-log.txt
mkdir -p $OUT
r() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
say() { echo "$TAG $W $*" >> $LOG; echo "$TAG $W $*" | cut -c1-${CUT:-300}; }
shot() { if [ $W -ge 600 ] && [ "$2" = win ]; then ab screenshot $OUT/$TAG-$W-$1.png >/dev/null; elif [ $W -ge 600 ]; then ab screenshot --full $OUT/$TAG-$W-$1.png >/dev/null; else ab screenshot $OUT/$TAG-$W-$1.png >/dev/null; ab set viewport 400 2600 >/dev/null; sleep 1; ab screenshot --full $OUT/$TAG-$W-page-$1.png >/dev/null; ab set viewport 400 900 >/dev/null; sleep 1; fi; }
enter() { ab set viewport $W $H >/dev/null; ab open "$URL" >/dev/null; sleep 3; ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n ${1}p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2; }
ab close >/dev/null 2>&1; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4
if [ -n "$THEME" ]; then
  TAG=$TAG-$(echo $THEME | tr 'A-Z' 'a-z'); LOG=$OUT/$TAG-log.txt
  ab set viewport 1280 1000 >/dev/null; ab open "http://127.0.0.1:$PORT/settings/hosts/$SID/appearance" >/dev/null; sleep 3
  ab click $(r 'button "Appearance"') >/dev/null; sleep 2; ab click $(r 'Theme: ') >/dev/null; sleep 1; ab click $(r "menuitem \"$THEME\"") >/dev/null; sleep 1
fi
for geom in "1280 1400" "400 900"; do
  set -- $geom; W=$1; H=$2
  python3 "$HERE/fx.py" $S $PLUGIN_ID
  if [ -n "$FOCUS_ONLY" ]; then
    enter 1; ab press Tab >/dev/null 2>&1; ab eval "document.querySelector('[role=link]').focus()" >/dev/null; sleep 1
    say "focus: $(ab eval "document.activeElement.getAttribute('role')+' '+document.activeElement.textContent.slice(0,12)")"; shot focus win; continue
  fi
  enter 1; shot work
  L=$(r 'link "Projects')
  if [ -n "$L" ]; then
    say "work editor links: $(ab snapshot -i | grep -E 'link|Back to plugins' | tr '\n' '|')"
    ab click $L >/dev/null; sleep 2
    say "after the link: $(ab get text body | grep -c 'Edit') Edit rows; editor still open: $(ab get text body | grep -c 'Stop managing')"
  else
    say "work editor has no Projects link"
    ab open "$URL" >/dev/null; sleep 3
  fi
  shot list
  enter 6; shot long
  if [ -n "$L" ]; then
    enter 1
    ab click $(r 'button "Remove SENTRY_AUTH_TOKEN"') >/dev/null; sleep 1
    ab click $(r 'link "Projects') >/dev/null; sleep 4
    say "link with a change: $(ab get text body | grep -m1 'unsaved change?')"; shot discard-modal win
    enter 1; ab click $(r 'button "Close"') >/dev/null; sleep 2
    say "Close with no change: editor open $(ab get text body | grep -c 'Stop managing'); list rows $(ab get text body | grep -c 'variables ·')"
    enter 1; ab click $(r 'button "Remove SENTRY_AUTH_TOKEN"') >/dev/null; sleep 1; ab click $(r 'button "Discard"') >/dev/null; sleep 3
    say "footer Discard with a change: $(ab get text body | grep -m1 'unsaved change?')"
    ab click $(r 'button "Discard changes"') >/dev/null; sleep 2
    say "confirm Discard changes: editor open $(ab get text body | grep -c 'Stop managing'); list rows $(ab get text body | grep -c 'variables ·')"
  fi
done
