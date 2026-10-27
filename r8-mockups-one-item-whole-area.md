---
title: Flywheel round 8 — design round step 2, mockups of one item using the whole Bridge area
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r8-mockups-one-item-whole-area
gates:
    version: 1
    records:
        - id: gate:r8-mockups-one-item-whole-area:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r8-mockups-one-item-whole-area-backlog-1
              briefing:
                id: briefing:r8-mockups-one-item-whole-area:backlog:attempt-1:revision-1
                digest: sha256:5e5dac0afd3f1a27cbac1bee60c69540d9bfa55081d239e1dad38feb6fb655dd
                room-ref: ./r8-mockups-one-item-whole-area/review/backlog/briefing-1
---

Step 2 of the round 8 design round: draw one mockup direction of the interaction model the Captain picked, so he can say go before any code is written.

Captain, 2026-10-28: on the round form 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」; asked 「第 8 輪設計稿要用哪種操作方式？」, answered 「單件全區 (Recommended)」; in round 7 UAT, on the decision buttons 「按鈕是變大沒錯，但是在電腦上太大了，而且跟送出對話訊息的按鈕大小不協調，我覺得不好」 and most bothersome 「桌面決定區太窄」.

bite: the chosen model (`r8-simplest-way-to-decide/design/INTERACTION-MODELS.md`, accepted 2026-10-28) gives one item the whole Bridge area, but nothing yet shows the Captain what that looks like on desktop and phone, and round 7's oversized desktop buttons came from deciding sizes in code before he saw them.
consumer: the Captain, saying go (or not) on the look before any code.

## Scope

- One direction only, of the chosen model "one item uses the whole Bridge area, back to the list after", as self-contained static HTML with fictional data and one PNG per state, in `r8-mockups-one-item-whole-area/mockups/`, led by `index.html` and `REVIEW.md` (one heading per state, its HTML and PNG, one question each).
- States at 1440×1000 desktop and 360×780 phone: the queue (list) view; one gate opened using the whole area (briefing, conversation with its scope label, message box and send, decision controls); a decision chosen with its reason field (empty required reason, and typed); after Confirm (sent/relayed, then recorded); returning to the list. Decision controls in proportion with the message send button on desktop and large enough to tap on phone (his round 7 words); Paseo's existing look as the base (`_l3-dogfood/walks/round-7/screenshots/`).
- Hard exclusions, widgets included: no "next item" control; no new data, storage or history view; no change to what is sent, relayed or recorded (Confirm, required reasons and separate messaging stay as built in round 7); no product code, code branch or PR.
- The designer lists its own assumptions; the design director reviews before the Captain sees anything, and tells capture artifacts from design.

## Acceptance criteria

**AC-1**: The mockups show the chosen model and nothing it excluded.
Verified by: the design director checks every state against INTERACTION-MODELS.md and the exclusions above, and the operation counts of the model's table can be walked on the mockups.

**AC-2**: The Captain can judge it in a few minutes.
Verified by: REVIEW.md lists each state with its PNG and one question; the Captain's go or his changes are recorded verbatim.

## FO alignment

Alignment: not needed: the Captain chose the design-round form and the model on 2026-10-28; approach from the qnow FO's mode B lessons recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
