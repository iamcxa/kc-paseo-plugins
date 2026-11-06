---
title: Build the chief of staff — event-triggered calls, a red pulsing sidebar count, and one named focus, on slice 1's reader and switch
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d5-chief-of-staff-build
status: backlog
gates:
    version: 1
    records:
        - id: gate:d5-chief-of-staff-build:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d5-chief-of-staff-build-backlog-1
              briefing:
                id: briefing:d5-chief-of-staff-build:backlog:attempt-1:revision-1
                digest: sha256:dd75b17bef74fd90c98a93390e198eef5c85dc5b0e83ab86f049c5cb08bb2781
                room-ref: ./d5-chief-of-staff-build/review/backlog/briefing-1
---

Build the accepted d4-chief-of-staff design: the comms officer becomes the chief of staff; accumulated board events past the Captain's trigger start one Terra plus one Opus analysis; when she calls, the Bridge sidebar total turns red, pulses and plays a short sound; she opens with one named focus and its target; the board is one time order, newest first; slice 1's digest, Replay and collect-now are removed.

Captain, 2026-11-06: design accepted 「照這樣做吧」 (d4-chief-of-staff validation gate, after confirming he can still talk to her any time); trigger 「X=3、Y=8，加一個例外 (Recommended)」 (a single gate or permission waiting over 30 minutes calls him once); asked where the code starts, answered 「接在 PR #74 後面，拿掉不要的 (Recommended)」.

bite: he over-watches the FOs and slice 1's digest flickers and is hard to use (his trials 1 and 2 of d3-commander-digest-slice-1); he wants 「降低溝通頻率，提高溝通品質」.
consumer: the Captain, working elsewhere until the sidebar count turns red, then discussing one focus with the chief of staff.

## Scope

- Stack on Draft PR #74 (branch spacedock-ensign/d3-commander-digest-slice-1 at 7a4dbc057803d791dc5626182636c8e0fc2c2d32); keep its projected timeline reader and its confirmed comms-officer switch; remove the digest, Replay and collect-now code, tests and UI.
- Per d4-chief-of-staff/design/DESIGN.md: rename to 「幕僚長 / Chief of staff」 with the new prompt; board events and weights (gate or permission 4, named question 3, review request 2, others 0; ×1.5 when three or more distinct items arrive within five minutes); trigger when an event is unanswered five minutes, X=3 further distinct items, and the batch score exceeds Y=8, or a single gate or permission waits over 30 minutes; one GPT-6.1 Terra low pass and one Opus pass per qualifying batch, no automatic retry; batch identity kept in her own conversation, no new storage; she opens with one named focus and its target; the sidebar total turns red, pulses and plays one short sound via SidebarRow.trailing and client.playAudio, stops pulsing on entry; the board in one time order, newest first, FO status rows interleaved; the phone return path from a call drawn and counted (d4 director's nonblocking gap).
Non-goals: delivery of the sound when the app is paused or closed; prodding FOs; changing gate decision or recording semantics; in-place permission approval; merging any PR; the AC-4 cost measurement of slice 1.
Budget: one implementation task stacked on PR #74; at most two repair cycles before the Captain sees it.
Stop condition: the plugin SDK cannot run Terra and Opus passes or play the sound from the plugin as designed, or the trigger cannot be computed from board sources without inference — stop and report.

## Acceptance criteria

**AC-1**: She calls only past the trigger or the 30-minute exception, from board facts only, once per batch.
Verified by: tests of the trigger and weights (below and above X and Y, the frequency factor, the exception, unanswered vs answered, duplicate events, a restarted process with existing items) and that an unchanged batch runs no model.

**AC-2**: When she calls, the Captain sees it and can act on it.
Verified by: captures at 1440 and 360 of rest, call (red, pulsing, sound shown), exception, her opening focus with its target, entered (pulse stopped, total kept), the board newest first, and the phone return path; the design director compares them with d4's mockups.

**AC-3**: It works on the real Paseo.
Verified by: on an isolated real daemon with fictional board sources and no live Bridge files or port, one qualifying batch runs one Terra and one Opus pass with their tokens and times recorded by turn id, and the plugin's sidebar badge and audio call fire; read-only checks on the live daemon load the current chief of staff's page.

**AC-4**: Slice 1's removed parts are gone and its kept parts still work.
Verified by: no digest, Replay or collect-now UI or code remains; the projected reader and switch tests still pass.

UI proposal: build the accepted d4-chief-of-staff mockups (rest, call, exception, focus, entered, target, returned, empty, board, source), adding only the phone return path from a call.
Preview: d4-chief-of-staff/mockups/review.html

## FO alignment

Alignment: not needed: the Captain accepted the design (d4-chief-of-staff), the trigger and the starting point on 2026-11-06.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: the comms officer renamed as the chief of staff, a red pulsing sidebar count with a sound when she calls, her opening focus, and the board in one time order, newest first.
