---
title: Flywheel round 6 — a queue the Captain can scan without opening each item
status: backlog
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
