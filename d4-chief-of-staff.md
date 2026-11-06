---
title: Design — the comms officer becomes a chief of staff who scans the board and names the one thing to unblock others
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d4-chief-of-staff
status: validation
gates:
    version: 1
    records:
        - id: gate:d4-chief-of-staff:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d4-chief-of-staff-backlog-1
              briefing:
                id: briefing:d4-chief-of-staff:backlog:attempt-1:revision-1
                digest: sha256:8be5f96061eb6854418bf15aca321a47553ae9f5893482d2d377e66bcab4db75
                room-ref: ./d4-chief-of-staff/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d4-chief-of-staff:backlog:1
                briefing: briefing:d4-chief-of-staff:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-06T04:23:27.692209Z"
                decision: approve
                reason: Captain chat 2026-11-06, asked whether to design the chief of staff first (question quoted in the seed), answered 「先做設計稿，你看過再寫 (Recommended)」.
              application:
                target-stage: implementation
                state: consumed
        - id: gate:d4-chief-of-staff:validation
          stage: validation
          attempts:
            - id: gate-attempt:d4-chief-of-staff-validation-1
              briefing:
                id: briefing:d4-chief-of-staff:validation:attempt-1:revision-1
                digest: sha256:69ad46bd637c72765e45d7741734b6b4a5519b5acb7998d29019648294335fb0
                room-ref: ./d4-chief-of-staff/review/validation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d4-chief-of-staff:validation:1
                briefing: briefing:d4-chief-of-staff:validation:attempt-1:revision-1
                by: person:captain
                at: "2026-11-06T06:31:12.494809Z"
                decision: revise
                reason: 'Captain chat 2026-11-06: asked whether the gate is up to date and expected the chief of staff to answer within three to five seconds from board metadata, with a cheap model pre-sorting for her; to the FO''s answer (board re-reads SD every 60 s, staleness unknown until record; the only measured agent turn took 65 s) he chose 「改成兩層，先量小模型多快 (Recommended)」 — revise: Bridge picks the first item by the existing rules without a model, a small model (Haiku 5.5 or GPT-6.1 Terra) words it from the top items'' titles, the Opus chief of staff answers only when he talks to her, gates show their last check time; measure the small model''s real latency first.'
started: 2026-11-06T04:23:48Z
worktree: .worktrees/spacedock-ensign-d4-chief-of-staff
---

Design, before any code, the Captain's new model: the comms officer stays a conversation but becomes a chief of staff — renamed, aware of the board, scanning the latest state each time he enters and telling him the one highest-priority thing to do to unblock others — with the board in one time order, newest first.

Captain, 2026-11-06, after trying slice 1 (d3-commander-digest-slice-1) a second time: 「合成好之後畫面會一直閃，我感覺離設計稿有點距離，不太好用。我覺得 CO 仍保持對話，但他應該要能知道，感知到目前的 board 上的東西，然後 board 上的東西統一按照時間順序排，越新越上面，每次進 CO 就讓它快速掃一下最新狀態，告訴我最優先該做什麼去 unblock 其他人，等於 CO 其實是幕僚長的角色，也考慮直接幫她改名以便轉移注意力重點，想像她是精明幹練的女性幕僚長，他的工作是快速幫艦長對齊焦點」; asked whether to design first, he answered 「先做設計稿，你看過再寫 (Recommended)」. Standing: 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」 (2026-10-28).

bite: the digest-with-Replay of slice 1 flickers after composing and is hard to use (his trial 2); he needs one aligned focus, not a summary to read.
consumer: the Captain, entering Bridge between other work to learn the one thing to do next.

## Scope

- Step A (words, no visuals) in `d4-chief-of-staff/design/DESIGN.md`:
  - the chief of staff's name and persona as the Captain described her (a sharp, capable woman whose job is to align the Captain's focus quickly), and where today's comms officer prompt and label change;
  - what she can see of the board and through which existing tool (`fleet_status` and the board's sources), and how she ranks "unblocks others" from the facts on the board, never by inference beyond them;
  - the scan on entry: what triggers it, what she says (the one top item, why it unblocks whom, and the action), and when she does not rescan (nothing on the board changed since her last scan);
  - the board in one time order, newest first, replacing the grouped views, and what is lost;
  - the cost of one scan from d2-collection-cost-probe's numbers (no new measurement), and the rescan rule that bounds it;
  - what of slice 1 stays (the projected timeline reader, the confirmed comms officer switch) and what goes (digest, Replay, collect now), and the cause of the flicker from a read-only look at slice 1's code;
  - the Captain's tasks with operation counts, open questions for him, and what gets worse.
- Step B (after the design director approves step A): one mockup direction as static HTML + PNG at 1440 and 360, with review.html and an embedded-image review-phone.html.
Non-goals: any code, branch or PR in this task; prodding FOs; changing gate decision or recording semantics; in-place permission approval; scheduling beyond the scan on entry.
Budget: one design task; at most two design-director passes per step before the Captain sees it.
Stop condition: the design director unsatisfied twice on a step, or a proposal that needs a new Paseo capability or changes the chief of staff's model or cost beyond the rescan rule — those go to the Captain first.

## Acceptance criteria

**AC-4**: Amended by Captain, amendment 1. The chief of staff calls the Captain only when accumulated board events cross the trigger, weighted by importance and frequency and grounded only in board facts; she no longer speaks automatically on entry.
Verified by: DESIGN.md names the five-minutes-unanswered trigger, proposed X and Y for the Captain to decide, the board facts and tool, the GPT-6.1 Terra assistant's part and the Opus chief of staff's part, and how the total Bridge sidebar count turns red, pulses and plays a sound when she calls, including any missing host capability.

**AC-2**: A rescan happens only when the board changed, and its cost is stated.
Verified by: DESIGN.md's rescan rule and cost line from d2-collection-cost-probe's recorded numbers.

**AC-3**: The Captain can judge the direction in a few minutes.
Verified by: one page for step A and review.html / review-phone.html for step B; his answers recorded verbatim.

UI proposal: accumulated board events trigger a Terra-assisted chief-of-staff analysis; when she calls, the total Bridge sidebar count turns red, pulses and plays a sound; opening Bridge alone does not start analysis. The board remains newest first.
Preview: d1-commander-digest/mockups/review.html

## Captain amendments

### Amendment 1 — 2026-11-06, chat
Captain: 「退一步思考一下。如果改成收到新事件後，五分鐘內沒回應，且又收到 X 新事件，且累積的事件超過 Y，那就啟動幕僚長做分析，這樣是否更好？terra分析可以當作幕僚長輔助，我的意思是，改不要把重點放在一進來 bridge 就立即有話要說，而是讓幕僚長依據事件重要強弱，頻率強弱，主動找我討論，例如說側欄上的bridge數字是總和，但是幕僚長找我時，播放音效且讓數字變紅跳動，那我就可以回來找他，不要過度關注他管理的 FOs 達到降低溝通頻率，提高溝通品質的目的」
Asked: 量到了：透過 Paseo 代理跑小模型，九次都沒進五秒。最快是 GPT-6.1 Terra，中位數 7.2 秒寫完（5.4 秒出第一個字）；Haiku 5.5 約 11–14 秒。慢在代理本身：Claude 代理光準備就花 5.7–9.2 秒才開始問模型。但「第一件事」是規則挑的（誰在等你、等最久），不用模型就能馬上出來。第二層要怎麼做？ (options: 「第一件馬上出，不用小模型 (Recommended)」; 「馬上出，再由 Terra 補一句」; 「試直接呼叫模型 API」)
Supersedes: AC-1
Design: "The chief of staff no longer speaks on entry. New board events accumulate; when an event has gone five minutes without his response and X further events have arrived and the accumulated events exceed Y, the chief of staff is started to analyse them, weighted by each event's importance and frequency, with a GPT-6.1 Terra pass as her assistant; when she wants him, the Bridge sidebar count (the total) turns red and pulses and a sound plays, and he comes back to discuss with her. Purpose: he does not over-watch the FOs she manages — fewer, higher-quality conversations."

Superseded text:

**AC-1**: The Captain sees, on entry, the one thing to do and why it unblocks others, grounded only in board facts.
Verified by: DESIGN.md names the board facts the ranking uses and the tool that supplies them, checked by the design director.

## FO alignment

Alignment: not needed: the Captain set this direction and asked for the design first on 2026-11-06.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: the chief of staff calls after the amended accumulated-event trigger; the total sidebar count turns red and pulses with a sound; the board remains newest first.

### FO notes

- 2026-11-06: Captain ruling on amendment 1's open values, asked 「設計總監通過新版。要你定「幕僚長何時找你」：提案是一件事等滿 5 分鐘沒回、之後又來至少 3 件（X＝3）、加權分超過 8（Y＝8；關卡／權限 4、問題 3、審查 2，5 分鐘內 3 件以上乘 1.5）。代價是：只有一個關卡在等你時，可能一直湊不到門檻而不提醒。門檻和「要不要緊急例外」一起定，因為有例外時門檻可以設得鬆一點。怎麼定？」 (option text: 「X=3、Y=8，加一個例外 (Recommended)」 — "例外：單一關卡或權限等你超過 30 分鐘（提案數字，可改），就算湊不到門檻也找你一次。代價：多一種提醒，偶爾為一件事打擾你。"), answered 「X=3、Y=8，加一個例外 (Recommended)」.

- 2026-11-06: Process correction — followup-4 told the designer to write the replacement criterion as AC-1, the id amendment 1 supersedes; the FO renumbered it AC-4 (new id, as in r10-sidebar-count-popover) so design_surfaces passes. Text unchanged.

## Stage Report: implementation

- DONE: Step A in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d4-chief-of-staff/design/DESIGN.md, words only, covering every bullet of the task's Step A scope; read-only sources: Bridge at /Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge (HEAD 7a4dbc057803d791dc5626182636c8e0fc2c2d32: shared/coordinator.ts COORDINATOR_PROMPT, server/fleet-mcp.ts fleet_status, client/board.tsx, shared/board.ts, client/digest.tsx, client/co-chat.tsx), the cost numbers in d2-collection-cost-probe/evidence/RESULT.md, and the accepted r9 and d1 designs for what changes; first count the interaction models for "enter, learn the one thing, act" and pick the simplest before writing the rest (AC-1, AC-2)
  Design artifact commit 4cf9307a9f464581fa90a2d7fa3430370a37e3a4; DESIGN.md compares three interaction models first, selects automatic entry, then covers persona, facts-only ranking, entry deduplication, newest-first Board, measured cost limits, retained/removal scope, operations and one deferred Captain question. EVIDENCE.md pins read-only sources; eight fictional rule walkthroughs show old confirmed waits can outrank newer rows and sent/ambiguous items cannot claim a blocked FO; reversing those rules changes their results. These are design arithmetic, not product tests.
- DONE: The flicker after a digest is composed (d3 task "## Investigation: Captain trial 2", item 14): a read-only code reading of slice 1 naming the likely loop or re-render and whether it would carry into a chief-of-staff conversation; no product edit (AC-1)
  EVIDENCE.md identifies useVerification loading/revision events → DigestMessage setDigest(null) → source re-read as the likely visible churn, with a conditional refetch/subscription loop hypothesis. Digest-specific subscriptions need not carry into ordinary chief-of-staff text; CoChat event reload still can. No runtime reproduction, product repair or claim that flicker is fixed.
- DONE: Detail and evidence in d4-chief-of-staff/design/EVIDENCE.md; finish with a short stage report and stop for the design director's review; do not start step B (AC-3)
  EVIDENCE.md plus design/evidence/{source-manifest,scenarios,checks}.json and four logs committed in 4cf9307. design_surfaces, comment_ratio, doc_impact and number_guards exit 0 on unchanged product base/head 91625588dff1b3e5737f6f6f8843b90d69468f32; 0 code/comment lines, 0 product-document impacts, migration guard skipped because no migrations-path. Preview check uses the pre-existing d1 reference and does not prove d4 visuals. Stop for design-director review.
- SKIPPED: Step B static HTML, PNG, review.html and review-phone.html
  Dispatch explicitly stops after words-only Step A pending design-director review; no code, candidate branch, PR, ADR ruling or runtime activation created.
- SKIPPED: roborev
  Explicit dispatch exclusion for this no-code design; no frontend tests or live model prompts run. Host re-entry without unmount, actual scan cost and ordinary-chat flicker remain unverified.

### Summary

Proposed a sharp, capable female chief of staff who gives one board-grounded next action on changed entry, alongside a single newest-first Board; proposals remain unapproved. The existing fleet tool needs Board-source and progress wiring, so this report does not claim that current code can already perform the design. Design artifacts are committed and pushed; main, flywheel-live and the unused code worktree remain clean on their original branch/revision, and FO should arrange the Step A design-director review before any Step B work.

## Design director review: step A pass 1

Design director (Codex gpt-6.1-sol high, agent 383de5e1, design-director's declared sonnet mapped per the Captain's 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」): NOT SATISFIED. AC-1 and AC-3 satisfied; simpler than slice 1 for his purpose. AC-2 not satisfied: DESIGN.md and EVIDENCE.md drop scan memory when the page reopens and allow another first scan of an unchanged board, against the task's unchanged-board rule; fix by keeping enough scan identity across reopening without silently adding persistence, or take the exception to the Captain. Blocks step B.

## Stage Report: implementation (cycle 2)

- DONE: Revise step A for the design director's AC-2 gap (task "## Design director review: step A pass 1"): reopening the page must not rescan an unchanged board; first consider keeping the scan identity where it already lives — the chief of staff's own last scan message in her timeline, carrying the board version it was made from — so no new storage is added; if that cannot work with the projected timeline reader, say why and name the smallest alternative, marking any new persistent state as a Captain decision rather than adopting it (AC-2)
  DESIGN.md now requires existing timeline identity before every reopened-page scan. EVIDENCE.md describes matching last-scan assistant message and persisted automated request, projected pagination beyond the visible 30 lines/tail 120 entries, unchanged/failed/incomplete suppression, and unknown rather than first-scan fallback. Reader code at pinned 7a4dbc057803d791dc5626182636c8e0fc2c2d32 preserves text/ranges, but current collection provenance does not implement the new pairing; any new durable fallback fields remain a Captain decision, not adopted. Fictional reopen, older-page, failure and gap walkthroughs name the falsifier: another automatic model call without proven Board change.
- DONE: Update DESIGN.md and EVIDENCE.md only where this changes them; keep the one-page length; add a stage report section "## Stage Report: implementation (cycle 2)" and stop for the design director's second pass
  Only DESIGN.md and EVIDENCE.md revised, plus this appended report; main design remains 2,184 characters versus 2,182 before. Four required document/workflow checks rerun with exit 0 on unchanged product base/head 91625588dff1b3e5737f6f6f8843b90d69468f32: zero code/comment lines, zero product-document impacts; migration guard skipped without migrations-path. No Step B; stop for the design director second pass.
- SKIPPED: roborev and product/runtime tests
  Explicit no-code design scope; no live daemon reads, agent prompts, new storage, code branch, PR or activation. Walkthroughs and reader inspection do not prove the proposed parser or cross-reopen behavior already runs.

### Summary

Replaced the rejected page-memory exception with scan identity carried in the chief of staff's existing conversation; unchanged reopening reuses it, and unknown history cannot trigger another scan. The design keeps request identity for failed/incomplete turns as well as the successful last-scan message, without a new storage location or silent persistence decision. This is the AC-2 design revision for second-pass review, not a product fix or approval; Step B remains unstarted.

## Design director review: step A pass 2

Design director (same agent 383de5e1): SATISFIED — the reopening gap is closed (the previous scan identity is recovered from the existing conversation; an unchanged board makes no model call, including after reopening; missing history reads "cannot confirm"); AC-1 and AC-3 still satisfied; no new storage or authority; no objection to step B.

## Stage Report: implementation (cycle 3)

- DONE: Step B per the task's Scope: one mockup direction of the approved step A as static HTML + PNG at 1440 and 360 under d4-chief-of-staff/mockups/, using the d1-commander-digest cycle 5 mockups and the round 9 captures as the visual baseline; states: entry with her one focus (item, who waits and how long, the action) and its named target; an unchanged reopen with no new scan; nothing needs you; partial sources with a tentative focus; a failed or stale scan; opening her target and returning; a short discussion in her conversation; the board in one time order, newest first, with FO status rows interleaved (AC-1, AC-2, AC-3)
  mockups/index.html, states.json and screenshots/ contain one baseline-faithful direction: 11 fictional states at 1440x1000 and 360x780, 22 PNGs. artifacts.json binds exact source/image hashes; checks/baselines.json binds the read-only d1 cycle-5 and r9 references. Geometry/order checks fail on outer overflow, hidden fixed actions or non-newest-first Board; unchanged example checks fail on a second focus message, without pretending to test model calls.
- DONE: review.html (left: state list, right: desktop and phone, size switch, arrow keys, one direction question at the top, CSP img-src 'self' file: data:) and review-phone.html with every phone PNG embedded as data URIs; write ASSUMPTIONS.md before drawing and REVIEW.md after (AC-3)
  mockups/ASSUMPTIONS.md preceded HTML/captures; REVIEW.md followed completed capture/cleanup. review.html renders left states/right desktop+phone with working size switches/arrow key and the exact DESIGN.md question; standalone review-phone.html successfully loaded all 11 embedded 360x780 PNGs from a directory holding only that file. Wrong image dimensions, missing embedded images or an altered direction question would fail the executed checks.
- DONE: Captures one at a time in a fresh headless browser profile over file:// with localhost blocked; close the browser and delete the profile after; add "## Stage Report: implementation (cycle 3)" and stop for the design director's step B review
  mockups/capture.mjs and checks/capture-evidence.json record sequential file-only captures, fresh profile per PNG, 26 fresh headless sessions closed and own profiles removed; HTTP/HTTPS/WS/WSS including localhost blocked, CDP pipe only, zero page script/CSP errors. Static target/open-return/reason/draft checks exercised both widths; product base/head remains 91625588dff1b3e5737f6f6f8843b90d69468f32. Four workflow checks exit 0; report complete and stop for design-director Step B review.
- SKIPPED: roborev and live product/model/device validation
  Explicit design-only dispatch. No daemon access, agent prompts, product edits, new product branch, PR or activation; static mockups do not prove scan identity recovery, zero real model calls, runtime flicker removal, real decisions or keyboard/device behavior.

### Summary

Delivered one chief-of-staff conversation direction with a named focus beside a single newest-first Board, including unchanged reopen, empty, partial, failed/stale, missing-history, target/return and short-discussion states. The offline review and embedded phone review are ready, six static verification groups and four workflow checks passed, and all owned headless-browser profiles were cleaned up. Step A stays unchanged; this is the first Step B submission, awaiting the design director rather than Captain or product approval.

## Design director review: step B pass 1

Design director (same agent 383de5e1), all 22 PNGs: SATISFIED for showing the Captain — entry shows one named priority, who waits and one direct action; target keeps choosing and confirming separate; return keeps the conversation and draft; one descending time order with interleaved status rows; phone keeps the focus and action visible. Nonblocking coverage gap: no picture of the scan in progress or of entry while she is busy; carry into the code task's captures.

## Stage Report: implementation (cycle 4)

- FAILED: Measure, once per model, how fast a small model words the chief of staff's focus line on an isolated Paseo daemon (own --home, port outside 6767, 6787 and 6860-6935, no Bridge plugin): input is a fictional board of ten items (title, kind, owner, waiting since) already ranked by rule, the instruction "say in at most three sentences what to do first, who waits and for how long, and the action"; run claude/claude-haiku-5-5 (thinking off and low) and codex/gpt-6.1-terra (low), each as a fresh Paseo agent with one user message, three runs each; record per run wall time from send to finish, time to first assistant text if the stream shows it, input, cached and output tokens and provider requests by turn id (AC-2)
  Executed nine fresh-agent, single-message attempts (three per requested configuration), no retry, on isolated no-plugin daemon PID 89571/port 54275. Six low settings verified; all three requested Haiku off snapshots say off but native requests show adaptive/medium, so disabled-thinking latency is not established. Per-run timing, first text, input/cache/write/output and one completed provider request are retained by composite turn/session key in evidence/latency-probe/measurements.json and provider metadata.
- DONE: Write d4-chief-of-staff/evidence/latency-probe/RESULT.md with the table, the method (the d2-collection-cost-probe method for usage), what part of the time is the agent harness rather than the model if you can tell, and every approximation; read the live FO count and comms officer status before and after; stop the daemon by captured PID and delete its home (AC-2)
  evidence/latency-probe/RESULT.md records all nine rows, native-setting mismatch, default-cache/order/output-format limits and partial harness timing. safety.json: live 18 FOs and idle comms-officer status/provider unchanged; captured PID gone, port closed and isolated home deleted; only exact new fictional native session artifacts removed. No live prompts, credentials, direct API or product edits.
- DONE: Reconcile usage, timing and observed configuration from retained evidence
  verify.py reconciles nine unique agents/terminal turns against deduplicated native request/response usage; six low configurations confirmed and three off cases explicitly unconfirmed. A changed terminal counter, duplicate run or false off claim would fail these data checks; no provider or daemon is needed to verify saved evidence.
- DONE: Applicable no-code workflow checks
  checks.json: comment_ratio, doc_impact, number_guards and design_surfaces exit 0 on unchanged product base/head 91625588dff1b3e5737f6f6f8843b90d69468f32; zero code/comment lines and product-document impacts, migration guard skipped because no migrations-path. Main/flywheel-live/unused d4 worktree clean on initial heads/branches.
- SKIPPED: roborev and design/product revision
  roborev not run: a measurement with no code change and no candidate branch. This dispatch measures only; no provider repair, off workaround, extra trial, design rewrite, branch, PR or activation was made.

### Summary

Verified Terra low completes in 6.981–7.531s (median 7.157s), first visible text 5.298–5.513s; verified Haiku low median is 13.900s. None of the nine observed turns met the three-to-five-second completion target, and the requested off mode was not actually observed; native agent preparation/context and extra Terra status-block output limit inference about model-only speed. Measurement artifacts and cleanup are complete, but FO must retain the off-setting evidence gap and use these bounded results for the Captain's design revision; no new model/API authority is implied.

## Stage Report: implementation (cycle 5)

- DONE: Captain amendment 1 (task "## Captain amendments", read his words in full): move the superseded AC-1 verbatim under that amendment's "Superseded text:" and write the replacement AC-1 marked "Amended by Captain, amendment 1" from its Design line (the chief of staff calls the Captain only when accumulated board events cross the trigger, weighted by importance and frequency, grounded only in board facts; verified by DESIGN.md naming the trigger with proposed X and Y, the board facts and tool, the Terra assistant's part, and how the sidebar count turns red, pulses and plays a sound) (AC-1)
  Original two-line AC-1 moved verbatim into amendment 1 Superseded text; replacement AC-1 uses the explicit dispatched ID and amendment marker. UI proposal/Visible change follow the amended trigger; frontmatter and Captain/Asked/Supersedes/Design lines verified unchanged. The same-ID instruction conflicts with the workflow check, recorded below rather than silently renumbered.
- DONE: Revise step A to the amendment: drop "speaks on entry"; the trigger (five minutes unanswered, X further events, accumulated over Y) with proposed X and Y and their reasons, for the Captain to decide; what counts as an event and its importance and frequency weights from board facts only; the GPT-6.1 Terra assistant's part and the Opus chief of staff's part, with costs from d2-collection-cost-probe and d4's latency-probe/RESULT.md (Terra low 27,610 input tokens and about 7 s per run); the sidebar count as the total, turning red, pulsing and playing a sound when she calls — check first whether Paseo's own agent attention feature (requiresAttention, attentionReason) or the plugin SDK already gives a badge or sound, and say which part needs new capability; keep the board in one time order, newest first, and the no-new-storage scan identity (AC-1, AC-2)
  DESIGN.md proposes X=3 further distinct pending matters, Y=8 weighted points with strict >, 300s unanswered, importance 4/3/2 and a recent-event multiplier; five fictional arithmetic cases include pre-timeout, strict-equality and duplicate-update falsifiers in design/evidence/amendment-1/walkthroughs.json. EVIDENCE.md checks native attention/notifications, installed SDK 0.12 playAudio and SidebarRow.trailing, current client implementation and official docs; native helper-finish suppression and suspended/closed-client custom delivery remain unproven and require a Captain decision if new host capability is needed.
- DONE: Keep DESIGN.md to one page; update EVIDENCE.md; add "## Stage Report: implementation (cycle 5)" and stop for the design director's review; do not redraw mockups yet (AC-3)
  DESIGN.md stays 2,163 characters; EVIDENCE.md replaces the withdrawn entry-first explanation and preserves timeline identity, source/flicker limits and both measured cost references. No mockup bytes changed; page entry alone cannot trigger analysis, unchanged batches cannot rerun/replay, and no new store is adopted. Appended cycle 5 report and stop for design-director review.
- FAILED: design_surfaces check
  design/evidence/amendment-1/design-surfaces.log exits 1 because amendment 1 supersedes AC-1 while the dispatch explicitly requests replacement AC-1 in the active criteria. FO must correct the criterion-ID instruction; no check bypass, amendment rewrite or unapproved renumbering performed.
- DONE: Remaining no-code workflow checks
  checks.json: comment_ratio, doc_impact and number_guards exit 0 on unchanged product base/head 91625588dff1b3e5737f6f6f8843b90d69468f32; zero code/comment lines and product-document impacts, migration guard skipped without migrations-path. All new examples fictional; no native user data or agent command lines retained.
- SKIPPED: roborev, redraw, live model/runtime and audio tests
  Explicit design-only revision: no code, host changes, new store, global notification edits, prompts, daemon mutations, actual sound or platform activation.

### Summary

Replaced speaks-on-entry with a proposed five-minute/event/weighted-score trigger, Terra preparation and an Opus-led discussion, keeping the newest-first Board and existing-conversation identity. Existing client audio and custom sidebar rendering are available, but helper/native alert deduplication and background delivery are not claimed; the task also has an explicit dispatched criterion-ID conflict that leaves one workflow check failed. Design artifacts are ready for the director, with the ID correction returned to FO; no mockups redrawn or product behavior enabled.

## Design director review: amendment 1 step A pass 1

Design director (same agent 383de5e1): SATISFIED for AC-4, AC-2 and AC-3 — trigger, weights from board kinds only, Terra and Opus parts, costs cited from existing measurements without a new quote, sidebar custom slot and client audio available in the plugin SDK (no delivery when the app is paused or closed). A single high-importance event that never reaches the trigger is the Captain's trade-off, to decide before he accepts the threshold; the designer must not add an exception on its own. Whether the two models' completion notices can be merged is unproven.


## Stage Report: implementation (cycle 6)

- DONE: Update DESIGN.md and EVIDENCE.md with the Captain's ruling in the task's FO notes (2026-11-06, 「X=3、Y=8，加一個例外 (Recommended)」): X=3 and Y=8 with the weights as proposed, plus one exception — a single gate or permission waiting on him for more than 30 minutes calls him once even below the trigger; replace the closing question with this ruling (AC-4)
  design/DESIGN.md and EVIDENCE.md adopt X=3 further distinct matters, strict weighted S>8 and the original 4/3/2 weights with 1.5 recent-frequency multiplier. The accepted option adds one gate/permission strictly over 1800s once; 30:00 fails, 31 minutes qualifies, questions/reviews and already-notified versions do not. Closing question is replaced by the ruling; 30 minutes is attributed to the accepted proposal, not invented Captain speech. AC-4 was corrected by FO; the cycle-5 failed log remains historical.
- DONE: Redraw step B for amendment 1 (the existing entry-first mockups are superseded): at 1440 and 360, the board newest first with the sidebar count at rest; the count red and pulsing when she calls (sound shown as a caption); the 30-minute single-gate exception call; her discussion opening with one named focus from the batch and its target; after he enters, the pulse stopped and the total kept; nothing to call about; a source incomplete ("?"); keep review.html (CSP img-src 'self' file: data:) and an embedded-image review-phone.html; captures one at a time in a fresh profile over file:// with localhost blocked (AC-4, AC-3)
  mockups/{index.html,states.json,REVIEW.md,review.html,review-phone.html} and 22 PNGs implement one revised direction, 11 states at 1440x1000 and 360x780. Eight static check groups pass: total 4 vs exception 1 vs unknown ?, newest-first with two FO status rows, 3-cycle CSS pulse, actual enter stops animation without clearing total, one named focus/target, required modify reason and draft return. Reversing order, using a score as the count, clearing total, retaining animation, changing the named target, removing the reason guard or losing a PNG fails a corresponding executed assertion. Full phone review loads all 11 data-URI PNGs from an otherwise empty directory. 26 successful sequential fresh-profile file-only sessions closed and own profiles removed, zero page script/CSP errors, all HTTP/HTTPS/WS/WSS including localhost blocked; no audio playback. Source/image/check hashes are in artifacts.json; first startup timeout retained, same isolated route passed with a 30s startup wait.
- DONE: Add "## Stage Report: implementation (cycle 6)" and stop for the design director's review
  This cycle-6 report is appended after status --read returned total_lines=207, preserving all preceding entity bytes. mockups/checks/package-checks.json: design_surfaces, comment_ratio, doc_impact and number_guards exit 0 on unchanged product base=head 91625588dff1b3e5737f6f6f8843b90d69468f32, zero code/comment lines and product-doc impacts; migration check skipped without migrations-path. ownership.json confirms original main/code/flywheel branches and heads clean, no owned capture-profile or standalone directory remains. Stop for the design director; no approval claimed.
- SKIPPED: roborev and live product/model/audio/device tests
  Explicit design-only dispatch, no product candidate: no product edits, new product branch, PR, daemon, agent prompt, sound playback or runtime activation. CSS/DOM/arithmetic checks cannot prove actual timers, model cost/latency, persisted batch deduplication, native notification merging, suspended/closed-client delivery, flicker repair or real-device/keyboard behavior.

### Summary

Updated the accepted trigger and the 30-minute single-gate/permission exception, then replaced the superseded entry-first pictures with one accumulated-event-call direction. The offline desktop and embedded phone reviews are complete and checked, with total-preserving call/entry states, one named focus and target, no-call and unknown-source states; the earlier missing analysis-in-progress picture is also included. All work stays in task state/design artifacts and is submitted for the design director's review, not product or Captain acceptance.

## Design director review: amendment 1 step B pass 1

Design director (same agent 383de5e1), all 22 new PNGs: SATISFIED for showing the Captain — total at rest, red pulsing badge with a one-time sound caption on a call, the 30-minute single-gate exception, one named focus with its target after entry, pulse stopped and total kept, quiet empty state, "?" for an incomplete source, board newest first. Nonblocking gap: 360-call.png and 360-exception.png show the sidebar already open; on a phone, returning takes two operations (open sidebar, tap the count), not the one DESIGN.md states — draw the collapsed start and correct the count before code.
