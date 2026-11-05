set -e
C=acf6a0e4685b8bd1f5eb941b2abd2a259f08d8c2
R=/Users/kent/Project/kc-paseo-plugins
D=$(mktemp -d)
git -C "$R" archive $C | tar -x -C "$D"
echo "== 1. the change since the rejected candidate is one file"
git -C "$R" diff --stat 9d8760b85a71f72087a11821eb276ccf2d3d0ec2 $C | tail -2
echo "== 2. the sentence on the introduction page"
grep -o 'A resumed agent that can no longer read a variable gets a "Resumed without N project variables" line when its next turn ends\.' "$D/docs/project-env/index.md"
cd "$D/project-env" && npm ci --silent >/dev/null 2>&1
echo "== 3. resumed-agent tests, then with the resume branch removed (expect 6 fail)"
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test --test-name-pattern="a resumed agent" test/missing-variables.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"
sed -i.bak 's/if (request.reason === "create" || request.reason === "resume") {/if (request.reason === "create") {/' server/contribute.ts
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test --test-name-pattern="a resumed agent" test/missing-variables.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)" || true
mv server/contribute.ts.bak server/contribute.ts
echo "== 4. whole suite and typecheck on the unmodified candidate"
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run typecheck >/dev/null 2>&1 && echo "typecheck clean"
echo "== 5. screenshots to open (unchanged client code since the first validation)"
ls /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-resume-blank-notice/evidence/val/shots/val-failed-full-1280.png /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-resume-blank-notice/evidence/val/shots/val-failed-full-400.png
