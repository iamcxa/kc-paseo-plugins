#!/usr/bin/env bash
set -euo pipefail

# Run unchanged in a fresh shell on this Mac. Explicit prerequisites:
# this candidate checkout and state evidence; Node/npm, Python 3;
# Paseo 0.12.0 at the path below, its app-dist; agent-browser 0.32.0
# with Chromium installed; local process/socket permission; ports 7081-7084 free.
# Expected duration: under five minutes with npm dependencies cached.
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-fleet-hides-closed-fos
EVIDENCE=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/fleet-hides-closed-fos/evidence
CANDIDATE=e91b9755a0c3444ebf4390f5396499ddf2070457
OUT=$(mktemp -d /tmp/closed-validation-acceptance.XXXXXX)
printf 'Evidence output: %s\n' "$OUT"

# Step 1. Expected: PASS exact candidate and clean worktree.
test "$(git -C "$WT" rev-parse HEAD)" = "$CANDIDATE"
test "$(git -C "$WT" branch --show-current)" = spacedock-ensign/fleet-hides-closed-fos
test -z "$(git -C "$WT" status --porcelain)"
printf 'PASS exact candidate and clean worktree\n'

# Step 2. Expected: install/typecheck exit 0; tests 78, pass 78, fail 0.
(cd "$WT/spacedock-bridge" && npm ci && npm run typecheck && npm test)

# Step 3. Expected: PASS Closed badge in By FO, decision rows and next card;
# typed input outline none; hover/focus borders distinct; Closed FO opens.
# PNGs in badge-composer show the actual text "Tab closed", including long names.
python3 "$EVIDENCE/cycle-3/capture.py" --worktree "$WT" \
  --paseo /Users/kent/.local/bin/paseo \
  --browser /Users/kent/.npm-global/bin/agent-browser \
  --web-dist /Applications/Paseo.app/Contents/Resources/app-dist \
  --port 7081 --output "$OUT/badge-composer" --long-name

# Step 4. Expected: PASS 380px review row retains a >=64px title, shrinks the
# long owner, contains badge/age, and clears the arrow; review opens.
python3 "$EVIDENCE/cycle-4/capture.py" --worktree "$WT" \
  --paseo /Users/kent/.local/bin/paseo \
  --browser /Users/kent/.npm-global/bin/agent-browser \
  --web-dist /Applications/Paseo.app/Contents/Resources/app-dist \
  --port 7083 --output "$OUT/narrow-row" --long-name

# Step 5. Expected: PASS isolated homes removed and candidate clean.
python3 - "$OUT" <<'PY'
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
for capture in ('badge-composer', 'narrow-row'):
    receipt = json.loads((root / capture / 'cleanup.json').read_text())
    assert receipt['home_removed'] and receipt['browser_closed'], receipt
    assert not Path(receipt['isolated_root']).exists(), receipt
    print(capture, json.dumps(receipt))
PY
test -z "$(git -C "$WT" status --porcelain)"
printf 'PASS isolated homes removed and candidate clean\n'
printf 'Screenshots and cleanup receipts: %s\n' "$OUT"
# The harness itself checks captured daemon PID exit before deleting its home.
# Deliberately retain the unique output directory for the FO to inspect.
# Does not prove native/phone layout, live tab closing, deployment, real decision
# relay/recording, or Captain acceptance. Synthetic agents/gates/reviews only.
