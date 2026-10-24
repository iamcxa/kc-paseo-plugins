---
title: Flywheel round 3 — a reply shows where it goes, and an unfinished draft survives switching items or tabs
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r3-reply-clear-and-safe
gates:
    version: 1
    records:
        - id: gate:r3-reply-clear-and-safe:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r3-reply-clear-and-safe-backlog-1
              briefing:
                id: briefing:r3-reply-clear-and-safe:backlog:attempt-1:revision-1
                digest: sha256:571e6bcca15d79dade79898c2bb0fa42af0f1d23d7972fb3edd31183533f9247
                room-ref: ./r3-reply-clear-and-safe/review/backlog/briefing-1
---

Round 3 of the POC flywheel under ADR 0008: the Captain chose 「回覆清楚又安全」 — the composer should say where a reply goes, and a half-typed reply should not vanish when he opens another item, goes back, or switches tabs.

Captain, 2026-10-24, round 2 UAT option answer for the next round: 「回覆清楚又安全」 (option text: 看得出回覆送給誰；打到一半的內容不會不見). Earlier picky-user findings it answers: "One reply box has two different meanings" and "Checking another item loses my unfinished reply" (round 1 triage, `_l3-dogfood/rounds.md`).

bite: at e91b9755 (PR #40, the Captain's live install), each `CoChat` holds its draft in component state; opening a gate card and pressing back unmounts that card's chat and drops its draft; in the compact layout switching tabs unmounts the comms officer chat; `Bridge`'s `onAskCo` seed replaces a non-empty comms officer draft; the ↑ button does not say it sends to the FO while the chips go through the comms officer (chief-engineer reading of `client/co-chat.tsx`, `client/bridge.tsx`, `client/decision-card.tsx`, 2026-10-24).
consumer: the Captain, replying and deciding from the Bridge.

## Scope

- Draft store: a module-level in-memory `Map` (like `sentByBriefing` in `client/decision-card.tsx`), keyed by `agentId` plus gate `slug:stage`, or `agentId` alone without a gate; not keyed by briefing id (a new briefing keeps the draft, as `beforeSend` promises). `CoChat` starts from the stored draft and updates it on every keystroke; the entry clears where `composerHandlers` already clears the draft (successful send or decision) and stays on a refused one.
- The comms officer seed (`onAskCo` prefill) keeps an existing non-empty draft instead of replacing it.
- Labels: beside ↑, that it sends to the FO by name (e.g. "↑ sends to <FO name>"); the decision row keeps "Decide via comms officer". Decision logic (`decideGate`, claim/release, relay text) is unchanged.
- POC boundary: drafts in memory only — no localStorage/AsyncStorage, server call or file; a plugin or app reload drops them, a stated known limit.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): second stack layer, branch based on `spacedock-ensign/fleet-hides-closed-fos` at e91b9755, Draft PR with that branch as base; nothing merges.
- Non-goals (chief-engineer): moving question detection (`onAsk`) or the timeline out of `CoChat`, board loading/error states (board-trust round); phone-tab case, two-line names, 320 px rows, briefing language, virtual office.

## Acceptance criteria

**AC-1**: Drafts are kept per target and never leak.
Verified by: `npm test` with store tests: a draft for gate A is not seen for gate B or another FO; a draft survives a simulated remount; it clears after a successful send or decision and stays after a refused one; the seed does not overwrite a non-empty draft; `npm run typecheck`.

**AC-2**: The Captain can see where a reply goes, and drafts survive in the screens.
Verified by: isolated-daemon walk with screenshots: wide layout — type in gate A, back, open gate B (empty), return to A (draft present); compact layout — type in each tab, switch, both present; the ↑ label names the FO and the decision row names the comms officer.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 2 UAT; scope from chief-engineer triage recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
