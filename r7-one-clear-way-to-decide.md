---
title: Flywheel round 7 — one clear way to decide on the gate screen
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r7-one-clear-way-to-decide
gates:
    version: 1
    records:
        - id: gate:r7-one-clear-way-to-decide:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r7-one-clear-way-to-decide-backlog-1
              briefing:
                id: briefing:r7-one-clear-way-to-decide:backlog:attempt-1:revision-1
                digest: sha256:45c0c1f05399e3787edafc8800cd6c5b0189351ab04b983ddc4058d4e98e01af
                room-ref: ./r7-one-clear-way-to-decide/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r7-one-clear-way-to-decide:backlog:1
                briefing: briefing:r7-one-clear-way-to-decide:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-27T15:06:15.370574Z"
                decision: approve
                reason: 'Accepts direction: Captain chose this theme in round 6 UAT; scope bounded by chief-engineer; no relay, recording or persistence change; stacked unmerged on #54.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'Captain chat 2026-10-23, recorded as ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
---

Round 7 of the POC flywheel under ADR 0008: on the gate screen one text box both messages the officer and carries the decision reason, the discussion does not say whose conversation it is, and the phone decision buttons are small and close together.

Captain, 2026-10-27, round 6 UAT option answers: most bothersome 「輸入框一個兩用」; next 「決定畫面變清楚 (Recommended)」 (option text: 分開「傳訊息」和「做決定」、標明討論屬於誰、已記錄的決定可回看簡報、手機決定按鈕加大).

bite: the round 6 whole-product walk (`_l3-dogfood/walks/round-6/`, 2026-10-27) shows one composer whose placeholder offers both a message and a decision reason beside a send arrow and decision chips (360-gate-open-expanded.png, 1440-gate-open-expanded.png; design director decision-composer, high, carried from round 5 i1); a "Discussion" heading over a release-window conversation on an adapter gate (B2); short, closely packed phone decision chips (round 5 i6). Design director ruling: `walks/round-6/director-ruling.md`.
consumer: the Captain, deciding a gate from the Bridge on phone or laptop.

## Scope

- decision-composer: keep the Paseo message box and send arrow; decision buttons stay to its left; choosing one opens a separately labelled reason field and an explicit confirm. The message draft is never reused or copied as the reason. Approve allows an empty reason; revise and hold still require one. Sending a message and a decision are two explicit actions, each draft kept independently. Message sends keep their recipient, footer and checks; decision confirmation keeps the existing relay payload, claim and recording rules. One shared composer state model for desktop and phone.
- discussion-scope: label the discussion "Conversation with <officer> · includes other tasks"; no decision-specific threading.
- phone-decisions: larger, separated decision controls with touch targets of at least 44×44 logical pixels.
- POC boundary: no durable reason storage, automatic resend, combined message-and-decision transaction, new recording rule, conversation routing change or history-retention promise. Any semantic change returns to the Captain.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): sixth stack layer on `spacedock-ensign/r6-queue-you-can-scan` at f10a3f2; Draft PR with that base; nothing merges.
- Non-goals (chief-engineer): a route back to a recorded decision's briefing (data exists; deferred as its own bounded reader change), desktop width, keyboard recovery, historical browsing.

## Acceptance criteria

**AC-1**: Messaging and deciding are separate and keep their semantics.
Verified by: tests named up front — "message never decides", "decision uses only its reason", "both actions keep the other draft", "a changed briefing or officer cannot receive a stale action", "pending, failure and duplicate presses keep existing behavior" — over all three decisions, required reasons, cancel, remount, typing during submission, Enter and Chinese input confirmation.

**AC-2**: The screen says whose conversation it is and the phone controls are usable.
Verified by: one rerunnable mounted fixture at 360 and 1440 px showing both actions, recipient labels, kept drafts, the discussion label and measured phone targets of at least 44×44.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 6 UAT; scope from the whole-product walk and chief-engineer recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
Reviewer: kc-dev-flow-2:chief-engineer codex/gpt-6-astra:xhigh 2026-10-27 — scope round 7 (one clear way to decide) after his round 6 UAT and the whole-product walk
