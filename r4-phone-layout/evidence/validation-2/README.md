# Independent validation at 3d1f176

Candidate: `3d1f176c0ca1fa8d266c5793c91a93c6c1a82c9e`; base: `8d9a68b92389aab55c96595245dc85e887251dd5`. `pr46.json` independently confirms OPEN/Draft PR #46 and its correct third-stack-layer branch/base. No candidate commit, PR edit, merge or live installation occurred. Profile: POC, bounded plugin-side proof; no new persistence, external seam or ongoing duty introduced.

## Verdict

REJECTED for unqualified acceptance pending FO disposition of F1 below. AC-1 PASS; AC-2 fake-event and plugin-side geometry checks PASS, Android on-device behavior UNPROVEN. No new Material defect was established. The withheld acceptance concerns the dispatch's broad noncompact-web-preservation claim, not a failed phone-collapse measurement or a re-report of settled Android risks.

F1 — Needs decision: the instruction to report that noncompact web layout is unchanged is not true for this candidate. In the normal desktop gate-card workflow, the toolbar and bounded feedback now sit outside the briefing on wide web too. At 1440×1000 with the same synthetic pending-delivery record, discussion height is 371.609375 px at the base and 326.8125 px at the candidate (44.796875 px less); the composer remains fully visible at the same position, padding is zero, and no collapse button appears. See `desktop-base/desktop.json`, `web-current/desktop.json` and their screenshots. The affected contract is `r4-phone-layout/dispatch/validation-2.md#checklist` (the unchanged noncompact web claim); no AC-1/AC-2 user harm is established. This overlaps the FO-authorized persistent-feedback repair, so validation cannot decide whether that repair intentionally supersedes the wider preservation statement. Recommended disposition: explicitly accept the shared feedback/toolbar layout and narrow the preservation claim to web keyboard padding; if the broad claim remains mandatory, return a scoped repair through implementation. Do not silently describe the desktop as unchanged.

## Independently executed proof

- `npm-ci.log`: npm ci exit 0, 358 packages installed. `typecheck.log`: typecheck exit 0. `tests-rerun.log`: 101 passed, zero failures. The first test attempt (`tests.log`) could not open tsx's local IPC socket under sandboxing; the authorized rerun passed. The first web attempt stopped on socket bind before launching any daemon; its output directory is empty. These are environment failures, not candidate regressions.
- `web-current/observed-states.json`: actual web client at 360×780, briefing 260→44→260 px; discussion 286→516→286 px. Gain 230 px equals removed briefing 216 px plus the 14 px handle. Back control, explicit show/hide labels, sent/recorded/mismatched-record/do-not-resend/error feedback are visible in both states; back returns to the board. Screenshots `collapsed-warning-360x780.png`, `expanded-warning-360x780.png`, `recorded-collapsed-360x780.png`, and `error-collapsed-360x780.png` document the exercised surfaces. Collapsing to a height other than 44, withholding the gained space, failing restoration, or hiding feedback/back fails this run.
- `native/observed-states.json`: **fake native layout and keyboard inputs rendered by React Native web**, not an Android device. At show(284), the expanded panel auto-collapses, chat height is 516 >= keyboard 284 + composer 171, and composer bottom is 496 = 780−284. Hide restores 20 px bottom padding and the prior expanded/collapsed preference. A 40-line reason occupies 32 px/two preview lines, More opens the full feedback dialog, and scrolling reaches line 40. Long reason plus open keyboard retains discussion/composer. Removing auto-collapse, overwriting user preference, unbounding preview text, or discarding full feedback breaks those assertions.
- Keyboard hook tests mount production `useComposerPadding`: metrics at mount, show/hide/frame updates, Android 20→height→20 replacement, wide Android/iOS closed margin zero, web zero/no listeners, and cleanup. Removing callbacks or listener cleanup, adding 20 to an open keyboard, or ignoring metrics fails the checks. Fake Android frame events prove callback behavior only.
- `checks.json`: ADR lint exit 0, seven records/zero legacy; comment ratio 103 code lines/one necessary host-limitation comment, 1.0% <= 5%; doc impact zero documents; dispatch records six complete; number guards PASS (no R4 failure). `OVERVIEW.md` was updated and matches the bounded feedback and keyboard behavior. No ADR/migration was added or reserved. The number guard reports trunk/merge-base provenance; exact task-base diff was independently reviewed in `source-audit.json`.
- Design surfaces exit 1 is SKIPPED under known package gap 2: the approved POC task lacks Surfaces/Visible change declarations. No task fields were invented. Gap 3/R4 skip is not needed because number guards passed. RoboRev was not run: package gap 5 assigns it to FO. Every package script used `/Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0`, the dispatched installed package, not another cache.
- `runtime-imports.json`: TypeScript import parsing confirms all runtime client/shared imports belong to host-provided modules; `@getpaseo/client` occurs only in erased type imports. Actual isolated plugin loading succeeds. `source-audit.json` proves shared decision/relay/draft/composer modules, the draft hook, dependencies, and decision callbacks are byte-identical to the base; CoChat differs only by keyboard import/hook/padding. Existing tests exercise decision failures and draft retention. No real decision or message was sent.

## Existing falsifiers read, not rerun

`../cycle-2/red.log` records 20 vs 284 at visible-keyboard mount and 20 vs 316 for a frame callback before repair. `../cycle-4/red.log` and `red/observed-states.json` record failed auto-collapse, composer bottom 760 despite a 496 keyboard boundary, and a 1204 px feedback block pushing the composer bottom to 1644. `../implementation-ix9e4r73/README.md` records the old no-collapse control; current interaction independently exercises the new control. These retained observations justify initial metrics/frame handling, auto-collapse/restoration, feedback bounds/full-text retrieval, and the compact space reserve without mutating or re-running the candidate's already-passing suite. Their original author supplied the red evidence; this validator independently ran the candidate's green checks.

## Scope and device limits

The FO declines on roborev:1141 and :1145 remain settled, with unchanged code/evidence. Android resize-while-open can leave stale padding because the platform may not emit the fake frame-change event; a failing real input-mode switch would make it material. A host that shrinks its window for the keyboard could double-count the padding; an excessive blank gap in Captain UAT would make that material. No claim here establishes current Android event delivery, host resizing mode, native layout, or real navigation-bar clearance. The 20 dp clearance is approximate because the host exposes no safe-area inset.

Captain Android UAT is still required: one keyboard-open screenshot showing typed text/composer above the keyboard, and one keyboard-closed screenshot showing separation from the Android navigation bar. Neither the desktop baseline nor the fake keyboard can PASS this on-device obligation. FO retains disposition/gate authority; a validation record is not delivery/merge permission.

## Reproduction and isolation

`capture-web.py` reuses cycle-3's existing harness, adapting its expected status labels to cycle 4 and adding exact expanded/collapsed/restored geometry plus a wide baseline option. `capture-native.py` is byte-identical to cycle-4's existing harness. Only disposable entry wiring injects the native layout/keyboard and only the disposable server fleet port changes; client/shared product modules are copied unchanged. Synthetic agents, workflow files and decision records stay inside the captured disposable root. Each run creates its own HOME/--home, fresh browser profile blocking localhost, and uses loopback ports outside all excluded ranges. No live daemon is mutated.

`cleanup-verification.json` independently confirms all three captured daemon PIDs absent, homes removed, and candidate/main/live working trees clean after runs. Browser-close receipts are in each run's cleanup.json. Ports were 7181/7182 (web), 7183/7184 (fake native), 7185/7186 (desktop base). Captured fixture processes only were stopped; no unrelated process command lines were inspected or printed.

## Minimal acceptance script (four steps, normally under five minutes)

Prerequisites: this exact candidate checkout; Python 3, git, npm/Node and bash; `/Users/kent/.local/bin/paseo`, `/Users/kent/.npm-global/bin/agent-browser` with Chromium, `/Applications/Paseo.app/Contents/Resources/app-dist`; declared package 0.29.0 above; permission for local sockets; ports 7181–7184 free. These paths are explicit machine dependencies, not portable installation claims. Each step runs unchanged from a fresh shell, asserts candidate SHA/branch/clean tracked files, and uses no existing shell variables. Browser steps write uniquely named rerun evidence under this directory and remove their isolated runtime homes. The wrapper passed `bash -n`; the underlying checks below were executed independently as documented above. FO still owes the full as-written replay before presenting the gate.

1. Install and exercise the candidate:

```sh
bash /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r4-phone-layout/evidence/validation-2/acceptance.sh 1
```

Expected: npm ci/typecheck exit 0; test footer `tests 101`, `pass 101`, `fail 0`. Npm deprecation/user-config notices may appear; they did not fail the run.

2. Measure actual compact web and inspect feedback/back visibility:

```sh
bash /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r4-phone-layout/evidence/validation-2/acceptance.sh 2
```

Expected: `PASS: unresolved warnings, sent, recorded, recording mismatch and errors remain visible in both briefing states; back works; labels match; no message sent`, then `PASS: captured daemon stopped, isolated home removed; screenshots at ...`. The emitted result directory's observed-states.json shows 260→44→260 briefing and 286→516→286 discussion at 360×780. Noncompact web keeps zero padding and no collapse control; this does **not** assert desktop pixel parity (F1).

3. Exercise fake keyboard and long feedback:

```sh
bash /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r4-phone-layout/evidence/validation-2/acceptance.sh 3
```

Expected: `PASS: native compact keyboard auto-collapse/restoration, composer geometry, bounded long feedback and full More view; no message sent`, then cleanup PASS. Inspect the emitted keyboard-open and long-reason screenshots; composer bottom 496, keyboard padding 284, closed padding 20, full text reaches line 40. This is fake-input browser proof only.

4. Check required records and comment scope:

```sh
bash /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r4-phone-layout/evidence/validation-2/acceptance.sh 4
```

Expected: `7 ADR file(s) checked, 0 legacy`; `code lines 103, comment lines 1, 1.0%`, `maximum 5% (package default) met`; `6 dispatch record(s) complete`; exit 0. The exact ADR invocation inside this step is `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/scripts/adr_lint.py docs/adr --since 8d9a68b92389aab55c96595245dc85e887251dd5` after cd to the pinned worktree; independently observed exit 0.

The four-step script covers plugin proof and cleanup. It does not settle F1, perform real Android UAT, replay RoboRev, change a gate, or merge/deliver anything.
