#!/bin/bash
set -euo pipefail
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1
E=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d3-commander-digest-slice-1/evidence/validation-1
# 1. Expect the validated revision and a clean candidate worktree.
test "$(git -C "$WT" rev-parse HEAD)" = ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43
test -z "$(git -C "$WT" status --porcelain)"
echo "PASS: exact revision and clean worktree"
# 2. Expect locked dependency installation and a successful type check.
cd "$WT/spacedock-bridge"
npm ci
npm run typecheck
# 3. Expect all 403 tests to pass, including sequence zero and switch confirmation.
npm test
# 4. Expect seven deliberately weakened disposable copies to fail their named tests.
python3 "$E/mutations.py"
# 5. Expect captured desktop/phone states to match the unchanged candidate and cleaned hosts.
python3 "$E/verify-evidence.py"
