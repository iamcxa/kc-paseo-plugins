# 靜態設計稿的證據與限制

入口：[review.html](review.html)，逐態索引：[REVIEW.md](REVIEW.md)，繪圖前假設：[ASSUMPTIONS.md](ASSUMPTIONS.md)。設計依 [LIST-AND-DETAIL.md](../design/LIST-AND-DETAIL.md)，不是第二個方向。

## 來源與範圍

- 本次狀態起點 `8e88c4ff6dac7b62554507bea42516f62442db27`，任務 implementation；設計總監第二次已接受文字，Captain 對「照這個方向畫設計稿，可以嗎？」回答「可以」，記錄在任務檔。這是步驟 B 的繪圖授權，不是本稿的接受。
- 產品唯讀版本 `316c9eff7bd6ce2f5e15db7382dea1aba1197a26`；主倉起點 `90982ca4175b5322acc94fc9a8e7145788714377`，main。派工程式 worktree 不使用，只有本任務 mockups 及末尾報告變動。
- Paseo 外觀基底來自前次 [round 8 稿件](../../r8-mockups-one-item-whole-area/mockups/REVIEW.md) 與 round 7 擷取；原生字體、深色底、分隔線及綠色動作延續，未取用 agent-observatory 的原碼、文字或資產。參考 licence 現況已由前次 design/EVIDENCE.md 更正，這次仍只參考。
- 所有工作、對話、權限提示、儲存庫及回執皆虛構。HTML 不連任何服務，不呼叫真實代理、不送訊、不批准權限、不讀寫產品狀態。原生會話目的地與外部審查只作離線示意，不能當作實際宿主路由證據。

## 交付

`index.html` 是不依賴網路的可點擊示意，內含 23 個固定狀態；每態各有 1440×1000 與 360×780 PNG，共 46 張。另有 `review-entry.png` 顯示雙欄審閱入口。

桌面清單與寬詳情同時存在，手機一次一頁，動作固定在可用區域底部。一般控制桌面 32px 高、手機至少 44×44px；判斷比例是相對訊息 Send 的實測，並非只量決定按鈕。所有列各有一個主要狀態，種類、負責人、年齡及分頁關閉留作補充。

初始全部 7 件，四類分別 1／2／2／2；問題含通訊官，普通對話入口不額外計數。只看閘門有 2 件；已送／已轉送的原列留在清單，已記錄後變全部 6、閘門 1。通訊官來源失敗只令全部及問題數變成已知下限，不令其他已完成來源的數字失真。

## 可重製的檢查

需要 Node.js 20 以上及可用的 Chromium／Google Chrome；沒有 npm 套件依賴。`capture.mjs` 預設 Chrome 路徑是 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`，也接受第一個參數指定另一個相容執行檔。實跑的 Node 版本與瀏覽器路徑在 `capture-evidence.json`。

從本目錄執行 `node capture.mjs`；指定另一瀏覽器時使用 `node capture.mjs /absolute/path/to/chrome`。它以 CDP（瀏覽器偵錯協定）pipe 控制 fresh profile，不開偵錯 TCP port，不啟動 localhost、靜態伺服器或 Paseo daemon；每張 PNG 依序等待擷取完成才換下一張。兩個尺寸各用新暫存 profile，觀察瀏覽器退出後才移除。

輸出 `capture-evidence.json` 包含兩個 HTML 的 SHA-256、逐態幾何、18 組檢查、網路界線及清理結果；`capture.log` 是最新成功執行輸出。檢查的實質反證如下：

| 主張 | 實際執行與會推翻它的修改 |
| --- | --- |
| 狀態可讀、比例合宜 | 兩尺寸逐態渲染與 PNG；量清單／詳情、32／44 高度、控制不溢出、底部位置、一列一主要狀態。把詳情改回窄側欄、桌面決定改成不同於 Send 的高度或讓確認掉出 viewport 會失敗 |
| 理由與訊息分開 | 分別填理由與訊息；取消再選保留兩者、另一閘門不繼承；必填空白不能確認，批准可無理由。把訊息當理由、取消清空草稿或跨件共用會失敗 |
| 重開不換掉決定 | 對 Approve、Request changes、Hold 各自確認；回清單重開並檢查 DOM 顯示的確切選擇與理由。固定寫死某個結果會失敗，不只核對內部變數 |
| 通訊官往返保留進度 | 每種選擇在 sent 和 relayed 都切到通訊官、傳普通訊息、再回原件，檢查確切選擇、理由、草稿、階段及不再供重送。返回時重設到 open 會失敗 |
| 已記錄後的返回 | 明確注入虛構記錄回執，原列移除；回清單後用瀏覽器返回先前詳情，先顯示原選擇及理由，沒有決定控制或原簡報入口。已記錄列重現或回讀最新簡報冒充原件會失敗 |
| 兩步詢問及原生權限去向 | 清單開未分派審查直接預填，送出即只新增通訊官訊息；已有草稿不被蓋掉。權限列直接換到原生會話示意，沒有 Bridge 批准控制；插入中間頁或改送決定會失敗 |
| 篩選與失敗不誤導 | 核對 7／1／2／2／2、閘門篩選兩列、全域數不隨篩選縮掉、已記錄減一；失敗來源是下限，可重查，對話讀錯不稱空白。把來源失敗寫成零或篩選後誤改總數會失敗 |
| 手機返回與底部可達 | 先捲清單，開件後返回仍保留位置；理由填寫頁縮到 360×480，Send 與 Confirm 仍在可用區域。隱藏清單把捲動位置覆蓋為零、底部固定錯誤會失敗；縮 viewport 不能證明實體鍵盤 |
| 審閱入口不必跳頁 | 兩欄、23 組本地圖、兩尺寸切換、實際方向鍵與 open 預選；核對和原型狀態清單一致。圖片缺失、狀態漏列或鍵盤未綁定會失敗 |

兩個視窗均監看 JavaScript 例外與頁面請求；只允許 file／data，沒有遠端請求。稿件不使用 localStorage、sessionStorage 或網路 API；草稿和進度只在同一文件記憶體，重載固定狀態將重置。

## 重跑記錄

第一輪審閱入口早於手機 PNG 產生，圖片完整性檢查未過；改為兩尺寸齊全後再開入口。第二輪抓到手機返回位置被隱藏清單的零值覆蓋，已改為只保存可見清單的捲動位置。第三輪主要路徑通過，但清理紀錄過早，未觀察到第二個瀏覽器退出；最終版改為等待退出事件，再移除 profile。

三次先前輸出保留為 `capture-attempt-1.log`、`capture-attempt-2.log`、`capture-attempt-3.log`，不算作最終通過證據。最新完整執行另核對 HTML 雜湊、47 張 PNG 尺寸與兩個瀏覽器確實退出；以 `capture.log`／`capture-evidence.json` 為準。

## 套件與人工檢視

套件檢查全部使用派工的絕對 package 路徑，第四輪記於 `PACKAGE-CHECKS-CYCLE-4.txt`（前輪保留於 `PACKAGE-CHECKS.txt`）。既有 design_surfaces 缺口 2、number_guards 的 R4 缺口 3 與無產品程式變更時的 RoboRev 缺口 5 沿用前次處理，不擅補任務欄位。

人工直接開圖檢視：桌面 open、reason-typed、recorded-reopened，手機 reason-typed、review-ask、list、permission、source-failed-list，以及 review-entry。核對問題與結果的先後、桌面比例、手機草稿與確認同時可讀、原生目的地清楚、失敗不冒充空白。圖片不是端到端送達、原生權限、來源恢復或實體裝置驗收；設計總監與 Captain 尚須審閱本次稿件。


## 第四輪：清單掃描及來源綁定

依狀態 `5854960709edf49852e5c8d173b40aefc807202e` 的 FO 回饋修訂；前次 42 圖交付的原始證據可在 `fc131d531c75e4db1c1db5dee12cf62fc7fe2cc8` 讀取。本輪恢復 Permissions／Reviews／Gates／Questions 分組與組內件數，維持原種類順序。分類標題不是另一個主要狀態，每個事項只留一個圖形加文字標記；種類與 owner 仍是補充。

| 誰在處理 | 標記與文字 | 放在哪裡 |
| --- | --- | --- |
| 等你處理 | ◆ Your turn，加 permission／review／find owner／decide／reply | 待辦列；批准、問題、未分派審查不再只顯示同一小段琥珀字 |
| 等別人或讀取 | ◷ Waiting，加 relay／record／source loading | 原種類的列；送出及轉送仍保留，讀取中只標其來源事項 |
| 已完成／不再開放 | ✓ Done，加 recorded by 該 owner／no longer open | 保留的原件詳情；待決清單移除，不加完成分組或歷史頁 |
| 來源需查核 | ! Check，加 source failed | 只標受影響的通訊官事項與對話；其他 FO 正常 |

符號及文字均直接渲染，不依賴顏色辨識。清單標題改為 Queue，避免把等別人的事項也說成在等你。增加分組後縮減列間留白；桌面詳情仍 870、清單 330，決定與 Send 的高度維持 32／手機 44。空詳情只寫 Select an item；刪除重複的 Separate from a decision。review.html 預選 open。

### 與參考圖的視覺對照

本輪用 `gh api` 再讀同一固定版本的[桌面圖](https://github.com/zhjiang22/paseo-plugins/blob/28cc223a6327dea712751bc6a3fb2cce9f265d65/agent-observatory/assets/screenshot-sessions.png)及[手機圖](https://github.com/zhjiang22/paseo-plugins/blob/28cc223a6327dea712751bc6a3fb2cce9f265d65/agent-observatory/assets/screenshot-mobile.png)，只在記憶體開圖，未把資產寫入交付。與本稿 1440×1000、360×780 逐張對照；參考的資料、畫布與狀態不相同，這是視覺判讀，沒有以秒量測誰較快。

| 第一眼需要辨認 | 參考圖 | 本稿與限制 |
| --- | --- | --- |
| 我現在是否要動作 | 批准、異常、未讀及待回覆以各自圖形、文字和明顯標記區分 | 本稿以 ◆ Your turn 與 ◷ Waiting 的不同圖形及文字先分責任，再讀分組及題名；不需要只看琥珀與藍灰差別。權限與閘門同為 ◆，仍須看分組判斷種類 |
| 找某類工作 | 參考優先按需處理／執行分組，列上標具體狀態 | 本稿依權限／審查／閘門／問題分組，讓原種類的定位恢復；狀態在組內讀，不改排序、不合併 owner。四個標題會比只有少數優先組佔更多高度 |
| 區分已送及待我決定 | 參考的執行與注意態有不同形狀，不能只憑活動時間猜 | 本稿的 list-sent／list-relayed 以時鐘加 Waiting，和同組另一件菱形 Your turn 並列。手機擷取捲到 Gates 組可直接對照；狀態本身不需另開詳情才知道，確切決定／理由才到詳情讀 |
| 在手機讀狀態 | 參考手機保留圖形與狀態文字，沒有只留色點 | 本稿 360 同樣保留圖形與完整責任詞；分組、題名及 owner 可讀。清單仍需捲動，種類篩選可縮小範圍；不宣稱一屏放得下全部七件 |
| 已完成是否仍等我 | 參考把完成／閱讀狀態分開；選中結果可直接讀 | 本稿保留詳情用 ✓ Done，已記錄結果與理由在前；不把已完成放回待決列來增加可比畫面，也不借用參考的歷史／未讀資料 |

### 來源及 owner 的反證

通訊官讀取狀態只保存在 `commsSource`，只有 `draftKey(id) === comms` 的對話受影響；source-failed 展示通訊官錯誤，source-failed-fo 在同一來源失敗下展示正常 Demo FO 對話。source-loading 顯示等待讀取。其他 FO 不會因為這個全域來源提示被改為失敗；一般待辦件數下限仍按來源決定。

每件閘門的顯示都從 `owner(id)` 取得目標，未再固定寫 Demo FO。擷取腳本真的確認第二件 Export FO 閘門，注入該件 relayed／recorded 收據，再核對畫面寫 Export FO、沒有 Demo FO，並確認第一件仍是 open。若回復全域錯誤旗標或固定 owner，這兩組檢查會失敗。

最新 `capture-evidence.json` 重跑全部原重入路徑，加上分組／圖形文字與第二閘門 owner，共 18 組；46 張狀態圖逐張擷取，review-entry.png 是 open 預選。前輪 capture.log 保留為 capture-cycle-3.log；本輪第一次已通過後再縮減清單留白，其輸出留於 capture-cycle-4-spacing.log，最新完整證據仍以 capture.log 及相符 HTML 雜湊為準。
