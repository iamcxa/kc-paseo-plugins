# Commander 定期摘要 — Step A

建議：定時讀取各 FO（專案執行負責人）的既有回報，由 Commander（統籌對話的代理）換句話說；每點只有一個 Replay（查看這句的來源）。這是待審設計，沒有啟用排程或改動代理。

## 先看什麼，何時看細節

Commander 對話內，每輪只有收集時間及幾句有變化、受阻或待決定的重點；不貼原文，不加篩選器、模式或各 FO 計數。沒有變化便不新增摘要；無法收集時保留上一輪時間並明示失敗，不能當作沒有變化。讀取成功但缺回報時，說「尚無可確認的新回報」，不寫成進度完成。

虛構例：Commander 寫「預約流程已修好，現在等你安排試用。」點 Replay，才看到同一句及虛構 FO 原文「預約流程修正完成；試用時間待安排」。原文旁標 FO、回報時間及「開啟 FO」；跨 FO 的一句須列出全部來源。這些句子完全虛構，不代表任何真實專案。

Replay 是一張可關閉的卡，手機用一張 sheet（由下展開的卡）。卡內依序是這句、原文、三個動作：「開啟 FO」「繼續討論」「回覆新決定」。後兩者關閉卡，回到原 Commander 輸入框，帶著可移除的這句上下文；不複製整段原文進輸入框，不自動送出。關卡決定接回既有 Confirm（再次確認後送出）流程。

## 五件事與操作數

起點：已開啟 Commander，摘要在可見範圍；每次點按、一次輸入文字、一次送出各算一個操作，閱讀與系統載入不算；需捲動另加。數字是設計推演，尚未做操作測量。

| 目的 | 最短操作 | 從摘要累計 |
| --- | --- | --- |
| 讀摘要 | 直接讀 | 0 |
| 看這點的 Replay | 點 Replay | 1 |
| 開 FO 對話 | Replay → 開啟該 FO | 2 |
| 留在 Commander 討論 | Replay → 繼續討論 → 輸入 → 送出 | 4 |
| 回覆新決定 | Replay → 回覆新決定 → 輸入 → 送出 | 4；一般方向 |

若是關卡：Replay → 回覆新決定 → 選決定 → Confirm，共 4 次；「要求修改／暫緩」須輸入原因，共 5 次。先讀完整關卡說明，摘要不取代說明；有其他關卡才多一次選擇，不由文字推定目標。多個 FO 各有自己的開啟連結，不自動挑一個。返回卡或關閉卡恢復原點與焦點；草稿保留，既有草稿不被覆蓋。來源失效時顯示不可用，可開 FO，但不得換成相似文字。

## 最小機制與精確來源

核對版本 `33952f9b3d02fceab104ba09272d65e432a3d095`：`server/coordinator.ts` 的 `ensureCoordinator` 使用 `shared/coordinator.ts` 的 `COORDINATOR_PROMPT`；目前要求轉述原話。`server/fleet-mcp.ts` 的 `fleetSnapshot`／`fleet_status` 提供狀態，尚無逐點原文來源。

建議沿用 Bridge（Paseo 與工作流程的連接外掛）的伺服器輪詢方式，另設摘要週期：每輪讀 FO 名冊及既有時間線，再用 `paseo.agents.ref(coId).send` 喚起一次 Commander。只讀回報不喚醒 FO。Paseo CLI 有 heartbeat（對既有代理定時送提示）及 schedule（定時執行工作），但此版本外掛取得的 `PaseoApi` 沒有排程方法；不能把 CLI 有的功能當作外掛已接好。來源、prompt、輪詢與摘要呈現四處需要日後改動；本次只有文字。

每點保留來源 `{hostId, agentId, epoch, seqStart, seqEnd, textHash}`；`messageId` 可選，不能單獨依賴。`fleetSnapshot` 擬附上精確的 `assistant_message` 來源與原文，Commander 在結構化回覆內只選來源並改寫句子，Bridge 只呈現句子。Replay 用 SDK（外掛程式介面）`paseo.agents.ref(agentId).timeline.refetch({projection:"canonical", direction:"after", cursor:{epoch,seq:seqStart-1}})` 分頁取回，再核對 epoch、序號範圍與原文雜湊。無來源、讀取缺口或驗證失敗的點不發布為可信摘要；禁止事後猜對應。細節與反例見 [EVIDENCE.md](EVIDENCE.md)。

## 成本、退步與待決事項

**本次未測得一次收集的 token 或金額。** 每 FO 的建議路徑只有時間線讀取，沒有新增 FO 模型回合；整輪仍有 Commander 的上下文、來源讀取與摘要生成成本，不能稱免費。量測須把各 FO 讀取頁數／位元組、Commander 回合用量與耗時分開，缺價格便只報 token；方法見證據文件。

代價：批次會延遲消息；只讀可能漏掉未寫入回報的進度；改寫可能失真；Commander 對話變長也會增加成本。跨來源的一句會有較長 Replay；摘要不是當前關卡狀態，也不能替 Captain 批准權限。

先請 Captain 決定收集策略：是否接受「只讀既有回報，缺資料標未知，不自動催問」？頻率與成本上限須在程式實作前依量測另定，現在不預設啟用值。現有 Commander 的 prompt 不會隨常數變更自動更新，套用新行為的方法也須另核准；不能直接重建或改動正在使用的對話。

關卡仍走 `decideGate` → 精確 briefing／決定識別 → 原話轉交 → FO 記錄；送出、轉交、已記錄三者仍分開顯示。Step A 待設計總監審查；尚未開始 Step B 圖稿，也未取得 Captain 對本提案的回答。
