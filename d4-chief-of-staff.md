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

**AC-1**: The Captain sees, on entry, the one thing to do and why it unblocks others, grounded only in board facts.
Verified by: DESIGN.md names the board facts the ranking uses and the tool that supplies them, checked by the design director.

**AC-2**: A rescan happens only when the board changed, and its cost is stated.
Verified by: DESIGN.md's rescan rule and cost line from d2-collection-cost-probe's recorded numbers.

**AC-3**: The Captain can judge the direction in a few minutes.
Verified by: one page for step A and review.html / review-phone.html for step B; his answers recorded verbatim.

UI proposal: a chief-of-staff conversation that opens with her scan (one top item, why, the action) beside a board in one time order, newest first, at 1440 and 360.
Preview: d1-commander-digest/mockups/review.html

## FO alignment

Alignment: not needed: the Captain set this direction and asked for the design first on 2026-11-06.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: the comms officer renamed as a chief of staff whose conversation opens with a scan of the board, and the board in one time order, newest first.

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
