---
title: Flywheel round 8 — design round, list beside a wide detail, with every waiting state presented clearly
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r8-list-and-wide-detail
gates:
    version: 1
    records:
        - id: gate:r8-list-and-wide-detail:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r8-list-and-wide-detail-backlog-1
              briefing:
                id: briefing:r8-list-and-wide-detail:backlog:attempt-1:revision-1
                digest: sha256:1626eb4e74b2159a2e8529315bddb08f179b949d63fc72d6a7efa162ce28ac68
                room-ref: ./r8-list-and-wide-detail/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r8-list-and-wide-detail:backlog:1
                briefing: briefing:r8-list-and-wide-detail:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-11-03T07:05:53.353108Z"
                decision: approve
                reason: 'Accepts direction: the Captain chose to try the list-beside-wide-detail layout and asked for the reference evaluation on 2026-11-03; step A has no visuals and no code.'
                conn:
                    quote: 可以試試看，你也可以看一下他在每個 gate/等待的介紹全面評估一下
                    source: 'Captain chat 2026-11-03, answering 「第 8 輪設計稿要不要改成 Observatory 那種「左邊窄清單、右邊寬詳情」？」; flywheel grant ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-03T07:06:52Z
worktree: .worktrees/spacedock-ensign-r8-list-and-wide-detail
---

Redo the round 8 design for the layout the Captain wants to try — a narrow list that stays visible beside a wide detail — and first evaluate how a better-rated plugin presents each kind of waiting item, before any mockup.

Captain, 2026-11-03: 「我覺得後者的 UI 有比較好，從 UX 角度切入比較一下」 (comparing stevecastaneda/progress with zhjiang22/agent-observatory); asked 「第 8 輪設計稿要不要改成 Observatory 那種「左邊窄清單、右邊寬詳情」？」, answered 「可以試試看，你也可以看一下他在每個 gate/等待的介紹全面評估一下」. Standing ruling for the round: 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計，不要急著做 UI 改進」 (2026-10-28).

bite: round 8 step 1 compared three models and missed master-detail; the Captain chose 單件全區 from that incomplete set and then preferred Observatory's layout on sight (`_l3-dogfood/rounds.md`, 2026-11-03).
consumer: the Captain, choosing the layout and saying go before any code.

## Scope

- Step A, no visuals, in `r8-list-and-wide-detail/design/`:
  - Reference evaluation of zhjiang22/agent-observatory (github.com/zhjiang22/paseo-plugins, folder agent-observatory: README.md, OVERVIEW.md, assets/ screenshots): for every waiting/attention state it shows (pending approval, question, plan to approve, error, quota, idle/unfinished turn, unread, awaiting reply, later, running, background running), how it is introduced — row label, colour/icon/text, priority among labels, quick-filter chip and count, grouping, the detail's first content, the primary action and its wording, secondary actions, phone behaviour, legend. Then map each to Bridge's waiting kinds (open gate, recorded / no-longer-open gate, FO question, comms officer question, review, unassigned review, loading and failed sources, closed FO) and say adopt / adapt / skip with a reason. Reference only: the repository has no licence, so no code, text or asset is copied.
  - Operation counts for the master-detail model on the same ten tasks as `r8-simplest-way-to-decide/design/INTERACTION-MODELS.md`, next to the earlier three models; where the comms officer conversation lives in this model (a list row, a detail tab, or other) with counts for each option.
  - Recommendation, what gets worse, open questions for the Captain on one page.
- Step B (after the design director approves step A): one mockup direction as static HTML + PNG at 1440 and 360, with a two-column review.html like round 8's, Paseo look as the base; decision controls in proportion with send on desktop, ≥ 44×44 on phone.
- Hard exclusions, widgets included: no change to what is sent, relayed or recorded (Confirm, required reasons, separate messaging stay); no new stored data or history view; no AI summaries, token statistics, scheduling, sounds or auto-archive from the reference; no product code, code branch or PR.

## Acceptance criteria

**AC-1**: Each Bridge waiting kind has a sourced presentation decision.
Verified by: the mapping table cites the reference's README section or screenshot for every adopted or adapted item, and the design director checks it against both products.

**AC-2**: The Captain can judge layout and states in a few minutes.
Verified by: one page for step A; review.html for step B; his choice and his go or changes recorded verbatim.

## FO alignment

Alignment: not needed: the Captain chose to try this layout and asked for the reference evaluation on 2026-11-03, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.


## Stage Report: implementation

- DONE: Reference evaluation of zhjiang22/agent-observatory (read with gh api from github.com/zhjiang22/paseo-plugins, folder agent-observatory: README.md, OVERVIEW.md, assets/*.png; no licence, so reference only — copy no code, text or asset): for every waiting or attention state it shows, how it is introduced (row label, colour/icon/text, label priority, quick-filter chip and count, grouping, the detail's first content, primary action and wording, secondary actions, phone behaviour, legend), each citing its README section or screenshot; then a mapping to Bridge's waiting kinds (open gate, recorded or no-longer-open gate, FO question, comms officer question, review, unassigned review, loading and failed sources, closed FO) with adopt / adapt / skip and a reason (AC-1)
  design/EVIDENCE.md 逐態檢視參考 README／OVERVIEW／全部 PNG，列明標記、優先、篩選與計數、分組、詳情、主要／次要動作、手機及圖例；每個 Bridge 等待種類有來源與取捨。作者文件、合成截圖及未知各自標明；非產品實跑。
- DONE: Operation counts for the list-beside-wide-detail model on the same ten tasks as /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-simplest-way-to-decide/design/INTERACTION-MODELS.md, next to the earlier three models; where the comms officer conversation lives in this model (a list row, a detail tab, or other), with counts per option; your own assumptions flagged
  design/LIST-AND-DETAIL.md 並排同十項任務的四案；design/EVIDENCE.md 展開全部路徑，CHECKS.txt 重算 38 個任務數值及 18 個通訊官路徑數值；若移除確認、插入中間導覽或改變起點，計數即不成立。
- DONE: /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-list-and-wide-detail/design/LIST-AND-DETAIL.md: one page with the recommendation, what gets worse and the open questions for the Captain at the top, then the state presentation table, the mapping and the counts; detail and citations in /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-list-and-wide-detail/design/EVIDENCE.md; a short stage report (AC-2)
  design/LIST-AND-DETAIL.md 一頁以建議、代價及待裁事項開頭，列狀態取捨、四案數字與通訊官位置；細節集中 EVIDENCE.md。交付步驟 A 文字供審，不等於設計總監通過或 Captain 的 go。

### Findings

參考版本固定 28cc223a6327dea712751bc6a3fb2cce9f265d65；LICENSE 現為 MIT，派工「無 licence」已過時，仍只參考、未複製任何程式／文字／資產。Bridge 唯讀版本 316c9eff7bd6ce2f5e15db7382dea1aba1197a26；派工 worktree 未用，無產品提交、推送、PR、daemon 操作、新 ADR 或 migration。
套件輸出見 design/CHECKS.txt：design_surfaces.py exit 1 缺 Surfaces／Visible change，SKIPPED 已知套件缺口 2；number_guards.py exit 0，PASS: no findings，無 migrations-path，R4 路徑 SKIPPED 已知套件缺口 3。未擅改任務欄位。
comment_ratio.py exit 0：0 code／0 comment lines；doc_impact.py exit 0：0 documents，無須更新其他文件；兩者以固定產品 SHA 對自身比較，不能用來宣稱設計驗收。RoboRev 未跑：無程式變更，且已知套件缺口 5。
文字重算 56 個數值路徑、21 個本地文件連結通過；git diff --check 通過。無可執行新介面，未量測耗時、真機鍵盤或端到端送達。原簡報回讀仍缺；舊原型重入遺失選擇／進度尚未修，已保留為後續驗收要求。

### Summary

建議桌面清單旁放單件詳情，通訊官從清單開同一詳情區，手機一次一頁；桌面換件少返回清單一步，批准仍三步。已完成參考逐態評估與同口徑計數，只交付文字設計；由 FO 接續安排設計總監審查，通過後才可進步驟 B，Captain 尚未接受本案。

### FO findings before the gate

- Design director pass 1 (codex/gpt-6-astra:xhigh, 2026-11-03) on LIST-AND-DETAIL.md: NOT SATISFIED. Blocks: the reference's strengths are not carried into the proposal — quick filters by the existing item kinds and counts are skipped on "no new data", which does not rule them out; the phone bottom-fixed actions and one main status per item need an explicit adopt or skip with a reason; the tool-permission request (the current list's top-priority item, which opens the native agent session) is missing from the mapping — add its prompt, destination and main action, and state that the reference's in-place approval is not adopted. Passed: five reference states spot-checked against its README and screenshots; counts (approve 3, change 5, briefing then approve 4, unassigned-review ask 2); comms opened from the list; no semantic or data change. Annoys: cut the "awaiting director, no mockups or code" line, move term definitions to EVIDENCE.md, say "reason and message drafts". The director also noted its own step 1 review missed the master-detail model. FO authorizes one revision.


## Stage Report: implementation (cycle 2)

- DONE: Carry the reference's strengths into the proposal or reject each with a reason: quick filters built from the existing item kinds and their counts (no new data needed), one main status per list item by priority, the state-dependent primary action wording in the detail, result- or question-first detail, and phone bottom-fixed actions; add rows to the main page saying adopt or adapt for each, with counts where they change any of the ten tasks
  主頁新增五項採用／調整及操作影響；EVIDENCE.md 補既有種類計數、每件主狀態優先、逐態動作文字、閱讀順序與手機底部固定規則。預設全部保留 3／5／4／2；可選篩選加 1，跨被隱藏事項先還原再選。
- DONE: Add the tool-permission request to the mapping: how its row is introduced, that it opens the native agent session (the current destination), its main action wording, and an explicit line that the reference's in-place approval is not adopted
  主頁與 EVIDENCE.md 明列工具權限的既有提示、FO、等待時間，以及「到原生會話處理權限」直達既有 navigation.openAgent；不採用原地批准。開原生入口 1、先篩選再開 2；原生授權完成數未驗證。
- DONE: Trim LIST-AND-DETAIL.md: cut the "awaiting director, no mockups or code" line, move term definitions to EVIDENCE.md, write "reason and message drafts"; a short "## Stage Report: implementation (cycle 2)" section
  主頁刪等待審查／無稿無程式句，定義移至 EVIDENCE.md，改為「理由與訊息草稿」；約 1,519 中文字、57 行，詳細規則留在證據頁。此節只追加，不改前次報告或 FO 回饋。

### Findings

design/CHECKS-CYCLE-2.txt：65 個明列數值路徑按動作重算、主頁十項四欄與證據表、25 個本地文件及標題連結均通過；數字是文字模型預測，非介面或真機證明。移除 Confirm、加入中間處理頁、把隱藏事項換件少算還原一步，都會推翻相應數字。
design_surfaces.py exit 1 仍缺 Surfaces／Visible change：SKIPPED 已知套件缺口 2。number_guards.py exit 0，PASS: no findings；R4 路徑 SKIPPED 已知缺口 3。comment_ratio.py exit 0，0 code／0 comment lines；doc_impact.py exit 0，0 documents，未列其他待更新文件。RoboRev 未跑：無程式變更且已知缺口 5。
產品 base/candidate 仍 316c9eff7bd6ce2f5e15db7382dea1aba1197a26；只改本任務 design 與追加報告，沒有新 ADR、資料保存、原地權限批准、真實代理操作或 PR。手機鍵盤、底部可達性與重入保留草稿仍須後續稿件／實作驗收；設計總監複審由 FO 安排。

### Summary

把參考的篩選件數、單一主狀態、動作措辭、問句／結果優先及手機底部固定操作帶入提案；工具權限沿用原生會話，不在 Bridge 批准。原十項基本數字不變，可選篩選與隱藏事項的還原成本另列；保留既有確認、理由、傳訊及轉送記錄語意。
- Design director pass 2 (2026-11-03): SATISFIED — each reference strength adopted or adapted with counts (a filter adds one step; switching to a filtered-out item is 2 on desktop, 3 on phone); the tool-permission request keeps the native session and does not adopt in-place approval; one direction decision for the Captain.
