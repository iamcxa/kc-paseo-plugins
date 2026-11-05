set -e
C=fec5b137b8d3955999aab0db084da49f4e2c3ea2
PREV=acf6a0e4685b8bd1f5eb941b2abd2a259f08d8c2
R=/Users/kent/Project/kc-paseo-plugins
E=$R/docs/dev2/.spacedock-state/project-env-resume-blank-notice/evidence/val3
D=$(mktemp -d)
git -C "$R" archive $C | tar -x -C "$D"
N=(--test-name-pattern="shows the same failure again when a refresh read it before the turn that showed the first line ended" --test-name-pattern="keeps a recovery that no turn end ever flushed" --test-name-pattern="shows a renewed failure after a partial recovery at a resume whose turn never ended")
echo "== 1. the change since the previous candidate is two files"
git -C "$R" diff --stat $PREV $C | tail -3
cd "$D/project-env" && npm ci --silent >/dev/null 2>&1
echo "== 2. the three new regression tests on the candidate (expect 3 pass)"
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test "${N[@]}" test/missing-variables.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"
echo "== 3. the same tests with the previous candidate's notice code (expect 3 fail)"
cp server/missing-variables-notice.ts /tmp/notice.fec.$$
git -C "$R" show $PREV:project-env/server/missing-variables-notice.ts > server/missing-variables-notice.ts
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test "${N[@]}" test/missing-variables.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)" || true
cp /tmp/notice.fec.$$ server/missing-variables-notice.ts; rm /tmp/notice.fec.$$
echo "== 4. 30000 random open/refresh/turn-end/release sequences against an independent oracle (expect 0 mismatches)"
sed "s#/tmp/val3-cand/#$D/#" "$E/probe-sequences.ts" > "$D/probe.ts"
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON "$D/probe.ts" | tail -1
echo "== 5. whole suite and typecheck (expect 325 pass, typecheck clean)"
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run typecheck >/dev/null 2>&1 && echo "typecheck clean"
echo "== 6. screenshots to open (client code unchanged since the first validation)"
ls "$E/../val/shots/val-failed-full-1280.png" "$E/../val/shots/val-failed-full-400.png"
