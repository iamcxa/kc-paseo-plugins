---
title: Build the chief of staff — event-triggered calls, a red pulsing sidebar count, and one named focus, on slice 1's reader and switch
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d5-chief-of-staff-build
status: implementation
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
              resolution:
                type: Resolution
                id: resolution:spacedock:d5-chief-of-staff-build:backlog:1
                briefing: briefing:d5-chief-of-staff-build:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-06T14:29:17.999572Z"
                decision: approve
                reason: 'Captain chat 2026-11-06, asked 「幕僚長的設計已經記成你核准了。下一步開程式任務，要從哪裡開始寫？設計說要留下第一片（PR #74）的兩樣東西：讀真 Paseo 對話的方式、確認後才換通訊官。也說要拿掉摘要、Replay、立即收集。」, answered 「接在 PR #74 後面，拿掉不要的 (Recommended)」.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-06T14:29:43Z
worktree: .worktrees/spacedock-ensign-d5-chief-of-staff-build
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

### FO notes

- 2026-11-06: worker pre-edit report: Paseo SDK 0.12 supports the Terra and Opus passes, plugin timeline records, SidebarRow.trailing and client.playAudio; review items have no waiting timestamp (reviews firstSeenAt and agent updatedAt are not waiting times). Under DESIGN.md's "unknown event time pauses the automatic trigger", any review on the board would pause every call. FO steered: exclude unknown-time items from the batch score and the five-minute clock, never invent a time, and report any visible difference from "pause" as a Needs decision finding for the Captain.
- 2026-11-06: worker probe on an isolated real daemon: plugin timeline.append rows do not survive a daemon restart (1 row before, 0 after), so they cannot hold the batch identity. Worker proposed: the automated batch request is an Opus user message in her conversation, and inside that one Opus turn a plugin tool runs one Terra low pass before Opus chooses the focus. FO approved as within the accepted design (identity in her conversation, no new storage, Terra before Opus's choice, one turn each), with conditions: automated marker, never shown as or counted as the Captain's words; the tool only reads board facts; on Terra failure no call and no retry; Opus and Terra measured separately by turn id.
- 2026-11-06: worker ran the candidate on an isolated real daemon (port 55479, fleet 55480) with BRIDGE_DATA_HOME pointing at fictional data and GitHub polling off — product isolation switches with live defaults unchanged, the prerequisite d3's AC-4 measurement named; listed for the Captain in the stage report. FO allowed a fresh browser profile with exactly 127.0.0.1:55479 and :55480 and every other loopback port and localhost blocked, for the real client sidebar and audio proof.
- 2026-11-06: AC-3's first real Opus turn on the isolated daemon returned the Claude account's weekly limit message (resets 3pm Asia/Taipei), 0 tokens, no Terra pass; no retry, substitution or workaround. FO steered: prove the client path (sidebar red, pulse, client.playAudio, stop on entry) in the allowed browser from a fictional prepared batch, labelled not model-backed; package as AC-3 FAILED/HOLD; FO reruns the single real batch after the reset.


## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto PR #74's head (git reset --hard 7a4dbc057803d791dc5626182636c8e0fc2c2d32, branch spacedock-ensign/d3-commander-digest-slice-1) and confirm HEAD; read-only, read d4-chief-of-staff/design/DESIGN.md, design/EVIDENCE.md and mockups/REVIEW.md, and report before editing how the trigger, the Terra and Opus passes, the sidebar badge and audio, and the batch identity in her conversation map onto the plugin SDK and Bridge code, and any SDK limit (stop condition)
  Base confirmed at 7a4dbc057803d791dc5626182636c8e0fc2c2d32 before edits; d4 DESIGN/EVIDENCE/REVIEW read and SDK mapping sent before edits. Final code 6df55e54f07337e5284f0b134c2eb7fd2af1b67b.
- DONE: Remove slice 1's digest, Replay and collect-now code, tests and UI; keep the projected timeline reader and the confirmed comms-officer switch with their tests passing (AC-4)
  Removed collection/digest/Replay code and their feature tests; retained original non-collection projected-page cases and confirmed-switch tests. tests-head.log: 276 pass; merged ranges/gaps/empty pages and persist-before-archive are exercised.
- DONE: Trigger and weights from board sources only, the 30-minute single gate or permission exception, one Terra low and one Opus pass per qualifying batch with no automatic retry, batch identity in her own conversation and no new storage; tests for below and above X=3 and Y=8, the frequency factor, the exception, answered vs unanswered, duplicates, a restarted process with existing items, and an unchanged batch running no model (AC-1)
  Strict >8 / >1800s, X=3, frequency, known times, duplicates/removal/response, baseline/restart history beyond tail and unchanged/refused batches pass; changing boundaries or permitting a second prepare_batch call fails chief.test.mts. Real model proof is failed below.
- FAILED: Rename to 「幕僚長 / Chief of staff」 with the new prompt; her opening focus with its target; the sidebar total red, pulsing, one short sound via SidebarRow.trailing and client.playAudio, pulse stopped on entry with the total kept; the board in one time order, newest first, with FO status rows; the phone return path from a call; captures at 1440 and 360 of rest, call, exception, focus, entered, board and the phone return (AC-2)
  Real client proves red total, three pulses, client audio, entry stop/kept count and phone named-target return with draft. Full 1440/360 rest/call/exception/focus/entered/board/return matrix and director verdict remain incomplete; no complete AC-2 claim.
- FAILED: Real Paseo proof: on an isolated real daemon (own HOME and data, port outside 6767, 6787 and 6860-6935, fictional board sources, no live Bridge files or port) one qualifying batch runs one Terra and one Opus pass with tokens and times by turn id, and the badge and audio call fire; read-only on the live daemon, the shared reader loads the current chief of staff's page (counts and ranges only) (AC-3)
  model-measurement.json: Opus foreground-turn-1 returned weekly-limit notice, 0 input/output tokens; Terra never started, no retry. browser-client-telemetry-2.json plus browser-final-transcript.json prove only the fictional prepared-batch client path; live-reader-counts.json records one healthy empty live page, no text.
- DONE: npm test and typecheck pass; commit, push the branch and open a Draft PR titled "feat(spacedock-bridge): chief of staff ..." with base spacedock-ensign/d3-commander-digest-slice-1
  npm test: 276/276; typecheck exit 0; comment/doc/number/design checks exit 0. Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/77, base spacedock-ensign/d3-commander-digest-slice-1; final head 6df55e54f07337e5284f0b134c2eb7fd2af1b67b.

### Findings

Needs decision — The Captain's normal workflow includes review requests with no trustworthy waiting timestamp. FO directed excluding them from score/clock; four known matters can therefore call while an unrelated unknown-time review is present, whereas a whole-trigger pause would remain quiet (value-ac[AC-1]); the unknown-time test is the concrete trigger. No timestamp is inferred. FO notes preserve this exchange for the Captain.

SDK limit and approved route — A real isolated timeline.append probe had 1 row before daemon restart and 0 after (probe-before.json/probe-after.json). FO approved the automated batch request as the durable Opus user message, with one in-turn prepare_batch Terra low pass before Opus's choice, no outward action and no retry after failure. Automated requests/output are excluded from Captain questions/responses; only an explicit batch-response message consumes that context. Plugin rows are transient and not used as identity storage.

FAILED/HOLD — The provider said "You've hit your weekly limit · resets 3pm (Asia/Taipei)"; it supplied no reset date. Opus turn foreground-turn-1 was observed 14:53:04.746–14:53:09.482 UTC with 0 tokens and reported cost $0; Terra has no turn id or usage. This proves the refusal path, not a successful dual-model batch, its latency or cost. FO owns the single rerun after reset; no retry, substitute or credential workaround occurred.

Client evidence boundary — "Client path proven; model-backed batch not run (Claude weekly limit)." Five explicitly injected fictional prepared batches each produced one 0.15s playback; telemetry records three scale pulses and entry changing scale 1.18 to 1 with total 4 retained, plus no replay on phone return. Final client/shared bytes match captures; the isolated-only injection RPC was removed. The last server-only ordinary-chief-question count guard and retained reader tests have unit/typecheck proof; see capture-candidate-final-diff.json. Successful model-backed call restoration across daemon restart and the full visual matrix remain unproven.

Isolation and cleanup — BRIDGE_DATA_HOME overrides only the existing data-directory default; BRIDGE_FLEET_PORT overrides only default 6787; BRIDGE_REVIEW_POLLING=off disables existing GitHub polling (default remains on). Probe confirmed fictional data, fleet 55480 and polling off before loading Bridge. Browser allowed only 127.0.0.1:55479/55480; requests to 6767 and localhost were intercepted, with no page exceptions. Captured final daemon PID 14230 and browser PID 28102 are stopped; ports, own daemon home/runtime root and profile are gone (cleanup.json/browser-safety-2.json). Live read stored counts/ranges only; no live prompt, switch or archive.

Documents and checks — OVERVIEW.md updated for the retained behavior and declared isolation switches; doc-impact-head.json lists no additional documents. comment-ratio-head.log and number-guards-head.log bind checks to base 7a4dbc057803d791dc5626182636c8e0fc2c2d32 and the final head. No migration, ADR number, new persistent store or CI workflow was added. roborev not run: worker cannot reach its daemon; FO runs the dispatched review on the pushed head.

### Summary

Implemented the bounded chief-of-staff route and removed the first slice's collection surfaces, retaining its projected reader and confirmed switch. Delivery remains HOLD on AC-2 and AC-3: local tests and the real client path pass, but the complete visual acceptance and a successful one-Terra/one-Opus batch still need the FO's follow-up.
