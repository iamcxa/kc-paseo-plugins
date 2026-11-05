#!/bin/bash
# usage: RUN=<label> PORT=<n> TAG=<cand|main> OUT=<dir> shoot-started.sh   Starts one agent (mock provider) in the limited project, then photographs its conversation page at 1280 and 400 px.
. "$(dirname "$0")/env.sh"; . "$HERE/lib.sh"
OUT=${OUT:?out dir}; TAG=${TAG:?tag}; mkdir -p "$OUT"; SESSION=pe-rl-started-$RUN-$$
pa() { "$PASEO" --home "$S/home" "$@"; }
[ -n "${NO_START:-}" ] || pa run --provider mock/ten-second-stream --cwd "$S/limited" --no-wait --json "start" >/dev/null 2>&1 || true
[ -n "${NO_START:-}" ] || sleep 25
SID=$(cat "$S/home/server-id")
for w in 1280 400; do
  ab close >/dev/null 2>&1 || true
  ab open about:blank >/dev/null; ab set viewport $w 900 >/dev/null
  ab open "http://127.0.0.1:$PORT/settings" >/dev/null; sleep 3
  found=no
  for n in 1 2 3; do
    ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 3
    [ -n "$(ref 'Open menu')" ] && press 'Open menu' 900
    r=$(ab snapshot -i | grep -E 'button "limited(,[^"]*)?" \[ref' | sed -n ${n}p | sed -E 's/.*ref=(e[0-9]+)\].*/\1/'); [ -z "$r" ] && break
    ab click "@$r" >/dev/null; sleep 6
    if [ "$(ab eval "(() => { const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())){ if(n.textContent.includes('Started without')){ n.parentElement.scrollIntoView({block:'center'}); return 'yes' } } return 'no' })()" | tr -d '"')" = yes ]; then found=yes; break; fi
  done
  ab mouse move 900 650 >/dev/null 2>&1; sleep 1
  ab screenshot "$OUT/$TAG-started-$w.png" >/dev/null
  echo "$TAG started $w row-found=$found scrollWidth=$(ab eval 'document.documentElement.scrollWidth')" >> "$OUT/$TAG-text.txt"
  ab get text body | grep -E "Started without|SENTRY|STRIPE|POSTHOG|rate limit|recognise" | sed "s/^/$TAG started $w: /" >> "$OUT/$TAG-text.txt"
done
ab close >/dev/null 2>&1
