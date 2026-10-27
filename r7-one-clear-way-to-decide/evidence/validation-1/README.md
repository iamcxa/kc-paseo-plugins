# Independent validation at 316c9eff7bd6ce2f5e15db7382dea1aba1197a26

Verdict: PASSED within the recorded POC browser/synthetic-provider boundary. Base: f10a3f29a43fb09adff4beda268799f514f7b43b. Candidate branch: spacedock-ensign/r7-one-clear-way-to-decide. PR #57 was independently read as OPEN/Draft at the exact head; no PR edits, code commits, merge or live installation were performed.

## Fresh-shell acceptance (five sequential steps)

Prerequisites: Python 3, Node/npm, the clean exact candidate worktree at the path below, Paseo CLI at /Users/kent/.local/bin/paseo (observed 0.13.0), agent-browser at /Users/kent/.npm-global/bin/agent-browser (observed 0.32.0), its Chromium, and the matching Paseo Web distribution at /Applications/Paseo.app/Contents/Resources/app-dist. The fixture deliberately supplies synthetic agents, timeline and provider-send boundaries; it needs no real agents, credentials or live daemon. `acceptance.py --help` declares path overrides for another installation. Step 1 installs the lockfile dependencies. Each step asserts the exact HEAD and clean candidate, creates a new output directory, and prints its evidence path and elapsed seconds. Run captures one at a time, completing a step before starting the next. Do not run this concurrently with another worker using this worktree.

1. Install dependencies and check the candidate:

   ```sh
   python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r7-one-clear-way-to-decide/evidence/validation-1/acceptance.py checks
   ```

   Expected: exit 0, `PASS: npm ci, typecheck and all 140 tests`. Logs are saved at the printed new evidence directory.

2. Exercise Send/Enter, Confirm, Cancel, recipient labels, separate drafts, required reasons, claim conflict and send failure at 360px:

   ```sh
   python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r7-one-clear-way-to-decide/evidence/validation-1/acceptance.py message-360
   ```

   Expected: exit 0, `PASS: separated composer actions and measured targets at 360`. Its observed.json contains exactly two officer messages and one reason-only decision relay; all five decision targets are at least 44x44 with 8px choice gaps. Cancel/remount and the other action keep their independent drafts.

3. Enter long drafts and raise a simulated 280px keyboard at 360x640:

   ```sh
   python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r7-one-clear-way-to-decide/evidence/validation-1/acceptance.py keyboard-360
   ```

   Expected: exit 0, `PASS: long message and reason share bounded scrolling; real Confirm and Cancel taps above simulated keyboard`. composer-observed.json records 5,000/4,900-character drafts, a bounded scrolling ancestor, successful hit testing and pointer taps, one decision, and all 5,000 message characters retained.

4. Check the combined queue at phone width:

   ```sh
   python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r7-one-clear-way-to-decide/evidence/validation-1/acceptance.py queue-360
   ```

   Expected: exit 0, `PASS: queue highlight bounds in both views at 360` and `PASS: combined review rows retain references, widths, sibling controls and clipped feedback at 360`. Twelve short/long samples and 36 hover/focus/press states keep visible repo#number, title/Open widths, distinct labelled sibling controls and row-contained feedback.

5. Run the same combined queue inside the 380px pane on a 1440px viewport:

   ```sh
   python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r7-one-clear-way-to-decide/evidence/validation-1/acceptance.py queue-1440
   ```

   Expected: exit 0, the same two PASS lines ending `1440`, plus its new evidence path. Every capture's cleanup.json says home_removed and browser_closed are true and records only its captured stopped PID and isolated port pair.

The script is a short sample of the accepted journey; the independent runtime-1440 evidence also exercises the full composer at 1440px. It does not cover actual Android/iOS keyboards, native VoiceOver/painting, real Chinese IME/device input, real provider delivery, hosted CI, Captain UAT or FO gate approval. Those are not established by the synthetic browser proof. Browser-rendered roles plus the mounted accessibility assertions prove component structure, not a native screen reader session.

## Independent evidence

- npm-ci.log, typecheck.log and tests-authorized.log: fresh lockfile install, typecheck and 140/140 tests. The first tests.log records tsx socket EPERM from the sandbox; the identical command succeeded after the authorized retry. No candidate repair was made.
- mutations.py and mutations-verified/: independent disposable-copy mutations. Message-to-reason wiring fails “decision uses only its reason”; clearing the reason on message send fails “both actions keep the other draft”; removing the stale-target guard fails “a changed briefing or officer cannot receive a stale action”; removing the pending lock fails “pending, failure and duplicate presses keep existing behavior”; routing message input to decisions fails “message never decides”. Each failure is an actual TAP `not ok`, with exact edit, nonzero exit and removed-root receipt. The earlier mutations/ attempt is excluded: it exposed the wrapper's assumption about Node's output format, fixed by selecting TAP; no product bytes changed.
- runtime-360/ and runtime-1440/: actual candidate DecisionCard/CoChat, fresh isolated daemon and browser, real local gate/claim RPCs, synthetic SDK sends. Reason Enter never dispatches. Revise/hold require reasons; approve permits an empty reason. Confirm dispatches only the reason via the unchanged claim/relay flow. Successful Send sends only the message plus original footer to the officer; claim refusal and failed send retain drafts without automatic resend.
- keyboard-360/: actual CoChat plus synthetic keyboard metrics/events and SDK callback; 260px scroll viewport with 350px content, both 44px controls reachable above y=360 and responding to pointer taps. Message draft remains 5,000 characters after the reason confirmation.
- queue-360/ and rerun-queue-1440-bil03u_d/capture/: one existing combined fixture, unchanged from cycle 5, rerun independently. All 24 samples and 72 interaction states preserve visible repository/complete number, title and action widths, icon-only links, separate sibling roles and bounds. The mounted board test also exercises each link/card/comms action independently; a nested control, wrong handler, lost role/label, shrinkable number or missing clipping would fail.
- protected-paths.json: 17 exact base/candidate/worktree byte comparisons; all server files, index.server.ts, shared/relay.ts, shared/decide.ts, shared/decisions.ts, shared/gate.ts, shared/composer.ts, shared/drafts.ts, shared/queue.ts, client/use-draft.ts and client/use-composer-padding.ts. decision-caller-comparison.json additionally compares the onChip and onSent blocks in client/decision-card.tsx. These comparisons and actual send/claim runs support unchanged relay payload, claim and recording behavior. The new reason model is an in-memory Map; it adds no durable reason storage, automatic resend or combined transaction. No POC boundary crossing found.
- Package checks: comment-ratio-corrected.log (209 code / 0 comments, 0.0%, maximum 5%), adr-lint.log (7 records, exit 0), number-guards-corrected.log (PASS, no R4 failure; migration check skipped because no migrations-path), doc-impact.log (zero mapped documents; OVERVIEW.md updated and checked), dispatch-records.log (exit 0; all implementation dispatches read). Initial two guard logs used the state directory as workflow-dir; corrected commands use docs/dev2-poc and pass, so the initial errors are not package findings.
- design-surfaces.log: SKIPPED, known package gap 2 (POC missing Surfaces/Visible change markers). R4 package gap 3 did not occur. roborev not run by validator: package gap 5; the FO owns that run. The task's clean 1266 result was read, not represented as an independent validator run.

## Goal sufficiency and necessity

Own fresh checks support AC-1 (separate actions with existing semantics) and AC-2 (scope label and usable decision controls). Each retained product change serves those criteria or the Captain's recorded queue-painting follow-up and its supported accessibility/width corrections. No new feature or deferred briefing-reader change was added. For without-it evidence, own composer mutations show the protected semantics break; existing implementation evidence read separately records base f10a3f2 failing “missing separate message control”, 0895937 losing long-name title width to zero, and 04f90b8 failing the bounded scroll and visible-number checks (cycle-5/baseline-result.json and canonical baseline folders). Those baseline captures were read, not rerun or claimed as independent output.

No Material or Needs decision product finding. Actual native phone/IME/screen-reader UAT and FO acceptance remain outside this local proof. The current PR stays Draft and unmerged; only the task report/evidence is committed to the state branch.

Observed capture durations (including teardown): runtime-360 27.1s, runtime-1440 24.9s, keyboard-360 46.6s, queue-360 51.2s, rerun-queue-1440-bil03u_d/capture 52.4s. The four capture steps in the minimal acceptance sequence total 177.3 seconds, leaving the rest of its five-minute budget for the small lockfile/test step on this cached setup; fresh dependency downloads depend on network speed.
