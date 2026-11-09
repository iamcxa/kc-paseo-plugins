---
title: Build the list chief of staff — an accumulated list with her recommendations in her conversation, no new UI
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d7-list-chief-of-staff
status: implementation
gates:
    version: 1
    records:
        - id: gate:d7-list-chief-of-staff:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d7-list-chief-of-staff-backlog-1
              briefing:
                id: briefing:d7-list-chief-of-staff:backlog:attempt-1:revision-1
                digest: sha256:458519a80718e4ec9c36a566e66b576069d5a94ebfe3f66a31ac069bb1c33594
                room-ref: ./d7-list-chief-of-staff/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d7-list-chief-of-staff:backlog:1
                briefing: briefing:d7-list-chief-of-staff:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-09T07:29:43.534362Z"
                decision: approve
                reason: 'Captain chat 2026-11-09, asked 「要開這個任務嗎？」 (the list chief of staff on PR #77''s backend, card UI removed, her prompt rewritten, render_ui allowed, one real call after the limit resets), answered 「好」.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-09T07:30:24Z
worktree: .worktrees/spacedock-ensign-d7-list-chief-of-staff
pr: 80
---

Rebuild the chief of staff as a conversation, without new screens: she keeps one accumulated list of what waits on the Captain — who raised it, her recommended decision and her reason — adds to it until he responds, then asks whether to take all her recommendations or review item by item; before sending a batch she shows him exactly what goes where, in whatever widget suits her, and sends only on his explicit confirmation.

Captain, 2026-11-09, at the d6-chief-batch-on-phone design gate: 「我覺得方向對，但是太複雜了，是不是先不要套 ＵＩ先這樣：幕僚長維護一個 list，這個清單就是累積的問題，誰提的，與幕僚長的的建議決策及理由（這個你也做過，其他 fo 也做過），如果一直有就一直加，直到我回應，那這時候幕僚長就問是要全照建議，還是一題題開始審？這時候再考慮納入 UI 做最佳化解讀，因為有些人有裝 paseo genui plugin (例如我）可以做更好的視覺化呈現，但是一開始用那種卡片形式我覺得反而不好，因為我不能一次總覽全部，再一題題深入探討，但有些時候不必深入，就按建議就好，也可能擠提建議幾題探討」; asked whether 「全照建議」 covers gates: 「算，但是這裡我希望可以跳出一個特殊 UI 讓我 double check，或是你提更好的做法」; on the double check: 「我覺得不用這樣麻煩，就是寫成讓幕僚長自己找到最合適的 ui widget 使用即可，只要寫上目的，讓她自己判斷？」; asked whether to open this code task on PR #77's backend: 「好」.

bite: away from his desk he cannot answer many FO sessions one by one, so FOs wait (his words 2026-11-09); card UIs hid the overview he needs.
consumer: the Captain, reading her list after Paseo's push and answering it in one reply or item by item.

## Scope

- Stack on Draft PR #77 (branch spacedock-ensign/d5-chief-of-staff-build at f40c340e8204f4b7dddef238f215aea3f3a6eaab). Keep its backend: board readers, the shared rule for what waits on the Captain (amendment 3 of d5), the trigger shadow-tested twice on his live board, the comms officer switch, the projected timeline reader. Remove the client UI added for the chief of staff (focus cards, red pulsing badge, sound, per-item controls, digest leftovers) where nothing else uses it.
- Her prompt: maintain one accumulated list from board facts only — item, who raised it, waiting time, her recommended decision and reason; keep adding until the Captain responds; when he responds, ask whether to take all recommendations, review item by item, or discuss some; 「全照建議」 includes gates; before relaying a batch, show him exactly what each FO will receive and wait for his explicit confirmation, using the most suitable widget available to her (Paseo's render_ui if present, otherwise text); relay each item with his words and the item's recommendation so each FO records his decision; permissions are never decided by her.
- Allow mcp__paseo__render_ui in her tools.
- When the trigger fires, she posts the updated list so Paseo pushes; no new notification channel.
Non-goals: new Bridge screens or cards; approving permissions; enforcing the confirmation step in code (prompt-level in this POC, watched in his trial); merging any PR; findings 13, 15 and 16 of d5 (deferred).
Budget: one implementation task stacked on PR #77; at most two repair cycles before the Captain sees it.
Stop condition: the real model run shows she relays a gate decision before his explicit confirmation, or render_ui is unavailable to her as an agent — stop and report.

## Acceptance criteria

**AC-1**: Her list carries each waiting item with who raised it, her recommendation and reason, from board facts only, and grows until he responds.
Verified by: tests on the list input she receives (only items the shared rule says wait on him; FO-owned and old items excluded) and one real model run on an isolated real daemon with fictional board sources showing the list.

**AC-2**: Nothing reaches an FO before his explicit confirmation of what will be sent.
Verified by: the same real run — 「全照建議」 produces a what-will-be-sent view and no relay; an explicit confirmation produces one relay per item with his words; a permission item is not decided.

**AC-3**: The removed UI is gone and the kept backend still works.
Verified by: no chief-of-staff cards, badge pulse or sound remain; the backend tests from PR #77 still pass.

UI proposal: no new Bridge screens; the list and the what-will-be-sent view live in her conversation, as text or a render_ui widget of her choosing; the d4 chief-of-staff cards and badge are removed.
Preview: d4-chief-of-staff/mockups/review.html

## Captain amendments

### Amendment 1 — 2026-11-09, chat
Captain: 「加一句指令後給我試 (Recommended)」
Asked: 清單版幕僚長最後一輪修好了：499 個測試都過，真模型加兩次重開也沒問題（重開後清單和預覽還在、確認前不送、確認後每件只送一次）。自動審查又抓到兩個問題。一個影響你試用：她用卡片給你看「即將送出」時，在 Paseo 原生對話看得到，在 Bridge 裡卻只顯示「↳ render_ui」幾個字，看不到要送什麼。另一個很少發生：清單第一件剛好在她分析的那幾十秒內被解決，這次更新會整個作廢。修正預算已用完，怎麼辦？ (options: 「加一句指令後給我試 (Recommended)」 — "只改她的指令：用卡片時也寫一份文字版預覽，在 Bridge 也看得到。不再跑修正循環，直接驗證、裝給你試；第二個問題記成已知。代價：她的回覆會變長一點。"; 「什麼都不改，直接給我試」)
Supersedes: none
Design: "只改她的指令：用卡片時也寫一份文字版預覽，在 Bridge 也看得到。不再跑修正循環，直接驗證、裝給你試；第二個問題記成已知。代價：她的回覆會變長一點。"

## FO alignment

Alignment: not needed: the Captain set the model and approved this task on 2026-11-09 (quoted in the seed).
Release review: not needed: spacedock-bridge has no journey map yet.
Reviewer: kc-dev-flow-2:engineering-reviewer not run 2026-11-09: Captain amendment 1 supersedes no acceptance criterion; it adds one prompt sentence (a text preview beside any widget).
Reviewer: kc-dev-flow-2:chief-engineer codex/gpt-6-astra:xhigh 2026-11-09 — with one repair cycle left and the conversation fold failing across tasks, repair the fold or switch the list's truth to the board?
Surfaces: ui
Visible change: the chief-of-staff cards, red pulsing badge and sound are removed; her conversation shows the accumulated list and, before a batch is sent, a what-will-be-sent view in the widget she chooses.


## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto PR #77's head (git reset --hard f40c340e8204f4b7dddef238f215aea3f3a6eaab, branch spacedock-ensign/d5-chief-of-staff-build) and confirm HEAD; read the d7 seed and the d5 and d6 task files' Captain words; report before editing which client pieces are chief-of-staff-only (to remove) and which backend pieces stay, and whether mcp__paseo__render_ui is callable by her as a Paseo agent (stop condition)
  Empty d7 branch reset to f40c340e8204f4b7dddef238f215aea3f3a6eaab; authoritative dispatch branch d7 retained (the checklist parenthetical names d5, the PR base). Seed and d5/d6 Captain words read; pre-edit client/backend mapping reported. Actual agent render_ui completed in preview foreground-turn-2; no capability stop condition fired.
- DONE: Remove the chief-of-staff client UI (focus cards, red pulsing badge, sound, per-item controls, digest leftovers) where nothing else uses it; keep the backend (board readers, shared rule for what waits on him, trigger, switch, projected reader) with its tests passing (AC-3)
  cd1a6b95ad53202ae0962bd1f63a8ebee883799c removes focus header/actions, reply-batch selection, red/pulsing badge, client audio and sound asset. Neutral count and shared board/trigger/switch/projected readers remain. The updated sidebar tests fail on the pinned parent (old audio), pass at the candidate; all retained backend cases pass.
- DONE: Rewrite her prompt per the seed's Scope bullet 2 and add mcp__paseo__render_ui to her allowed tools; the trigger posts the updated list into her conversation; tests that the list input holds only items the shared rule says wait on him, with FO-owned and old items excluded (AC-1)
  List mode retains admitted current items across qualifying updates, excludes FO-owned/self-only and newly discovered old questions, and consumes native Captain replies without stripping their text. chief-list.test.mts exercises source-to-input ownership/age, additions/removals and two observer updates; allowing the full board or suppressing the second update fails it. Prompt, allowlist and GenUI-compatible create hook updated.
- FAILED: Real model proof on an isolated real daemon (own HOME and data, port outside 6767, 6787 and 6860-6935, fictional board sources with a question, two gates and a permission, no live Bridge files or port): one triggered list; then the fictional Captain replies 「全照建議」 — record that a what-will-be-sent view appears and no relay happens; then an explicit confirmation — record one relay per non-permission item carrying his words and the item's recommendation, and that the permission is not decided; tokens and times by turn id; if the Claude weekly limit blocks the model, stop and report it (AC-1, AC-2)
  One real Opus/Terra trigger posted four fictional items; 「全照建議」 completed render_ui with zero relays; separate 「確認發送以上預覽」 delivered two previewed gate messages exactly once, each with both Captain messages and its recommendation/reason. Permission received zero messages/actions. Required question relay was not demonstrated: the blue/green fixture supplied no recommendation basis and she withheld it. acceptance.json records HOLD, not full AC-1/AC-2 acceptance.
- DONE: npm test and typecheck pass; commit, push the branch and open a Draft PR titled "feat(spacedock-bridge): list chief of staff ..." with base spacedock-ensign/d5-chief-of-staff-build
  npm test: 422/422; typecheck exit 0, after final edits. Candidate cd1a6b95ad53202ae0962bd1f63a8ebee883799c normally committed/pushed; Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/80 targets spacedock-ensign/d5-chief-of-staff-build; never ready/merged. All evidence is in this task’s state-checkout evidence/ directory.

### Findings

Proof limit / FO handback — Two gates satisfy the confirmation boundary and exact one-relay rule, but the requested three-non-permission-item scenario is incomplete. The question offers only blue/green with no preference evidence, so the model says it has no recommendation and correctly keeps it pending. No second trigger/model retry, fabricated recommendation or forced question relay was used. FO must disposition that evidence gap before validation acceptance; the unsafe-early-gate-relay stop condition did not occur.

Real boundary — The isolated Paseo 0.15.3 daemon used GenUI 0.3.3, ports 55489/55490, own home/data, GitHub polling off and a fictional chiefBoard input seam. runtime-source-manifest.json binds 47 identical runtime files and the one source adapter to the candidate; shared-source ownership/old-item admission is exercised separately by tests. This proves native model/tool/relay behavior on fictional inputs, not a live board trial, visual acceptance or actual workflow recording. The permission source was fictional; no native permission prompt was answered. No live Bridge file/port, live prompt/switch/archive, provider credential read/copy/print or browser access occurred.

Measured turns — model-measurement.json records Terra codex-turn-0: 20.721s, 32728 input / 359 output; Opus foreground-turn-1: 93.374s, 8 input + 121256 cached / 1496 output; preview foreground-turn-2: 29.272s, 12 input + 238842 cached / 2701 output; confirmation foreground-turn-3: 15.755s, 10 input + 190882 cached / 1597 output. Usage fields are provider-reported, not inferred billing totals. Native receiver timelines prove one delivered agent_message per gate (not a user_message); the initial count-only reconciliation omitted that projection type and is superseded by acceptance.json plus delivered-* snapshots.

Compatibility / cleanup — Backend focus/mark parsing remains solely for existing lifecycle/history tests; no client renders focus controls or plays audio. Early shared MCP catalogs and before-hook request.tools do not expose the final injected agent inventory; actual completed render_ui is decisive. Seven isolated agents were idle before cleanup; captured launcher PID 29209 stopped its recorded descendants, both ports closed and owned runtime/home/data deleted (cleanup.json). Normal provider authentication used existing HOME only.

Checks / documents — comment-ratio.log: 60 code / 0 comment lines, 0%, maximum 5% met. doc_impact reports zero additional documents; OVERVIEW.md updated for list/preview/confirmation and retained reader/isolation behavior. number-guards-stack-base.log passes at base f40c340e8204f4b7dddef238f215aea3f3a6eaab; design-surfaces.log passes. No migration, reserved ADR, persistent store or CI change. roborev not run: worker sandbox cannot reach its daemon (dispatch package gap 5); FO owns the prescribed exact-head review with base f40c340e8204f4b7dddef238f215aea3f3a6eaab.

### Summary

The conversation-list implementation is committed and delivered as Draft PR #80 with the removed UI, retained backend checks and real preview/confirmed-gate relay proof. Delivery remains HOLD for the unproved question relay and FO-run independent review/validation; this report does not approve a gate or authorize installation.

## Investigation: roborev 1629 and the real run

The real model run on an isolated daemon (implementation report): one trigger posted four fictional items; 「全照建議」 produced a render_ui preview and zero relays; a separate explicit confirmation delivered the two previewed gate messages exactly once, each with both Captain messages and its recommendation and reason; the permission got nothing. The question relay was not shown: the fictional question gave no basis for a recommendation and she withheld it — a fixture gap, not a product failure.

FO ran roborev on cd1a6b95ad53202ae0962bd1f63a8ebee883799c (base f40c340e8204f4b7dddef238f215aea3f3a6eaab): exit 1, evidence=roborev:1629, two Medium.
1. server/chief.ts: the list includes every pending event, not only the trigger's qualified events, and consumes them, so a newer gate cannot call again at its own deadline. FO reading: including every pending item is the Captain's list model (「如果一直有就一直加，直到我回應」); see FO declines.
2. shared/commander-replies.ts: a replacement list deletes the previous unanswered list at once; if the replacement's turn later errors, both are lost, and after restart the earlier list stays consumed though he never answered it.
Read-only investigation of item 2 dispatched as implementation-1-followup-1 before any fix.

### FO notes

- 2026-11-09: chief-engineer (Codex gpt-6-astra xhigh, agent 97c9aed7) recommends the last repair cycle on the current fold, limited to peer-reply isolation (roborev 1634 item 3), predecessor retirement with resolved items (item 4) and recognizing the native prepare result; the board-truth list is not equivalent as stated (old questions, exact-preview confirmation, re-presenting a confirmed but unrecorded decision) and would need the Captain to change acceptance. FO follows it.

### FO declines

- roborev 1642 item 6 on 970d9cdaab655aadd489a9cda5393610d5f0cb23 — a list's synthetic focus on its first item makes a whole update fail if that item resolves during preparation. Declined as a known issue by the Captain's ruling 2026-11-09 (Amendment 1, 「加一句指令後給我試 (Recommended)」, whose option text records it as known). Would become Material: if in his trial a list update is dropped or an older list returns after an item resolved.

- roborev 1629 item 1 on cd1a6b95ad53202ae0962bd1f63a8ebee883799c — the list carries every pending item and consumes them, so a later gate does not raise its own call. Declined because the Captain's model is one accumulated list that grows until he responds (「如果一直有就一直加，直到我回應」); the item is in that list. Would become Material: if a new item added to an unanswered list never reaches him through a push, or he reports missing an item that was in the list.


## Investigation result: roborev 1629

Confirmed item 2 at cd1a6b95ad53202ae0962bd1f63a8ebee883799c; no candidate changes. Here A means the previously published unanswered list, B its replacement, and C a later replacement. The original conversation text is not deleted: the defect loses the recoverable unanswered-list state and therefore the input for a later accumulated list. Item 1 remains the committed FO decline; including/consuming every pending event is not reopened.

### Evidence and supported-workflow harm

- Normal workflow: the Captain has not answered A, a new matter triggers B, B emits a prepared list and later fails in that same turn. Harm: after restart, still-waiting A items are absent from the next accumulated input. Boundary: value-ac[AC-1], the list grows until he responds. Trigger: direct executions of current readCommanderConversation and ChiefObserver with fictional projected entries and in-memory API/run stubs; zero real model turns, helpers, daemons or external sends.
- Fourteen fold characterizations covered replacement request only, failed/canceled preparation, prose before preparation, covering success, later same-turn error, later failed preparation, mismatched turn identity, unrelated error, ordinary Captain response, passive peer envelope, a three-list chain, a subset replacement, and an explicit earlier response. Six current outcomes violate the proposed retention assertions: same-turn error, later failed preparation, mismatched turn, peer-plus-error, failed C after successful B, and subset replacement. The other eight are preservation controls, not defects.
- A successful A, prepared prose B covering A, then B's attributed error yields unresolved=[] and failed={B}; the same loss occurs across a projected-page boundary. A restarted observer with A and B items still on the board returns quiet/batch=null, makes no automatic retry, then supplies only C's new item at the next qualifying trigger. Thus the loss is exercised through the actual next-input boundary, not inferred from a deleted map entry alone.
- Qualification: without restart, the failed B state still holds its proposed [A-items, B-items] in state.batch; a subsequent independent trigger carries those plus C. It is not true that every failed replacement immediately erases every live item. Restart loses that accidental memory because the conversation fold already discarded A, and consume(attempt.events) suppresses the historical versions. A direct publish probe also accepted B containing only its new item while A's item still waited: publication currently validates one anchor, not complete coverage.

### Complete affected lifecycle paths

- shared/commander-replies.ts:46-57: a new automated request changes current/preparation but does not yet remove A. A genuine ordinary Captain reply consumes the latest available list; an explicit matching response consumes its named attempt. Parsed agent envelopes never consume a list. Those accepted response semantics remain unchanged; a real response must prevent any later fallback from resurrecting answered context.
- shared/commander-replies.ts:62-83: successful preparation plus any eligible assistant prose establishes B. Line 81 immediately deletes every older list-mode entry, without checking item coverage or a later terminal failure. invalidate (:30-38, :58-68, :83) removes only the failed/uncertain attempt, so a subsequent error, failed/canceled/duplicate preparation, or turn-attribution conflict cannot restore the already deleted A. Unrelated attributed errors are correctly isolated. A successful B then failed C must retain B, not fall back as far as A.
- shared/commander-replies.ts:94-106: the same fold serves live interpretation and restart, across ordered projected pages; gaps, resets, stale cursors and epoch changes are rejected. Older-unavailable coverage is explicit. A fix must retain these provenance/coverage holds and never treat an unknown prefix as a successful prior list.
- server/chief.ts:118-135 and shared/chief.ts:49-80,84-86: changing the officer resets runtime state and reconstructs history; a qualifying update consumes its admitted versions and replaces state.batch with the proposed B before its turn succeeds. accumulatedList uses that current state plus pending events, filtered through the current shared board rule. Consumed versions prevent automatic retry; their suppression is distinct from whether an unanswered list still needs to be carried forward. Do not undo consumption or restore independent deadline calls for already included items (declined item 1).
- server/chief.ts:103-108: history consumes all recorded attempts, including failed ones, then restores only the last unresolved result. With the defective empty fold there is nothing to carry, while old events become baseline/consumed rather than new arrivals. If only uncertain attempts remain, history holds with no automatic call. Missing/changed officer (:115-121) resets rather than sharing another officer's context.
- server/chief.ts:144-166: run/preparation/provenance/anchor/publication failure marks the proposed B failed; there is no separate retained A to restore. publish checks a batch id, one target/version, terminal state and officer identity, but not coverage of all still-waiting prior items. A board/source read failure (:138-140) retains the current batch and reports unknown total; it does not itself prove resolution.
- server/chief.ts:174-188, wired by index.server.ts:45: responded clears only the matching current chief/batch and marks it terminal; receive can also invalidate B after publication when the persisted turn error appears. This later path bypasses an analyze-only rollback. Complete authoritative disappearance of all matching active items (:125-127) clears the active context; incomplete reads do not. An obsolete analyze completion is guarded by terminal/officer identity. mark (:168-172) changes entry/audio flags only; it consumes no list.
- Read consumers are server/chief.ts:27, client/co-chat.ts:260 and client/use-co-ask.ts:42; they share this interpretation but cannot restore discarded lifecycle candidates. client/use-chief.ts caches RPC state only. There is no second durable list store or other product writer; raw discussion remains readable subject to the existing bounded window.

### Smallest class-level repair proposal, awaiting FO authorization

- Keep prior list candidates in the existing conversation fold until final failure/provenance checks are known; derive which valid candidate actually supersedes which older list by coverage, instead of destructively deleting predecessors on the first prose item. A later-invalidated B must leave A recoverable. A successful covering B may supersede A; a subset must not silently retire uncovered still-waiting A items. Apply genuine response coverage so fallback cannot resurrect a list the Captain answered.
- Separate the observer's retained unanswered/carry context from its in-flight replacement and phase/error. A failed B must not overwrite the only reference to A. Reconstruct that carry context from the same existing conversation on restart, keeping admitted outstanding items separate from consumed trigger versions; the next independently qualified update must have the same membership before and after restart. Use the current shared board rule for authoritative removals. Keep the existing no-retry, all-pending-list consumption, officer identity and incomplete-history boundaries. No new file/store, notification route or confirmation enforcement is proposed.
- Regressions to add after authorization: A then covering B plus late error/failed or canceled preparation/turn conflict restores A in both fold and restarted observer; A→successful B→failed C restores B; multi-page and delayed-error variants behave identically; pending/failed B preserves live/restarted carry membership for a later independently qualified C; subset publication cannot discard a still-waiting A item; ordinary/explicit Captain responses prevent resurrection; peer envelopes cannot consume; unrelated-turn errors, source/coverage holds, exact ownership, old-question exclusion and unchanged-failed-attempt zero-retry controls remain green. These are proposed post-fix assertions, not an after-fix pass claim; no repair was applied in this dispatch.

### AC-2 question rerun design, no model turn now

Use CSV (comma-separated text) and XLSX (Excel workbook) as explicit fictional requirements, not a preference guess. Fictional import FO's reply/Next text: 「Next: 本輪需求只接受 CSV；甲支援 CSV、乙僅支援 XLSX，兩案測試通過且其他條件相同。請選甲或乙（你）」; set next-owner=captain, a stable provider message id and a genuinely fresh waiting timestamp after the observer baseline. Do not put decisive facts only in discarded reply prose.

The actual chiefBoard/readQuestion/buildQueue path was exercised with that fictional source: it yields exactly one ask event, the correct named FO/id/time and the full 52-character title, below replyPreview's 140-character limit. Expected recommendation: 「採用甲：甲符合 CSV 需求，乙僅支援 XLSX 不符合本輪需求。」 No manufactured readiness, additional policy or instruction to choose an answer is needed.

On the separately authorized exact repaired head, repeat the owned isolated-daemon setup with that question, the two existing fictional gates and a permission. One trigger must list all four with grounded recommendations/reasons and exclude the permission from actions. 「全照建議」 must show exactly three proposed destination/message pairs and zero relay; 「確認發送以上預覽」 must deliver exactly one question relay and one relay for each gate, each containing both verbatim Captain replies and that item's adopted recommendation/reason. The question relay asks its FO to proceed with option 甲 as his choice; gates keep their existing decisions. Permission stays undecided and receives no relay. Compare received native agentMessage.event=message entries and message ids, not only user_message counts; keep actual render_ui output, per-turn usage/timing and cleanup proof. This is a proposed rerun only, not new model authorization.

Candidate worktree remains clean at cd1a6b95ad53202ae0962bd1f63a8ebee883799c; PR #80 untouched, no product edit/commit/push, no model/daemon/browser work and no live Bridge access. Only this investigation result is appended to the task and committed with the specified state command. Stop for FO's fix authorization.

## Stage Report: implementation (cycle 2)

- DONE: Fix authorization for item 2 of "## Investigation result: roborev 1629": implement the "Smallest class-level repair proposal" as written, with its regressions failing at cd1a6b95ad53202ae0962bd1f63a8ebee883799c and passing after; npm test and typecheck pass; commit and push to the PR #80 branch (no force push) (AC-1)
  9718e7f0512e0a22f614668cd0294b639ad7306f committed/pushed normally to Draft PR #80. baseline-44-red.log: 22 assertion failures at cd1a6b; retention-verified-2.log: all 44 pass; tests-verified.log: 466/466; typecheck-verified.log: exit 0. Item 1 remains the FO decline.
- DONE: On the repaired head, run the "AC-2 question rerun design" exactly as written on a fresh isolated real daemon (one trigger, 「全照建議」, then 「確認發送以上預覽」), recording relays per item, the permission untouched, and tokens and times by turn id; if the Claude weekly limit blocks the model, stop and report (AC-1, AC-2)
  One fresh isolated daemon at ports 55519/55520 ran one Opus trigger with one Terra pass, then the two exact replies. acceptance.json proves four listed items, a grounded 甲/CSV recommendation, completed render_ui and zero preview relays, then exact received counts [1,1,1,0] with both Captain texts and per-item reasons. Separate backend provenance HOLD below; no weekly limit or model retry.
- DONE: Write "## Stage Report: implementation (cycle 2)" naming the new head
  This appended report names repaired head 9718e7f0512e0a22f614668cd0294b639ad7306f; evidence is in d7-list-chief-of-staff/evidence/cycle-2/. PR #80 remains Draft against spacedock-ensign/d5-chief-of-staff-build.

### Findings

Repair / falsifiers — The conversation fold retains candidates until final failure/turn checks, then applies covering supersession and genuine-response coverage. Observer active/carry is separate from the proposed turn and reconstructs from admitted conversation items; failure restores the last valid list without retrying consumed versions. Removing candidate retention breaks late error/preparation/cancellation/turn-conflict and A→B→failed C tests; dropping carry breaks live/restart next-trigger membership. Subset publication, genuine/explicit Captain response versus peer envelope, authoritative removal versus incomplete source, officer change and stale asynchronous receive results have behavioral assertions. Existing source ownership, old-question exclusion and coverage tests stay green. No store, deadline retry or confirmation enforcement was added.

Native integration HOLD — The real list was generated successfully, but observer phase ended failed rather than calling. The native completed prepare tool now persists its result as detail.output.output; preparedBy accepts direct/content results and cannot confirm this wrapper. persisted-output-shape.json and baseline-output-shape.json replay the SAME native page through repaired and original cd1a6b code: both persisted folds are uncertain with zero unresolved results, while the live-prepared fold resolves the list. This predates the repair; no parser weakening or unrelated fix was made. The question/preview/relay proof passes independently of this lifecycle HOLD. FO must disposition this before overall validation acceptance; neither the successful prose nor 466 green tests proves clean native lifecycle/restart behavior.

Real proof / falsifiers — Initial four-item prose includes 甲 because only it supports the required CSV. The preview has exactly three destination/message pairs; preview-acceptance.json verifies completed render_ui and zero native incoming messages to all four FOs. After separate confirmation, acceptance.json matches each of three tool messageIds to receiver callId paseo-agent-message:<id> and the exact delivered payload, containing both verbatim replies and that item's decision/reason; an early, duplicate, wrong-recipient or altered relay fails those checks. Permission has no relay or respond_to_permission call. Receiver acknowledgements are fictional receipt sinks, not actual workflow gate recording.

Measured turns — model-measurement.json binds agent+turn ids to provider event start/completion and usage. Terra codex-turn-0: 11.209s, 32054 input / 5632 cached / 309 output. Opus foreground-turn-1: 43.244s, 8 / 133540 / 1540; preview foreground-turn-2: 39.721s, 10 / 179918 / 2827; confirmation foreground-turn-3: 30.217s, 12 / 256682 / 2507. These are provider-reported fields, not inferred billing totals; fictional receiver usage is recorded separately and is additional to the four core turns.

Isolation / limits — Paseo 0.15.3 and GenUI 0.3.3; runtime-source-manifest.json binds the exact head and all copied file hashes, with ONLY chiefBoard replaced by the fictional sources.json reader. Shared question ownership/freshness is checked separately by the real source-path tests/investigation fixtures, not claimed from the injected source. No live Bridge files/ports/agents, credential reads/copies/prints or native permission decision. The permission itself is a fictional source event. No live installation, visual acceptance or actual gate decision is claimed.

Cleanup — isolated-final-agents.json shows all six owned agents idle. cleanup.json proves captured launcher PID 2261 and recorded descendants gone, both ports closed, and the uniquely owned runtime/home/data deleted; no pattern kill. Product and main worktrees are clean. PR #80 is OPEN/Draft at the repaired head; task remains implementation for FO routing.

Checks / documents — comment-ratio.log: 111 added code / 0 comment lines, 0%, limit 5% met. doc-impact.json lists no additional documents; OVERVIEW.md now describes failure fallback/carry/coverage and no automatic retry. number-guards-verified.log passes against stack base f40c340e8204f4b7dddef238f215aea3f3a6eaab; design-surfaces.log passes. Initial number-guards invocation used a slug where a task path was required and is superseded by the verified run; retention-verified.log records sandbox IPC denial and is superseded by the escalated 44-pass run. No CI change or migration/ADR reservation. roborev not run: dispatch assigns the prescribed exact-head review to the FO because the worker cannot reach its daemon.

### Summary

The authorized list-loss repair is committed/pushed and its regressions pass, including failure fallback, restart membership and stale receive guards. The previously missing question-plus-two-gates real relay proof now passes with the permission untouched. Overall delivery remains HOLD for the preexisting native preparation-wrapper provenance issue and FO-run exact-head review/validation; no ready/merge/installation action was taken.

## Investigation: roborev 1634 and the native HOLD

Cycle 2 at 9718e7f0512e0a22f614668cd0294b639ad7306f: the list-loss repair passes (466 tests) and the real rerun relayed the question and both gates exactly once after confirmation, permission untouched (Opus turns 43 s, 40 s, 30 s; Terra 11 s). Worker HOLD: the native prepare tool's persisted result (detail.output.output) is not recognized, so the real batch's observer ended failed instead of calling, and a restart cannot resolve the list (predates the repair).
FO ran roborev on 9718e7f0512e0a22f614668cd0294b639ad7306f: exit 1, evidence=roborev:1634. Item 1 repeats the FO-declined list membership. New, both in the conversation fold: (3) a peer message followed by her ordinary acknowledgment is read as another list response and invalidates the list; (4) predecessor retirement needs coverage of resolved items, so a restart can resurrect an answered list.
The conversation-fold lifecycle (supersession, coverage, restart recovery) has produced findings in d3, d5 and now d7. FO calls chief-engineer before the last repair cycle.

## Investigation result: roborev 1634

Investigated 9718e7f0512e0a22f614668cd0294b639ad7306f, clean dispatch worktree, without product/test edits, model turns, daemon starts or PR changes. The explicit report/state-commit checklist is the only write exception. Current FO notes and chief-engineer advice were read: keep the conversation fold; no switch to a board-truth list. Item 1 remains the FO decline.

### Verdict and read-only reproductions

- Item 3: CONFIRMED harm, with a technical correction. A peer input alone does not consume the list. After a successful list A, an agent-message or agent-notification envelope in another turn followed by an ordinary assistant acknowledgement leaves responses EMPTY, but removes A from unresolved and puts A in uncertain. The same occurs with native agentMessage.event=message and the saved native finished notification. The acknowledgement is not recorded as a second Captain response: it is wrongly bound to A and causes a turn-identity conflict. A fresh observer then reports unknown instead of restoring A, with zero model calls.
- Item 4: CONFIRMED. A=[a,b]; a subsequently leaves the authoritative waiting set; valid B=[b]; Captain replies to B. The fold returns responses={B}, outstanding={a}, unresolved={A}. The live observer becomes quiet, but a fresh observer with current source [b] restores A as calling: answered b still matches an event in A. This reproduces the live/restart divergence and re-presentation of answered context without a model call.
- Native preparation HOLD: CONFIRMED on the unmodified cycle-2 initial chief page. The persisted fold returns zero unresolved and one uncertain batch; a fresh observer returns unknown. Supplying livePreparedBatchId resolves the SAME page. In-memory INPUT controls changing only native detail.output={output:payload} to payload, serialized payload, or the already-supported MCP text wrapper each recover one unresolved list. Saved pages and production functions were not changed.

Read-only reproducer: node --import tsx --input-type=module from the pinned spacedock-bridge directory, importing the real readCommanderConversation and ChiefObserver, using local projected-page/SDK-port stubs that throw on run; model-call counter remained 0. These are defect-confirming assertions, not newly committed regression tests or an after-fix pass claim. Existing tests miss the distinct-turn peer acknowledgement and resolved-item predecessor case; the peer-only tests and covering-list response tests do not exercise them.

Saved native inputs: evidence/cycle-2/real-list-run.json; initial-958cabb5-c88b-40d0-9007-4808e0a4dac5-timeline.json (unaltered preparation/page); delivered-28023386-2401-484c-b1f6-a425ddc3a8f0-timeline.json (native message shape); final-chief-timeline.json (actual agentMessage.event=finished in foreground-turn-4). For the peer test only, the preparation wrapper was unwrapped in memory to isolate item 3 from the separately confirmed decoder defect, then the captured peer entry and a fictional distinct-turn acknowledgement were appended/resequenced in memory. The fabricated native event value notification is not needed for the conclusion: the actual saved finished event reproduces it.

### Exact paths and smallest class-level repair, awaiting authorization

Item 3 path — shared/commander-replies.ts:48 skips user envelopes without changing the active current/prepared/provenance context; native peer tool items pass through :76-84 without ending or isolating it. The later acknowledgement enters :85-96 using that old batch; bindTurn (:36-41) invalidates A because its turn differs. server/chief.ts:195-210 applies the false uncertainty through the owning turn-ended hook; :105-124 reproduces it on restart. The raw peer and acknowledgement remain visible, but their inherited batch provenance is wrong.

Smallest repair — Separate the input/turn that owns a batch result from a peer-owned reply turn within this existing interpreter. Recognize both parsed envelopes and native agentMessage metadata, and exclude their distinct-turn acknowledgements from list-result, preparation and Captain-response interpretation while preserving raw readable replies. Keep the original batch candidate and its genuine late errors. Do not just ignore every turn conflict or blindly reset an in-flight batch whenever an interleaved peer entry appears: exact batch identity and existing no-turn-id/interleaving compatibility still matter. Give live receive and restart the same fold result.

Item 4 path — covers at shared/commander-replies.ts:22 requires every historical key, even one no longer waiting. It drives both response retirement (:62-69) and final supersession (:101). answeredVersions and outstanding record per-version answers, but unresolved selection never combines them with authoritative removals. server/chief.ts:105-126 restores A before pruning carry; :129 checks ANY matching event in the historical batch rather than whether a matching event is still unanswered. Since answered b still waits for FO recording, that check cannot clear A. :200-210 can choose the same stale predecessor on a later fallback.

Smallest repair — Use one per-item retirement/selection rule for the existing admitted conversation candidates, applied consistently to successor coverage, genuine-response coverage and live/restart restoration: a predecessor obligation is discharged by an exact genuine answer or an authoritative complete-source removal/replacement, or is carried by a valid covering successor. A predecessor with no current unanswered admitted obligation must never restore merely because an answered event still appears on the board. Supply the already-read complete shared snapshot to history selection (and an equally authoritative snapshot to receive/fallback selection), or pass that narrow context into the fold; with incomplete sources, infer no removal. Reuse the existing event/version and answer/carry facts rather than introducing another store. Keep failed-B fallback, omitted-still-current-item protection and no-retry consumption. This is a projection of admitted conversation obligations, NOT a new list of all current board items; old questions and confirmed-but-not-recorded choices must not be re-admitted.

Native HOLD path — preparedBy at shared/commander-replies.ts:11-20 handles direct/string/content results, but tests batchId on the outer native output wrapper. :81-82 therefore marks the persisted batch uncertain. The livePreparedBatchId shortcuts at :51 and :81 allow analyze (:155 in server/chief.ts) to interpret the same evidence differently. receive (:200-210), which has no shortcut, can mark the batch terminal before publish (:174), explaining the real failed phase even though both providers succeeded. Restart (:106-110) has no in-memory preparation flag and holds too.

Smallest repair — Normalize the observed native result wrapper once in preparedBy, then perform the SAME strict batch id, exact facts, nonempty preparation, allowed tool name, completed/no-error status, single preparation call and turn checks. Preserve supported direct/serialized/MCP-text forms; reject outer or inner isError, malformed/missing data, wrong batch/facts, canceled/failed/duplicate preparation and late failure. Do not accept arbitrary assistant prose as proof or add another live-only override. No generic recursive decoder or provider-wide parsing framework is needed.

### Regression contract for the final authorized repair

- Peer isolation: prepared A → envelope message/notification OR captured native message/finished → ordinary acknowledgement in its distinct turn. Before: unresolved=[], uncertain={A}, restart unknown; after required: A retained, no Captain response, correct non-Captain provenance, restart calling A and zero runs. Also retain a genuinely attributable late A error and reject actual batch-turn conflicts; a real ordinary/explicit Captain reply still consumes, while a peer quoting its words never does. Cover single/multiple projected pages and an interleaved peer entry that must not destroy legitimate in-flight batch output.
- Resolved predecessor: A=[a,b] → authoritative a removal → valid B=[b] → genuine B reply, current source still [b]. Before: live quiet versus restarted calling A; after required: both quiet, no A resurrection, no new model call. Repeat with explicit response, multi-page history and restart; the next independent new c must send only admitted outstanding/current items and must not re-add answered b. Negative controls: a still current and unanswered cannot be retired by subset B; incomplete source proves no removal; failed/uncertain B preserves valid prior unanswered context; changed versions, officer identity and consumed/no-retry behavior remain guarded.
- Native normalization: replay the exact unmodified saved initial page through persisted fold and fresh observer, without livePreparedBatchId. Before: uncertain/unknown; after required: one valid list/calling and zero models. The original/string/MCP-text controls remain valid and exact same live/restart result is required. Mutate status, error flags, batch id, facts, preparation or turn/call identity and require a hold; a late native error must still invalidate. Also exercise turn-ended receive before analyze completion so a successful native result is not prematurely terminal.

These are specified before/after assertions for the next authorized cycle. No repair or after-fix test has been run in this investigation.

### Shared cause and what to cut

These are three distinct direct defects, not one root cause or a single decoder fix: peer-turn attribution, historical coverage without resolved-item context, and native result decoding. They meet in the same fold and its live/restart callers, whose batch proof, per-item obligation and current turn context must agree. Replacing it with the current board would change the Captain's accepted semantics, as the chief engineer warned; it is not an equivalent smaller fix.

Two bounded consumer checks covered (1) runtime exports/call sites in shared, server and client, and (2) actual field rendering plus lifecycle tests. readCommanderConversation serves chiefBoard, observer history/analyze/receive, useCoAsk and CoChat. Legacy focus is still read by CoChat (client/co-chat.tsx:263-264,334,468); explicit response parsing still controls displayed Captain words and recorded-history interpretation. Their absence from the new list UI is not evidence that those compatibility paths are unused. Keep them and the bounded projected-reader/coverage guards; no unused production fold branch has been established that can simply be deleted now.

The concrete simplification after strict native decoding is verified is to remove livePreparedBatchId and its two special prepared-truth shortcuts, plus the analyze-only third argument: they are used today, but would be redundant once every accepted native result proves itself from the persisted page. Require the same strict page interpretation for live completion, receive and restart, rather than preserve two ways to establish preparation. commanderReplies and batchResponse are test-only convenience wrappers in this checkout; removing/moving them would only churn compatibility/tests and does not cure these defects, so do not spend the last cycle on that cleanup. No new storage, framework, confirmation enforcement, notification route or board-truth redesign is proposed.

### Summary

Both new review harms and the native HOLD are reproducible at the pinned head with zero model calls; item 3 is an attribution conflict rather than a recorded Captain answer. The last repair can stay within the existing fold and its snapshot-aware recovery callers, with three bounded changes and the regression contract above. Product worktree and PR remain untouched; only this investigation result is appended and committed with the prescribed state helper, then work stops for FO fix authorization.

## Stage Report: implementation (cycle 3)

- DONE: Fix authorization for "## Investigation result: roborev 1634": implement the three "Smallest repair" proposals as written (peer-owned turns excluded from list result, preparation and Captain-response reading; one per-item retirement rule for successor coverage, genuine-response coverage and restoration; strict normalization of the native prepare-result wrapper) and the simplification in "Shared cause and what to cut" (remove livePreparedBatchId and its two shortcuts so live, receive and restart read the same persisted page), with the "Regression contract for the final authorized repair", each regression failing at 9718e7f0512e0a22f614668cd0294b639ad7306f and passing after (AC-1, AC-2)
  970d9cdaab655aadd489a9cda5393610d5f0cb23 implements the three bounded repairs and removes livePreparedBatchId and both shortcuts. regression-red-verified.log: 17 defect assertions fail at 9718e7f0, with 16 negative/compatibility controls passing; regression-green-1.log: all 77 new/prior retention tests pass. The complete final suite passes 499/499.
- DONE: On the repaired head, rerun the AC-2 question rerun on a fresh isolated real daemon and add a daemon restart after the list is posted and after the preview: the list and its state come back from the persisted page, nothing relays before confirmation, and after confirmation the question and both gates relay exactly once with the permission untouched; tokens and times by turn id; if the Claude weekly limit blocks the model, stop and report (AC-1, AC-2)
  acceptance.json, restart-after-list.json and restart-after-preview.json prove one real Opus/Terra trigger, two real daemon restarts, persisted list/preview state with zero extra restart turns or early relay, then exact delivered counts [1,1,1,0] after the two specified Captain replies. All eight actual turns are measured by generation+agent+turn id; no weekly limit or model retry.
- DONE: npm test and typecheck pass; commit, push to the PR #80 branch (no force push); write "## Stage Report: implementation (cycle 3)" naming the new head
  npm test 499/499 and npm run typecheck exit 0 at 970d9cdaab655aadd489a9cda5393610d5f0cb23 (tests-verified.log, typecheck-verified.log). Normally committed/pushed to existing Draft PR #80, no force; this cycle-3 report is appended and committed with the prescribed scoped state helper.

### Findings

Repair / scope — Peer envelopes and native agentMessage entries mark their distinct reply turns as non-Captain input, without erasing an interleaved owning batch's preparation/result or real late failure. One remaining-per-item rule combines exact answered versions with complete shared-source membership for successor coverage, response retirement and history/receive restoration. Missing/incomplete source context infers no removals. Native output.output is normalized before the same strict preparation checks used by direct/string/MCP-text forms; the live preparation escape hatch is gone. No new store, board-truth list, notification route, retry, confirmation enforcement or legacy-reader removal. Item 1 remains the FO decline.

Regression falsifiers — chief-persisted-list.test.mts: binding a distinct peer acknowledgement/preparation/quoted answer to a batch breaks message/notification/native message/finished and interleaving cases, including multi-page restart/receive. Requiring full historical-key coverage or restoring without current unanswered obligations resurrects A=[a,b] after a resolves and B=[b] is answered; ordinary/explicit replies, next-independent-c membership, subset/current-item and incomplete-source controls exercise the boundary. Removing native-wrapper normalization fails the captured projected-page and fresh-observer cases; malformed/error/wrong-id/wrong-facts/empty/canceled/duplicate/late-error/turn-conflict controls must still hold. Turn-ended receive before analyze completion must not terminalize a valid persisted native preparation. The existing ownership, old-question, identity, no-retry, coverage and previous list-loss tests remain green.

Fixture integrity — test/fixtures/chief-native-list.json retains the saved fictional native entries and projection metadata, excluding the irrelevant agent snapshot/persistence payload so tests have no machine-state dependency. Initial full-suite failures were two fixtures that supplied no persisted preparation and one registered-hook fixture with no board dependency; their SDK-port data was corrected to record the real returned native tool result/provide the source, with the original behavior assertions retained (fixture-alignment.log). No production truth shortcut was restored to make them pass.

Real run / restart — Paseo 0.15.3 + GenUI 0.3.3, isolated ports 55529/55530 and owned home/data. One request listed the question, Alpha gate, Beta gate and permission, with grounded 甲/CSV, approve Alpha and require Beta testing recommendations. After restart 1, the same batch returns calling with no error, no new turn and no messages. 「全照建議」 completed render_ui with exactly three destination/message pairs and zero relay. After restart 2, the list and exact preview tool content persist and state is quiet: that genuine Captain reply consumes waiting context, so the list must not be re-triggered merely because items remain unrecorded. No restart creates a model turn, relay or permission action. final-recovery.json additionally replays the final page through a fresh local observer: quiet, zero unresolved/uncertain/failed, zero models, and three native peer notifications isolated from batch provenance. The previous native preparation HOLD does not recur.

Exact delivery / falsifier — 「確認發送以上預覽」 delivers one question message and one per gate. acceptance.json joins the three tool messageIds to receiver paseo-agent-message:<id> entries and verifies each native received payload equals its inspected preview with only the declared confirmation placeholder substituted. Both verbatim Captain replies, recommendation and reason survive. Any early, duplicate, wrong-recipient or altered payload fails this check. Permission receives zero messages and has zero respond_to_permission calls; the source event stays unchanged. Fictional receipt sinks acknowledge only; no real workflow gate recording is claimed.

Persistence limit — Native provider reload rebuilds sequence/timestamp/turn/message-id metadata; durable message/tool content remains the same. After preview restart, two transient GenUI plugin display entries are absent, while the completed render_ui input still contains the exact three preview messages and destinations. restart-preview-content-identity.json records this explicitly. This proves durable conversation/preview content and backend state, not visual widget survival or browser acceptance; no new rendering or UI persistence repair was attempted.

Measured turns — model-measurement.json records all eight actual turns by daemon generation + agent id + turn id, because foreground ids restart at 1 after a daemon restart. Generation 1 Terra codex-turn-0: 13.506s, 32050 input / 0 cached / 382 output; generation 1 list foreground-turn-1: 48.062s, 8 / 133620 / 1396. Generation 2 preview foreground-turn-1: 35.230s, 12 / 242238 / 2247. Generation 3 confirmation foreground-turn-1: 26.754s, 10 / 191385 / 2056. The three FO receipt turns and one automatic chief acknowledgement are additional, separately recorded with their own usage/times; none is a trigger retry. Usage is provider-reported and not an inferred billing total.

Isolation / cleanup — runtime-source-manifest.json binds this exact head and every runtime file hash; ONLY chiefBoard reads the fictional sources.json seam. Shared source ownership/freshness remains separately tested, not established by the injected source. Permission is a fictional event, not an actual native prompt. No live Bridge files/ports, live agent prompts/switches/archives, credential reads/copies/prints, live installation or browser mutation occurred. daemon-1-stop.json and daemon-2-stop.json preserve only the owned data across restarts. Before final cleanup, the chief/four FOs were idle and Terra was closed after restart (not running); final-agent-disposition.json and cleanup.json prove no running owned agent, all captured descendants gone, both ports closed, and owned runtime/home/data deleted. No pattern kill.

Checks / documents — comment-ratio.log: 138 code / 0 comment lines, 0%, maximum 5% met; doc-impact.json names no additional documents. OVERVIEW.md now describes peer turns, per-item retirement and strict shared persisted preparation. number-guards.log passes against stack base f40c340e8204f4b7dddef238f215aea3f3a6eaab; design-surfaces.log passes. Product, main and flywheel-live worktrees are clean. PR #80 remains OPEN/Draft at the repaired head; task status remains implementation for FO routing. No CI change, migration or ADR reservation. roborev not run: this dispatch assigns the prescribed exact-head review to the FO because the worker cannot reach its daemon.

### Summary

The three authorized repairs and the preparation-shortcut removal are committed/pushed, with 499 passing tests and successful native two-restart list/preview/three-relay proof. The prior native preparation HOLD is resolved within the tested boundary; transient widget persistence is explicitly outside the observed result. This is the last worker repair cycle: hand back to FO for exact-head roborev, independent validation and Captain presentation, without ready/merge/installation authority.

## Investigation: roborev 1642

Cycle 3 at 970d9cdaab655aadd489a9cda5393610d5f0cb23: 499 tests; the real run with two daemon restarts kept the list and preview, relayed nothing before confirmation, then relayed the question and both gates exactly once with the permission untouched; transient GenUI display entries do not survive a restart, the preview content does. Repair budget spent.
FO ran roborev on 970d9cdaab655aadd489a9cda5393610d5f0cb23 (base f40c340e8204f4b7dddef238f215aea3f3a6eaab): exit 1, evidence=roborev:1642, two Medium.
5. shared/coordinator.ts prompt prefers render_ui for the preview, but Bridge's conversation renderer shows a tool call by name only, so in Bridge a widget-only preview reads "↳ render_ui" and the Captain cannot see destinations or messages there (the native conversation renders it).
6. shared/commander-replies.ts gives every list a synthetic focus on its first item; if that item resolves during preparation while others remain, the whole update is rejected and an older list or failure is restored, and restart can read it differently.
Taken to the Captain.
