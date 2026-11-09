# 原生對話內逐件回答：第二輪圖稿審查

先開 [review.html](review.html)，頂端只有一個方向問題：「點推播後，直接在她的原生對話逐件處理，這樣合用嗎？」手機可帶走 [review-phone.html](review-phone.html)，全部 18 張手機 PNG 內嵌，不依賴其他檔案。[index.html](index.html) 是不連代理的離線操作示意。

本輪依 Step B 第一輪審查修正兩個阻塞缺口，並採用首屏精簡。仍是艦長修訂 1 已選的原生對話方向；不做產品、手機能力檢查或額外設計方向。交設計總監第二輪，不自行判定通過。

## 兩個缺口如何修正

**關卡的送達途中狀態。**新增 gate-sent 與 gate-relayed，兩寬都有。範例試用、第1版、決定編號 demo-decision-01 及原話「准，僅範例環境。」一致：

- gate-sent：已送給幕僚長，尚未轉達；尚無 FO 收件證據、沒有記錄。
- gate-relayed：已轉達給範例 FO 甲，等待同版關卡記錄；沒有假顯示已記錄。
- 兩態都顯示停用的具名 Confirm，不得再按。離線操作按下原 Confirm 現在先到 sent，只有獨立 recorded 虛構快照才表示已核對正式記錄；不再一按就直接跳已記錄。

**備援前後不憑空增加進度。**unsupported → fallback-menu → fallback-bridge 是同一個虛構 demo-batch-01：問題一已轉達、關卡一已記錄、另外兩件未答，三態都已送2／4、已記錄1。開側欄及點 Bridge 只導覽，不改原話、選擇、理由、收件或逐件送達；沒有新送出事件。元件不可用時原訊息仍可讀；Bridge 回同一批，不重送。

**採用的精簡。**landing／half／fallback-bridge 僅留一行批次進度，移除重複數字、開場與四件摘要。半批及備援的已答兩件是可展開收據，保留原話及記錄依據；後面直接是未答題的輸入與送出。三個手機首屏的送出控制皆在可視範圍內，空白答案時停用，不能誤當已送。

## 畫面範圍與逐態入口

主方案是原生幕僚長對話，只有 fallback-bridge 的頁首為 Bridge。沿 d4 深色、系統字體、柔和綠色與44px控制，以及 r9 的對話寬度／底部輸入；參考指紋仍在 [checks/baselines.json](checks/baselines.json)。本輪沒有重畫未受影響的畫面。

| 狀態 | 看什麼 | 範圍／限制 | PNG |
| --- | --- | --- | --- |
| landing | 推播落點：四件在她的原生對話 | 一行批次進度，直接接題目與送出；沒有 Bridge／Board 主畫面。 | [360](screenshots/360-landing.png) · [1440](screenshots/1440-landing.png) |
| question | 問題原位回答 | 題目、範例 FO 乙與明示原文轉達相鄰。 | [360](screenshots/360-question.png) · [1440](screenshots/1440-question.png) |
| sent | 問題：已送給幕僚長 | 她已收到這次原話，尚未查到 FO 收件；不顯示完成。 | [360](screenshots/360-sent.png) · [1440](screenshots/1440-sent.png) |
| relayed | 問題：已轉達給 FO | 同一次問題與原話已在具名 FO 收件，仍不等於工作結束。 | [360](screenshots/360-relayed.png) · [1440](screenshots/1440-relayed.png) |
| gate | 關卡簡報與選擇 | 具名「範例試用」第1版，沒有預選；選擇本身不送。 | [360](screenshots/360-gate.png) · [1440](screenshots/1440-gate.png) |
| chosen | 選准後，另按 Confirm | 具名確認與可選條件分開，一般聊天不替代確認。 | [360](screenshots/360-chosen.png) · [1440](screenshots/1440-chosen.png) |
| reason | 修改需要理由 | 要求修改已選，理由空白，具名 Confirm 停用。 | [360](screenshots/360-reason.png) · [1440](screenshots/1440-reason.png) |
| reason-typed | 理由填好，具名 Confirm 可按 | 保留完整條件，取消仍留稿；沒有實際送出。 | [360](screenshots/360-reason-typed.png) · [1440](screenshots/1440-reason-typed.png) |
| gate-sent | 關卡：已送給幕僚長，尚未轉達 | 同一個具名關卡、第1版、艦長原話；重複 Confirm 停用，尚無 FO 收件或記錄。 | [360](screenshots/360-gate-sent.png) · [1440](screenshots/1440-gate-sent.png) |
| gate-relayed | 關卡：已轉達，等待記錄 | 同一次決定已到範例 FO 甲，還沒有同版關卡記錄；原話保留，不能重複確認。 | [360](screenshots/360-gate-relayed.png) · [1440](screenshots/1440-gate-relayed.png) |
| recorded | 關卡：已記錄 | 同版簡報、這次決定編號與原話相符才呈現。 | [360](screenshots/360-recorded.png) · [1440](screenshots/1440-recorded.png) |
| permission | 權限：到具名 FO 處理 | 另一組四件，權限替代第四件；沒有批准／拒絕。 | [360](screenshots/360-permission.png) · [1440](screenshots/1440-permission.png) |
| half | 只答半批，其餘仍在 | 一題已轉達、一關卡已記錄收成可展開收據；兩件未答仍在，首屏可見送出。 | [360](screenshots/360-half.png) · [1440](screenshots/1440-half.png) |
| stale | 關卡換版：拒絕舊確認 | 第1版草稿保留，第2版須重讀；沒有自動套用。 | [360](screenshots/360-stale.png) · [1440](screenshots/1440-stale.png) |
| unsupported | 元件不支援：原訊息仍可讀 | 同批已送2／4、已記錄1；原訊息保留逐項狀態與側欄→Bridge 指引。 | [360](screenshots/360-unsupported.png) · [1440](screenshots/1440-unsupported.png) |
| fallback-menu | 備援：開側欄找 Bridge | 同一批、同樣逐項進度；開側欄本身不送出、不改狀態。 | [360](screenshots/360-fallback-menu.png) · [1440](screenshots/1440-fallback-menu.png) |
| fallback-bridge | 備援：Bridge 的同一批 | 回到同批，仍已送2／4、已記錄1；只導覽，不重送，直接到未答題。 | [360](screenshots/360-fallback-bridge.png) · [1440](screenshots/1440-fallback-bridge.png) |
| keyboard | 手機鍵盤升起 | 240 px 靜態鍵盤示意；題目、收件 FO、答案與送出在上方可見，非真機能力驗收。 | [360](screenshots/360-keyboard.png) · [1440](screenshots/1440-keyboard.png) |

所有人物、事項、時間、簡報與送達均虛構。permission 仍是另一組兩問一關一權的四件例子，不增加第五件，僅到具名 FO、不提供批准／拒絕。keyboard 是240px靜態示意，不是 OS 鍵盤或手機 RPC 證據。

## 這次實際驗證了什麼

[checks/tests.json](checks/tests.json) 的 7 組檢查通過，包括：

- 新增關卡兩態具有同一具名關卡、版本及原話，重複 Confirm 停用；第一次確認只產生一個 sent 事件，嘗試點停用按鈕不增加事件。若選擇就送、重複可送、sent 被當 recorded、原話／版本遺失，斷言會失敗。
- 備援三個快照逐件狀態一致；實際點選單及 Bridge 前後比較同一 batchId、兩題／兩關狀態及原話／決定／理由，事件仍為0。若導覽將0改成2、任一狀態或原話變化，檢查會失敗。
- 360 的 landing／half／fallback-bridge 沒有重複摘要或開場，四件仍在時間線，第一個送出控制完整在剩餘時間線內。若收據拿掉未答題、恢復長摘要或送出被底部輸入擋住，幾何／結構斷言會失敗。
- 既有離線邊界繼續通過：逐題明示才送且保留收件者／原話；選擇與取消不送；修改缺理由停用，取消保留理由；換版拒絕舊確認、讀新版後才用新版本；四件獨立送出；權限只有導覽。這些是網頁記憶體事件，不是真代理或正式記錄。
- review.html 的36個圖像來源逐態載入、左右方向鍵及手機／桌面模式通過；review-phone.html 的18張內嵌圖實際在只有它的臨時資料夾以全新360瀏覽器載入。
- 僅拍改動／新增狀態：本輪7態×兩寬＝14張（10張重拍、4張新增）；22張未改圖與前輪 SHA-256 完全相同，且其原 HTML 來源仍可核對。

[checks/capture-evidence.json](checks/capture-evidence.json) 有最終36張圖的尺寸、圖像指紋、各自來源HTML指紋及幾何。新14張來源是目前 index.html；22張保留圖依原資料綁 checks/capture-source-1.html 或 [checks/cycle4-source.html](checks/cycle4-source.html)。[checks/cycle4-captures.json](checks/cycle4-captures.json) 凍結前輪逐圖資料，沒有把未重拍圖宣稱為新HTML擷取。[artifacts.json](artifacts.json) 是目前交付所有檔案的指紋索引。

最終累計 62 個成功空白profile工作階段（前輪44＋本輪18），另有5個手機預覽工作階段；每次只開一個瀏覽器、每張新圖用一個新profile，全部關閉並移除。零頁面腳本錯誤、零CSP違規、頁面請求只有file／data。Chrome透過CDP pipe，不開監聽埠，封鎖HTTP／HTTPS／WS／WSS，包含localhost與127.0.0.1；臨時單檔目錄也已移除。先前沙箱失敗及自身空白profile清理紀錄保留，不使用或清除使用者的瀏覽器資料。

[checks/package-checks.json](checks/package-checks.json) 本輪四個流程檢查exit 0：產品程式base=HEAD=91625588dff1b3e5737f6f6f8843b90d69468f32，0產品程式／註解新增、0受影響產品文件，遷移檢查因未宣告路徑略過且無發現；design-surfaces 能找到本輪 Preview，但不等於設計驗收。

## 重現與未證明範圍

[ASSUMPTIONS.md](ASSUMPTIONS.md) 的修圖補記先於本次HTML／PNG；本說明在擷取及檢查後更新。[capture.mjs](capture.mjs) 使用 Node 內建模組與明示傳入的 Chrome／Chromium 路徑，環境見 [checks/runtime.json](checks/runtime.json)。本輪參數是 `--refresh=landing,half,unsupported,fallback-menu,fallback-bridge,gate-sent,gate-relayed`，只重拍列出的7態，再驗互動與審查頁。前輪來源快照及資料在本目錄內，沒有隱含的即時主機依賴。

只證明離線圖稿、可見幾何、示意互動與檔案可攜性。沒有手機能力測試、真推播、外掛RPC、代理prompt、模型、即時daemon、權限／正式關卡操作、排程、RoboRev、產品程式／PR／發布。入口1＋原位8（理由另加2）仍是設計預算，閱讀、打字、捲動、網路與FO解除等待未量測；手機能力檢查仍在產品動碼前另做。本輪到此停，交設計總監第二次Step B審查。
