#!/bin/sh
# Run in a fresh shell. Needs git, node and npm. Touches nothing in the repository: it works on a git archive in a temp directory.
set -e
REPO=/Users/kent/Project/kc-paseo-plugins
C=ad347406fba976ba59417461ed4d0786145d0c52
D=$(mktemp -d)
echo "== 1. diff against base is one test file, 3 added and 2 removed lines"
git -C "$REPO" diff --stat d973876 "$C"
git -C "$REPO" archive "$C" | tar -x -C "$D"
cd "$D/project-env"
echo "== 2. clean install"
npm ci >/dev/null 2>&1 && echo "npm ci ok"
echo "== 3. full suite: expect 'tests 306', 'pass 306', 'fail 0'"
npm test 2>&1 | grep -E '^ℹ (tests|pass|fail) '
echo "== 4. typecheck: expect exit 0"
npm run typecheck >/dev/null 2>&1 && echo "typecheck exit 0"
echo "== 5. delete one cause heading: expect 'pass 305', 'fail 1', failing test 'explain reserved-name ...'"
grep -v '^### Reserved name$' OVERVIEW.md > OVERVIEW.tmp && mv OVERVIEW.tmp OVERVIEW.md
npm test 2>&1 | grep -E '^ℹ (tests|pass|fail) |^ +✖ explain' | sed 's/ ([0-9.]*ms)//' | sort -u || true
echo "== done (work copy: $D, safe to delete)"
