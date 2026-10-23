#!/bin/bash
# Acceptance for candidate fc4b095 of iamcxa/kc-paseo-plugins#33, run on its own throwaway Paseo (port 6971, plugin id pe-accept).
# Needs: Paseo CLI /Users/kent/.local/bin/paseo, agent-browser, node, python3, and the repo checkout below (its project-env/node_modules is linked for the unit tests).
set -u
REPO=/Users/kent/Project/kc-paseo-plugins
CAND=fc4b095610925af7ea32e1402fbaf74659317d81
H=$REPO/docs/dev2/.spacedock-state/project-env-every-row-findable/implementation/harness
T=$(mktemp -d /tmp/pe-accept.XXXXXX)
export CHECKOUT=$T S=$T/s PORT=6971 PLUGIN_ID=pe-accept SESSION=pe-accept
trap 'bash "$H/teardown.sh" >/dev/null 2>&1; rm -rf "$T"' EXIT

echo "== 1 build the exact candidate and run its new unit tests (expect: pass 7, fail 0)"
git -C $REPO archive $CAND project-env | tar -x -C $T
ln -s $REPO/.worktrees/spacedock-ensign-project-env-every-row-findable/project-env/node_modules $T/project-env/node_modules
(cd $T/project-env && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/every-row-findable.test.ts 2>&1 | grep -E '^ℹ (pass|fail)')

echo "== 2 start the isolated Paseo with the candidate plugin"
bash $H/setup.sh >/dev/null 2>&1 && bash $H/clearstore.sh >/dev/null 2>&1 && echo "daemon up on $PORT"

echo "== 3 AC-1 and AC-2 at 400x900, 1280x1400, 1280x800 (expect every line PASS; order LINEAR_API_KEY RESEND_API_KEY SLACK_BOT_TOKEN SLACK_SIGNING_SECRET LINEAR_API_KEY)"
for sz in "400 900" "1280 1400" "1280 800"; do set -- $sz; bash $H/ac12.sh $1 $2 2>&1 | grep -E '^\[.*(PASS|FAIL)'; done

echo "== 4 AC-3 Test summary across 720 px (expect 'RESULT: summary survived the round trip' twice)"
bash $H/ac3.sh 1280 1400 700 2>&1 | grep RESULT
bash $H/ac3.sh 400 900 1280 2>&1 | grep RESULT

echo "== 5 AC-3 long name and the not-equal explanation (expect copiedTextEqualsName=true everyLineStartsAfterUnderscore=true, and the sentence ending 'Check it is the field you mean.')"
bash $H/ac3wrap.sh 1280 1400 2>&1 | grep -E '^\['
bash $H/ac3wrap.sh 400 900 2>&1 | grep -E '^\['
echo "== done"
