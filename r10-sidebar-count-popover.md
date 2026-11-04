---
title: Flywheel round 10 — a count on the Bridge sidebar row with a popover of gates and questions
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r10-sidebar-count-popover
gates:
    version: 1
    records:
        - id: gate:r10-sidebar-count-popover:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r10-sidebar-count-popover-backlog-1
              briefing:
                id: briefing:r10-sidebar-count-popover:backlog:attempt-1:revision-1
                digest: sha256:2bbad764fc9f25f02d5693d14583b5f76535a4c04f74bc377869ca3d1f361980
                room-ref: ./r10-sidebar-count-popover/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r10-sidebar-count-popover:backlog:1
                briefing: briefing:r10-sidebar-count-popover:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-11-04T01:39:53.831867Z"
                decision: approve
                reason: 'Accepts direction: the Captain chose this scope on 2026-11-04; no right panel, storage or permission change; stacked unmerged on #68.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'Captain chat 2026-10-23, recorded as ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38); round 10 scope 2026-11-04: 「先做側欄數字跟彈出，右側先不動」'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-04T01:40:15Z
worktree: .worktrees/spacedock-ensign-r10-sidebar-count-popover
pr: 69
---

Round 10 of the POC flywheel under ADR 0008: show on the Bridge sidebar row how many gates and questions wait on the Captain, and open a popover with those counts and the items when he presses it.

Captain, 2026-11-04, with Agent Observatory's sidebar badge and its "需要处理 8" popover as pictures: 「看圖一跟圖二我想要有這個側欄通知，提醒我最重要的 gate counts，打開時可以看到 how many gate 以及 questions」; asked what round 10 should do, he answered 「先做側欄數字跟彈出，右側先不動」.

bite: the Bridge sidebar row (index.client.tsx, BoardItem) shows only the label "Bridge", so the Captain must open Bridge to learn whether a gate or question waits on him; the round 9 walk found the same gap on the phone Board button (`_l3-dogfood/walks/round-9/reports/picky-b.json`, B1).
consumer: the Captain, glancing at the Paseo sidebar between other work.

## Scope

- The Bridge sidebar row (BoardItem) shows a count in the row's right slot: gates waiting for the Captain's decision plus questions waiting for his answer, computed by the existing status-priority and count function from round 9 (no second count rule); no count when nothing waits; "?" (not 0) while a source is loading or failed.
- Pressing the count opens a popover (openPopover: anchored on wide layouts, a bottom sheet on compact): the number of gates and the number of questions, then those items oldest first with owner and age, each opening Bridge on that item (openScreen); an "Open Bridge" action; the incomplete-source note when a source is not checked.
- Pressing the row label still opens Bridge as today.
Non-goals: the right-side panel and header button (the Captain: 「右側先不動」); round 10's earlier plan (detail reading order, action wording, button proportions, phone bottom actions); message times; board pinning; permissions and reviews in the badge count (shown in Bridge as today).
Budget: the ADR 0008 flywheel window — round 10, the last, ending 2026-11-06.
Stop condition: ADR 0008 Limits and stops (team unsatisfied twice, FO record violations in two consecutive rounds, a POC boundary crossed), or the plugin SDK cannot keep the count current without the Bridge screen mounted.
- POC boundary: no new persistent storage, background job beyond the existing source reads, permission or relay change; no change to what is sent or recorded.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): eighth stack layer on `spacedock-ensign/r9-list-and-detail-layout` at 224b03f; Draft PR with that base; nothing merges.

## Acceptance criteria

**AC-1**: The sidebar row tells the truth about what waits on the Captain.
Verified by: tests for the count from the shared count function (gates plus questions, sent or relayed items excluded, "?" while a source is loading or failed, nothing when zero) and a capture of the sidebar row at 1440 and 360 with a count, with "?", and with none.

**AC-2**: The popover lets him see and reach what waits.
Verified by: captures of the popover at 1440 (anchored) and 360 (bottom sheet) showing gate and question counts and the items oldest first; a test that pressing an item opens Bridge on that item and "Open Bridge" opens the board.

## FO alignment

Alignment: not needed: the Captain chose this scope on 2026-11-04 with reference pictures, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto the previous stack layer (git reset --hard 224b03f2da6eefc89d7a055ac95be2d858eaa5c5, branch spacedock-ensign/r9-list-and-detail-layout) and confirm HEAD; read-only, find how the sidebar row (index.client.tsx, BoardItem) can get the counts without the Bridge screen mounted, using the existing source reads and the round 9 status-priority and count function; report the approach and any SDK limit before editing
  Empty task branch reset successfully; HEAD confirmed at 224b03f2da6eefc89d7a055ac95be2d858eaa5c5 before edits. BoardItem and SDK sidebar/popover contracts traced; approach reported before editing: independent existing source reads, shared status/count logic, existing 60-second gate cadence. No SDK stop condition found.
- DONE: BoardItem shows in SidebarRow's right slot the number of gates waiting for the Captain's decision plus questions waiting for his answer from the shared count function (sent or relayed excluded), "?" while a source is loading or failed, nothing when zero; pressing the count opens a popover via openPopover (anchored on wide, bottom sheet on compact) with the gate count, the question count, then those items oldest first with owner and age, each opening Bridge on that item via openScreen, an "Open Bridge" action and the incomplete-source note; pressing the label opens Bridge as today; tests for the count cases and for item and "Open Bridge" navigation (AC-1, AC-2)
  Candidate d4dad9393436b897a329ee63ae0f8a721d3ab1f1. test/sidebar-waiting.test.mts exercises count/status priority, loading/failure/zero, claims without Bridge mounted, oldest-first attribution, label/item/gate/Commander/board navigation and source retry; disabling the observer or route effect, counting claims or removing incomplete-source handling makes these assertions fail.
- DONE: Captures at 1440 and 360 of the sidebar row with a count, with "?" and with none, and of the popover anchored and as a bottom sheet; npm test and typecheck pass; branch pushed and a Draft PR titled "[flywheel, do not merge] ..." opened with base spacedock-ensign/r9-list-and-detail-layout (eighth stack layer)
  259/259 npm tests and typecheck pass (tests-final.log, tests-results.json, typecheck-final.log). Real-host fixtures: capture-wide-final (1440) and capture-compact-verified (360), including scrollable compact list and an entirely visible Open Bridge action; candidate-capture-binding.json confirms runtime bytes. Branch pushed; Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/69, specified base and exact head verified in pr-readback.json.

### Summary

The sidebar now reports gates and questions waiting on the Captain and opens a live popover or compact bottom sheet with oldest-first items and direct Bridge navigation. Counts use the existing status priority and count function; the sidebar reads sources before Bridge mounts without creating a coordinator, and leaves the board's existing pending counts and retained details intact.

### Findings

Candidate: d4dad9393436b897a329ee63ae0f8a721d3ab1f1; base: 224b03f2da6eefc89d7a055ac95be2d858eaa5c5. Draft PR: iamcxa/kc-paseo-plugins#69; stacked, not merged; no ready/merge action taken.
Evidence root: r10-sidebar-count-popover/evidence/ (state checkout only). Tests/results, captures, source hashes, installation, navigation observations and cleanup are retained there.
Baseline falsifier: baseline-falsifier.json/log run the count predicate at the base; it returns 4 instead of the required 2 because sent/relayed gates are included (expected assertion exit 1). This candidate returns 2; its shared-count test would fail if that exclusion were removed.
Source proof: sidebar-only tests render no Bridge until navigation, then observe a new gate, an authoritative claim and released claim; removing source observation/polling/claim reads fails the visible badge assertions. Loading, failure and zero have separate checks and captures; retry updates both popover and badge.
Navigation proof: component tests exercise question, gate, Commander and board routes, then check the rendered destination. Real-host capture clicks a gate and Open Bridge at both widths; removing Board's params effect loses the target detail/compact board. The label retains its original openScreen input.
SDK check: @getpaseo/plugin 0.12.0 provides SidebarRow.trailing, openPopover and string screen params. Official https://paseo.sh/docs/plugins/reference.md confirms independent trailing presses and host-owned wide anchoring/compact sheets. No unsupported runtime import was added; isolated host compilation/installation succeeded.
Freshness: existing FO/Commander subscriptions and gate/decision readers run independently of Bridge, at the existing one-minute gate cadence; current-client progress invalidates readers immediately. No persistent store, new server job, coordinator creation, permission/relay/send/record change or decision-claim matching change.
Checks: typecheck-final.log and tests-final.log pass; adr-lint.log checks 7 existing records, 0 legacy; no ADR added or changed. comment-ratio.log: 170 added code lines, 0 comments, 0.0%, maximum 5% met. number-guards-final.log passes against the exact base/candidate; migration guard skipped because no migrations-path is declared, and no migration changed; known gap 3/R4 did not trigger.
SKIPPED: design_surfaces.py reports missing Surfaces:/Visible change: in FO alignment, the dispatch's known package gap 2; no FO-owned section repaired. roborev not run: package gap 5, worker sandbox cannot reach daemon; FO owes its review on this pushed head with base 224b03f2da6eefc89d7a055ac95be2d858eaa5c5.
Documents: doc-impact.json returned []; spacedock-bridge/OVERVIEW.md updated with the sidebar's behavior, readers, freshness and separate count meaning. Existing right-side panel/header UI and all sending/recording semantics remain outside this change.
Portability audit: client-portability-audit.log contains only TypeScript generic syntax matches; no DOM/HTML APIs added. All new UI uses React Native primitives and theme colors.
Proof limits: deterministic SDK/RPC fixtures exercise the candidate in the real isolated web host, not the live fleet or physical iOS/Android devices; decision-claim matching remains under the Captain's existing known-risk ruling. Independent validation and FO's external review remain outstanding.
Cleanup: cleanup-verified.json confirms all capture daemon PIDs stopped and homes removed, including failed harness attempts. Fresh browser profiles blocked localhost; no live daemon mutation, agent command-line listing or live install update; root and flywheel-live worktrees stayed clean.
ADR 0008 read at base 224b03f2da6eefc89d7a055ac95be2d858eaa5c5: Accepted, sha256:d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f; the task stays within the recorded POC/Draft stack grant. No new ruling recorded.

### FO findings before the gate

- Roborev (FO-run, package gap 5) on d4dad93 (roborev:1470): Medium — when the workflow set changes, use-waiting.ts gives the previous gates and claims the new key, so while the new read is pending or failed old gates count as current and attachGates can attach one to another officer with the same task slug. FO dispatches a read-only investigation first, then a separate fix authorization.
