---
title: Flywheel round 3 — a reply shows where it goes, and an unfinished draft survives switching items or tabs
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r3-reply-clear-and-safe
gates:
    version: 1
    records:
        - id: gate:r3-reply-clear-and-safe:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r3-reply-clear-and-safe-backlog-1
              briefing:
                id: briefing:r3-reply-clear-and-safe:backlog:attempt-1:revision-1
                digest: sha256:571e6bcca15d79dade79898c2bb0fa42af0f1d23d7972fb3edd31183533f9247
                room-ref: ./r3-reply-clear-and-safe/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r3-reply-clear-and-safe:backlog:1
                briefing: briefing:r3-reply-clear-and-safe:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-24T01:23:15.180261Z"
                decision: approve
                reason: 'Flywheel round 3 backlog gate under ADR 0008: theme chosen by the Captain in round 2 UAT; scope from chief-engineer triage; memory-only drafts stay inside the POC boundary; no security, permission, relay/recording, release, outward or merge change.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md (ADR 0008, merged by the Captain in PR #38, 78ce6c1c), Captain chat 2026-10-23'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-24T01:23:34Z
worktree: .worktrees/spacedock-ensign-r3-reply-clear-and-safe
---

Round 3 of the POC flywheel under ADR 0008: the Captain chose 「回覆清楚又安全」 — the composer should say where a reply goes, and a half-typed reply should not vanish when he opens another item, goes back, or switches tabs.

Captain, 2026-10-24, round 2 UAT option answer for the next round: 「回覆清楚又安全」 (option text: 看得出回覆送給誰；打到一半的內容不會不見). Earlier picky-user findings it answers: "One reply box has two different meanings" and "Checking another item loses my unfinished reply" (round 1 triage, `_l3-dogfood/rounds.md`).

bite: at e91b9755 (PR #40, the Captain's live install), each `CoChat` holds its draft in component state; opening a gate card and pressing back unmounts that card's chat and drops its draft; in the compact layout switching tabs unmounts the comms officer chat; `Bridge`'s `onAskCo` seed replaces a non-empty comms officer draft; the ↑ button does not say it sends to the FO while the chips go through the comms officer (chief-engineer reading of `client/co-chat.tsx`, `client/bridge.tsx`, `client/decision-card.tsx`, 2026-10-24).
consumer: the Captain, replying and deciding from the Bridge.

## Scope

- Draft store: a module-level in-memory `Map` (like `sentByBriefing` in `client/decision-card.tsx`), keyed by `agentId` plus gate `slug:stage`, or `agentId` alone without a gate; not keyed by briefing id (a new briefing keeps the draft, as `beforeSend` promises). `CoChat` starts from the stored draft and updates it on every keystroke; the entry clears where `composerHandlers` already clears the draft (successful send or decision) and stays on a refused one.
- The comms officer seed (`onAskCo` prefill) keeps an existing non-empty draft instead of replacing it.
- Labels: beside ↑, that it sends to the FO by name (e.g. "↑ sends to <FO name>"); the decision row keeps "Decide via comms officer". Decision logic (`decideGate`, claim/release, relay text) is unchanged.
- POC boundary: drafts in memory only — no localStorage/AsyncStorage, server call or file; a plugin or app reload drops them, a stated known limit.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): second stack layer, branch based on `spacedock-ensign/fleet-hides-closed-fos` at e91b9755, Draft PR with that branch as base; nothing merges.
- Non-goals (chief-engineer): moving question detection (`onAsk`) or the timeline out of `CoChat`, board loading/error states (board-trust round); phone-tab case, two-line names, 320 px rows, briefing language, virtual office.

## Acceptance criteria

**AC-1**: Drafts are kept per target and never leak.
Verified by: `npm test` with store tests: a draft for gate A is not seen for gate B or another FO; a draft survives a simulated remount; it clears after a successful send or decision and stays after a refused one; the seed does not overwrite a non-empty draft; `npm run typecheck`.

**AC-2**: The Captain can see where a reply goes, and drafts survive in the screens.
Verified by: isolated-daemon walk with screenshots: wide layout — type in gate A, back, open gate B (empty), return to A (draft present); compact layout — type in each tab, switch, both present; the ↑ label names the FO and the decision row names the comms officer.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 2 UAT; scope from chief-engineer triage recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto the previous stack layer (git reset --hard e91b9755a0c3444ebf4390f5396499ddf2070457, branch spacedock-ensign/fleet-hides-closed-fos) and confirm HEAD; then the in-memory draft store keyed by agentId plus gate slug:stage, cleared where composerHandlers clears, with the AC-1 store tests and typecheck
  Reset clean dispatch branch to e91b9755a0c3444ebf4390f5396499ddf2070457 before edits; candidate dae9b002dd8360fccfd92ad52385c4fa4d2b4316; r3-reply-clear-and-safe/evidence/implementation-cvtdyuot/tests-final.log: 84/84 and typecheck-final.log: exit 0. Six store tests fail on key isolation/remount/seed or successful/refused composer-clearing regressions.
- DONE: The comms officer seed keeps a non-empty draft, and labels name where ↑ (the FO by name) and the decision row (the comms officer) deliver, with decision logic unchanged; isolated-daemon walk screenshots for AC-2 (wide: gate A, back, gate B empty, back to A present; compact: both tabs keep drafts)
  r3-reply-clear-and-safe/evidence/implementation-cvtdyuot/candidate-14: A typed → B empty → A restored at 1440px, both 520px tabs restored, named FO send and comms officer decision labels; baseline-1 loses A. Existing composer assertions fail if delivery arguments change; source changes leave decideGate, claim/release and relay logic unchanged.
- DONE: Branch pushed and a Draft PR opened with base spacedock-ensign/fleet-hides-closed-fos (second stack layer), PR body stating the known limit that drafts are lost on plugin or app reload
  https://github.com/iamcxa/kc-paseo-plugins/pull/42; pr42.json: OPEN, isDraft=true, base spacedock-ensign/fleet-hides-closed-fos, head dae9b002dd8360fccfd92ad52385c4fa4d2b4316; body explicitly states plugin/app reload loses drafts.

### Summary

Added memory-only drafts per agent/gate/stage, preserved non-empty comms drafts when seeded, consumed seeds once, and named send recipients. The exact candidate is pushed as the second unmerged stack layer; independent validation and the FO-owned RoboRev gate remain pending.

### Findings

Evidence and rerun instructions: r3-reply-clear-and-safe/evidence/implementation-cvtdyuot/README.md; final scoped runtime walk passed, with screenshots visually inspected; no message or decision sent. Native appearance, live installation and Captain acceptance remain unverified.

The extra reload probe in attempt 13 timed out at host navigation after the required walk had passed; candidate-14 is the completed scoped walk. Earlier harness selector/drawer/animation and input-generation failures are retained as diagnostic evidence, not acceptance screenshots; the final walk uses normal product tab/pointer/input events and DOM clicks only to enter through the outer host drawer.

checks-final.json: comment_ratio PASS (39 code, 0 comments, 0.0%, maximum 5%); doc_impact returned 0 documents; OVERVIEW.md updated directly; adr_lint PASS (7 records, 0 legacy). No ADR/migration added or reserved; number_guards PASS with no R4 finding (known package gap 3 not needed).

design_surfaces: SKIPPED, known package gap 2, approved POC seed lacks Surfaces/Visible change markers. RoboRev: SKIPPED, known package gap 5; FO runs the pushed candidate with base e91b9755a0c3444ebf4390f5396499ddf2070457. Scripts ran from the loaded Codex 0.28.0 absolute package root per stage-definition precedence; its location and all command outputs are recorded in checks-final.json.

ADR 0008 read at e91b9755a0c3444ebf4390f5396499ddf2070457, Accepted; SHA-256 d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f. No new enduring decision or POC boundary crossing; drafts use only a module Map and are lost on plugin/app reload.

All captured isolated daemon PIDs and temporary roots checked absent; final cleanup.json plus late-browser-cleanup.json record cleanup. Code worktree, main and flywheel-live were clean after proof; no live daemon, ready/merge/release action or Release PR #18 mutation occurred.

## Stage Report: implementation (cycle 2)

- DONE: roborev:1131: a send that completes after a remount must not clear a newer draft — clear the stored entry only when it still holds the exact text that was submitted (compare-and-clear), so an edit made after the send survives; add a delayed-send regression test (send, remount, edit, send completes, draft kept) and keep the existing store tests passing
  Candidate 9bc63dc40ce2a8ed83c7e365c4ecbdcd5d544959 reads the live store and compares raw submitted text before clear; cycle-2/regression-red.log shows all four delayed send/decision cases fail before repair, tests.log passes 88/88 after repair; unconditional clearing or trimmed equality would fail them again.
- DONE: npm test and typecheck pass; push to the same branch (PR #42 stays Draft, base spacedock-ensign/fleet-hides-closed-fos); a short "## Stage Report: implementation (cycle 2)" section
  cycle-2/typecheck.log exits 0; cycle-2/pr42.json verifies OPEN Draft PR #42 at 9bc63dc40ce2a8ed83c7e365c4ecbdcd5d544959 with unchanged stack base and reload-limit disclosure. Existing store/composer tests remain green.

### Summary

Fixed the late-completion race using compare-and-clear against the shared store; new edits, including whitespace-only edits, survive a remount while a send or decision is pending. Decision delivery, claim/release and relay behavior are unchanged; the same branch is pushed and PR #42 stays Draft.

### Findings

RoboRev 1131: Material; Captain's normal Bridge send → switch/back → edit loses newer text on late completion, violating value-ac[AC-1] draft retention; the pre-fix deferred-completion failures reproduce this trigger. Evidence and rerun commands: r3-reply-clear-and-safe/evidence/cycle-2/README.md.

checks.json: repair comment_ratio 7 code/0 comments, exit 0 (below the 20-line enforcement threshold); full stack comment ratio 46 code/0 comments, 0.0% <= 5%; doc_impact 0 documents, OVERVIEW.md updated directly; ADR lint 7 records passed; number guards PASS, gap 3 not triggered. No ADR/migration or new POC boundary.

design_surfaces: SKIPPED, known package gap 2. RoboRev: SKIPPED, known package gap 5; FO reruns the pushed head against e91b9755a0c3444ebf4390f5396499ddf2070457. Loaded Codex package absolute paths are in checks.json. No new daemon/browser walk or live install; prior screenshots are not claimed at this repair candidate.

### FO findings before the gate

- roborev:1131 (Medium, dae9b002) and roborev:1132 (Medium, 9bc63dc4) are the same class: the composer keeps its own copy of the draft, so a delayed send that completes after a remount and the visible composer disagree. Compare-and-clear closed one sequence and exposed the next. Circuit breaker: FO stops patching individual sequences and authorizes a different approach — the draft store is the single source of truth with change notification, and each mounted composer reads it through a subscription (e.g. React `useSyncExternalStore`), so any clear or restore is visible in whatever composer is mounted.
