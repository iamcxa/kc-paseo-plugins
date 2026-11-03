---
title: Flywheel round 9 — narrow list beside a wide detail, with state kept across reopen and the comms officer
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r9-list-and-detail-layout
---

Round 9 of the POC flywheel under ADR 0008 builds the layout and navigation of the design the Captain accepted in round 8: a narrow list beside a wide detail, grouped, one status per row, filters with counts, and switching items without losing drafts, choices or progress.

Captain, 2026-11-03: 「照這個方向做可以」 to 「照這個方向做，還是有哪裡要改？」 on the round 8 mockups; round 7 UAT most bothersome 「桌面決定區太窄」.

bite: the installed build (316c9ef) gives the open decision a narrow side column beside a mostly empty comms conversation (`_l3-dogfood/walks/round-7/screenshots/1440-gate-open-expanded.png`); the accepted reference is `r8-list-and-wide-detail/design/LIST-AND-DETAIL.md` and `r8-list-and-wide-detail/mockups/` (23 states at 1440 and 360).
consumer: the Captain, deciding from the Bridge on desktop and phone.

## Scope

- From chief-engineer (codex/gpt-6-astra:xhigh, 2026-11-03), round 9 of a two-round split:
  - bridge.tsx replaces the permanent comms chat plus fixed-width board with the list/detail layout (phone: list or detail, back keeps position).
  - board.tsx stops replacing its list with a detail card; grouping by kind, one status marker per row (icon plus text: your turn / waiting on someone else / done), filters with counts (all, permissions, reviews, gates, questions) that say when a source is incomplete; selection survives view changes.
  - The comms officer conversation opens in the shared detail from its question row and from an always-available, uncounted entry; an unassigned review opens it directly with the prefilled ask, keeping drafts.
  - CoChat renders the selected recipient and tells loading and failure apart from an empty conversation.
  - decision-card supplies item content and progress to the shared detail; its reading order, action wording, button proportions and phone bottom actions are round 10.
- POC boundary: session-only presentation memory; no new persistent storage, history, recovery duty or integration; no change to Confirm, required reasons, permissions, or what is sent, relayed or recorded; no in-place permission approval, next-item control, or unread/later/running filters. Any needed host (Paseo) extension returns to the Captain.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): seventh stack layer on `spacedock-ensign/r7-one-clear-way-to-decide` at 316c9ef; Draft PR with that base; nothing merges.
- Non-goals: round 10's detail reading order, action wording, proportions and phone bottom actions; historical briefing retrieval; the real-phone keyboard check (the Captain's device, after round 10).

## Acceptance criteria

**AC-1**: The built layout matches the accepted mockups for list, grouping, status and filters.
Verified by: one combined fixture with the real components across the 23 reference states at 1440 and 360, both list views, long titles and hover/focus/link bounds; the design director compares the captures with `r8-list-and-wide-detail/mockups/`, with round 10 differences declared.

**AC-2**: Nothing is lost when moving between items and the comms officer.
Verified by: tests named up front — "reopen keeps the confirmed choice and reason", "sent and relayed progress survives a comms detour", "a recorded item never becomes actionable again", "switching items keeps separate drafts and rejects stale actions", "errors and progress stay with their own source and owner".

**AC-3**: Status and counts are decided in one place.
Verified by: one status-priority function with a table test over every waiting kind in LIST-AND-DETAIL.md; counts keep pending items, exclude finished ones and tell an incomplete source from zero.

## FO alignment

Alignment: not needed: the Captain accepted the design on 2026-11-03; scope and split from chief-engineer, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
Reviewer: kc-dev-flow-2:chief-engineer codex/gpt-6-astra:xhigh 2026-11-03 — scope round 9 (build the accepted list-beside-wide-detail design; one round or split)
