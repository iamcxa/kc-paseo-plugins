# Step A 證據與限制

2026-11-05；設計限定：文字、操作數與讀取介面核對。全部例子與探針資料為虛構；不存放真實 Captain／FO 對話。任務是 POC（有界可行性驗證）；沒有產品修改、排程設定、模型呼叫或代理生命週期操作。Step A 已經設計總監第二次審查通過；Step B 依 Captain 對脈絡的審查修訂為 cycle 5（第五次派工修訂）。只讀收集策略已確認；本次新增前因後果與同一 FO 的前後對話，尚待審查。

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
3. Commander 回傳單一結構化摘要 `{roundId, collectedAt, points:[{pointId, sentence, sources:[sourceRef,...], contextLines:[{kind,sentence,refs:[sourceRef,...]}]}]}`；`sourceRef` 是上述來源鍵，必須由當輪 `fleet_status` 資料選取。這是未來 wire format（訊息交換格式），不是已有工具。禁止把原文複製到主摘要；只有 Replay 讀取來源原文。Bridge 在完整回覆後驗證 schema、輪次、來源集合、每點至少一個來源、各脈絡行自己的來源及原文雜湊；通過才呈現摘要句，資料格式或來源錯誤顯示「摘要無法驗證」，不以原始 JSON 或猜測摘要替代。自然語言是否忠實仍需閱讀原文判斷；雜湊只證明來源對上，不能證明改寫無誤。
4. Replay 呼叫 `PaseoAgentTimelineHandle.refetch`，由 `paseo.agents.ref(agentId).timeline` 取得，指定 canonical（未合併的時間線）及 `direction:"after", cursor:{epoch,seq:seqStart-1}`；先限制一頁，若 `hasNewer` 且未涵蓋來源末端，沿 `endCursor` 分頁至目標或遇停止條件。不要假造 SDK 沒有的 `getMessage(id)`。核對回傳 `agentId`、`epoch`、精確序號範圍、`sourceSeqRanges`、assistant 類型、雜湊；messageId 有值時再核對。遇 `reset`、`staleCursor`、`gap`、遺失序號、API 錯誤或不同主機就拒絕引用，明示「來源不可用」。
5. 摘要點用 Commander 自己的 `{hostId,agentId,epoch,seqStart,seqEnd,pointIndex}` 定位；點序號 `pointIndex` 僅屬該則摘要，不能拿同名主題重新配對。討論草稿帶這份點識別及句子；送出前仍由 Captain 編輯。原始來源留在 FO 時間線；不加新長期儲存。時間線被替換或清除後，舊摘要可能無法 Replay，此限制明示，不能暗中接到最新回報。

### 脈絡行與前後視窗：第五次修訂

`contextLines` 固定表達 about／before／now（範圍、先前經過、目前所需及明說的影響）。每行有自己的 `refs`，必須是已讀到且屬於這點的精確 FO 回報；不得把整點的單一引用借給三行，也不得以鄰接順序證明因果。來源若沒有明說理由或後續影響，該部分呈現未知。自然語言忠實度仍需人工核對，雜湊不證明推論正確。點的識別沿用 Commander 時間線位置加 pointId，不能用全域「長文」旗標決定來源。

視窗以 `anchorRef`（引用那一則）為中心，起始取前後各兩個 canonical entries，包含 user／assistant 等原始角色、時間與順序。標記主引用；不同來源各有自己的視窗，不混接別的 FO。user_message 只標為對話訊息，不能因此認定是 Captain 的決定；工具等原始項目保留其類型，不把工具結果改寫成 FO 回報或省略後假裝連續。

- 主引用仍以 `timeline.refetch({projection:"canonical",direction:"after",cursor:{epoch,seq:seqStart-1}})` 找回，驗證 host／agent／epoch／序號及雜湊。
- 前段用同一 `paseo.agents.ref(anchorRef.agentId).timeline.refetch({projection:"canonical",direction:"before",cursor:{epoch:anchorRef.epoch,seq:anchorRef.seqStart},limit:2})`；後段為 `direction:"after",cursor:{epoch,seq:anchorRef.seqEnd},limit:2`。回傳仍須交叉檢查 before 的序號小於主引用、after 大於主引用，並以 canonical 序號去重；不能依時間或字句搜尋補位置。
- 每個視窗分別持有 startCursor／endCursor 與 hasOlder／hasNewer；更早／更後從外緣續讀，不重新拿主引用當游標。主機、agentId、epoch 都須與 anchorRef 相同；遇 gap／staleCursor／reset、錯誤或序號不連續，顯示對應側未能讀取，不跨缺口拼接。沒有更多資料與讀取失敗要分開顯示。
- 點某行脈絡的來源時，使用該行 ref 定位。若它不在目前顯示範圍，載入同一 FO 的精確位置並突出該則；不把它換成最相似的目前訊息。每個非同步結果綁定 pointId、anchorRef 和請求識別；切換摘要點後的舊回傳不能填入新卡。
- 視窗是原始對話的位置，不是整個任務的完整歷史。比摘要收集時間新的內容需另標「摘要之後的新訊息」，不因此改寫當輪三行脈絡。主引用遺失就不能聲稱已找回它的前後文；其他可核對的來源不因此變成替代主引用。

圖稿把每點的 FO、來源及脈絡行明確寫在獨立資料中；長文變體只屬等待試用的那一點，三份來源都來自它自己的試用 FO 時間線。預約與匯入兩點各用自己的來源、脈絡與 FO。修訂前路由錯誤及原稿雜湊在 `../mockups/checks/cycle-5-routing-before.json`；不得把那份舊證據當作修訂通過。

這次核對的公開 SDK 確實提供 direction、cursor、limit、projection 與分頁／epoch 欄位；`context-window-probe.mjs` 用假的讀取傳輸走公開 API，檢查選項、來源關係與拒絕條件。沒有呼叫 daemon，故不能聲稱已驗證真實伺服器的游標邊界、保留期、補頁或即時競態。

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

### 脈絡增加的成本

新增收集成本分三部分：讀取能支持三行脈絡的既有 entries（含必要的較早回報）、Commander 的額外輸入／三行輸出／來源引用、逐行來源驗證。缺足夠背景時標未知，不能為填滿三行無上限讀取。跨點或多來源共用的同一 host／agent／epoch／序號內容去重，但不假定模型快取必定命中。

Replay 起始的前後視窗、更早／更後及精確來源定位可按需讀取；這些動作不新增 FO 回合，也不自動再叫 Commander。需在量測中分開標註 collection、replay-open、expand-before／after、context-source-open，逐項記錄頁數、原始與去重後位元組、失敗／缺口與耗時。收集的模型用量仍按同一 turnId 歸因，區分原摘要與新增脈絡的輸入、輸出和快取；不能用帳戶總量差或卡片顯示字數代替。

原型的前後各兩則是提議的讀取範圍，最多五則含主引用、兩側不足則少於五則，這不是量測金額。擴展讀取是使用者明確動作，既有 FO 沒有收到新提示。本次未取得任何真實模型或價格樣本；新增 token、金額和實際等待時間均未量測，不給估計數字。

## AC-2 — 幾分鐘判斷方向

入口是同目錄 `DIGEST.md`：只保留閱讀模型、操作數、來源承諾、成本與代價；版本、函式、欄位及 API 細節留在本文件。主對話維持摘要；Replay 依序顯示原句、Commander 三行脈絡、引用所在的同一 FO 前後對話及三個出口。一般方向不必先開 Replay。

「理解一點」以點 Replay 一次起算，閱讀不算點按、實際捲動另計；核對一行脈絡的來源另加一次，按每個更早／更後再各加一次。從 Replay 回覆到具名關卡、閱讀完整 briefing、選擇及 Confirm 的原路徑仍為五次，須原因為六次；核對與擴展逐次加上。不把操作次數當作已理解、資料足夠或可批准的證明；未知／缺失時明說。

保留／退出條件：關 Replay 回同一點、焦點回按鈕；兩個回覆出口保留草稿並聚焦 Commander；明確送出後保存點識別與原句，引用與 Captain 自己的文字分開。前後文獨立捲動，三個主要出口固定可見；脈絡行的來源連結定位到該行精確引用，不改關卡目標。手機軟鍵盤、原生底部卡片及宿主導覽沒有實機證據。

### 關卡決定不變

`client/co-chat.tsx` 既有 choose／reason／Confirm UI，`shared/decide.ts` 的 `decideGate` 先驗證 briefing／beforeSend、以 `claimDecision` 防重複，組 `shared/relay.ts` 的 `gateDecisionMessage`，經 Commander 傳給 FO；發送失敗會 release claim。`server/gate.ts` 讀真正關卡記錄，`deliveryState` 分開 sent／relayed／recorded。

摘要的來源鍵只回答「這句根據哪段 FO 原文」，沒有 gate 身分，也沒有批准目標的權限。Replay 的「回覆新決定」只附討論上下文，不能選 gate；即使只有一個待決 gate，也必須由 Captain 按有名稱的 gate。該具名入口須明示 FO、任務及關卡階段，從它讀出的目前 briefingId／digest 才能綁定 `DecideContext.gate`、`DecideContext.briefing` 與目標 FO；不能按 FO、摘要點、同名主題或單一候選自動補目標。閱讀 briefing 後才可 choose／Confirm；若它在確認前被替換或無法讀取，必須重新讀取及確認，不能沿用舊目標。

一般方向的 type → send（輸入後送出）留在 Commander 對話，不因此建立 claim 或宣告已記錄的 gate 決定。送到正確 gate 的原話、條件及重複防護維持原路徑；不以摘要來源 ID 取代 briefingId。沒有內嵌 permission approve，權限仍由 Captain 處理。第一版把「摘要來源」與「決定目標」混在一起的計數及單一關卡例外已撤回；本修訂不改產品行為。

### 待審，不替 Captain 作答

只讀既有回報、缺資料標未知、不催問 FO 已由派工確認，不再詢問。頻率、成本上限與現有 Commander 新指示的套用方法仍待 Captain 決定。這次是脈絡設計與離線圖稿修訂，不啟用排程、不動現有代理。

## 檢查紀錄

`checks/commands.json` 保存本輪實際執行的命令、退出碼及證據檔。已知套件缺口沿派工處置：design_surfaces 缺口 2、number_guards 的 R4 缺口 3 若失敗，記 SKIPPED，不補寫虛構欄位或挪用號碼。roborev 未跑：無程式變更，且派工指定套件缺口 5；不算乾淨 review。comment_ratio／doc_impact 只比較未變產品的同一固定提交，不能冒充設計總監審查。

原八項來源契約探針及第二次修訂的操作推演保留為歷史證據；第五次另以 `context-window-probe.mjs` 檢查脈絡行與同 FO 前後視窗，結果放 `checks/context-window.json`。圖稿互動、路由、手機長文、審查頁及內嵌圖片頁的最新證據在 `../mockups/checks/`；都是離線提案證據。
