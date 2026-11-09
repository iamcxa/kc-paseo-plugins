---
title: Design — the chief of staff handles a whole batch in her one conversation, so the Captain answers from his phone without switching sessions
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d6-chief-batch-on-phone
status: implementation
gates:
    version: 1
    records:
        - id: gate:d6-chief-batch-on-phone:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d6-chief-batch-on-phone-backlog-1
              briefing:
                id: briefing:d6-chief-batch-on-phone:backlog:attempt-1:revision-1
                digest: sha256:29fbf4c9b6acfca52fd7c624323cfd251c027957769302768daeb0c6b91f7e93
                room-ref: ./d6-chief-batch-on-phone/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d6-chief-batch-on-phone:backlog:1
                briefing: briefing:d6-chief-batch-on-phone:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-09T03:10:58.487235Z"
                decision: approve
                reason: Captain chat 2026-11-09, asked 「要先做這輪手機優先的設計嗎？」 with two parts (push to a locked phone; handling the whole batch in her conversation), answered 「1 這個手機不用煩惱，paseo 會推播，只是我沒辦放每次都一則一則去回，所以才需要她」 — part 1 dropped (Paseo pushes), part 2 is this task.
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-09T03:11:21Z
worktree: .worktrees/spacedock-ensign-d6-chief-batch-on-phone
---

Design, before any code, how the Captain clears a batch the chief of staff called him about from her one conversation on his phone: she lays out the batch's items, he answers each there, and she relays his answers to each FO, so he never switches between FO sessions.

Captain, 2026-11-09, after the second shadow run of d5-chief-of-staff-build: 「對，這就是一個問題，我如果出門，我的通訊工具就是手機，但問題是那麼多 session 我很難一次切換看完，所以我如果沒有一直盯著手機一定會讓 fo 們等很久」; asked whether to design phone-first first (push to a locked phone, and handling the whole batch in her conversation), he answered 「1 這個手機不用煩惱，paseo 會推播，只是我沒辦放每次都一則一則去回，所以才需要她」.

bite: the second shadow run on his live board showed four real calls in four hours across five FOs; answering each means opening each FO's session on the phone, so FOs wait while he is out.
consumer: the Captain away from his desk, phone in hand after Paseo's push, clearing the batch from her conversation.

## Scope

- Step A (words) in `d6-chief-batch-on-phone/design/DESIGN.md`, on top of the accepted d4-chief-of-staff design and d5-chief-of-staff-build at f40c340e8204f4b7dddef238f215aea3f3a6eaab:
  - how her batch appears in her conversation on a 360 phone: each item with what it is, who waits, how long, and the answer it needs;
  - answering: a question item gets his reply in place and she relays it to that FO in his words, marked as his; a gate item gets his decision through the existing named gate Confirm (and reason when required) from inside her conversation; a permission item is not approved in place (standing rule) — what he sees instead; what "sent", "relayed" and "recorded" show per item;
  - what she adds (context she can read from board facts only) and what she never does (decide for him, send without his explicit send, approve permissions);
  - how this relies on Paseo's native push (no new notification channel), and what she does when he answers only part of a batch;
  - the Captain's tasks with operation counts on the phone (clear a four-item batch), open questions, what gets worse.
- Step B (after the design director approves step A): mockups at 360 (primary) and 1440 with review.html and an embedded-image review-phone.html.
Non-goals: any code, branch or PR in this task; a new push or notification channel; approving permissions in place; changing gate decision or recording semantics; deciding for the Captain.
Budget: one design task; at most two design-director passes per step before the Captain sees it.
Stop condition: the design needs a Paseo capability the plugin SDK does not have, or relaying his answer would need authority the comms officer does not hold today — stop and bring it to the Captain.

## Acceptance criteria

**AC-1**: The Captain can clear a batch from her conversation on his phone without opening an FO session, except where a standing rule requires it.
Verified by: DESIGN.md's operation counts for a four-item batch at 360 and the named exceptions, checked by the design director.

**AC-2**: Every relayed answer is his words, explicitly sent, and its delivery state is visible.
Verified by: DESIGN.md names the relay path and the sent / relayed / recorded states per item kind, checked against the existing relay and gate Confirm code by the design director.

**AC-3**: The Captain can judge the direction in a few minutes.
Verified by: one page for step A and review-phone.html for step B; his answers recorded verbatim.

UI proposal: her batch as a list of answerable items inside her conversation, each answered in place, at 360 first.
Preview: d4-chief-of-staff/mockups/review.html

## FO alignment

Alignment: not needed: the Captain named the problem and the purpose on 2026-11-09; this task designs it before code.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: a called batch shown and answered item by item inside the chief of staff's conversation, with delivery states, on the phone.
