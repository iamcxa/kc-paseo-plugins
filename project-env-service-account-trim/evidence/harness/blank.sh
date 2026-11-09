#!/bin/bash
# usage: LABEL=<label> OUT=<dir> [W=1280] blank.sh — types a name of only spaces and prints the token row and whether Check and Save token are enabled.
. "$(dirname "$0")/env.sh"
W=${W:-1280}; OUT=${OUT:?}; SID=$(cat "$S/home/server-id")
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
ab close >/dev/null 2>&1; ab open "$URL" >/dev/null 2>&1; ab set viewport "$W" 900 >/dev/null; ab open "$URL" >/dev/null 2>&1; sleep 5
SKIP=$(rf 'button "Skip setup"'); [ -n "$SKIP" ] && { ab click "$SKIP" >/dev/null; sleep 2; }
ab click "$(rf 'button "Edit"')" >/dev/null; sleep 3
ab fill "$(rf 'textbox "1Password service account"')" "   " >/dev/null; ab fill "$(rf 'textbox "Service account token"')" "ops_fake_a" >/dev/null; sleep 1
ab eval 'document.body.innerText' | tr '\\' '\n' | sed 's/^n//' | grep -E "service account named|Not checked" | head -1
ab snapshot -i | grep -E 'button "(Check|Save token)"'
ab screenshot "$OUT/$LABEL-blank-$W.png" >/dev/null; ab close >/dev/null 2>&1
