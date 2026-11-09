#!/bin/bash
# Acceptance for PR #83 (a service account name with surrounding spaces). Runs in a fresh shell: bash acceptance.sh
# Needs: the PR worktree below at 7035292f, npm, agent-browser. Uses an isolated Paseo (own home under /tmp/pe-trim, port 7493,
# fake op and security); never the global paseo or a real secret.
set -u
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-service-account-trim
H=/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-service-account-trim/evidence/harness
OUT=$(mktemp -d /tmp/pe-trim-acc.XXXXXX)
export LABEL=acc SESSION=pe-trim-acc CHECKOUT=$WT
echo "step 1: candidate commit $(git -C "$WT" rev-parse --short HEAD) (expect 7035292)"
[ -x /tmp/pe-trim/install/node_modules/.bin/paseo ] || npm install --silent --prefix /tmp/pe-trim/install @getpaseo/cli@0.15.3
echo "step 2: unit test"; (cd "$WT/project-env" && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/secrets.test.ts 2>&1 | grep -E '^ℹ (pass|fail)|service account name')
echo "step 3: name typed as ' sa-a '"; bash "$H/setup.sh" >/dev/null 2>&1 && NAME=" sa-a " OUT=$OUT bash "$H/repro.sh" 2>&1 | grep -E '^(saved serviceAccount|connection line|Test|new agent)'
echo "step 4: name saved earlier as ' sa-a '"; SEED_NAME=" sa-a " SEED_VAULT=Dev SEED_KEYCHAIN='{"sa-a": "a"}' bash "$H/setup.sh" >/dev/null 2>&1 && OUT=$OUT bash "$H/saved.sh" 2>&1
echo "step 5: cleanup"; bash "$H/teardown.sh"; echo "pictures: $OUT"
