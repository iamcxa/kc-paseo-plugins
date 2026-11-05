# Step A 證據與限制

2026-11-05；設計限定：文字、操作數與讀取介面核對。全部例子與探針資料為虛構；不存放真實 Captain／FO 對話。任務是 POC（有界可行性驗證）；沒有產品修改、排程設定、模型呼叫或代理生命週期操作。設計總監第一輪認可主要模型及精確來源機制，但要求修正決定目標與主頁資訊量；本文件為 cycle 2（第二次文字修訂），尚待複審及 Captain 判斷。

## 檢查邊界與來源

產品讀取根目錄：`/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live`，HEAD 為 `33952f9b3d02fceab104ba09272d65e432a3d095`，檢查前乾淨且為 detached HEAD（固定提交的唯讀檢查）。派工工作樹 `spacedock-ensign/d1-commander-digest`、提交 `6709c7283b0906cbdf8d6155048e198625520e8e` 未使用。設計輸出只在 split-root state（與產品分開的任務狀態庫）內。

下列產品路徑均相對產品讀取根目錄的 `spacedock-bridge/`，以完整提交 SHA 固定；SDK 來自其已安裝且 package.json 宣告的 `@getpaseo/client`、`@getpaseo/plugin`、`@getpaseo/protocol` 0.12.0。CLI（命令列介面）回報 Paseo 0.15.1；CLI 與 SDK 版本不可混為一談。沒有用網頁資訊補猜本機介面。

## AC-1 — 每點能顯示精確來源

### 已存在的行為

- `server/coordinator.ts:19` `ensureCoordinator` 及內部 `open`：依角色標籤找既有 Commander；存在就直接返回，不更新 prompt。只有建立分支把 `COORDINATOR_PROMPT` 放入 `config.systemPrompt`。所以修改常數不等於已遷移現有對話。
- `shared/coordinator.ts:83` `COORDINATOR_PROMPT`：先讀 `fleet_status`，缺資料才問 FO，透過 `get_agent_activity` 讀回覆，現行要求轉述原話；另有原話轉交關卡決定與權限禁令。
- `server/fleet-mcp.ts:37` `fleetSnapshot`：用 `api.agents.list({filter:FO_FILTER})`，讀任務與關卡，回傳 agentId、狀態、下一步及時間等；沒有時間線原文、epoch 或序號。`answer` 的 `tools/call` 目前只回這份狀態。
- `shared/board.ts:12` `FO_FILTER` 精確使用 `role=fo`，包含 archived；`toRow` 明確標 offline。收集沿用這份名冊，離線項標示離線／舊回報，不因 archived 就假設專案完成。動態或遠端 FO 超出既有 API 連線名冊的完整性，本次無法證明。
- `shared/board.ts`、`client/co-chat.tsx` 已用 `.timeline.refetch`／`.timeline.subscribe`；前者時間線用途與後者 Commander 對話用途均可找到。這證明 SDK 已被產品使用，不證明逐點 Replay 已存在。

### 建議的最小來源契約（尚未實作）

1. 沿用 `fleet_status`，擴充 `fleetSnapshot` 的回傳資料：每輪給 `roundId`（本輪識別）、收集截止時間、每個 FO 的讀取成功／失敗／離線狀態，以及已取回的原文來源。只接受 `item.type === "assistant_message"` 的完整可引用文字；不把 user/tool/reasoning 當作 FO 回報，不根據名字、時間接近或相似詞句決定來源。狀態標籤與 gate 資料可作收集提示；若要成為摘要進度句，仍須有 FO 原文支持，否則只顯示來源／收集狀態。
2. 一份來源為 `{hostId, agentId, epoch, seqStart, seqEnd, textHash, timestamp, turnId?, messageId?}`。`hostId` 使用外掛 `PluginHostProps.host.id`，指同一 API 連線所屬主機，不把別台主機同 ID 的代理接上。序號來自 SDK `AgentTimelineEntryPayloadSchema`，epoch 來自 `FetchAgentTimelinePayload`；`textHash` 是對該完整 `item.text` 的 UTF-8 SHA-256，不在這裡發明可選欄位為必填識別。
3. Commander 回傳單一結構化摘要 `{roundId, points:[{sentence, sources:[sourceRef,...]}]}`；`sourceRef` 是上述來源鍵，必須由當輪 `fleet_status` 資料選取。這是未來 wire format（訊息交換格式），不是已有工具。禁止把原文複製到主摘要；只有 Replay 讀取來源原文。Bridge 在完整回覆後驗證 schema、輪次、來源集合、每點至少一個來源及原文雜湊；通過才呈現摘要句，資料格式或來源錯誤顯示「摘要無法驗證」，不以原始 JSON 或猜測摘要替代。自然語言是否忠實仍需閱讀原文判斷；雜湊只證明來源對上，不能證明改寫無誤。
4. Replay 呼叫 `PaseoAgentTimelineHandle.refetch`，由 `paseo.agents.ref(agentId).timeline` 取得，指定 canonical（未合併的時間線）及 `direction:"after", cursor:{epoch,seq:seqStart-1}`；先限制一頁，若 `hasNewer` 且未涵蓋來源末端，沿 `endCursor` 分頁至目標或遇停止條件。不要假造 SDK 沒有的 `getMessage(id)`。核對回傳 `agentId`、`epoch`、精確序號範圍、`sourceSeqRanges`、assistant 類型、雜湊；messageId 有值時再核對。遇 `reset`、`staleCursor`、`gap`、遺失序號、API 錯誤或不同主機就拒絕引用，明示「來源不可用」。
5. 摘要點用 Commander 自己的 `{hostId,agentId,epoch,seqStart,seqEnd,pointIndex}` 定位；點序號 `pointIndex` 僅屬該則摘要，不能拿同名主題重新配對。討論草稿帶這份點識別及句子；送出前仍由 Captain 編輯。原始來源留在 FO 時間線；不加新長期儲存。時間線被替換或清除後，舊摘要可能無法 Replay，此限制明示，不能暗中接到最新回報。

SDK 證據位置（相對 `node_modules/`）：

- `@getpaseo/client/dist/index.d.ts:191-258`：`PaseoAgentTimelineRefetchOptions`、`PaseoAgentTimelineHandle`；同檔 `PaseoAgentHandle` 提供 `timeline`、`send`、`refresh`、`lastUsage`。
- `@getpaseo/protocol/dist/messages.d.ts:12230`：`AgentTimelineEntryPayloadSchema` 提供序號、來源範圍、時間、turnId；`FetchAgentTimelineResponseMessageSchema` 提供 epoch、重設／過期／缺口旗標與分頁游標。
- `@getpaseo/protocol/dist/agent-types.d.ts:309-318`：`AgentTimelineItem` 的 user／assistant 訊息 `messageId` 是可選。
- `@getpaseo/plugin/dist/client/contracts.d.ts:9-37`：`PluginHostProps.host.id` 與 `PluginSurfaceProps.navigation?.openAgent({agentId,serverId?})`；`openAgent` 沒有時間線定位參數。故 Replay 在 Bridge 內定位，開 FO 只承諾開對話，不承諾跳到原訊息。舊 host 無 navigation 時沿用 Bridge 現有 FO 詳情，顯示原文與可複製識別；不能畫出無效的開啟按鈕並宣稱成功。

`source-contract-probe.mjs` 是設計契約探針，載入上述已安裝 SDK 和協定 schema，以虛構 transport（提供假回傳的讀取介面）走公開 `createPaseoApi` → `.agents.ref().timeline.refetch`；沒有網路連線或代理變更。正例及反例結果寫入 `checks/source-contract.json`，命令與範圍寫入 `checks/commands.json`。它驗證 SDK 轉送選項及擬議來源規則可區分反例，不是產品 Replay、伺服器游標語義或真實主機相容性的驗收。

可推翻條件：同字不同 FO／序號被當成同一來源；epoch 已變仍顯示為當年原文；user 文字被當作 FO 回報；或引用缺口時拿最新訊息補上。任何一項都違反本設計，需拒絕摘要點。

### 排程機制的選擇與限制

已執行唯讀 `paseo --help`、`schedule --help`、`schedule create --help`、`heartbeat --help`、`heartbeat create --help`。create 後接 `--help` 只顯示說明，沒有建立任何項目。

- heartbeat：CLI 說明為對「this agent」建立定期提示，有 cron／timezone／max-runs／expires-in。適合既有對話的定期提示，但 Commander 禁用 Bash 與 `create_heartbeat`，外掛也沒有已暴露的 heartbeat 建立方法；不能在本 worker 執行 create，把 heartbeat 誤建在 worker 身上。
- schedule：CLI create 提供 provider／cwd／新回合配置；下層 `CreateScheduleOptions` 其實支援 `target: self | agent | new-agent`，不能誤稱 schedule 一定建立新代理。可是這個方法屬 `@getpaseo/client/internal/daemon-client` 的 `DaemonClient.scheduleCreate`，SDK README 明說 internal 匯入是不受支援的實作細節。`PluginHandlerContext.paseo: PaseoApi` 的公開欄位只有 agents／workspaces／projects／terminals／providers／config／observeEvents／dispose，沒有 schedules 或 heartbeats。為這件事引入內部連線或額外常駐代理，比既有輪詢多出支援與權限面。
- Bridge 自有輪詢：`server/reviews.ts:84` `startReviewPoller` 既有首次 timeout、定期 interval、in-flight 防重入及清理；`index.server.ts` 已啟動並回收它，`rememberPaseo`／`rememberedPaseo` 延後取得已連線 API。`checkReviews` 已示範用 `.agents.ref(agentId).send(text)` 對 Commander 發自動通知。推薦重用這種生命週期，新增獨立摘要 tick；不更改 review 檢查頻率，不把 UI 的每分鐘 refresh 當成 Commander 排程。

下一階段最小行為：收集當輪完整名冊及已存在回報；每個 FO 最多讀設定的頁數／位元組，超量標示截斷，不聲稱完整；記住截止來源序號以避免重述。來源無變化不叫模型；有變化才對既有且已採用新指示的 Commander 發一次提示。提示屬 Bridge 自動資料，只允許讀來源和產出摘要，不授予 FO 發訊、啟動工作或批准權限。Commander 忙碌或本輪未結束時合併／跳過 tick，不排入一串過期輪次；API 尚未就緒或斷線時明示未收集，不建立替代代理。重啟後先讀既有摘要輪次，不能把所有歷史回報偽裝成新進度；恢復策略在未來實作驗證，不在此新增持久化。

目前 prompt 的自動通知規則及逐字轉述規則，都要在 Captain 核准後明確改成上述只讀摘要例外，不能只依低優先序的提示偷偷覆蓋 system prompt。現有 `ensureCoordinator` 不更新既有代理，公開 `PaseoAgentActions` 也沒有更新 prompt 的方法；採用方式尚未證明，必須先由 Captain 核准可支援的遷移方法，不能擅自重建對話。輪詢在外掛／daemon 停止時也停止；不承諾機器離線仍執行或補發所有輪次。

## 收集成本：方法，沒有捏造測量值

這次沒有傳送任何訊息，因此沒有可歸因的收集回合用量或美元數字。唯讀 `paseo status --json` 在本環境回傳 `uv_uptime EPERM`，尚未取得 daemon 狀態；這個本機 CLI 錯誤不等於 daemon 不在線，也不能作為模型成本樣本。本任務不依賴修復它。

建議路徑的計價單位：

- 每 FO：一次既有狀態讀取中的份額，加該 FO 的時間線頁數、讀取位元組、讀取耗時；沒有給 FO 新提示，故沒有由這個設計主動新增的 FO 推理回合。不能把這句當成全服務成本為零。
- 每輪：名冊／關卡讀取 + 各 FO 時間線讀取 + 一次 Commander 收集與改寫（工具迴圈可能包含多次 provider 請求）。保留 Commander 既有上下文、來源文字、快取及輸出成本，不能只算摘要字數；無變化輪次只有讀取成本。
- 若未來另批准主動詢問：每個被問 FO 再多一次請求及其回覆回合；逐 FO 的用量必須量測，與只讀方案分開，不能偷偷併入固定輪詢。

真正量測時，先觀察**已被他人授權執行的**完整一輪，不為量測新增提示。以 `PaseoApi.observeEvents`／時間線訂閱對齊 turnId 和輪次，記錄開始／結束、各 FO 讀取頁數／UTF-8 位元組／耗時、實際 provider 請求數與模型；不要在有並行對話時用整個帳戶前後差歸給此輪。`AgentStreamEvent` 的 `turn_completed.usage`／`usage_updated` 以及 `PaseoAgentHandle.refresh().agent.lastUsage` 可讀 `AgentUsage.inputTokens`、`cachedInputTokens`、`outputTokens`、`totalCostUsd`。必須先核對該 provider 的更新是累計還是回合數值，不能把 usage_updated 每次都相加。

若 totalCostUsd 缺失，先報 token 與「美元未量測」；需估價時另以該輪模型的當時官方價格，核對輸入是否含快取、快取讀／寫區分與計價單位後計算，註明是估價。重複量測使用相同名冊／來源量，報分布與忙碌／失敗情況；不要將一次空回報當作正常輪次上限。等待頻率、成本上限與現有對話採用方式由 Captain 決定，這份設計沒有啟用值。

## AC-2 — 幾分鐘判斷方向

入口是同目錄單頁 `DIGEST.md`：結論、虛構主摘要／原文例子、五個目的及一般方向／關卡分支的操作表、收集建議、成本與代價；不用第二套模式或導覽。版本、函式、來源欄位與 API 呼叫集中在本證據文件，主頁只保留每句可找回精確原文、找不到便明說的承諾。操作數為推演，不是真人計時或裝置驗收。從 Commander 主入口之外進入，另計一次選 Commander；捲動或另外打開關卡入口時另計，不藏在最短路徑數字裡。

第二次修訂的計數以 Commander、摘要、輸入框及具名關卡入口已可見為起點；一次點按、整段文字輸入及送出各計一次，閱讀說明與系統載入不計。讀摘要 0；Replay 1；Replay 後開 FO 2；帶著摘要點繼續討論或給一般方向 4；直接輸入一般方向再送出只需 2。從摘要點進關卡的 5 次明確是：Replay、回覆新決定、按具名關卡、選決定、Confirm；按關卡後必先閱讀它的 briefing（完整關卡說明）才選決定。須填原因時在 Confirm 前多一次整段輸入，合計 6。直接按具名關卡也能開始同一決定流程，Replay 從來不是前置條件。

保留／退出條件：關 Replay 回到該點、焦點回 Replay 按鈕；討論與回覆新決定先回到一般 Commander 輸入框，不將輸入框綁到關卡；既有草稿保留，點識別只作附加可移除的討論上下文；返回 FO 後回到原摘要位置。跨 FO 先挑明確連結；使用者不須選「模式」。手機鍵盤／返回／原生 sheet 的實際行為留給 Step B 之後驗證，本次沒有畫圖或聲稱原生互動通過。

### 關卡決定不變

`client/co-chat.tsx` 既有 choose／reason／Confirm UI，`shared/decide.ts` 的 `decideGate` 先驗證 briefing／beforeSend、以 `claimDecision` 防重複，組 `shared/relay.ts` 的 `gateDecisionMessage`，經 Commander 傳給 FO；發送失敗會 release claim。`server/gate.ts` 讀真正關卡記錄，`deliveryState` 分開 sent／relayed／recorded。

摘要的來源鍵只回答「這句根據哪段 FO 原文」，沒有 gate 身分，也沒有批准目標的權限。Replay 的「回覆新決定」只附討論上下文，不能選 gate；即使只有一個待決 gate，也必須由 Captain 按有名稱的 gate。該具名入口須明示 FO、任務及關卡階段，從它讀出的目前 briefingId／digest 才能綁定 `DecideContext.gate`、`DecideContext.briefing` 與目標 FO；不能按 FO、摘要點、同名主題或單一候選自動補目標。閱讀 briefing 後才可 choose／Confirm；若它在確認前被替換或無法讀取，必須重新讀取及確認，不能沿用舊目標。

一般方向的 type → send（輸入後送出）留在 Commander 對話，不因此建立 claim 或宣告已記錄的 gate 決定。送到正確 gate 的原話、條件及重複防護維持原路徑；不以摘要來源 ID 取代 briefingId。沒有內嵌 permission approve，權限仍由 Captain 處理。第一版把「摘要來源」與「決定目標」混在一起的計數及單一關卡例外已撤回；本修訂不改產品行為。

### 待審，不替 Captain 作答

首個問題只選收集策略：是否接受只讀既有回報、缺資料標未知？它決定是否會額外喚醒 FO，直接影響成本與干擾。之後再依觀察到的完整輪次量測確認頻率與上限；採用現有 Commander 新 prompt 的方式仍是實作前阻擋項。沒有代錄他的回答。Step A 先交設計總監；Step B HTML／PNG／review.html 全部未開始。

## 檢查紀錄

`checks/commands.json` 保存本輪實際執行的命令、退出碼及證據檔。已知套件缺口沿派工處置：design_surfaces 缺口 2、number_guards 的 R4 缺口 3 若失敗，記 SKIPPED，不補寫虛構欄位或挪用號碼。roborev 未跑：無程式變更，且派工指定套件缺口 5；不算乾淨 review。comment_ratio／doc_impact 只比較未變產品的同一固定提交，不能冒充設計總監審查。

第二次修訂只改主頁、證據文字及本次階段報告；先前八項來源契約探針的程式與資料都沒改，設計總監也已重跑認可，故不把舊輸出冒充新的互動測試，也不重做來源調查。`checks/cycle-2-operations.json` 保存各路徑的計次動作與合計供核對；它是設計操作推演，不是已實作的介面測試。Step B 仍未開始。
