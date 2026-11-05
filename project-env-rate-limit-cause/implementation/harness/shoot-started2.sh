#!/bin/bash
# usage: RUN PORT CHECKOUT OUT TAG [NO_START=1]. Paseo 0.15.2 folds the Started line inside the turn's tool group, so the group is opened before the photograph (the folded state is project-env-started-row-visible's).
. "$(dirname "$0")/env.sh"; . "$HERE/lib.sh"
OUT=${OUT:?}; TAG=${TAG:?}; mkdir -p "$OUT"; SESSION=pe-rl-started2-$RUN-$$
pa() { "$PASEO" --home "$S/home" "$@"; }
[ -n "${NO_START:-}" ] || pa run --provider mock/ten-second-stream --cwd "$S/limited" --no-wait --json "start" >/dev/null 2>&1 || true
[ -n "${NO_START:-}" ] || sleep 25
visible() { ab eval "document.body.innerText.includes('Started without')" | tr -d '"'; }
for w in 1280 400; do
  ab close >/dev/null 2>&1 || true
  ab open about:blank >/dev/null; ab set viewport $w 900 >/dev/null
  ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 3
  [ -n "$(ref 'Open menu')" ] && press 'Open menu' 900
  r=$(ab snapshot -i | grep -E '^\s*- button "limited" \[ref' | head -1 | sed -E 's/.*ref=(e[0-9]+)\].*/\1/')
  ab click "@$r" >/dev/null; sleep 6
  first=$(visible)
  if [ "$first" != true ]; then r=$(ab snapshot -i | grep -E 'button "Edited ' | head -1 | sed -E 's/.*ref=(e[0-9]+)\].*/\1/'); [ -n "$r" ] && ab click "@$r" >/dev/null; sleep 2; fi
  ab eval "(() => { const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())){ if(n.textContent.includes('Started without')){ n.parentElement.scrollIntoView({block:'center'}); return 'yes' } } return 'no' })()" >/dev/null
  ab mouse move 900 650 >/dev/null 2>&1; sleep 1
  ab screenshot "$OUT/$TAG-started-$w.png" >/dev/null
  echo "$TAG started $w visible-by-default=$first scrollWidth=$(ab eval 'document.documentElement.scrollWidth')" >> "$OUT/$TAG-text.txt"
  ab get text body | grep -E "Started without|SENTRY|STRIPE|POSTHOG|LINEAR|rate limit|recognise|not found" | sed "s/^/$TAG started $w: /" >> "$OUT/$TAG-text.txt"
done
ab close >/dev/null 2>&1
