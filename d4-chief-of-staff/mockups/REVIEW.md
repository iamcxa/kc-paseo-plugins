# 幕僚長：單一方向圖稿

先開 [review.html](review.html)，左側換狀態，右側同時看桌面和手機，或切換尺寸；左右方向鍵也可換。手機可獨立開 [review-phone.html](review-phone.html)，全部手機 PNG 已內嵌，沒有相鄰圖片資料夾也能使用。

依已通過的 Step A 第二版製作，11 個狀態各有 1440×1000 與 360×780 PNG，共 22 張。全部專案、人物、時間、對話及關卡為虛構；[index.html](index.html) 是本機可操作示意，沒有任何真實代理連線、發訊或決定記錄。

## 看什麼

保留既有 Bridge 深色、320 px 宿主側欄、330 px 清單與寬對話；手機是 360 px 單頁，不縮小桌面。稱呼換為幕僚長，開場只說一件、已確認誰在等、多久及具名目標。清單最新在上，較舊但等待更久的正式關卡可成為建議；這兩種順序不混用。沒有摘要、Replay、立即收集、種類分組或 By FO 切換。

重開未變保留同一則 14:20 建議，頁面只更新 14:35 檢查說明；沒有多加一則聊天。這是設計示意，沒有用前端假計數聲稱模型真的零呼叫。掃描身份仍依 [DESIGN.md](../design/DESIGN.md) 與 [EVIDENCE.md](../design/EVIDENCE.md) 從既有對話讀回，產品尚未實作。

## 逐態判讀

- [進來，先做這一件](screenshots/360-entry.png)：一則幕僚長開場：具名關卡、範例 FO 甲等候 42 分鐘、開目標。Board 新在上，推薦較舊等待；沒有代替批准。
- [重開，沒有變化](screenshots/360-unchanged.png)：14:35 重新檢查，沿用同一則 14:20 建議，不新增聊天行。掃描版本來自既有對話；零新增自動掃描是設計要求，非此靜態圖稿量測。
- [目前沒有待你處理的事](screenshots/360-empty.png)：必要來源已齊，沒有候選。完整 FO 狀態仍可看，不把無回報或失敗誤當零待辦。
- [來源不全，只給暫定焦點](screenshots/360-partial.png)：只依已確認關卡及 FO 事項建議，審查來源未知；不聲稱全板最高優先。
- [掃描失敗，保留舊內容](screenshots/360-failed.png)：本輪未完成，保留 13:40 舊建議並標未確認；沒有自動重試，也不讓舊目標繼續當成已確認可處理。
- [建議之後又有變更](screenshots/360-stale.png)：對話仍在，標示 14:20 之後狀態已變；不悄悄改建議、不立即再掃。
- [找不到上次掃描紀錄](screenshots/360-history.png)：重開但歷史未完整讀回，不能當首掃；只說無法確認，保留 Board 入口，不新增模型回合。
- [開她指的具名關卡](screenshots/360-target.png)：先讀完整關卡，選擇與確認分開。固定返回；此頁沒有替艦長選准。
- [從目標回到幕僚長](screenshots/360-returned.png)：同一建議、同一對話與原草稿保留。若 Board 未變，不另加一段開場。
- [接著問一句](screenshots/360-discussion.png)：簡短追問及依已確認等待事實的回覆；仍是對話，沒有催問 FO 或自動轉達。
- [Board：全部新在上](screenshots/360-board.png)：問題、FO 狀態、審查、權限、FO 狀態、關卡依來源時間混排；狀態列不算待辦。手機先按 Board，固定返回幕僚長。

## 可以操作的部分

從開場的「開啟範例試用關卡」進具名關卡，再按固定「← 幕僚長」返回；草稿保留。關卡不預選准，修改／暫緩的原因未填時確認不可用。這只是離線按鈕狀態，按確認也不宣稱已送達或記錄。一般輸入明確按送出後只新增虛構訊息，不會觸發回覆或對 FO 傳令。

Board 無待辦 FO 以狀態列穿插，可開對話去向示意但不算待辦；手機 Board 有固定返回。失敗／過期的舊建議保留並標未知，推薦目標暫停；可重讀來源，但沒有自動模型重試。因這是單一方向圖稿，未模擬宿主權限、真實來源或決定的完整生命週期。

## 擷取與驗證證據

- [ASSUMPTIONS.md](ASSUMPTIONS.md) 在 HTML／截圖之前建立，記錄視覺基準、假設與不承諾的部分。
- [artifacts.json](artifacts.json) 保存來源、審查頁及 PNG 的 SHA-256（內容指紋）；[checks/baselines.json](checks/baselines.json) 記錄實際讀取的第一個摘要設計 cycle 5 與第九輪基準圖。未把基準圖冒作本次成果。
- [checks/capture-evidence.json](checks/capture-evidence.json) 記錄每張圖的視窗、尺寸、清單順序及操作幾何，還有 26 次自建空白 profile 的瀏覽器關閉與刪除。每張 PNG 都用新 profile，擷取及瀏覽器一次只做一個；無實際代理或模型。
- [checks/tests.json](checks/tests.json) 是實際執行的靜態檢查：所有外層無溢位、主要操作至少 44 px 並留在可視範圍、FO 狀態穿插、最新在上、重開範例只有同一則焦點；拿掉固定操作區、反轉 Board 次序或重複開場，會讓這些檢查失敗。
- 同檔也記錄實際點按具名目標及返回、修改必填原因、草稿保留、審查圖片載入、尺寸切換與方向鍵；未點目標就開別件、清掉草稿或不填原因也可確認，都會使這些檢查失敗。
- 手機單檔另放入只有該 HTML 的自建資料夾，以新 360×780 瀏覽器讀取全部 11 張 data URI 圖片；最後刪除此自建資料夾。不要求使用者帶著 screenshots 資料夾。
- [capture.log](capture.log) 是擷取輸出；[capture.mjs](capture.mjs) 僅依賴 Node.js 內建模組和明示傳入的 Chromium 執行檔。重現時以 Node.js 執行它，第一參數為本機 Chromium 完整路徑；不啟動 localhost 伺服器。
- 所有頁面只用 file:／data:，CSP（網頁內容載入規則）的 img-src 包含 self、file: 和 data:；connect-src none。瀏覽器另阻擋全部 http／https／ws／wss，包含 localhost，並以 remote-debugging-pipe 連接，不監聽網路埠。26 次檢查均無頁面腳本例外或 CSP 違規，頁面只請求本機檔案／資料 URI。
- [checks/package-checks.json](checks/package-checks.json) 與四份 log 記錄 design_surfaces、comment_ratio、doc_impact、number_guards 皆 exit 0；程式工作樹 base/head 同為 91625588dff1b3e5737f6f6f8843b90d69468f32，0 程式／註解行、0 產品文件受影響，migration guard 因無 migrations-path 而略過。

## 審查界線與代價

這證明離線圖稿、導覽與瀏覽器幾何，不證明已完成產品接線、真實時間線找回、模型優先建議品質、失敗重試規則、來源查核、持續閃爍消失、送達／記錄、實體手機或軟鍵盤。新增自動掃描成本仍未量測，沿用文字稿的既有探針參考與規則限制。

代價仍是失去分組／篩選和 Replay 的前後文閱讀；清單大時需要捲動，舊待決不會因建議而移到頂部。這輪只有一個方向，等待設計總監審查，沒有艦長接受、啟用或產品交付的聲明。頂部方向問題逐字沿用已通過文字稿，不在這裡另加選擇。
