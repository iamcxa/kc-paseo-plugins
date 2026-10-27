# 單件全區：逐頁審閱

[從 index.html 開始](index.html)。一個方向，兩個尺寸；以下連結都是離線靜態設計稿，使用同一組虛構資料。手機圖不含系統鍵盤；這些圖不證明真實傳送、轉送或記錄。

## 清單

[HTML](index.html?state=list) · [桌面 1440×1000](1440-list.png) · [手機 360×780](360-list.png)

問題：你能直接從清單辨識要處理的問題與收件人嗎？

## 單件全區

[HTML](index.html?state=open) · [桌面](1440-open.png) · [手機](360-open.png)

問題：把 Bridge 全區交給這件事後，讀簡報、對話及做決定的空間夠嗎？

## 已選要求修改，理由空白

[HTML](index.html?state=reason-empty) · [桌面](1440-reason-empty.png) · [手機](360-reason-empty.png)

問題：你能看出選了結果但還缺理由、尚不能確認嗎？

## 已填理由

[HTML](index.html?state=reason-typed) · [桌面](1440-reason-typed.png) · [手機](360-reason-typed.png)

問題：普通訊息與決定理由的區別，以及 Confirm 會送出的內容，清楚嗎？

## 已送出

[HTML](index.html?state=sent) · [桌面](1440-sent.png) · [手機](360-sent.png)

問題：你能看出現在只是送到通訊官，還沒有記錄嗎？

## 已轉送

[HTML](index.html?state=relayed) · [桌面](1440-relayed.png) · [手機](360-relayed.png)

問題：你能看出仍在等負責推進工作的代理核對並記錄嗎？

## 已記錄

[HTML](index.html?state=recorded) · [桌面](1440-recorded.png) · [手機](360-recorded.png)

問題：這個結果與理由足以讓你確定眼前這次決定已完成嗎？

## 回到清單

[HTML](index.html?state=back-list) · [桌面](1440-back-list.png) · [手機](360-back-list.png)

問題：用原位置的「← Queue」返回後，你能繼續從清單選事嗎？

## 通訊官問題

[HTML](index.html?state=comms) · [桌面](1440-comms.png) · [手機](360-comms.png)

問題：從清單開通訊官問題後，是否清楚現在訊息送給通訊官？

## 操作方式與驗證範圍

從清單可實際走：開件 → 選結果 → 確認；要求修改／暫緩則是開件 → 選結果 → 點理由欄 → 輸入 → 確認。讀完整簡報沿用 Read full briefing，另加一次展開；普通訊息是開件 → 點訊息欄 → 輸入 → 送出。返回及換件仍經清單，沒有下一件。

送出、轉送、記錄頁是三個固定示意，不會自動轉換或宣稱真實代理已處理。確認在同頁切到已送出；此後各頁由上面的審閱連結查看。送訊息只會在目前頁顯示虛構訊息，不會產生決定結果。

[設計假設](ASSUMPTIONS.md) 列明資料、標籤、返回位置、通訊官路徑與草稿限制。已記錄原簡報回讀仍是既有缺口，這裡沒有加入歷史、保存或最新簡報替代入口。

## 重製圖片

需求：Node.js 22 或更新版本，以及可執行 headless 的 Google Chrome。無 npm 套件、無網路、無本機伺服器，也不需要 Paseo。macOS 預設 Chrome 路徑是 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`；其他安裝位置作為第一個參數傳入。

```sh
node /absolute/path/to/mockups/capture.mjs /absolute/path/to/chrome
```

程式只開本目錄的 `index.html`，使用 Chrome DevTools Protocol（瀏覽器控制介面）的 pipe。每個尺寸使用新臨時 profile，完成後關閉瀏覽器並移除；逐張輸出 PNG 與 [capture-evidence.json](capture-evidence.json)。它會走兩個尺寸的離線操作，量測全區寬度、按鈕尺寸、畫面溢出及 Confirm 停用／啟用。保留 capture.mjs 供設計總監重製；這份靜態設計稿被正式實作取代時，一起退役。
