---
title: Flywheel round 8 — design round step 1, the simplest way for the Captain to decide (interaction models, no visuals)
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r8-simplest-way-to-decide
gates:
    version: 1
    records:
        - id: gate:r8-simplest-way-to-decide:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r8-simplest-way-to-decide-backlog-1
              briefing:
                id: briefing:r8-simplest-way-to-decide:backlog:attempt-1:revision-1
                digest: sha256:35e4a6acac237f064ae8e8de77df90557d4d6c4f4aefbb73bf94db43b7129a08
                room-ref: ./r8-simplest-way-to-decide/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r8-simplest-way-to-decide:backlog:1
                briefing: briefing:r8-simplest-way-to-decide:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-27T18:42:18.000406Z"
                decision: approve
                reason: 'Accepts direction: the Captain chose this design-round form on 2026-10-28 and asked for the simplest UX before any UI work; step 1 has no visuals, no product code and no PR.'
                conn:
                    quote: 可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進
                    source: 'Captain chat 2026-10-28, answering 「第 8 輪照上面的方式改成設計稿回合、主題用這兩個回饋，可以嗎？」; flywheel grant ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
---

Round 8 of the POC flywheel under ADR 0008 is a design round with no product code: before any mockup, find the simplest usable way for the Captain to do his deciding tasks in the Bridge, on desktop and on phone.

Captain, 2026-10-28, round 7 UAT: most bothersome 「桌面決定區太窄」; on the phone-sized decision buttons 「按鈕是變大沒錯，但是在電腦上太大了，而且跟送出對話訊息的按鈕大小不協調，我覺得不好」; next 「我想先做設計稿先不要動手改，問一下 qnow fo 的方式，飛輪不先動手先做滿設計，節省實做錯方向的時間」. On the round form, asked 「第 8 輪照上面的方式改成設計稿回合、主題用這兩個回饋，可以嗎？」, he answered 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」.

bite: rounds 5–7 each built a UI change and then found in UAT or the next walk that the layout around it was wrong (round 7: decision controls oversized on desktop, decision area still narrow); the qnow FO reports the same failure on 2026-10-28 — visuals polished for an interaction model the Captain never chose (`_l3-dogfood/rounds.md`, round 7).
consumer: the Captain, choosing the interaction model before any mockup is drawn.

## Scope

- Step 1 only (this task): an interaction-model pass with no visuals, in `r8-simplest-way-to-decide/design/`:
  - the Captain's tasks in the Bridge, each with where (desktop between work, phone between meetings), how often, and what he must see to decide — sourced from his words in `_l3-dogfood/rounds.md` (rounds 1–7) and the walk rulings, each task citing its source;
  - 2–3 candidate interaction models for the decision screen and queue (for example: today's list + side card; a full-width decision view; a decide-from-the-list model), each described in words;
  - a tasks × models table of operation counts, with each count's steps written out;
  - for each model, what it needs that the product does not store or offer yet, and anything it would change in what is sent, relayed or recorded (that last part is the Captain's to rule on);
  - the designer's own assumptions, flagged;
  - one recommended model with why, and what gets worse under it.
- Design director reviews step 1 before the Captain sees it; the Captain picks the model. Step 2 (one visual direction as static HTML + PNG) is a later task, not this one.
- No product code, no branch push, no PR; output only in the state folder. Exclusions as hard constraints: no visual polish, no colour or size proposals, no component library choices in step 1.

## Acceptance criteria

**AC-1**: Every task is sourced and every operation count is reproducible.
Verified by: each task cites the Captain's words or a walk ruling; each table cell lists its steps; the design director checks the counts against the current build's screenshots in `walks/round-7/`.

**AC-2**: The Captain can pick a model from one page.
Verified by: `design/INTERACTION-MODELS.md` reads in under five minutes, with the recommendation, its cost and the open semantic questions at the top.

## FO alignment

Alignment: not needed: the Captain chose this round form and theme on 2026-10-28; approach from the qnow FO's mode B and its 2026-10-28 addendum, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
