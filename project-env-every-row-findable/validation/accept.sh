#!/bin/bash
# Acceptance for candidate cd9f1c9 of iamcxa/kc-paseo-plugins#33, run on two throwaway Paseos (ports 6971 and 6972, plugin ids pe-accept and pe-accept-slow).
# Needs: Paseo CLI /Users/kent/.local/bin/paseo, agent-browser, node, python3, and the repo checkout below (its project-env/node_modules is linked for the unit tests).
set -u
REPO=/Users/kent/Project/kc-paseo-plugins
CAND=cd9f1c924d14b6a87a535fbc868c1104fb5a1b1a
V=$REPO/docs/dev2/.spacedock-state/project-env-every-row-findable/validation
H=$REPO/docs/dev2/.spacedock-state/project-env-every-row-findable/implementation/harness
T=$(mktemp -d /tmp/pe-accept.XXXXXX)
trap 'S=$T/s PORT=6971 PLUGIN_ID=pe-accept SESSION=pe-accept bash "$H/teardown.sh" >/dev/null 2>&1; S=$T/slow PORT=6972 PLUGIN_ID=pe-accept-slow SESSION=pe-accept-slow bash "$H/teardown.sh" >/dev/null 2>&1; rm -rf "$T"' EXIT

echo "== 1 build the exact candidate and run its new unit tests (expect: pass 10, fail 0)"
git -C $REPO archive $CAND project-env | tar -x -C $T
ln -s $REPO/.worktrees/spacedock-ensign-project-env-every-row-findable/project-env/node_modules $T/project-env/node_modules
(cd $T/project-env && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/every-row-findable.test.ts 2>&1 | grep -E '^ℹ (pass|fail)')

echo "== 2 start two isolated Paseos with the candidate plugin: normal, and one whose fake vault answers each field lookup after 8 s"
(export CHECKOUT=$T S=$T/s PORT=6971 PLUGIN_ID=pe-accept SESSION=pe-accept; bash $H/setup.sh >/dev/null 2>&1 && bash $H/clearstore.sh >/dev/null 2>&1 && echo "normal daemon up on $PORT")
(export CHECKOUT=$T S=$T/slow PORT=6972 PLUGIN_ID=pe-accept-slow SESSION=pe-accept-slow SETUP_COPY=$T/setup-slow.sh; bash $V/setup-slow.sh >/dev/null 2>&1 && bash $H/clearstore.sh >/dev/null 2>&1 && echo "slow daemon up on $PORT")
(export S=$T/slow PORT=6972 PLUGIN_ID=pe-accept-slow SESSION=pe-accept-slow; bash $V/ac3slow.sh 1280 1400 700 > $T/slow-1280.out 2>&1; bash $V/ac3slow.sh 400 900 1280 > $T/slow-400.out 2>&1) &
SLOW=$!

echo "== 3 AC-1 and AC-2 at 400x900, 1280x1400, 1280x800 (expect every line PASS; order LINEAR_API_KEY RESEND_API_KEY SLACK_BOT_TOKEN SLACK_SIGNING_SECRET LINEAR_API_KEY)"
export S=$T/s PORT=6971 PLUGIN_ID=pe-accept SESSION=pe-accept
for sz in "400 900" "1280 1400" "1280 800"; do set -- $sz; bash $H/ac12.sh $1 $2 2>&1 | grep -E '^\[.*(PASS|FAIL)'; done

echo "== 4 AC-3 Test summary across 720 px (expect 'RESULT: summary survived the round trip' twice), then the slow daemon: crossing 720 px while a Test runs (expect 'RESULT: remount during a running Test kept Testing… and ended with the run' twice)"
bash $H/ac3.sh 1280 1400 700 2>&1 | grep RESULT
bash $H/ac3.sh 400 900 1280 2>&1 | grep RESULT
wait $SLOW; grep -h -E 'Testing…|RESULT' $T/slow-1280.out $T/slow-400.out

echo "== 5 AC-3 long name and the not-equal explanation (expect copiedTextEqualsName=true everyLineStartsAfterUnderscore=true, and the sentence ending 'Check it is the field you mean.')"
bash $H/ac3wrap.sh 1280 1400 2>&1 | grep -E '^\['
bash $H/ac3wrap.sh 400 900 2>&1 | grep -E '^\['
echo "== done"
