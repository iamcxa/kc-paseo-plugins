---
title: The Fleet board's By decision view puts the next decision first and every other item on one line
status: validation
variant: kc-dev-flow-2
profile: poc
merge: pr
gates:
    version: 1
    records:
        - id: gate:board-next-decision-first:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:board-next-decision-first-backlog-1
              briefing:
                id: briefing:board-next-decision-first:backlog:attempt-1:revision-1
                digest: sha256:a6868466f264730356e77f8a2733696e129673bd34a9821921fed3fb0d83b570
                room-ref: ./board-next-decision-first/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:board-next-decision-first:backlog:1
                briefing: briefing:board-next-decision-first:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T08:02:05.302148Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the backlog gate review for briefing attempt-1 (sha256:a6868466f264): approve to enter implementation in an isolated worktree with a PR.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-23T08:02:45Z
worktree: .worktrees/spacedock-ensign-board-next-decision-first
---

The Captain finds the Fleet board's "By decision" view too dense to scan: every waiting item is drawn as an equal three-to-five-line card, so nothing tells him where to start. He compared three mockups side by side (current board, a two-line card variant, and a "next up" variant) and chose the "next up" variant.

Captain, 2026-10-23: 「這裡的資訊密度太高了，應該要調整一下」; after seeing the mockups: 「這樣確實比較好，第三欄」.

bite: with 8 items waiting, the By decision column of the Bridge screen ran about one screen tall of equal-weight cards (three to five text lines each, a "GitHub ↗" button beside review items), and the Captain judged it too dense to read.
consumer: the Captain, scanning the Bridge screen's right column for what to decide next.

## Scope

- Depends on the move task `spacedock-bridge-plugin` (Draft PR #31): work in `spacedock-bridge/` after that PR merges, never in the old POC directory in kc-claude-plugins.
- Only the `view === "decision"` branch of `client/board.tsx`, plus `shared/queue.ts` if the ordering helper needs a field. The By FO view, the decision card and the comms officer chat are unchanged.
- The chosen layout (third mockup column):
  - Top: one larger "next" card for the first item of the existing queue order (permission, review, gate, question; oldest first within a kind). It shows a small kind label with the wait time, the full title, the owning FO's title, and one primary button that does what tapping the item does today.
  - Below: the remaining items as one-line rows grouped under small section headings — Comms officer, Reviews, Gates, Questions — each heading with its count. A row is a colored dot (the current kind colors), the title cut to one line, and the wait time on the right. Tapping a row does what tapping the item does today.
  - Removed from the rows: the "NEW" mark, the detail line, the FO title, and the "GitHub ↗" button (still reachable from the decision card or the FO chat).
- Non-goals: a "Skip" button (in the mockup, undefined; leave it out), showing each gate's briefing question in place of the task title, changes to how items are collected, the mobile layout.

## Acceptance criteria

**AC-1**: The By decision view renders the chosen layout.
Verified by: a screenshot of the Bridge screen in an isolated Paseo daemon (or the Captain's own after install) with at least one item of each kind, showing the next card on top and one-line grouped rows below.

**AC-2**: Ordering and taps are unchanged.
Verified by: `npm test` in `spacedock-bridge/` with a test that the next card is the first item of `buildQueue` and that the remaining rows keep its order inside each section; existing tests still pass.

## FO alignment

Alignment: not needed: the Captain chose the layout himself from a side-by-side mockup on 2026-10-23.
Release review: not needed: spacedock-bridge has no journey map yet.

## Captain amendments

### Amendment 1 — 2026-10-23, chat
Captain: 「add the button to the top card。能夠偵測是 github or gitlab or 其他的嗎？或是，就顯示 PR↗ or MR↗？」 (chat, after the implementation report)
Asked: Should I add the button to the top card?
Supersedes: none
Design:   - Removed from the rows: the "NEW" mark, the detail line, the FO title, and the "GitHub ↗" button (still reachable from the decision card or the FO chat).

## Stage Report: implementation

- DONE: The By decision view renders the chosen layout: a larger next card on top for the first buildQueue item, the rest as one-line rows grouped under Comms officer / Reviews / Gates / Questions with counts and the wait time on the right, with a screenshot from an isolated Paseo daemon (AC-1)
  Commit abba4df on spacedock-ensign/board-next-decision-first (PR #32). Screenshot: `board-next-decision-first/ac1-by-decision.png` in this state checkout (isolated daemon, own --home and HOME, port 6790, stopped and home deleted afterwards; live daemon untouched). It shows the next card, Reviews 1, Gates 3, Questions 2; tapping a gate row opened its decision card. No Permission or Comms officer row in the shot: the isolated HOME has no Claude login, so no agent could raise either. Those two paths are verified by typecheck only. "Permissions" is a section I added so a second permission item is not dropped; it is not in the mockup.
- DONE: npm test in spacedock-bridge/ passes, with a new test that the next card is the first buildQueue item and the remaining rows keep its order inside each section (AC-2)
  `npm test`: 44 pass, 0 fail (was 42); `npm run typecheck` clean. Test "the next card is the first queue item..." asserts `next === queue[0]`, section order and that `sections.flatMap(items)` deep-equals `queue.slice(1)`; it fails if `splitQueue` reorders, drops or duplicates an item. Second new test covers the empty and single-item queue. `isNew` and its assertions were removed with the NEW mark (its only consumer).
- DONE: Roborev gate run on the committed candidate with its evidence= or incomplete: line in the report, and a Draft PR open
  `findings on abba4dfb9; evidence=roborev:1086`. Run once; the one finding is a spec conflict, not fixed (below). Draft PR: https://github.com/iamcxa/kc-paseo-plugins/pull/32. comment_ratio: code lines 97, comment lines 0, 0.0% (max 5% met). doc_impact: 0 documents mention what changed. number_guards/ADR: not applicable (no db surface, no decision record).

### Summary

Only the `decision` branch of `client/board.tsx` changed, plus `splitQueue` in `shared/queue.ts` and its tests; the By FO view and decision card are unchanged. profile poc: no boundary-crossed; cleanup done (isolated daemon stopped, its home and fixtures deleted).

### Findings for FO

- Needs decision (roborev:1086, Medium): the scope says the removed "GitHub ↗" button is "still reachable from the decision card or the FO chat". In code it is not: `client/decision-card.tsx` has no PR link and `openItem` passes no review to it. The only remaining link is on the By FO view's Review requests list. Options: accept as is, or add a link to the decision card (outside the stated scope). I built what the scope says and did not add it.
- Browser note: the gstack headless browser used for the screenshot now has a saved host entry localhost:6790 (dead); harmless, not removed.

## Stage Report: implementation (cycle 2)

- DONE: When the next card's item is a review, the next card shows a second button labelled "PR ↗" beside its primary button, opening the review URL with openExternalUrl; other kinds show no such button (Captain amendment 1)
  Commit 22f75e6 (PR #32). Isolated daemon (port 6790, own --home and HOME, stopped and deleted): `board-next-decision-first/ac-amend1-review-next-card.png` shows "Ask comms officer" with "PR ↗" beside it; `ac-amend1-gate-next-card.png` shows a gate next card with only "Open". Limit: clicking the button opened no tab in the headless browser, so the URL open itself was not observed; it calls the same `openExternalUrl(url)` as the By FO view button. The button is shown only when `next.review` is set.
- DONE: npm test and npm run typecheck in spacedock-bridge/ pass, with a test or an isolated-daemon screenshot showing the button on a review next card
  `npm test` 44 pass, 0 fail; `npm run typecheck` clean; screenshots above are the evidence for the button (no new unit test: the change is a render branch, no new logic). Removing the `next.review ?` branch makes the review screenshot lose the button.
- DONE: Roborev gate rerun on the new head with its evidence= or incomplete: line in a new report section, and PR #32 updated
  `findings on 22f75e633; evidence=roborev:1087`. PR #32 body updated, head pushed. comment_ratio 0 comment lines in 109 code lines.

### Summary

One render branch added to the next card in `client/board.tsx`; the label is "PR ↗" with no host detection, per the FO ruling. The earlier finding roborev:1086 is resolved by this amendment.

### Findings for FO

- Needs decision (roborev:1087, Medium): a review that is not first in the queue has no PR link in By decision (rows drop it, as scoped), and if a permission ranks first, every review loses its link here. The By FO view still has "GitHub ↗" on every review. Options: accept, or add a link to review rows or the decision card (outside the amendment, which names the top card only). Not built.
- The gstack headless browser holds a dead saved host entry for localhost:6790 (a second one, new server id); harmless, not removed.
