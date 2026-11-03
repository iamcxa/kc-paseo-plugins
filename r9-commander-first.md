---
title: Flywheel round 9 — design pass, the comms officer as the commander, with the list as the board
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r9-commander-first
gates:
    version: 1
    records:
        - id: gate:r9-commander-first:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r9-commander-first-backlog-1
              briefing:
                id: briefing:r9-commander-first:backlog:attempt-1:revision-1
                digest: sha256:45dfae0c0e5f9303a7a3a8f536ea1a16fa5c90d326c134498ae983890c18d48f
                room-ref: ./r9-commander-first/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r9-commander-first:backlog:1
                briefing: briefing:r9-commander-first:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-11-03T10:51:17.784743Z"
                decision: approve
                reason: 'Accepts direction: the Captain asked on 2026-11-03 to redesign first with the comms officer as the commander; no code; director first.'
                conn:
                    quote: 先改設計，我確認看看
                    source: 'Captain chat 2026-11-03, answering whether to redesign first or adjust round 9 while building; flywheel grant ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-03T10:51:48Z
worktree: .worktrees/spacedock-ensign-r9-commander-first
---

Before round 9's code continues, redesign the accepted list-beside-wide-detail layout so the comms officer is the commander the Captain talks to first, with FO conversations and progress as drill-downs.

Captain, 2026-11-03: 「我覺得要搬到最顯眼的地方，不然沒辦法區別，而且操作重點應該是盡可能讓 comm officier 可以成為指揮官。目前的 UI 好的地方在於切換時更明確，但是我認為，大方向跟指揮官談，細節必要時可以去跟不同 FO 聊，或是去 checking 進度。但是現在這樣 UX 感覺不太像是這樣。但仍然我覺得這個方向會比現在更好」; asked whether to redesign first or adjust while building, he answered 「先改設計，我確認看看」. Standing: 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」.

bite: in the accepted mockups (`r8-list-and-wide-detail/mockups/1440-comms.png`) the comms officer is one row in the Questions group plus a small link at the bottom of the list; the Captain could not find it and asked 「comm officier 在哪裏？」.
consumer: the Captain, talking direction with the commander and drilling into FOs or progress when needed.

## Scope

- Step A (words, no visuals) in `r9-commander-first/design/COMMANDER-FIRST.md`: the Captain's tasks, adding "talk direction with the commander", "go to one FO for detail", "check progress" to the ten tasks in `r8-simplest-way-to-decide/design/INTERACTION-MODELS.md`; operation counts for the commander-first model beside list-beside-wide-detail; where the commander sits (default view, top of the list), how the board and drill-downs are reached, and how one tap returns to the commander; what the commander would need to do that the comms officer does not do today, flagged as the Captain's to rule on (the plugin changes only presentation); recommendation, what gets worse.
- Step B (after step A in the same pass): key states only, as static HTML + PNG at 1440 and 360 with a two-column review.html (images must load from a file:// page): home with the commander; the commander asking a question; drilling into a gate from the board; drilling into an FO conversation; returning to the commander; checking progress on the board; phone home and drill-down. Reuse `r8-list-and-wide-detail/mockups/` for everything not changed.
- Hard exclusions, widgets included: no change to what is sent, relayed or recorded (Confirm, required reasons, separate messaging stay); no new stored data or history view; no new comms officer behaviour implied as built; no in-place permission approval, next-item control or unread/later/running filters; no product code, code branch or PR.
- The design director reviews A and B before the Captain sees anything.

## Acceptance criteria

**AC-1**: The commander is the first and most visible thing, and every drill-down returns to it in one step.
Verified by: the step A counts, and the design director walking them on the mockups.

**AC-2**: The Captain can confirm the direction from one page.
Verified by: review.html with one direction question; his answer recorded verbatim.

## FO alignment

Alignment: not needed: the Captain asked for this redesign on 2026-11-03, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- DONE: Step A in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r9-commander-first/design/COMMANDER-FIRST.md (words only): the Captain's tasks — the ten in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-simplest-way-to-decide/design/INTERACTION-MODELS.md plus "talk direction with the commander", "go to one FO for detail", "check progress" — each sourced; operation counts for the commander-first model beside list-beside-wide-detail (/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-list-and-wide-detail/design/LIST-AND-DETAIL.md); where the commander sits (default view, top and most visible), how the board and drill-downs are reached, one tap back to the commander from any drill-down; what the commander would need that the comms officer does not do today, flagged as the Captain's to rule on; recommendation and what gets worse; detail in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r9-commander-first/design/EVIDENCE.md (AC-1)
  [COMMANDER-FIRST.md](r9-commander-first/design/COMMANDER-FIRST.md) 比較十三項來源與桌／機操作數、列出手機多一步及權限界線；[EVIDENCE.md](r9-commander-first/design/EVIDENCE.md) 逐步重算。若把尚缺原簡報寫成 0 或漏算手機 Board 即不成立。
- DONE: Step B, key states only, as self-contained static HTML with fictional data and one PNG per state at 1440x1000 and 360x780, reusing /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-list-and-wide-detail/mockups/ for anything unchanged: home with the commander; the commander asking a question; drilling into a gate from the board; drilling into an FO conversation; returning to the commander; checking progress on the board; phone home and phone drill-down; /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r9-commander-first/mockups/review.html two-column with one direction question on top, images loading from a file:// page in a fresh headless Chromium (natural width above 0 for two states), and REVIEW.md (AC-2)
  [review.html](r9-commander-first/mockups/review.html) 預選指揮官，8 態 × 2 尺寸＝16 PNG；[capture-evidence.json](r9-commander-first/mockups/capture-evidence.json) 17 組路徑／幾何檢查及舊版反證，[review-file-check.json](r9-commander-first/mockups/review-file-check.json) 兩態桌／機自然寬 1440／360。移除 file: 圖片許可、改回清單預設或讓返回重置決定均會失敗；人類方向答案仍待 FO。
- DONE: Hard exclusions, widgets included: no change to what is sent, relayed or recorded; no new stored data or history view; no new comms officer behaviour drawn as if built (mark any as proposed); no in-place permission approval, next-item control or unread/later/running filters; no product code, code branch or PR; a short stage report
  同一已確認選擇／理由在送出、轉送、指揮官往返及記錄後重開均保留，待記錄列不消失；[boundary-check.json](r9-commander-first/mockups/boundary-check.json) 保護四棵程式工作樹及第八輪資料，未改產品或提交程式／PR。

### Findings

POC 設計限定，boundary-crossed: no。使用現有通訊官為 Commander 的入口，不更改代理權限；自主排序、跨專案計畫與代驗收僅列為 Captain 待裁定提議。Bridge 內一步返回已驗；真實原生／外部宿主返回、真機鍵盤、原簡報回讀與真實送達未驗。

套件檢查詳見 [package-checks.json](r9-commander-first/mockups/package-checks.json)：design_surfaces exit 1（缺 Surfaces／Visible change）按派工以已知 package gap 2 SKIPPED，不加前置欄位；number_guards exit 0（implementation 非 ideation 不跑 scope，無 migrations-path 跳過 migration），未遇 R4 failure／gap 3。comment_ratio 在固定產品 base＝head `316c9eff7bd6ce2f5e15db7382dea1aba1197a26` exit 0，code 0／comment 0；doc_impact exit 0、0 documents，設計文件與驗證保留在本 task。RoboRev 未跑：無產品程式且 package gap 5；依明確排除未開 code branch／PR。

main、live 與本任務空派工 worktree 的 HEAD／branch／clean 狀態不變。暫停中的 r9-list-and-detail-layout 接手前已有另一工作者的修改，所有 status、diff 與未追蹤檔雜湊保持完全相同；未清理、移動或納入提交。三個擷取 browser PID 已退出，自己建立的 fresh profiles 已刪除。

### Summary

完成先談指揮官、從待辦深入 FO／閘門、一步返回的單一提案，保留清單掃描與寬詳情，明列手機多一步的代價。交付自包含 HTML、16 張狀態圖、可直接從磁碟開啟的審閱頁及離線證據；仍待設計總監審閱與 Captain 的逐字方向答案，不代替 AC-2 接受或改動任務階段。
