---
title: Design — the Commander's periodic digest in its own words, with a replay of the FO originals behind each point
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d1-commander-digest
gates:
    version: 1
    records:
        - id: gate:d1-commander-digest:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d1-commander-digest-backlog-1
              briefing:
                id: briefing:d1-commander-digest:backlog:attempt-1:revision-1
                digest: sha256:f6f114ede6f122e5f40cfdab5f4d5d5e2883470b188335200f6e1778b4636363
                room-ref: ./d1-commander-digest/review/backlog/briefing-1
---

Design, before any code, the model the Captain chose: the comms officer (the Commander) collects every FO's progress on a schedule and tells him in its own words without pasting originals; each point opens a replay card with the Commander's sentence and the quoted FO originals, from which he can open the FO, keep discussing with the Commander, or reply with a new decision.

Captain, 2026-11-05: 「另外一種是，一樣 co 要批次，每輪格一陣子取得大家的進度，然後『換句話說』且不要夾帶原文給我，我如果想要看細節，應該是點 replay 打開 popup 看到 co 的話跟引用的 fo 原文，我也可以點連結打開 fo 對話，或是選擇留在 co 那邊，就手邊的細節繼續討論，或是直接回覆新的決定，你覺得哪個更好？」; asked 「照第二種開設計任務嗎？」, he answered 「好」. Earlier the same day on the per-FO replay demo: 「我覺得看起來怪怪的，太複雜了。不是新模式不好，是整體就是太複雜了」. Standing: 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」 (2026-10-28).

bite: the Commander conversation is linear while topics interleave; a filtered replay built by inference afterwards was too complex (demo in /tmp, 2026-11-05: 23% of entries attributable exactly, 36% only by inference).
consumer: the Captain, reading the Commander's digest between other work and drilling into one point when needed.

## Scope

- Step A (words, no visuals) in `d1-commander-digest/design/DIGEST.md`:
  - where the Commander's behaviour is defined today (Bridge `server/coordinator.ts`, COORDINATOR_PROMPT, and its tools in `server/fleet-mcp.ts`) and what it would change to: a scheduled collection (by which existing Paseo mechanism — heartbeat, schedule, or the Bridge's own poll), a digest in the Commander's words, and a source reference on each point that the Bridge can read exactly (message or timeline ids, not inference);
  - the cost of one collection per FO and per round: how to measure it, and a measured number only if one is measured;
  - the Captain's tasks (read the digest; open a point's replay; open the FO; keep discussing a point with the Commander; reply with a new decision) with operation counts, and the simplest interaction that covers them;
  - what stays unchanged: gate decisions still go through the existing Confirm and recording path; no in-place permission approval;
  - open questions for the Captain, and what gets worse.
- Step B (after the design director approves step A): one mockup direction as static HTML + PNG at 1440 and 360 with a two-column review.html whose images load from a file:// page: the digest in the Commander conversation, the replay card with the Commander's sentence and the quoted FO originals, its three choices, and the phone sheet.
Non-goals: inferred attribution; filters, modes or per-FO counts in the Commander conversation; changing gate decision or recording semantics; any code, branch or PR in this task.
Budget: one design task; at most two design-director passes per step before the Captain sees it.
Stop condition: the design director unsatisfied twice on a step, or any proposal that changes the Commander's behaviour, its schedule or its cost — those are the Captain's to approve before code.

## Acceptance criteria

**AC-1**: Every point in the digest can show its exact sources.
Verified by: DIGEST.md names the source reference the Commander would emit and how the Bridge reads it with the plugin SDK (symbols), checked by the design director.

**AC-2**: The Captain can judge the direction in a few minutes.
Verified by: one page for step A and review.html for step B; his answers recorded verbatim.

## FO alignment

Alignment: not needed: the Captain chose this model and asked for the design task on 2026-11-05.
Release review: not needed: spacedock-bridge has no journey map yet.
