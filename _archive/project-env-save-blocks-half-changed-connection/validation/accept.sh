#!/bin/bash
# Minimal acceptance for "Save never overwrites a working connection with a half-changed one".
# Run from anywhere: bash <this file>. Needs: node, npm, python3, agent-browser and the paseo CLI on PATH.
# Builds an isolated Paseo (own home /tmp/pe-accept, port 6961, fake op/security/git); touches no real Keychain, 1Password or ~/.paseo.
REPO=/Users/kent/Project/kc-paseo-plugins
export CHECKOUT=$REPO/.worktrees/spacedock-ensign-project-env-save-blocks-half-changed-connection
HARNESS=$REPO/docs/dev2/.spacedock-state/project-env-save-blocks-half-changed-connection/spike/harness
export S=/tmp/pe-accept PORT=6961 PLUGIN_ID=pe-accept SESSION=pe-accept
FAILS=0
ok()   { echo "PASS  $1"; }
bad()  { echo "FAIL  $1"; FAILS=$((FAILS+1)); }
want() { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (got '$2', want '$3')"; fi; }

echo "[1/5] unit tests and typecheck"
( cd "$CHECKOUT/project-env" && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/save-rule.test.ts 2>&1 | grep -E "^ℹ (pass|fail)" )
( cd "$CHECKOUT/project-env" && npm run typecheck >/dev/null 2>&1 ) && ok "typecheck clean" || bad "typecheck"

echo "[2/5] build isolated Paseo on port $PORT from $CHECKOUT"
bash "$HARNESS/setup.sh" >/tmp/pe-accept-setup.log 2>&1 || { bad "setup (see /tmp/pe-accept-setup.log)"; exit 1; }
. "$HARNESS/lib.sh"
saveDisabled() { ab snapshot -i | grep -E 'button "Save"' | grep -c disabled; }
reason() { body | grep -c "Finish or cancel the connection change first"; }
hash() { shasum "$S/home/plugin-settings/$PLUGIN_ID/projects.json" | cut -c1-12; }
lists() { ab eval "(()=>{const t=document.body.innerText.split('Add a variable').pop();return (/SENTRY/.test(t)?'sentry':'')+(/ROTATED/.test(t)?'rotated':'')})()" | tr -d '"'; }
closepicker() { r=$(ab snapshot -i | grep 'button "Close"' | tail -1 | sed -E 's/.*ref=(e[0-9]+).*/\1/'); ab click @$r >/dev/null; sleep 1; }
ORDER0=$(projects_json)

echo "[3/5] AC-1 and AC-2 at 1280 px and at 400 px"
for W in 1280 400; do
  H=1750; [ $W = 400 ] && H=2400; OTHER=700; [ $W = 400 ] && OTHER=1000
  view $W $H; reopen; openproject 0
  pr=$(ref 'textbox "Appended'); ab fill @$pr "accept at $W" >/dev/null; sleep 1
  want "[$W] prompt edited, Change closed: Save enabled, no reason" "$(saveDisabled)/$(reason)" "0/0"
  H0=$(hash)
  jsclick Change >/dev/null; sleep 1; fillbox "1Password service account" "sa-typo"; jsclick Check >/dev/null; sleep 3
  want "[$W] Change open, unchecked name: Save disabled with reason" "$(saveDisabled)/$(reason)" "1/1"
  jsclick Save >/dev/null; sleep 1
  want "[$W] pressing Save during Change leaves projects.json unchanged" "$([ "$(hash)" = "$H0" ] && echo same || echo CHANGED)" "same"
  view $OTHER $H; sleep 2; view $W $H; sleep 2
  want "[$W] still disabled with reason after a window-size round trip" "$(saveDisabled)/$(reason)" "1/1"
  jsclick Cancel >/dev/null; sleep 1
  want "[$W] after Cancel: Save enabled, no reason" "$(saveDisabled)/$(reason)" "0/0"
  jsclick Save >/dev/null; sleep 3
  want "[$W] Save after Cancel writes projects.json" "$([ "$(hash)" != "$H0" ] && echo changed || echo SAME)" "changed"
  reopen; openproject 0; jsclick Change >/dev/null; sleep 1; jsclick Done >/dev/null; sleep 2
  pr=$(ref 'textbox "Appended'); ab fill @$pr "after done $W" >/dev/null; sleep 1
  want "[$W] after Done: Save enabled, no reason" "$(saveDisabled)/$(reason)" "0/0"
  jsclick Save >/dev/null; sleep 3
done
want "AC-2 order unchanged after saving the first project twice" "$(projects_json | sed -E "s/'(accept|after)[^']*'/''/g; s/'after[^']*'//g")" "$(echo "$ORDER0" | sed -E "s/'(accept|after)[^']*'/''/g")"
view 1280 1750; reopen; openproject 2
pr=$(ref 'textbox "Appended'); ab fill @$pr "middle" >/dev/null; sleep 1; jsclick Save >/dev/null; sleep 3
want "AC-2 saving the third of four projects keeps it third" "$(projects_json | python3 -c "import sys,ast;print([p[0] for p in ast.literal_eval(sys.stdin.read())])")" "['work', 'work-empty', 'work-many', 'work-bare']"

echo "[4/5] AC-3 token stored, next field press reads the vault again"
reopen; openproject 0
jsclick "+ Add" >/dev/null; sleep 3; want "first list is account a's" "$(lists)" "sentry"; closepicker
jsclick Change >/dev/null; sleep 1; fillbox "Service account token" "ops_fake_b"; sleep 1
jsclick "Save token" >/dev/null; sleep 3; jsclick Replace >/dev/null; sleep 4; jsclick Done >/dev/null; sleep 1
jsclick "+ Add" >/dev/null; sleep 4; want "after storing token b the list is account b's" "$(lists)" "rotated"; closepicker
jsclick Change >/dev/null; sleep 1; fillbox "Service account token" "ops_fake_zz"; sleep 1
jsclick "Save token" >/dev/null; sleep 3; jsclick Replace >/dev/null; sleep 4; jsclick Cancel >/dev/null; sleep 1
jsclick "+ Add" >/dev/null; sleep 3; want "a refused token leaves the list as it was" "$(lists)" "rotated"

echo "[5/5] teardown"
bash "$HARNESS/teardown.sh"
echo "failures: $FAILS"
exit $([ $FAILS = 0 ] && echo 0 || echo 1)
