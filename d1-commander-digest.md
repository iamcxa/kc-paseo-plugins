---
title: Design — the Commander's periodic digest in its own words, with a replay of the FO originals behind each point
status: validation
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
        - id: gate:d1-commander-digest:validation
          stage: validation
          attempts:
            - id: gate-attempt:d1-commander-digest-validation-1
              briefing:
                id: briefing:d1-commander-digest:validation:attempt-1:revision-1
                digest: sha256:1849f55f1d36b56ef91101c27469d7451055983354a3a0e570b9d28bacb868b7
                room-ref: ./d1-commander-digest/review/validation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d1-commander-digest:validation:1
                briefing: briefing:d1-commander-digest:validation:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T13:08:41.722691Z"
                decision: approve
                reason: 'Captain 2026-11-05, asked 「照這個方向做，還是有哪裡要改？」 on the cycle 5 mockups: 「照這個方向可以」 — accepts the Commander digest design as the reference for a code task.'
              application:
                target-stage: done
                state: pending
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
- Captain ruling 2026-11-05 on step A's open question, asked 「CO 定時收集進度時，要怎麼取得資料？」, answered 「只讀既有回報 (Recommended)」 (option text: read only the FOs' existing reports, mark missing ones unknown, never prod an FO). Frequency, cost cap and how a new Commander prompt is applied remain open until measured.
- Captain ruling 2026-11-05 on the step B stop, asked 「摘要設計稿只剩「可點擊示範」一個路徑錯誤，要怎麼做？」, answered 「你先看截圖定方向 (Recommended)」 (option text: he reviews the screenshots and says go or change; the routing error becomes an acceptance item for the code task).
- Captain review 2026-11-05 on the mockups (phone page): 「好像確實比較好，但是要注意我不是只有看到原文，我需要的是前因後果，不然光看到一個問題或是一段句子，看不出脈絡，所以也給不了意見或決策」. Not yet his go: FO sends the design back for a revision of the Replay (steps A and B) before he decides.
- Captain's go 2026-11-05, asked 「照這個方向做，還是有哪裡要改？」 (the cycle 5 mockups, review-phone.html), answered 「照這個方向可以」.
- Captain 2026-11-05 on applying the new prompt: 「開新的可以」 (a new comms officer with the new prompt; the old one archived, its conversation still readable). Carried into d3-commander-digest-slice-1.

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
- Design director pass 1 on step B mockups (2026-11-05): NOT SATISFIED. Blocks: after a gate's Confirm the board still says it waits on the Captain, and reopening clears the choice and sent state and allows Confirm again — keep the decision and progress and update the entry; a reply with context keeps only the typed text and drops the chosen digest point — keep the point's identity and sentence with the sent message, separate from the Captain's words. Annoys: the host sidebar is 240 px instead of the 320 px baseline; cut the repeated "direction stays in the Commander" tutorial, the second "fictional" label and "no other message substituted"; assumption 9 needs a long-original / several-sources phone state with the three exits reachable. Passed: the digest scans quickly; unknown and source-not-found are honest; review.html loads images from file://. FO authorizes one revision.
- Design director pass 2 on step B (2026-11-05): NOT SATISFIED — one prototype routing block: after the long-original state, another point's Replay still shows the long-original sources and its Open FO points at the wrong owner (index.html replaySources() keys on a page-wide flag instead of the digest point). Everything else passed: Confirm keeps choice, reason and progress with no second Confirm; context replies keep the point separate from the Captain's words; 320 px sidebar; trims; the phone long-original state keeps the three exits. Second unsatisfied pass on step B: per the task's Stop condition FO asks the Captain before another revision.
- Design director on cycle 5 (after the Captain's 前因後果 review, 2026-11-05): SATISFIED — the Replay gives scope, history and what is asked, with an exact source per context line and a same-FO conversation window; the routing error is fixed; counts and the unmeasured cost are stated honestly; review-phone.html embeds all 21 phone images.

### Summary

修正摘要點不能指定關卡的目標歧義，關卡決定一律先按具名關卡、讀說明，再選決定及 Confirm；一般方向可直接輸入後送出，不必 Replay。主頁只保留使用者閱讀與操作資訊，技術依據留在 EVIDENCE.md；沒有產品變更，Step B 未開始，待設計總監複審。
- Design director pass 2 on step A (2026-11-05): SATISFIED — gate decisions bound to a named gate (5 from the replay; 6 with a reason); general direction type → send (2) with the replay optional; one question for the Captain: read only existing reports, mark missing data unknown, do not prod FOs; frequency, cost cap and applying a new Commander prompt still to decide; nothing claimed as built.


## Stage Report: implementation (cycle 3)

- DONE: Step B: one mockup direction of /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d1-commander-digest/design/DIGEST.md as self-contained static HTML with fictional data and one PNG per state at 1440x1000 and 360x780, the Bridge's current commander-first look as the base (/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/_l3-dogfood/walks/round-9/screenshots/ and /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r9-commander-first/mockups/): the Commander conversation with one digest (changed / blocked / waiting points, an "unknown" line for an FO with no report, collection time); a point's Replay card (the Commander's sentence, the quoted fictional FO original with FO name and time, "Open FO", "Keep discussing", "Reply with a new decision"); a source that cannot be found; the general-direction path (type → send) without opening a Replay; a gate decision reached by pressing a named gate (briefing, choose, Confirm); the phone sheet; list your assumptions in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d1-commander-digest/mockups/ASSUMPTIONS.md first
  mockups/ASSUMPTIONS.md 先記假設；index.html 與 13 態、26 張 1440×1000／360×780 PNG 完成，artifacts.json 保存逐檔尺寸與雜湊。摘要／未知／原文遺失、三個 Replay 出口、直接方向與具名關卡流程皆具虛構示意；來源與畫面範圍見 REVIEW.md。
- DONE: Hard exclusions: no filters, modes, per-FO counts or inferred attribution; no change to gate Confirm, required reasons or recording; nothing shown as automatic sending; /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d1-commander-digest/mockups/review.html two-column (states left, desktop/phone right, toggle, arrow keys, one direction question on top) with images that load from a file:// page in a fresh headless Chromium (natural width above 0 for two states), and REVIEW.md; a short "## Stage Report: implementation (cycle 3)" section
  review.html 是左狀態／右桌面與手機的單方向審查頁；全新 headless Chromium 的 file:// 實測摘要及 Replay 圖片 naturalWidth／naturalHeight 正確，尺寸切換與左右鍵通過。17 項離線檢查涵蓋草稿與焦點、來源失效、明確按鈕才送出、具名關卡選擇／Confirm 及修改與暫緩必填原因；移除目標點選、允許空白原因或讓回覆出口發送，都會使檢查失敗。

### Summary

完成 Step B 單一方向：延續 Commander 主入口的深色樣式，摘要先讀、原文按需展開，手機使用底部卡片；一般方向直接輸入，關卡仍由具名入口、完整說明、選擇及 Confirm 決定。全部資料虛構，26 張截圖與 17 項離線檢查完成；三個自建 Chromium 已停止、自建空白 profile 已移除，交回設計總監審查。

### Findings

只讀收集策略依本次派工已確認；頻率、成本上限與現有 Commander 套用新指示仍待 Captain 決定，沒有另行啟用。離線互動不證明宿主／實體手機／軟鍵盤、模型改寫、真實來源、發送或關卡記錄；完整界線見 mockups/REVIEW.md。
SKIPPED: design_surfaces.py exit 1，缺 Surfaces／Visible change，沿用派工指定套件缺口 2；不改 FO 欄位。number_guards exit 0，未出現 R4 缺口 3；未宣告 migration 路徑的 guard 自行略過。comment_ratio exit 0，未變產品同提交比較為 0 程式／註解；doc_impact exit 0，文件清單為空，無產品文件需同步。
roborev not run: no product code change (and package gap 5). No product PR opened or branch changed; no ADR added. 既有設計頁與其他任務未修改。


## Stage Report: implementation (cycle 4)

- DONE: Prototype state: after a gate's Confirm the board entry shows the sent/relayed/recorded progress (not "waiting on you"), and reopening keeps the choice and progress without allowing a second Confirm; a reply with context keeps the chosen digest point's identity and sentence attached to the sent message, shown separately from the Captain's own words; host sidebar back to the 320 px baseline
  修訂前實際重現與原稿雜湊見 mockups/checks/cycle-4-before.json。入口現在同步送出／轉交／已記錄，重開保留選擇與原因，無第二個 Confirm；送出訊息保留摘要點識別及原句，引用區與 Captain 文字分開。兩種尺寸皆實測，桌面側欄幾何為 320 px。
- DONE: Cut the repeated "direction stays in the Commander" tutorial, the second "fictional" label and "no other message substituted"; add a phone state with a long original and several sources where Open FO, Keep discussing and Reply with a new decision stay reachable; recapture changed states one at a time; review.html images still load from file:// (recheck two states); a short "## Stage Report: implementation (cycle 4)" section
  刪除重複導覽教學、第二處虛構標籤及替代訊息說明；新增三份長來源的起點／真底部與回覆後引用、轉交／已記錄狀態。18 態共 36 張 PNG 已依最終 HTML 逐張重擷取；23 項離線檢查通過，file:// 摘要、Replay、長原文三態圖片尺寸正確，三個自建 Chromium 已退出且空白 profile 已清除。

### Summary

修正圖稿狀態：關卡確認後不再等待 Captain，重開不重送；引用在送出後仍與原摘要點綁定，與 Captain 原話分開顯示。已恢復 320 px 側欄並刪減重複文字，補上長原文多來源手機狀態；36 張截圖與 23 項離線檢查完成，待設計總監第二次審查。

### Findings

會推翻本修訂的反例：確認後入口仍等你決定、重開清空選擇／原因或出現第二次 Confirm、相同回覆文字導致不同摘要點混同、或長原文捲到底後三個出口離開視窗；capture.mjs 對兩種尺寸均設明確失敗檢查。後續轉交／已記錄只有虛構進度示意，沒有自動事件、發送或真實關卡寫入。
SKIPPED: design_surfaces.py exit 1，沿用派工套件缺口 2（缺 Surfaces／Visible change）；number_guards、comment_ratio、doc_impact exit 0，未改產品、無影響文件，migration 路徑未宣告的檢查自行略過。roborev not run: no product code change (and package gap 5). 原文機制、產品、代理、design/ 與其他任務均未修改；頻率、成本上限與新指示套用仍待 Captain 決定。


## Stage Report: implementation (cycle 5)

- DONE: Revise the Replay so a point carries its cause and consequence: (a) a short "how we got here" by the Commander in its own words — what this is about, what happened before, what is being asked of him now — each line with its own exact source; (b) the FO original shown inside its own conversation: a few exact entries before and after the source entry from that FO's timeline (no inference, nothing from other FOs), with "more before / more after"; (c) the three choices unchanged. Update DIGEST.md (the model, the sources for the context lines and the window, operation counts for "understand a point well enough to decide", and what this adds to the Commander's collection cost — measured only if measured) and EVIDENCE.md
  DIGEST.md 與 EVIDENCE.md 已同步：Commander 三行脈絡各有精確來源，原文放回所屬 FO 的前後對話，可更早／更後與定位各行原文；三個主要出口、具名關卡與 Confirm 不變。理解／核對／擴展的點按及捲動分開計，新增收集輸入、輸出和按需讀取成本未量測；七項假傳輸契約檢查通過。
- DONE: Redraw the affected states at 1440 and 360 (Replay short, Replay long / several sources, source missing, phone sheet) with fictional data; keep the review.html images loading from file:// and rebuild review-phone.html with the images embedded (data: URIs) so it opens on a phone; a short "## Stage Report: implementation (cycle 5)" section
  21 態、42 張 1440×1000／360×780 PNG 逐張重擷取；28 項離線互動檢查通過，包含跨點來源與 FO 路由、逐行定位、同 FO 前後順序、長文真底部及原有防重送。review.html 仍通過 file:// 圖片載入；review-phone.html 內嵌全部 21 張手機 PNG，複製到無相鄰資產的資料夾後以全新 360×780 Chromium 驗證三態，四個自建瀏覽器及暫存資料夾已清理。

### Summary

Replay 現在先交代範圍、先前經過與目前所需／明說的後續影響，再顯示主引用所在的同 FO 對話；各行可核對自己的原文，前後文能明確擴展。修正全域長文旗標造成的跨點來源混入，更新模型、證據、圖稿與手機內嵌圖片頁，交回審查。

### Findings

會推翻本修訂的反例：從長卡切換後仍出現別點來源／FO、脈絡連結定位到錯誤訊息、前後文混入別 FO 或丟失角色／順序、來源遺失卻顯示替代內容；兩種尺寸的互動檢查與七項契約探針都設有拒絕條件。只證明離線原型與假傳輸契約，不證明模型忠實度、真實伺服器游標／保留期、宿主、實體手機、送達或記錄。
新增 token、金額與真實等待時間未量測；只讀既有回報且不催問，頻率、成本上限與現有 Commander 新指示套用仍待決定。首項私人對話不重貼，以上 DONE 保留工作指令本體。
SKIPPED: design_surfaces.py exit 1，沿用派工套件缺口 2（缺 Surfaces／Visible change）；number_guards、comment_ratio、doc_impact exit 0，未改產品，無產品文件需同步，migration 路徑未宣告的檢查自行略過。roborev not run: no product code change (and package gap 5). 未改代理、排程、產品分支、PR 或其他任務。
