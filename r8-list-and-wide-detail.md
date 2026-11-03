---
title: Flywheel round 8 — design round, list beside a wide detail, with every waiting state presented clearly
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r8-list-and-wide-detail
gates:
    version: 1
    records:
        - id: gate:r8-list-and-wide-detail:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r8-list-and-wide-detail-backlog-1
              briefing:
                id: briefing:r8-list-and-wide-detail:backlog:attempt-1:revision-1
                digest: sha256:1626eb4e74b2159a2e8529315bddb08f179b949d63fc72d6a7efa162ce28ac68
                room-ref: ./r8-list-and-wide-detail/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r8-list-and-wide-detail:backlog:1
                briefing: briefing:r8-list-and-wide-detail:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-11-03T07:05:53.353108Z"
                decision: approve
                reason: 'Accepts direction: the Captain chose to try the list-beside-wide-detail layout and asked for the reference evaluation on 2026-11-03; step A has no visuals and no code.'
                conn:
                    quote: 可以試試看，你也可以看一下他在每個 gate/等待的介紹全面評估一下
                    source: 'Captain chat 2026-11-03, answering 「第 8 輪設計稿要不要改成 Observatory 那種「左邊窄清單、右邊寬詳情」？」; flywheel grant ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-03T07:06:52Z
worktree: .worktrees/spacedock-ensign-r8-list-and-wide-detail
---

Redo the round 8 design for the layout the Captain wants to try — a narrow list that stays visible beside a wide detail — and first evaluate how a better-rated plugin presents each kind of waiting item, before any mockup.

Captain, 2026-11-03: 「我覺得後者的 UI 有比較好，從 UX 角度切入比較一下」 (comparing stevecastaneda/progress with zhjiang22/agent-observatory); asked 「第 8 輪設計稿要不要改成 Observatory 那種「左邊窄清單、右邊寬詳情」？」, answered 「可以試試看，你也可以看一下他在每個 gate/等待的介紹全面評估一下」. Standing ruling for the round: 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」 (2026-10-28).

bite: round 8 step 1 compared three models and missed master-detail; the Captain chose 單件全區 from that incomplete set and then preferred Observatory's layout on sight (`_l3-dogfood/rounds.md`, 2026-11-03).
consumer: the Captain, choosing the layout and saying go before any code.

## Scope

- Step A, no visuals, in `r8-list-and-wide-detail/design/`:
  - Reference evaluation of zhjiang22/agent-observatory (github.com/zhjiang22/paseo-plugins, folder agent-observatory: README.md, OVERVIEW.md, assets/ screenshots): for every waiting/attention state it shows (pending approval, question, plan to approve, error, quota, idle/unfinished turn, unread, awaiting reply, later, running, background running), how it is introduced — row label, colour/icon/text, priority among labels, quick-filter chip and count, grouping, the detail's first content, the primary action and its wording, secondary actions, phone behaviour, legend. Then map each to Bridge's waiting kinds (open gate, recorded / no-longer-open gate, FO question, comms officer question, review, unassigned review, loading and failed sources, closed FO) and say adopt / adapt / skip with a reason. Reference only: the repository has no licence, so no code, text or asset is copied.
  - Operation counts for the master-detail model on the same ten tasks as `r8-simplest-way-to-decide/design/INTERACTION-MODELS.md`, next to the earlier three models; where the comms officer conversation lives in this model (a list row, a detail tab, or other) with counts for each option.
  - Recommendation, what gets worse, open questions for the Captain on one page.
- Step B (after the design director approves step A): one mockup direction as static HTML + PNG at 1440 and 360, with a two-column review.html like round 8's, Paseo look as the base; decision controls in proportion with send on desktop, ≥ 44×44 on phone.
- Hard exclusions, widgets included: no change to what is sent, relayed or recorded (Confirm, required reasons, separate messaging stay); no new stored data or history view; no AI summaries, token statistics, scheduling, sounds or auto-archive from the reference; no product code, code branch or PR.

## Acceptance criteria

**AC-1**: Each Bridge waiting kind has a sourced presentation decision.
Verified by: the mapping table cites the reference's README section or screenshot for every adopted or adapted item, and the design director checks it against both products.

**AC-2**: The Captain can judge layout and states in a few minutes.
Verified by: one page for step A; review.html for step B; his choice and his go or changes recorded verbatim.

## FO alignment

Alignment: not needed: the Captain chose to try this layout and asked for the reference evaluation on 2026-11-03, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
