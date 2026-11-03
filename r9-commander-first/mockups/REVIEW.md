# 指揮官優先 · 設計稿審閱

先跟指揮官談方向，需要時進待辦找 FO 或查進度，照這個方向做可以嗎？

入口：[review.html](review.html)，預選指揮官首頁。左列狀態，右看桌面／手機；尺寸切換與左右鍵沿用第十輪。所有內容虛構；可點擊示意只保留本次頁面記憶體，不會傳送真實訊息或記錄決定。

本頁只請確認這個方向。手機從首頁進待辦多一步，各深入頁回指揮官一步；桌面維持 330 px 清單與 870 px 詳情。Commander 是現有 Comms officer 的主要入口，不新增代理權限或自主指揮能力。

## 首頁 · 指揮官

先跟現有通訊官談方向；桌面待辦在旁邊，手機按 Board。

[HTML](index.html?state=home) · [桌面](1440-home.png) · [手機](360-home.png)

## 指揮官正在問

問句先行；固定入口的問題只算一次，待辦共七件。

[HTML](index.html?state=commander-question) · [桌面](1440-commander-question.png) · [手機](360-commander-question.png)

## 打開待辦

指揮官固定在最上方；按種類分組，圖形加文字說明輪到誰。

[HTML](index.html?state=board) · [桌面](1440-board.png) · [手機](360-board.png)

## 從待辦進閘門

問題與摘要先行，與該 FO 對話；頁面上方一步回指揮官。

[HTML](index.html?state=open) · [桌面](1440-open.png) · [手機](360-open.png)

## 進 FO 對話

需要細節再找 Demo FO；對話標明含其他任務，收件人清楚。

[HTML](index.html?state=fo-question) · [桌面](1440-fo-question.png) · [手機](360-fo-question.png)

## 回到指揮官

一次回來，保留草稿與原閘門已送進度；沒有重送決定。

[HTML](index.html?state=return-commander) · [桌面](1440-return-commander.png) · [手機](360-return-commander.png)

## 在待辦查進度

只看兩件閘門：一件等 Export FO 記錄、一件輪到你。沒有新進度資料。

[HTML](index.html?state=progress-board) · [桌面](1440-progress-board.png) · [手機](360-progress-board.png)

## 打開進度細節

已轉送，尚未記錄；對象仍是 Export FO，原列繼續留在待辦。

[HTML](index.html?state=progress-detail) · [桌面](1440-progress-detail.png) · [手機](360-progress-detail.png)

## 可走的路徑

首頁按 Board → 選閘門或 FO 問題 → 頂部 ← Commander。桌面清單常在；手機在清單或對話間切換。要連續換件用 ← Board；沒有下一件捷徑。

可在閘門選修改／暫緩，空必填理由不能 Confirm。填好確認後去指揮官，再由待辦重開，仍是同一已送決定與理由。訊息草稿不會隨 Confirm 傳出；指揮官與 FO 的草稿也分開。轉送／記錄回執僅由驗證腳本注入，沒有偽裝成使用者控制的完成按鈕。

未分派審查沿用「開列預填詢問 → 送出」，已有指揮官草稿不覆寫。工具權限只示意既有原生會話目的地；該離線示意可回 Commander，真實外部會話與 GitHub 的宿主返回不在提案控制內。

## 完整 FO 名單

By FO 保留四位 FO，不以待辦當作名單。Research FO 沒有待辦，仍能打開對話；手機不再重複 Commander 入口卡。

[HTML](index.html?state=all-fos) · [桌面](1440-all-fos.png) · [手機](360-all-fos.png)

## 沒有待辦，也能找 FO 聊

從首頁桌面 By FO → Research FO 共 2 步；手機 Board → By FO → Research FO 共 3 步。若 FO 有可直接開對話的問題列，則仍為桌 1／機 2，不能套用到每位 FO。手機待辦可捲動區由 406 px 增至 505 px，多 99 px；首頁用明標範例的 Captain 指示和 Comms officer 具名轉述說明既有用途。

[HTML](index.html?state=fo-no-waiting) · [桌面](1440-fo-no-waiting.png) · [手機](360-fo-no-waiting.png)

## 驗證與界線

[Step A 與操作數](../design/COMMANDER-FIRST.md) · [繪圖前假設](ASSUMPTIONS.md) · [執行證據與限制](EVIDENCE.md)。沒有新資料、持久化、歷史頁或產品變更。設計總監與 Captain 尚未審閱本輪；作者驗證不等於方向接受。
