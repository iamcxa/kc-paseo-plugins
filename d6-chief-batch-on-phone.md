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
Preview: d6-chief-batch-on-phone/mockups/review.html

## Captain amendments

### Amendment 1 — 2026-11-09, chat
Captain: 「改成在原生對話裡處理 (Recommended)」
Asked: 設計總監二審提出一個更簡單的做法：點推播會打開她在 Paseo 的原生對話，而 Paseo 外掛其實可以在原生對話裡插入自訂的訊息元件。所以整批可以直接在推播打開的地方逐件回答：進入從 3 下變 1 下，清完 4 件共 9 下，規則不變（你的原話、逐件明示送出、關卡按確認、權限另開 FO）。這個任務的兩輪審查已經用完。要怎麼做？ (options: 「改成在原生對話裡處理 (Recommended)」 — "再開一輪設計：先確認原生對話的自訂元件在手機上真的能送出和按確認，做不到就退回 Bridge 的 3 下入口。代價：又延一輪設計。"; 「維持 Bridge，3 下入口就好」)
Supersedes: none
Design: "The batch is answered in the chief of staff's native Paseo conversation where the push lands, through plugin timeline components (addTimelineTransformer, addTimelineRenderer), keeping his words, per-item explicit send, the named gate Confirm and the permission exception; first confirm on the phone that those components can send and confirm; if they cannot, fall back to the Bridge entry of three taps. One more design round; the director's pass budget for step A is extended by this one round."

## FO alignment

Alignment: not needed: the Captain named the problem and the purpose on 2026-11-09; this task designs it before code.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: a called batch shown and answered item by item inside the chief of staff's conversation, with delivery states, on the phone.

## Stage Report: implementation

- DONE: Step A in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d6-chief-batch-on-phone/design/DESIGN.md, words only, covering every bullet of the task's Step A scope; first count the interaction models for "clear a four-item batch from the phone" and pick the simplest; read-only sources: the accepted d4-chief-of-staff design and mockups, the d5-chief-of-staff-build candidate at f40c340e8204f4b7dddef238f215aea3f3a6eaab (worktree /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d5-chief-of-staff-build: the chief conversation, the existing relay of Captain words to an FO, DecisionCard's named gate Confirm, the permission rule), and the d5 shadow run 2 counts in the d5 task file (AC-1, AC-2)
  DESIGN.md compares four models and selects inline per-item answers: two questions/two gates budget 9 taps, zero FO target switches; EVIDENCE.md binds exact d5 source paths/bytes, per-kind delivery evidence, permission exception and partial-batch behavior. Counts are proposed walkthroughs, not device measurements or accepted AC verdicts.
- DONE: Detail and evidence in d6-chief-batch-on-phone/design/EVIDENCE.md; finish with a short stage report and stop for the design director's review; do not start step B (AC-3)
  EVIDENCE.md separates Captain words, existing behavior and proposals; Step B mockups/review pages not created, no product branch/PR/action/model/daemon change. Stop here for FO to route the design director's Step A review.
- DONE: Exercise the existing semantics the design relies on.
  evidence/capability-probe.json: six pure-function checks pass at f40c340e8204f4b7dddef238f215aea3f3a6eaab. Auto-send on choose/cancel, no-reason revise/hold, changed-briefing or duplicate transmission, lost conditional words, or marking mismatched/overdue delivery recorded would fail these assertions; no new UI or native-phone proof claimed.
- DONE: Run the recorded-profile checks and retain exact inputs and limits.
  evidence/package-checks.json: comment-ratio/doc-impact/number-guards/design-surfaces exit 0; product base=HEAD=91625588dff1b3e5737f6f6f8843b90d69468f32, 0 code/comment lines, 0 affected product documents, no migration path; surface check follows the existing d4 preview and is not d6 mockup acceptance.
- SKIPPED: RoboRev and a product pull request.
  Authorized design-only task, no code candidate/change and no PR opened; no code branch push. First tsx CLI probe hit a sandbox IPC denial; preserved separately, then the same dependency's no-listener Node import passed without escalation.

### Summary

Proposed one chief conversation containing the whole batch, exact explicitly requested question relays and existing named gate Confirm; permissions retain the native FO exception. The current batch-level response marker cannot stand for per-item completion, so the design retains unanswered items in the original conversation and shows sent/relayed/recorded separately without new storage or authority. Step A is ready for the design director; AC acceptance, Step B and product/device delivery remain unclaimed.

## Design director review: step A pass 1

Design director (Codex gpt-6.1-sol high, agent 544638aa, design-director's declared sonnet mapped per the Captain's 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」): NOT SATISFIED on AC-1, SATISFIED on AC-2 and AC-3; the in-place model is the simplest of those compared and widens nothing. Blocking: the design assumes one tap on Paseo's push lands in an actionable chief-of-staff Bridge view; nothing shows the native push opens the Bridge screen (the existing entry is the sidebar navigation); state the actual path from push to Bridge and count entry separately from the 8 in-place taps (plus 2 for reasons). Nonblocking: the existing per-item path is 19 taps, not 18 (the return lands on the queue, one more tap to the chief of staff).

## Stage Report: implementation (cycle 2)

- DONE: Revise step A for "## Design director review: step A pass 1": establish where tapping Paseo's push for the chief of staff actually lands — most likely her native agent conversation, not the Bridge screen — from Paseo's own documentation, the installed app or plugin SDK (read-only; no live prompt or notification sent); then say how the batch is cleared from there: either the batch works in her native conversation, or the shortest path from there to the Bridge view with the inline items, and count entry taps separately from the 8 in-place taps (plus 2 for reasons); correct the existing path count to 19; if a working entry needs a capability the plugin SDK does not have, stop and say so (AC-1)
  DESIGN.md and EVIDENCE.md now give the installed 0.15.3 agent notification data -> shared openAgent routing -> native chief conversation -> menu -> existing Bridge sidebar -> comms screen path: entry 3, in-place 8, reasons +2. Existing path from the Bridge press is corrected to 19; starting at the push it is 21, versus proposed 11. These are bounded walkthrough budgets, not phone measurements.
- DONE: Update DESIGN.md and EVIDENCE.md only where this changes them; add "## Stage Report: implementation (cycle 2)" and stop for the design director's second pass
  Entry/path/count sections corrected; relay, named Confirm and permission authority unchanged. EVIDENCE.md records exact app-bundle/SDK/source hashes and official documentation links; no code, mockup, notification, model, permission or daemon action. Stop for FO to route the director's second pass; AC-1 is not self-approved.
- DONE: Exercise the notification-route premise without sending a notification.
  The installed bundle's shared module 4937 ran with fictional ports: data parses to agent, tap calls only the named chief's openAgent, then acknowledges once. A plugin/host/terminal route or wrong agent would fail; no claim of native-phone notification receipt or sidebar visibility. Existing sidebar-to-comms and SDK wiring inspected read-only, with cited source ranges.
- SKIPPED: RoboRev, product tests/build, Step B and a product pull request.
  Design-only revision; product bytes/candidate unchanged and prior pure gate checks remain historical evidence. No new SDK capability is required for the selected manual sidebar route; one-tap push-to-plugin or native inline cards are not promised. Diff whitespace check passed; phone/host/hidden-sidebar preconditions are explicit.

### Summary

Corrected the unsupported assumption that a native push opens actionable Bridge content: the checked route opens the native chief agent, then existing menu and Bridge actions reach the same chief conversation in the plugin. Entry is separately budgeted at three taps, with eight in-place taps and two optional reason-focus taps; the old existing-path count is corrected to nineteen from the Bridge press. Only the two design documents and this append-only report changed; no Step B or approval claimed.

## Design director review: step A pass 2

Design director (same agent 544638aa): NOT SATISFIED. The entry and counts are fixed (AC-1, AC-2, AC-3 satisfied as words), but the model choice omits answering in her native conversation where the push lands: the plugin SDK provides addTimelineTransformer and addTimelineRenderer (client contracts), and the installed app loads them in native conversations with agent identity, mobile layout, send and plugin RPC context — so the batch could likely be cleared there, entry 1 tap instead of 3, keeping per-item explicit send, named gate Confirm and the permission exception. Blocks step B. The task's budget of two director passes per step is spent; taken to the Captain.

## Stage Report: implementation (cycle 3)

- DONE: Captain amendment 1: rewrite step A so the batch is answered in her native Paseo conversation where the push lands, through the plugin SDK's addTimelineTransformer and addTimelineRenderer (read the installed SDK contracts and the installed app read-only, as the design director cited), keeping his words, per-item explicit send, the named gate Confirm with version check and record, and the permission exception; name for each item kind which plugin RPC or existing relay path a native component calls, how the batch binds to its source, and what shows when a component is not supported (the fallback is the three-tap Bridge entry); counts: entry 1, in-place 8 (10 with reasons) (AC-1, AC-2)
  DESIGN.md selects the fifth model, native per-item components: entry 1 + in-place 8 = 9 (11 with reason focus). EVIDENCE.md traces installed renderer/provider modules and SDK 0.12.0, exact question/gate/permission/review routes, original-batch/source/version checks and text-preserving fallback; Bridge retains entry 3. The installed app bundle hash remains 5059c0952e69bd13319b9e0b6c7e78cfd48c13878ebb5744ed10ec4a44505cf4.
- DONE: Name the one question a phone check must answer before code (can a native timeline component on the Paseo phone app send through a plugin RPC and run the Confirm), and how to answer it without a live prompt or notification; keep DESIGN.md to one page; update EVIDENCE.md; add "## Stage Report: implementation (cycle 3)" and stop for the design director's review (AC-3)
  One-page text entry is 2284 characters; EVIDENCE.md defines a real-phone check on an isolated fictional timeline, inert echo/decision RPC and existing Confirm functions with test ports, no agent prompt/notification/live gate. Phone check is NOT RUN; native capability acceptance remains open before product code. Stop for the Captain-authorized extra director pass; no Step B started.
- DONE: Keep existing authority and distinguish source support from delivery proof.
  Native props have no navigation: permission uses the registered client.openScreen closure and existing Board native-FO dispatcher, never a permission RPC. Proposed chief.batch is explicitly new and read-only, using existing conversation/Board readers without storage or the chief.read observer that could trigger analysis; sent/relayed/recorded still require their original evidence.
- SKIPPED: Product implementation, phone exercise, RoboRev, product tests/build and a product pull request.
  This dispatch is words only: no candidate/product changes, native probe plugin, test daemon, agent prompt, notification or permission action. Read-only source/bundle hash verification and git diff whitespace check completed; older pure-function probes are not relabelled native-phone proof.

### Summary

Applied Captain amendment 1 without rewriting AC text or earlier reports: the primary batch stays in the native chief conversation where the push lands, while the three-tap Bridge entry becomes its approved fallback. The design names per-kind calls, original source binding and unsupported-component behavior, including a phone check that cannot be replaced by desktop or mocked-context evidence. This is the design deliverable for the extra review round, not a phone-capability pass, product implementation or Step B authorization.

## Design director review: step A pass 3

Design director (same agent 544638aa), on dc971645 under the Captain's amendment 1: SATISFIED — native entry 1 tap plus 8 in place (10 with reasons); per item kind a named path (question: SDK agent send into her user line, then the existing relay; gate: gate.briefing recheck, named Confirm, decideGate, claim and relay, recorded by the FO; permission: Bridge-named route to the native FO, no approve or deny call); a read-only chief.batch lookup binding the batch to its source; the fallback stays in the untransformed batch message; one phone check named before code (a physical phone on an isolated host with a fictional timeline and no-model echo RPC and test decision handler). No gap blocks step B; the phone check is not yet run.

## Stage Report: implementation (cycle 4)

- DONE: Step B for the passed step A: static HTML + PNG mockups at 360 (primary) and 1440 under d6-chief-batch-on-phone/mockups/, drawn as her native Paseo conversation (not the Bridge screen), using the d4 mockups and the round 9 captures as the visual baseline; states: push landing on her call with a four-item batch; answering a question in place and its sent / relayed states; a gate expanded with choose and Confirm, a reason required, and recorded; a permission item with "go to the FO"; a half-answered batch; a stale gate version refused; the fallback when a component is not supported (with the Bridge entry); keyboard up on 360 with the item, recipient and send visible (AC-1, AC-2)
  mockups/ has 16 fictional states, 32 PNGs (360x780/1440x1000), native-chief chrome with Bridge only in its fallback; states.json/REVIEW.md map every required state. All 16 phone views and selected desktop views were visually inspected; stale/permission were refined and re-captured at both widths so refusal/draft/disabled Confirm and the named permission route fit.
- DONE: review.html (CSP img-src 'self' file: data:, one direction question at the top) and review-phone.html with every phone PNG embedded; ASSUMPTIONS.md before drawing, REVIEW.md after; captures one at a time in a fresh profile over file:// with localhost blocked; add "## Stage Report: implementation (cycle 4)" and stop for the design director's review (AC-3)
  review.html loads all 32 images; review-phone.html embeds all 16 phone PNGs and passed standalone-folder loading. ASSUMPTIONS precedes drawing, REVIEW follows checks, task Preview now points to this round. CDP pipe, all HTTP/HTTPS/WS/WSS blocked, file/data-only page requests, 44 successful fresh-profile sessions cumulatively closed/removed; no profile/temp directory remains.
- DONE: Exercise the bounded offline design and retain source identity.
  checks/tests-first-pass.json and checks/tests.json each pass six groups: 44px/overflow/keyboard geometry; exact per-question words/recipient; no typing/choose/cancel send; reason/Confirm; stale/new-version refusal; independent four-item sends; navigation-only permission; no-resend fallback and review portability. Violating any named boundary fails its assertion; this proves mock behavior only, not native RPC/phone delivery.
- DONE: Preserve exact artifact provenance and check the unchanged product boundary.
  artifacts.json hashes every deliverable; capture-evidence.json binds each PNG to its exact HTML source (28 unchanged images use frozen capture-source-1.html; four refined images use index.html). Hashes rechecked. Four package checks exit 0, product base=HEAD=91625588dff1b3e5737f6f6f8843b90d69468f32; 0 product code/comment lines, 0 affected product documents, no migration findings. Main/task/d5 source branches and clean status retained in ownership evidence.
- SKIPPED: Phone capability check, RoboRev, product implementation, pull request and activation.
  Explicitly outside this Step B dispatch: no live daemon/model/prompt/notification/RPC/permission/gate action. Keyboard is a 240px static illustration. Initial sandbox Chrome pipe failure is retained with cleanup evidence; the authorized same file-only runner succeeded without enabling network or reusing a user profile.

### Summary

Delivered the native-conversation, phone-first mockup package with a four-item batch, individually explicit question relays and named gate Confirm, permission exception, partial/stale states, readable unsupported-component fallback and a visible keyboard layout. Both review surfaces work offline, source/image provenance is retained, and the task Preview now leads to this round. Stop for the design director's Step B review; no phone capability, product delivery or Captain acceptance is claimed.

## Design director review: step B pass 1

Design director (same agent 544638aa), all 32 PNGs at 0bc294e8: NOT SATISFIED, two blocking gaps. (1) Gates have no in-flight delivery states: sent.png and relayed.png show only a question; add a gate "sent to the chief of staff, not yet relayed" and "relayed, waiting for the record", keeping his words, the named gate and version, with repeat Confirm disabled (AC-2). (2) Progress jumps across the fallback: unsupported.png and fallback-menu.png show 0 of 4 sent, fallback-bridge.png shows 2 of 4 and 1 recorded with only navigation between them; keep one batch with the same per-item progress, or label a snapshot as delivery unknown (AC-1, AC-2). Nonblocking: landing.png, half.png and fallback-bridge.png repeat the batch count, intro and four summaries before the answer cards; keep one progress line so the first screen reaches a send control.
