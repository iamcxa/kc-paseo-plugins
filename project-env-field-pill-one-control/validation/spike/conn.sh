#!/bin/bash
# usage: conn.sh line|fixtoken|swaptoken   (after setup, index.server.conn.ts copied in, and restart with MODE=base|badtoken|swap)
# line:      the connection line (one row with Change; Change opens the controls; Cancel restores; Done returns).
# fixtoken:  saved token rejected -> pill shows the picker error -> close -> Change -> save a working token -> Done -> pill again.
# swaptoken: token works and the list loads -> close -> Change -> save a token for other data -> Done -> pill again.
# Fake op/security only; the tokens are the fake strings ops_fake_a / ops_fake_b. SHOTS defaults to ../shots-conn.
H=$(cd "$(dirname "$0")" && pwd); AB=$H/ab.sh; S=/tmp/fp-val-spike
SHOTS=${SHOTS:-$H/../shots-conn}; mkdir -p "$SHOTS"
CASE=$1; FAILS=0; W=${W:-1280}; HT=${HT:-1700}
check() { if [ "$2" = "$3" ]; then echo "PASS $1"; else echo "FAIL $1: expected [$2] got [$3]"; FAILS=$((FAILS+1)); fi; }
ref() { $AB snapshot -i | grep -E "$1" | head -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
press() { for try in 1 2 3 4 5 6 7 8 9 10; do r=$(ref "$1"); [ -z "$r" ] && { sleep 0.8; continue; }; $AB scrollintoview "@$r" >/dev/null 2>&1; $AB wait 300 >/dev/null; out=$($AB click "@$r" 2>&1); echo "$out" | grep -q "✗" || return 0; sleep 0.8; done; echo "COULD NOT PRESS $1"; }
pressend() { for try in 1 2 3 4 5 6 7 8 9 10; do r=$($AB snapshot -i | grep -E "$1" | tail -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'); [ -z "$r" ] && { sleep 0.8; continue; }; out=$($AB click "@$r" 2>&1); echo "$out" | grep -q "✗" || return 0; sleep 0.8; done; echo "COULD NOT PRESS $1"; }
has() { $AB get text body | grep -c -F -- "$1"; }
reads() { cat $S/project-env-world-*/calls.jsonl 2>/dev/null | grep -c '"item","list"'; }
shot() { $AB set viewport $W $HT >/dev/null; $AB wait 400 >/dev/null; $AB screenshot "$SHOTS/$W-$CASE-$1.png" >/dev/null; echo "shot $W-$1"; }
waitfor() { for i in $(seq 1 $2); do $AB get text body | grep -q -F -- "$1" && return 0; sleep 1; done; return 1; }
fill_token() { $AB fill "@$(ref 'textbox "Service account token"')" "$1" >/dev/null; }
keychain() { python3 -c "import json,glob;print('keychain after save (fake):', [json.load(open(f))['keychain'] for f in sorted(glob.glob('$S/project-env-world-*/state.json'))][-1:])" 2>/dev/null || echo "keychain after save (fake): untouched"; }
"$H/open-editor.sh" $W $HT; $AB wait 2500 >/dev/null
case "$1" in
line)
  check "$W one row: Connected, account and vault" 1 "$($AB get text body | grep -c 'Connected')"
  check "$W one row: Change button" 1 "$($AB snapshot -i | grep -c 'Change the 1Password connection')"
  check "$W one row: no token box" 0 "$($AB snapshot -i | grep -c 'textbox.*ops_')"
  check "$W one row: no Check button" 0 "$($AB snapshot -i | grep -c 'button \"Check\"')"
  shot c01-connection-line
  press 'Change the 1Password connection'; $AB wait 800 >/dev/null
  check "$W Change: controls back (Done and Cancel)" 2 "$($AB snapshot -i | grep -cE 'button "(Done|Cancel)"')"
  shot c02-change-open
  $AB fill "@$(ref 'textbox.*service account')" "other-account" >/dev/null 2>&1; $AB wait 500 >/dev/null
  press 'button "Cancel"'; $AB wait 900 >/dev/null
  check "$W Cancel: back to one row" 1 "$($AB snapshot -i | grep -c 'Change the 1Password connection')"
  check "$W Cancel: account restored" 1 "$($AB get text body | grep -c 'demo-read')"
  check "$W Cancel: nothing unsaved" 1 "$($AB get text body | grep -c 'No unsaved changes')"
  shot c03-after-cancel
  press 'Change the 1Password connection'; $AB wait 800 >/dev/null
  press 'button "Done"'; $AB wait 900 >/dev/null
  check "$W Done: back to one row" 1 "$($AB snapshot -i | grep -c 'Change the 1Password connection')"
  ;;
fixtoken|swaptoken)
  P="Field for SENTRY_PROJECT"
  press "$P"; waitfor "Close this list" 3 >/dev/null; $AB wait 6000 >/dev/null
  T1=$($AB get text body)
  echo "FIRST OPEN: Close-this-list(error)=$(echo "$T1" | grep -c 'Close this list')  list(SENTRY_ORG)=$(echo "$T1" | grep -c 'SENTRY_ORG')  Loading=$(echo "$T1" | grep -c 'Loading the vault')  reads=$(reads)"
  echo "$T1" | grep -iE "token|rejected|invalid|authentic" | head -3
  shot c10-first-open
  pressend 'button "Close"'; $AB wait 700 >/dev/null
  press 'Change the 1Password connection'; $AB wait 800 >/dev/null
  if [ "$1" = fixtoken ]; then TOK=ops_fake_a; else TOK=ops_fake_b; fi
  fill_token $TOK; $AB wait 500 >/dev/null
  press 'button "Save token"'
  waitfor "Token works" 30 && echo "token row: Token works" || { echo "token row never said Token works"; $AB get text body | grep -iE "token|saved|not saved" | head -5; }
  keychain
  shot c11-token-saved
  press 'button "Done"'; $AB wait 1200 >/dev/null
  check "$W Done pressed: back to the one-row line" 1 "$($AB snapshot -i | grep -c 'Change the 1Password connection')"
  press "$P"; $AB wait 1500 >/dev/null; for i in $(seq 1 25); do T2=$($AB get text body); echo "$T2" | grep -q 'Loading the vault' || break; sleep 1; done; $AB wait 1500 >/dev/null; T2=$($AB get text body)
  echo "SECOND OPEN: Close-this-list(error)=$(echo "$T2" | grep -c 'Close this list')  list(SENTRY_ORG)=$(echo "$T2" | grep -c 'SENTRY_ORG')  list(NEW_FIELD_ONE)=$(echo "$T2" | grep -c 'NEW_FIELD_ONE')  Loading=$(echo "$T2" | grep -c 'Loading the vault')  reads=$(reads)"
  echo "$T2" | grep -iE "token|rejected|invalid|authentic" | head -3
  shot c12-second-open
  if [ "$1" = swaptoken ]; then
    "$H/open-editor.sh" $W $HT; $AB wait 2500 >/dev/null; press "$P"; $AB wait 1500 >/dev/null; for i in $(seq 1 25); do T3=$($AB get text body); echo "$T3" | grep -q 'Loading the vault' || break; sleep 1; done; T3=$($AB get text body)
    echo "AFTER RELOAD (new page, same saved token): list(SENTRY_ORG)=$(echo "$T3" | grep -c 'SENTRY_ORG')  list(NEW_FIELD_ONE)=$(echo "$T3" | grep -c 'NEW_FIELD_ONE')  reads=$(reads)"
    shot c13-after-reload
  fi
  ;;
esac
[ "$FAILS" = 0 ] && echo "ALL PASS" || echo "$FAILS FAILED"
