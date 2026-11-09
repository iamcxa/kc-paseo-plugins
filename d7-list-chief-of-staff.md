---
title: Build the list chief of staff — an accumulated list with her recommendations in her conversation, no new UI
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d7-list-chief-of-staff
status: implementation
gates:
    version: 1
    records:
        - id: gate:d7-list-chief-of-staff:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d7-list-chief-of-staff-backlog-1
              briefing:
                id: briefing:d7-list-chief-of-staff:backlog:attempt-1:revision-1
                digest: sha256:458519a80718e4ec9c36a566e66b576069d5a94ebfe3f66a31ac069bb1c33594
                room-ref: ./d7-list-chief-of-staff/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d7-list-chief-of-staff:backlog:1
                briefing: briefing:d7-list-chief-of-staff:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-09T07:29:43.534362Z"
                decision: approve
                reason: 'Captain chat 2026-11-09, asked 「要開這個任務嗎？」 (the list chief of staff on PR #77''s backend, card UI removed, her prompt rewritten, render_ui allowed, one real call after the limit resets), answered 「好」.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-09T07:30:24Z
worktree: .worktrees/spacedock-ensign-d7-list-chief-of-staff
---

Rebuild the chief of staff as a conversation, without new screens: she keeps one accumulated list of what waits on the Captain — who raised it, her recommended decision and her reason — adds to it until he responds, then asks whether to take all her recommendations or review item by item; before sending a batch she shows him exactly what goes where, in whatever widget suits her, and sends only on his explicit confirmation.

Captain, 2026-11-09, at the d6-chief-batch-on-phone design gate: 「我覺得方向對，但是太複雜了，是不是先不要套 ＵＩ先這樣：幕僚長維護一個 list，這個清單就是累積的問題，誰提的，與幕僚長的的建議決策及理由（這個你也做過，其他 fo 也做過），如果一直有就一直加，直到我回應，那這時候幕僚長就問是要全照建議，還是一題題開始審？這時候再考慮納入 UI 做最佳化解讀，因為有些人有裝 paseo genui plugin (例如我）可以做更好的視覺化呈現，但是一開始用那種卡片形式我覺得反而不好，因為我不能一次總覽全部，再一題題深入探討，但有些時候不必深入，就按建議就好，也可能擠提建議幾題探討」; asked whether 「全照建議」 covers gates: 「算，但是這裡我希望可以跳出一個特殊 UI 讓我 double check，或是你提更好的做法」; on the double check: 「我覺得不用這樣麻煩，就是寫成讓幕僚長自己找到最合適的 ui widget 使用即可，只要寫上目的，讓她自己判斷？」; asked whether to open this code task on PR #77's backend: 「好」.

bite: away from his desk he cannot answer many FO sessions one by one, so FOs wait (his words 2026-11-09); card UIs hid the overview he needs.
consumer: the Captain, reading her list after Paseo's push and answering it in one reply or item by item.

## Scope

- Stack on Draft PR #77 (branch spacedock-ensign/d5-chief-of-staff-build at f40c340e8204f4b7dddef238f215aea3f3a6eaab). Keep its backend: board readers, the shared rule for what waits on the Captain (amendment 3 of d5), the trigger shadow-tested twice on his live board, the comms officer switch, the projected timeline reader. Remove the client UI added for the chief of staff (focus cards, red pulsing badge, sound, per-item controls, digest leftovers) where nothing else uses it.
- Her prompt: maintain one accumulated list from board facts only — item, who raised it, waiting time, her recommended decision and reason; keep adding until the Captain responds; when he responds, ask whether to take all recommendations, review item by item, or discuss some; 「全照建議」 includes gates; before relaying a batch, show him exactly what each FO will receive and wait for his explicit confirmation, using the most suitable widget available to her (Paseo's render_ui if present, otherwise text); relay each item with his words and the item's recommendation so each FO records his decision; permissions are never decided by her.
- Allow mcp__paseo__render_ui in her tools.
- When the trigger fires, she posts the updated list so Paseo pushes; no new notification channel.
Non-goals: new Bridge screens or cards; approving permissions; enforcing the confirmation step in code (prompt-level in this POC, watched in his trial); merging any PR; findings 13, 15 and 16 of d5 (deferred).
Budget: one implementation task stacked on PR #77; at most two repair cycles before the Captain sees it.
Stop condition: the real model run shows she relays a gate decision before his explicit confirmation, or render_ui is unavailable to her as an agent — stop and report.

## Acceptance criteria

**AC-1**: Her list carries each waiting item with who raised it, her recommendation and reason, from board facts only, and grows until he responds.
Verified by: tests on the list input she receives (only items the shared rule says wait on him; FO-owned and old items excluded) and one real model run on an isolated real daemon with fictional board sources showing the list.

**AC-2**: Nothing reaches an FO before his explicit confirmation of what will be sent.
Verified by: the same real run — 「全照建議」 produces a what-will-be-sent view and no relay; an explicit confirmation produces one relay per item with his words; a permission item is not decided.

**AC-3**: The removed UI is gone and the kept backend still works.
Verified by: no chief-of-staff cards, badge pulse or sound remain; the backend tests from PR #77 still pass.

UI proposal: no new Bridge screens; the list and the what-will-be-sent view live in her conversation, as text or a render_ui widget of her choosing; the d4 chief-of-staff cards and badge are removed.
Preview: d4-chief-of-staff/mockups/review.html

## FO alignment

Alignment: not needed: the Captain set the model and approved this task on 2026-11-09 (quoted in the seed).
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: the chief-of-staff cards, red pulsing badge and sound are removed; her conversation shows the accumulated list and, before a batch is sent, a what-will-be-sent view in the widget she chooses.
