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
