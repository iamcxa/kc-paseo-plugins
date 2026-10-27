---
title: Flywheel round 8 — design round step 2, mockups of one item using the whole Bridge area
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r8-mockups-one-item-whole-area
gates:
    version: 1
    records:
        - id: gate:r8-mockups-one-item-whole-area:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r8-mockups-one-item-whole-area-backlog-1
              briefing:
                id: briefing:r8-mockups-one-item-whole-area:backlog:attempt-1:revision-1
                digest: sha256:5e5dac0afd3f1a27cbac1bee60c69540d9bfa55081d239e1dad38feb6fb655dd
                room-ref: ./r8-mockups-one-item-whole-area/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r8-mockups-one-item-whole-area:backlog:1
                briefing: briefing:r8-mockups-one-item-whole-area:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-27T19:08:24.887358Z"
                decision: approve
                reason: 'Accepts direction: draws the model the Captain picked on 2026-10-28 (單件全區); one direction, static mockups only, director first; no code or semantic change.'
                conn:
                    quote: 可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進
                    source: 'Captain chat 2026-10-28, answering 「第 8 輪照上面的方式改成設計稿回合、主題用這兩個回饋，可以嗎？」 (design round form); model picked the same day: 「單件全區 (Recommended)」; flywheel grant ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-27T19:08:50Z
worktree: .worktrees/spacedock-ensign-r8-mockups-one-item-whole-area
---

Step 2 of the round 8 design round: draw one mockup direction of the interaction model the Captain picked, so he can say go before any code is written.

Captain, 2026-10-28: on the round form 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」; asked 「第 8 輪設計稿要用哪種操作方式？」, answered 「單件全區 (Recommended)」; in round 7 UAT, on the decision buttons 「按鈕是變大沒錯，但是在電腦上太大了，而且跟送出對話訊息的按鈕大小不協調，我覺得不好」 and most bothersome 「桌面決定區太窄」.

bite: the chosen model (`r8-simplest-way-to-decide/design/INTERACTION-MODELS.md`, accepted 2026-10-28) gives one item the whole Bridge area, but nothing yet shows the Captain what that looks like on desktop and phone, and round 7's oversized desktop buttons came from deciding sizes in code before he saw them.
consumer: the Captain, saying go (or not) on the look before any code.

## Scope

- One direction only, of the chosen model "one item uses the whole Bridge area, back to the list after", as self-contained static HTML with fictional data and one PNG per state, in `r8-mockups-one-item-whole-area/mockups/`, led by `index.html` and `REVIEW.md` (one heading per state, its HTML and PNG, one question each).
- States at 1440×1000 desktop and 360×780 phone: the queue (list) view; one gate opened using the whole area (briefing, conversation with its scope label, message box and send, decision controls); a decision chosen with its reason field (empty required reason, and typed); after Confirm (sent/relayed, then recorded); returning to the list. Decision controls in proportion with the message send button on desktop and large enough to tap on phone (his round 7 words); Paseo's existing look as the base (`_l3-dogfood/walks/round-7/screenshots/`).
- Hard exclusions, widgets included: no "next item" control; no new data, storage or history view; no change to what is sent, relayed or recorded (Confirm, required reasons and separate messaging stay as built in round 7); no product code, code branch or PR.
- The designer lists its own assumptions; the design director reviews before the Captain sees anything, and tells capture artifacts from design.

## Acceptance criteria

**AC-1**: The mockups show the chosen model and nothing it excluded.
Verified by: the design director checks every state against INTERACTION-MODELS.md and the exclusions above, and the operation counts of the model's table can be walked on the mockups.

**AC-2**: The Captain can judge it in a few minutes.
Verified by: REVIEW.md lists each state with its PNG and one question; the Captain's go or his changes are recorded verbatim.

## FO alignment

Alignment: not needed: the Captain chose the design-round form and the model on 2026-10-28; approach from the qnow FO's mode B lessons recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- DONE: Read first: the chosen model /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-simplest-way-to-decide/design/INTERACTION-MODELS.md and its EVIDENCE.md, the round 7 build look (/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/_l3-dogfood/walks/round-7/screenshots/ and /Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge at 316c9eff7bd6ce2f5e15db7382dea1aba1197a26, read-only), and the qnow lessons in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/_l3-dogfood/rounds.md (round 7/8 entries); list your own assumptions (data shown, labels, where Back to list sits, how the comms conversation is reached from an open item) in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-mockups-one-item-whole-area/mockups/ASSUMPTIONS.md before drawing
  已讀所列來源，繪圖前先寫 mockups/ASSUMPTIONS.md；版本、原圖與授權查核見 mockups/EVIDENCE.md。
- DONE: One direction of "one item uses the whole Bridge area, back to the list after" as self-contained static HTML with fictional data plus one PNG per state at 1440x1000 and 360x780: list view; one gate opened using the whole area (briefing, conversation with its scope label, message box and send, decision controls); decision chosen with its reason field (empty required reason, and typed); after Confirm (sent/relayed, then recorded); back to the list; decision controls in proportion with the send button on desktop and at least 44x44 on phone; Paseo's existing look as the base (AC-1)
  mockups/index.html 為入口；9 個狀態各有 1440×1000 與 360×780 PNG，共 18 張。capture.mjs 退出 0；全區寬度、桌面 32px 同高、手機至少 44×44 及離線操作見 capture-evidence.json；恢復窄側欄、把桌面決定按鈕改 44px 或放行空白必填理由會使檢查失敗。
- DONE: Hard exclusions, widgets included: no next-item control, no new data, storage or history view, no change to Confirm, required reasons or separate messaging, no product code, code branch or PR; /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-mockups-one-item-whole-area/mockups/index.html leads and /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-mockups-one-item-whole-area/mockups/REVIEW.md lists each state with its HTML and PNG and one plain question each (AC-2); a short stage report
  mockups/REVIEW.md 每個狀態有 HTML／兩張 PNG／一個問題；未加入下一件、歷史或產品變更，沒有程式提交或 PR。此報告只交付稿件，未代替設計總監審查或 Captain 的 go。

### Findings

詳細命令與結果見 mockups/EVIDENCE.md。design_surfaces.py 退出 1，缺 Surfaces／Visible change：SKIPPED，已知套件缺口 2；number_guards.py 退出 0、PASS: no findings，R4 的套件缺口 3 路徑 SKIPPED（本輪沒有 ADR，未重現 R4 失敗）。
RoboRev：SKIPPED，無產品程式變更，且派工指定套件缺口 5。comment_ratio.py 退出 0：0 code / 0 comment lines，0.0%，未達 20 行；doc_impact.py 退出 0：0 documents；產品 base/candidate 均 b5381b18834ead9047778e96b27199ae0b3bd8e8。
Chrome 在一般 sandbox 未回應；允許本機 headless 擷取後成功。只使用本目錄 file URL、新臨時 profile、逐張擷取；瀏覽器已關閉、profile 已移除。HTML 雜湊與 18 張 PNG 的尺寸已核對；手機系統鍵盤與真實送達不在證據範圍。
主倉 main、派工程式分支及 flywheel-live 前後乾淨；現行安裝仍為 316c9eff7bd6ce2f5e15db7382dea1aba1197a26。沒有新 ADR、migration、產品持久狀態或真實代理操作。

### Summary

完成「單件全區、回清單選事」單一方向，保留獨立傳訊、必填理由、Confirm 及送出／轉送／記錄的差別。交付靜態 HTML、18 張 PNG、逐頁問題及可重製的離線檢查；POC 範圍止於設計稿，獨立設計總監審閱與 Captain 的 go 仍由 FO 接續。

### FO findings before the gate

- Design director pass 1 (codex/gpt-6-astra:xhigh, 2026-10-28) on the mockups: NOT SATISFIED. Passed: whole-area layout; desktop decision controls the same 32 px height as send, phone ≥ 44×44; no next-item control or history view; Confirm, required reasons and separate messaging kept; assumptions accepted except "back to list". Blocks: back-to-list removes a gate that is only sent or relayed (only a recorded one leaves the list; sent and relayed must reopen to show progress); the unassigned-review path (open, prefilled ask → send, 2 steps) is missing. Annoys: REVIEW.md asks nine questions — keep them as reference and ask the Captain for one direction decision on the first page; move capture instructions to EVIDENCE.md; cut "Your decision has been recorded" (repeats the heading); say 已記錄後 not 錄製後; the per-page draft limit is a prototype limit, not a new product rule. FO authorizes one revision.

## Stage Report: implementation (cycle 2)

- DONE: Back to list: a gate that is only sent or relayed stays in the list and reopens to its progress; only a recorded gate leaves the pending list; add the unassigned-review state with a fictional review of an existing kind, open → prefilled ask → send (2 steps), at 1440 and 360
  已送出／已轉送分別回到 list-sent／list-relayed，原閘門列仍在且重開到對應進度；只有 recorded 回清單移除閘門。虛構 example/demo-project #17 審查以開列即預填、再送出兩步完成；兩尺寸各有詢問前後 PNG。capture.mjs 實際點擊查核，若過早移出或遺失預填／收件人即失敗。
- DONE: REVIEW.md: one direction question for the Captain on the first page ("go on this direction, or what to change"), the per-state questions kept below as reference; capture instructions moved to EVIDENCE.md; cut the on-screen "Your decision has been recorded"; 錄製後 → 已記錄後; state the per-page draft limit as a prototype limit; re-capture changed states one at a time; a short "## Stage Report: implementation (cycle 2)" section
  index.html 與 REVIEW.md 首頁只問一個方向問題；各狀態細問留作參考，擷取說明移到 EVIDENCE.md；刪除已記錄重複句，修正用字並標明草稿是原型限制。逐張重擷取共 26 PNG、兩個尺寸離線路徑均 PASS；HTML 雜湊、圖片尺寸及 REVIEW 連結已核對。

### Findings

具體證據與命令見 mockups/EVIDENCE.md 及 capture-evidence.json。既有全區尺寸、桌面決定與 Send 同高 32px、手機至少 44×44、Confirm／必填理由／獨立傳訊的檢查均重跑通過；手機預填全文無須在欄位內捲動。
套件檢查重跑：design_surfaces.py 退出 1，SKIPPED 已知缺口 2；number_guards.py 退出 0、PASS: no findings，無 ADR／migration，R4 缺口 3 路徑 SKIPPED；comment_ratio.py 退出 0，0 code／0 comment lines，0.0%；doc_impact.py 退出 0，0 documents。RoboRev 未跑：無產品程式變更及已知缺口 5。
產品 base/candidate 均 b5381b18834ead9047778e96b27199ae0b3bd8e8。只修改本任務 mockups 與追加此報告；一般產品 worktree 與現行安裝不變，沒有 PR、真實傳訊或記錄。瀏覽器與新臨時 profile 已關閉／移除；無 localhost 服務。

### Summary

完成設計總監第一次審閱所列兩項阻擋與閱讀負擔修訂，保留單件全區方向與原語意。這是靜態原型的第二輪交付，不是設計接受；由 FO 安排複審及 Captain 的 go。
- Design director pass 2 on d0f7d1a: NOT SATISFIED — the earlier blocks and reading load are fixed, but two click-through paths of the static prototype show wrong results: reopening after Confirm shows a fixed "request changes" and sample reason instead of the confirmed choice; going to the comms officer and back resets progress (the gate offers decision controls again, a recorded gate reappears). Layout, proportions and exclusions pass. Second unsatisfied team pass on this theme: under ADR 0008 the FO stops and asks the Captain before another revision.
