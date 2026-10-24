# Independent validation — PR #42

Verdict: PASSED for AC-1 (per-target draft retention and isolation) and AC-2 (visible recipients and screen persistence), at `8d9a68b92389aab55c96595245dc85e887251dd5`, base `e91b9755a0c3444ebf4390f5396499ddf2070457`. This is the second unmerged draft stack layer, not deployment or Captain acceptance.

## Evidence actually produced

- `npm-ci.log`: fresh `npm ci --no-audit --no-fund`, exit 0. `typecheck.log`: exit 0. `tests-unsandboxed.log`: 98 tests passed, zero failures. The first `tests.log` is a sandbox IPC refusal before test execution, not a candidate failure; the same `npm test` succeeded with local IPC permission.
- `walk-1/`: independent isolated Paseo 0.12.0 / agent-browser 0.32.0 browser execution, candidate client/shared bytes unmodified. Wide 1440×1000: gate A typed, back, B empty, A restored; seed preserves the existing comms officer draft. Compact 520×1000: both tabs restore their drafts. Screenshots visually inspected for text, target and labels.
- `slow-send-reopened-disabled.png`: one intercepted request remains one after back/reopen, Enter and DOM button click; visible pending label and disabled ↑. `slow-send-reopened-cleared.png`: delayed success clears the mounted input. `slow-send-newer-edit-kept.png`: a later edit survives success. `slow-send-refusal-reenabled.png`: refusal preserves the draft and re-enables ↑. `observed-states.json` records all assertions and exactly three intercepted sends.
- `capture.py` reuses the existing implementation walk and adds controlled delayed WebSocket responses. Only synthetic agents/gates/reviews are used. `send_agent_message_request` is retained in browser memory and never forwarded; synthetic responses settle the real client promises. This proves composer behavior, not real agent delivery. The sole disposable source adjustment is the server fleet port, 6787 → 7142, to avoid the live service. No candidate file is changed.
- `cleanup-final.json`: captured PID absent, both ports closed, private HOME/profile/daemon directory removed; candidate, main and flywheel-live remain at their original heads and clean. `pr42.json`: OPEN Draft, exact candidate, unchanged stack base.
- `checks.json`: comment ratio 81 code / 0 comment lines, 0.0% ≤ 5%; doc impact zero references (OVERVIEW.md was directly updated and agrees with behavior); ADR lint seven records, zero legacy; number guards PASS; six dispatch records complete. Package scripts use the loaded Codex 0.28.0 absolute package root, as the stage definition requires.

## Falsifiability and necessity

The isolation test reads the same target after a remount and distinct gate/agent/stage targets; omitting any key dimension fails it. Mounted component tests use real React DOM, production hook/store/composer and deferred completion: removing notification, compare-and-clear or shared pending state fails the visible-input/one-send assertions. The browser walk independently exercises actual CoChat integration and ordinary input/navigation; only the disabled-button adversarial click uses DOM click.

Existing counterexamples were reviewed, not rerun: `../implementation-cvtdyuot/baseline-1/` demonstrates base-version gate-A loss; `../cycle-2/regression-red.log` demonstrates late completion erasing newer text; `../cycle-3/regression-red-behavior.log` demonstrates stale mounted inputs; `../cycle-4/regression-red.log` fails both reopen/pending tests with local sending state. They support retaining the keyed store, subscription, compare-and-clear and shared sending state. Seed consumption prevents an old prefill reappearing after clear/remount; recipient labels directly satisfy AC-2. Four dev dependencies support mounted tests, with no new runtime dependency.

## Findings and boundaries

No material candidate finding. Decision chip logic, `decideGate`, claim/release and relay text are unchanged (`scope.json`); existing decision/composer tests still pass. Other-FO and other-stage isolation is exercised by unit/mounted tests; this browser fixture has one FO and two gates. No draft shows under another tested gate, FO or stage.

Product drafts/pending state remain module-memory-only: no new storage/server/file persistence; plugin/app reload loses them. Screenshots contain synthetic test text as evidence, not product persistence. No POC boundary crossing found. Reload, native/mobile-client rendering, live installation, real transport, Captain acceptance and release are not claimed.

Design-surfaces check: SKIPPED as known package gap 2 (POC seed has no Surfaces/Visible change markers); reproduced exit 1. Number-guards gap 3 (R4) was not triggered: check passed. RoboRev: SKIPPED as package gap 5, owned by FO; supplied 1134 result was not rerun or independently promoted to this validator's proof. No product repair, candidate commit, PR edit, merge or live-daemon mutation.

## Minimal acceptance script

Run these four steps in a fresh shell on this Mac. Explicit prerequisites: existing candidate checkout, Python 3, Git, Node/npm, `/Users/kent/.local/bin/paseo` 0.12.0, `/Users/kent/.npm-global/bin/agent-browser` 0.32.0 with Chromium installed, and `/Applications/Paseo.app/Contents/Resources/app-dist`. Ports 7141–7142 must be unused. An environment sandbox must permit local IPC/listeners and browser launch. No sign-in or secret is needed. Typical local work is under five minutes; initial dependency download time depends on cache/network.

1. Confirm the exact artifact and clean worktree.

```sh
git -C /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r3-reply-clear-and-safe rev-parse HEAD
git -C /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r3-reply-clear-and-safe status --short
```

Expected: `8d9a68b92389aab55c96595245dc85e887251dd5`, then no status entries. Stop on a different head or dirty tree.

2. Install and run checks.

```sh
cd /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r3-reply-clear-and-safe/spacedock-bridge && npm ci --no-audit --no-fund && npm run typecheck && npm test
```

Expected: all commands exit 0; typecheck has no errors; tests end with `tests 98`, `pass 98`, `fail 0`. npm configuration/deprecation warnings do not change the assertion.

3. Check decision records against the stack base.

```sh
cd /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r3-reply-clear-and-safe && python3 /Users/kent/.codex/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since e91b9755a0c3444ebf4390f5396499ddf2070457
```

Expected: exit 0, `7 ADR file(s) checked, 0 legacy`.

4. Run the isolated screen/slow-send walk and inspect the newly created screenshots.

```sh
VALIDATION_RUN="$(mktemp -d /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r3-reply-clear-and-safe/evidence/validation-2/fo-rerun.XXXXXX)" && python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r3-reply-clear-and-safe/evidence/validation-2/capture.py --worktree /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r3-reply-clear-and-safe --paseo /Users/kent/.local/bin/paseo --browser /Users/kent/.npm-global/bin/agent-browser --web-dist /Applications/Paseo.app/Contents/Resources/app-dist --port 7141 --output "$VALIDATION_RUN/walk" && cat "$VALIDATION_RUN/walk/observed-states.json" "$VALIDATION_RUN/walk/cleanup.json"
```

Expected: exit 0 and `PASS: wide gate isolation/remount, seed preservation, compact drafts, recipient labels and clearing/remount; three sends intercepted in browser memory, no message or decision delivered`. All behavioral booleans in `observed-states.json` are true, intercepted count is 3, `home_removed` and `browser_closed` are true. New screenshot directory is under `fo-rerun.*/walk`: A retains its text, B is empty, both compact tabs retain text, ↑ names Draft proof FO, the decision row says Decide via comms officer, pending ↑ stays disabled, late success clears unchanged text but preserves an edit, refusal re-enables ↑. Inspect those screenshots; a failing assertion, wrong image or incomplete cleanup is not a pass.

This script verifies the scoped synthetic browser journey and tests; it does not verify real delivery, live adoption or human acceptance. FO still reruns it as written and owns the gate/delivery decision; this report does not advance workflow state.
