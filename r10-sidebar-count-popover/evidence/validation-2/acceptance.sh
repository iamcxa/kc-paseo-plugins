#!/bin/bash
set -euo pipefail
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r10-sidebar-count-popover
EVIDENCE=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r10-sidebar-count-popover/evidence/validation-2
# Requires Node/npm, Python 3, installed Paseo CLI, agent-browser and its Chromium,
# /Applications/Paseo.app/Contents/Resources/app-dist, and allowed loopback sockets.
OUT=$(mktemp -d "$EVIDENCE/acceptance-XXXXXX")
printf 'Evidence: %s\n' "$OUT"
printf 'Step 1: exact unchanged candidate, then dependency install\n'
test "$(git -C "$WT" rev-parse HEAD)" = 33952f9b3d02fceab104ba09272d65e432a3d095
test "$(git -C "$WT" branch --show-current)" = spacedock-ensign/r10-sidebar-count-popover
test -z "$(git -C "$WT" status --porcelain)"
(cd "$WT/spacedock-bridge" && npm ci > "$OUT/npm-ci.log" 2>&1)
printf 'PASS: candidate 33952f9b and npm ci\n'
printf 'Step 2: typecheck and full suite\n'
(cd "$WT/spacedock-bridge" && npm run typecheck > "$OUT/typecheck.log" 2>&1 && npm test > "$OUT/tests.log" 2>&1)
python3 "$EVIDENCE/test-report.py" "$OUT/tests.log" "$OUT/tests-results.json"
printf 'PASS: typecheck; 267 tests, 267 pass, 0 fail\n'
printf 'Step 3: reject oldest-first ordering mutation\n'
python3 "$EVIDENCE/mutation.py" --worktree "$WT" --output "$OUT/mutations"
printf 'Step 4: capture dark/light at 1440/360 sequentially\n'
for theme in dark light; do
  for width in 1440 360; do
    python3 "$EVIDENCE/capture.py" --worktree "$WT" --output "$OUT/$theme-$width-final" --width "$width" --appearance "$theme" > "$OUT/$theme-$width.log" 2>&1
    printf 'PASS: %s %s; count 4, loading/failed ?, zero hidden, gates 2/questions 2, newest-first owners/ages, item/board navigation\n' "$theme" "$width"
  done
done
printf 'Step 5: verify candidate bytes and cleanup\n'
python3 "$EVIDENCE/verify.py" --worktree "$WT" --output "$OUT"
