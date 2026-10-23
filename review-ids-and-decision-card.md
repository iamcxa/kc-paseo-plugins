---
title: Review items show repo#number with a link, and the decision card puts the decision before the discussion
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
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
