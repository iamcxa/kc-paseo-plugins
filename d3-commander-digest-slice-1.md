---
title: Build slice 1 — the Commander's digest with sourced points and a Replay card, on a new comms officer
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d3-commander-digest-slice-1
status: validation
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

## Captain amendments

### Amendment 1 — 2026-11-06, chat
Captain: 「再修一輪，只修這兩個 (Recommended)」
Asked: 第一片還剩兩個問題，而任務允許的兩輪修正已經用完。第一個是 FO 對話裡最早的那則回報查不到也打不開，但只會顯示「查不到」，不會給你錯的內容。第二個比較嚴重：Replay 整個讀取失敗時，三行脈絡還留在畫面上，看起來像已經核對過，其實當下無法確認。總工程師建議只修這兩個、再加一輪，修完不論結果都拿給你看。要怎麼做？ (options: 「再修一輪，只修這兩個 (Recommended)」 — "修完跑自動審查，然後不論結果都拿給你驗收。代價：你要再等一輪才能試用，而且審查可能又找到新的小問題。"; 「現在就拿給我試，兩個記成已知問題」)
Supersedes: none
Design: "one more repair cycle, for roborev 1540 findings 9 and 10 only; after it, the task goes to the Captain whatever the review finds" (beyond the seed's Budget line of two repair cycles)

## FO alignment

Alignment: not needed: the Captain accepted the design (d1-commander-digest), the collection rule (d2-collection-cost-probe) and the new comms officer on 2026-11-05; scope is slice 1 of that design.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: digest points in the Commander conversation, the Replay card, the new comms officer switch, and a collect-now action.

### FO notes

- 2026-11-05: worker preflight confirmed the known class (fixed 6787 listener, real-HOME data paths), so AC-4's measurement needs a configurable fleet listener/data directory, outside this task's scope; the worker proposed holding the task. FO steered: only the AC-4 item stops and reports the smallest change for the Captain; items 2–5 continue. Worker loaded the installed kc-dev-flow-2 0.35.0 implementation skill (dispatch named 0.34.0); the stage definition prefers the loaded skill root.
- 2026-11-05: worker asked FO to reserve an ADR number (0.35.0 implementation skill: one ADR per enduring decision). FO answered no number: workflow README number guards, POC bullet, "reserves no number"; the rulings stay in the task and d1 design until the Captain moves this out of POC.
- 2026-11-06: chief-engineer (Codex gpt-6-astra xhigh, agent 3342d0e7) on the repair tail after roborev 1540: converging in scope, failure-path closure incomplete; finding 9 fails closed (a sequence-0 source cannot be checked or opened); finding 10 can make context that cannot currently be checked look verified. Recommends the Captain authorize one more repair cycle for 9 and 10 only, returning to him after it even if findings remain.

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

## Investigation result: roborev 1532 and design review 1

Investigated the unchanged candidate `b8fb54c38cce2bbc7a9356961535d73902d69321`. Findings 1–3 and the design variances in 5–6 are confirmed; 4 confirms missing delivered-journey evidence, not a demonstrated failure of real host navigation. No product edits, candidate commits, candidate pushes, PR changes, live daemon/FO operations or new captures were performed.

Method: two inline, fixture-only `node --import tsx --input-type=module` runs exercised the candidate's actual classifiers, `fleetSnapshot` and mounted Bridge through its existing test helper; five code probes and two design probes completed successfully by asserting the observed defective behavior. No regression tests or fixes were added. Compared the existing verified 1440/360 screenshots with the cycle-5 images and read the installed 0.12.0 plugin SDK declarations. Code references below are relative to `spacedock-bridge/` at that exact head.

### 1. Confirmed — an agent message clears collection validation

- Path: `shared/digest.ts:64-70` changes `collection` on every `user_message`; `client/co-chat.tsx:259-260,449-455` uses that set to choose verified DigestMessage or unrestricted MarkdownView. `shared/preview.ts:73-81` already identifies the supported agent envelopes; `shared/chat-lines.ts:20-24` even renders them as agent data, but the collection classifier ignores that distinction.
- Reproduction: collect request seq 1 → an `agent-notification` user entry seq 2 → malformed prose seq 3. The prose is visible and `digest.read` is called zero times. The same result occurs for `agent-message`; a non-collection Bridge automated notification also clears the flag. This is a source-validation bypass, not merely a missing badge (AC-1).
- Class: non-Captain messages mistaken for human turn boundaries. Both agent-envelope kinds and the automated-message family in `shared/reviews.ts:16,70-75` are affected through this one classifier. Bounded repository/shared/client/server searches found one collection-state reducer and one consumer, not multiple independent implementations. `preview.lastReply:24` has a similar raw boundary but does not control digest validation; a separate defect there was not established.
- Smallest proposed class fix: classify supported message provenance before changing collection state. A Bridge collect request begins the collection; recognized agent messages/notifications and other Bridge automated data do not end it; an actual Captain request ends it. Reuse the existing envelope/automated marker rules and retain unknown-page fail-closed behavior. Do not parse an agent envelope's body as a new Captain/collection request.
- Proposed regression: parameterize collect → agent-notification / agent-message / Bridge automated message → malformed prose, and require verification error, no visible prose, and a digest-validation call. Today the first two render prose with zero calls. Include a genuine user request (and human-kind envelope) control that restores normal discussion, plus a truncated-page control that still fails closed.

### 2. Confirmed — ordinary Markdown/JSON is mistaken for a digest

- Path: `shared/digest.ts:25` matches any leading `[` or `{`, any JSON-style object fence, or a mentioned `"roundId":` / `"contextLines":` field anywhere; `:70` applies it even after a known ordinary Captain request. The same `client/co-chat.tsx:449-455` path replaces the answer with DigestMessage; `server/digest.ts:34-36` rejects non-digests, producing `client/digest.tsx:25`'s error text.
- Reproduction: ordinary user question → `[Design notes](https://example.invalid/design) explain this direction.` The mounted Commander hides the link answer and shows 「摘要無法驗證」, with one digest-validation call. Ordinary array `[1,2,3]`, object `{"count":3}`, a fenced JSON example and prose mentioning `"roundId":` all trigger the classifier too. No URL was opened.
- Class: content punctuation/field mentions used as message provenance. All these formats share `isDigestText`; no second classifier implementation was found. The branch is broader than “Markdown link” and cannot be repaired by special-casing links alone.
- Smallest proposed class fix: separate expected collection output from ordinary discussion. Known collection replies must be validated regardless of syntax; known ordinary replies must not become digests solely because of brackets, braces, code fences or quoted field names. Preserve fail-closed handling for unknown/truncated context and explicit digest records; remove or narrow opportunistic sniffing so it is not a substitute for provenance. Coordinate this change with finding 1's boundary rules.
- Proposed regression: after an ordinary user request, render each ordinary format above unchanged, without a digest-validation call; today all classify as digests. In the same suite, retain malformed collection prose, wrong-round JSON and missing preceding-request controls, which must still show an error. Do not solve the false positive by allowing invalid collection text through.

### 3. Confirmed — rejected old reports exhaust the budget for new reports

- Path: `server/fleet-mcp.ts:54-63` iterates the canonical tail page in its chronological entry order and increments `bytes` before checking admission. Once that cumulative value exceeds 64,000, every subsequent report is rejected, even if the oversized report itself was omitted. `server/digest.ts:19-24` sends this incomplete set to the Commander as the collected sources.
- Reproduction against the real `fleetSnapshot` with a fictional SDK page: old 64,001-byte report + new short report yields no sources / `state: unknown`; old short + oversized middle + new short yields only seq 1; old 64,000-byte + new one-byte report also yields only seq 1. An old `漢` repeated 21,334 times (64,002 UTF-8 bytes) similarly drops the new short report. Every case reports truncation, but available recent evidence is lost.
- Class: bounded selection spends capacity on rejected items and prioritizes older evidence. The sole report-byte accumulator is `server/fleet-mcp.ts:56-63`; searches for byte counters/caps and timeline selectors found no independent copy. Earlier budget use and oversized entries are two triggers of the same selection defect.
- Smallest proposed class fix: consider eligible canonical reports newest-first by sequence, charge UTF-8 bytes only when an entry is admitted, skip an entry that cannot fit, and remember every omission for `truncated`. Return admitted sources in canonical order. Keep the existing 40-entry/64,000-byte limits and assistant-only/source-identity checks.
- Proposed regression: oldest/middle/newest oversized reports must not suppress eligible short reports; when an older report would consume the remaining capacity, keep the newer report. Cover UTF-8 and exact-boundary cases, total admitted bytes ≤64,000, chronological output, excluded user/tool entries and truncation. Today the four reproduced fixtures select [] / [1] / [1] / [] instead of retaining their newest short entry.

### 4. Confirmed evidence gap — Open FO does not demonstrate a conversation and return

- Path: `client/digest.tsx:87` closes Replay and invokes `navigation.openAgent({agentId,serverId})`. The capture's `proof-host.tsx:53` replaces that real host method with `fixture.opened.push(value)`; `capture.py:148-151` checks only the recorded agent ID, then captures the still-open Commander. The unit helper similarly records the call. Thus the 1440/360 exit screenshots cannot prove either successful navigation or a return path.
- SDK boundary: `@getpaseo/plugin/dist/client/contracts.d.ts:19-36` exposes a real named-agent/host navigation command, `openAgent`, not merely a plugin-created event. It returns void and supplies no arrival acknowledgement, message cursor, return URL or back-to-Bridge callback. `PluginScreenProps` has no `openScreen`; that capability belongs to sidebar/command contexts (`:54-63,186-192`). Actual host navigation and host-owned back behavior were not exercised here, so the stronger claim “the real SDK cannot open an FO” is not established.
- Existing smallest integrated path: Board already retains FO conversation-only details (`client/board.tsx:403-412,524-526,584-590`) and supplies ← Commander (`:579-580`); Commander stays mounted (`:593-595`). A mounted probe opened A FO, observed its named composer and no gate controls, then returned with the exact Commander draft retained. This requires no new SDK return API.
- Smallest proposed fix: route Replay's exact source host/agent into that existing Bridge FO conversation-only detail through a callback, retaining the Commander surface and its return control. Check exact host/agent identity; do not substitute a different row or gate when the source is unavailable. If external host navigation is retained instead, the capture must delegate the real host method and prove arrival/back, not replace it with a recorder.
- Proposed regression/capture: at 1440 and 360, Replay → Open FO must show that FO's existing message, named reply destination and ← Commander; enter an unsent FO draft, return to the retained Commander draft/position, and verify no send or gate preselection. The current capture/test only passes navigation-intent assertions and fails this journey criterion. Match cycle-5 `1440/360-fo-chat.png`.

### 5. Confirmed — unavailable-source warning follows apparently verified context

- Path: `client/digest.tsx:55,61` records an anchor read failure, but `:74-77` always renders the selected sentence, three normal context lines and their links before `:79` renders the generic warning. No warning identifies the requested original. On the captured 360 sheet the warning is below the visible reading area while actions stay visible; the mounted probe confirms all three context sentences precede the error in DOM order.
- Comparison: cycle-5 `source-missing.png` first says context cannot be checked and names the FO/original; its contextPanel substitutes an unavailable-context notice. Candidate `1440/360-source-unavailable.png` leaves the confident context display intact. This is not proof that the original hash matched after the failed read (AC-1/AC-2).
- Class: verification failure is presented as an appended detail instead of the leading state of the evidence it qualifies. All context lines/refs share the unconditional render. Distinguish an unavailable anchor/required context from a missing earlier/later side; those side errors must keep their separate end/unavailable semantics.
- Smallest proposed fix: put a request-specific “context cannot currently be checked” status and the requested original's FO/time/sequence before the context; suppress or visibly qualify uncheckable lines. Keep allowed exits. A null `readReplay` result can also arise from another failed point ref (`server/digest.ts:42-44`), so identify the requested original without falsely naming it as the actual failed ref; return explicit failure/ref detail if that stronger attribution is needed.
- Proposed regression/capture: on null/error, the leading warning must precede normal context and remain visible before actions at both sizes, including long content. Check the named requested source and absence of unqualified context; also test a missing sibling ref versus missing selected anchor. Today the warning follows all context and is offscreen in the initial 360 capture.

### 6. Confirmed — constrained reading area and scrolling point identity

- Path: `client/digest.tsx:71` fixes the header to generic Replay; `:72` hard-codes body height 540/620; `:73-77` places the only selected-point sentence, stacked context labels/full timestamps and a duplicate source-link list in the scrolling body. The stacked fixed phone actions at `:85-91` further constrain the reading area. The mounted probe finds the point sentence only once, inside `Replay 內容`; the verified phone opening shows two context lines, and both expanded-bottom screenshots lose the selected point.
- Comparison: cycle-5 `360-replay.png` shows all three normal context lines initially; `1440-replay-long-end.png` keeps the selected point above the scrolled source window. Existing final captures are direct evidence of the variance, not a native focus or timing failure. It adds scrolling and loses orientation; the director did not describe it as a full action block.
- Smallest proposed fix: keep the selected-point heading outside the scrolling area; use available modal body space rather than arbitrary fixed heights, compact the three-line summary toward the accepted layout and remove duplicated source controls. Use the SDK's sheet-aware ScrollView (`client/react-native.d.ts:37-38`) where appropriate. Keep the actions fixed and history independently scrollable. The public Modal contract has content styles/scroll control but no initial snap/height option: do not promise an unsupported SDK snap setting; if supported layout cannot fit the accepted normal summary, return that concrete host constraint to FO rather than silently changing the design.
- Proposed capture assertions: at 360×780, all three normal context lines and their individual source links are within the initial reading viewport; after scrolling to the true bottom at both sizes, the selected point and all exits remain visible. Add long-original top/bottom states, switch among trial/booking/import points (including retained drafts and delayed reads), and verify that source/FO identity changes correctly. DOM presence and visible action bounds alone are insufficient.
- Capture-coverage nuance: the existing fixture does contain three distinct singleton source refs (#3/#5/#7) and individual link captures; that basic multi-source selection is demonstrated. It has short originals, always opens the trial point, and does not demonstrate long/multi-entry ranges or point-switch rendering. The collector intentionally emits singleton canonical ranges; do not manufacture merged ranges just to label a capture “multiple sources”.

Disposition: investigation complete; fixes are proposals only. Candidate remains clean at the pinned SHA and PR #74 is untouched. Await FO's separate authorization for the affected class-level repairs and their regression/capture scope.


## Stage Report: implementation (cycle 2)

- DONE: Fix authorization for items 1-3 of "## Investigation result: roborev 1532 and design review 1": implement the proposed class-level fixes (message provenance before collection state; collection replies validated by provenance, not by brackets, braces, fences or field mentions; newest-first admission charging only admitted bytes) with the proposed regressions, each shown failing at b8fb54c38cce2bbc7a9356961535d73902d69321 and passing after (AC-1)
  `cdc488ef7dd7640b1e58fde9c909c41f7d27e83e`; final regressions fail on b8fb54c (19 expected failures overall), then whole suite passes 318/318. Provenance notifications, six ordinary formats and four failing budget selections have named failures; unknown/human/UTF-8 boundary controls remain checked. See `d3-commander-digest-slice-1/evidence/repair-hZpDwQ/RESULT.md` and `red-binding.json`.
- DONE: Fix authorization for items 4-6: Open FO routes the exact source host/agent into Bridge's existing FO conversation-only detail with ← Commander and retained drafts; the unavailable-source state leads the card, names the requested original and qualifies or suppresses uncheckable lines; the selected point stays outside the scroll area and the phone opening shows all three context lines with the actions fixed — if the supported SDK layout cannot fit that, stop and report the host constraint instead of changing the design (AC-1, AC-2)
  Exact source host/agent now opens existing conversation-only detail, preserving both drafts and ← Commander. Unavailable context leads and suppresses uncheckable lines; the point is outside history. Supported SDK flex/ScrollView fits three initial phone lines and fixed actions; no host constraint or design fallback was needed.
- DONE: New captures at 1440 and 360 of the states the director reviewed plus Open FO arrival and return, source unavailable, phone opening with three lines, scrolled bottom with the point visible, a long original, and switching between two points; npm test and typecheck pass; commit, push to the PR #74 branch (no force push), and write "## Stage Report: implementation (cycle 2)" naming the new head (AC-2)
  New head `cdc488ef7dd7640b1e58fde9c909c41f7d27e83e` pushed normally to Draft PR #74. Forty final fixture-host captures (20 at each size), all 91 candidate-file hashes matching, are in `phone-final/`, `desktop-final/` and `capture-binding.json`. `npm test` 318/318; typecheck exit 0; all capture hosts/PIDs/ports cleaned.
- SKIPPED: AC-4 measurement.
  FO ruling stands: needs configurable fleet listener/data directory with current defaults; no live Bridge or provider round was touched, and no cost claim is made.
- SKIPPED: ADR record.
  FO applied the workflow POC rule “reserves no number”; Captain rulings remain in the task and accepted design, with no docs/adr changes.
- SKIPPED: RoboRev in worker sandbox.
  The daemon is inaccessible (package gap 5); FO runs review on the pushed head against 33952f9b3d02fceab104ba09272d65e432a3d095.

### Verification and limits

Evidence root: `d3-commander-digest-slice-1/evidence/repair-hZpDwQ/`. `checks.json` binds logs and exits. Comment ratio 0.0% (486 code, 0 comment lines); number guards PASS on the explicit stack base; seven existing ADRs linted; design surfaces presentable; doc impact empty and affected OVERVIEW claims updated. Candidate, main and flywheel-live were checked clean; PR #74 remains OPEN/Draft at the named head, with no CI jobs reported.

Falsifiers: ignoring agent/automated provenance exposes malformed collection output; punctuation sniffing hides ordinary examples; old accumulation drops recent sources; forwarding native navigation fails internal FO arrival; leaving context visible on read failure breaks unavailable-state checks; moving the point into history breaks orientation/bottom checks. Boundary controls include exact UTF-8 budget, excluded user/tool entries, foreign host/agent refusal, human requests and truncated-context fail-closed handling.

### Summary

All six authorized repairs are implemented, tested and pushed; both final viewport runs match the committed files and demonstrate the requested journey. This remains a bounded POC with fixture RPC/timeline captures and server-function tests, not provider-quality, physical-device, live-fleet or delivery acceptance. FO owns RoboRev, independent validation and design-director re-review; the PR remains Draft.

## Investigation: roborev 1536 and design review 2

Design director review 2 (Codex gpt-6.1-sol high, agent 302cb384) on the 40 captures of cdc488ef7dd7640b1e58fde9c909c41f7d27e83e: SATISFIED — Open FO arrival and return, the leading unavailable-source state, and the phone opening with three lines and a kept selected point all match the mockups; no new visible blocker. Unpictured: multiple source ranges within one context line.

FO ran roborev on cdc488ef7dd7640b1e58fde9c909c41f7d27e83e (base 33952f9b3d02fceab104ba09272d65e432a3d095): exit 1, evidence=roborev:1536, two Medium findings.
7. server/digest.ts parsing: a digest split across adjacent assistant entries (which the chat renderer already joins) fails validation although the combined text is valid.
8. client/co-chat.tsx and useCoAsk: the Commander question reader still publishes rejected collection replies to the Commander header and sidebar (malformed collection prose with "Next: ... (you)" shows as a Captain question). Same class as item 1 (collection provenance), reaching a second consumer — repair cycle 2, the last the seed's budget allows before the Captain sees it.
Read-only investigation dispatched as implementation-1-followup-4 before any fix.


## Investigation result: roborev 1536

Investigated unchanged candidate `cdc488ef7dd7640b1e58fde9c909c41f7d27e83e`. Items 7 and 8 are confirmed. No candidate files, test files, branch commits/pushes, PR state, live Bridge files, daemon or FO agents were changed; only this authorized task-body report is written and state-committed. Design review 2's recorded SATISFIED result is unchanged by this investigation.

Method: three inline fixture-only `node --import tsx --input-type=module` runs exercised the actual server handlers, mounted product components through the existing test helper, and the shared classifiers. One server probe, five mounted probes and six classifier cases completed with exit 0 by asserting the current behavior; these are reproductions of defects, not passing repair regressions. No new tests, captures or evidence files were added. All code references below are relative to `spacedock-bridge/` at the named head.

### 7. Confirmed — a split digest has no complete read/render path

- Server path: `server/digest.ts:28-39` reads exactly one canonical entry (`limit: 1`), requires that entry itself to match both input endpoints, then parses only `entry.item.text`. `:41-45` repeats that reader for Replay, so changing only the visible conversation cannot repair Replay. `shared/digest.ts:27,36,44` already carries start/end positions through both RPCs, but a multi-entry interval is not implemented by the server.
- Client path: `client/co-chat.tsx:258-262,451-453` deliberately maps each canonical entry through `toLines([entry])`, records that entry's end, and mounts a separate DigestMessage per assistant fragment. `shared/chat-lines.ts:16-35` normally joins neighboring same-role messages, as does `useCoAsk` at `client/use-co-ask.ts:45`; the active digest-aware Commander path specifically bypasses that joining. Thus the review's “renderer already joins” is true of the shared/ordinary renderer, but not the current sourced Commander path.
- Reproduction: a real fixture collection establishes a round and exact FO source. One complete assistant JSON entry validates. Split the identical JSON bytes between adjacent canonical singleton entries #10 and #11: `JSON.parse(toLines(entries)[0].text)` is the same valid digest, but reads of #10, #11 and interval #10–11 all return null. Mounted Commander sends positions [2,2] and [3,3] for a two-fragment reply and shows two verification errors. This fails valid digest delivery, rather than exposing unverified text.
- Smallest class fix: group bounded, contiguous canonical assistant chunks into one logical reply, preserving the first/last sequence and provenance; use that same grouping for Commander display and server digest reading. The server must read the declared interval completely, verify agent/epoch/canonical singleton identity and contiguity for every chunk, concatenate exact text bytes in order, and only then run the existing JSON/schema/round/membership/hash validator. Reuse that interval in readReplay. Bound the interval by the existing 120-entry Commander read budget and refuse reversed/oversized, partial, stale, gapped, collapsed or mixed-role intervals. Do not infer missing fragments, search similar text, widen FO report-source ranges or relax hash validation.
- Proposed regression: collect a fixture round, split its valid JSON into two and three adjacent assistant entries, require one rendered digest and a functioning point Replay with its exact [start,end] position; the same valid singleton remains a control. Today the split cases fail at both server and mounted UI boundaries. Missing/reordered chunks, a non-assistant interposition, wrong epoch/agent, collapse, truncated first/last chunk, an over-budget interval and wrong-round/hash data must remain unavailable; ordinary split discussion must still join as before. A client-only join, a server-only join, or parsing just one fragment must each fail a named test.

### 8. Confirmed — collection validation is bypassed by the question reader

- Root path: `client/use-co-ask.ts:41-48` independently reads the projected tail, calls `toLines`, then `nextStepIsCaptains`/`replyPreview` on the last assistant text without `digestSequences` or digest validation. The protected conversation at `client/co-chat.tsx:260-262,451-453` rejects that same reply. `shared/preview.ts:11-13,35-48` is only a text/status formatter; it has no request provenance and cannot distinguish collection text from ordinary discussion. This is one second direct reader with several downstream surfaces, not a separate parser in every header or badge.
- Reproduction: collect request → `REJECTED_RAW_BODY` plus `Next: Leak collection question (you)`; digest.read returns null. At desktop and compact, the main conversation hides the body and shows 摘要無法驗證, while the question preview is visible. Desktop Commander card and detail header display the false question; compact By decision and By FO both display it. With Bridge unmounted and no gates, the sidebar counts one question and its popover offers “Open Leak collection question (you)”; digest.read is called zero times in that sidebar-only case. Mounted probes send nothing.
- Provenance cases: direct collection, intervening agent-message, agent-notification, other Bridge automated data and missing preceding-request context all remain collection/unknown according to the existing `digestSequences`, yet the current question formatter publishes the same false question in each. A genuine Captain discussion is the control: it correctly remains an ordinary question. Applying the existing classifier at the shared question-reader boundary closes the header/sidebar fan-out; hiding just the header or just the popover does not.

### Complete consumer inventory within the candidate's Bridge boundary

Two bounded searches were used: all timeline/refetch/subscription and reply formatter imports/calls across client/shared/server; then role/coordinator identities, activity/last-message alternatives and every registered client/server contribution across the candidate repository. The registered surfaces are exactly Bridge screen, sidebar header and Fleet workspace/explorer panel (`index.client.tsx:11-32`). The direct readers and their complete downstream outputs are:

- Active Commander conversation: `bridge.tsx:78-93` → `co-chat.tsx:258-262,439-459` → DigestMessage/readDigest. **Protected when host identity is present:** collection/unknown replies go to validation, including malformed prose. Ordinary replies go to MarkdownView; `AgentNote` displays separately attributed agent envelopes, not Commander collection answers. The compact/desktop chat title at `co-chat.tsx:398-405` contains title/working status only, not a reply preview.
- Commander question reader: `use-co-ask.ts:41-48`, instantiated by `bridge.tsx:26-28` and `use-waiting.ts:57`. **Exposed direct reader:** it can publish unvalidated collection prose and unknown-provenance text as a Captain question. It must consume the same canonical provenance classification as the conversation, before any Next parsing.
- Bridge detail header: `bridge.tsx:98` → `board.tsx:593-594`. **Exposed:** renders coAsk.text above the conversation independently of DigestMessage, at both viewport sizes.
- Desktop pinned Commander card: `board.tsx:462-467`. **Exposed:** renders the false question, waiting status and age even though its conversation rejects the reply.
- Compact question rows in both board views: `board.tsx:445-455,513-517,532`. **Exposed:** By decision/Questions and By FO/Comms officer display the same coAsk.text and its selection control. These are two placements of the same unvalidated result.
- Board totals, filters, section counts and empty-state selection: `board.tsx:382,392-395,471,478-500,515`. **Exposed derived state:** the invalid question contributes one pending item; no independent raw-text reader exists here.
- Waiting-list construction and preview: `use-waiting.ts:57,86-92` consumes a separate useCoAsk instance and creates `{key: "comms", title: question.ask, ...}`. **Exposed:** operates before Bridge mounts. The raw-to-title shortening is `shared/preview.ts:35-48` through useCoAsk, not an additional independent Commander preview parser.
- Sidebar badge, its accessibility label, popover/sheet title list, Questions/total counts, age/order and navigation target: `sidebar-waiting.tsx:15-19,29-54,58-65`. **Exposed downstream:** all consume useWaiting; popover and compact sheet share WaitingPopover. Fixing only Bridge's own hook instance would leave these active. No raw reply is rendered by SidebarRow's Bridge label itself.
- Digest points, Replay context/original window, removable point context and explicit reply quote: `client/digest.tsx`, `server/digest.ts:39-45`, `server/report-sources.ts:30-46`, `co-chat.tsx:453,439-450,470`. **Protected data path:** points enter via verifiedDigest; Replay rereads through the validator, and point context comes from the verified point. They do not create a separate Next question. Item 7 currently prevents split digests from reaching this valid path.
- Previous-officer read-only conversation: `bridge.tsx:75` invokes CoChat without digestHostId; `co-chat.tsx:258,262,451-459` therefore uses the ordinary renderer. **Conditionally exposed renderer:** a supplied history containing a collection reply displays its raw body, proven with a fixture and zero digest calls. Current switching selects a legacy officer (`server/coordinator.ts:94`) while collect-now requires the current digest version (`server/digest.ts:17`), so a normal current-version collection into that previous officer is not established; do not count this conditional fixture as an observed live/normal switch bypass. The optional missing-host active-Bridge fallback has the same ordinary-renderer branch; today's SDK screen supplies host identity, so that fallback is likewise conditional. Both should be explicit Commander-reader cases in a class-level repair, rather than silently relying on a generic FO renderer.
- Fleet panel, FO previews/queues and decision delivery reader: `index.client.tsx:15-16`, `shared/board.ts:12,114-115,131-158`, `shared/queue.ts`, `decision-card.tsx:152`. **No direct Commander-reply consumer:** BoardPanel supplies no comms/coAsk; observeBoard/fleetSnapshot are role=fo only, and the decision delivery read is the claimed FO. The generic `lastReply` formatter is used here for FOs, not by useCoAsk. Blanket-changing FO question/gate semantics is unnecessary.
- Native full-view handoffs and external activity readers: `co-chat.tsx:391-404` and the Fleet panel's `board.tsx:172-176,463` open the named agent in the host. `shared/coordinator.ts:97-98` also tells FOs to verify Captain User lines through get_agent_activity. **Outside Bridge rendering authority:** native chat, external agents and manual activity readers can access original timeline records; their rendering was not exercised here and cannot be certified by this fixture inquiry. No registered timeline transform or outgoing reply notification filter exists in this candidate; `index.server.ts:31` only remembers the API. Do not claim a Bridge fix hides or validates raw records across the entire Paseo host.

### Smallest combined repair and failing-before/passing-after plan

Keep one shared function for bounded canonical reply grouping and request provenance, reusing parseEnvelope and AUTOMATED_MARKER. Have both Commander renderers and useCoAsk consume it; only known ordinary Captain-discussion replies may enter Next/preview extraction. Collection replies must stay in the digest-validation path and unknown provenance must fail closed, including when Bridge is unmounted. Canonical reads must retain their identity/reset/gap/error checks; do not classify projected/merged text by punctuation. Missing identity should show unavailable instead of selecting the ordinary-text fallback. This needs no persistent collection record, new schedule, new gate behavior or post-render redaction.

For item 8, parameterize malformed collection prose and rejected structured replies across both agent-envelope kinds, other automated data and truncated context. Require no raw text/false question in active Commander header, desktop card, both compact board views, sidebar badge/count/accessibility label or popover preview/target, including sidebar-only, retry and subscription-reload cases. Keep other real FO/gate counts intact; do not hide the whole list. Include previous-officer/missing-identity render paths as conditional guard tests, and genuine Captain questions, Markdown/JSON discussion and non-Captain Next lines as controls. Today the mounted header/board and sidebar-only cases fail those requirements. An implementation confined to one visible consumer must still fail the other-reader test. Existing hook fixtures that begin with an orphan assistant reply must gain real preceding Captain requests when they claim ordinary-question provenance; otherwise the new fail-closed control would rightly reject them.

The regressions above are proposals only. Candidate remains clean at the pinned SHA; no repair or candidate push is authorized by this investigation. Stop here for FO's fix authorization and final-cycle scope decision; AC-4 remains skipped and PR #74 is untouched.


## Stage Report: implementation (cycle 3)

- DONE: Fix authorization for items 7-8 of "## Investigation result: roborev 1536": implement the "Smallest combined repair" exactly as proposed — one shared bounded canonical reply grouping plus request provenance consumed by both Commander renderers and useCoAsk; the server reads and validates the full declared interval for digest and Replay; only known ordinary Captain-discussion replies reach Next/preview extraction; unknown provenance fails closed including with Bridge unmounted (AC-1)
  `ccb29f5ac1e4dce03681cc6e86bfc331466446c0`: shared canonical grouping/provenance now feeds active and previous Commander plus useCoAsk; digest and Replay validate the entire declared interval. Unknown requests and missing identity fail closed; a DOM-mutation test also proves identity loss cannot briefly expose raw JSON. No persistent collection state, scheduling or gate changes.
- DONE: The proposed regressions for item 7 (two- and three-entry split digests render one digest with a working Replay; the listed refusals stay unavailable; client-only, server-only and one-fragment joins each fail a named test) and item 8 (every listed consumer: header, desktop card, both compact board views, sidebar badge, count, label and popover, sidebar-only, retry and reload; conditional guards for the previous officer and missing identity; the listed controls), each failing at cdc488ef7dd7640b1e58fde9c909c41f7d27e83e and passing after (AC-1)
  `reviewed-final.log`: final tests on cdc488e yield 41 expected failures / 21 passing controls; `npm-test-final.log` passes all 380 tests. `regression-binding-final.json` binds final bytes and three failing partial-fix mutations: client-only, server-only and first-fragment-only. Tests cover all listed consumers, sidebar-only/retry/reload, identity/history guards, interval refusals and ordinary-discussion controls.
- DONE: Recapture only the states whose pixels change, at 1440 and 360; npm test and typecheck pass; commit, push to the PR #74 branch (no force push), and write "## Stage Report: implementation (cycle 3)" naming the new head (AC-1, AC-2)
  Final head `ccb29f5ac1e4dce03681cc6e86bfc331466446c0` pushed normally to Draft PR #74. Eighteen affected-state captures (nine per viewport) bind all 94 candidate files in `capture-binding.json`; all isolated PIDs/ports/homes are cleaned. `npm test` 380/380 and typecheck exit 0; unchanged layout states were not recaptured.
- SKIPPED: AC-4 measurement.
  FO ruling stands: needs configurable fleet listener/shared data directory with current defaults; no live Bridge or provider round was touched, and no cost claim is made.
- SKIPPED: ADR record.
  The recorded POC profile “reserves no number” under FO's ruling; no docs/adr change or number was created.
- SKIPPED: RoboRev in worker sandbox.
  Daemon inaccessible (package gap 5); FO runs the final pushed head against 33952f9b3d02fceab104ba09272d65e432a3d095.

### Verification and limits

Evidence root: `d3-commander-digest-slice-1/evidence/final-repair-GprKDK/`; see RESULT.md, checks-final.json, regression-binding-final.json, capture-binding.json and cleanup-verified.json. Package checks all exit 0: comment ratio 0.0% (525 code / 0 comment lines), number guards PASS on the explicit stack base, seven existing ADR records linted, design surfaces presentable, doc impact empty; affected OVERVIEW claims updated. Candidate, main and flywheel-live remain clean; PR #74 is OPEN/Draft at the named head, with no CI jobs reported.

Falsifiers: restoring either one-entry reading or per-entry client display breaks split digest/Replay tests; ignoring trailing chunks breaks the one-fragment refusal; publishing collection/unknown text to Next breaks header/board/sidebar tests; missing-identity Markdown fallback breaks the DOM-mutation transition test. Real FO/gate counts and ordinary Captain question controls remain checked. Canonical metadata and real preceding Captain requests were added only to ordinary-question fixtures that had claimed that provenance without evidence.

### Summary

The exact authorized combined repair is implemented and pushed in dd01927 and the final head above, completing the seed's last repair cycle. All affected views are captured through fictional SDK/RPC timelines; real server-function tests prove interval/source behavior separately, with no claim about provider quality, native Paseo chat, external readers or live/physical-device acceptance. FO owns RoboRev, independent validation and final review; the PR stays Draft.

## Investigation: roborev 1540

FO ran roborev on ccb29f5ac1e4dce03681cc6e86bfc331466446c0 (base 33952f9b3d02fceab104ba09272d65e432a3d095): exit 1, evidence=roborev:1540, two Medium findings. The seed's two repair cycles are spent; no further fix is authorized before the Captain sees the task.
9. server/report-sources.ts and server/digest.ts: both readers use cursor seqStart - 1, so a source at sequence 0 sends cursor -1, which the installed Paseo 0.12.0 protocol rejects; such a report cannot validate or open in Replay.
10. client/digest.tsx: when the Replay request itself throws (for example while revalidating the Commander timeline), only the earlier/later side is marked unavailable and the three context lines stay, without the leading warning — the item 5 surface repaired in cycle 1.


## Investigation result: roborev 1540

Investigated unchanged candidate `ccb29f5ac1e4dce03681cc6e86bfc331466446c0`; findings 9 and 10 are confirmed. Captain amendment 1 was read first: one further repair cycle is limited to these two findings, after which the task goes to the Captain whatever review finds. This dispatch authorizes investigation only; no candidate/test edits, candidate commits/pushes, PR actions, captures, daemon launches or live operations were performed. Only this task-body report is written and state-committed.

Method: three inline fixture-only `node --import tsx --input-type=module` invocations exercised actual candidate functions and mounted components through the unchanged test helper. The sequence-zero probe used the installed 0.12.0 protocol schemas; the server failure matrix exercised 21 combinations; nine mounted probes asserted the observed UI behavior. All exited 0 as reproductions/controls, not as passing repair tests. No new regression or evidence files were added. Candidate references below are relative to `spacedock-bridge/`.

### 9. Confirmed — predecessor cursors are invalid for sequence zero

- Contract and protocol: `shared/digest.ts:4-8,27` accepts nonnegative source/digest sequences; `report-sources.ts:13-19` admits a canonical assistant source at #0. Installed `@getpaseo/protocol/dist/messages.js:1549-1564` requires cursor.seq to be a nonnegative integer and permits an omitted cursor; `@getpaseo/client/dist/daemon-client.js:1986-1997` parses the request before sending it. A cursor object with seq 0 is retained and legal; seq -1 is rejected before transmission. This is a zero-boundary error in deriving a predecessor, not a protocol rejection of zero itself.
- Reproduction with the real protocol parser guarding the fictional reader: source #0 makes readSource reject, validateDigest mark the point invalid, and replayWindow return null; source #1 reads successfully with cursor #0. A valid collected Commander JSON record at #0 also makes readDigestHandler reject. Both offending call sites issue cursor -1. No real daemon behavior or earliest live report was sampled.
- Complete cursor-reader inventory: `server/report-sources.ts:21-26` derives source.seqStart - 1 for an exact assistant read. It serves every point source and every context-line ref through `validateDigest:35-44`, and the reread anchor for initial Replay and both paging directions through `replayWindow:62-68`. `server/digest.ts:30-44` separately derives input.seqStart - 1 for the entire Commander digest interval; it serves digest.read and the Commander revalidation at the start of every digest.replay request (`:46-50`). These are the two negative-predecessor producers.
- The remaining source-derived cursor reader is `report-sources.ts:48-59` (side): initial neighboring reads use the source start/end directly (`:70-71`), while extensions use the window's first/last sequence from `client/digest.tsx:52-54`. No subtraction is applied; edge #0 is legal. Client/source/position schemas already permit zero. `commander-replies.ts:21` uses +1 only for contiguity comparison, not to form a cursor. Separate bounded searches over all client/shared/server cursor/refetch paths and the candidate repository found no other production predecessor producer; fleet, chat/question and decision-delivery reads use cursorless tails. Test-fixture arithmetic is not another production reader.
- Smallest class fix: share one zero-aware construction of an exact-start canonical read between readSource and readDigestHandler. For start >0 retain the exclusive predecessor cursor start-1; for start 0 use a legal cursorless initial `after` request, with the existing limit (one source or the bounded declared digest interval). Keep exact returned epoch/start/end, canonical identity, membership and hash checks. Never clamp -1 to 0: an exclusive after-0 cursor skips the wanted entry. Do not renumber sources, forbid zero, search text, widen FO source ranges or relax validation.
- Boundary requiring repair-time proof: the installed schema accepts cursorless `direction: after`, but this no-launch investigation did not exercise its daemon-side initial-page semantics. The authorized repair must prove that this legal form returns #0 and preserves response epoch checks; if the adapter cannot do so, report that constraint rather than invent a sentinel or an approximate lookup.
- Proposed failing-before/passing-after regressions: enforce the real request schema at the fake SDK boundary, and require exact readSource(#0), a valid point/context referencing #0, initial Replay of #0 with no earlier entries plus its first two later neighbors, and a digest interval starting at #0 (singleton and split) with Replay revalidation. Today the exact-source/Commander-start assertions fail on cursor -1. Assert that no request emits a negative cursor; retain #1 → cursor #0 and later-source controls, page-edge #0/end-of-history behavior, wrong epoch/hash/range/gap refusals, and declared-interval bounds. Both producer sites must be exercised so fixing only one leaves a named failure.

### 10. Confirmed — whole-request failures and side failures share the wrong paging catch

- Exact path: every Replay call first awaits `readDigestHandler` at `server/digest.ts:47`. A Commander timeline/transport/protocol exception escapes that await and rejects the whole RPC; an invalid digest, round or point instead returns null at `:48-49`. `client/digest.tsx:54-62` handles null globally but branches thrown exceptions solely on the requested direction. Its before/after catch marks only window.older/newer unavailable, leaving error empty and retaining the old window. Context rendering at `:75-87` depends on that global error, so all three lines stay unqualified and the leading warning is absent.
- Mounted reproduction: begin with a valid Replay, then reject an earlier or later request. In both directions, the old anchor and all context lines remain visible; only “前段未能讀取” or “後段未能讀取” appears, with no leading warning/re-read control. Returning null instead hides the window/lines and shows the leading requested-original warning. Direct server probes confirm that Commander revalidation exceptions reject anchor, before and after calls, so the paging rejection is not evidence that only a neighboring side failed.

### Every Replay failure path and its current presentation

- Entry digest validation (`DigestMessage`, `client/digest.tsx:17-31`): null/rejection becomes 摘要無法驗證 with recheck; no point/Replay entry is offered. A revision/retry resets the selected point. This is already fail-closed.
- Commander revalidation inside Replay (`server/digest.ts:30-49`): malformed/invalid/expired or foreign round, failed point sources or missing point/member produce null; SDK/read exceptions can reject the RPC. Null leads globally in all directions and hides context/window. Rejection does so only for anchor; before/after misclassify it as a side failure. The server matrix exercised a thrown Commander read and invalid Commander data separately.
- Required source revalidation (`report-sources.ts:35-44`): a rejected exact read is caught as false, as are identity/hash failures; the point becomes invalid and readReplay returns null. The UI therefore correctly shows the global unavailable state in all directions. A thrown required-source read was exercised, not assumed to be a thrown whole RPC.
- Selected FO anchor reread (`report-sources.ts:62-64`): null or throw becomes null, including a failure after the earlier point-source validation succeeded. All directions then show the global unavailable state. The server probe specifically failed the second exact source read, after validation, to reach this anchor path.
- Genuine earlier/later side failure (`report-sources.ts:48-59,65-72`): the server catches side reads, wrong-page identity/state, bad ranges, gaps or non-advancing pages and returns a non-null ReplayWindow with only that side marked unavailable. The currently verified point/anchor is retained, so keeping its context and showing the side retry is correct. Both initial neighboring reads and extensions were exercised; they remain distinct from a null whole result.
- Genuine end of history: a successful side read with no remaining rows and no “more” returns side=end. The UI shows “沒有更早/更後的對話” and no paging control (`client/digest.tsx:68-70`); this must not become an unavailable warning.
- Whole client transport/RPC rejection of unknown origin: it has the same direction-dependent catch as the Commander-read rejection. Anchor correctly shows global unavailable; before/after incorrectly keep context and the old anchor. The UI cannot safely infer which read failed from the button that initiated the request.
- Retry of a known global failure: `client/digest.tsx:49-51` immediately clears error when starting the next request. A deferred retry probe shows the three context lines reappear, without a global warning, while no new verification result exists; they disappear again when that retry returns null. This is another transition of the same item-10 failure-state policy, not a proposed third finding.
- Superseded requests/source or point changes: request IDs and the cleanup at `client/digest.tsx:49,55,62-65` ignore old results/rejections; they must continue to prevent a late failure from clearing a newer successful card. Open-FO route errors have separate routeError state and do not establish a Replay-read failure.

### Smallest item-10 repair and regression plan

Treat any null whole result or thrown whole RPC, regardless of anchor/before/after, through the same global unavailable transition: lead with the requested-original warning, withhold uncheckable context and clear the old window. Only a successfully returned typed ReplayWindow may report a side-only unavailable/end state while retaining context. Preserve a known global failure while its retry is pending; clear that failure only after a verified non-null result succeeds. Keep stale-request guards, fixed point/actions, retry and existing exits; do not change the source label into an unproved accusation about which ref failed. The existing server result contract already distinguishes typed side failure from whole-RPC failure, so no persistent state, gate change or new RPC schema is needed.

Proposed regressions: after a valid Replay, make the real handler's Commander revalidation reject during both earlier and later loads; require leading unavailable warning before the point/context area, the requested original identity, no unqualified context/old window, and retained exits/retry. Those two cases fail now. Cover direct transport rejection, null Commander/point/source refusal, anchor reread race, and initial anchor throw/null as global controls. Keep typed side failures and true end-of-history as controls that retain valid context with their distinct side states. After a known whole failure, defer retry and require the warning/context suppression to persist until successful revalidation; today that assertion fails during pending retry. A failed retry stays global; a verified success restores context/window; a late superseded rejection must not replace a newer card. Check these affected rendered states at 1440 and 360 in the repair, using fixtures/isolated hosts only.

Disposition: investigation complete; fixes/tests above are proposals only. The candidate remains clean at the pinned head, PR #74 is untouched, and AC-4 stays skipped. Stop for FO's separate fix authorization under Captain amendment 1; after that one bounded cycle the task must go to the Captain whatever review finds.


## Stage Report: implementation (cycle 4)

- DONE: Fix authorization under Captain amendment 1, for items 9-10 of "## Investigation result: roborev 1540" only: implement the item-9 "Smallest class fix" (one shared zero-aware exact-start canonical read for readSource and readDigestHandler; never clamp -1 to 0) and the "Smallest item-10 repair" exactly as proposed, with the proposed regressions, each failing at ccb29f5ac1e4dce03681cc6e86bfc331466446c0 and passing after (AC-1)
  `ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43`: shared readCanonicalStart omits the cursor at zero and keeps start-1 above zero; all exact validation remains. Null/rejected whole Replay requests now share the global warning/window-clearing policy in all directions; pending retries retain that warning until verified success. No persistent state, schedule, gate or RPC-schema change.
  `regression-binding.json`: identical final tests expose nine expected failures at ccb29f5 plus fourteen passing controls, then pass 23/23 after repair. Restoring either predecessor producer breaks its zero-source/Commander test; restoring the old paging catch breaks both-direction Commander/transport tests; clearing error on retry start breaks the pending-retry assertion. Invalid round/point/source, anchor race, initial failure, typed side/end and stale-rejection controls remain checked.
- DONE: Recapture only the affected rendered states at 1440 and 360 (whole-request failure during earlier and later, pending retry, verified recovery); npm test and typecheck pass; commit, push to the PR #74 branch (no force push), and write "## Stage Report: implementation (cycle 4)" naming the new head (AC-1, AC-2)
  New head `ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43` pushed normally to the existing task branch; PR #74 is OPEN/Draft at that head, security check SUCCESS. `npm test` 403/403 and typecheck pass. Eight final captures in desktop-verified/ and phone-proof/ bind all 95 candidate files; warning order, hidden context/window, pending warning, verified recovery, no overflow and three visible >=44px exits checked. All six fixture-host attempts cleaned, including harness failures; zero sends, archives or native agent opens.
- SKIPPED: AC-4 measurement.
  Unchanged FO ruling: needs configurable fleet listener/shared data directory with today's values as defaults, outside this task. No live/provider round or cost claim.
- SKIPPED: ADR record.
  The recorded POC profile reserves no number under the workflow README and FO ruling; no docs/adr change.
- SKIPPED: RoboRev in worker sandbox.
  Package gap 5: daemon inaccessible; FO runs the pushed exact head against `33952f9b3d02fceab104ba09272d65e432a3d095`. This last authorized repair cycle goes to the Captain after review regardless of further findings.

### Verification and limits

Evidence root: `d3-commander-digest-slice-1/evidence/amendment-1-4ge9nlqu/`; RESULT.md, checks.json, regression-binding.json, adapter.json, capture-binding.json, cleanup-verified.json and pr.json. Package checks pass: comment ratio 0.0% (529 code / 0 comment lines), number guards on the explicit stack base, seven existing ADR records, design surfaces and doc impact (empty list). The affected OVERVIEW claims were updated. Goal check: the one helper repairs the two negative-predecessor producers; the client change repairs only whole-request failure/retry state; the added test file falsifies both classes; no new dependency or temporary candidate scaffolding.

The real installed page selector was exercised in-process: cursorless after includes #0, after-0 excludes it, [0,1] obeys limit 2, and before-0 is empty. Its module hash and diagnostic script are recorded; this is initial-page boundary evidence, not a full canonical RPC/live-host proof. Portable tests enforce the installed 0.12.0 request schema and exercise real server handlers through the mounted client. Captures inject fictional SDK/RPC results into unchanged production JSX; no provider quality, live/native-chat or physical-device acceptance claim is made. The first npm test was sandbox-blocked on tsx IPC; the same authorized command passed after escalation. Capture harness navigation/selector retries are retained as failed attempts, not acceptance images.

### Summary

Findings 9 and 10 are repaired and pushed under Captain amendment 1; the report does not approve delivery or advance task state. PR #74 remains Draft, main and flywheel-live remain untouched and clean, and AC-4 stays skipped. FO owns RoboRev and the handoff to the Captain; no further repair cycle is authorized here.

## Investigation: roborev 1543

FO ran roborev on ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43 (base 33952f9b3d02fceab104ba09272d65e432a3d095): exit 1, evidence=roborev:1543, one Medium finding outside findings 9-10. Under Captain amendment 1 the task now goes to the Captain; no repair is authorized.
11. server/coordinator.ts replacement persistence: if creating the replacement comms officer succeeds but saving its ids fails, a retry creates another officer; a failed rename leaves the fixed `.pending` file, so later writes fail with EEXIST and each retry creates another orphan replacement.

### FO declines

- roborev 1543 on ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43 (item 11) — a replacement comms officer created but not saved is created again on retry, and a failed rename leaves `.pending` so each retry makes another orphan officer. Declined as a known issue by the Captain's ruling 2026-11-06, asked 「第一片最後一輪修好了（403 個測試通過），前面兩個問題都解決。自動審查另外找到一個新問題：換新通訊官時，如果新的已經開好、但存檔失敗，重試會再多開一個通訊官。只有存檔失敗（例如磁碟錯誤）才會發生，後果是多出幾個沒用的通訊官，不會給你錯的資訊。接下來怎麼做？」, answered 「記成已知問題，驗證後裝給我試 (Recommended)」. Would become Material: if a switch on the Captain's install leaves more than one new comms officer, or a `.pending` file blocks a later switch.
