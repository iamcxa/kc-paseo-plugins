set -e
C=df6180ce252d2ae007614dab15aadd7daed12b28
PREV=fec5b137b8d3955999aab0db084da49f4e2c3ea2
R=/Users/kent/Project/kc-paseo-plugins
D=$(mktemp -d)
git -C "$R" archive $C | tar -x -C "$D"
echo "== 1. the change since the previous candidate is one added line in one file"
git -C "$R" diff --stat $PREV $C | tail -2
echo "== 2. the sentence, under Limits worth knowing"
awk '/^## Limits worth knowing/{f=1} /^## When a variable is blank/{f=0} f' "$D/project-env/OVERVIEW.md" | grep -n "terminal"
echo "== 3. the plugin registers hooks for agents only (expect agent.create, agent.session_open, agent.created, agent.turn_ended, agent.closed)"
grep -ohE 'server\.(before|on)\("[a-z_.]+"' "$D/project-env/server/contribute.ts" | sed 's/.*("//; s/"//'
echo "== 4. whole suite and typecheck (expect 325 pass, typecheck clean)"
cd "$D/project-env" && npm ci --silent >/dev/null 2>&1
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)"
npm run typecheck >/dev/null 2>&1 && echo "typecheck clean"
echo "== 5. built Reference page: see evidence/val4/page-sentence.txt (built with docs/project-env/capture/build-site.sh, needs Docker)"
cat "$R/docs/dev2/.spacedock-state/project-env-resume-blank-notice/evidence/val4/page-sentence.txt"
