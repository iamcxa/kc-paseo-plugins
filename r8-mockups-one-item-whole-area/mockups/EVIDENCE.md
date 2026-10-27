# 本輪交付與證據

本輪只交付靜態設計稿，沒有產品程式、程式分支提交、PR、真實傳訊或閘門操作。驗證的是離線稿可呈現及走動，不代表設計總監或 Captain 已接受。

## 固定來源

- 派工程式 worktree：`/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r8-mockups-one-item-whole-area`；分支 `spacedock-ensign/r8-mockups-one-item-whole-area`，HEAD `b5381b18834ead9047778e96b27199ae0b3bd8e8`，前後均乾淨，沒有使用它繪圖。
- 第 7 輪產品唯讀來源：`/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge`，HEAD `316c9eff7bd6ce2f5e15db7382dea1aba1197a26`；讀取 Bridge、CoChat 與決定控制的實作，並開圖檢視原桌面與手機畫面。前後均乾淨，沒有啟動或操作 Paseo daemon。
- ADR 0008（飛輪授權決策記錄）於派工 worktree HEAD 的狀態為 Accepted；SHA-256 `d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f`。本派工的靜態稿範圍更窄。
- [已選模型](../../r8-simplest-way-to-decide/design/INTERACTION-MODELS.md)、[模型查核](../../r8-simplest-way-to-decide/design/EVIDENCE.md)、[rounds.md 第 7／8 輪](../../_l3-dogfood/rounds.md) 已讀；任務開始沒有本階段既有報告，相關前一任務已由 Captain 選定模型。
- 實際檢視原圖：`1440-gate-open-expanded.png`、`360-gate-decision-reason-typed.png`；第一輪視覺核對已開桌面清單／開件／已填理由，以及全部手機狀態；第二輪另開桌面送出後清單／預填審查，以及手機轉送後清單／預填審查／詢問送出／已記錄。

## 第二輪修訂

依任務檔的設計總監第一次審閱（NOT SATISFIED）及 FO follow-up，修正未記錄閘門返回清單的語意並補齊既有未分派審查路徑。REVIEW.md 和 index.html 首頁只提出一個方向問題，各狀態的細問留作參考；擷取說明移到本檔，已記錄頁移除重複句，草稿限制明確標為原型限制。

## 離線行為與尺寸

`node /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-mockups-one-item-whole-area/mockups/capture.mjs` 成功退出 0：26 張 PNG、兩次離線操作路徑。逐狀態量測及 HTML 雜湊在 [capture-evidence.json](capture-evidence.json)。

| 已實際跑過的主張 | 會使檢查失敗的變動 |
| --- | --- |
| 1440×1000 的 Bridge 全區寬 1120px（扣除 320px 宿主側欄）；360×780 全寬 360px；沒有文件溢出或掉出螢幕的控制 | 恢復 380px 決定側欄，或使理由控制超出視窗 |
| 桌面全部決定／確認按鈕及 Send 同高 32px；手機各按鈕至少 44×44px | 把 44px 手機決定按鈕原樣套到桌面；或縮小手機目標 |
| 要求修改空白理由不能確認、輸入後能確認；暫緩同樣必填，准可省略理由 | 讓空白必填理由可送出，或把批准理由改成必填 |
| 清單開件 → 選結果 → 輸入理由 → 取消／重選仍有獨立草稿 → 確認顯示已送出 → 回清單重開進度；已轉送亦同，僅已記錄移出 → 開通訊官問題 → 發普通訊息 | 共用訊息／理由草稿、確認直接顯示已記錄、過早移出待決清單，或把普通訊息當決定 |
| 未分派審查從清單開啟就預填既有格式的詢問，按 Send 送普通訊息；兩次點擊，手機預填全文可讀 | 增加第三個必要操作、漏掉預填、錯誤收件人或將詢問記為閘門決定 |
| Read full briefing 可展開同件的虛構原文；單件只有一個對話區及明示範圍 | 隱藏原文、保留另一個通訊官對話分佔單件，或遺失對話目標 |

瀏覽器只開本目錄 file URL，以控制 pipe 操作，不載入任何 localhost 服務。一般 sandbox 下 Chrome 未回應控制要求；允許啟動本機 headless Chrome 後成功，最後重跑亦通過。每個尺寸的新臨時 profile 都已關閉及移除。圖片沒有系統鍵盤，不證明真機輸入時的版面。

## Findings

`python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0/scripts/design_surfaces.py check /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-mockups-one-item-whole-area.md`：退出 1，要求 Surfaces／Visible change。SKIPPED：已知套件缺口 2，POC 四階段任務未要求這兩個欄位；不為使工具通過而改 FO 記錄。

`python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0/scripts/number_guards.py check --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc --task /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-mockups-one-item-whole-area.md`：退出 0，PASS: no findings；scope check 因 implementation 不跑，migration check 因未宣告路徑略過。本輪沒有 ADR 或 migration；R4（ADR 編號預留檢查）的已知套件缺口 3 路徑 SKIPPED，沒有聲稱這次重現 R4 失敗。

`python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0/scripts/comment_ratio.py b5381b18834ead9047778e96b27199ae0b3bd8e8 b5381b18834ead9047778e96b27199ae0b3bd8e8 --repo /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r8-mockups-one-item-whole-area --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`：退出 0，code lines 0, comment lines 0, 0.0%；不足 20 行，不啟用 5% 上限。這是未變動產品碼的檢查，不用來評估靜態稿品質。

`python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0/scripts/doc_impact.py b5381b18834ead9047778e96b27199ae0b3bd8e8 b5381b18834ead9047778e96b27199ae0b3bd8e8`：退出 0，0 document(s)；產品版本相同，沒有受影響產品文件。這次新增的設計文件彼此連結在 REVIEW.md。

RoboRev（本機程式碼審查工具）：SKIPPED，沒有產品程式變更，且派工已指出套件缺口 5。沒有新 ADR；設計假設留在本任務。獨立設計總監審閱與 Captain 的 go 由 FO 接續，未自行記錄接受或改動階段。

## 重製圖片

需求：Node.js 22 或更新版本，以及可執行 headless 的 Google Chrome。無 npm 套件、無網路、無本機伺服器，也不需要 Paseo。macOS 預設 Chrome 路徑是 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`；其他安裝位置作為第一個參數傳入。

```sh
node /absolute/path/to/mockups/capture.mjs /absolute/path/to/chrome
```

程式只開本目錄的 `index.html`，使用 Chrome DevTools Protocol（瀏覽器控制介面）的 pipe。每個尺寸使用新臨時 profile，完成後關閉瀏覽器並移除；逐張輸出 PNG 與 [capture-evidence.json](capture-evidence.json)。它會走兩個尺寸的離線操作，量測全區寬度、按鈕尺寸、畫面溢出及 Confirm 停用／啟用。保留 capture.mjs 供設計總監重製；這份靜態設計稿被正式實作取代時，一起退役。
