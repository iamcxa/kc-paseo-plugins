#!/bin/bash
# usage: LABEL=<label> OUT=<dir> list.sh — prints the project list hint exactly (spaces shown as ·) and pictures the list.
. "$(dirname "$0")/env.sh"
OUT=${OUT:?}; SID=$(cat "$S/home/server-id")
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
ab close >/dev/null 2>&1; ab open "$URL" >/dev/null 2>&1; ab set viewport 1280 900 >/dev/null; ab open "$URL" >/dev/null 2>&1; sleep 5
SKIP=$(rf 'button "Skip setup"'); [ -n "$SKIP" ] && { ab click "$SKIP" >/dev/null; sleep 2; }
ab eval 'document.body.innerText' | tr '\\' '\n' | sed 's/^n//' | grep -E 'variables? ·' | head -1 | sed 's/ /␠/g'
ab screenshot "$OUT/$LABEL-list-1280.png" >/dev/null; ab close >/dev/null 2>&1
