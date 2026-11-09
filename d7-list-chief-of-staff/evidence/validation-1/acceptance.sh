#!/usr/bin/env bash
set -euo pipefail
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d7-list-chief-of-staff
EVIDENCE=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d7-list-chief-of-staff/evidence/validation-1

# Step 1: exact candidate and clean tracked/untracked product checkout.
test "$(git -C "$WT" rev-parse HEAD)" = 3fbbdfb9845ba04935e1d703c837e3d1ab26542b
test "$(git -C "$WT" branch --show-current)" = spacedock-ensign/d7-list-chief-of-staff
test -z "$(git -C "$WT" status --porcelain)"
echo 'Step 1 PASS: assigned candidate, branch, clean product checkout'

# Step 2: install exactly the committed lockfile; requires Node/npm and registry access.
cd "$WT/spacedock-bridge"
npm ci
echo 'Step 2 PASS: dependencies installed from lockfile'

# Step 3: check candidate types and the complete retained test suite.
npm run typecheck
npm test
echo 'Step 3 PASS: types and 500 candidate tests'

# Step 4: offline primary-evidence checks, including exact receipts and restart content.
python3 "$EVIDENCE/audit_evidence.py"
test -z "$(git -C "$WT" status --porcelain)"
echo 'Step 4 PASS: saved evidence audited, product checkout still clean'
