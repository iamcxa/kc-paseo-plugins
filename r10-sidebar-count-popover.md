---
title: Flywheel round 10 — a count on the Bridge sidebar row with a popover of gates and questions
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r10-sidebar-count-popover
gates:
    version: 1
    records:
        - id: gate:r10-sidebar-count-popover:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r10-sidebar-count-popover-backlog-1
              briefing:
                id: briefing:r10-sidebar-count-popover:backlog:attempt-1:revision-1
                digest: sha256:2bbad764fc9f25f02d5693d14583b5f76535a4c04f74bc377869ca3d1f361980
                room-ref: ./r10-sidebar-count-popover/review/backlog/briefing-1
---

Round 10 of the POC flywheel under ADR 0008: show on the Bridge sidebar row how many gates and questions wait on the Captain, and open a popover with those counts and the items when he presses it.

Captain, 2026-11-04, with Agent Observatory's sidebar badge and its "需要处理 8" popover as pictures: 「看圖一跟圖二我想要有這個側欄通知，提醒我最重要的 gate counts，打開時可以看到 how many gate 以及 questions」; asked what round 10 should do, he answered 「先做側欄數字跟彈出，右側先不動」.

bite: the Bridge sidebar row (index.client.tsx, BoardItem) shows only the label "Bridge", so the Captain must open Bridge to learn whether a gate or question waits on him; the round 9 walk found the same gap on the phone Board button (`_l3-dogfood/walks/round-9/reports/picky-b.json`, B1).
consumer: the Captain, glancing at the Paseo sidebar between other work.

## Scope

- The Bridge sidebar row (BoardItem) shows a count in the row's right slot: gates waiting for the Captain's decision plus questions waiting for his answer, computed by the existing status-priority and count function from round 9 (no second count rule); no count when nothing waits; "?" (not 0) while a source is loading or failed.
- Pressing the count opens a popover (openPopover: anchored on wide layouts, a bottom sheet on compact): the number of gates and the number of questions, then those items oldest first with owner and age, each opening Bridge on that item (openScreen); an "Open Bridge" action; the incomplete-source note when a source is not checked.
- Pressing the row label still opens Bridge as today.
Non-goals: the right-side panel and header button (the Captain: 「右側先不動」); round 10's earlier plan (detail reading order, action wording, button proportions, phone bottom actions); message times; board pinning; permissions and reviews in the badge count (shown in Bridge as today).
Budget: the ADR 0008 flywheel window — round 10, the last, ending 2026-11-06.
Stop condition: ADR 0008 Limits and stops (team unsatisfied twice, FO record violations in two consecutive rounds, a POC boundary crossed), or the plugin SDK cannot keep the count current without the Bridge screen mounted.
- POC boundary: no new persistent storage, background job beyond the existing source reads, permission or relay change; no change to what is sent or recorded.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): eighth stack layer on `spacedock-ensign/r9-list-and-detail-layout` at 224b03f; Draft PR with that base; nothing merges.

## Acceptance criteria

**AC-1**: The sidebar row tells the truth about what waits on the Captain.
Verified by: tests for the count from the shared count function (gates plus questions, sent or relayed items excluded, "?" while a source is loading or failed, nothing when zero) and a capture of the sidebar row at 1440 and 360 with a count, with "?", and with none.

**AC-2**: The popover lets him see and reach what waits.
Verified by: captures of the popover at 1440 (anchored) and 360 (bottom sheet) showing gate and question counts and the items oldest first; a test that pressing an item opens Bridge on that item and "Open Bridge" opens the board.

## FO alignment

Alignment: not needed: the Captain chose this scope on 2026-11-04 with reference pictures, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
