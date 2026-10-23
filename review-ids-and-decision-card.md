---
title: Review items show repo#number with a link, and the decision card puts the decision before the discussion
status: validation
variant: kc-dev-flow-2
profile: poc
merge: pr
gates:
    version: 1
    records:
        - id: gate:review-ids-and-decision-card:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:review-ids-and-decision-card-backlog-1
              briefing:
                id: briefing:review-ids-and-decision-card:backlog:attempt-1:revision-1
                digest: sha256:abdd2bba433af1d1ca93297ca521f73aec84b05f0fa56cd94867da7fbabe3633
                room-ref: ./review-ids-and-decision-card/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:review-ids-and-decision-card:backlog:1
                briefing: briefing:review-ids-and-decision-card:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T09:06:58.807587Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the backlog gate review for briefing attempt-1 (sha256:abdd2bba433a): approve to enter implementation in an isolated worktree with a PR.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-23T09:07:35Z
worktree: .worktrees/spacedock-ensign-review-ids-and-decision-card
---

The Captain cannot tell which repository and pull request a review item is, a second review request has no link, and the decision card he opens from the board makes him read the FO's conversation and a three-line instruction note before he can decide.

Captain, 2026-10-23: 「是不錯，但是這個 PR 應該要寫編號以及哪個 repo，例如 repo_name#123。以及，如果有第二個 PR 會是怎樣？還有，點進去的頁面應該也要 polish 一下」. On the composer: 「我覺得截圖二，就是第四欄的設計少考慮本來就有的送出按鈕，應該維持一樣體驗，但可以考慮把決策按鈕搬到送出按鈕的左側，合理嗎？甚至讓整個對話框重新設計，維持 paseo 風格」. After seeing the composer mockup and the send-and-decide table: 「對，這樣比較好」 and 「可以」.

bite: on 2026-10-23 the Captain's live board showed a review next card with only a title, an FO name and "PR ↗" (no repository or number); review rows below the next card carry no PR link (roborev:1087, accepted cost on PR #32); and the decision card shows a breadcrumb with the FO's model name, a three-line grey note, then the full FO chat before the decision chips.
consumer: the Captain, deciding from the Bridge screen.

## Scope

- Work in `spacedock-bridge/` (merged PR #31, #32). Design references, copied into this task's `design/` folder: `board-and-card.png` (columns 2 and 4 are the chosen board and card) and `composer.png` (the chosen composer, which replaces column 4's bottom part).
- Board, review items:
  - The review next card shows `<repo>#<number> ↗` on a line above the title; tapping that line opens the PR (`openExternalUrl`) and replaces the separate "PR ↗" button. The owning FO's title stays below the title. Add the repository owner only when two items share a repository name.
  - Each row under Reviews shows `<repo>#<number>` before the title (the title truncates first) and a separate ↗ target that opens the PR; the row's own tap is unchanged. Review rows drop the wait time; gate and question rows keep theirs.
- Decision card, top part:
  - One small label line `<KIND> · <stage> · <repo label>` replaces the breadcrumb; the FO's title (without its model name) and the wait time go on a quieter line under the question.
  - The question, the existing summaries and "Read full briefing" stay; the three-line note becomes one short hint beside that link ("preview · full view in Spacedock Review").
- Decision card, discussion: a "Discussion" divider, then only the FO's latest message, with "Show N earlier messages" revealing the rest.
- Composer (Paseo style, as in `composer.png`): the same bordered box with the round ↑ send button inside; ↑ and Enter send to the FO as today. The bottom row inside the box holds "Decide via comms officer" and 准 / 要求修改 / 暫緩 on the left, a thin divider, and ↑ on the right. 要求修改 and 暫緩 show a dashed border while the box is empty. When the box has text, one short line appears inside it saying a decision button sends this text as the reason. Decision relay, reason rules and delivery states are unchanged.
- Non-goals: changing how decisions are relayed or recorded; the By FO view; the phone layout; host detection for "PR"/"MR".

## Acceptance criteria

**AC-1**: Review items show which PR they are and open it.
Verified by: a screenshot from an isolated Paseo daemon with two review requests (one as the next card, one as a row), showing `<repo>#<number>` on both, and a test or a stubbed-open check that each ↗ passes that item's URL.

**AC-2**: The decision card shows the decision before the discussion.
Verified by: a screenshot of a gate decision card showing the label line, question, FO line, summary, "Read full briefing" with the one-line hint, the Discussion divider with only the latest message and a "Show N earlier messages" control.

**AC-3**: The composer keeps one send path and holds the decisions.
Verified by: a screenshot of the empty and the typed composer; `npm test` with tests that Enter and ↑ still send to the FO, that 要求修改 and 暫緩 still require a reason, and that a decision chip still sends the typed text as the reason; existing tests pass.

## FO alignment

Alignment: not needed: the Captain chose the board, the card and the composer from mockups himself on 2026-10-23.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- DONE: Review next card and review rows show repo#number with a working ↗ PR link, with an isolated-daemon screenshot of two review requests and a test or stubbed-open check of each URL (AC-1)
  Draft PR #34, head aaade9a. `evidence/ac1-board-two-reviews.png` (next card `gadget#41 ↗`, row `widget#7` + ↗). On screen with `window.open` stubbed: the two ↗ passed `https://github.com/acme/gadget/pull/41` and `.../widget/pull/7`. Test "each review item carries its own repo#number and URL" fails when one item's link points at another's URL (mutation run).
- DONE: The decision card shows label line, question, FO line, summary and Read full briefing with a one-line hint, then a Discussion divider with only the latest message and Show N earlier messages, with a screenshot (AC-2)
  `evidence/ac2-decision-card.png` (and `ac2-discussion-expanded.png`): `GATE · BACKLOG · OMP-TRIAL`, question, `OMP trial FO · waiting 18m`, summary, "Read full briefing ›" + hint, DISCUSSION, "Show 9 earlier messages", latest FO message. `discussionWindow` tests fail if it never collapses.
- DONE: The Paseo-style composer keeps ↑/Enter to the FO and holds the decision chips left of ↑, with tests for the three send paths and screenshots empty and typed (AC-3); roborev gate run with its evidence= or incomplete: line, and a Draft PR open
  Screenshots `ac3-composer-empty.png` (dashed 要求修改/暫緩), `ac3-composer-typed.png` (hint line, ↑ active), `ac3-reason-required.png`. `npm test` 66 pass (base 44), typecheck clean. Tests: `composer.test.mts` (Enter, ↑ with footer, Shift+Enter/IME/empty no-send, chip passes typed text), `decide.test.mts` (要求修改/暫緩 refuse an empty reason before any claim, chip sends typed text as the reason, repeat refused, failed send releases claim). Each fails under its mutation (reason check removed, send on any key, footer dropped). roborev: `evidence=roborev:1097` (clean on aaade9a45); the earlier `roborev:1096` Low (attachGates dropped preparedAt) was real and fixed in aaade9a with a test. PR https://github.com/iamcxa/kc-paseo-plugins/pull/34 (Draft).

### Summary

Built on 3 commits (75c2558, 54c1b21, aaade9a) on spacedock-ensign/review-ids-and-decision-card; send/chip/decision logic moved into `shared/composer.ts` and `shared/decide.ts` with injected ports so the three send paths are testable, relay text and claim/release unchanged. comment_ratio: 417 code lines, 5 comment lines, 1.2%, exit 0; doc_impact: 0 documents; no db surface, no ADR, number guards not applicable; profile poc, boundary-crossed: none, cleanup done (isolated daemon on 6840 stopped, its home, browser profile and scripts deleted; the live `~/.paseo` and the source checkout untouched).

### Findings for FO

- `design_surfaces.py check` exits 1 on the FO section: "'## FO alignment' needs a non-empty 'Surfaces:' line" and "needs a 'Visible change:' line". I did not edit the FO section.
- Limits: Enter/↑ are proven by handler tests, not by sending to a live FO, and the on-screen decision relay was not run (no Claude login in the isolated HOME). The app in my headless browser auto-registered the live daemon (localhost:6767) as a host on its own; I took no action against it (board URL only for my server id).
- Behaviour change beyond scope text: gate wait time on the board queue now uses `preparedAt` (the intended source) because of the attachGates fix.
