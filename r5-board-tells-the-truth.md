---
title: Flywheel round 5 — the board and the gate card show only what they have checked
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r5-board-tells-the-truth
gates:
    version: 1
    records:
        - id: gate:r5-board-tells-the-truth:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r5-board-tells-the-truth-backlog-1
              briefing:
                id: briefing:r5-board-tells-the-truth:backlog:attempt-1:revision-1
                digest: sha256:7d35cfd5e1cff33d579cd939b02f3cb64bf83efff111fdc2b104843054d78f7c
                room-ref: ./r5-board-tells-the-truth/review/backlog/briefing-1
---

Round 5 of the POC flywheel under ADR 0008: the board can say "Nothing is waiting on you" before it has loaded or after a fetch failed, comms-officer questions are missed unless the compact Comms tab is open, and a gate card shows a recorded decision as a red "Briefing error".

Captain, 2026-10-25, round 4 UAT option answer for the next round: 「看板說真話 (Recommended)」 (option text: 載入／失敗狀態，空畫面只在成功載入後出現；任何分頁都偵測得到通訊官問題); most bothersome, in his words: 「手機版的 layout 還不算是很好用，ux 也不算是很直覺，例如 <- Bridge 常常會誤按，因為左上跟左中有兩個完全一樣的按鈕」; and his Android screenshots (「補圖」) showing "Briefing error — This gate has no open briefing now." right after his decision was recorded.

bite: at 3d1f176c (PR #46, his live install), `reviews` starts as `[]` and `readReviews` failures are swallowed in `client/board.tsx`, so "Nothing is waiting on you" and "By decision · 0" show while loading or after a failure; question detection (`onAsk`) lives in the tab-mounted `CoChat`, so on the compact FOs tab a comms-officer question is not detected; `DecisionCard.load()` sends `briefingId` from a `briefing` that starts as `null`, so a card opened after the gate closed gets "This gate has no open briefing now." (chief-engineer reading, 2026-10-25); his screenshots show the card's "← Bridge" stacked under the host header's.
consumer: the Captain, deciding from the Bridge.

## Scope

- Board load and failure (chief-engineer): track loaded/failed per source — the FO list (`observeBoard`), gates, reviews and the comms-officer timeline; a source with nothing to fetch counts as loaded; a failure clears on the next success; the `readReviews` failure is shown. One pure function returns "Loading…", "Could not check <source> — this list may be incomplete", or "Nothing is waiting on you", and the toggle count uses it too. First confirm `observeBoard` sends a first snapshot when there are no FOs.
- Question detection on any tab: a `useCoAsk(coId)` hook in `client/bridge.tsx` takes over the timeline subscription, refetch, turn tracking and `nextStepIsCaptains`; the `onAsk` effect and prop leave `client/co-chat.tsx` (one writer). No hidden mounted `CoChat`. The round 3 draft store and the round 4 keyboard hook are not touched.
- Recorded decision is not an error: first confirm the cause on a closed relay gate. Then the server returns the latest resolution for that stage as `recorded` when no attempt is open (`findLatestResolution` beside `findResolution` in `shared/gate.ts`); a gate not open with nothing recorded shows a neutral "no longer open", not red; returning from a card that saw `recorded` refreshes gates once.
- Ride-along (chief-engineer, one string): the card's back control reads "← Queue" instead of "← Bridge"; the host header is untouched and the control stays.
- POC boundary: no persisted load/ask state or "last good" queue, no retry or backoff, no new background job or server cache, no workflow-state write from the card, no Paseo request.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): fourth stack layer on `spacedock-ensign/r4-phone-layout` at 3d1f176c; Draft PR with that base; nothing merges.
- Non-goals: the Gboard keyboard-height overlap, 320 px rows, the phone-tab case, keyboard-open tab switching, design-partner laters, briefing language, virtual office.

## Acceptance criteria

**AC-1**: The board never claims "nothing waiting" without having checked.
Verified by: tests of the empty-state function for loading, reviews failed, and all loaded and empty, failing when the old `queue.length === 0 && !coAsk` condition is restored; the toggle count uses the same function.

**AC-2**: A recorded decision shows as recorded.
Verified by: a `gate.test.mts` case where a closed attempt with a resolution, read without a `briefingId`, returns `recorded` and no error; a gate not open with nothing recorded shows a neutral state.

**AC-3**: A comms-officer question shows on either tab.
Verified by: a runtime check at compact width with the FOs tab shown: the comms officer asks, and the question row appears without opening the Comms tab.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 4 UAT; scope from chief-engineer triage recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
