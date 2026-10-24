# Keyboard padding repair

Candidate: `cd139fd`, parent/base: `9b6c11104b780e46541b8516f469aec70185ce76`. Only the padding hook and its tests changed. PR #46 remains OPEN and Draft on the original stack base; `pr46.json` identifies the full pushed head.

`red.log` exercises the real mounted hook before the repair: an already-visible keyboard's first render returned 20 instead of 284 dp; a frame change without a show event left 20 instead of 316 dp. Both new regressions failed, while the existing show/hide/layout test passed. `green.log` shows all three focused tests passing after initializing state from optional Keyboard.metrics(), synchronizing it on platform changes and listening to keyboardDidChangeFrame. Removing the metric initializer or frame callback makes the corresponding regression fail. Omitting any listener removal breaks the cleanup assertions. Existing no-metrics tests retain the zero-height fallback and Android closed-keyboard margin.

`tests.log`: npm test, 101 passed, zero failures. `typecheck.log`: npm run typecheck, exit 0. Reproduce after npm ci in spacedock-bridge with `node --import tsx --test test/composer-padding.test.mts`, `npm test`, and `npm run typecheck`. No new dependency or fixture path is required.

`checks.json`: absolute-path package scripts at 0.29.0; repair-base comment ratio 9 code lines / 0 comments (0%, threshold not enforced below 20 code lines), document impact zero documents, number guards PASS, ADR lint seven records / zero legacy. Existing OVERVIEW.md remains accurate; no retained document, ADR or migration changed. No new POC boundary crossed.

The two authorized Medium findings affect value-ac[AC-2]: remounting/switching a native composer while the keyboard stays open or changing its frame can leave typed text covered. The triggers are reproduced in red.log and corrected in green.log. These are mounted React-hook tests with fake native keyboard inputs, not Android device evidence. The earlier 360×780 collapse receipts remain unchanged and were not rerun for this hook-only repair. Captain keyboard-open/closed Android UAT remains outstanding. No daemon or browser was launched for this follow-up, and no temporary runtime required cleanup.

RoboRev not run: known package gap 5; FO reruns roborev_gate.py on the pushed head. Design-surface check remains SKIPPED under known package gap 2; its declarations and the briefing UI were untouched. PR body was updated with the repaired behavior and current test count; no ready, merge, release or live-install action was performed.
