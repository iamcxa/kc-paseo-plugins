# 擷取與路徑證據

## 重跑方式

靜態 HTML 本身不需要 Node、npm 套件、網路或服務。直接從磁碟開 review.html；所有圖都與它同目錄，CSP 明列 `img-src 'self' file: data:`，避免 Chromium 的 file:// origin 阻擋圖片。

可重跑驗證需要 Node.js（本次 v24.18.0）與本機 Chromium。於本資料夾執行 `node capture.mjs /path/to/chromium`，再執行 `node check-review.mjs /path/to/chromium`；macOS 預設 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`。第二輪高度反證另從 git commit `73250c176526eedc534afb512e7b46bd5e2b0b97` 讀前版 HTML，建立本目錄暫存 .cycle-1-baseline.html，驗證後（含失敗）刪除；因此重跑需有 git 與該 state commit。依賴的第八輪基準位於 `../../r8-list-and-wide-detail/mockups/index.html`。腳本只產生本資料夾的 PNG／證據與自己建立的暫存 browser profile；退出後移除該 profile。

## 這次跑過什麼

[擷取結果](capture-evidence.json) 與 [擷取紀錄](capture.log)：十態、兩尺寸共 20 PNG，依序擷取；每個尺寸一個全新 profile，以 CDP pipe 操作。無 localhost、HTTP 服務、daemon 或真實代理；頁面請求只允許 file:/data:。結果綁定 index.html、review.html 的 SHA-256，JSON 另含逐態幾何、元件尺寸、狀態與 browser 清理。

- 首頁預設指揮官，固定入口桌面在 Board 上方、手機只留頂部返回；無問題時 6/1/2/2/1，有問題時 7/1/2/2/2，指揮官問題只算一次。Questions 的 2 是通訊官問題 1 題（桌面固定入口、手機問題組）與 FO 列 1 題；Gate 篩選保留桌面入口／手機返回，但只計 2 件閘門。
- 在桌面／手機逐一從 gate、第二個 gate、FO 問題、完整名單的無待辦 FO、已分派審查、未分派審查及原生目的地示意，用可見頂部按鈕一次回指揮官。手機 Board 也一次回來；實際外部宿主返回未驗。
- 三個決定逐一走選擇／理由 → 指揮官 → 重開 → Confirm → sent → 指揮官 → 重開 → relayed → 指揮官 → 重開 → recorded → 返回重開；確保每次選擇與理由完全相同，草稿分開，待記錄列仍在，記錄後才移除。回執是離線注入，沒有聲稱原生送達。
- 第二件進度必須仍指向 Export FO，不能被第一件 Demo FO 代替；只有通訊官的 source failure/loading 影響其入口與對話，另一 FO 正常。
- 未分派審查直接預填再送，不覆寫已有通訊官草稿；Confirm 不傳普通訊息、普通 Send 不決定閘門。沒有下一件、原地權限批准或新持久化 API。
- 無水平／頁面溢出，桌面詳情寬 870、清單 330；Send 和決定按鈕桌面高 32、手機高 44，底部動作固定。360×480 視窗亦可達 Confirm／Send；這不是真實手機軟鍵盤證據。

必要反證：在同樣 fresh profile 執行第八輪原版，預設是 list、沒有固定 Commander 入口，手機由閘門回通訊官需兩次點擊；因此原版不通過本輪「先看到指揮官／一步回來」目標，記在 capture-evidence.json 的 baseline。新圖重用第八輪自有程式、樣式與不變語意，未改第八輪檔案。

## 審閱入口

[file:// 檢查](review-file-check.json) 與 [紀錄](review-file-check.log)：獨立 fresh Chromium profile，不用 web security bypass，預選 home 的桌／機自然寬為 1440／360，再選 all-fos 亦各 >0；無 CSP 違規或 script exception。另實際檢查左右兩欄、尺寸切換與左右方向鍵換態，存下 [review-entry.png](review-entry.png)。

## 範圍保護與套件檢查

[第二輪前置快照](cycle-2-boundary-before.json) 與 [結束比對](boundary-check.json) 比對 main、live、派工空 worktree 及暫停中的程式 worktree 的 HEAD、branch、status、diff 與未追蹤檔雜湊。暫停中的 worktree 在接手前已有另一位工作者的修改，保留原狀，沒有整理或納入提交。其他受保護 worktree 保持 clean；第八輪資料只讀。

[套件檢查](package-checks.json)：design_surfaces 未提供本任務所需欄位，依派工以已知 package gap 2 SKIPPED；number_guards exit 0（scope check 因不是 ideation 不跑、migration guard 因無 migrations-path 跳過）；沒有遇到派工所述 gap 3 的 R4 failure；comment_ratio 與 doc_impact 比對固定產品 SHA 自身，沒有產品程式或文件差異。這些不替代 mockup 執行證據。RoboRev 不跑：設計限定且 package gap 5；沒有 code branch／PR／安裝、daemon 變更或新的 ADR。

仍待設計總監走查與 Captain 的逐字答案；本頁不代替 AC-2 的人類確認。原簡報回讀、真機鍵盤、真實送達、真實外部宿主返回與新增指揮權限皆未驗。

## 第二輪新增檢查

21 組檢查包含：四位 FO 都出現在完整名單，Research FO 沒有待辦仍可開對話與傳訊，訊息只進它自己的對話，往返指揮官保留草稿；從首頁實走桌 2／機 3 步。種類篩選在 By FO 隱藏，不能把無待辦 FO 濾掉；By decision 恢復原篩選。

前版 `73250c1` 的 By FO 找不到 Research FO，命名目標測試因此失敗；第二輪已走通。手機前版待辦可捲動區 406 px、新版 505 px，實得 99 px；原入口盒高 98.1875 px（clientHeight 整數取整差異小於 1 px）。桌面高度保持 650 px。首頁有 Example conversation · fictional 標記、Captain 方向、Comms officer 的 Demo FO says: 具名回答；360 不顯示入口卡、重複介紹與副標。這只是既有轉達能力的虛構示例，不表示增加指揮權限。
