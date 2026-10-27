# 單件全區：逐頁審閱

**要照這個方向往下做，還是有哪裡要改？**

[從 index.html 開始](index.html)。一個方向，兩個尺寸；以下連結都是離線靜態設計稿，使用同一組虛構資料。手機圖不含系統鍵盤；這些圖不證明真實傳送、轉送或記錄。

以下每個狀態的問題僅供逐頁查核參考，不需逐題回答。

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

## 已送出後回清單

[HTML](index.html?state=list-sent) · [桌面](1440-list-sent.png) · [手機](360-list-sent.png)

問題：尚未記錄的閘門仍在原清單，點開能回到送出進度，清楚嗎？

## 已轉送後回清單

[HTML](index.html?state=list-relayed) · [桌面](1440-list-relayed.png) · [手機](360-list-relayed.png)

問題：點開仍在清單中的閘門時，能看出它已轉送但尚未記錄嗎？

## 已記錄後回清單

[HTML](index.html?state=back-list) · [桌面](1440-back-list.png) · [手機](360-back-list.png)

問題：只有已記錄的閘門離開待決清單，這樣能繼續選事嗎？

## 通訊官問題

[HTML](index.html?state=comms) · [桌面](1440-comms.png) · [手機](360-comms.png)

問題：從清單開通訊官問題後，是否清楚現在訊息送給通訊官？

## 未分派審查，已預填詢問

[HTML](index.html?state=review-ask) · [桌面](1440-review-ask.png) · [手機](360-review-ask.png)

問題：從未分派審查開到預填詢問後，你能直接送給通訊官嗎？

## 審查詢問已送出

[HTML](index.html?state=review-sent) · [桌面](1440-review-sent.png) · [手機](360-review-sent.png)

問題：你能看出這只送出了指派詢問，並沒有完成審查或記錄決定嗎？

## 操作方式與驗證範圍

從清單可實際走：開件 → 選結果 → 確認；要求修改／暫緩則是開件 → 選結果 → 點理由欄 → 輸入 → 確認。讀完整簡報沿用 Read full briefing，另加一次展開；普通訊息是開件 → 點訊息欄 → 輸入 → 送出。返回及換件仍經清單，沒有下一件。

未分派審查從清單開啟即預填詢問，再按送出，共兩步，不需要另外輸入。

送出、轉送、記錄頁是三個固定示意，不會自動轉換或宣稱真實代理已處理。確認在同頁切到已送出；已送出及已轉送時回清單仍保留該閘門，重開原列可看對應進度；已記錄後才離開待決清單。各個進度的固定示意也可由上面的連結查看。送訊息只會在目前頁顯示虛構訊息，不會產生決定結果。

[設計假設](ASSUMPTIONS.md) 列明資料、標籤、返回位置、通訊官路徑。草稿只在目前頁保留是原型限制，不是新的產品規則。已記錄原簡報回讀仍是既有缺口，這裡沒有加入歷史、保存或最新簡報替代入口。

擷取方式與技術證據見 [EVIDENCE.md](EVIDENCE.md)。
