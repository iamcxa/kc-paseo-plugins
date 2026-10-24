#!/bin/bash
# usage: LABEL=main|cand PORT=n drive.sh   Writes $OUT/$TAG-*
export LABEL=${LABEL:-$1}; export PORT=${PORT:-$2}
. "$(dirname "$0")/env.sh"
OUT=${OUT:-$ROOT/out}; TAG=${TAG:-$LABEL}; mkdir -p $OUT
SID=$(cat $S/home/server-id)
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
r() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
ab close >/dev/null 2>&1; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4
if [ -n "$THEME" ]; then
  ab set viewport 1280 1000 >/dev/null; ab open "http://127.0.0.1:$PORT/settings/hosts/$SID/appearance" >/dev/null; sleep 3
  ab click $(r 'button "Appearance"') >/dev/null; sleep 2; ab click $(r 'Theme: ') >/dev/null; sleep 1; ab click $(r "menuitem \"$THEME\"") >/dev/null; sleep 1
fi
enter() { # width height
  ab set viewport $1 $2 >/dev/null; ab open "$URL" >/dev/null; sleep 3
  ab click $(r 'button "Edit"') >/dev/null; sleep 2
  ab click $(r 'Change the 1Password') >/dev/null; sleep 2
}
setstate() {
  case $1 in
    picked) ab click $(r 'Vault: Dev') >/dev/null; sleep 1; ab click $(r 'menuitem "Ops"') >/dev/null; sleep 2 ;;
    unchecked) ab fill $(r 'textbox "1Password service account"') sa-x >/dev/null; sleep 2 ;;
    failed) ab fill $(r 'textbox "1Password service account"') sa-x >/dev/null; ab click $(r 'button "Check"') >/dev/null; sleep 3 ;;
    token) ab fill $(r 'textbox "Service account token"') ops_typed-unsaved-not-real >/dev/null; sleep 2 ;;
  esac
}
GEOMS=${GEOMS:-"1280 1400;400 900"}
IFS=';' read -ra GL <<< "$GEOMS"
for geom in "${GL[@]}"; do
  set -- $geom; W=$1; H=$2
  for st in ${STATES:-picked unchecked token}; do
    enter $W $H; setstate $st
    echo "$TAG $W $st: $(ab eval "$(cat "$(dirname "$0")/measure.js")")" >> $OUT/$TAG-measure.txt
    echo "$TAG $W $st section: $(ab get text body | sed -n '/^1Password$/,/^Variables/p' | tr '\n' '|')" >> $OUT/$TAG-measure.txt
    if [ $W != 400 ]; then ab screenshot --full $OUT/$TAG-$W-$st.png >/dev/null; else ab screenshot $OUT/$TAG-$W-$st.png >/dev/null; fi
    if [ $W = 400 ]; then ab set viewport 400 2600 >/dev/null; sleep 1; ab screenshot --full $OUT/$TAG-400-page-$st.png >/dev/null; ab set viewport 400 900 >/dev/null; fi
    case $st in picked|unchecked|failed)
      ab click $(r 'button "Cancel"\|Keep the current connection') >/dev/null; sleep 2
      echo "$TAG $W $st after-Cancel: $(ab get text body | sed -n '/^1Password$/,/^Variables/p' | tr '\n' '|')" >> $OUT/$TAG-measure.txt ;;
    esac
  done
done
