---
title: The Fleet board's By decision view puts the next decision first and every other item on one line
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
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
