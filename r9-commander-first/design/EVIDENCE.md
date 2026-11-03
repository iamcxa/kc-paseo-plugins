# 依據與計數

## 依據與能力界線

讀取時 state HEAD 為 `2b13b341589258800589901516180b0fcab2acbe`。Captain 原話及本輪批准設計的來源為 [task](../../r9-commander-first.md) 與 [輪次紀錄](../../_l3-dogfood/rounds.md#round-9--2026-11-03--r9-list-and-detail-layout-stack-layer-7-on-57)；十項原任務與其來源沿用 [INTERACTION-MODELS.md](../../r8-simplest-way-to-decide/design/INTERACTION-MODELS.md#任務)，本輪補三項逐字來自「大方向跟指揮官談」「去跟不同 FO 聊」「checking 進度」。使用頻率與家／辦公室分布沒有數據，未拿來加權。

比較基準是 [LIST-AND-DETAIL.md](../../r8-list-and-wide-detail/design/LIST-AND-DETAIL.md) 與 [第八輪 prototype](../../r8-list-and-wide-detail/mockups/index.html)，只重用自有樣式與互動，不用外部參考的程式、文字或資產。本輪未重新評估外部插件。

現行產品只讀基準固定為 `316c9eff7bd6ce2f5e15db7382dea1aba1197a26`，位置 `.worktrees/flywheel-live/spacedock-bridge/`：

- `shared/coordinator.ts` 的 `COORDINATOR_PROMPT`：Captain 對 FO 的單一通道；先 `fleet_status`，缺資料才問 FO；可應 Captain 要求啟動 FO；必須具名轉述，不能自己驗證成果、修改流程、派工作者或處理權限。`COORDINATOR_OPTIONS` 只列既有工具，不新增指揮能力。
- `client/bridge.tsx`：目前手機預設 `fos`；`onAskCo` 預填訊息並切到 `co`。桌面現行通訊官常駐，但第八輪設計把它收成清單的一件，這是本輪要調整的基準。
- 第二個有界搜尋讀了 `client/co-chat.tsx`、`server/coordinator.ts` 以及 `bridge.tsx` 的呼叫路徑：沿用相同代理和普通對話，未見獨立的「指揮官」計畫／自主裁決路徑。此結論僅限這些靜態入口與明文權限；沒有讀真實對話、啟動 daemon、檢查動態工具或推論人工安排不存在。
- 既有決定流程沿用第八輪，不更改傳送內容、轉送、記錄或 Confirm。ADR 0008（`docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md`）的權限、安全、決定語意與額外持久化仍由 Captain 裁定。本輪沒有新增 ADR 或修改授權。

## 逐步重算

第八輪清單起點是已載入的全部事項，未開詳情；本輪起點是已載入的指揮官對話，桌面清單同時可見，手機不顯示清單。每點一次、點入欄位、連續輸入各 1；閱讀／等待 0，捲動按實際增加。不是計時或真機鍵盤驗證。比較回通訊官時兩案都有同一待回問題，不把沒有問題的首頁當回覆完成。

| 任務 | 第八輪動作 | 本案桌面動作；手機差異 |
| --- | --- | --- |
| 掃清單 | 讀取 0 | 讀取 0；手機 Board 1 |
| 批准 | 開閘門 → Approve → Confirm，3 | 同樣 3；手機先 Board，4 |
| 修改／暫緩 | 開閘門 → 選擇 → 點理由 → 輸入 → Confirm，5 | 同樣 5；手機先 Board，6 |
| 完整簡報再准 | 開件 → 展開簡報 → Approve → Confirm，4 | 同樣 4；手機先 Board，5 |
| 問負責人 | 開 FO／閘門 → 點訊息 → 輸入 → Send，4 | 同樣 4；手機先 Board，5 |
| 回通訊官 | 開通訊官 → 點訊息 → 輸入 → Send，4 | 已選中，點訊息 → 輸入 → Send，3；手機相同 |
| 問未分派審查負責人 | 開審查帶預填 → Send，2 | 同樣 2；手機先 Board，3；已有通訊官草稿不覆寫，需人工調整另計 |
| 開始另一件 | 桌面選另一列 1；手機回清單 → 選列 2 | 保持同樣路徑，手機的 Board 返回鍵不是 Commander |
| 眼前結果 | 讀已顯示送出／轉送／記錄，0 | 0；不把送出叫完成 |
| 原簡報回讀 | 尚缺 | 尚缺；最新內容不能冒充當次原文 |
| 談方向 | 開通訊官 → 點訊息 → 輸入 → Send，4 | 點訊息 → 輸入 → Send，3；可要求現有通訊官詢問 FO，不暗示代理自行規劃 |
| 去 FO 看細節 | 開 FO 問題對話，1 | 選 FO 問題，1；手機先 Board，2。要傳訊再加 3 |
| 查進度 | 讀清單主要狀態，0 | 讀清單 0；手機 Board 1。再開一件看轉送對象與記錄狀態各加 1 |

回指揮官：第八輪桌面點可見通訊官入口 1，手機回清單再開通訊官 2；本案各深入頁固定 Commander 返回鍵 1。這只涵蓋 Bridge 內頁；外部原生會話／GitHub 的宿主返回不作一鍵保證。

## 畫面資料與件數

無通訊官問題時待辦 6 件：權限 1、審查 2、閘門 2、FO 問題 1。出現通訊官問題時共 7、問題 2；其中一題在固定的指揮官入口，清單不重複。篩選 Gate 時固定入口仍作導覽、不計在 2 件結果。送出／轉送件仍在，單件記錄後總數及閘門數各減 1。只用既有問題、等待時間、來源狀態與轉送／記錄值；沒有計畫表、進度百分比或跨專案新資料。

## 驗證界線

Step A 先寫完，再寫 Step B；[假設](../mockups/ASSUMPTIONS.md) 在繪圖前列明。截圖及可點擊示意只證明提案可閱讀與頁面內路徑，不代表真實訊息、原生會話、實機鍵盤或新指揮能力已建成。設計總監審閱與 Captain 的方向答案仍待 FO 接續，作者不代替接受。
