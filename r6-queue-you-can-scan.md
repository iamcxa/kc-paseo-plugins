---
title: Flywheel round 6 — a queue the Captain can scan without opening each item
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r6-queue-you-can-scan
gates:
    version: 1
    records:
        - id: gate:r6-queue-you-can-scan:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r6-queue-you-can-scan-backlog-1
              briefing:
                id: briefing:r6-queue-you-can-scan:backlog:attempt-1:revision-1
                digest: sha256:6e1ab56f564e5f4c83fc57326d9d29f736124f3c02e41e2d14dec6305c2f42aa
                room-ref: ./r6-queue-you-can-scan/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r6-queue-you-can-scan:backlog:1
                briefing: briefing:r6-queue-you-can-scan:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-27T03:05:12.732803Z"
                decision: approve
                reason: 'Accepts direction: Captain chose this theme in round 5 UAT; scope bounded by chief-engineer and frozen; stays inside the POC boundary; stacked unmerged on #49.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'Captain chat 2026-10-26, recorded as ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-27T03:07:01Z
worktree: .worktrees/spacedock-ensign-r6-queue-you-can-scan
pr: 54
---

Round 6 of the POC flywheel under ADR 0008: queue titles are cut to a few words, an FO card mixes its items without separate taps, a failed check offers no way to look again, and the comms officer's question shows no age.

Captain, 2026-10-27, round 5 UAT option answers: most bothersome 「清單標題被截斷」; next 「掃一眼就懂的清單」 (option text: 標題完整、重複問題合併、讀不到可重試、FO 卡片分開、問題有時間).

bite: the round 5 whole-product walk (`_l3-dogfood/walks/round-5/`, 2026-10-27) shows queue rows cut to "Review ...", "Approve adapt...", "Choose the rel..." at 360 and 1440 px (picky A1, B1); the By FO card shows "5 waiting" with three unseparated items (A2); "Could not check reviews" has no retry or next-check note (A3, B5); the comms question row is the only row with no age (A5); the comms officer and an FO appear to ask the same question twice (B3, synthetic fixture). Design director ruling: `walks/round-5/director-ruling.md`.
consumer: the Captain, scanning the Bridge queue between meetings.

## Scope

- i2: each queue row's title gets its own full-width line, wrapping to two lines, with the FO name, badge and age on a smaller second line, at 360 and 1440 px, in By decision.
- i7: on the By FO card, each waiting item (question, each gate) is its own tappable row matching By decision rows; the repeated summary line goes; the waiting count equals the rows shown.
- i8: the comms officer's question shows its age from the question's timestamp; an unknown age is shown as unknown, not invented.
- i5 (bounded, chief-engineer): a user-triggered "Check again" on a failed source re-reads through that source's existing fetch and request guard; no timer, no backoff, no second polling path. Because the review reader returns stored results, its failure shows the truthful next automatic check instead of promising an immediate GitHub retry.
- i4 (conditional, chief-engineer): first, on the live board, establish whether a comms-officer ask and an FO question are the same request (same originating request, owner, decision target and unanswered state) via an identity the code can read without changing relay behaviour. Only if that holds, show it once (under the FO, marked as relayed) and count it once; otherwise keep both rows, each clearly attributed to its source.
- POC boundary: no new persistence, background recovery, backoff, relay protocol, decision-recording or permission change.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): fifth stack layer on `spacedock-ensign/r5-board-tells-the-truth` at 6f16429c; Draft PR with that base; nothing merges.
- Non-goals: the shared polled-source hook, upstream review recovery, the composer redesign (design director i1), desktop columns (i3), keyboard work.
- Scope freeze (chief-engineer): repairs stay inside these items; a third unsatisfied team pass stops the round.

## Acceptance criteria

**AC-1**: Rows are readable and reachable.
Verified by: one rerunnable fixture at 360 and 1440 px in both views: long titles wrap and stay readable; several items per FO are separate rows that each open the right destination; counts match the rows; the comms question shows an honest age.

**AC-2**: A failed source can be checked again honestly.
Verified by: tests for failure → pending → success and → continued failure, including an automatic and a manual read overlapping and a stale response dropped; the review source shows its next automatic check.

**AC-3**: Duplicate asks are merged only on proven identity.
Verified by: the recorded live-board check; duplicate and non-duplicate test cases if merging qualifies, or a report that it did not qualify with both rows attributed.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 5 UAT; scope from the whole-product walk and chief-engineer triage recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
Reviewer: kc-dev-flow-2:chief-engineer codex/gpt-6-astra xhigh 2026-10-27 — scope round 6 (a queue the Captain can scan) after his round 5 UAT and the whole-product walk
Reviewer: kc-dev-flow-2:chief-engineer codex/gpt-6-astra xhigh 2026-10-27 — is round 6 converging after roborev 1235, 1236, 1238 and 1239 (1239 on the surface the 1238 fix touched); repair, decline or revert

## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto the previous stack layer (git reset --hard 6f16429c24d4853c15698091f0fb42830185c951, branch spacedock-ensign/r5-board-tells-the-truth) and confirm HEAD; then, read-only on the live board, establish whether a comms-officer ask and an FO question can be proven to be the same request (same originating request, owner, decision target and unanswered state) through an identity the code can already read without changing relay behaviour; report the evidence and whether i4 merging qualifies
  Reset empty candidate branch to 6f16429c24d4853c15698091f0fb42830185c951 before edits. live-identity.json records live comms/FO status and labels: no same originating request/owner/decision target/unanswered state was established; shared question identity is absent from the existing reader fields, so merging did not qualify.
- DONE: i2: each queue row's title on its own full-width line wrapping to two lines, FO name, badge and age on a smaller second line; i7: on the By FO card each waiting item is its own tappable row matching By decision rows, the repeated summary line removed, the waiting count equal to the rows shown; i8: the comms question's age from its timestamp, "unknown" when absent; one rerunnable fixture checked at 360 and 1440 px in both views for long titles, several items per FO, matching counts, correct destinations and honest ages (AC-1)
  capture.py passed at the candidate in verified-360/ and verified-1440/: two views, four 36px/two-line gate titles, six individual FO rows, exact waiting count, all gate/question/review destinations and comms navigation, and 2h/unknown comms age. verified-base/ fails on 16px/narrow titles with metadata beside them; one-line title layout would fail this fixture.
- DONE: i5: a user-triggered "Check again" on a failed source re-reads through that source's existing fetch and request guard, with no timer, backoff or second polling path; the review source shows its next automatic check instead of an immediate retry; tests for failure → pending → success and → continued failure, an overlapping automatic and manual read, and a dropped stale response (AC-2); i4 only if it qualified, with duplicate and non-duplicate tests, otherwise both rows attributed to their source (AC-3); npm test and typecheck pass; branch pushed and a Draft PR opened with base spacedock-ensign/r5-board-tells-the-truth (fifth stack layer)
  116 tests and typecheck pass (tests-final.log, typecheck.log). Mounted board/co-ask tests exercise failure → pending → success, continued failure, automatic/manual overlap and stale rejection; removing the request guards or retry wiring fails them. review-schedule.test.mts checks the existing first scheduled check and stop without running a new poller. Non-qualified merging leaves separately attributed rows. Branch pushed; OPEN Draft PR #54 has the exact candidate and required r5 base (pr54.json).

### Findings

Candidate: 1c78862f03766a84e41b3bf53198451fd75673a9. Base: 6f16429c24d4853c15698091f0fb42830185c951. PR: https://github.com/iamcxa/kc-paseo-plugins/pull/54 (Draft; stacked, not merged).
Evidence: r6-queue-you-can-scan/evidence/implementation/README.md; one capture.py with explicit runtime paths and viewport arguments.
comment_ratio: PASS, 124 code lines / 0 comment lines, 0.0%, maximum 5%. doc_impact: 0 documents listed; spacedock-bridge/OVERVIEW.md updated for rows, source attribution, ages and rechecks. adr_lint: PASS; no decision record added or changed. number_guards: PASS; migration guard skipped because no migrations-path is declared, and no migration file changed.
design_surfaces: SKIPPED — known package gap 2; the POC task lacks Surfaces and Visible change. No product/task repair made for it. The anticipated number-guard R4 package gap 3 did not occur.
roborev not run: package gap 5, worker sandbox cannot reach the daemon; FO runs the gate on the pushed candidate with the base above. This is not a clean review result.
ADR 0008 was read as Accepted at base 6f16429c24d4853c15698091f0fb42830185c951, sha256:d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f; no standing authority beyond the dispatch was inferred.
Cleanup: safety.json records all 14 isolated homes removed and captured daemon PIDs stopped by the fixture, fresh browser profiles removed, main/live/candidate clean, and draft store/keyboard hook/composer unchanged. Browser geometry and DOM navigation are proven; native phone UAT, independent validation and FO/team review remain outside this worker's evidence.
No persistent state, relay/permission change, new timer or retry duty was added. No per-stage time budget was supplied; the recorded round limits and stop conditions remain unchanged. Early harness faults are retained and explained in the evidence README, separately from product verdicts.

### Summary

Queue rows now keep readable two-line titles and per-item destinations, with matching FO counts and honest comms ages. Failed sources reuse their existing read paths, while reviews show the existing automatic schedule; the exact candidate is pushed as Draft PR #54 for FO validation and review.

## Stage Report: implementation (cycle 2)

- DONE: roborev:1235: in By FO, an FO that owns a waiting item (a review, gate or question) is never classified idle, so collapsing idle rows cannot hide a waiting item; its waiting count shows; a test for a review assigned to an otherwise idle owner that fails if the old classification is restored
  By FO promotes an idle owner with queued items to Waiting on you and uses that group for its card color. The mounted Board test failed at the old head with only “Idle · 2 ▸” visible (red.log), then passed: the review owner and “1 waiting” stay visible, unrelated idle rows remain collapsed, and the review opens its owner (green.log). Restoring the old classification fails this test.
- DONE: npm test and typecheck pass; push to PR #54 (still Draft); a short "## Stage Report: implementation (cycle 2)" section
  tests.log: 117/117 pass; typecheck.log: exit 0. Candidate 9023ea4025a8f464505a0c07fed92787fb0da3a4 is pushed to OPEN Draft PR #54 with the unchanged r5 base; pr54.json confirms no merge.

### Findings

roborev:1235 affects the Captain scanning By FO: a review assigned to an idle owner vanished in the default collapsed view, violating value-ac[AC-1] readable/reachable rows. The explicit FO follow-up authorized this single repair; only board.tsx and its new regression test changed.
Evidence: r6-queue-you-can-scan/evidence/cycle-2/. comment_ratio PASS: 128 code lines, 0 comment lines, 0.0% (maximum 5%). doc_impact: 0 documents listed; existing overview remains accurate. number_guards and adr_lint PASS; no migration or decision record changed. design_surfaces SKIPPED: unchanged package gap 2 (missing POC Surfaces/Visible change); R4 gap 3 did not occur.
roborev not run: package gap 5; FO reruns its gate on this pushed head. No daemon/browser was launched; candidate/main/live worktrees were clean (safety.json). No profile or boundary change; independent review and validation remain with FO.

### Summary

Idle FO owners with outstanding queue items now stay visible with their waiting count. The regression test proves both the original failure and the repaired behavior; the fix is committed and pushed to the existing Draft PR.

## Stage Report: implementation (cycle 3)

- DONE: roborev:1236: in By FO, a question row detected from an unread reply with no next label uses that reply's preview as its title instead of only "Has a question for you"; a test for that case that fails if the generic title is restored
  Only By FO question rows without a next label use replies[row.id].preview as their displayed title. The mounted Board test reads a synthetic unread assistant reply through the actual observer: red.log fails on “Has a question for you”; green.log passes with “Choose the release window (you)”, one waiting item and the correct FO destination. Restoring the generic title fails this test.
- DONE: npm test and typecheck pass; push to PR #54 (still Draft); a short "## Stage Report: implementation (cycle 3)" section
  tests.log: 118/118 pass; typecheck.log: exit 0. Candidate 0c96b40c6419776dcac4d706153799aae0bcd905 is pushed to OPEN Draft PR #54 with the unchanged r5 base; pr54.json confirms no merge.

### Findings

roborev:1236 affects the Captain scanning By FO: an unread question without a next label lost its actual text, requiring a card open to understand it, contrary to value-ac[AC-1] readable rows. This explicitly authorized repair changes only board.tsx and its new regression test; labelled question titles, other item types and destinations are preserved.
Evidence: r6-queue-you-can-scan/evidence/cycle-3/. comment_ratio PASS: 132 code lines, 0 comment lines, 0.0% (maximum 5%). doc_impact: 0 documents listed; existing overview remains accurate. number_guards and adr_lint PASS; no migration or decision record changed. design_surfaces SKIPPED: unchanged package gap 2; R4 gap 3 did not occur.
roborev not run: package gap 5; FO reruns its gate on this pushed head. No daemon/browser was launched; candidate/main/live worktrees were clean (safety.json). No profile or boundary change; independent review and validation remain with FO.

### Summary

By FO again shows the actual unread question preview when no next label exists. The regression test proves the original failure and the corrected title and destination; the fix is committed and pushed to the existing Draft PR.

## Stage Report: implementation (cycle 4)

- DONE: roborev:1238: when the comms source failed because its timeline subscription errored, "Check again" recreates that subscription through the existing subscribe path (user-triggered only; no timer or automatic resubscribe) and the source reads loaded only when both the history read and the subscription succeed; a test for a subscription error, then Check again, then a later question event that appears, failing if the retry only refetches history
  A failed timeline subscription is recreated by the manual retry through the same effect/subscribe path; healthy-subscription history retries retain their existing path. Loaded waits for both history and subscription.ready. The mounted hook test first failed because history alone reported loaded (red.log), then passed later-question delivery after retry, both readiness orders, a second subscription failure, no automatic reconnect/history recovery, and cleanup (green.log). Restoring refetch-only retry or removing readiness gating fails it.
- DONE: npm test and typecheck pass; push to PR #54 (still Draft); a short "## Stage Report: implementation (cycle 4)" section
  tests.log: 119/119 pass; typecheck.log: exit 0. Candidate 4643e0670b88491c48b052ff560c41ecb72cff2e is pushed to OPEN Draft PR #54 with the unchanged r5 base; pr54.json confirms no merge.

### Findings

roborev:1238 affects the Captain waiting for comms questions after a timeline error: client 0.12.0 releases that subscription, and history-only retry could falsely mark it loaded while later questions were invisible, violating value-ac[AC-2] honest checking. This explicitly authorized repair changes only use-co-ask.ts and its test; no timer, automatic resubscribe, persistence or relay change was added.
Evidence: r6-queue-you-can-scan/evidence/cycle-4/. comment_ratio PASS: 150 code lines, 0 comment lines, 0.0% (maximum 5%). doc_impact: 0 documents listed; existing overview remains accurate. number_guards and adr_lint PASS; no migration or decision record changed. design_surfaces SKIPPED: unchanged package gap 2; R4 gap 3 did not occur.
roborev not run: package gap 5; FO reruns its gate on this pushed head. No daemon/browser was launched; candidate/main/live worktrees were clean (safety.json). Independent review and validation remain with FO.

### Summary

Manual checking now restores an errored comms timeline subscription, and the source remains incomplete until both subscription and history succeed. The original failure and resumed later-question delivery are covered by the regression test; the fix is committed and pushed to the existing Draft PR.

### FO notes

- Correction to the Scope line "a third unsatisfied team pass stops the round": ADR 0008 (Limits and stops) says the team unsatisfied twice on one theme stops and asks the Captain; the ADR governs, so a second unsatisfied team pass stops this round. Flagged by chief-engineer 2026-10-27 in the drift call.
- Chief-engineer drift call on 4643e0670b88 (roborev 1235, 1236, 1238, 1239): converging; repair 1239 by awaiting subscription readiness before the history read, with one race test; deferral would leave AC-2 false and reverting restores the 1238 defect.
- Repair-cycle limit set by FO after roborev:1242 on e8817b8 (the second By FO preview finding after 1236): one class-level repair (cycle 7), then later roborev findings on this round go to `### FO declines` with a trigger unless they are High, and the round moves to the pre-gate team and validation.

### FO findings before the gate

- Roborev (FO-run, package gap 5) on the round 6 heads: 1235 (1c78862), 1236 (9023ea4), 1238 (0c96b40), 1239 (4643e06), 1241 (f0b1992), 1242 (e8817b8) each one Medium, each repaired in cycles 2–7; clean on 86c54e5 (roborev:1244).
- Pre-gate team pass 1 on 86c54e5: design partner SATISFIED (later, cosmetic: repeated owner names inside their own card and "GATE" under "Gates"; noted that runtime-360-v4/failure.png shows an opened question card, not the failure controls). Picky users A and B NOT SATISFIED, same block: By decision still turns an unread question with no next label into "Has a question for you", and next to an open gate on the same FO the question drops out of the view and its count (shared/queue.ts, buildQueue); only By FO shows the preview. FO authorizes one repair (cycle 8): question rows come from one shared builder used by both views. Under ADR 0008 a second unsatisfied team pass on this theme stops the round and asks the Captain.
- Roborev clean on f10a3f2 (roborev:1246). Pre-gate team pass 2 on f10a3f2: design partner, picky A and picky B all SATISFIED (both views show the question beside its gate with matching counts; failure controls captured on the board in evidence/cycle-8/).

## Stage Report: implementation (cycle 5)

- DONE: roborev:1239: on manual recheck, await the replacement subscription's readiness, recheck the cancellation and request guards, then read history; one mounted-hook race test: fail the subscription, click Check again, hold readiness unresolved, insert a question with no event, assert no history read starts before readiness, resolve readiness and assert the question appears from history; plus a cancelled attempt whose late readiness neither reads nor publishes; the test fails on 4643e06 and passes after the repair
  load now awaits subscription.ready, checks cancelled/current request, then starts history and retains the post-read guard. The mounted race test failed on 4643e0670b88491c48b052ff560c41ecb72cff2e because history had already started (red.log); it passes with an event-free question inserted while readiness is pending, then loaded from history, plus a cancelled attempt whose late readiness neither reads nor overwrites the current question (green.log). Restoring concurrent ready/history or removing the pre-read cancellation guard fails it. The existing subscription test was adjusted to this required sequential order while retaining failure/live-delivery assertions.
- DONE: npm test and typecheck pass; push to PR #54 (still Draft); a short "## Stage Report: implementation (cycle 5)" section
  tests.log: 120/120 pass; typecheck.log: exit 0. Candidate f0b1992638ba4260c1c0b5dba0e225dd87b6f11e is pushed to OPEN Draft PR #54 with the unchanged r5 base; pr54.json confirms no merge.

### Findings

roborev:1239 affects the Captain after manual comms reconnection: a question posted between an early snapshot and subscription readiness could be lost while the source said loaded, violating value-ac[AC-2] honest checking. The FO follow-up and chief-engineer ruling authorize only this ordering repair; only use-co-ask.ts and its test changed, with no automatic recovery added.
Evidence: r6-queue-you-can-scan/evidence/cycle-5/. comment_ratio PASS: 148 code lines, 0 comment lines, 0.0% (maximum 5%). doc_impact: 0 documents listed; existing overview remains accurate. number_guards and adr_lint PASS; no migration or decision record changed. design_surfaces SKIPPED: unchanged package gap 2; R4 gap 3 did not occur.
roborev not run: package gap 5; FO reruns its gate on this pushed head. No daemon/browser was launched; candidate/main/live worktrees were clean (safety.json). Independent review and validation remain with FO.

### Summary

History snapshots now start only after the replacement subscription is ready and the attempt is still current. The race and late-cancellation tests prove the repair, which is committed and pushed to the existing Draft PR.

## Stage Report: implementation (cycle 6)

- DONE: roborev:1241: in useCoAsk, any state update that assigns a new coordinator id clears ask and since when the previous id differs (no result carries one coordinator's question under another's id); check every setResult in the hook for the same pattern; a test that switches coordinators while the previous question is shown and the new subscription is pending, failing on f0b1992
  Loading retains payload only when old.id equals coId; assigning a different id constructs ask:null/since:null. All four setResult sites were checked: failure already clears both fields; success uses guarded current-coordinator history; turn_started retains the id and clears ask. The mounted switch test fails on f0b1992638ba4260c1c0b5dba0e225dd87b6f11e with the old question/timestamp under “new” (red.log), then passes with both fields empty through pending subscription and history, followed by the new question/timestamp (green.log). Restoring the old loading spread fails it.
- DONE: npm test and typecheck pass; push to PR #54 (still Draft); a short "## Stage Report: implementation (cycle 6)" section
  tests.log: 121/121 pass; typecheck.log: exit 0. Candidate e8817b8ce6da8608367dc4befaa96e48adec98a1 is pushed to OPEN Draft PR #54 with the unchanged r5 base; pr54.json confirms no merge.

### Findings

roborev:1241 affects the Captain switching comms coordinators while a question is shown: the previous request could be presented with a button targeting the new coordinator, violating value-ac[AC-1] correct readable/reachable rows. This explicitly authorized repair changes only use-co-ask.ts and its test; same-coordinator loading behavior and other state paths are preserved.
Evidence: r6-queue-you-can-scan/evidence/cycle-6/. comment_ratio PASS: 150 code lines, 0 comment lines, 0.0% (maximum 5%). doc_impact: 0 documents listed; existing overview remains accurate. number_guards and adr_lint PASS; no migration or decision record changed. design_surfaces SKIPPED: unchanged package gap 2; R4 gap 3 did not occur.
roborev not run: package gap 5; FO reruns its gate on this pushed head. No daemon/browser was launched; candidate/main/live worktrees were clean (safety.json). Independent review and validation remain with FO.

### Summary

Switching coordinators now clears the previous question and timestamp before the new connection completes. The regression test proves the identity mismatch on the prior head and the corrected pending and loaded states; the fix is committed and pushed to the existing Draft PR.

## Stage Report: implementation (cycle 7)

- DONE: roborev:1242 and its class: in By FO, an FO's unread-question preview is hidden only when a displayed row on that card represents that same question; any other combination of waiting items (gate, review, labelled question) keeps it visible as its own row; one table test over the combinations (unlabelled unread question alone, with a gate, with a review, with a labelled question row for the same reply) that fails on e8817b8
  By FO derives its item rows and waiting counts from one list: missing unread questions are added unless a question row for the same FO already represents that preview. Gates, reviews and a different labelled question do not suppress it; an unlabelled question row uses the real preview. The mounted table test has 12 combinations across gate/review presence and absent/same/different labels; six combinations fail on e8817b8ce6da8608367dc4befaa96e48adec98a1 (red.log), all 12 pass after repair (green.log), checking exactly one unread preview, every waiting row/count and the question destination. Restoring blanket suppression or hiding on any ask row fails it.
- DONE: npm test and typecheck pass; push to PR #54 (still Draft); a short "## Stage Report: implementation (cycle 7)" section
  tests.log: 133/133 pass, including the parent table test and its 12 cases; typecheck.log: exit 0. Candidate 86c54e5feb3bbec4a09a583bae96e826280980d4 is pushed to OPEN Draft PR #54 with the unchanged r5 base; pr54.json confirms no merge.

### Findings

roborev:1242 is the same By FO preview-loss class as 1236: the Captain lost an unread question when another waiting item existed, violating value-ac[AC-1] readable/reachable rows. This explicitly authorized class repair changes only board.tsx and its table test; By decision, source reads, relay behavior and permissions are unchanged.
Evidence: r6-queue-you-can-scan/evidence/cycle-7/. comment_ratio PASS: 166 code lines, 0 comment lines, 0.0% (maximum 5%). doc_impact: 0 documents listed; existing overview remains accurate. number_guards and adr_lint PASS; no migration or decision record changed. design_surfaces SKIPPED: unchanged package gap 2; R4 gap 3 did not occur.
roborev not run: package gap 5; FO reruns its gate on this pushed head and owns the recorded last-repair-cycle limit. No daemon/browser was launched; candidate/main/live worktrees were clean (safety.json). Independent review and validation remain with FO.

### Summary

By FO now retains an unread question as a separate row unless that same question is already represented, with counts taken from the displayed rows. The full combination table proves both the previous class failure and the repaired rendering and destination; the final authorized repair is committed and pushed to the existing Draft PR.

## Stage Report: implementation (cycle 8)

- DONE: Pre-gate block (picky A and B): an unread FO question with no next label is a question row in By decision with its reply preview as title, exactly as in By FO, and it stays a row and counts when the same FO also has an open gate or review; both views take question rows from one shared builder in shared/queue.ts (buildQueue), so the views cannot diverge; one table test over the same combinations as cycle 7, asserting both views' rows and counts, failing on 86c54e5
  `f10a3f29a43fb09adff4beda268799f514f7b43b` moves preview selection and same-question suppression into buildQueue; mounted 12-combination table checks both views' exact question/gate/review rows, counts and question destinations. Eight combinations fail on 86c54e5 (red.log); all pass after the repair (green-targeted.log); restoring generic/missing decision rows fails this table.
- DONE: Screenshots at the new head, 360 and 1440 px, of both views with an unlabelled unread question beside a gate on the same FO, and of a failed source showing its "Check again" control on the board (not an opened card); npm test and typecheck pass; push to PR #54 (still Draft); a short "## Stage Report: implementation (cycle 8)" section
  `evidence/cycle-8/runtime-{360,1440}/` contains eight inspected PNGs: both views show the same question beside its gate, count 2, and the failed comms source's Check again on the board; observed.json binds each capture to f10a3f2. npm test 133/133 and typecheck pass; pr54.json confirms pushed f10a3f2, OPEN and Draft.

### Findings

- Scope: only shared/queue.ts, client/board.tsx and the existing mounted combination test changed; both views now consume the same queue and no separate By FO question builder remains.
- Evidence is under `r6-queue-you-can-scan/evidence/cycle-8/`. `capture.py` declares all executable paths and uses synthetic SDK replies/attention, a synthetic gate, an empty review source, and a comms subscription failure; candidate product modules are copied unchanged. This is isolated browser evidence, not live Captain data or acceptance.
- Both captures used their own HOME and --home, distinct ports outside the forbidden ranges, and fresh browser profiles blocking localhost. Captured daemon PIDs stopped, browser sessions closed and temporary roots removed (both cleanup.json files; absence rechecked). No card was opened for the failure screenshots; no message or decision was sent.
- Package checks: comment ratio, documentation impact, number guards and ADR lint pass (checks.json). SKIPPED: design_surfaces.py reports missing Surfaces/Visible change in FO alignment, known package gap 2. RoboRev not run, package gap 5; FO reruns its gate on f10a3f2.
- PR #54 remains Draft on the r6 branch with r5 as base; no ready, merge or other branch push. Remaining: FO-run review, validation and pre-gate team judgment.

### Summary

Both views now retain unread question text and counts through the same shared builder, including combinations with gates, reviews and separately labelled questions. The regression table fails on the previous head and passes at f10a3f2; the new head has complete 360/1440 board and failed-source captures.
