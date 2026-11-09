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

## FO alignment

Alignment: not needed: the Captain set the model and approved this task on 2026-11-09 (quoted in the seed).
Release review: not needed: spacedock-bridge has no journey map yet.
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
