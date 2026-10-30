set -e
D=$(mktemp -d)
git -C /Users/kent/Project/kc-paseo-plugins archive 9d8760b85a71f72087a11821eb276ccf2d3d0ec2 | tar -x -C "$D"
cd "$D/project-env" && npm ci --silent >/dev/null 2>&1
echo "== 1. candidate: resumed-agent tests"
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test --test-name-pattern="a resumed agent" test/missing-variables.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)"
echo "== 2. same tests with the resume branch removed (expect 6 fail)"
sed -i.bak 's/if (request.reason === "create" || request.reason === "resume") {/if (request.reason === "create") {/' server/contribute.ts
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test --test-name-pattern="a resumed agent" test/missing-variables.test.ts 2>&1 | grep -E "^ℹ (tests|pass|fail)" || true
mv server/contribute.ts.bak server/contribute.ts
echo "== 3. whole suite and typecheck on the unmodified candidate"
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run typecheck >/dev/null 2>&1 && echo "typecheck clean"
echo "== 4. screenshots the Captain looks at"
echo "open these and look:"; ls /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-resume-blank-notice/evidence/val/shots/val-failed-full-1280.png /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-resume-blank-notice/evidence/val/shots/val-failed-full-400.png
