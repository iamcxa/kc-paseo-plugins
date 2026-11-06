#!/bin/bash
set -euo pipefail
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1
EVIDENCE=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d3-commander-digest-slice-1/evidence/validation-2

# Step 1: Confirm the exact candidate and a clean candidate tree.
test "$(git -C "$WT" rev-parse HEAD)" = 7a4dbc057803d791dc5626182636c8e0fc2c2d32
test -z "$(git -C "$WT" status --porcelain)"
printf 'Step 1 passed: exact candidate and clean tree\n'

# Step 2: Typecheck the candidate package.
cd "$WT/spacedock-bridge"
npm run typecheck
printf 'Step 2 passed: typecheck\n'

# Step 3: Run the candidate regressions; expect 431 passing tests.
npm test
printf 'Step 3 passed: regressions\n'

# Step 4: Verify the bound primary evidence, mutations and cleanup.
python3 "$EVIDENCE/verify-evidence.py"
printf 'Step 4 passed: bound evidence and cleanup\n'
