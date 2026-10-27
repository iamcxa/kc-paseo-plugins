# Cycle 5 proof

Candidate: `316c9eff7bd6ce2f5e15db7382dea1aba1197a26`. Prior candidate: `04f90b876bf0f2765343477513fabd08b7b3a2d0`. Only `client/board.tsx`, `client/co-chat.tsx`, their mounted checks and the retained overview changed.

`verified-queue-360/` and `verified-queue-1440/` run one combined queue acceptance fixture on unchanged product modules. They cover 24 short/long-repository row samples and 72 hover/focus/press states across both views, ordinary and unassigned rows, plus the featured row where that view has one. Titles are long in both repository variants. The desktop viewport is 1440px; the actual Board pane is constrained to 380px. Every sample checks a visible truncated repository plus an unshrunk number, retained title and Open widths, a bounded icon-only link, two independently labelled sibling controls and feedback inside its clipped wrapper without overlap. Original cycle-2 question/gate geometry is also checked: 4px equal insets and 10px/12px gaps.

`verified-composer-360/` mounts actual CoChat at 360×640. The fixture enters a 5,000-character message and 4,900-character reason, then raises the existing keyboard hook through synthetic Keyboard.metrics/listener events and overlays a 280px keyboard. Both composers share a 260px scroll viewport containing 350px of content. Confirm and Cancel are each 44px tall, pass hit testing above the keyboard, and respond to real pointer taps; confirming sends the reason once and preserves the message. `base-composer-360/` runs the same check on unchanged prior product modules. See its observed geometry and expected failure in `base-composer.log`.

`verified-base-mounted/` runs the final mounted checks against unchanged prior Board and CoChat modules; each fails at the named invariant. Restoring the fixed composer View, moving either composer outside the common scroll area, nesting the GitHub action, hiding the PR number, allowing it to shrink, expanding the link to repository text, reducing title/Open widths or removing clipping breaks the retained checks. `tests.log` records 140/140 passing on the candidate; `typecheck.log` passes. `verification.json` gathers the canonical measurements.

## Rerun

Prerequisites: the candidate worktree and its `spacedock-bridge/node_modules` installed from the lockfile; Python 3, the Paseo CLI, the agent-browser CLI, Chromium available to agent-browser, and the Paseo Web distribution. These are explicit runner inputs, rather than undeclared globals. Browser runs must be sequential. Every `--output` must name a new directory.

```sh
python3 queue_acceptance.py --worktree /path/to/candidate --paseo /path/to/paseo --browser /path/to/agent-browser --web-dist /path/to/app-dist --width 360 --port 0 --output /new/queue-360
python3 queue_acceptance.py --worktree /path/to/candidate --paseo /path/to/paseo --browser /path/to/agent-browser --web-dist /path/to/app-dist --width 1440 --port 0 --output /new/queue-1440
python3 composer_acceptance.py --worktree /path/to/candidate --paseo /path/to/paseo --browser /path/to/agent-browser --web-dist /path/to/app-dist --width 360 --port 0 --output /new/composer-360
python3 composer_acceptance.py --worktree /path/to/candidate --paseo /path/to/paseo --browser /path/to/agent-browser --web-dist /path/to/app-dist --width 360 --port 0 --baseline 04f90b876bf0f2765343477513fabd08b7b3a2d0 --output /new/base-composer-360
python3 falsifier.py --worktree /path/to/candidate --output /new/base-mounted
```

The baseline composer command must exit 1 at the shared bounded-scroll assertion. The other commands must exit 0. The runner copies the plugin into a disposable directory, injects only synthetic entry/SDK/review-RPC/keyboard boundaries and changes the isolated fleet port. It never installs the live plugin. Each capture uses an isolated HOME and daemon home, available non-live ports and a fresh profile blocking localhost. Cleanup terminates only the captured daemon PID, closes its browser and removes its root. `cleanup.json` files and final `safety.json` record this; raw daemon output and provider command lines are never exported.

Earlier attempts are retained separately: queue-360 and queue-360-v2 exposed a fixture navigation escape when a pressed unassigned row opened the comms officer; the final fixture captures that callback. composer-360 used Enter while typing the message and therefore submitted it; the final wrapped draft avoids submission. composer-360-v2 passed with the keyboard already raised but predates the commit binding. base-mounted found both intended failures, but the first wrapper expected a different assertion message; verified-base-mounted checks explicit final messages. None of these attempts is used as candidate acceptance evidence.

Package checks: 19 added product code lines, 0 comments, 0.0%, below the 20-line enforcement floor; document impact reports no mapped documents, and the affected overview claims were updated. ADR lint checks 7 records with no changes; number guards pass against their workflow-selected base, with no ADR or migration changes. Migration guard skips because no migrations-path is declared. design_surfaces is SKIPPED for known package gap 2 (missing POC Surfaces/Visible change fields); no R4 gap 3 occurred. RoboRev is not run by the worker (package gap 5); the First Officer reruns it on the new head.

This proves mounted accessibility structure and browser layout with a simulated keyboard, including control hit testing. Actual iOS screen-reader and native keyboard/painting behavior and independent acceptance remain outside this proof. The draft store, keyboard hook, shared queue, decision payloads, claims and recording semantics are unchanged. PR #57 stays Draft; no merge, release or live install.
