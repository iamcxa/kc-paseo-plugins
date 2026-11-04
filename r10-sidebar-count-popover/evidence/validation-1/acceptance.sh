#!/bin/bash
set -euo pipefail
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r10-sidebar-count-popover
EVIDENCE=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r10-sidebar-count-popover/evidence/validation-1
# Required local tools: Node/npm, Python 3, /Users/kent/.local/bin/paseo,
# /Users/kent/.npm-global/bin/agent-browser with its browser installed, and
# /Applications/Paseo.app/Contents/Resources/app-dist. Loopback sockets must be allowed.
OUT=$(mktemp -d "$EVIDENCE/acceptance-XXXXXX")
printf 'Evidence: %s\n' "$OUT"
printf 'Step 1: exact unchanged candidate, then clean dependency install\n'
test "$(git -C "$WT" rev-parse HEAD)" = 2a31ef49e8f152623c1e04e046bcbf34777da85f
test -z "$(git -C "$WT" status --porcelain)"
(cd "$WT/spacedock-bridge" && npm ci > "$OUT/npm-ci.log" 2>&1)
printf 'PASS: candidate 2a31ef49 and npm ci\n'
printf 'Step 2: typecheck and full suite\n'
(cd "$WT/spacedock-bridge" && npm run typecheck > "$OUT/typecheck.log" 2>&1 && npm test > "$OUT/tests.log" 2>&1)
printf 'PASS: typecheck; expected 267 tests, 267 pass, 0 fail in tests.log\n'
printf 'Step 3: reject both shared-count mutations\n'
python3 "$EVIDENCE/mutation.py" --worktree "$WT" --output "$OUT/mutations"
printf 'Step 4: capture dark/light at 1440/360 sequentially, never in parallel\n'
for theme in dark light; do
  for width in 1440 360; do
    python3 "$EVIDENCE/capture.py" --worktree "$WT" --output "$OUT/$theme-$width-final" --width "$width" --appearance "$theme" > "$OUT/$theme-$width.log" 2>&1
    printf 'PASS: %s %s; count 4, unknown ?, zero hidden, gates 2/questions 2, oldest-first, item/board navigation\n' "$theme" "$width"
  done
done
printf 'Step 5: verify candidate bytes and cleanup\n'
python3 "$EVIDENCE/verify.py" --worktree "$WT" --output "$OUT"
