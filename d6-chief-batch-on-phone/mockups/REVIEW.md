# 原生對話內逐件回答：圖稿審查

先開 [review.html](review.html) 逐態看 360 手機及 1440 桌面；頂端只有一個方向問題：「點推播後，直接在她的原生對話逐件處理，這樣合用嗎？」手機用 [review-phone.html](review-phone.html)，全部 16 張手機 PNG 已內嵌，帶走這一個檔案就能看。可用左右方向鍵、狀態列及手機／桌面切換；[index.html](index.html) 是沒有外部行動的離線操作示意。

依艦長修訂 1 與 Step A 第三輪文字通過繪製。本文件寫在 HTML／PNG 完成後；[ASSUMPTIONS.md](ASSUMPTIONS.md) 先於本輪繪圖建立。停在設計總監審查，沒有聲稱圖稿獲艦長接受、手機能力可用或產品交付完成。

## 圖稿方向與基底

主畫面是她的**原生 Paseo 對話**：手機標題是幕僚長，不是 Bridge；桌面 320 px 宿主側欄選中幕僚長，右邊只有寬對話，沒有 Bridge 的 330 px Board 欄。原生標題、側欄及對話外框是依既有來源繪製的靜態殼，不是手機 App 截圖。只有 fallback-bridge（備援回同一批）態的頁首是 Bridge。

沿 d4 已接受圖稿的深色、系統字體、綠色、44 px 控制、窄版單頁與 r9 對話間距／底部輸入；[checks/baselines.json](checks/baselines.json) 保留四張既有參考的指紋，沒有把它們當作本輪成果。主要內容位置按狀態捲到題目，不把桌面縮小成手機。

正常虛構批次是兩問兩關，首態四件概覽完整可見；題目、具名 FO、等待時間與答案相鄰，不切收件者。已送給她、已轉達給 FO、關卡已記錄分開；半批仍看得到另外兩件未答。關卡沒有預選，理由與普通聊天草稿獨立，Confirm 顯示具名關卡；修改／暫緩空理由不能按，舊版不能送。recorded 態的簡報第1版、虛構決定編號及原話都可見。

permission 態另用兩問一關一權的四件例子，沒有第五件或原位批准／拒絕。元件不支援時，保留在未轉換使用者訊息內的四件與「開側欄 → 點 Bridge」文字，故障元件只顯示宿主 unavailable；備援讀回同一批，不再送已送內容。

## 逐態審查

| 狀態 | 看什麼 | 範圍／限制 | PNG |
| --- | --- | --- | --- |
| landing | 推播落點：四件在她的原生對話 | 原生標題＋四件概覽；沒有 Bridge／Board 主畫面。 | [360](screenshots/360-landing.png) · [1440](screenshots/1440-landing.png) |
| question | 問題原位回答 | 題目、範例 FO 乙與明示原文轉達相鄰。 | [360](screenshots/360-question.png) · [1440](screenshots/1440-question.png) |
| sent | 問題：已送給幕僚長 | 她已收到這次原話，尚未查到 FO 收件；不顯示完成。 | [360](screenshots/360-sent.png) · [1440](screenshots/1440-sent.png) |
| relayed | 問題：已轉達給 FO | 同一次問題與原話已在具名 FO 收件，仍不等於工作結束。 | [360](screenshots/360-relayed.png) · [1440](screenshots/1440-relayed.png) |
| gate | 關卡簡報與選擇 | 具名「範例試用」第1版，沒有預選；選擇本身不送。 | [360](screenshots/360-gate.png) · [1440](screenshots/1440-gate.png) |
| chosen | 選准後，另按 Confirm | 具名確認與可選條件分開，一般聊天不替代確認。 | [360](screenshots/360-chosen.png) · [1440](screenshots/1440-chosen.png) |
| reason | 修改需要理由 | 要求修改已選，理由空白，具名 Confirm 停用。 | [360](screenshots/360-reason.png) · [1440](screenshots/1440-reason.png) |
| reason-typed | 理由填好，具名 Confirm 可按 | 保留完整條件，取消仍留稿；沒有實際送出。 | [360](screenshots/360-reason-typed.png) · [1440](screenshots/1440-reason-typed.png) |
| recorded | 關卡：已記錄 | 同版簡報、這次決定編號與原話相符才呈現。 | [360](screenshots/360-recorded.png) · [1440](screenshots/1440-recorded.png) |
| permission | 權限：到具名 FO 處理 | 另一組四件，權限替代第四件；沒有批准／拒絕。 | [360](screenshots/360-permission.png) · [1440](screenshots/1440-permission.png) |
| half | 只答半批，其餘仍在 | 一題已轉達、一關卡已記錄；另兩件未答，不抹掉原批。 | [360](screenshots/360-half.png) · [1440](screenshots/1440-half.png) |
| stale | 關卡換版：拒絕舊確認 | 第1版草稿保留，第2版須重讀；沒有自動套用。 | [360](screenshots/360-stale.png) · [1440](screenshots/1440-stale.png) |
| unsupported | 元件不支援：原訊息仍可讀 | 故障元件旁只剩宿主提示，未轉換的原訊息保留側欄→Bridge 指引。 | [360](screenshots/360-unsupported.png) · [1440](screenshots/1440-unsupported.png) |
| fallback-menu | 備援：開側欄找 Bridge | 推播之後開側欄，再點 Bridge；沒有創造新的通知或捷徑。 | [360](screenshots/360-fallback-menu.png) · [1440](screenshots/1440-fallback-menu.png) |
| fallback-bridge | 備援：Bridge 的同一批 | 只有這個備援態是 Bridge；已轉達／已記錄內容不重送。 | [360](screenshots/360-fallback-bridge.png) · [1440](screenshots/1440-fallback-bridge.png) |
| keyboard | 手機鍵盤升起 | 240 px 靜態鍵盤示意；題目、收件 FO、答案與送出在上方可見，非真機能力驗收。 | [360](screenshots/360-keyboard.png) · [1440](screenshots/1440-keyboard.png) |

## 實際檢查與可推翻點

- 共有 32 張不同 PNG：16 態 × 360×780／1440×1000。兩寬均無外層溢位，操作控制至少 44 px，正常頁首為原生幕僚長；手機首態四件概覽全可見。加入 Board 主欄、讓原生頁首變 Bridge、減少操作高度、讓四件概覽溢出，都會使對應檢查失敗。
- 手機 keyboard 態以 240 px **靜態鍵盤**佔位；幾何斷言確認題目、收件者與送出完整在剩餘時間線內。它不驗原生鍵盤、焦點事件、手機外掛 RPC 或通知。
- 離線互動實際以 DOM 點按／輸入檢查：輸入、選決定、取消不送；逐題送出保留原話與具名收件者；修改缺理由停用；取消保留理由；Confirm 才產生這個虛構關卡的事件；換版後舊確認停用，讀第2版再選才送第2版；四件可各自送出而不重選收件人；權限只留下具名導覽事件；備援保留已轉達／已記錄，不重送。若變成選擇即送、改寫原話、略過理由／版本、答一件清整批或點權限產生批准事件，對應檢查會失敗。這些事件只在網頁記憶體，不是 SDK 或真 FO 收件。
- [checks/tests-first-pass.json](checks/tests-first-pass.json) 的六組檢查完整通過，之後人工檢視發現手機 stale 態的拒絕說明偏下、permission 態前方有上一題殘片。只調整這兩態：拒絕理由、讀新版、原稿與停用 Confirm 同時可見；最後一件權限對齊可視區頂端。兩寬各重拍這兩態，並重新執行離線互動及兩個審查頁檢查；[checks/tests.json](checks/tests.json) 六組通過。
- [checks/capture-evidence.json](checks/capture-evidence.json) 為最終證據：保留前輪未改的28張、替換4張，逐張存 PNG 指紋、來源 HTML 指紋及幾何。28張來源是 [checks/capture-source-1.html](checks/capture-source-1.html)，重拍4張來源是當前 index.html；沒有將舊圖冒作新 HTML 擷取。前輪資料另存 [checks/capture-first-pass.json](checks/capture-first-pass.json)。[artifacts.json](artifacts.json) 是目前交付位元組的完整索引。
- 最終累計 44 個成功 fresh-profile 工作階段（前輪36＋重拍／重驗8），一次只開一個瀏覽器；全部關閉並移除自建空白 profile，零頁面腳本錯誤、零 CSP 違規，頁面只請求 file／data。先前4張預覽只是幾何預檢，不是另一組交付圖。
- 最初沙箱內 Chrome 偵錯管道中斷，保留 [checks/preview-attempt1.log](checks/preview-attempt1.log)；同一個限定的空白-profile／file:// 命令獲准後成功，不開監聽埠或放寬網路封鎖。僅本次初次失敗的自建空白目錄經確認無瀏覽器鎖後移除，見 [checks/first-attempt-cleanup.json](checks/first-attempt-cleanup.json)。沒有使用或清除使用者瀏覽器資料。
- [checks/package-checks.json](checks/package-checks.json) 四個流程檢查 exit 0：0 程式／0 註解新增、0 個產品文件影響、無遷移發現（未宣告 migrations-path，遷移檢查略過），任務 Preview 已指本輪 review.html。這些不代替設計總監裁定。

## 重現與邊界

[capture.mjs](capture.mjs) 僅使用 Node 內建模組及明示傳入的 Chrome／Chromium 執行檔。這次 Node v24.18.0、Chrome 156.0.8078.47；[checks/runtime.json](checks/runtime.json) 是本機擷取環境，不是手機 App 版本。執行 `node /絕對路徑/mockups/capture.mjs /絕對路徑/Chrome` 可重做全矩陣；`--refresh=stale,permission` 僅是本輪保留前輪來源後的局部重拍。所有必要 HTML、狀態、來源快照與腳本隨本目錄保存，沒有隱藏的即時主機依賴。

每張用 file://、CDP pipe，不開偵錯監聽埠；Network 封鎖 HTTP／HTTPS／WS／WSS，含 localhost／127.0.0.1，另以 CSP 禁止連線及主機解析規則補強。單檔手機頁實際放入只有它的臨時目錄，以全新 360 瀏覽器逐張驗16個內嵌圖片，完成後刪除該自建臨時目錄。

未進行的工作：手機原生元件能力檢查、真推播、真外掛 RPC、代理 prompt、模型、即時 daemon、權限動作、正式關卡記錄、排程、RoboRev、產品程式／PR／發布。入口1＋原位8（理由另加2）仍是設計預算；閱讀、打字、捲動、連線與 FO 真正解除等待未量測。下一步只有交設計總監審查本輪圖稿；手機能力檢查仍須按已通過文字設計，在後續隔離真機條件下完成。
