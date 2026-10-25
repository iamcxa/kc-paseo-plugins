# Minimal acceptance script

Candidate 6f16429c24d4853c15698091f0fb42830185c951. Run each code block unchanged in a fresh shell. Five steps; observed runs fit within five minutes.

Prerequisites: Python 3, Git, Node/npm, the exact checkout below, installed `/Users/kent/.local/bin/paseo`, `/Applications/Paseo.app/Contents/Resources/app-dist`, `/Users/kent/.npm-global/bin/agent-browser` and its Chromium. Step 5 additionally needs the current read-only local Paseo endpoint on port 6767 and a relay FO with a readable closed gate. Socket/process permissions are required. These machine paths are explicit dependencies, not repository-provided software. Ports are selected from available pairs outside the reserved ranges; every browser profile is fresh and blocks localhost. No sign-in or provider turn is needed.

## 1. Install and check the exact candidate

```sh
cd /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth/spacedock-bridge && test "$(git -C /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth rev-parse HEAD)" = 6f16429c24d4853c15698091f0fb42830185c951 && npm ci --no-audit --no-fund && npm run typecheck && npm test
```

Expected: Exit 0; typecheck succeeds and tests report 113 passed, 0 failed.

## 2. Show both source states and the question without opening Comms

```sh
python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r5-board-tells-the-truth/evidence/validation-2/capture.py --worktree /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth --paseo /Users/kent/.local/bin/paseo --browser /Users/kent/.npm-global/bin/agent-browser --web-dist /Applications/Paseo.app/Contents/Resources/app-dist --port 0 --mode empty --output "$(mktemp -d /tmp/r5-empty.XXXXXX)/evidence"
```

Expected: Exit 0; PASS: empty runtime assertions. Printed evidence folder contains both views loading/failed/checked screenshots and question-on-fos-380.png.

## 3. Keep healthy gates and remove finished-card decision controls

```sh
python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r5-board-tells-the-truth/evidence/validation-2/capture.py --worktree /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth --paseo /Users/kent/.local/bin/paseo --browser /Users/kent/.npm-global/bin/agent-browser --web-dist /Applications/Paseo.app/Contents/Resources/app-dist --port 0 --mode gate --removed-workflow --output "$(mktemp -d /tmp/r5-gate.XXXXXX)/evidence"
```

Expected: Exit 0; PASS: gate runtime assertions. Screenshots show the failed directory beside two healthy gates, Recorded: approve, neutral closed state, and ← Queue with ordinary discussion only. observed.json reports refresh_calls_on_return: 1.

## 4. Prove the check catches the old empty condition

```sh
python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r5-board-tells-the-truth/evidence/validation-2/capture.py --worktree /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth --paseo /Users/kent/.local/bin/paseo --browser /Users/kent/.npm-global/bin/agent-browser --web-dist /Applications/Paseo.app/Contents/Resources/app-dist --port 0 --mode empty --mutate-empty --output "$(mktemp -d /tmp/r5-negative.XXXXXX)/evidence"
```

Expected: Expected exit 1 with AssertionError: Old empty condition hides Loading before reviews were checked. A port/startup failure is NOT a passing negative check. failure.png shows Nothing is waiting on you before reviews are checked. The mutation exists only in the disposable copy.

## 5. Read a real closed gate without writing it

```sh
cd /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r5-board-tells-the-truth/spacedock-bridge && ./node_modules/.bin/tsx /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r5-board-tells-the-truth/evidence/validation-2/baseline-closed-relay.mts
```

Expected: Exit 0; JSON withoutId contains briefing:null, recorded:true, error:null. The selected closed entity can change; no decision or message is sent.

Limits: controlled SDK timeline and synthetic isolated workflow/review records exercise the actual candidate browser/server modules; this is not a real provider conversation, native Android test, hosted CI result, gate approval, install or merge. Temporary daemon homes and browser profiles are deleted; printed temporary evidence folders remain for inspection.
