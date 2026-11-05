# Commander 定期摘要 — Step B 審查

先開同目錄 [review.html](review.html)。這是一個方向，13 個狀態，每態有 1440×1000 桌面及 360×780 手機 PNG，共 26 張；[index.html](index.html) 是可操作、沒有連線的靜態示意。

審查頁頂端只問：這版能讓你先讀方向，需要時再看原文與作決定嗎？左側選狀態，右側看桌面／手機；可切換尺寸、用左右方向鍵換狀態，點圖看原尺寸。全部圖片為相對路徑，可直接從 file:// 開啟，不需要服務。

## 視覺與行為界線

- 延續目前 Bridge（Paseo 與工作流程的連接外掛）的深色 Commander 主入口、左清單／右對話、細分隔與底部輸入框。手機維持單一對話，Replay（查看這句的來源）才展開底部卡片。沒有篩選器、產品模式或各 FO（專案執行負責人）計數。
- 只有 Commander 改寫的已更新、受阻及等待決定三點，加收集時間與研究 FO 無回報的未知行；主摘要不夾帶原文。Replay 才顯示同一句與精確虛構原文、FO 名稱、原回報時間；來源遺失不補猜測內容。
- 開啟 FO、繼續討論、回覆新決定三個出口均可操作；後兩個只回 Commander 草稿，附可移除的句子上下文，不選關卡、不送訊息。既有草稿保留，焦點回輸入框。關 Replay 則回原 Replay 按鈕。
- 一般方向直接輸入、送出即可。關卡必須另按「開放預約流程試用？」；入口明示試用 FO、預約流程、驗證。讀完整說明後選擇，再按 Confirm（再次確認後送出）。要求修改／暫緩須有原因，確認前不能顯示已送出；確認後也只顯示尚未記錄。
- 所有角色、任務、回報、時間、方向、理由與決定都是虛構。頁內送出只在明確按送出或 Confirm 後改變本機示意，沒有訊息傳送、關卡寫入、代理啟動或排程設定。

## 依序看哪些狀態

| 狀態 | 判斷重點 |
| --- | --- |
| 先讀這輪摘要 | 一眼看到變化、受阻、等待決定、未知與收集時間 |
| 看這句的原文 | 原句與具名原文同卡，手機三個出口都可見 |
| 原文找不到 | 不補替代內容，仍可開 FO |
| 開啟 FO | 明確進入這個 FO，能回 Commander；只代表本機詳情 |
| 留在 Commander 討論 | 原句作上下文，草稿未送出 |
| 一般方向：直接輸入 | 不經 Replay 即可給方向 |
| 一般方向：按送出後 | 只新增使用者方向，不變成關卡記錄 |
| 從原句回覆新決定 | 尚未選關卡，具名入口仍是必要步驟 |
| 按具名關卡，讀說明 | 決定對象和邊界明確可讀 |
| 選擇後，再次確認 | 選准仍未送出，須再按 Confirm |
| 修改需要原因 | 空白或純空白原因不能確認，暫緩同理 |
| 填原因後，等待確認 | 有原因才啟用 Confirm，仍未送出 |
| 確認後，尚未記錄 | 送出不等於 FO 已記錄 |

以上對應檔名與實際尺寸由 [artifacts.json](artifacts.json) 列出，避免另外維護一份圖片檔名表。

## 已驗證與未證明

[checks/tests.json](checks/tests.json) 是離線互動檢查結果；[checks/capture-evidence.json](checks/capture-evidence.json) 保存最終 HTML 雜湊、每態幾何、瀏覽器版本、審查頁圖片 naturalWidth／naturalHeight 與瀏覽器清理紀錄。實際命令與退出碼在 [checks/commands.json](checks/commands.json)，擷取輸出在 [capture.log](capture.log)。

檢查以全新空白 profile 的 headless Chromium 順序執行，一次只開一個自建瀏覽器，一次一張截圖。沒有 localhost 服務或 Paseo daemon 讀寫；頁面只發出 file:// 請求，未關閉瀏覽器的同源或內容安全保護。每個自建瀏覽器均已退出，自建空白 profile 已移除；沒有接用或清理使用者瀏覽器。

互動檢查涵蓋：三個不同來源各顯示正確原文；關閉後焦點回同一點；兩種回覆出口保留草稿並聚焦 Commander；來源失效無替代引用、仍可開正確 FO 並返回；一般方向兩步送出、不綁 gate；從 Replay 的五次明確點按經具名關卡、說明、選擇及 Confirm；要求修改與暫緩皆拒絕空白原因。桌面與手機均跑過，既有 Board 出口也能返回 Commander。

審查頁以另一個全新 Chromium 從 file:// 開啟，摘要與 Replay 兩個狀態的桌面及手機圖片均讀得正確原尺寸；兩欄結構、尺寸切換、左右方向鍵均通過。手機尺寸是 Chromium 視窗，沒有實體手機、軟鍵盤或原生底部卡片證據。開 FO 僅是本機詳情示意；沒有宿主導覽、真實來源讀取、模型改寫忠實度、真實發送或關卡記錄的驗收。

指定套件檢查另記 [checks/package-checks.json](checks/package-checks.json)。這些檢查只針對任務結構與未變更的產品提交，不代替設計審查。既有 design_surfaces 欄位缺口沿派工記 SKIPPED；roborev 未跑，原因是沒有產品程式變更及派工已知套件缺口。沒有另開 ADR（架構決定紀錄），也沒有產品分支或 PR（拉取請求）。

## 來源與待審事項

視覺參考為同一狀態庫的 `_l3-dogfood/walks/round-9/screenshots/1440-commander-home.png`、`360-commander-home.png`、`1440-gate-open.png`、`360-decision-reason-typed.png`，以及 `r9-commander-first/mockups/1440-home.png`。只參考排版和樣式，沒有複製原圖或對話。對應檔案雜湊存於 [checks/reference-sources.json](checks/reference-sources.json)。

本次派工已確認只讀收集策略；Step A 原頁中該待選問題以本次派工裁定為準，沒有重新詢問。頻率、成本上限與現有 Commander 如何採用新指示仍待 Captain 決定；本次不改 design/ 原頁。Step B 目前只完成離線提案，等待設計總監審查及 Captain 對這個方向的判斷。

重做本機驗證時，先安裝 Chromium；用 Node.js 執行本目錄 `capture.mjs`，第一個參數傳 Chromium 的完整執行檔路徑。程式只用 Node.js 內建模組，讀寫本目錄，使用瀏覽器偵錯管線、不監聽網路埠。既有證據的執行命令列於 commands.json；沒有隱藏套件或使用者 profile 依賴。
