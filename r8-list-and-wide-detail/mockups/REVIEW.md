# 清單旁詳情 · 設計稿審閱

照這個方向往下做，還是有哪裡要改？

入口：[review.html](review.html)。同一方向，左列狀態、右看桌面／手機，可切換尺寸或用左右鍵。所有資料虛構；可點擊示意只保留本次頁面記憶體，重新載入會重置。

## 清單與件數

全部七件，種類篩選與主要狀態。

[HTML](index.html?state=list) · [桌面](1440-list.png) · [手機](360-list.png)

## 工具權限 → 原生會話

直接到原生目的地，Bridge 不提供原地批准。

[HTML](index.html?state=permission) · [桌面](1440-permission.png) · [手機](360-permission.png)

## 開放閘門

問題、摘要、對話範圍及獨立的訊息與決定。

[HTML](index.html?state=open) · [桌面](1440-open.png) · [手機](360-open.png)

## 修改・理由空白

必填理由空白，確認不能送出。

[HTML](index.html?state=reason-empty) · [桌面](1440-reason-empty.png) · [手機](360-reason-empty.png)

## 修改・理由已填

理由與訊息草稿分開，確認動作說清楚。

[HTML](index.html?state=reason-typed) · [桌面](1440-reason-typed.png) · [手機](360-reason-typed.png)

## 已送出

待通訊官轉送，原列仍在。

[HTML](index.html?state=sent) · [桌面](1440-sent.png) · [手機](360-sent.png)

## 已轉送

待 FO 記錄，原列仍在。

[HTML](index.html?state=relayed) · [桌面](1440-relayed.png) · [手機](360-relayed.png)

## 已記錄

先結果與理由，待決清單移除原件。

[HTML](index.html?state=recorded) · [桌面](1440-recorded.png) · [手機](360-recorded.png)

## 已記錄件重開

返回先前詳情，保留同一決定與理由，不加歷史頁。

[HTML](index.html?state=recorded-reopened) · [桌面](1440-recorded-reopened.png) · [手機](360-recorded-reopened.png)

## FO 問題

問句先行，明示訊息送給誰。

[HTML](index.html?state=fo-question) · [桌面](1440-fo-question.png) · [手機](360-fo-question.png)

## 通訊官對話

從清單開啟，等待時間與收件人清楚。

[HTML](index.html?state=comms) · [桌面](1440-comms.png) · [手機](360-comms.png)

## 已分派審查

找負責人和外部審查是不同動作。

[HTML](index.html?state=review-assigned) · [桌面](1440-review-assigned.png) · [手機](360-review-assigned.png)

## 未分派審查・預填詢問

開列直接到通訊官，預填後可送出。

[HTML](index.html?state=review-ask) · [桌面](1440-review-ask.png) · [手機](360-review-ask.png)

## 審查詢問已送出

只問了負責人，沒有代替完成審查。

[HTML](index.html?state=review-sent) · [桌面](1440-review-sent.png) · [手機](360-review-sent.png)

## 來源失敗・對話

只說已知件數，保留重查與可讀的對話錯誤。

[HTML](index.html?state=source-failed) · [桌面](1440-source-failed.png) · [手機](360-source-failed.png)

## 來源失敗・清單

手機清單同樣不能把未知寫成零。

[HTML](index.html?state=source-failed-list) · [桌面](1440-source-failed-list.png) · [手機](360-source-failed-list.png)

## 只看閘門

兩件閘門，篩選數仍來自全部集合。

[HTML](index.html?state=filter-gates) · [桌面](1440-filter-gates.png) · [手機](360-filter-gates.png)

## 已送出後回清單

原列留下，再開仍是同一已送決定。

[HTML](index.html?state=list-sent) · [桌面](1440-list-sent.png) · [手機](360-list-sent.png)

## 已轉送後回清單

原列留下，再開仍顯示待記錄。

[HTML](index.html?state=list-relayed) · [桌面](1440-list-relayed.png) · [手機](360-list-relayed.png)

## 已記錄後回清單

六件待辦，閘門件數減一。

[HTML](index.html?state=back-list) · [桌面](1440-back-list.png) · [手機](360-back-list.png)

## 閘門不再開放

停止供決定，但不能稱作已記錄。

[HTML](index.html?state=closed) · [桌面](1440-closed.png) · [手機](360-closed.png)

## 驗證範圍

[假設](ASSUMPTIONS.md) · [擷取及操作證據](EVIDENCE.md)。工具權限只示意原生目的地；外部審查不開網路。已記錄重開透過本次導覽返回先前詳情，不是新歷史頁；沒有原簡報回讀。
