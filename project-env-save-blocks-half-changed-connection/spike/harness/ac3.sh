#!/bin/bash
# AC-3 runtime: after a token is stored under an account name, the next field press reads the vault again.
. "$(dirname "$0")/lib.sh"
W=${1:-1280}; H=${2:-1750}
pick() { jsclick "+ Add" >/dev/null; sleep 3; ab eval "(()=>{const t=document.body.innerText;return {old:/SENTRY/.test(t.split('Add a variable').pop()),rotated:/ROTATED/.test(t.split('Add a variable').pop())}})()"; }
view $W $H; reopen; openproject 0
echo "first list (token a):  $(pick)"
[ -n "$SHOT" ] && shot "$SHOT-before.png"
r=$(ab snapshot -i | grep 'button "Close"' | tail -1 | sed -E 's/.*ref=(e[0-9]+).*/\1/'); ab click @$r >/dev/null; sleep 1
jsclick Change >/dev/null; sleep 1
fillbox "Service account token" "ops_fake_b"; sleep 1
jsclick "Save token" >/dev/null; sleep 2
jsclick Replace >/dev/null; sleep 4
body | grep -E "Saved token works|Token works|token" | head -4
echo "list after storing token b: $(pick)"
[ -n "$SHOT" ] && shot "$SHOT-after.png"
