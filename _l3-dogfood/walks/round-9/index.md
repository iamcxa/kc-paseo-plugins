# Round 9 whole-product screenshot walk

Build: `/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge` at `224b03f2da6eefc89d7a055ac95be2d858eaa5c5`.

46 PNGs: 22 desktop screenshots at 1440×1000 and 24 phone-layout screenshots at 360×780. Each file is a single viewport capture; long lists are intentionally scrolled for the named state.

The supplied round 9 `combined_capture.py` and the cleanup/source-identity checks in `acceptance.py` were reused in a disposable harness. Product rendering comes from the pinned build; synthetic First Officers, gates, reviews, conversations, source failures, and loading responses are injected at SDK/RPC boundaries. The true-empty fixture supplies no current First Officers, reviews, gates, or Commander question; any desktop Commander exchange is prior synthetic conversation.

Confirm was pressed in the product UI against the synthetic SDK. Relay and recorded responses were then advanced through synthetic timeline and gate-record fixtures bound to that submitted decision. These screenshots show those UI states, not live relay, provider activity, or durable workflow recording. Phone images are browser viewports, not physical-device captures.

Captures ran one at a time with private HOME/daemon homes, fresh browser profiles with localhost blocked, and temporary ports outside 6767, 6787, and 6860–6935. Captured daemon PIDs were stopped, their ports checked closed, and their private homes removed. All 82 source-file hashes still match the pinned read-only build. No product code, branch, pull request, workflow entity, or live configuration was changed.

## Screenshots

### 1440×1000

- [screenshots/1440-commander-home.png](screenshots/1440-commander-home.png) — 1440×1000 — Commander home with example command exchange — Commander is selected; the Captain prioritizes the retry proof and the synthetic comms officer replies; the message composer is visible.
- [screenshots/1440-commander-question.png](screenshots/1440-commander-question.png) — 1440×1000 — Commander asks a question — The Commander asks whether to request more detail from Demo FO (First Officer); the question and its waiting status are visible.
- [screenshots/1440-board-by-decision.png](screenshots/1440-board-by-decision.png) — 1440×1000 — Board grouped By decision — By decision is selected; category groups, Your turn markers, and counted filters are visible; the list continues below the viewport.
- [screenshots/1440-board-filter-gates.png](screenshots/1440-board-filter-gates.png) — 1440×1000 — Board filtered to gates — Gates filter is selected with its count; only the two synthetic gate rows remain in the decision list.
- [screenshots/1440-board-by-fo-no-waiting.png](screenshots/1440-board-by-fo-no-waiting.png) — 1440×1000 — Board grouped By FO, including no waiting work — The By FO list is scrolled to Research FO, whose row shows 0 waiting; other First Officers and their work remain grouped above.
- [screenshots/1440-fo-no-waiting-conversation.png](screenshots/1440-fo-no-waiting-conversation.png) — 1440×1000 — Conversation with an FO that has nothing waiting — Research FO conversation shows its synthetic research note and a direct message composer, without a gate decision.
- [screenshots/1440-fo-one-step-return.png](screenshots/1440-fo-one-step-return.png) — 1440×1000 — One-step return from an idle FO to Commander — After one Back to Commander press from Research FO, the Commander question, conversation, and own composer are visible again.
- [screenshots/1440-gate-open.png](screenshots/1440-gate-open.png) — 1440×1000 — Open gate detail — The selected retry-proof gate shows its question, attributed First Officer, evidence summary, conversation, decision chips, and direct message composer.
- [screenshots/1440-decision-reason-empty.png](screenshots/1440-decision-reason-empty.png) — 1440×1000 — Decision chosen, required reason empty — The request-changes choice is selected; its required reason is empty and Confirm is disabled.
- [screenshots/1440-decision-reason-typed.png](screenshots/1440-decision-reason-typed.png) — 1440×1000 — Decision chosen, reason typed — The request-changes reason contains Keep the failure visible; Confirm and Cancel are shown beside the separate conversation composer.
- [screenshots/1440-decision-sent.png](screenshots/1440-decision-sent.png) — 1440×1000 — After Confirm: sent — The real Confirm control has been pressed against the synthetic SDK; Sent to the comms officer is shown, with the chosen decision and words.
- [screenshots/1440-decision-relayed.png](screenshots/1440-decision-relayed.png) — 1440×1000 — After Confirm: relayed — The synthetic First Officer canonical timeline contains the sent decision identifier; the reopened detail says Relayed to Demo FO and waits for its record.
- [screenshots/1440-decision-recorded.png](screenshots/1440-decision-recorded.png) — 1440×1000 — After Confirm: recorded — The synthetic gate record carries the same decision identifier and words; detail shows Recorded: revise and the retained gate summary.
- [screenshots/1440-done-this-session.png](screenshots/1440-done-this-session.png) — 1440×1000 — Done this session list — The board is scrolled to Done this session; the completed retry-proof gate has a Done marker and remains available to open.
- [screenshots/1440-done-this-session-reopened.png](screenshots/1440-done-this-session-reopened.png) — 1440×1000 — Done this session reopened — The completed gate has been reopened from the board; its recorded result, original retained summary, and attributed conversation remain visible.
- [screenshots/1440-fo-conversation.png](screenshots/1440-fo-conversation.png) — 1440×1000 — First Officer conversation drill-down — The Demo FO question opens its attributed conversation, with the Commander, Board, and Queue return controls visible.
- [screenshots/1440-return-commander.png](screenshots/1440-return-commander.png) — 1440×1000 — One-step return from question conversation to Commander — One Back to Commander press returns from Demo FO to the Commander question, conversation, and Commander composer.
- [screenshots/1440-source-failed-conversation.png](screenshots/1440-source-failed-conversation.png) — 1440×1000 — Failed Commander source, conversation — The Commander conversation displays the synthetic source-unavailable error and a Retry conversation control.
- [screenshots/1440-source-failed-board.png](screenshots/1440-source-failed-board.png) — 1440×1000 — Failed Commander source, board — The board warns that the comms officer could not be checked and the list may be incomplete; uncertain counts and Check again are shown.
- [screenshots/1440-loading-conversation.png](screenshots/1440-loading-conversation.png) — 1440×1000 — Commander conversation loading — The unresolved synthetic source keeps Loading conversation with Comms officer visible with Retry conversation.
- [screenshots/1440-loading-board.png](screenshots/1440-loading-board.png) — 1440×1000 — Board with a loading source — The board shows Loading and partial counts while the Commander source remains unresolved, rather than claiming an empty result.
- [screenshots/1440-empty-board.png](screenshots/1440-empty-board.png) — 1440×1000 — Truly empty board — All current synthetic First Officer, gate, review, and Commander-question results are empty and loaded; counts are zero and Nothing is waiting on you is visible.

### 360×780

- [screenshots/360-commander-home.png](screenshots/360-commander-home.png) — 360×780 — Commander home with example command exchange — Commander is selected; the Captain prioritizes the retry proof and the synthetic comms officer replies; the message composer is visible.
- [screenshots/360-commander-question.png](screenshots/360-commander-question.png) — 360×780 — Commander asks a question — The Commander asks whether to request more detail from Demo FO (First Officer); the question and its waiting status are visible.
- [screenshots/360-board-by-decision.png](screenshots/360-board-by-decision.png) — 360×780 — Board grouped By decision — By decision is selected; category groups, Your turn markers, and counted filters are visible; the list continues below the viewport.
- [screenshots/360-board-filter-gates.png](screenshots/360-board-filter-gates.png) — 360×780 — Board filtered to gates — Gates filter is selected with its count; only the two synthetic gate rows remain in the decision list.
- [screenshots/360-board-by-fo-no-waiting.png](screenshots/360-board-by-fo-no-waiting.png) — 360×780 — Board grouped By FO, including no waiting work — The By FO list is scrolled to Research FO, whose row shows 0 waiting; other First Officers and their work remain grouped above.
- [screenshots/360-fo-no-waiting-conversation.png](screenshots/360-fo-no-waiting-conversation.png) — 360×780 — Conversation with an FO that has nothing waiting — Research FO conversation shows its synthetic research note and a direct message composer, without a gate decision.
- [screenshots/360-fo-one-step-return.png](screenshots/360-fo-one-step-return.png) — 360×780 — One-step return from an idle FO to Commander — After one Back to Commander press from Research FO, the Commander question, conversation, and own composer are visible again.
- [screenshots/360-gate-open.png](screenshots/360-gate-open.png) — 360×780 — Open gate detail — The selected retry-proof gate shows its question, attributed First Officer, evidence summary, conversation, decision chips, and direct message composer.
- [screenshots/360-decision-reason-empty.png](screenshots/360-decision-reason-empty.png) — 360×780 — Decision chosen, required reason empty — The request-changes choice is selected; its required reason is empty and Confirm is disabled.
- [screenshots/360-decision-reason-typed.png](screenshots/360-decision-reason-typed.png) — 360×780 — Decision chosen, reason typed — The request-changes reason contains Keep the failure visible; Confirm and Cancel are shown beside the separate conversation composer.
- [screenshots/360-decision-sent.png](screenshots/360-decision-sent.png) — 360×780 — After Confirm: sent — The real Confirm control has been pressed against the synthetic SDK; Sent to the comms officer is shown, with the chosen decision and words.
- [screenshots/360-decision-relayed.png](screenshots/360-decision-relayed.png) — 360×780 — After Confirm: relayed — The synthetic First Officer canonical timeline contains the sent decision identifier; the reopened detail says Relayed to Demo FO and waits for its record.
- [screenshots/360-decision-recorded.png](screenshots/360-decision-recorded.png) — 360×780 — After Confirm: recorded — The synthetic gate record carries the same decision identifier and words; detail shows Recorded: revise and the retained gate summary.
- [screenshots/360-done-this-session.png](screenshots/360-done-this-session.png) — 360×780 — Done this session list — The board is scrolled to Done this session; the completed retry-proof gate has a Done marker and remains available to open.
- [screenshots/360-done-this-session-reopened.png](screenshots/360-done-this-session-reopened.png) — 360×780 — Done this session reopened — The completed gate has been reopened from the board; its recorded result, original retained summary, and attributed conversation remain visible.
- [screenshots/360-fo-conversation.png](screenshots/360-fo-conversation.png) — 360×780 — First Officer conversation drill-down — The Demo FO question opens its attributed conversation, with the Commander, Board, and Queue return controls visible.
- [screenshots/360-return-commander.png](screenshots/360-return-commander.png) — 360×780 — One-step return from question conversation to Commander — One Back to Commander press returns from Demo FO to the Commander question, conversation, and Commander composer.
- [screenshots/360-source-failed-conversation.png](screenshots/360-source-failed-conversation.png) — 360×780 — Failed Commander source, conversation — The Commander conversation displays the synthetic source-unavailable error and a Retry conversation control.
- [screenshots/360-source-failed-board.png](screenshots/360-source-failed-board.png) — 360×780 — Failed Commander source, board — The board warns that the comms officer could not be checked and the list may be incomplete; uncertain counts and Check again are shown.
- [screenshots/360-loading-conversation.png](screenshots/360-loading-conversation.png) — 360×780 — Commander conversation loading — The unresolved synthetic source keeps Loading conversation with Comms officer visible with Retry conversation.
- [screenshots/360-loading-board.png](screenshots/360-loading-board.png) — 360×780 — Board with a loading source — The board shows Loading and partial counts while the Commander source remains unresolved, rather than claiming an empty result.
- [screenshots/360-empty-board.png](screenshots/360-empty-board.png) — 360×780 — Truly empty board — All current synthetic First Officer, gate, review, and Commander-question results are empty and loaded; counts are zero and Nothing is waiting on you is visible.
- [screenshots/360-phone-board-button.png](screenshots/360-phone-board-button.png) — 360×780 — Phone Board button — Compact Commander home shows the Board button at the top right, the example exchange, and the Commander message composer.
- [screenshots/360-phone-drill-down.png](screenshots/360-phone-drill-down.png) — 360×780 — Phone board-to-gate drill-down — After pressing Board and selecting the retry-proof gate, the compact gate detail fills the viewport, with Commander/Board return controls and the decision composer.

## Not captured

None of the requested plugin states was omitted. The wide gate detail is the desktop capture; the corresponding phone capture uses the build’s compact layout.
