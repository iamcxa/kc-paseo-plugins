#!/bin/sh
# Prerequisites: Python 3, Git, the named candidate worktree, split-root task
# checkout, and the installed kc-dev-flow-2 0.28.0 package at the paths below.
# Three steps; read-only; expected duration under one minute. No UI changed.
set -eu
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-flywheel-grant-adr
TASK=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/flywheel-grant-adr.md
EVIDENCE=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/flywheel-grant-adr/evidence/validation-2
PACKAGE=/Users/kent/.codex/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0

# 1. Expected: exact 81096c6, clean tree, only ADR 0008 added since base;
# only Proposed -> Accepted since validated 987698f; identical Context;
# old-status and changed-effectiveness counterexamples rejected.
python3 "$EVIDENCE/acceptance.py" identity "$WT" "$TASK"

# 2. Expected: ten byte-exact quotes; changed full-width B rejected.
python3 "$EVIDENCE/acceptance.py" quotes "$WT" "$TASK"

# 3. Expected: 7 ADR files checked, 0 legacy; exit 0.
cd "$WT"
python3 "$PACKAGE/scripts/adr_lint.py" docs/adr --since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008
printf 'PASS adr_lint exit 0\n'

# Limits: wording semantics were independently reviewed in assessment.md;
# this script proves neither flywheel operation nor approval, adoption or merge.
