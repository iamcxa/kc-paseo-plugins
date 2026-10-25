---
title: Flywheel round 5 — the board and the gate card show only what they have checked
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r5-board-tells-the-truth
gates:
    version: 1
    records:
        - id: gate:r5-board-tells-the-truth:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r5-board-tells-the-truth-backlog-1
              briefing:
                id: briefing:r5-board-tells-the-truth:backlog:attempt-1:revision-1
                digest: sha256:7d35cfd5e1cff33d579cd939b02f3cb64bf83efff111fdc2b104843054d78f7c
                room-ref: ./r5-board-tells-the-truth/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r5-board-tells-the-truth:backlog:1
                briefing: briefing:r5-board-tells-the-truth:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-25T03:39:35.381809Z"
                decision: approve
                reason: 'Flywheel round 5 backlog gate under ADR 0008: theme chosen by the Captain in round 4 UAT; scope from chief-engineer triage with his screenshot findings; no persisted state, retry, Paseo request, security, permission, relay/recording semantics, release or merge change.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md (ADR 0008, merged by the Captain in PR #38, 78ce6c1c), Captain chat 2026-10-23'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-25T03:39:54Z
worktree: .worktrees/spacedock-ensign-r5-board-tells-the-truth
pr: 49
---

Round 5 of the POC flywheel under ADR 0008: the board can say "Nothing is waiting on you" before it has loaded or after a fetch failed, comms-officer questions are missed unless the compact Comms tab is open, and a gate card shows a recorded decision as a red "Briefing error".

Captain, 2026-10-25, round 4 UAT option answer for the next round: 「看板說真話 (Recommended)」 (option text: 載入／失敗狀態，空畫面只在成功載入後出現；任何分頁都偵測得到通訊官問題); most bothersome, in his words: 「手機版的 layout 還不算是很好用，ux 也不算是很直覺，例如 <- Bridge 常常會誤按，因為左上跟左中有兩個完全一樣的按鈕」; and his Android screenshots (「補圖」) showing "Briefing error — This gate has no open briefing now." right after his decision was recorded.

bite: at 3d1f176c (PR #46, his live install), `reviews` starts as `[]` and `readReviews` failures are swallowed in `client/board.tsx`, so "Nothing is waiting on you" and "By decision · 0" show while loading or after a failure; question detection (`onAsk`) lives in the tab-mounted `CoChat`, so on the compact FOs tab a comms-officer question is not detected; `DecisionCard.load()` sends `briefingId` from a `briefing` that starts as `null`, so a card opened after the gate closed gets "This gate has no open briefing now." (chief-engineer reading, 2026-10-25); his screenshots show the card's "← Bridge" stacked under the host header's.
consumer: the Captain, deciding from the Bridge.

## Scope

- Board load and failure (chief-engineer): track loaded/failed per source — the FO list (`observeBoard`), gates, reviews and the comms-officer timeline; a source with nothing to fetch counts as loaded; a failure clears on the next success; the `readReviews` failure is shown. One pure function returns "Loading…", "Could not check <source> — this list may be incomplete", or "Nothing is waiting on you", and the toggle count uses it too. First confirm `observeBoard` sends a first snapshot when there are no FOs.
- Question detection on any tab: a `useCoAsk(coId)` hook in `client/bridge.tsx` takes over the timeline subscription, refetch, turn tracking and `nextStepIsCaptains`; the `onAsk` effect and prop leave `client/co-chat.tsx` (one writer). No hidden mounted `CoChat`. The round 3 draft store and the round 4 keyboard hook are not touched.
- Recorded decision is not an error: first confirm the cause on a closed relay gate. Then the server returns the latest resolution for that stage as `recorded` when no attempt is open (`findLatestResolution` beside `findResolution` in `shared/gate.ts`); a gate not open with nothing recorded shows a neutral "no longer open", not red; returning from a card that saw `recorded` refreshes gates once.
- Ride-along (chief-engineer, one string): the card's back control reads "← Queue" instead of "← Bridge"; the host header is untouched and the control stays.
- POC boundary: no persisted load/ask state or "last good" queue, no retry or backoff, no new background job or server cache, no workflow-state write from the card, no Paseo request.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): fourth stack layer on `spacedock-ensign/r4-phone-layout` at 3d1f176c; Draft PR with that base; nothing merges.
- Non-goals: the Gboard keyboard-height overlap, 320 px rows, the phone-tab case, keyboard-open tab switching, design-partner laters, briefing language, virtual office.

## Acceptance criteria

**AC-1**: The board never claims "nothing waiting" without having checked.
Verified by: tests of the empty-state function for loading, reviews failed, and all loaded and empty, failing when the old `queue.length === 0 && !coAsk` condition is restored; the toggle count uses the same function.

**AC-2**: A recorded decision shows as recorded.
Verified by: a `gate.test.mts` case where a closed attempt with a resolution, read without a `briefingId`, returns `recorded` and no error; a gate not open with nothing recorded shows a neutral state.

**AC-3**: A comms-officer question shows on either tab.
Verified by: a runtime check at compact width with the FOs tab shown: the comms officer asks, and the question row appears without opening the Comms tab.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 4 UAT; scope from chief-engineer triage recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.


## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto the previous stack layer (git reset --hard 3d1f176c0ca1fa8d266c5793c91a93c6c1a82c9e, branch spacedock-ensign/r4-phone-layout) and confirm HEAD; confirm observeBoard sends a first snapshot with no FOs, and confirm the red "Briefing error" cause on a closed gate (read-only) before fixing; report both
  Reset/HEAD confirmed at 3d1f176c before edits; evidence/implementation/baseline-empty.log records the first []; baseline-relay.json records a closed relay gate failing without briefingId but returning its resolution with it, read-only before repair.
- DONE: Per-source loaded/failed state and one pure empty-state function used by the empty text and the By decision count, with tests that fail when the old queue.length === 0 && !coAsk condition is restored (AC-1); server returns the latest resolution when no attempt is open via findLatestResolution, neutral "no longer open" when nothing is recorded, one gate refresh on return, with a gate.test.mts case (AC-2)
  a3674e14595c7830e95de43d6d935c2496832c12; final-empty proves loading/failure/success; red-old-empty-condition restores only that predicate and fails the same UI assertion; gate.test.mts rejects the old no-ID error; final-gate observes recorded/neutral states and exactly one fresh read on recorded return.
- DONE: useCoAsk(coId) in client/bridge.tsx takes over question detection and onAsk leaves client/co-chat.tsx, with a runtime check at compact width on the FOs tab (AC-3); the card's back label reads "← Queue"; npm test and typecheck pass; branch pushed and a Draft PR opened with base spacedock-ensign/r4-phone-layout (fourth stack layer)
  final-empty/question-on-fos-380.png shows a controlled coordinator question at 380 px with no chat/textarea mounted; final-gate shows ← Queue; 105 tests and typecheck pass; pr49.json pins OPEN/Draft PR #49 on the required base and exact pushed candidate.

### Summary

Built the bounded POC board/card repair at a3674e14595c7830e95de43d6d935c2496832c12 and opened Draft https://github.com/iamcxa/kc-paseo-plugins/pull/49 on the fourth stack layer. Load/ask state stays in memory; the coordinator SDK timeline is a controlled test boundary, and no real provider turn or Android device behavior is claimed.

### Findings

Evidence root: r5-board-tells-the-truth/evidence/implementation/; README.md gives reproducible commands, falsifiers and limits; final-empty/, final-gate/ and matrix.json pin the delivered candidate. Diagnostic runtime-* receipts ran before the code commit and are not exact-head evidence.

Checks: tests-final.log = 105 passed; typecheck-final.log = exit 0. The CLI-source test fails if gate errors are swallowed or fresh reads reuse the old cache; gate.test.mts fails if no-ID recorded/neutral reads regress; the rendered negative test fails after restoring the old empty predicate.

Comment ratio: 168 code lines, 0 comment lines, 0.0% <= 5%, exit 0. doc_impact: zero documents listed; spacedock-bridge/OVERVIEW.md updated for the visible changes. No ADR or migration added/changed; ADR lint seven records, zero legacy; ADR 0008 read Accepted at stack base, digest in evidence README.

SKIPPED: design_surfaces.py exit 1 is known package gap 2 (POC task asked for five-stage-only Surfaces/Visible change); task and workflow retained unchanged. number_guards.py exit 0, PASS, base e55cb332ceec/head a3674e14595c/merge-base 78ce6c1cbcf1; migration guard skipped because no migrations-path is declared; no R4 failure occurred (known gap 3 not triggered).

RoboRev not run: package gap 5; FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/extensions/roborev/roborev_gate.py on pushed a3674e14595c7830e95de43d6d935c2496832c12 with base 3d1f176c0ca1fa8d266c5793c91a93c6c1a82c9e. Independent validation and gate approval remain FO work, not an implementation claim.

Cleanup: all captured proof PIDs stopped and homes/profiles removed; safety-checks.json verifies the retained cleanup receipts, unchanged round-3 draft files/round-4 keyboard hook, and clean main/live-install worktrees. No persisted load/ask state, last-good queue, retry/backoff, background job, new server cache, workflow-state write, new dependency or POC boundary introduced; no ready, merge, release or live-install action taken.

No task-level elapsed budget was recorded; final proof processes completed inside their 180-second caps. Remaining proof: independent validation, FO local review gate and Captain tryout; screenshots establish browser rendering with a synthetic SDK timeline, not a real coordinator/provider conversation or native Android behavior.


## Stage Report: implementation (cycle 2)

- DONE: roborev:1158 first finding: in client/use-co-ask.ts the working flag is derived from the refreshed timeline status after every refetch (including the reconnect refetch), so a turn that finished while disconnected no longer hides its question; a test for a completed turn found only by the reconnect refetch
  990ea8b7ed79cf0d80b4bfa251681aae61b6a157; co-ask.test.mts mounts the actual hook and restores the subscription without completion/handle notifications: the refetched idle status reveals the question; the old code fails this assertion (evidence/cycle-2/red-behavior-tests.log).
- DONE: roborev:1158 second finding: in server/tasks.ts the fresh gate read also updates the snapshot cache, so a gate removed by a recorded decision does not reappear from the old snapshot within the cache lifetime; a test for fresh read then cached read within 30 seconds
  gate-sources.test.mts reads fresh then cached immediately: the removed gate stays absent even after the CLI fixture is changed to fail; the old code revives Old gate and fails the same assertion. The existing cache-update path is reused.
- DONE: npm test and typecheck pass; push to PR #49 (still Draft); a short "## Stage Report: implementation (cycle 2)" section
  evidence/cycle-2/tests.log: 106 passed; typecheck.log: exit 0; pr49.json pins OPEN/Draft PR #49 at 990ea8b7ed79cf0d80b4bfa251681aae61b6a157 on spacedock-ensign/r4-phone-layout; branch pushed.

### Summary

Repaired both authorized roborev:1158 findings with failing-before/passing-after tests. The repaired head is pushed to Draft PR #49; independent validation and the FO review gate remain pending.

### Findings

Evidence: r5-board-tells-the-truth/evidence/cycle-2/README.md, red-behavior-tests.log, tests.log and checks.json. Comment ratio: 8 code lines, 0 comments, 0.0%, exit 0; 5% threshold not enforced below 20 code lines. Document impact: zero listed documents; OVERVIEW.md unaffected because its visible behavior claims still apply. Number guards PASS; no R4 failure, ADR or migration change; ADR lint seven records, zero legacy.

SKIPPED: design_surfaces.py exit 1, known package gap 2 (POC asked for five-stage-only fields). RoboRev not run: package gap 5; FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/extensions/roborev/roborev_gate.py on pushed 990ea8b7ed79cf0d80b4bfa251681aae61b6a157.

Safety/limits: protected draft and keyboard files unchanged; candidate/main/live worktrees clean (safety-checks.json). No new dependency, persisted state, cache, background job, retry or POC boundary; no real daemon/browser was launched this cycle, and fixture teardown removes temporary roots. Mounted-hook/server proof uses controlled SDK/CLI inputs, not an actual reconnect/provider turn, native-device result or a new browser run.


## Stage Report: implementation (cycle 3)

- DONE: roborev:1160 first finding: the FO source counts as loaded only after every per-FO question read it started has settled; a failed per-FO timeline read marks the FO source failed ("Could not check …"), never a false empty; tests for a pending and a failed per-FO read
  22040541b15ea147a43db9d7d77ac377ec127726; fo-source.test.mts holds two reads pending, proves the first completion cannot mark loaded, then observes the question after both settle; a failed read keeps a healthy question and reports incomplete until a later successful snapshot. Parent false-empty assertions fail in evidence/cycle-3/red-tests.log.
- DONE: roborev:1160 second finding: a failure in one workflow directory no longer rejects the whole gate or task read — read each workflow independently (e.g. Promise.allSettled), keep the successful workflows' gates and tasks, and report only the failed ones so the board shows "Could not check gates for <workflow>"; tests with one healthy and one removed workflow directory
  gate-sources.test.mts retains the healthy workflow gate and task while reporting only the removed workflow; board-empty.test.mts names that failed path with a partial count. Aggregate rejection breaks the mixed-workflow test; the existing fleet tool keeps explicit errors instead of silently presenting partial data as complete.
- DONE: npm test and typecheck pass; push to PR #49 (still Draft); a short "## Stage Report: implementation (cycle 3)" section
  evidence/cycle-3/tests.log: 110 passed; typecheck.log: exit 0; pr49.json confirms OPEN/Draft #49 at pushed 22040541b15ea147a43db9d7d77ac377ec127726 on the required fourth-layer base.

### Summary

Repaired both authorized roborev:1160 findings: the FO source waits for question reads, and workflow failures preserve other workflows’ gates/tasks while identifying only failed directories. The repair is pushed to Draft PR #49; independent validation and FO review remain pending.

### Findings

Evidence: r5-board-tells-the-truth/evidence/cycle-3/README.md, red-tests.log, tests.log, checks.json and pr49.json. Parent tests show false empty states and aggregate rejection; current tests exercise the actual observer, queue/empty-state functions and server handlers. The existing fleetSnapshot consumer preserves its explicit error contract for incomplete results.

Comment ratio: 91 code lines, 0 comments, 0.0% <= 5%, exit 0. Document impact zero listed documents; spacedock-bridge/OVERVIEW.md updated for unread-question settlement and independent workflows. Number guards PASS; no R4 failure, ADR or migration change; ADR lint seven records, zero legacy.

SKIPPED: design_surfaces.py exit 1, known package gap 2 (POC asked for five-stage-only fields). RoboRev not run: package gap 5; FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/extensions/roborev/roborev_gate.py on pushed 22040541b15ea147a43db9d7d77ac377ec127726.

Safety/limits: protected draft/keyboard files unchanged; candidate/main/live worktrees clean (safety-checks.json). No new dependency, persisted state, last-good queue, server cache, background job, retry/backoff or POC boundary; fixtures are torn down and no daemon/browser launched. Controlled SDK/CLI proof does not claim a real provider turn, native rendering, current browser proof, gate approval or deployment.
