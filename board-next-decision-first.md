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
        - id: gate:board-next-decision-first:validation
          stage: validation
          attempts:
            - id: gate-attempt:board-next-decision-first-validation-1
              briefing:
                id: briefing:board-next-decision-first:validation:attempt-1:revision-1
                digest: sha256:d64b04a77f16afff3ab61b10c4e5cffab65ff4e107f1f2e8e7c21c9ceef2528b
                room-ref: ./board-next-decision-first/review/validation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:board-next-decision-first:validation:1
                briefing: briefing:board-next-decision-first:validation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T08:48:35.792481Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the validation gate review for briefing attempt-1 (sha256:d64b04a77f16): approve as validated at 22f75e63; route to done; PR #32 waits for the Captain to merge.'
              application:
                target-stage: done
                state: pending
started: 2026-10-23T08:02:45Z
worktree: .worktrees/spacedock-ensign-board-next-decision-first
pr: pr-merge:32
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

## Stage Report: validation

- DONE: Independent verdict on AC-1, AC-2 and Captain amendment 1 for PR #32 at the candidate head, from your own npm ci / typecheck / test run and your own isolated-daemon screenshots (never the live ~/.paseo)
  Recommend PASSED at 22f75e6 (base cad57e0). Clean `git archive` of the SHA: `npm ci` ok, `tsc --noEmit` exit 0, `npm test` 44 pass 0 fail. AC-1: isolated daemon (own --home and HOME, port 6811, then 6812 for the script rerun; both stopped, homes deleted; live 6767/6787 untouched): next card on top (kind, 3h, full title, FO, button), then grouped one-line rows Reviews 2 / Gates 3 / Questions 2 with wait time; `By decision · 8` = 1 next + 7 rows. Screenshots in `board-next-decision-first/validation/`: `val-bndf-ac1-by-decision.png` (review next, no FO: "Ask comms officer" + "PR ↗"), `val-bndf-owned-review-next.png` (text: review owned by FO gamma: "Open" + "PR ↗"), `val-bndf-gate-next.png` (gate next: "Open" only, no PR button), `val-bndf-gate-row-tap.png` (tapping a gate row opens its decision card, unchanged), `val-bndf-by-fo.png`. AC-2: test "the next card is the first queue item and the sections keep the queue order" fails when `splitQueue` reverses the queue and when it stops grouping (two sed mutations on a throwaway copy, both 1 fail, restored, 44 pass); on screen, Questions list the 5m item before the 4m one (oldest first). Amendment 1: PR button present only when `next.review` is set (review next cards show it; gate next card does not); label is "PR ↗" with no host detection, as the FO ruling. Fixtures were the real poller and `gatePreparedAt`/`spacedock status` code paths fed by a fake `gh` and `spacedock` on PATH, plus FO agents (no Claude login in the isolated HOME).
- DONE: A minimal acceptance script the FO can rerun as written in a fresh shell, with each step's expected output
  Script `/tmp/val-bndf-accept-8f3a2c.sh` (copy: `board-next-decision-first/validation/val-bndf-accept-8f3a2c.sh`); I ran all four steps in a fresh shell on port 6812, then teardown. Needs the `paseo` 0.12.0 CLI and `claude` on PATH (never logged in); about 3 minutes.
  1. `bash /tmp/val-bndf-accept-8f3a2c.sh build` -> `npm ci ok`, `typecheck exit 0`, `ℹ tests 44`, `ℹ pass 44`, `ℹ fail 0`, and the two "next card" test lines with a check mark.
  2. `bash /tmp/val-bndf-accept-8f3a2c.sh daemon` -> `Started: PID <n>, listening on 127.0.0.1:6812`, a 40 s wait, a list of five idle FOs (gamma, gate one/two/three, alpha two), `reviews stored: 3`.
  3. `bash /tmp/val-bndf-accept-8f3a2c.sh open` -> prints the browser steps and a board URL `https://app.paseo.sh/h/<serverId>/plugin/paseo-spacedock-bridge/surface/board`. Add host 127.0.0.1:6812 (Settings, Switch host, Add host, Direct connection), open the URL. Expected: tab `By decision · 8`; top card `NEXT · REVIEW REQUEST · 3h`, title "Add retry with backoff to the gadget uploader…" (3 lines), `no FO`, a green "Ask comms officer" button and a small "PR ↗"; below, headings REVIEWS 2, GATES 3, QUESTIONS 2, each row one line with a dot and an age at the right; no "NEW", no detail line, no per-row GitHub button.
  4. In the same page click the "Approve the migration plan" row -> its decision card opens (as before); click "← Bridge", then the tab `By FO · 5` -> three review cards each with a "GitHub ↗" button.
  5. `bash /tmp/val-bndf-accept-8f3a2c.sh teardown` -> `daemon stopped`, `removed /tmp/bndf-accept-run`.
  Does not cover: Permission and Comms officer rows (no agent can raise a permission without a login), a real new tab opening from "PR ↗" in a headed browser, the mobile layout, the Captain's installed plugin.
- DONE: Material findings and limits, including the unobserved "PR ↗" URL open and the roborev:1087 Medium (reviews below the next card have no PR link in By decision)
  No Material finding (see Findings for FO). The URL open: with `window.open` stubbed in the page, clicking "PR ↗" on the next card passed exactly `https://github.com/acme/gadget/pull/41`, and the By FO "GitHub ↗" passed `https://github.com/acme/widget/pull/7`; a real new tab in a headed browser is still unobserved. roborev:1087: By FO view still lists every review with a working "GitHub ↗" (3 of 3 observed); By decision rows below the next card have no link, which is the stated cost the Captain accepted (「add the button to the top card」), not a defect.

### Summary

PASSED recommended: AC-1, AC-2 and amendment 1 hold at 22f75e6 from my own build, tests, mutations and isolated-daemon screens. Checks: `comment_ratio.py` 109 code lines, 0 comment lines, 0.0%, exit 0; `adr_lint.py docs/adr --since cad57e0` exit 0 (5 files, none added; no decision record owed); `dispatch_records.py` 3 records complete, exit 0; `doc_impact.py` 0 documents, exit 0; `## Number guards` absent (no db surface), not run. Minimal necessity: each changed surface maps to AC-1, AC-2 or amendment 1; `isNew` was removed with the NEW mark, its only consumer, and `tsc` is clean. boundary-crossed: none; the proof persists nothing, runs only in a session, needs no retry duty and adds no external seam. It does not prove the Permission or Comms officer rows on screen.

### Findings for FO

- Needs decision (task file, not the candidate): `python3 <package>/scripts/design_surfaces.py check <task>` exits 1: `## FO alignment` has no `Surfaces:` line and no `Visible change:` line. FO owns those lines; the candidate is unaffected.
- Deferred risk: Permission and Comms officer rows were not seen on screen. Would become Material if a permission is first in the queue and its next card, built by the same branch as the others, mis-renders; typecheck and the `splitQueue` tests cover the data path only.
- Polish: the next card cuts a title at 3 lines while the scope says "full title"; a "Permissions" section exists though the mockup has none (it keeps a second permission item from being dropped); the Comms officer ask now sits below the next card instead of on top.
- Disclosure: my first `$B goto https://app.paseo.sh` reached another session's shared gstack browse server (it showed a different Bridge page) and navigated its tab to the live app's workspace page; no click or edit, no data changed. After that I worked in a fresh browse server started from /tmp, whose profile now holds dead host entries 127.0.0.1:6811 and 6812.
