#!/bin/bash
# Draws every evidence picture into ../evidence from the running spike (run.sh up first). Usage: capture.sh desktop|400
set -u
cd "$(dirname "$0")"; source lib.sh
D=../evidence; mkdir -p $D
W=${1:-desktop}
if [ "$W" = light ] || [ "$W" = light400 ]; then
  ab open "$URL" >/dev/null; ab wait 1500 >/dev/null
  ab eval "(()=>{const k='@paseo:app-settings';const s=JSON.parse(localStorage.getItem(k));s.theme='light';localStorage.setItem(k,JSON.stringify(s));return s.theme})()" >/dev/null
  if [ "$W" = light ]; then VW=1280; VH=1500; N=desktop-light; else VW=400; VH=860; N=400-light; fi
  open_editor 1 $VW $VH; shot $D/preview-$N-page.png; ab set viewport $VW $VH >/dev/null
  click 'button "Field for TWILIO_AUTH_TOKEN:'; ab wait 20000 >/dev/null; shot $D/preview-$N-picker-used-by.png; click 'button "Close"'; ab wait 600 >/dev/null
  click 'button "Field for STRIPE_KEY:'; ab wait 1000 >/dev/null; shot $D/preview-$N-picker-not-in-vault.png
  ab eval "(()=>{const k='@paseo:app-settings';const s=JSON.parse(localStorage.getItem(k));s.theme='dark';localStorage.setItem(k,JSON.stringify(s));return s.theme})()" >/dev/null
  exit 0
fi
if [ "$W" = desktop ]; then VW=1280; VH=1500; PRE=impl-desktop; else VW=400; VH=860; PRE=impl-400; fi
close() { ab click "@$(ab snapshot -i | grep 'button "Close"' | tail -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/')" >/dev/null; ab wait 2000 >/dev/null; }
pill() { ab eval "document.querySelector('[aria-label^=\"Field for $1:\"]')?.scrollIntoView({block:'center'})" >/dev/null; click "button \"Field for $1:"; ab wait "${2:-1200}" >/dev/null; }
scroll_list() { ab eval "(()=>{const l=[...document.querySelectorAll('div')].filter(e=>e.scrollHeight>e.clientHeight+20&&e.clientHeight>250&&e.clientHeight<=$VH).slice(-1)[0];l.scrollTop=$1;return l.scrollTop})()" >/dev/null; ab wait 500 >/dev/null; }

open_editor 1 $VW 2400; shot $D/$PRE-page.png
ab set viewport $VW $VH >/dev/null; ab wait 800 >/dev/null
pill SENTRY_AUTH_TOKEN 1000; shot $D/$PRE-picker-loading.png
ab wait 11000 >/dev/null; shot $D/$PRE-picker-suggested.png
scroll_list 99999; shot $D/$PRE-picker-bottom.png
close
pill TWILIO_AUTH_TOKEN; shot $D/$PRE-picker-used-by.png; close
pill STRIPE_KEY; shot $D/$PRE-picker-not-in-vault.png; close
pill POSTHOG_CLI_HOST; shot $D/$PRE-picker-empty-field.png
ab fill "@$(ref 'textbox "Search fields"')" "twilio" >/dev/null; ab wait 800 >/dev/null; shot $D/$PRE-picker-search.png
ab fill "@$(ref 'textbox "Search fields"')" "zzz" >/dev/null; ab wait 800 >/dev/null; shot $D/$PRE-picker-no-match.png; close
open_editor 2 $VW $VH; pill NEW_ONE 4000; shot $D/$PRE-picker-empty-vault.png
open_editor 3 $VW $VH; pill NEW_ONE 3000; shot $D/$PRE-picker-load-failed.png
click 'Type a reference'; ab wait 500 >/dev/null
ab fill "@$(ref 'textbox "Reference"')" "op://Dev/Notary scan" >/dev/null; ab wait 500 >/dev/null; shot $D/$PRE-picker-type-reference-bad.png
ab fill "@$(ref 'textbox "Reference"')" "op://Dev/Notary scan//scan" >/dev/null; ab wait 500 >/dev/null; shot $D/$PRE-picker-type-reference-empty-segment.png
ab fill "@$(ref 'textbox "Reference"')" "op://Dev/Notary scan/scan" >/dev/null; ab wait 500 >/dev/null; shot $D/$PRE-picker-type-reference.png
