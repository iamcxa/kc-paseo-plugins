---
title: Flywheel round 8 — design round step 1, the simplest way for the Captain to decide (interaction models, no visuals)
status: validation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r8-simplest-way-to-decide
gates:
    version: 1
    records:
        - id: gate:r8-simplest-way-to-decide:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r8-simplest-way-to-decide-backlog-1
              briefing:
                id: briefing:r8-simplest-way-to-decide:backlog:attempt-1:revision-1
                digest: sha256:35e4a6acac237f064ae8e8de77df90557d4d6c4f4aefbb73bf94db43b7129a08
                room-ref: ./r8-simplest-way-to-decide/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r8-simplest-way-to-decide:backlog:1
                briefing: briefing:r8-simplest-way-to-decide:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-27T18:42:18.000406Z"
                decision: approve
                reason: 'Accepts direction: the Captain chose this design-round form on 2026-10-28 and asked for the simplest UX before any UI work; step 1 has no visuals, no product code and no PR.'
                conn:
                    quote: 可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進
                    source: 'Captain chat 2026-10-28, answering 「第 8 輪照上面的方式改成設計稿回合、主題用這兩個回饋，可以嗎？」; flywheel grant ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-27T18:43:04Z
worktree: .worktrees/spacedock-ensign-r8-simplest-way-to-decide
---

Round 8 of the POC flywheel under ADR 0008 is a design round with no product code: before any mockup, find the simplest usable way for the Captain to do his deciding tasks in the Bridge, on desktop and on phone.

Captain, 2026-10-28, round 7 UAT: most bothersome 「桌面決定區太窄」; on the phone-sized decision buttons 「按鈕是變大沒錯，但是在電腦上太大了，而且跟送出對話訊息的按鈕大小不協調，我覺得不好」; next 「我想先做設計稿先不要動手改，問一下 qnow fo 的方式，飛輪不先動手先做滿設計，節省實做錯方向的時間」. On the round form, asked 「第 8 輪照上面的方式改成設計稿回合、主題用這兩個回饋，可以嗎？」, he answered 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」.

bite: rounds 5–7 each built a UI change and then found in UAT or the next walk that the layout around it was wrong (round 7: decision controls oversized on desktop, decision area still narrow); the qnow FO reports the same failure on 2026-10-28 — visuals polished for an interaction model the Captain never chose (`_l3-dogfood/rounds.md`, round 7).
consumer: the Captain, choosing the interaction model before any mockup is drawn.

## Scope

- Step 1 only (this task): an interaction-model pass with no visuals, in `r8-simplest-way-to-decide/design/`:
  - the Captain's tasks in the Bridge, each with where (desktop between work, phone between meetings), how often, and what he must see to decide — sourced from his words in `_l3-dogfood/rounds.md` (rounds 1–7) and the walk rulings, each task citing its source;
  - 2–3 candidate interaction models for the decision screen and queue (for example: today's list + side card; a full-width decision view; a decide-from-the-list model), each described in words;
  - a tasks × models table of operation counts, with each count's steps written out;
  - for each model, what it needs that the product does not store or offer yet, and anything it would change in what is sent, relayed or recorded (that last part is the Captain's to rule on);
  - the designer's own assumptions, flagged;
  - one recommended model with why, and what gets worse under it.
- Design director reviews step 1 before the Captain sees it; the Captain picks the model. Step 2 (one visual direction as static HTML + PNG) is a later task, not this one.
- No product code, no branch push, no PR; output only in the state folder. Exclusions as hard constraints: no visual polish, no colour or size proposals, no component library choices in step 1.

## Acceptance criteria

**AC-1**: Every task is sourced and every operation count is reproducible.
Verified by: each task cites the Captain's words or a walk ruling; each table cell lists its steps; the design director checks the counts against the current build's screenshots in `walks/round-7/`.

**AC-2**: The Captain can pick a model from one page.
Verified by: `design/INTERACTION-MODELS.md` reads in under five minutes, with the recommendation, its cost and the open semantic questions at the top.

## FO alignment

Alignment: not needed: the Captain chose this round form and theme on 2026-10-28; approach from the qnow FO's mode B and its 2026-10-28 addendum, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- DONE: The Captain's deciding tasks in the Bridge, each with where (desktop between work, phone between meetings), how often, and what he must see to decide, each citing its source (his words in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/_l3-dogfood/rounds.md rounds 1–7, or a walk ruling in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/_l3-dogfood/walks/round-5..7/director-ruling.md); the current build's step count per task, read from the installed code at 316c9eff7bd6ce2f5e15db7382dea1aba1197a26 (read-only, /Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge) and the round 7 walk screenshots (/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/_l3-dogfood/walks/round-7/screenshots/) (AC-1)
  design/INTERACTION-MODELS.md「任務與適用情境」「每件操作數」與 design/EVIDENCE.md：9 個來源化任務、固定 316c9ef 程式與 9 張直接開圖核對；地點依派工、頻率皆標假設。
- DONE: 2–3 candidate interaction models for the queue and decision screen, each in words; one tasks × models table of operation counts with each cell's steps written out; per model, what it needs that the product does not store or offer yet, and anything it would change in what is sent, relayed or recorded (flag those as the Captain's to rule on); your own assumptions flagged (AC-1)
  3 案、9×3 格加桌機／手機分支；28 個操作數／分支逐格驗算，正數與列出的步驟一致。保留確認、理由、收件人與既有轉送／記錄語意，候選數字明列為預測。
- DONE: /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-simplest-way-to-decide/design/INTERACTION-MODELS.md that reads in under five minutes: the recommended model, why, what gets worse under it and the open semantic questions at the top, then the tasks, the models, the table and the gaps (AC-2)
  daba751 交付兩份文件；主頁 59 行、可見正文約 2,198 漢字，推薦、代價與語意問題置頂；五分鐘是篇幅估計，尚未做 Captain 計時閱讀。

### Findings

- 成果版本：狀態提交 daba751；只新增 design/INTERACTION-MODELS.md 與 design/EVIDENCE.md。推薦「一事一頁」，普通批准仍 3 步，換下一件由 2 步降至 1；清單內處理批准 2 步，但同時辨認多個收件情境。桌面回通訊官在推薦案反增 1 步。
- 可推翻處：若大多只需摘要連續批准，清單內處理可能勝出；若常與通訊官協調，現行桌面更省。沒有真實頻率或新流程測試，未算加權節省；手機滑動與鍵盤成本另計，模擬圖不是真機證據。
- 共同缺口：已記錄後原簡報的完整回讀不可完成；讀 recorded 的 0 操作沒有冒充完成回讀。server/gate.ts 和 shared/decisions.ts 的第二條資料查核區分既有 state 引用、既有 claim 保存與尚未提供的歷史入口；不要求新增保存服務。
- 文件查核 PASS：兩檔相對連結均存在，28 個操作數／分支正數逐步重算一致；若格子省略或增加一個操作但未改數字，檢查會失敗。程式事件路由與已開圖檔的具體對照列於 EVIDENCE.md；沒有把讀碼說成真實送達已驗證。
- design_surfaces.py：SKIPPED（已執行，exit 1；缺 Surfaces、Visible change，派工已指明 package gap 2）；未擅自補 FO alignment 或增加視覺工作。
- number_guards.py：exit 0，PASS: no findings；migration guard skipped: no migrations-path declared，base bed5a6644c64、head b5381b18834e。它查到程式主倉而非本次狀態文件，不能當本設計證據；本輪無 migration／ADR 編號，未出現已知 package gap 3 的 R4 失敗。
- comment_ratio.py f1d5450 daba751（--repo 狀態倉）：code lines 0, comment lines 0, 0.0%；低於 20 行門檻，不強制比例。doc_impact.py 同版本回 []；既有保留文件未受影響，不需更新。git diff --check f1d5450 daba751 通過。
- roborev：SKIPPED，無程式變更，且派工指出 package gap 5。無程式提交／推送、無 PR、無 daemon 變更；main、flywheel-live 與未使用的派工 worktree 皆乾淨，產品版本仍為 316c9eff7bd6ce2f5e15db7382dea1aba1197a26。
- 狀態提交第一次受 sandbox 的 Git 索引寫入限制阻擋；同一 spacedock state commit 命令經核准重跑後提交並推送成功，沒有改 Git 配置或碰鎖。階段與 frontmatter 保持原樣；設計總監審查、Captain 選模型由 FO 後續安排。

### Summary

已依核准的 poc 範圍完成無視覺互動模型文件，將可省掉的整步、增加的操作、未提供的資料與自身假設分開寫明。既有轉送與記錄語意未改；本報告是作者交付，並非設計總監通過、Captain 選定或後續視覺設計授權。

### FO findings before the gate

- Design director pass 1 (codex/gpt-6-astra:xhigh, 2026-10-28) on INTERACTION-MODELS.md: NOT SATISFIED. Block: the page never answers the Captain's 「桌面決定區太窄」 — no model states that the decision uses the whole available area (the build still puts it in a 380 px side column). Annoys: "check result and original briefing" scored 0 although reading the original briefing cannot be done today — split it; the recommendation's main gain rests on an unproven "next item" — add the smaller model "one item uses the whole area, return to the list to choose"; the briefing-version question should name the briefing bound to that decision, with storage, retention and merging as the Captain's; the page is dense (~2,200 characters plus the table) — move checks to EVIDENCE.md. Twelve spot-checked counts were correct. Director's own pick: one item using the whole area, keep Confirm and separate messaging, return to the list after, without "next item". FO authorizes one revision.

## Stage Report: implementation (cycle 2)

- DONE: Answer the Captain's 「桌面決定區太窄」 (round 7 UAT, cite it) per model in plain words: how much of the desktop each model gives the decision; leave sizes and button proportions to the visual step; add the smaller model "one item uses the whole available area, return to the list to choose" and score it; evaluate "next item" separately as an option, not as the recommendation's main gain
  b8b891f：主頁引用第 7 輪「桌面決定區太窄」，逐案說明區域；建議單件用整個可用區域、回清單選事，換件 2 步。「下一件」另列選配 1 步與失去重看全清單的代價。
- DONE: Split "check result and original briefing" into "read the result in front of you" (count) and "reread the original briefing bound to that decision" (cannot be done today — say so, no 0); state the semantic question as the briefing bound to that decision, with any new storage, retention or merging of sources as the Captain's to rule
  操作表拆為「讀眼前結果」0 操作與「回讀該次原簡報」不可完成／尚缺；原簡報列沒有數字，綁定該次決定，不以最新版本替代。新增保存、期限、來源合併均由 Captain 裁定。
- DONE: Cut INTERACTION-MODELS.md to a page the Captain reads in under five minutes: recommendation, what gets worse, open questions for him, tasks, models, the table; move duplicated guarantees, per-item fetch/verify and identity details to EVIDENCE.md; a short "## Stage Report: implementation (cycle 2)" section
  主頁可見正文 1,322 漢字、51 行（前版約 2,200 漢字）；順序為建議、代價、待裁定、任務、三案、操作表。重複保證、按件取資料／驗證、身分細節移入 EVIDENCE.md。

### Findings

- 28 個數值格／裝置分支逐步重算通過；若增刪操作而未改數字會失敗。原簡報列另驗無數字；兩份文件的相對連結皆可達，git diff --check 689e068 b8b891f 通過。五分鐘仍是篇幅目標，未聲稱 Captain 已計時閱讀或新互動已經實測。
- comment_ratio.py 689e068 b8b891f（--repo 狀態倉）：code lines 0, comment lines 0, 0.0%，未到 20 行強制門檻；doc_impact.py 同範圍回 []，既有文件未受影響。
- design_surfaces.py 已執行、exit 1，SKIPPED：仍缺 Surfaces／Visible change，已知 package gap 2；number_guards.py exit 0、PASS: no findings（無 migrations-path，查的是程式倉，不是本設計的行為證明）。roborev SKIPPED：無程式變更及 package gap 5。
- 保留前一報告與設計總監 NOT SATISFIED 裁決，沒有替換為通過；本輪仍是 poc 的無視覺文件修訂，沒有產品修改、程式分支提交／推送或 PR。

### Summary

已按三項修訂要求交付較小的建議案，主要收益是決定可用整個區域；保留確認和獨立傳訊，不靠新增下一件來證明價值。原簡報回讀獨立標為缺口，下一步由 FO 安排設計總監複審。
- Design director pass 2 on 6014610: SATISFIED (the desktop width complaint answered per model; "next item" an option; rereading the original briefing marked not possible today; page about 1,300 characters). Director's pick: one item uses the whole area, back to the list after.
- Captain's pick, 2026-10-28, asked 「第 8 輪設計稿要用哪種操作方式？」, answered 「單件全區 (Recommended)」.
