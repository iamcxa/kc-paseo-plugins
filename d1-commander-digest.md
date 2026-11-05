---
title: Design — the Commander's periodic digest in its own words, with a replay of the FO originals behind each point
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d1-commander-digest
gates:
    version: 1
    records:
        - id: gate:d1-commander-digest:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d1-commander-digest-backlog-1
              briefing:
                id: briefing:d1-commander-digest:backlog:attempt-1:revision-1
                digest: sha256:f6f114ede6f122e5f40cfdab5f4d5d5e2883470b188335200f6e1778b4636363
                room-ref: ./d1-commander-digest/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d1-commander-digest:backlog:1
                briefing: briefing:d1-commander-digest:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T09:13:21.64486Z"
                decision: approve
                reason: Captain chat 2026-11-05, asked 「照第二種開設計任務嗎？」, answered 「好」.
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-05T09:13:43Z
worktree: .worktrees/spacedock-ensign-d1-commander-digest
---

Design, before any code, the model the Captain chose: the comms officer (the Commander) collects every FO's progress on a schedule and tells him in its own words without pasting originals; each point opens a replay card with the Commander's sentence and the quoted FO originals, from which he can open the FO, keep discussing with the Commander, or reply with a new decision.

Captain, 2026-11-05: 「另外一種是，一樣 co 要批次，每輪格一陣子取得大家的進度，然後『換句話說』且不要夾帶原文給我，我如果想要看細節，應該是點 replay 打開 popup 看到 co 的話跟引用的 fo 原文，我也可以點連結打開 fo 對話，或是選擇留在 co 那邊，就手邊的細節繼續討論，或是直接回覆新的決定，你覺得哪個更好？」; asked 「照第二種開設計任務嗎？」, he answered 「好」. Earlier the same day on the per-FO replay demo: 「我覺得看起來怪怪的，太複雜了。不是新模式不好，是整體就是太複雜了」. Standing: 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」 (2026-10-28).

bite: the Commander conversation is linear while topics interleave; a filtered replay built by inference afterwards was too complex (demo in /tmp, 2026-11-05: 23% of entries attributable exactly, 36% only by inference).
consumer: the Captain, reading the Commander's digest between other work and drilling into one point when needed.

## Scope

- Step A (words, no visuals) in `d1-commander-digest/design/DIGEST.md`:
  - where the Commander's behaviour is defined today (Bridge `server/coordinator.ts`, COORDINATOR_PROMPT, and its tools in `server/fleet-mcp.ts`) and what it would change to: a scheduled collection (by which existing Paseo mechanism — heartbeat, schedule, or the Bridge's own poll), a digest in the Commander's words, and a source reference on each point that the Bridge can read exactly (message or timeline ids, not inference);
  - the cost of one collection per FO and per round: how to measure it, and a measured number only if one is measured;
  - the Captain's tasks (read the digest; open a point's replay; open the FO; keep discussing a point with the Commander; reply with a new decision) with operation counts, and the simplest interaction that covers them;
  - what stays unchanged: gate decisions still go through the existing Confirm and recording path; no in-place permission approval;
  - open questions for the Captain, and what gets worse.
- Step B (after the design director approves step A): one mockup direction as static HTML + PNG at 1440 and 360 with a two-column review.html whose images load from a file:// page: the digest in the Commander conversation, the replay card with the Commander's sentence and the quoted FO originals, its three choices, and the phone sheet.
Non-goals: inferred attribution; filters, modes or per-FO counts in the Commander conversation; changing gate decision or recording semantics; any code, branch or PR in this task.
Budget: one design task; at most two design-director passes per step before the Captain sees it.
Stop condition: the design director unsatisfied twice on a step, or any proposal that changes the Commander's behaviour, its schedule or its cost — those are the Captain's to approve before code.

## Acceptance criteria

**AC-1**: Every point in the digest can show its exact sources.
Verified by: DIGEST.md names the source reference the Commander would emit and how the Bridge reads it with the plugin SDK (symbols), checked by the design director.

**AC-2**: The Captain can judge the direction in a few minutes.
Verified by: one page for step A and review.html for step B; his answers recorded verbatim.

## FO alignment

Alignment: not needed: the Captain chose this model and asked for the design task on 2026-11-05.
Release review: not needed: spacedock-bridge has no journey map yet.

### FO notes

- 2026-11-05: the first worker for implementation-1 (an existing Codex designer session) stopped with "Selected model is at capacity" before any work; FO started one fresh Codex agent on the same model (gpt-6.1-sol, high) with the same emitted prompt. No retry loop.


## Stage Report: implementation

- DONE: Step A in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d1-commander-digest/design/DIGEST.md, words only: where the Commander's behaviour is defined (read-only: /Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge/server/coordinator.ts COORDINATOR_PROMPT, server/fleet-mcp.ts, at 33952f9b3d02fceab104ba09272d65e432a3d095) and the smallest change for a scheduled collection (which existing Paseo mechanism: heartbeat, schedule or the Bridge's own poll — check `paseo --help` and the plugin SDK, do not assume), a digest in the Commander's own words, and an exact source reference on each point that the Bridge can read with the plugin SDK (name the symbols; no inference); the cost of one collection per FO and per round — how to measure it, and a number only if you measured it without sending any message
  設計：d1-commander-digest/design/DIGEST.md；來源／排程核對與成本量測方法見 EVIDENCE.md。8 項 SDK 虛構契約探針通過（checks/source-contract.json）；改成同字不同 FO／序號、不同 epoch／主機、user 原文或缺口皆須拒絕，否則反例會失敗。未量測模型 token／金額，未發訊息。
- DONE: The Captain's five tasks (read the digest; open a point's replay; open the FO; keep discussing a point with the Commander; reply with a new decision) with operation counts and the simplest interaction; gate decisions still go through the existing Confirm and recording path; open questions for the Captain and what gets worse; detail in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d1-commander-digest/design/EVIDENCE.md (AC-1, AC-2)
  DIGEST.md 列五項最短操作數、一般決定與關卡 Confirm 分流；EVIDENCE.md 指向 decideGate／gateDecisionMessage／deliveryState。數字是設計推演，未作真人或裝置測試；AC-1、AC-2 仍待設計總監及 Captain 審查，未代錄回答。
- DONE: Do not start step B; finish with a short stage report and stop for the design director's review
  本次沒有 HTML、PNG 或 review.html；僅提交 Step A 文字、證據及虛構契約探針，停止於設計總監審查前，不修改 stage／gate。

### Summary

完成 Step A 的單頁文字設計、五項操作數、精確時間線來源契約與成本量測方法；建議採 Bridge 既有輪詢方式，只讀 FO 已有回報，全部例子虛構。沒有產品程式、代理、排程、分支或 PR 變更；Step B 未開始，交回設計總監審查。

### Findings

SKIPPED: design_surfaces.py，exit 1：缺 Surfaces／Visible change，為派工指定套件缺口 2；不修改 FO 所有欄位。number_guards.py exit 0，無發現；未宣告 migrations-path，migration guard 自行略過，本次未出現已知 R4 缺口 3。
comment_ratio.py exit 0：產品同一提交比較，新增程式／註解皆 0；doc_impact.py exit 0，列出文件為空，沒有需同步的產品文件；輸出均在 design/checks，不能替代設計審查。
roborev not run: no code change (and package gap 5). No PR opened: design-only scope, no push grant for product code. No ADR added: recommendations remain pending, no accepted implementation decision.
Needs decision: 只讀收集策略、後續頻率／成本上限，以及既有 Commander 套用新指示的方法；ensureCoordinator 不會更新既有 prompt，不能只改常數便聲稱生效。公開 SDK 無排程／prompt 更新方法；內部 scheduleCreate 不作支援介面。
本機 paseo status --json 在 uv_uptime 回傳 EPERM，未取得 daemon 狀態；未讀真實對話，也未依此推論 daemon 離線或成本。沒有真實 Replay、裝置行為、真人閱讀時間或模型忠實度的通過聲明。

### FO findings before the gate

- Design director pass 1 on step A (codex/gpt-6-astra:xhigh, 2026-11-05): NOT SATISFIED. Block: a digest point's source is bound to the FO original but not to a gate, so "one gate, no choice needed" can decide the wrong target — general replies stay in the Commander; a gate decision needs pressing a named gate, reading its briefing, choosing and Confirm (5 operations, 6 with a reason). Annoys: list the shortest path for general direction (type → send, 2) so the replay is not a required step; move version hashes, function names, source fields and API calls from DIGEST.md to EVIDENCE.md. Passed: the SDK methods and fields for exact sources exist (eight fictional probes rerun), no guessed matching; the Captain's decisions (collection strategy, frequency, cost cap, applying a new prompt) are left to him, nothing claimed as built. FO authorizes one revision (no investigation needed: design text, not a code defect).


## Stage Report: implementation (cycle 2)

- DONE: Bind gate decisions to a named gate, never to a digest point: general replies stay in the Commander; a gate decision is press a named gate → read its briefing → choose → Confirm (5 operations; 6 with a required reason); remove "one gate, no choice needed"; add the shortest general-direction path (type → send, 2) so the replay is never a required step; recount the table
  DIGEST.md 重列直接一般方向 2 次、帶摘要點的一般方向／討論 4 次、具名關卡決定 5 次／須原因 6 次；即使僅一個關卡仍須明確點選並閱讀說明。EVIDENCE.md 區分來源鍵與 gate 目標；checks/cycle-2-operations.json 核對八條設計路徑的逐項計數，非介面實測。
- DONE: Move version hashes, function names, source fields and API calls from DIGEST.md to EVIDENCE.md; keep on the page "every sentence can show its exact original; if it cannot be found it says so"; a short "## Stage Report: implementation (cycle 2)" section; do not start step B
  主頁已移除版本 SHA、函式名、來源欄位及 API 呼叫，保留每句能顯示精確原文、找不到便明說；技術依據集中 EVIDENCE.md。沒有 HTML／PNG／review.html；本報告後停止，交回設計總監第二次審查。

### Summary

修正摘要點不能指定關卡的目標歧義，關卡決定一律先按具名關卡、讀說明，再選決定及 Confirm；一般方向可直接輸入後送出，不必 Replay。主頁只保留使用者閱讀與操作資訊，技術依據留在 EVIDENCE.md；沒有產品變更，Step B 未開始，待設計總監複審。
- Design director pass 2 on step A (2026-11-05): SATISFIED — gate decisions bound to a named gate (5 from the replay; 6 with a reason); general direction type → send (2) with the replay optional; one question for the Captain: read only existing reports, mark missing data unknown, do not prod FOs; frequency, cost cap and applying a new Commander prompt still to decide; nothing claimed as built.
