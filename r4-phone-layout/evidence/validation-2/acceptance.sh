#!/bin/bash
set -euo pipefail
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r4-phone-layout
E=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r4-phone-layout/evidence/validation-2
PKG=/Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0
WF=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc
CANDIDATE=3d1f176c0ca1fa8d266c5793c91a93c6c1a82c9e
BASE=8d9a68b92389aab55c96595245dc85e887251dd5
test "$(git -C "$WT" rev-parse HEAD)" = "$CANDIDATE"
test "$(git -C "$WT" branch --show-current)" = spacedock-ensign/r4-phone-layout
git -C "$WT" diff --quiet
git -C "$WT" diff --cached --quiet
case "${1:-all}" in
  1)
    cd "$WT/spacedock-bridge"
    npm ci
    npm run typecheck
    npm test
    ;;
  2|3)
    if test "$1" = 2; then harness=capture-web.py; port=7181; else harness=capture-native.py; port=7183; fi
    run_dir=$(mktemp -d "$E/rerun-step-$1.XXXXXX")
    python3 "$E/$harness" --worktree "$WT" --paseo /Users/kent/.local/bin/paseo --browser /Users/kent/.npm-global/bin/agent-browser --web-dist /Applications/Paseo.app/Contents/Resources/app-dist --port "$port" --output "$run_dir/result"
    python3 - "$run_dir/result" <<'CHECK'
from pathlib import Path
import json,os,sys
p=Path(sys.argv[1]); data=json.loads((p/'cleanup.json').read_text())
assert not Path(data['isolated_root']).exists()
try: os.kill(data['captured_daemon_pid'],0)
except ProcessLookupError: pass
else: raise AssertionError('Captured daemon still running')
print('PASS: captured daemon stopped, isolated home removed; screenshots at '+str(p))
CHECK
    ;;
  4)
    cd "$WT"
    python3 "$PKG/scripts/adr_lint.py" docs/adr --since "$BASE"
    python3 "$PKG/scripts/comment_ratio.py" "$BASE" "$CANDIDATE" --workflow-dir "$WF"
    python3 "$PKG/scripts/dispatch_records.py" "$WF/.spacedock-state/r4-phone-layout"
    ;;
  all)
    for step in 1 2 3 4; do bash "$E/acceptance.sh" "$step"; done
    ;;
  *) exit 2 ;;
esac
