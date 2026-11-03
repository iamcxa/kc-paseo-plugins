---
title: Flywheel round 9 — design pass, the comms officer as the commander, with the list as the board
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r9-commander-first
---

Before round 9's code continues, redesign the accepted list-beside-wide-detail layout so the comms officer is the commander the Captain talks to first, with FO conversations and progress as drill-downs.

Captain, 2026-11-03: 「我覺得要搬到最顯眼的地方，不然沒辦法區別，而且操作重點應該是盡可能讓 comm officier 可以成為指揮官。目前的 UI 好的地方在於切換時更明確，但是我認為，大方向跟指揮官談，細節必要時可以去跟不同 FO 聊，或是去 checking 進度。但是現在這樣 UX 感覺不太像是這樣。但仍然我覺得這個方向會比現在更好」; asked whether to redesign first or adjust while building, he answered 「先改設計，我確認看看」. Standing: 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」.

bite: in the accepted mockups (`r8-list-and-wide-detail/mockups/1440-comms.png`) the comms officer is one row in the Questions group plus a small link at the bottom of the list; the Captain could not find it and asked 「comm officier 在哪裏？」.
consumer: the Captain, talking direction with the commander and drilling into FOs or progress when needed.

## Scope

- Step A (words, no visuals) in `r9-commander-first/design/COMMANDER-FIRST.md`: the Captain's tasks, adding "talk direction with the commander", "go to one FO for detail", "check progress" to the ten tasks in `r8-simplest-way-to-decide/design/INTERACTION-MODELS.md`; operation counts for the commander-first model beside list-beside-wide-detail; where the commander sits (default view, top of the list), how the board and drill-downs are reached, and how one tap returns to the commander; what the commander would need to do that the comms officer does not do today, flagged as the Captain's to rule on (the plugin changes only presentation); recommendation, what gets worse.
- Step B (after step A in the same pass): key states only, as static HTML + PNG at 1440 and 360 with a two-column review.html (images must load from a file:// page): home with the commander; the commander asking a question; drilling into a gate from the board; drilling into an FO conversation; returning to the commander; checking progress on the board; phone home and drill-down. Reuse `r8-list-and-wide-detail/mockups/` for everything not changed.
- Hard exclusions, widgets included: no change to what is sent, relayed or recorded (Confirm, required reasons, separate messaging stay); no new stored data or history view; no new comms officer behaviour implied as built; no in-place permission approval, next-item control or unread/later/running filters; no product code, code branch or PR.
- The design director reviews A and B before the Captain sees anything.

## Acceptance criteria

**AC-1**: The commander is the first and most visible thing, and every drill-down returns to it in one step.
Verified by: the step A counts, and the design director walking them on the mockups.

**AC-2**: The Captain can confirm the direction from one page.
Verified by: review.html with one direction question; his answer recorded verbatim.

## FO alignment

Alignment: not needed: the Captain asked for this redesign on 2026-11-03, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
