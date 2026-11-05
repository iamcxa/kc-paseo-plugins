---
title: Build slice 1 — the Commander's digest with sourced points and a Replay card, on a new comms officer
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d3-commander-digest-slice-1
status: implementation
gates:
    version: 1
    records:
        - id: gate:d3-commander-digest-slice-1:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d3-commander-digest-slice-1-backlog-1
              briefing:
                id: briefing:d3-commander-digest-slice-1:backlog:attempt-1:revision-1
                digest: sha256:fe198b208c3ff75cbb0f3daa71da6e2812716ec4ea21166061a851b2fdc3d560
                room-ref: ./d3-commander-digest-slice-1/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d3-commander-digest-slice-1:backlog:1
                briefing: briefing:d3-commander-digest-slice-1:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T15:37:32.614513Z"
                decision: approve
                reason: 'Captain chat 2026-11-05, asked 「開始寫第一片嗎？」 (slice 1: sourced digest, Replay card, new comms officer after confirm, collect now; scheduling in slice 2), answered 「可以」.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-05T15:38:47Z
worktree: .worktrees/spacedock-ensign-d3-commander-digest-slice-1
pr: 74
---

Build the accepted d1-commander-digest design's first slice: a new comms officer that writes the digest in its own words with an exact source per point and per context line, the Replay card behind each point, and a "collect now" action; scheduling comes in slice 2.

Captain, 2026-11-05: design accepted 「照這個方向可以」 (d1-commander-digest validation gate); collection 「只讀既有回報 (Recommended)」; frequency and cap 「照這個組合 (Recommended)」 (d2-collection-cost-probe validation gate: hourly background collection skipped when no new reports, at most 24 full rounds a day; while Bridge is open, update only affected points after 5 quiet minutes, at most every 15 minutes; the small update's cost measured in code, its cap set then); asked 「開始寫程式前，還剩一個決定：新的摘要指令要怎麼交給你現在的通訊官。它的設定是建立時就固定的，不能悄悄改。我建議由 Bridge 新開一個用新指令的通訊官，舊的封存，舊對話照樣可以讀。另一個做法是把新指令當訊息傳給現在這個，好處是對話接得上，但指令可能在長對話裡被忘掉。你要哪一種？」, answered 「開新的可以」.

bite: the Commander conversation is linear while topics interleave; a filtered replay built by inference was too complex (d1 bite); the Captain cannot see why a point matters without its cause and consequence (「我需要的是前因後果」).
consumer: the Captain, reading the digest in Bridge between other work and opening one point's Replay to decide.

## Scope

- Source contract from d1-commander-digest/design/EVIDENCE.md (AC-1 section, "建議的最小來源契約" and "脈絡行與前後視窗"): `fleetSnapshot` returns per-FO report sources `{hostId, agentId, epoch, seqStart, seqEnd, textHash, timestamp}`; the Commander returns one structured digest `{roundId, collectedAt, points:[{pointId, sentence, sources, contextLines:[about|before|now, sentence, refs]}]}`; Bridge validates round, sources and hashes before showing a point, else shows 「摘要無法驗證」.
- New comms officer: the new Commander prompt (read existing reports only, never prod an FO, missing report = unknown) on a newly created comms officer; Bridge offers the switch, archives the old one only after the Captain confirms, and the old conversation stays readable.
- Digest and Replay UI as in d1-commander-digest/mockups (review.html, cycle 5): digest in the Commander conversation; Replay card with the three context lines, each with its own source link; the quoted message in its own FO's timeline with two entries either side and earlier/later; exits open FO, keep discussing, reply with a new decision; phone sheet at 360.
- A "collect now" action runs one full collection; its tokens and time are recorded by turn id with the d2-collection-cost-probe method.
Non-goals: scheduling (hourly background and open-Bridge incremental updates — slice 2); prodding FOs; inferred attribution; changing gate decision or recording semantics; in-place permission approval; merging any flywheel PR.
Budget: one implementation task stacked on PR #69 (branch spacedock-ensign/r10-sidebar-count-popover at 33952f9b3d02fceab104ba09272d65e432a3d095); at most two repair cycles before the Captain sees it.
Stop condition: the SDK cannot read a source back exactly (epoch/seq/hash) without inference, or a collection cannot be measured without touching the live Bridge's files or ports — stop and report.

## Acceptance criteria

**AC-1**: Every digest point and every context line shows only its own exact sources, read back and hash-checked; a point that fails validation shows 「摘要無法驗證」 instead of text.
Verified by: tests on the structured digest validator (good digest, wrong round, foreign source, hash mismatch, missing ref) and a Replay read-back test against a fixture timeline.

**AC-2**: The Captain can open a point's Replay and act on it.
Verified by: captures at 1440 and 360 of the digest, a Replay with three sourced context lines and the same-FO window, earlier/later, and each of the three exits; the design director compares them with the cycle 5 mockups.

**AC-3**: The new comms officer replaces the old one only after the Captain confirms, and the old conversation stays readable.
Verified by: a test of the switch flow (no archive without confirm; archive after confirm) and a capture of the old conversation opened after the switch.

**AC-4**: One "collect now" round is measured.
Verified by: tokens (input, cached, output), provider requests and wall time by turn id on an isolated setup, compared with d2-collection-cost-probe's numbers.

UI proposal: build the accepted d1-commander-digest cycle 5 mockups (digest in the Commander conversation, Replay card with three sourced context lines and the same-FO window, three exits, phone sheet); add only the new comms officer switch and a collect-now action in the same style.
Preview: d1-commander-digest/mockups/review.html

## FO alignment

Alignment: not needed: the Captain accepted the design (d1-commander-digest), the collection rule (d2-collection-cost-probe) and the new comms officer on 2026-11-05; scope is slice 1 of that design.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: digest points in the Commander conversation, the Replay card, the new comms officer switch, and a collect-now action.

### FO notes

- 2026-11-05: worker preflight confirmed the known class (fixed 6787 listener, real-HOME data paths), so AC-4's measurement needs a configurable fleet listener/data directory, outside this task's scope; the worker proposed holding the task. FO steered: only the AC-4 item stops and reports the smallest change for the Captain; items 2–5 continue. Worker loaded the installed kc-dev-flow-2 0.35.0 implementation skill (dispatch named 0.34.0); the stage definition prefers the loaded skill root.
- 2026-11-05: worker asked FO to reserve an ADR number (0.35.0 implementation skill: one ADR per enduring decision). FO answered no number: workflow README number guards, POC bullet, "reserves no number"; the rulings stay in the task and d1 design until the Captain moves this out of POC.

## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto the previous stack layer (git reset --hard 33952f9b3d02fceab104ba09272d65e432a3d095, branch spacedock-ensign/r10-sidebar-count-popover) and confirm HEAD; read-only, read d1-commander-digest/design/DIGEST.md, design/EVIDENCE.md and mockups/REVIEW.md in the state checkout, and report how fleetSnapshot, the Commander's output and the Replay read-back will carry the source contract with the installed plugin SDK, and any SDK limit, before editing
  Dispatch branch was clean, reset to 33952f9b3d02fceab104ba09272d65e432a3d095 and verified before edits. Read d1 design/EVIDENCE/cycle-5 REVIEW; pre-edit SDK report used canonical cursor/epoch/range/SHA-256, host identity from client props, structured Commander output and in-Bridge Replay. SDK 0.12.0 has no jump-to-message navigation; exact contract exercised in digest.test.mts.
- DONE: Source contract and validator: fleetSnapshot returns per-FO report sources {hostId, agentId, epoch, seqStart, seqEnd, textHash, timestamp} from assistant messages only; the Commander returns the structured digest {roundId, collectedAt, points:[{pointId, sentence, sources, contextLines:[{kind: about|before|now, sentence, refs}]}]}; Bridge validates round, source membership, per-line refs and hashes before showing a point, else 「摘要無法驗證」; tests for good digest, wrong round, foreign source, hash mismatch and missing ref (AC-1)
  Candidate b8fb54c38cce2bbc7a9356961535d73902d69321: digest.test.mts accepts a matching digest and rejects wrong round, foreign source, changed hash, missing/foreign per-line refs, user roles and epoch/gap/reset/range changes. Removing those checks exposes the invalid sentence and fails its test; digest-ui.test.mts also rejects malformed collection prose and hides raw report snapshots.
- DONE: Replay card per the cycle 5 mockups: three context lines each with its own source link, the quoted message in its own FO's timeline with two canonical entries either side and earlier/later from the window edges, source-unavailable states shown separately from no-more-entries, three exits (open FO; keep discussing and reply with a new decision both return to the Commander composer with removable point context, never auto-send, never preselect a gate); phone sheet at 360; a read-back test against a fixture timeline (AC-1, AC-2)
  digest.test.mts expects canonical neighbors [3,4,5,6,7] and continuation from edges 3/7; reusing the anchor breaks it. Rendered tests and 30 hash-bound captures prove each line selects its own source, source-loss differs from end-of-history, both reply exits retain/focus the draft with zero sends, and an old async response cannot fill another point.
- DONE: New comms officer: a new COORDINATOR_PROMPT (read existing reports only, never ask an FO, missing report = unknown, structured digest output); Bridge offers the switch to a newly created comms officer and archives the old one only after the Captain confirms; the old conversation stays readable; tests for no archive without confirm and archive after confirm (AC-3)
  Fixture lifecycle tests observe no effects without confirm and create -> persist IDs -> archive after confirm; removing confirm changes the event list and fails. A confirmed archive retry reuses the saved replacement; rendered test/capture opens the retained old timeline read-only. No live officer was created, archived or switched.
- DONE: A "collect now" action runs one full collection; no schedule. Captures at 1440 and 360 of the digest, a Replay with three sourced lines and the window, earlier/later, each exit, the switch offer and the old conversation after the switch; npm test and typecheck pass; push the branch and open a Draft PR titled "feat(spacedock-bridge): commander digest slice 1 ..." with base spacedock-ensign/r10-sidebar-count-popover (AC-2, AC-3)
  Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/74 verified OPEN/Draft at b8fb54c38cce2bbc7a9356961535d73902d69321 on the required base. tests-verified.log: npm test 296/296; typecheck-verified.log: exit 0. phone-verified/desktop-verified contain 15 states each; capture-binding.json matches all source hashes, settled focus, no overflow, absent isolated PIDs, closed ports and removed homes.
- SKIPPED: Measure one collect-now round on an isolated setup: input, cached and output tokens, provider requests and wall time by turn id, per d2-collection-cost-probe/evidence/RESULT.md's method, compared with its numbers; if the measurement needs any change outside this task's scope (for example a configurable Bridge data directory or fleet port), do not make it: stop this item and report the smallest change (AC-4)
  FO explicitly directed only AC-4 to stop. Fixed 6787/real-home paths require configurable fleet listener and shared Bridge data directory, preserving current defaults; no such configuration added and no provider round run. RESULT.md records d2 cold probe 336753 input / 0 cached / 7397 output / 5 requests / 107.472s; no new sample or valid delta exists.
- SKIPPED: Author a new ADR for the accepted digest/officer decision.
  FO applied the workflow POC rule, "reserves no number"; Captain rulings remain in this task and d1 design. No docs/adr file added.
- SKIPPED: Run RoboRev in this worker.
  Dispatch package gap 5: sandbox cannot reach its daemon; FO owns the exact-head run with base 33952f9b3d02fceab104ba09272d65e432a3d095.

### Findings

- AC-4 remains unmeasured, not failed-as-zero: no new turn ID, input/cache/output usage, request count, wall time or billed price. Smallest prerequisite and comparison limits: d3-commander-digest-slice-1/evidence/implementation-3ZM3r3/RESULT.md.
- Package root is the loaded kc-dev-flow-2 0.35.0, as FO confirmed. design_surfaces passed; comment_ratio: 457 code / 0 comment lines (0.0%, max 5%); number_guards: no migrations path, PASS; adr_lint: 7 existing records checked. No R4 failure occurred.
- doc_impact returned []; OVERVIEW.md and coordinator/EXTENSION.md updated for affected claims. Base-goal fixture exercises the unchanged base fleetSnapshot and fails on absent exact report sources; candidate source/validator integration passes.
- Captures use production client/SDK UI with fictional SDK/RPC data and a no-op disposable server entrypoint. They prove rendering, source selection, retained values, focus, paging requests and navigation intent; not live-provider output, physical devices, soft keyboards or real server retention/races. Native host navigation has no exact-message cursor.
- Round membership is memory-only, bounded to 24 rounds; expired/restarted collections fail closed. Hashes prove identity, not paraphrase fidelity or causality. Bounded timeline entries without known request context also fail closed. Independent validation and design-director comparison remain with FO.
- Evidence: d3-commander-digest-slice-1/evidence/implementation-3ZM3r3/{RESULT.md,checks.json,capture-binding.json,pr-verified.json}. Earlier capture folders are rejected/superseded. The speculative focus delay was removed; final phone taps wait for settled host sheet transitions.

### Summary

Implemented the sourced collect-now digest, per-line Replay and confirmed replacement-officer flow on the pushed task branch; Draft PR #74 remains unmerged. No schedule, FO prompt, live-officer switch, gate/permission semantic change, new migration or persistent storage beyond switch IDs was introduced. AC-4 is intentionally skipped under FO steering; the exact-head review and independent design/validation handoff remain open.

## Investigation: roborev 1532

FO ran roborev on b8fb54c38cce2bbc7a9356961535d73902d69321 (base 33952f9b3d02fceab104ba09272d65e432a3d095): exit 1, evidence=roborev:1532, rerun roborev:1533 same three Medium findings.
1. shared/digest.ts collection tracking: an agent notification arriving as a user message resets collection tracking, so a malformed prose reply after it renders unverified.
2. shared/digest.ts digest detection: any assistant reply starting with `[` or `{` is treated as a digest, so an ordinary reply opening with a Markdown link shows 「摘要無法驗證」.
3. server/fleet-mcp.ts report byte budget: oldest first and counting rejected reports, so one oversized older report drops every newer short report.
Read-only investigation dispatched as implementation-1-followup-1 before any fix.

## Investigation: design director capture review 1

Design director (Codex gpt-6.1-sol high, agent 775d16e2, design-director's declared sonnet mapped per the Captain's 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」) on the 30 verified captures of b8fb54c38cce2bbc7a9356961535d73902d69321: NOT SATISFIED, three gaps.
4. Open FO exit: 1440-exit-open-fo.png and 360-exit-open-fo.png stay in the Commander with its composer; the mockups (1440-fo-chat.png, 360-fo-chat.png) show the named FO's conversation, its reply destination and the return to the Commander. Blocks action.
5. Source unavailable: 1440/360-source-unavailable.png present the three context lines normally, the warning below them on desktop and absent before the actions on phone; the mockups (source-missing.png) say first that the context cannot be checked and name the missing original. Blocks informed action.
6. Reading area and selected point: phone opening shows only two of the three context lines; after scrolling, both sizes keep only the generic Replay heading and lose the selected point; the mockups show all three lines on phone and keep the point visible. Extra scrolling, not a full block.
Not demonstrated by the capture set: long original text, multiple source ranges, switching between points.
Added to the read-only investigation (implementation-1-followup-1) before any fix.
