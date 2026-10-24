# L3 dogfood: spacedock-bridge POC gates — round log

Experiment under ADR 0011 (kc-dev-flow-2) L3, adopter kc-paseo-plugins, workflow docs/dev2-poc.
Captain approval of the design, 2026-10-23: 「同意，就用這個方式。但改成每一輪摘要寫到一個 dev2 fo 可以存取的地方，不要讓它一直被你們打斷」
Reader: the kc-dev-flow-2 maintainer FO reads this file when it chooses; the Bridge FO appends one section per round and sends no per-round message.

Granted classes (in force only after the grant ADR merges): (1) spacedock-bridge POC backlog gate; (2) POC validation gate with no Material finding; (3) merge and plugin reload after an approved validation.
Window: 10 rounds or 2 weeks, whichever first. Demote a class to L0 on any reversal or observer violation on a conn-recorded gate. Promote to a package ADR only with at least 5 decisions per class, 0 reversals, 0 violations. Drop if two classes demote, or if UAT keeps catching what validation missed at the pre-grant rate.

Working rule: UAT probing and triage. Captain, 2026-10-23: 「就這樣做」, answering the question "Do you want to adopt this UAT and triage flow?" after this was presented:
- At each UAT, after the UAT card, FO asks at most three option questions (AskUserQuestion): one per change ("is this what you wanted"), one on what bothers him most (options mined from validation limits, roborev polish, open gaps, plus his own words), one on what to fix next.
- His words, his option answers and his screenshots go into "Next-round candidates" in that round's section, each with its source.
- Between rounds: two picky-user personas on different models, Astra for a concrete approach and cost per candidate, and chief-engineer for order by value and size; FO then picks the next theme under the grant and writes why in the round section.
- Cost of triage is recorded per round; if too high, triage drops to every other round.

Per-round section format:
## Round N — <date> — <task slug>
- Gates: <gate> by <actor>, ledger row <...>
- UAT (Captain, <date>): OK | feedback | revert — 「<his words>」
- Overrides: <none | Override lines>
- UAT caught, validation missed: <none | items>
- Observer: <result>
- Cost: Captain messages <n>, worker tokens <n>
- Package gaps: <none | items>
- Next-round candidates: <item — source>
- Triage: <roles run, their ranking, theme picked and why, cost>

## Round 0 — 2026-10-23 — bootstrap (l3-grant-adr, gates still the Captain's)
- Gates: none recorded under the grant (the grant is not in force until ADR 0006 merges).
- Package gaps found while writing the grant:
  1. README (Gate decisions) says "Authority, a gate approval, a merge … are always asked, whatever an ADR says", while kc-dev-flow-2 ADR 0011 L3 grants a decision class by ADR. Resolved locally by a Captain-authorized exception in ADR 0006 (「授權」, 2026-10-23); the package should reconcile the two (roborev:1101).
  2. `design_surfaces.py check` requires `Surfaces:` and `Visible change:` on every task, but README (backlog) asks for them only "on the five-stage route"; every POC task here fails it (seen on board-next-decision-first, review-ids-and-decision-card, l3-grant-adr).
  3. `number_guards.py check` fails R4 when a task lands an ADR without an `ADR:` reservation line, but README (Number guards, POC bullet) says a POC task "reserves no number"; a POC task that writes an ADR cannot pass both (l3-grant-adr, ADR 0006).
- Dispatch note: first Codex ensign dispatched from the Claude FO via `spacedock dispatch build --host codex` plus Paseo `create_agent` (codex/gpt-6.1-sol, high, auto-review): it read the dispatch file, committed, pushed, ran roborev and wrote its stage report; completion arrived as Paseo's finish notification (no SendMessage on Codex).

## Pre-grant baseline — 2026-10-23 — review-ids-and-decision-card (PR #34, gates the Captain's)
- UAT (Captain, 2026-10-23): feedback — 「可以按的東西應該要有 hover 高亮反應之類的提示？」 and 「本輪有個問題，但不是真的很嚴重，就是gate briefing 可以是中文嗎？目前應該是讀取檔案來的對嗎？所以理論上都是英文？以及，我覺得可能要可以區分 FO 是否已經 inactive 例如已經把 tab 關閉。此外，輸入pan 也要hover高亮，三個決策按鈕應該要有某種區分？截圖二裡面的 FO 跟圖三的為何差異那麼多？我意思是 by descision 跟 by FO 有差異」
- UAT caught, validation missed: no hover/press feedback on clickable elements and the composer; the three decision buttons look alike; one-line rows do not say which FO; an FO's question is dropped from By decision when the same FO also has a gate (buildQueue adds an ask only when the FO has no gates). Not a validation miss: briefing language (English by repo convention), inactive FOs (already filed as fleet-hides-closed-fos).
- Cost: not measured for pre-grant tasks.

## Round 1 — 2026-10-23 — r1-hover-and-row-owner (PR #37, merged e4f95aee)
- Gates: backlog by agent:first-officer (class 1), validation by agent:first-officer (class 2), both with conn quote and source ADR 0006; ledger rows `amended_after: 0`, `override: null`. Merge and reload by FO (class 3).
- UAT (Captain, 2026-10-23): feedback — option answers: changes that are what he wanted 「hover／按下反應, 三個決策按鈕分色, 列顯示 FO 名」 (not ticked: 「問題不再被吃掉」); most bothersome 「關閉的 FO 分不出來」; next 「區分關閉的 FO (Recommended)」. Words: 「這個奇怪的綠色框線可以移除嗎？輸入文字後才出現的」
- Overrides: none (his next-round choice matched FO's recommended option).
- UAT caught, validation missed: a rectangular focus outline on the composer text input after typing (validation-1 of PR #34 noted it as Polish; round 1 validation did not re-flag it). Unconfirmed: whether a gate-plus-question FO now shows its question for him (not ticked; check at next UAT).
- Observer (codex gpt-6-astra, window 0554569..65f35b4): 3 violations. (1) High, README Delivery authority "Where `learn` is listed, the sentinel waits for a committed observer report": the task was archived (12:27:14Z) before any observer report — class 3. (2) Medium, FO steps: review findings step 5 and roborev Limits "this local gate never is": the validation gate summary counted two local roborev runs as review rounds — class 2. (3) Medium, step 2 "preserve worker reports and verdicts": FO had the worker re-mark a FAILED roborev line SKIPPED — implementation handling feeding class 2. Can't tell: `delivery_gate.py check` before the merge ask (no record).
- FO's own check after the observer: the `codex` extension says merge is not asked for until Codex's verdict on the head; FO never read it. `codex_review.py` now reads clean on #34–#37, but #37 merged before its Codex summary (12:28:43Z); the same pattern let PR #31 merge three minutes before Codex's P1 security finding. FO never ran `delivery_gate.py check` on any of these PRs — class 3.
- Consequence under ADR 0006 as written: classes 2 and 3 drop to L0; two demoted classes meet the drop rule. Brought to the Captain for his ruling.
- Cost: Captain messages for this round: 2 (UAT screenshot message, option answers); worker tokens not measured (Codex agents via Paseo report no token totals to FO).
- Package gaps: none new.
- Next-round candidates: distinguish closed FOs — Captain (UAT option); remove the composer focus outline — Captain (UAT words); confirm the kept question shows — FO (unticked option); briefing language — Captain (earlier UAT); label-less question with a gate, iOS VoiceOver grouping — roborev:1107 declines; scroll position after expanding earlier messages — validation PR #34; virtual office — Captain idea.
- Triage: theme chosen by the Captain's answer (distinguish closed FOs); FO adds the focus-outline fix to the same round because it is small and his own words. Per the working rule, triage runs before round 2's backlog: two picky-user personas (codex gpt-6-astra and codex gpt-6.1-sol, from round 1 screenshots and code), Astra for approach and cost, then chief-engineer for order. Results recorded under Round 2.

## Grant change — 2026-10-23 — ADR 0006 superseded by ADR 0008 (POC flywheel)
- Captain's ruling on the round 1 demotion: instead of A/B/C he reframed the experiment (words in ADR 0008, Words 1–6) and approved the 「POC 堆疊版」; ADR 0008 (PR #38, merged by him, 78ce6c1c) supersedes ADR 0006, so the round 1 demotion and drop rule are replaced, not applied.
- Flywheel terms: rounds stacked as unmerged PRs; FO records backlog and validation gates after its team is satisfied; FO may push round branches and open stacked PRs (amendment 1: 「可以，我授權你在飛輪過程中推送及開 ＰＲ」); never merges; 10 rounds or 2026-11-06; round tasks stay at approved-awaiting-merge until a stack ending exists.
- Observer on flywheel-grant-adr (Captain-gated task, not a flywheel round): 5 violations — empty `id`; Codex models without a recorded exception in dispatch records; bare "adr_lint" in two follow-ups; no external-review round count in the merge ask; design_surfaces replay (package gap 2). Report: flywheel-grant-adr/observer-1.md.
- Process repairs (from the next dispatch): Model lines quote the Captain's model ruling; package scripts by absolute path only, grep for bare stems before committing; merge/stack asks carry "External review rounds: N"; FO runs roborev itself (Codex workers in auto-review could not reach the roborev daemon).
- Package gaps for the dev2 FO: (4) no "delivered to the stack" terminal for unmerged POC rounds; (5) Codex auto-review sandbox cannot reach the roborev daemon, so roborev_gate reports incomplete inside Codex workers; (6) `spacedock new` leaves `id:` empty here while the README schema asks to record `id` — which is right?

## Round 2 — 2026-10-23 — fleet-hides-closed-fos (PR #40, stack layer 1, unmerged) — in progress
- Gates: backlog by agent:first-officer under ADR 0008 (attempt-1 withdrawn by FO before decision to change the first step to a read-only label read; attempt-2 recorded). Validation gate not yet recorded.
- Team before the gate: design partner SATISFIED twice; picky users A and B NOT SATISFIED on 03b96fb ("Closed" reads as finished; badge lost in the decision card), SATISFIED on e91b9755 after repair; validation-1 canceled by FO (head changed), validation-2 PASSED on e91b9755; FO reran its five-step acceptance script, all PASS. Roborev by FO: 1123 Low repaired, 1126 clean, Medium on 713ae00f repaired, Medium on e91b9755 (320 px) FO-declined as Deferred risk; FO stopped squeezing the one-line row a third time.
- Observer (pre-gate, window 86f386e..1050803): 3 violations — Low: task `id` empty (package gap 6; FO set `id` via `spacedock status --set`); Medium: implementation dispatch told the worker to push and open a Draft PR without quoting the Captain's push/PR grant (amendment 1 of flywheel-grant-adr); Low: design_surfaces replay (package gap 2). New classes, not recurrences of round 1's repaired classes.
- Process repair: every dispatch that pushes or opens a PR quotes 「可以，我授權你在飛輪過程中推送及開 ＰＲ」 (flywheel-grant-adr amendment 1, ADR 0008) beside the instruction.
- Stop check: ADR 0008 stops the flywheel "when observer violations occur in two consecutive rounds"; round 1 (under ADR 0006) and round 2 both had observer violations. ADR 0008 does not say whether round 1 counts. FO stopped and asked the Captain before recording round 2's validation gate.
- Captain's ruling on the stop check (2026-10-24): 「繼續」, answering 「你同意嗎？」 after the recommendation "繼續第 2 輪，並且把規則訂清楚：「連續兩輪」只算 ADR 0008 生效之後的輪次". From here, "two consecutive rounds" counts only rounds under ADR 0008; round 2 is the first.
- Delivery: validation gate by agent:first-officer under ADR 0008; PR #40 marked ready and titled "[flywheel, do not merge] …"; Codex summary:6377992572 clean on e91b9755 (External review rounds: 1); the Captain's paseo-spacedock-bridge reinstalled from worktree .worktrees/flywheel-live at e91b9755 (Plugin ready, fleet port 6787 held by it); the task stays at approved-awaiting-merge (stacked, not merged).
- UAT (Captain, 2026-10-24): feedback — option answers: what he wanted 「Tab closed 標記對了, 輸入框沒有方框, 關／開分頁會跟著變」 (not ticked: 「手機開著就不算關閉」); most bothersome 「看板可能說謊」; next 「回覆清楚又安全」.
- Overrides: Override: next-round theme — FO recommended 「看板說真話 (Recommended)」, the Captain chose 「回覆清楚又安全」.
- UAT caught, validation missed: none new; unconfirmed: the phone-tab case (not ticked).
- Cost: Captain messages this round: 2 (「繼續」, option answers); worker tokens not measured.
- Next-round candidates: reply clear and safe (reply target visible; draft kept across items/tabs) — Captain's choice; board tells the truth (loading/error states; question detection on any tab) — Captain's most bothersome; confirm the phone-tab case — FO (unticked); two-line name limit, drop row age before title — design partner; 320 px two-line rows — roborev decline; briefing language; virtual office.
