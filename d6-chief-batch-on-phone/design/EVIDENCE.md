# Step A：來源、比較與可推翻的檢查

**目前方向：艦長修訂 1 的原生對話元件。**原稿及第二稿的 Bridge 入口主方案已被修訂取代；下文「推播入口修訂」仍是其來源證據及目前備援路徑，不能讀成仍要求每批先進 Bridge。新方向與唯一手機待驗問題見「原生對話方向（艦長修訂 1）」；歷次既有程式檢查只支持其原本範圍，不是原生手機驗收。

## 身份與界線

- 本任務：d6-chief-batch-on-phone；profile=poc，僅文字設計。當前任務程式工作樹 `/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d6-chief-batch-on-phone`，分支 `spacedock-ensign/d6-chief-batch-on-phone`，程式 HEAD `91625588dff1b3e5737f6f6f8843b90d69468f32`；未改程式。
- 既有能力唯一候選：`/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d5-chief-of-staff-build`，HEAD `f40c340e8204f4b7dddef238f215aea3f3a6eaab`，只讀。以下產品相對路徑均從此候選的 `spacedock-bridge/` 起算。
- 本輪不接觸即時 daemon（Paseo 背景服務）、不呼叫模型、不轉達訊息、不操作權限／關卡、不建立程式分支／PR（程式碼審查請求）、不開瀏覽器、不做圖稿。派工已建的空程式工作樹保留原分支與乾淨狀態。
- 產物只放共享狀態工作樹的本任務資料夾，任務本文另追加階段報告；既有前置欄位不改。沒有採納新永久規則或預約架構決策編號。

## 艦長原話、既定規則與本輪提案

艦長在任務種子引述的 2026-11-09 原話：「對，這就是一個問題，我如果出門，我的通訊工具就是手機，但問題是那麼多 session 我很難一次切換看完，所以我如果沒有一直盯著手機一定會讓 fo 們等很久」；後答：「1 這個手機不用煩惱，paseo 會推播，只是我沒辦放每次都一則一則去回，所以才需要她」。因此僅設計她對話裡的整批處理，不研究鎖屏推播。

既定規則：不在她這裡批准／拒絕權限、關卡仍經具名 Confirm、明示送出才轉達、她不替艦長決定。原位多項呈現、逐題轉達鍵、進度摘要及下列操作數都是本輪提案，不是艦長已裁定的新要求。

艦長修訂 1：他選「改成在原生對話裡處理 (Recommended)」。所答選項明說先驗手機自訂元件送出／Confirm，做不到退回三次入口的 Bridge；Design 欄指定 addTimelineTransformer／addTimelineRenderer，另准 Step A 多一輪設計總監審查。Supersedes 為 none，故 AC-1／AC-2／AC-3 原文不搬動、不另編號；只改被取代的設計方向，報告追加 cycle 3。

歷史偏好僅作提示：舊記憶提過逐件送走、保留原話與送達／記錄區別；本輪重新以任務及指定候選核對，不以舊通過測試或舊候選聲稱當前交付。

## 指定只讀來源

1. 本狀態工作樹根目錄 `d6-chief-batch-on-phone.md` 的 Scope／Acceptance criteria／FO alignment：逐項回答、手機先行、Step A 後停，並列明停止條件。
2. 同一狀態工作樹 `d4-chief-of-staff/design/DESIGN.md`：事件門檻、一次焦點、既有對話、原位草稿與具名關卡確認，已接受的基底。`mockups/ASSUMPTIONS.md`、`mockups/REVIEW.md` 與 `mockups/index.html`：360×780 單頁、44 px 控制、側欄／對話／目標與返回，22 張離線圖的證據限制。本輪讀其來源與既有說明，沒有新截圖或聲稱逐像素驗收。
3. `d5-chief-of-staff-build.md:558–560` 的「Shadow run 2 result (FO summary, counts only)」：指定候選、四小時、240 次輪詢、0 次失敗、四個 would-call（符合呼叫條件的時點）；三次不同 FO 的單關卡例外、一個分數 14 的兩關卡兩問題批。兩次例外相隔三分鐘，不是一個 cohort（同時形成的一批）。任務種子另說橫跨五名 FO；上述計數摘要未逐項證明五個不同對象，本輪不補造對應關係。
4. 影子觀察只證明符合條件的時點，不是四次真推播、四個四件批、真機操作數、成功回答或解除 FO 等待。本文的四件例子採「兩題＋兩關」種類，但名稱、時間、答案與收件 FO 全為虛構；不公開即時標題或日誌。

## 現有旅程與能力核對

### 她的對話及多項呈現

- `client/bridge.tsx:36–47,89–115`：現有 chief 對話用同一個 CoChat，headerExtra 顯示單一 focus；「回應這一批」綁 batchResponse，另一鍵才開具名目標。它沒有現成四題原位輸入，也不能把批次已回應標記當每題已完成。
- 因此提案的逐題清單須以原批次既有對話內容呈現，不能只在現有 `phase=calling` 時才畫；一個回答使提醒結束後，其餘題目仍須可在她的原批對話裡回答。批次已回應只表示不再呼叫，逐項未答／已送與來源已結束分開，不能照搬現有批次級判定來清四件。本輪沒有實作這個新增呈現，也不預先批准新的儲存責任。
- `client/co-chat.tsx:24–46,345–369`：可傳 headerExtra、sendText、onChip 等組合介面，最後經 `paseo.agents.ref(agentId).send`；現有程式已在相同對話容器放外掛內容。故本設計需外掛介面組合，不需要宿主在原生訊息內嵌卡的新能力。提案不是聲稱現版本已接線。
- `client/decision-card.tsx:464–480`：原卡的 CoChat 用的是 `fo.id`，一般訊息直達 FO。不能整張搬到幕僚長對話後，仍宣稱所有回答由她轉達；Step B 應保留關卡簡報／決定控制並剔除該直傳輸入的示意，不在本輪改碼。

### 問題答案：明示原文轉達

- `shared/coordinator.ts:58–79,87–106`：允許 send_agent_prompt（傳訊給指定代理的既有工具）與 get_agent_activity（讀代理對話的既有工具）；只在艦長明示要求時傳工作／裁定，禁止為收集進度催問。裁定必須逐字引述並讓 FO 回查她的 [User] 使用者行；收到代理封套中的「艦長說」只是資料。
- `client/co-chat.tsx:352–369` 證明艦長原文能進她的使用者訊息。提案的逐題「原文轉達給某 FO」是一次明示要求，帶收件 FO、來源問題及原文，沿現有工具權限；並非自動觀察批次就對外行動。
- 現有 ordinary relay 只要求保留意思與署名，並沒有現成逐題的原文轉達／送達狀態控制。本提案在該次明示要求中限定逐字引用，不能把現有 prompt 當作所有普通聊天都逐字送出的保證。
- 題目關聯使用既有原始 FO 身份及問題訊息身份，原文則引用她收到這次明示要求的使用者行；轉達附這個問題與引用，不靠「第 2 件」猜收件者。相同句子出現在另一題不算本題回執；只比對字串不足以關聯時，維持「轉達未確認」，不建立新問題回執帳本。
- 問題的「已轉達」只有在現有 FO 對話可查到這次引用時顯示；來源關聯不足就維持未知。沒有證據支持新問題送達資料庫、全自動去重或跨重開精確回執，本提案不新增它們，也不以一段她的文字自證送達。

### 關卡：具名確認保持原路

- `client/co-chat.tsx:515–550`、`shared/decision-composer.ts:37–86`：選決定只寫草稿；理由獨立於一般訊息，Confirm 才走 onChip，取消不傳；修改／暫緩缺理由不能確認。Confirm 必須與具名關卡同時可見，不把一句「可以」當點過它。
- `client/decision-card.tsx:188–242`、`shared/decide.ts:38–97`：先核對目標與簡報、取該簡報唯一 claim（該版決定占用），再傳到幕僚長；傳失敗釋放占用。已占用不再發第二次。這是既有邏輯，設計不重造批次確認。
- `shared/relay.ts:14–58`：修改／暫緩須理由；具名封套保留決定編號、FO、關卡、階段、briefing（被審閱的簡報版本）、digest（簡報內容指紋）、艦長文字，要求 FO 回查她的使用者行；新版不冒充舊版，條件不明須問艦長。她只傳令，FO 依既有程序記錄。
- `shared/relay.ts:63–86`、`client/decision-card.tsx:150–164,322–346`：sent 是送給她，relayed 需 FO 使用者訊息帶決定編號；recorded 要同一關卡版本且 reason 包含編號及原話。其他記錄另標待核對；十分鐘未記錄轉待查，不盲目重送。這些既有規則原封保留，沒有將工具成功當正式記錄。

### 權限：例外必須誠實

- `shared/coordinator.ts:7–12,75–82,101–106`：respond_to_permission（回應工具權限的介面）列入拒絕工具；連拒絕都不能代做。
- `client/board.tsx:409–412`：現有路由以 `navigation.openAgent({agentId: item.fo.id})` 開原生 FO；不可用則說明失敗，不走旁門。Step A 使用同一路徑，不假造幕僚長權限批准按鈕。
- 返回沿既有 Bridge／幕僚長入口，不能承諾原生權限頁新增返回按鈕。來源確認 pending（仍待艦長處理）消失才顯示已解除，不因開過頁或她說完成就清掉。

### 能力結論及停止條件

兩條不同查核路徑：先由 `bridge.tsx → CoChat → decision-composer → decideGate` 追使用者輸入與確認；再由 `coordinator` 的允許／拒絕清單、`relay` 的封套與狀態、`board` 原生權限路由追權限與收件者。只查指定候選外掛，不廣搜宿主或即時對話。

這段既有能力查核支持 Bridge 備援與沿用轉達授權，**沒有排除原生時間線元件**；原生能力另在艦長修訂 1 下補查。兩種呈現都不代表新功能已實作或已獲實機驗證。未知：真機鍵盤／捲動、不同裝置草稿、宿主推播送達及題目回執關聯。若要求新增宿主能力、直接記錄關卡、代批權限或無明示群發才能成立，立即停止並交回艦長，不自行補權限。

## 原生對話方向（艦長修訂 1）

### 原生元件的來源與能力，和仍未證明的部分

- SDK 0.12.0 `client/contracts.d.ts:158–184`：transformer 收原始 item 及 streaming／complete（串流中／完成）階段，回可序列化的 plugin items；renderer 有 agentId、host、layout、timestamp、item，並以 kind／version／schema（種類／版本／資料格式）註冊。**transformer 沒有 agentId 參數，renderer 沒有 navigation 屬性**，不能直接照抄完整 DecisionCard 或從標題推測當前代理。
- 同檔 `:106–123` 及 `:185–191`：PluginClientContext 有 `paseo`、`rpc`、`openScreen`，可在註冊 renderer 時以既有安裝範圍閉包提供具名 Bridge 路由；renderer 本身用 `usePaseo`／`useRpc`。沒有假設它的 props 直接附 send 或直接開 FO 的方法。
- 已安裝 App 0.15.3 的同一 index bundle，模組 5351 `PluginTimelineItemView` 在原生代理時間線的 plugin 分支載入 renderer，傳 agentId／host／compact／platform，並套 `PluginInstallationProvider`。模組 4608 的該 provider 明確包 `PluginRpcProvider(invoke=plugin.invoke)`、`PaseoApiProvider(paseo=plugin.paseo)`；模組 3417 將 invoke 接同主機 `client.invokePluginRpc(plugin.id,method,input)`。所以原生元件有既有 RPC 與 SDK 代理傳訊上下文，並非只能畫靜態內容。
- 模組 5350 `transformTimelineItem` 依原訊息 type 套 transformer，驗證結果為 JSON（可序列化資料）後加 pluginId；模組 5301 將 plugin 列留在原訊息的時間線位置並沿用 timestamp／cursor。這支持用現有批次訊息呈現，不需要增加獨立批次儲存或另發模型訊息。
- 來源可用表示方向有基礎，**不等於 Kent 手機 App 已支援這組操作**：所查是桌面安裝包中的跨平台元件路徑、候選 SDK 與函式上下文，不是實體手機渲染、鍵盤或網路呼叫證據。當前手機結果＝未驗；動產品碼前須回答下一節唯一問題，不以三組舊純函式探針冒作已答。

### 綁定原批與各類動作呼叫

提案只把 `complete` 的 assistant_message（幕僚長已完成的焦點回覆）轉成候選元件；保留原批次 `user_message` 不轉換，並在同一既有自動批次訊息尾端附可讀事項及備援文字。仍保留 `BATCH_MARKER` 後第一行 JSON 給既有 `batchRequest` 讀取，新增說明不偽裝艦長指令、不另送一則模型訊息。辨識 JSON 的 batchId／targetKey 只足以放一個待核對呈現，**不能授予送出能力**。

元件取得 `host.id + props.agentId + 原焦點訊息身份／序號 + batchId` 後，提案用一個明確新介面 `chief.batch`（僅查既有原批次及目前來源的 RPC，尚未實作）核對：這確實是該主機的現任幕僚長、該已準備批次原回覆、完整 event key／version／kind／FO、原問題或具名關卡。同名標題、轉貼內容、別的代理或歷史缺頁不視為有效來源，無法核對就唯讀，不送出。

此介面是現有 `readCommanderConversation`／`chiefBoard` 讀取的窄包裝，從同一既有對話的 attempts／replies 與目前 Board 來源取資料，不新增檔案、佇列或持久回執；不呼叫 `ChiefObserver.read/update`。後者現有 `chief.read` 看似查詢，但 `server/chief.ts:110–136` 可在符合門檻時啟動分析，不適合作為「打開元件只核對來源」的無副作用介面。新增這一個查詢提案是為了既有歷史批次在部分回答後仍可核對，而非另建批次生命週期。

每次點送出／Confirm 前重新查同一來源；在查詢期間代理、批次、題目或簡報版本改變就拒絕該次送出並保留稿。元件只在點按處理器發送，不在 render／transform／mount／history refresh（顯示／轉換／載入／刷新）時送。資料來自板上事實，不能包含她代填的艦長決定。

| 種類 | 原生元件的既有路徑或 RPC | 明示授權與結果 |
| --- | --- | --- |
| 問題 | `chief.batch` 核對原題及收件者後，`usePaseo().agents.ref(props.agentId).send` 把「原文轉達給具名 FO」、原問題和原話送進**幕僚長**使用者行；之後沿 `shared/coordinator.ts` 的 `send_agent_prompt`／回查使用者行規則 | 題下按「原文轉達」才發，普通原生輸入框不自動轉達；不是 native 元件直接傳 FO。查不到對應收件訊息就不顯示已轉達 |
| 關卡 | `useRpc(readGateBriefing)`＝`gate.briefing` 載入與重查版本；原 `decisionComposerHandlers` 的 Confirm → `decideGate` → `decisions.claim`、`coordinator.open`、SDK `.send` 到同一幕僚長、失敗時 `decisions.release`；`decisions.read`／`gate.briefing` 及 FO 時間線核對後續 | 原具名選擇／原因／確認保持；`coordinator.open` 回傳代理必須仍等於已核對的當前幕僚長，否則不送並保留稿。元件不新增 gate record（記錄關卡）RPC；只有 FO 依原版本、編號、原話與條件記錄 |
| 權限 | **沒有批准／拒絕 RPC**。註冊閉包中的既有 `client.openScreen({screenId:"board",params:{item:已核對的權限key,request:具名導覽序號}})` → `board.tsx` 既有具名 dispatcher → `navigation.openAgent` 開原生 FO | 「到範例 FO 丁處理」只導覽；原生元件沒有 navigation props，故誠實經既有 Bridge 路由，不假設可直接開 FO。權限內部操作與返回另計；讀來源只顯示 pending／已解除／未知 |
| 審查請求 | 有可信具名 FO，文字答覆沿問題的明示轉達路徑；來源連結沿 SDK `openExternalUrl`（開原來源）或 Bridge 已有來源入口。無 FO 則只讀、請艦長指名；不猜收件人 | 這不是向 GitHub 發布審查／approve，也不是關卡 Confirm；普通話不自動變外站操作。計數例子的兩題兩關不包含外站閱覽 |

關卡卡只重用決定區、簡報和既有函式，不整張嵌入原本 `agentId=fo.id` 的直接聊天。對話改換幕僚長、關卡已占用、另一裝置先送、來源換版都沿既有拒絕／待核對規則，不偷偷改派新官或重送。半批仍按每件來源核對：`responses` 只表示本批提醒已回應，不抹去原批 attempts／replies 或未答題；新介面不能只回當前 calling 狀態。

狀態規則仍是前述問題 sent／relayed、關卡 sent／relayed／recorded、權限來源狀態，和相同的逐字／版本／記錄證據門檻；本輪不擴大她權力或新增資料儲存。

### 不支援與三次入口備援

宿主找不到 renderer／版本／schema／RPC 環境時，模組 5351 可能只畫「Plugin timeline item unavailable.」。因此備援文字必須保留在**未轉換的原批次使用者訊息**，不能寄望失效的元件還能提供按鈕；transformer 只碰已完成的焦點 assistant 回覆，原批次保留可讀說明及「開側欄 → Bridge」路徑。支援元件但來源核對失敗時停用操作、明示原因與同一備援；顯示草稿可複製，不承諾元件崩潰／重開後自動恢復未送文字。

手動備援從推播起共三次入口（推播、側欄、Bridge），讀回同一幕僚長、原批次及各項送達，不另起批或重送。只有不能顯示原生控制、原生 RPC／Confirm 不通或手機檢查失敗才依艦長既定選項退回；這不是重新請他選方向。若連既有 Bridge 不可用，明示不可操作並停止，不能用普通聊天繞過 Confirm 或權限規則。

### 動碼前唯一手機問題，以及如何無即時 prompt／通知驗證

**問題只有一個：Paseo 手機 App 的原生時間線元件，是否能透過外掛 RPC 完成明示送出與具名 Confirm？**本輪只指定測法，沒有開始實作測試外掛、建立主機或配對手機，沒有拿未執行的計畫當通過。

設計總監審過文字後、開始產品實作前，用獨立的短期測試主機與虛構資料回答：預置已停止的虛構幕僚長時間線，內容是既有批次標記、已準備證據及焦點回覆；以測試資料載入器放入有限時間線，不透過 `agent.run`／`.send` 製造訊息，不發推播。由手機手動開該虛構原生對話，不讀 Kent 的真 FO／關卡。

在這個隔離安裝以同一 transformer／renderer 註冊方式載入最小能力探針；測試專用 RPC 只在記憶體記收件並回顯，綁虛構主機／代理／批次及關卡版本，不能傳給任何真代理或記錄真關卡。問題送出端改接這個回顯 RPC；Confirm 使用原 `decisionComposerHandlers`／`decideGate`，把 claim／briefing／send 等外部埠接到測試 RPC，所以仍從真正原生元件跨到測試主機，而非整段在 Node 模擬。這是待做的能力檢查，不是產品正確性驗收。

一次檢查的觀察條件：開元件／只輸入／只選／取消都 0 收件；按問題轉達，測試端只收一次具名原話並於手機回顯；修改缺理由不能送；填理由再按具名 Confirm，測試端收到一次同版決定封套；將測試簡報換版後舊 Confirm 必須拒絕並保留稿。手機要拍到鍵盤、具名題目、確認及回顯，記手機 App／OS／SDK／探針版本與測試主機身份，結束關閉該測試安裝。畫面上 360 px 的桌面瀏覽器或 mocked provider（代用上下文）不能代替它。

通過才認為原生方向的必要能力可用；未驗前不開始產品碼或聲稱零切換可交付。若元件在手機無法送 RPC／執行 Confirm，或只能靠即時模型 prompt 才能造出測試，停止原生方案，依艦長已接受的備援回到 Bridge 三次入口，記具體失敗，不暗加宿主功能或改權限。

### 本輪核對的來源身份

仍使用上一節記錄的已安裝 bundle SHA-256 `5059c0952e69bd13319b9e0b6c7e78cfd48c13878ebb5744ed10ec4a44505cf4`。本次抽讀模組內容指紋：5351（原生 renderer）`570a5d7089b82bd54d74f70bb3f41c70cbeac85359f4bbe7db54b0a26a5c8887`；4608（RPC／Paseo provider）`8e43609d89d126a4e8602a775ea66cbfd0b1a09d0410318b8f6678cb716a4d7d`；5350（transformer）`21869cca1780e67bda552c788cbdc1ac45f4298e9231b53b956d5b136f603fcd`；5301（時間線投影）`d5c3ab96b5e12eaf0d0f669b2969ff5faa029e6255c72200d97f495906ba5fc1`。SDK contracts 的指紋及 d5 程式 SHA 已在既有來源記錄，未更動。

額外讀取的指定候選來源：`shared/chief.ts`（批次標記／查詢）、`shared/commander-replies.ts`（準備證據、attempts、回覆歸屬）、`shared/gate.ts`／`shared/decisions.ts`（精確 RPC 名稱）、`index.server.ts`（處理器接線）、SDK `client/rpc-context.*`／`client/paseo-context.d.ts`（上下文型別）。本輪只讀來源，未新增產品測試或再執行手機／元件操作；前兩輪探針維持原證據範圍。

## 推播入口修訂（設計總監第一輪後）

第一輪 AC-1 未滿足的原因成立：原稿把「點原生推播」直接當成可操作 Bridge 對話，少了入口證據。這一節取代原稿對入口的一次點按假設，先前階段報告原樣保留；不是改動推播或擴大權限。

### 查到的落點與既有路徑

只讀對象是本機 `/Applications/Paseo.app` 0.15.3（Info.plist 的版本），不是 Kent 手機安裝版本或即時 daemon；既有外掛仍只讀指定 d5 候選 `f40c340e8204f4b7dddef238f215aea3f3a6eaab`，其開發介面套件是 0.12.0。沒有啟動 App、瀏覽器、通知或代理回合。

1. 已安裝 `app.asar` 內 `node_modules/@getpaseo/protocol/dist/agent-attention-notification.js:133–138` 的代理通知 data 含 serverId／workspaceId／agentId／reason（主機／工作區／代理身份／提醒原因），不含 pluginId 或 screenId。`node_modules/@getpaseo/server/dist/server/server/push/push-service.js:18–21` 將同一 data 交給 Expo（原生推播傳送服務），沒有把代理通知改成外掛頁面。
2. 已安裝 `app-dist/_expo/static/js/web/index-803dd72b3aeeefd8a0cf2c30209668d4.js` 的共用模組 4937，`parseNotificationOpenTarget` 遇 serverId＋agentId 回傳 agent 目標；`createNotificationOpenRouter` 收到點按便呼叫 openAgent，沒有選 Bridge 的分支。模組 4972 的呼叫端把 openAgent 接到 `navigateToAgent({...target, pin:true})`。因此本案以**先進原生幕僚長對話**為入口，不能把共用路由當成能直接進外掛的證據；也不把桌面包中的共用來源冒作手機通知實測。
3. 同一 bundle 的選單控制使用 `shell.menu.open`／`shell.menu.close` 標籤；compact（窄螢幕）分支的 `toggleAgentListForLayout` 在 agent 與 agent-list（對話與側欄清單）間切換。這是從原生對話開側欄的一次選單操作來源，不是新外掛按鈕。
4. d5 `index.client.tsx:20–25` 已登記名為 Bridge 的側欄入口及 board 螢幕；`client/sidebar-waiting.tsx:9–10,30–35` 的 `enter` 呼叫 `openScreen(waitingDestination("comms"))`，帶 `screenId:"board", params:{item:"comms",request:...}`。`client/board.tsx:349–357,404–407` 收到 comms 直接顯示幕僚長；所以點 Bridge 後不必先進清單再找她。
5. 候選 `node_modules/@getpaseo/plugin/dist/client/contracts.d.ts:44–62,112–114` 已有 sidebar 的 openScreen 與 addScreen／addSidebarHeaderItem；[Paseo 正式外掛文件的螢幕與側欄章節](https://paseo.sh/docs/plugins/reference#screens-and-sidebar-items)也說明側欄元件開外掛螢幕。新批次仍放在該 Bridge 的 CoChat（幕僚長對話元件）呈現，沿同一 chief agentId 讀／寫，並非宣稱原生代理對話已支援本案問題欄和關卡 Confirm。

備援路徑是：點推播 → 她的原生對話 → 開側欄 → 點 Bridge → 她在 Bridge 的對話與提案批次。入口三次（推播、選單、Bridge），**無一次是授權送出**，也未開任何 FO 對話。這條路用現有宿主導覽與候選已用的外掛介面，不需要新 SDK 能力。原生推播直接開外掛不是本輪主張；「推播開原生對話後，在既有訊息元件處理」的能力已於艦長修訂 1 補查，仍須手機檢查。普通原生回話自動等同具名 Confirm 仍被禁止，不能藉新元件改掉。

前提與失敗：Bridge 在該主機已安裝／側欄顯示、主機在線且選對。入口列被使用者隱藏或停用時，不能宣稱三次可達，不自行改 Settings（應用設定）；若需主機選擇或捲動，把實際操作另列。推播失敗、來源不明、冷啟動未連線都不算已進入；沿用 Paseo 原生連線與推播，不建新提醒管道。本輪沒有查 Kent 的裝置設定。

### 有執行的限定探針與來源身份

用 Node 的 vm（隔離執行一段程式的標準模組）**只載入上述 bundle 模組 4937**，以虛構主機、工作區及幕僚長身份測試：通知 data 解析為 agent；一次虛構點按只呼叫 `openAgent({serverId:"fictional-host",agentId:"fictional-chief"})`，而非 host／terminal／外掛路由；完成後 acknowledge（確認已處理這次點按）一次。三個斷言通過，沒有執行完整 App、沒有發推播或訊息，沒有偽裝原生手機事件。若代理通知被改成外掛目標或無法到指定代理，此探針會失敗。它證明所查路由函式的行為，不證明真機抵達、側欄可見或完整點按旅程。

重現只需 Node 及同一已安裝 bundle：以換行 `__d(` 分隔模組，取包含 `e.createNotificationOpenRouter=function` 的定義，加回 `__d(`，用 vm 執行並提供擷取 factory 的 `__d`；只替換依賴 `buildHostRootRoute` 及 source／導覽埠為虛構函式，不載入其他模組。依序呼叫 `parseNotificationOpenTarget`、`router.start()` 及擷取的 subscribe 回呼，等待微任務後檢查 openAgent 參數與 acknowledge 次數。此限定檢查需 App 安裝檔，非外掛新機器隱含依賴，也不是日後外掛驗收必備工具。

內容指紋 SHA-256（核對實際檢查的位元組）：

| 來源 | SHA-256 |
| --- | --- |
| 上述已安裝 index bundle | `5059c0952e69bd13319b9e0b6c7e78cfd48c13878ebb5744ed10ec4a44505cf4` |
| 抽出的共用通知模組 4937 | `3c9ed2bf8cf5a8e9463d67addbd6eb6e1a2d6ea34fd47b617e7b85377be324a1` |
| ASAR 內 agent-attention-notification.js | `2bf44f8b2e21a2c7b0dd9b1de40d9540c1c635fbcd3c4291e6cff5df39e90f1b` |
| ASAR 內 push-service.js | `526aa321eadf4a3db0fd74c2e7eee747de0ae4f0291a2db2c4fffebf7799db00` |
| d5 index.client.tsx | `c61b344ee3a26e60de96e6ed1136ae30d28de6a03b8df9c8ed5f0c3d49d3d6e3` |
| d5 client/sidebar-waiting.tsx | `c2b642389b0fb2bc6c36f1cdd222a2a41343bb73ea47cd23eebdb8e15633e607` |
| d5 client/board.tsx | `f5977c37a4464b630afb0d4e5b2b77df9990f3a6d8b917426fbbe8dea97ef25e` |
| SDK 0.12.0 client/contracts.d.ts | `5a163ba92685cdd59916d9224675cee5bf94c18589c24c8519b5a0714df1ed69` |

正式文件於 2026-11-09 唯讀查閱；依 Paseo 說明技能先取 [llms.txt](https://paseo.sh/llms.txt) 及 [外掛參考 Markdown](https://paseo.sh/docs/plugins/reference.md)，網頁工具都回 unsupported text/markdown，shell 網路另有 DNS 拒絕，因此使用成功回傳的[正式 HTML 參考](https://paseo.sh/docs/plugins/reference)。文件只支持側欄開螢幕，不拿文件未說的通知落點補成事實；目前線上文件含比候選 SDK 新的 API，本案僅採已在候選型別與程式中出現的介面。

## 五種互動模型與算式

共同計數邊界（艦長修訂 1）：四件都在同一批、來源可讀，兩問題需要打字、兩關卡選准且無理由；處理後在同一幕僚長對話看進度。原生主方案入口是點推播 1 次，最後仍在原生對話；Bridge 比較方案／備援入口是推播、側欄、Bridge 共 3 次，最後在她的 Bridge 對話。兩處讀同一代理歷史但不是同一畫面，明確分開；前提是連線、外掛及該元件可用，Bridge 備援另需入口可見且主機正確。開鎖／App 冷啟動、主機切換、捲動、閱讀、字元鍵入、網路及模型等待另列未知；這是設計預算，不是真機測量。

| 模型 | 點按預算 | 離開她的對話 | 為何採／不採 |
| --- | --- | --- | --- |
| 現有逐件開目標 | Bridge 後：1 開 Board＋4 開目標＋4 返回清單＋2 問題聚焦＋2 問題送出＋2 選決定＋2 Confirm＋1 回幕僚長＝18；入口 3，從推播起 21 | 四次，八次進出 | 從側欄點 Bridge 起為 1＋18＝19，原 18 漏了最後回幕僚長；原生／外掛 FO 目標都需逐件切內容 |
| 共享輸入框先指定事項 | 原位 4 指定事項＋2 問題聚焦＋2 問題送出＋2 選決定＋2 Confirm＝12；入口 3，合計 15 | 0 | 輸入短，但換收件者是額外操作；錯選可能答錯題 |
| Bridge 逐件原位回答（備援） | 原位 2 問題聚焦＋2 原文轉達＋2 選決定＋2 Confirm＝8；入口 3，合計 11 | 0 | 綁定收件者與原問題，每件獨立明示，無總確認；元件不支援時採用 |
| 一則話拆整批 | 原位 1 聚焦＋1 問題合併送出＋2 選決定＋2 Confirm＝6；入口 3，合計 9，歧義核對另計 | 0 | 原始點按少，但要自行標兩題與收件者、再拆字句；不採自動拆裁定，不宣稱 9 次必能清完 |
| 原生對話逐件元件（主方案） | 原位 2 問題聚焦＋2 原文轉達＋2 選決定＋2 Confirm＝8；入口 1，合計 9 | 0 | 艦長修訂指定方向；少兩次入口，仍各自明示送出；待手機能力檢查 |

- 主方案原位 8 次中有 4 次各別授權（兩送出、兩 Confirm），不增加總送出。入口 1 次不是授權；假如問題有歧義，必須在她對話中澄清，9 次總數不再適用。
- 兩個關卡都要求修改：原位 8＋2 次理由欄聚焦＝10；原生入口 1 為 11，Bridge 備援入口 3 為 13。理由字元另計；可附條件的准也按實際聚焦次數增加。
- 將第四件關卡替換為權限：至少須從元件經既有具名 Bridge 路由開原生 FO，再由現有入口返回幕僚長；原生權限內部操作及回原生對話所需點按未驗，不套用 9 次或零 FO 切換。若走 Bridge 備援，已知操作預算為入口 3＋兩題 4＋一關卡 2＋開原生 FO 1＋側欄 Bridge 返回 2＝12，外加原生權限操作；側欄原已展開、主機選擇或捲動則按實況調整，不承諾不存在的返回鍵。
- 三個 30 分鐘單件例外不能硬併成一個四件批；本案只降低每批收到後的回答切換，不調整 d4 提醒門檻或把未知時點當新事件。

## 走查案例與反例

以下是文字設計走查，不是假稱已跑產品端到端：

| 案例 | 預期可觀察結果 | 可推翻設計的改動／觀察 |
| --- | --- | --- |
| 兩題兩關，一次入場 | 四件留她這裡，各送原文／Confirm；0 個 FO 目標切換 | 任一普通題必須開 FO 才能送出，AC-1 不成立 |
| 只答兩題 | 2／4 已送；未答兩關仍在，已送不當已結束 | 使用批次 responses 標記清掉四件，AC-1/2 不成立 |
| 打字、選准、取消 | 無對外送達；草稿與原因保留 | 沒按轉達或 Confirm 就送，AC-2 失敗 |
| 「可以，但先跟範例 FO 丙確認」 | 原句連原問題到指定 FO；條件不明不記錄 | 她改成無條件 approve 或自行問丙，越過明示授權 |
| 關卡換版 | 舊確認停用、保留稿、重讀具名新版 | 同名關卡直接套用舊稿，破壞版本綁定 |
| 權限 | 僅到具名 FO 的原生入口；不在此答批准／拒絕 | 她能用 respond_to_permission，違反既定規則 |
| 只收到送出確認 | 顯示已送給她，FO 尚無對應訊息不顯示轉達 | 把工具成功／模型一句話當已記錄，AC-2 失敗 |
| FO 記錄缺原話／編號 | 有記錄待核對，不冒稱這次已記錄 | 任何 recorded reason 一律綠燈，破壞既有狀態語義 |
| 失敗、離線、重開 | 未確認狀態明示，查詢不重送；未知草稿不承諾恢復 | 刷新自動再傳，或未知顯示完成，AC-2 失敗 |

`evidence/capability-probe.json` 記錄以指定候選純函式實際執行的既有關卡確認／理由／原話／送達狀態探針，不接即時服務。它只支持「所依賴的既有語義可重用」，不證明新原位回答接線或真機效果。`evidence/source-manifest.json` 保存讀取檔案的內容指紋；`evidence/package-checks.json` 保存流程檢查結果。

探針六組斷言實際通過；重現原始碼及 Node 的呼叫形狀在 `evidence/capability-probe-command.txt`，需指定候選 package.json 宣告的相依套件。首次以 tsx 命令列執行，因沙箱禁止其啟動本機 IPC（程序間通訊）管道而未進斷言，保留 `capability-probe-first-attempt.json`；改用 Node 載入同一 tsx 套件、無監聽管道的純函式執行成功，未啟用服務或擴權。

四個流程檢查均 exit 0：comment-ratio 為 0 程式／0 註解新增；doc-impact 為 0 個受影響產品文件；number-guards 無發現，因未宣告遷移路徑而略過遷移檢查；design-surfaces 只驗任務欄位及既有 preview 路徑可呈現，**不表示本輪 Step B 圖稿存在或已通過審查**。完整命令、輸出與基準都在 `package-checks.json`。

## 待設計總監審查與未證明部分

AC-1：第二輪已肯定入口文字，另因漏比原生元件方向而未滿足；艦長修訂 1 已選原生方向並多准一輪審查。現補原生能力來源、五種模型、入口 1／原位 8（理由再加 2）、三次入口備援及權限例外，等待這次設計總監審查，不自行判通過。AC-2：明列每類呼叫、來源綁定、原話／Confirm／記錄與不支援狀態。AC-3：DESIGN.md 保持一頁閱讀入口，唯一手機問題及不發 prompt／通知的隔離測法在本證據中；手機檢查尚未執行。Step B 的 360／1440 圖稿、review.html、內嵌圖 review-phone.html 全未開始，艦長的方向原話在任務 Amendment 1，沒有代寫新回答。

代價與未知只記在設計，不藉此擴案：更多縱向閱讀、每題仍須艦長明示、原生權限仍切出去；實體手機鍵盤、回來後的位置／草稿、跨重開逐題恢復、回執完整性、真推播及解除等待時間皆未驗證。未新增通知、排程、儲存或自動重試；未跑 RoboRev（程式審查工具），因無程式候選或程式變更。此任務的完成是交付 Step A，非產品交付或任務關閉。


## Step B：靜態圖稿交付，待設計總監審查

依 Step A 第三輪通過與 implementation-1-followup-3，已在 `../mockups/` 完成16態、每態360×780／1440×1000，共32張PNG。入口為原生幕僚長對話，只有備援態切Bridge；問題原位送出／已送／已轉達，具名關卡選擇／Confirm／必填理由／已記錄，權限去FO、半批、換版拒絕、原訊息備援與手機鍵盤示意均在 `states.json` 有對應。

主要審查入口是 `../mockups/review.html`；`review-phone.html` 內嵌全部16張手機圖。繪圖前 `ASSUMPTIONS.md`、繪圖後 `REVIEW.md` 及 `artifacts.json` 是本輪定義與實際位元組索引。精確檢查、來源HTML版本、圖像指紋、例外及重現方式均以該 `REVIEW.md` 與 `checks/` 為準，不在此另維護一份表。

最終證據含32張圖、44個成功空白profile工作階段（含前一輪保留36與兩態重拍／重驗8），無殘留profile、頁面腳本錯誤或CSP違規；全部file://、管道偵錯、全HTTP／HTTPS／WS／WSS（含localhost）封鎖。手機單檔實際在只有它的臨時資料夾逐圖載入成功。兩輪各六組離線檢查均過；產品流程四檢查exit 0，產品base=HEAD=91625588dff1b3e5737f6f6f8843b90d69468f32。

這只證明靜態圖稿、可視幾何、離線互動及檔案可攜性。原生外框與240px鍵盤都是明示的圖稿；沒有執行手機能力檢查、模型、真推播、外掛RPC、代理prompt、即時daemon、權限或正式關卡記錄，沒有產品程式／PR／發布。此處交設計總監審查Step B，不自行認定AC或艦長方向驗收通過。
