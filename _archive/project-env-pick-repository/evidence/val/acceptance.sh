#!/bin/bash
# Acceptance script for pick-repository candidate 7d74145fc65b1b21251bf3cf07b41bbd400b98e2. Needs: git, node/npm, paseo 0.13, agent-browser. No secret, no real op or keychain (the plugin runs against fakes). Ports 8812-8815.
set -u
REPO=/Users/kent/Project/kc-paseo-plugins
CAND_SHA=7d74145fc65b1b21251bf3cf07b41bbd400b98e2
H=$REPO/docs/dev2/.spacedock-state/project-env-pick-repository/evidence/val/harness
export CAND=/tmp/pickrepo-accept/cand OUT=/tmp/pickrepo-accept/out
rm -rf /tmp/pickrepo-accept; mkdir -p $CAND $OUT

echo "== step 1: the candidate's own tests. Expect: typecheck exit 0; 312 pass, 0 fail"
git -C $REPO archive $CAND_SHA | tar -x -C $CAND
(cd $CAND/project-env && npm ci >/dev/null 2>&1 && npm run typecheck >/dev/null 2>&1; echo "typecheck exit $?"; npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)")

echo "== step 2: the four AC-1 states at 1280 and 400 px. Expect the counts in the comments (3, 3, 3 then 2, 2)"
for m in a b c d; do $H/ac1.sh $m >/dev/null 2>&1; done
grep -c 'Paseo has no project yet. In Paseo.s sidebar choose Add project, then Search for directory, type the folder.s path and choose Open this path' $OUT/ac1-a.txt   # expect 3
grep -c 'Every project in Paseo is already listed above' $OUT/ac1-b.txt                 # expect 3
grep -c 'Paseo did not return its project list' $OUT/ac1-c.txt; grep -c 'button "Try again"' $OUT/ac1-c.txt   # expect 3 and 2
grep -c 'Add a project: Choose' $OUT/ac1-d.txt                                          # expect 2 (the select, as on main)

echo "== step 3: AC-2 retry. Expect Try again -> Loading… -> failure sentence + Try again -> (cause lifted) select"
$H/ac2c.sh 2>&1 | grep -E '^==|Loading|did not return|Choose'

echo "== step 4: AC-2 return flow. Expect: no-project sentence, then (no reload, window.__nr=1) the select, whose menu lists shop-api"
$H/ac2a.sh 2>&1 | grep -E '^==|Paseo has no project|Add a project: Choose|menuitem "shop-api"'

echo "== step 5: look at the pictures in $OUT: ac1-{a,b,c,d}-{1280,400}.png. Expect a sentence or a select in the Projects card in every picture, never an empty card"
ls $OUT/*.png | wc -l   # expect 18

echo "== step 6: clean up"
$H/teardown.sh; rm -rf /tmp/pickrepo-accept
