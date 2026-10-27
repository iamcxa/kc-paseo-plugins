# 第 8 輪互動模型的查核依據

本檔供設計總監重算，不是第二個設計方向。主要選擇頁是 [INTERACTION-MODELS.md](INTERACTION-MODELS.md)。

## 範圍與固定版本

- 產品唯讀路徑：`/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge`。
- 現行安裝的程式提交：`316c9eff7bd6ce2f5e15db7382dea1aba1197a26`；開始時分離 HEAD，工作樹乾淨。
- 狀態起點：`f1d5450`，任務 `r8-simplest-way-to-decide` 在 implementation；沒有先前本階段報告。第 7 輪是已安裝的前一輪，不是本輪可重做的產品工作。
- 主倉開始時：`b5381b18834ead9047778e96b27199ae0b3bd8e8`，main，乾淨（落後已知 origin/main 1 件）；不更新它。
- 依 `kc-dev-flow-2:read-adr` 核對主倉固定版本的 ADR 0008：`docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md`，Status 為 Accepted，SHA-256 `d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f`。本任務較窄的派工排除產品修改、程式分支提交／推送與 PR。
- 本輪是在已批准範圍內提出互動候選；沒有替 Captain 選定模型，也沒有建立新裁決紀錄。

## 任務來源定位

來源連結都指現有記錄，沒有把設計者的頻率假設寫成 Captain 的話。

| 任務 | 可直接定位的來源與原句／裁決 |
| --- | --- |
| 掃清單 | [rounds.md](../../_l3-dogfood/rounds.md)，Round 1 UAT「關閉的 FO 分不出來」；Round 2 UAT「看板可能說謊」；Round 5 UAT「清單標題被截斷」「掃一眼就懂的清單」；Round 6 UAT「不用點開就看到問題」。 |
| 批准 | [round-6/director-ruling.md](../../_l3-dogfood/walks/round-6/director-ruling.md)，decision-composer：sending a note 不應被誤認為 recorded a decision。 |
| 修改／暫緩 | [rounds.md](../../_l3-dogfood/rounds.md)，Round 7 UAT「傳訊息跟做決定分開了」；[round-7/director-ruling.md](../../_l3-dogfood/walks/round-7/director-ruling.md)，i2：empty required reason 時 Confirm 像已就緒。 |
| 讀完整依據 | [rounds.md](../../_l3-dogfood/rounds.md)，Round 2 phone feedback「簡報面板應該要可以整個收合」；[round-7/director-ruling.md](../../_l3-dogfood/walks/round-7/director-ruling.md)，desktop-width、phone request hidden、Keep decision context available。不是 Captain 已要求所有依據預設展開。 |
| 問負責人 | [rounds.md](../../_l3-dogfood/rounds.md)，Round 3 UAT「看得出回覆送給誰, 草稿不會不見, 不會重複送出, 預填不蓋掉草稿」；[round-6/director-ruling.md](../../_l3-dogfood/walks/round-6/director-ruling.md)，discussion-scope。 |
| 回通訊官 | [round-7/director-ruling.md](../../_l3-dogfood/walks/round-7/director-ruling.md)，i4：comms question 在 conversation 裡沒有年齡；[round-5/director-ruling.md](../../_l3-dogfood/walks/round-5/director-ruling.md)，i4：comms officer 與 FO 同問但不可未核對就合併。 |
| 未分派審查 | [round-6/director-ruling.md](../../_l3-dogfood/walks/round-6/director-ruling.md)，review-handoff：聲稱 ask comms officer 但缺相應入口；第 7 輪仍列為 open。表格以現在的程式入口為準，不把舊裁決當作現在沒有入口的證明。 |
| 下一件 | [rounds.md](../../_l3-dogfood/rounds.md)，Round 5 UAT「← Queue 不再誤按」。這只證明返回清單任務；連續處理的頻率、下一件入口的價值是設計假設。 |
| 回讀該次原簡報 | [round-6/director-ruling.md](../../_l3-dogfood/walks/round-6/director-ruling.md)，recorded-briefing；[round-7/director-ruling.md](../../_l3-dogfood/walks/round-7/director-ruling.md)，recorded-briefing，known gap。 |
| 讀眼前結果 | [rounds.md](../../_l3-dogfood/rounds.md)，Round 5 UAT「已決定的閘門顯示已記錄」。此任務只讀已顯示結果，不含回讀原簡報。 |

桌面工作間隙、手機會議間隙是本派工的情境，不是從這些話推導出的行為統計。沒有證據可給出每天幾次或兩裝置的使用比例。

## 現行步驟如何重算

下述路徑皆相對固定版本的 `spacedock-bridge/`。讀程式確認事件路由，讀第 7 輪實際圖檔確認當時露出的內容；沒有向真實代理傳訊、批准閘門或改 daemon。未宣稱本輪重跑了點擊驗收。

| 主頁表格列 | 程式依據 | 基本步驟／會推翻計數的變更 |
| --- | --- | --- |
| 掃清單 | `client/board.tsx` 的 `itemRow`、`commsRow`、By decision；`shared/queue.ts` 的 `buildQueue`、`splitQueue` | 已載入清單讀取 0。換 By FO 另 1；內容在畫面外須計滑動。若題名必須開件才可讀，0 不再代表完成掃描。 |
| 批准 | `board.tsx:openItem` → `DecisionCard`；`client/co-chat.tsx` 的 `choose(word)` 和 `confirm()` | 開件、選准、確認，共 3。選准僅選擇，不能算為已送出；若改成單按即送，會推翻 3，也改變本提案的確認邊界。 |
| 修改／暫緩 | 同上；`shared/decision-composer.ts:decisionComposerHandlers`；`shared/relay.ts:needsReason` | 開件、選結果、點理由欄、連續輸入、確認，共 5。欄位沒有自動 focus；不可少算點入。准無必填理由；修改與暫緩有必填理由。若自動 focus 才能少 1。 |
| 完整依據再批准 | `client/decision-card.tsx` 的 `showEvidence`、Read full briefing | 開件、展開簡報、選准、確認，共 4；一般開件只顯示摘要。圖名 expanded 指手機簡報區開啟，並不代表 Read full briefing 已展開。若要讀被截斷的完整原件，這 4 步不足，外部完整閱讀路徑另算且未證明。 |
| 問負責人 | `DecisionCard` 將 `agentId={fo.id}` 傳給 `CoChat`；`CoChat` 的 `sendToAgent` | 開件、點訊息欄、輸入、送出，共 4。選結果不在這條路徑；訊息不是閘門決定。 |
| 回通訊官 | `client/bridge.tsx:chat`、compact 的 `tab`、`coAsk.onPress` | 桌面通訊官已存在，點欄、輸入、送出，共 3；手機從清單開通訊官問題後同樣 3，共 4。即使桌面可按問題列，最短基本路徑也不用先按它。 |
| 未分派審查 | `board.tsx:openItem` 的 `review && !fo` → `askCo`；`bridge.tsx:onAskCo` → seed；`co-chat.tsx:seedDraft` | 開未分派審查預填「Who should review …」並送出，共 2。前提是無舊草稿；若已有草稿，預填不蓋掉它，須自行編輯／詢問，不能套用 2。審查列的外部連結是另一入口，不是決定或轉送。 |
| 下一件 | `board.tsx` 的 `open` 狀態只保存一件；`DecisionCard:onBack` | `← Queue` 清 open，再按下一列，共 2。沒有直接下一件；recorded 時返回會 `refreshGates(true)`，不能把更新等待算成點擊，也不能把未驗證移除的項目當成已從清單移除。 |
| 讀眼前結果 | `DecisionCard` 的 recorded、closed、claim、sent | 從結果已顯示在原件的狀態起算，讀取 0 次操作；送出、轉送、記錄仍不同。若要重新開件查結果，必須另算導覽，不能套用此起點。 |
| 回讀該次原簡報 | `server/gate.ts:readGateBriefingHandler` | 今日不可完成，沒有數字。沒有 open attempt 時 RPC 回 `briefing: null` 與 recorded；重新進入時沒有原簡報路徑。先前頁面留住的記憶體 briefing 不保證回頭可讀。所需對象是綁定該次決定的原簡報，不是目前最新簡報；新模型本身沒有補完此功能。 |

手機收合由 `briefingCollapsed = layout.compact && (collapsed || keyboardHeight > 0)` 決定。Show briefing 會先 dismiss 鍵盤再開簡報，所以「打字時回看請求」基本上多 1；是否多滑動、重開鍵盤則依草稿與裝置實測。若經常來回看，三案都要把這個成本計入。

## 實際檢視的第 7 輪圖檔

圖檔在 [screenshots/](../../_l3-dogfood/walks/round-7/screenshots/)，[index.md](../../_l3-dogfood/walks/round-7/index.md) 記錄固定版本與合成資料邊界。下面是本輪直接開圖核對的檔案，不只是看圖索引的描述。

- `1440-board-by-decision.png`、`360-board-by-decision.png`：兩個裝置都有具名的請求與通訊官問題；桌面旁邊的通訊官對話已可直接輸入，手機須進入通訊官情境。桌面合成清單有 6 件、手機有 5 件，不能當相同資料的效能比較。
- `1440-gate-open-expanded.png`：問題／摘要、Read full briefing、與 FO 的對話、選結果都存在；通訊官仍是另一個對話。不是同件專屬過濾對話。
- `360-gate-decision-reason-typed.png`：訊息與理由兩個獨立草稿，選結果後另有確認／取消；因此送訊息不代替確認決定。
- `360-gate-open-collapsed.png`：收合後僅留問題單行；不能推論全部摘要一直可見。
- `1440-gate-recorded.png`、`360-gate-recorded.png`：已記錄結果／理由可見，決定控制不再提供，原簡報入口缺失。
- `360-gate-composer-keyboard-long-drafts-controls.png`：已滑到理由與確認控制，請求／摘要沒有可讀內容；0 滑動不是此情境的證據。圖中鍵盤是模擬，不能當實體 Android 鍵盤驗證。
- `360-comms-question.png`：通訊官問題和普通傳訊入口；圖內對話沒有問題的等待時間。

沒有新製作圖片、視覺稿或產品介面。圖中的合成 recorded 不是本輪真的發送或記錄決定的證據。

## 模型缺口與語意邊界的第二條查核

除了 client 的入口查核，再讀 shared 資料契約與 server handler；缺口只聲稱在這個固定版本的 Bridge 範圍內，外部人工路由、原生代理頁、檔案歷史或其他工具並未被排除為可能方法。

- **清單資料：**`shared/queue.ts:QueueItem` 包含 title、detail、since、fo、gate／review；閘門完整 question、artifacts 在另一次 `shared/gate.ts:readGateBriefing` 取得。清單內處理可重用這項讀取，但須新接入，不是現有列就有完整可決定內容。
- **選配的下一件：**`shared/queue.ts` 排序是 permission → review → gate → ask，同類按 since；`client/board.tsx` 只有回清單／開件。修訂後建議不加下一件，仍由清單選事，共 2 步。若 Captain 日後選這個選配，才新增直接換件入口，共 1 步，沿用排序、顯示對象、不自動換件或批准。優先次序只代表現行規則，不是 Captain 的任務價值排名。
- **草稿：**`shared/decision-composer.ts` 以 key 與 target 隔離選擇和理由；`client/co-chat.tsx` 以 agent 與 gate 取普通草稿。清單內新入口也須綁住同一目標，不把可重用的 store 說成新入口已可用。
- **已記錄簡報：**`shared/gate.ts` 有既有 attempt 的 roomRef、briefingId、digest，`server/gate.ts` 只載入 open attempt。`shared/decisions.ts:DecisionRecord` 保存 decisionId、briefingId、slug、foId、decision、words、at，沒有原簡報內容；`server/decisions.ts` 已持久保存 claim，並非完全沒有記錄。可能從既有 state 引用提供唯讀回讀，但必須對應該次決定綁定的 briefingId／digest；不能用新的 open attempt 或最新簡報冒充。歷史原件是否可達與保留期未驗證；新增保存、保留期限或合併來源均是 Captain 的裁定，本輪不新增快照或保存服務。
- **真實送達語意：**`shared/decide.ts:decideGate` 先重查目標，再 claim，然後只送通訊官；`shared/relay.ts:gateDecisionMessage` 要通訊官轉交，FO 核對原話與當前簡報後記錄。`deliveryState` 區分 sent、relayed、recorded、recorded-elsewhere、check。這些是現行程式規則，沒有把讀程式說成端到端送達已被本輪驗證。
- **跨來源合併：**`shared/queue.ts` 的 keys 分別來自 gate、review、ask；`bridge.tsx` 的 coAsk 另取來源，沒有共同 request identity。[第 6 輪裁決](../../_l3-dogfood/walks/round-6/director-ruling.md) 與 [rounds.md](../../_l3-dogfood/rounds.md) 第 6 輪已排除未有共同身分的合併。新語意須交 Captain，而非重新猜測。
- **權限與外部審查：**permission 在 `board.tsx:openItem` 進原生代理頁，review 外連進 GitHub。指定的歷輪來源不足以建立它們的完整操作任務，主頁表格只計未分派審查的詢問入口；不提出新的授權、外部發文或審查語意。

## 如何使用這份數字

現行列由事件路由及已檢視圖片交叉核對；兩個候選列是逐步展開的設計預測，沒有原型可測。讀取、思考、捲動、鍵盤遮擋、等待、失敗復原沒有被折算為 0 時間。沒有真實頻率，不能產生加權節省百分比。

建議的最小可推翻條件：若 Captain 的主要任務是摘要足夠的連續批准，清單內處理每件少開件 1 步，可能比單件全區合適；若要常駐通訊官協調，現行桌面回訊少 1 步。單件全區的主要收益是交還可用區域、減少同時辨識的對話情境，不宣稱少點擊。設計總監應先核對模型與各格步驟，再由 Captain 選模型，後續任務才做視覺方向。


## 第二次修訂：各案的區域、缺口與保持條件

修訂依據是任務檔「FO findings before the gate」的設計總監第一次裁決：NOT SATISFIED，12 個抽查計數正確，但未回應「桌面決定區太窄」、合併了兩種結果任務、推薦仰賴未證實的下一件。該裁決保留在任務檔，沒有改寫或視為已通過。

- **現行側欄：**桌面 `client/bridge.tsx` 的 `pane` 放通訊官，`boardPane` 放清單或 `DecisionCard`；`board.tsx` 開件只換掉 Board 內容，沒有接管 Bridge。與 `1440-gate-open-expanded.png` 一致。沒有新資料需求，但繼續讓決定只用側欄，無法回應 Captain 第 7 輪「桌面決定區太窄」。
- **單件全區：**進入一件時把 Bridge 可用區域全部交給該件，離開後回清單；宿主導覽不在產品接管範圍。這是交互情境切換，不在本輪指定尺寸或按鈕比例。欠缺的是從 Bridge 層切入／退出單件及返回清單位置的路徑；問題、摘要、傳訊、確認與送達狀態均可沿用現有資料，不要求新排序、下一件或保存服務。
- **清單內處理：**把 Bridge 可用區域交給清單，單件在清單中展開；不另留常駐通訊官分佔，但仍同時有多件內容。欠缺按件接入 question／artifacts、驗證目標與送出狀態的互動入口；上面的 QueueItem 與草稿查核說明可重用哪些資料。省開件一步，不代表長清單閱讀或滑動更少。

三案都保持普通訊息與決定理由分開、明示收件人及「對話含其他任務」。准保留確認；修改與暫緩保留必要理由和確認。決定仍先核對當前目標、claim 防重送、經通訊官轉送，由 FO 核對原話及簡報後記錄；送出、轉送、記錄與另處記錄不可混為同一成功。背景更新改變目標須重讀，草稿不套給另一件。改成一按即送、批次批准、產品直接記錄或合併來源，都須另由 Captain 裁定。

重新進入已記錄件並回讀該次原簡報，是三案共同的未完成能力；主頁只寫缺口，不把候選的布局選擇當成已補上回讀。必要時先查既有 state 引用能否提供原件，再交 Captain 裁定任何新增保存或保留期限。
