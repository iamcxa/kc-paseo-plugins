# Acceptance script — PR #37 at dd7c9e043a24085f15086ba0f3508a7fd9977938

Run these three steps, in order, in one fresh shell on this Mac (about two minutes). Requires the named candidate checkout, Python 3, Node/npm, Paseo 0.12.0, agent-browser 0.32.0 with Chromium installed, and free ports 7051/7052. This is the explicitly declared local test setup, not a portable install test. Socket restrictions need to permit the isolated daemon and browser. No secret or sign-in is needed.

## 1. Verify the candidate and run package checks

```sh
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r1-hover-and-row-owner
E=/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r1-hover-and-row-owner/evidence/validation-1
PROOF="$E/fo-rerun-$(uuidgen)"
test "$(git -C "$WT" rev-parse HEAD)" = dd7c9e043a24085f15086ba0f3508a7fd9977938 && cd "$WT/spacedock-bridge" && npm ci && npm run typecheck && npm test
```

Expected: exit 0, typecheck has no errors, 72 tests pass and 0 fail. The gate-plus-question test asserts both items and the same owner; returning only gates makes it fail. The FO-owned-next-step test prevents gate attachment from manufacturing a Captain question. npm may show existing config/dependency deprecation warnings.

## 2. Exercise a fresh isolated daemon and capture its screen

```sh
python3 "$E/capture.py" --worktree "$WT" --paseo /Users/kent/.local/bin/paseo --browser /Users/kent/.npm-global/bin/agent-browser --web-dist /Applications/Paseo.app/Contents/Resources/app-dist --port 7051 --output "$PROOF"
```

Expected: exit 0 and `PASS: isolated screenshots, 16 cancelled-press checks, composer borders and decision colors`. Creates seven PNGs, observed-states.json and cleanup.json in the unique `$PROOF` folder. Both gate and separate question say OMP FO; the unmatched review says no FO. Removing hover/press feedback, composer focus handlers, distinct chip colors, or the owner label makes the assertions fail. The browser uses a fresh profile with localhost blocked; the daemon uses a separate HOME/--home, synthetic agents/reviews/gates and a temporary fleet-port change to 7052. No decision or message is sent. The daemon and browser stop, and their isolated home/profile are deleted before exit.

## 3. Inspect the rendered acceptance evidence and cleanup

```sh
python3 - "$PROOF" <<'CHECK'
from pathlib import Path
import json, os, socket, sys
p = Path(sys.argv[1])
s = json.loads((p / 'observed-states.json').read_text())
c = json.loads((p / 'cleanup.json').read_text())
assert s['candidate'] == 'dd7c9e043a24085f15086ba0f3508a7fd9977938'
assert c['home_removed'] and not Path(c['isolated_root']).exists()
try:
    os.kill(c['captured_daemon_pid'], 0)
except ProcessLookupError:
    pass
else:
    raise AssertionError('isolated daemon still running')
for port in c['ports']:
    with socket.socket() as sock:
        sock.settimeout(1)
        assert sock.connect_ex(('127.0.0.1', port)) != 0, port
print('PASS: exact candidate; isolated daemon stopped, ports closed and home removed')
print('Owner rows:', *s['ownership'], sep='\n')
CHECK
open "$PROOF/board-normal.png" "$PROOF/row-hover.png" "$PROOF/row-pressed.png" "$PROOF/composer-hover.png" "$PROOF/composer-focused.png" "$PROOF/decision-colors.png" "$PROOF/decision-with-reason.png"
```

Expected: PASS cleanup line; Preview opens seven images. Confirm the gate row has a filled hover background and dims while pressed; the composer border is muted on hover and green on focus; 准 is green, 要求修改 amber, 暫緩 muted; revise/hold borders are dashed without a reason and solid after typing one. The board shows OMP FO beside both gate rows and its separate Questions row, and no FO beside the unmatched review.

Not covered: live agents, real decision relay/recording, native/iOS VoiceOver, light theme, every conditional control state, deployment, merge or Captain acceptance. Generated rerun artifacts are task-state evidence, not product changes; the FO owns recording that rerun.
