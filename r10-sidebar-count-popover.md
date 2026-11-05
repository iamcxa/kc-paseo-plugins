---
title: Flywheel round 10 — a count on the Bridge sidebar row with a popover of gates and questions
status: validation
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
        - id: gate:r10-sidebar-count-popover:validation
          stage: validation
          attempts:
            - id: gate-attempt:r10-sidebar-count-popover-validation-1
              briefing:
                id: briefing:r10-sidebar-count-popover:validation:attempt-1:revision-1
                digest: sha256:ef5decb93c94e65a7614e967b9cd69cbb3ccfcf845436a9b2daff1b795a132e1
                room-ref: ./r10-sidebar-count-popover/review/validation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r10-sidebar-count-popover:validation:1
                briefing: briefing:r10-sidebar-count-popover:validation:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-11-04T09:17:19.795572Z"
                decision: approve
                reason: 'Accepts the outcome: validation-1 PASSED AC-1 and AC-2 at 2a31ef49e8f1; FO acceptance rerun passed; roborev clean; team pass 2 satisfied apart from the Captain-ruled known issue; observer 0 FO record violations; pregate_check passes. PR #69 stays stacked and unmerged.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'Captain chat 2026-10-23, recorded as ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38); known-issue ruling 2026-11-04: 「先記成已知問題 (Recommended)」'
              application:
                target-stage: done
                state: superseded
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

**AC-3** — Amended by Captain, amendment 1: The popover lists the items newest first (most recently waiting at the top), with gate and question counts, owner and age, each opening Bridge on that item and "Open Bridge" opening the board.
Verified by: captures at 1440 (anchored) and 360 (bottom sheet), in dark and light, showing newest-first order; a regression test that fails with oldest-first ordering and checks item and board navigation.

## FO alignment

Alignment: not needed: the Captain chose this scope on 2026-11-04 with reference pictures, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.

## Captain amendments

### Amendment 1 — 2026-11-05, chat
Captain: 「此外我對於順序想改下，應該越新的越上面」 (chat, 2026-11-05, with a screenshot of the built popover: `_l3-dogfood/walks/round-10/captain/popover-order.png`)
Supersedes: AC-2
Design: "Pressing the count opens a popover (openPopover: anchored on wide layouts, a bottom sheet on compact): the number of gates and the number of questions, then those items oldest first with owner and age, each opening Bridge on that item (openScreen); an "Open Bridge" action; the incomplete-source note when a source is not checked." (## Scope)

Superseded text:

**AC-2**: The popover lets him see and reach what waits.
Verified by: captures of the popover at 1440 (anchored) and 360 (bottom sheet) showing gate and question counts and the items oldest first; a test that pressing an item opens Bridge on that item and "Open Bridge" opens the board.

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

## Investigation: roborev 1470

Confirmed on unchanged candidate d4dad9393436b897a329ee63ae0f8a721d3ab1f1. A read-only React/DOM reproduction used the existing mountBridge fixture, no Bridge initially mounted, and an already-open popover; no candidate, test, PR or evidence file was changed.

Sequence: (1) useWaiting has result.key for /workflow-a and /workflow-b, with an unclaimed gate from /workflow-a owned by A FO. (2) The FO subscription replaces that fleet with B FO at /workflow-new, task=shared matching the old gate's slug. (3) workflowKey changes (client/use-waiting.ts:58); the first render's result.key mismatch hides gates, but refresh immediately spreads old result, assigns the new key and state=loading (:63), carrying gates, claimed and failed. (4) The equality check at :86 now accepts those old gates; attachGates (shared/board.ts:203-207) misses the workflow/task identity match and falls back to row.task === gate.slug, attaching the old gate to B FO. (5) Rejecting the new read keeps the same stale payload through the catch setter (:72). generation rejects stale asynchronous completions, but does not protect already-cached data that these setters relabel.
Observed while loading and after rejection: badge ?, incomplete-source note, plus clickable “Old workflow gate” labelled “B FO · Gate”; before the switch it was “A FO · Gate”. Clicking it opened board with params.item=["g","/workflow-a","shared","validation","old-brief"], but no gate decision controls appeared: Board's liveQueue did not contain the old destination (client/board.tsx:355-356). The ? correctly signals incomplete counts; it does not prevent the wrong-owner item or unusable destination. This violates value-ac[AC-2]: each waiting item must open its Bridge detail in the normal sidebar workflow.

Other occurrences in this round's entire eight-file diff: client/use-waiting.ts:72 is the only additional new-key/old-data assignment besides :63, and also carries old claimed/failed data. The successful setter at :70 writes fresh gates/claims/failures together; fleet's loading/failure setters (:25-26) preserve their data without assigning a new identity; the coordinator map writes each agent under its own id; Board's new setVisited (:357) stores the fresh item under that item's own key and preserves other entries under their original keys. No other relabelling site found.

Smallest proposed fix, not applied: in the loading setter (:63), retain cached data only when old.key === workflowKey; otherwise initialize the new key with gates=[], claimed=new Set(), failed=[] and state=loading. In the catch setter (:72), change only state=failed, preserving the payload's key rather than assigning it again. Keep the generation guard and existing same-key refresh behavior; do not change attachGates ownership fallbacks or decision-claim matching.

Proposed regression was executed from Node stdin against the unchanged candidate: two cases mount the popover, load the old gate, replace the fleet with B FO/new workflow sharing the slug, then keep the new gate read pending or reject it. Both require the ? badge and no “Open Old workflow gate” control; both fail on d4dad93 (2 tests, 2 expected failures, exit 1, actual stale-control presence=true). A separate reproduction asserting the reported bad behavior passed and confirmed the stale destination. For the authorized fix, retain these two absence assertions, then resolve a successful new-workflow read and assert only its own gate/owner/destination appears; check same-key refresh still retains its own cached rows. No implementation or fix validation performed; repair authorization remains with FO.
- Investigation of 1470 (implementation-1-followup-1.md) confirmed the cause in useWaiting's loading and catch setters (the only two places that relabel old data); FO authorizes the fix separately (implementation-1-followup-2.md).

## Stage Report: implementation (cycle 2)

- DONE: roborev:1470 per your investigation: in useWaiting's loading setter keep cached data only when old.key equals the new workflowKey, otherwise start the new key with no gates, claims or failures and state loading; in the catch setter change only state to failed without assigning a new key; keep the generation guard, attachGates fallbacks and decision-claim matching unchanged; your two regression cases (pending and rejected new read show "?" and no stale item), plus a successful new read showing only its own gate, owner and destination, and a same-key refresh keeping its own cached rows; all failing on d4dad93 where expected
  f55910a5794578335abd58b13d3db0565f5fa13c changes only the two authorized useWaiting setters and test/sidebar-waiting.test.mts. red.log/red-results.json: original d4dad93 product fails both workflow-switch absence cases, with 7 control tests passing; green.log and tests-final.log pass. Successful new-read navigation and same-key cached rows are exercised through the rendered popover/Bridge, not source-text checks.
- DONE: npm test and typecheck pass; push to PR #69 (still Draft); a short "## Stage Report: implementation (cycle 2)" section
  npm test: 263/263 pass; npm run typecheck: exit 0 (tests-final.log, tests-results.json, typecheck-final.log). Pushed only spacedock-ensign/r10-sidebar-count-popover; pr-readback.json confirms PR #69 remains OPEN and Draft on f55910a with base spacedock-ensign/r9-list-and-detail-layout.

### Summary

Workflow-set changes now start with empty gates, claims and failures; refreshes of the same set retain only their own cache. Failed reads change status without relabelling cached data; generation protection, ownership fallbacks, decision-claim matching and all other production code are unchanged.

### Findings

Candidate: f55910a5794578335abd58b13d3db0565f5fa13c; repair base: d4dad9393436b897a329ee63ae0f8a721d3ab1f1; stack base: 224b03f2da6eefc89d7a055ac95be2d858eaa5c5. Evidence: r10-sidebar-count-popover/evidence/cycle-2/; identity.json binds candidate, changed files, checks and PR readback.
Falsifiers: restoring the unconditional old-data/new-key loading update makes the pending and rejected workflow-switch tests fail (old item remains clickable under B FO); clearing data on every refresh breaks the same-key control. Removing new-result replacement or navigation loses the new gate/owner/working destination assertions. The success and same-key controls already pass on d4dad93, as expected.
Package checks: number-guards.log passes against the full stack base, with migration-path check skipped because none is declared and no migration changed. comment-ratio.log reports 4 added production code lines, 0 comments (0.0%); ratio threshold not enforced below the 20-line floor. doc-impact.json returns []; no document behavior claim changed, no ADR added or changed.
SKIPPED: design-surfaces.log reports the same missing FO-alignment Surfaces:/Visible change: (known package gap 2); no FO-owned field changed. Known gap 3/R4 did not trigger. roborev not run: package gap 5; FO reruns its review on the pushed f55910a head before independent validation.
Scope and limits: no new persistent state, background job, UI surface, dependency, permission/relay/send/record change, ready/merge action or live-install update. No daemon/browser capture was needed or started for these state-update changes; existing screenshots are not claimed as fresh repair proof. Proof exercises real components with the existing SDK/RPC fixtures; live fleet and physical-device behavior remain outside this repair's evidence.
Cleanup: code worktree and root/flywheel-live worktrees clean; all test processes completed. Only this report and cycle-2 evidence are committed to the shared state checkout. Independent validation and FO's new review remain outstanding; task frontmatter/stage unchanged.
- Roborev clean on f55910a (roborev:1471). Pre-gate team pass 1 on f55910a: picky A SATISFIED; picky B SATISFIED (annoys: the phone sheet shows three of four items with no scroll cue); design director NOT SATISFIED — block: the badge and the popover's Open Bridge / Check again are low-contrast green where the reference uses bright amber, raise contrast without animation; evidence: both sidebar-none.png captures still show "1" (the capture script only excluded "4" and "?"), so the zero state is unproven. FO dispatches a read-only investigation (cause of the "1", current colour tokens, scroll cue options), then a separate fix authorization. Under ADR 0008 a second unsatisfied team pass stops and asks the Captain.

## Investigation: pre-gate team pass 1

Read-only investigation on unchanged f55910a5794578335abd58b13d3db0565f5fa13c; no candidate, fixture, capture, PR or extra evidence file changed. The earlier sidebar-zero capture claim is withdrawn: both existing “sidebar-none” captures show 1, so AC-1's zero capture remains unproven.

Zero state — fixture flaw, not a reproduced product-zero bug. evidence/proof-host.tsx agents() (:8) leaves next-owner=captain when scenario=none, clearing only next text; gates() (:13) and the coordinator timeline (:21) become empty. boardStatus (shared/board.ts:56) still returns waiting on Kent; buildQueue (shared/queue.ts:66-68) correctly adds its fallback “Has a question for you” when there is no gate and no next text, so filterCounts returns 1. Both observed.json files confirm the “1 gates and questions waiting for you” control. capture.py:114-116 only rules out the exact “4…” control and “?”, allowing 1 to pass.
Smallest fix/proof: change only the none fixture to omit next-owner=captain, with no gates or FO/Commander questions; require absence of every sidebar count control, not just 4 and ?. Re-run 1440/360 captures after sources settle and record that no count button is present; retain the negative control that empty next text with next-owner=captain must still show 1. A Node-stdin test against the unchanged real components reproduced the fallback question, then removing that label produced Questions 0 and no badge (1 test passed); this supports the product behavior but does not replace the missing captures.

Theme — client/sidebar-waiting.tsx:58 uses accent for badge fill and accentForeground for its number; :46-47 uses accent for both Check again and Open Bridge text against surface0. Existing capture pixels confirm #20744A green and #181B1A surface; their text contrast is 3.02:1. The white badge number against that green is already 5.74:1, so its issue is the requested attention hierarchy rather than an unreadable number. The SDK's existing amber semantic token is theme.colors.statusWarning; 0.12.0's public PluginTheme exposes it, but exposes neither baseColors.amber[500] nor accentBright. Pinned official upstream maps warning to #c09664 in dark and #7b5d39 in light: high-contrast amber/brown, not the reference's vivid #f59e0b. No supported public token promises that exact bright amber.
Smallest fix/proof: use statusWarning for badge fill with surface0 for its number, and statusWarning for the two action labels; no imports, library or animation. For the pinned default dark/light palettes these proposed pairs calculate 6.43:1 and 6.06:1 respectively. These are source-palette calculations, not a fresh measurement of the installed host's warning color. Capture the actual host at both widths in dark and light, inspect computed foreground/background (including inherited opacity), verify the badge/labels' final contrast and ask the design director to judge its attention strength; test with distinct supplied theme colors so reverting to accent fails. Do not import an internal palette to imitate the unlicensed reference.

Scroll cue — WaitingPopover bounds compact content to 320 px (:32) and its ScrollView shrinks (:39); the 360-popover-count.png shows three of four entries, with no visible overflow instruction. Its tail capture proves scrolling works; there is no product cue state or text now. Smallest fix: one compact-only line, “Scroll to see all 4 items”, outside the list, shown only after onLayout/onContentSizeChange measurements establish content height exceeds viewport height (with ~1 px tolerance); use foregroundMuted and keep Open Bridge fixed/reachable. The static wording remains true at either scroll end and needs no timer, animation or scroll-position state. These native callbacks are already used elsewhere in this plugin.
Proof for that proposal: 360 px/four-item capture must show the cue before interaction; scroll to the last item and open it while keeping Open Bridge fully inside the viewport. A short/fitting list and a wide popover must have no cue; content-size/viewport changes must show/hide it based on measured overflow, not an arbitrary item-count threshold. Do not treat an auto-hidden native scrollbar as the persistent cue.

Theme sources read at upstream 66676d49e6336a75837abec247871553a7658c35: [public mapping](https://github.com/getpaseo/paseo/blob/66676d49e6336a75837abec247871553a7658c35/packages/app/src/plugins/theme.ts), [palette and semantic colors](https://github.com/getpaseo/paseo/blob/66676d49e6336a75837abec247871553a7658c35/packages/app/src/styles/theme.ts). Installed SDK contract checked under spacedock-bridge/node_modules/@getpaseo/plugin/dist/contracts.d.ts. No reference implementation code, wording or assets copied; no daemon/browser started or live service mutated. All proposed changes await FO's separate authorization.
- Investigation of pass 1 (implementation-1-followup-3.md): the "1" in sidebar-none was a capture-fixture flaw (proof-host left next-owner=captain), not a product bug; the attention colour available in the plugin theme is statusWarning (amber); a measured-overflow scroll cue line fits the phone sheet. FO authorizes the fix separately (implementation-1-followup-4.md).

## Stage Report: implementation (cycle 3)

- DONE: Per your investigation: badge fill theme.colors.statusWarning with surface0 for its number, and statusWarning for "Open Bridge" and "Check again" labels — no import, library or animation; a test with distinct supplied theme colours that fails if the badge reverts to accent; captures of the installed host at 1440 and 360 in dark and light with the computed foreground/background contrast of the badge and both labels recorded
  sidebar-waiting.tsx uses the supplied statusWarning/surface0 tokens; the distinct-color test fails on f55910a and passes here. Installed-host captures cover dark/light × 1440/360; contrast-all.json records the three controls in all four combinations (12 computed pairs, inherited opacity=1): dark 6.4334:1, light 6.0571:1.
- DONE: Fix the none fixture (omit next-owner=captain, no gates or questions) and make the capture require the absence of every sidebar count control; keep the negative control (empty next text with next-owner=captain still shows 1); re-capture sidebar-none at 1440 and 360 after sources settle
  cycle-3/proof-host.tsx omits the Captain-owned label in none and supplies no gate/FO/Commander question. capture.py rejects every numeric or unknown sidebar count control; all four sidebar-none captures have none. All four sidebar-captain-empty captures retain count 1, and the component negative-control test preserves the empty-next/Captain-owned fallback question.
- DONE: Phone sheet: one compact-only line "Scroll to see all N items" outside the list, shown only when measured content height exceeds the viewport (onLayout / onContentSizeChange), foregroundMuted, Open Bridge kept reachable; captures of a four-item sheet with the cue and a fitting list and the wide popover without it; npm test and typecheck pass; push to PR #69 (still Draft); a short "## Stage Report: implementation (cycle 3)" section
  The compact-only foregroundMuted cue sits outside ScrollView and follows onLayout/onContentSizeChange with 1 px tolerance. Both compact four-item captures show it and reach the last item with Open Bridge inside the viewport; fitting one-item and wide captures omit it. npm test passes 267/267; typecheck passes. Only r10 was pushed to PR #69; pr-readback.json confirms exact head 2a31ef4, OPEN/Draft and the unchanged stack base.

### Summary

The badge and popover actions now use the approved warning theme colors, and the phone sheet explains when its measured list overflows. The capture fixture now distinguishes a true zero from an empty-text question still assigned to the Captain; fresh settled-source captures replace the earlier invalid zero claim.

### Findings

Candidate: 2a31ef49e8f152623c1e04e046bcbf34777da85f; repair base: f55910a5794578335abd58b13d3db0565f5fa13c; stack base: 224b03f2da6eefc89d7a055ac95be2d858eaa5c5. Code changes are confined to sidebar-waiting.tsx and its existing test/helper; no sending, recording, identity/ownership, permission, relay, background-job, persistent-state or right-side UI change.
Evidence root: r10-sidebar-count-popover/evidence/cycle-3/. tests.log/tests-results.json record 267 passes; typecheck.log exits 0. red.log/red-results.json record the baseline's wrong badge color and missing measurement wiring (3 failing presentation cases, 10 passing controls); reverting warning to accent or removing the cue/measurement callbacks fails the new assertions. Overflow/fitting/resize/tolerance cases use fixed item counts, so an item-count-only cue cannot pass.
Accepted captures only: dark-1440-verified, light-1440, dark-360-settled, light-360-final (38 PNGs). capture-verification.json binds every source-file hash to this candidate and checks settled gate/question counts, zero/negative controls, cue presence/absence and appearance; contrast-all.json records foreground/background and effective ancestor opacity, not inferred palette contrast. Source/theme values came from the actual isolated installed host. No color import, color library or animation was added; React's existing host-provided useState handles the two measurements.
Capture correction: early phone fitting/error pictures were still loading and are not proof; the canonical harness now waits for the actual 1 gate/0 questions or failed-source note. A stalled phone controller attempt was interrupted, its recorded daemon PID and owned browser profile cleaned explicitly, and the final phone-light pass used host Open Bridge/Back navigation. Failed/superseded folders are retained but excluded from accepted evidence.
Checks: comment-ratio.log reports 11 added production code lines, 0 comments, 0.0%; threshold not enforced below the 20-line floor. number-guards.log passes on the full stack base; migration-path guard is skipped because none is declared and no migration changed. doc-impact.json returns []; existing OVERVIEW.md count/read/navigation claims remain true. No ADR added or changed.
SKIPPED: design-surfaces.log reports the same FO-alignment Surfaces:/Visible change: package gap 2; no FO-owned field changed. Known gap 3/R4 did not trigger. roborev not run: package gap 5; FO reruns it on 2a31ef49e8f152623c1e04e046bcbf34777da85f before the new independent/team validation.
Limits/cleanup: installed web-host presentation, source readiness and native-style callback wiring use deterministic SDK/RPC fixtures; no live fleet data or physical iOS/Android proof claimed, and final design satisfaction belongs to the design director. Capture runs were sequential with isolated HOME/--home, safe ports, fresh browser profiles and localhost blocked. capture-verification.json checks all recorded capture daemon PIDs stopped and homes removed, including interrupted attempts; root/flywheel-live stayed clean and no live install was updated. PR remains Draft; no ready/merge or task-frontmatter/stage change. Independent validation and the new FO review remain outstanding.
- Roborev clean on 2a31ef4 (roborev:1473). Pre-gate team pass 2 on 2a31ef4: design director SATISFIED (amber badge noticeable; contrast about 6.4:1 dark, 6.1:1 light; true zero hides the count; annoys, not blocking: in the phone failure state the list is squeezed below one full row); picky B SATISFIED; picky A NOT SATISFIED (annoys: the same phone failure-state clipping hides the question's owner and age). Second unsatisfied team pass on this round: under ADR 0008 FO stops and asks the Captain before any repair.

### FO findings at the gate

- Validation-1 PASSED AC-1 and AC-2 at 2a31ef4. FO reran evidence/validation-1/acceptance.sh in a fresh shell: all steps PASS on the first run (267 tests, both mutants rejected, four host runs).
- Observer (pre-gate, 32b2a7d..7b71260): 0 FO record violations, 1 package mismatch (design_surfaces, gap 2).

- Amendment 1 build (cycle 4) on 33952f9: popover items newest first; roborev clean (roborev:1482).

### FO declines

- Pre-gate team pass 2 (picky A, annoys; design director noted it as not blocking) on 2a31ef49e8f152623c1e04e046bcbf34777da85f — on the phone, when a source failed, the incomplete-source note plus the scroll cue squeeze the sheet's list below one full row, clipping the question's owner and age until scrolled. Declined as a known issue by the Captain's ruling 2026-11-04, asked 「手機上讀取失敗時，彈出摘要的清單被擠到不到一整列，要怎麼處理？」, answered 「先記成已知問題 (Recommended)」. Would become Material: if the Captain reports missing or misreading a waiting question on his phone because the row was clipped, or the sheet shows no complete row with sources healthy.

## Stage Report: validation

- DONE: Independent verdict on AC-1 and AC-2 for PR #69 at the candidate head, from your own npm ci / typecheck / test run; your own isolated-host captures at 1440 and 360 (dark and light) of the sidebar row with a count, with "?" while a source is unchecked, and with no count at a true zero, and of the popover anchored and as a bottom sheet with gate and question counts and items oldest first; your own check that pressing an item opens Bridge on that item and "Open Bridge" opens the board; your own mutation of the shared count (counting sent or relayed items, or showing 0 for an unchecked source) showing the tests fail
  PASSED AC-1/AC-2 at 2a31ef49e8f152623c1e04e046bcbf34777da85f against 224b03f2da6eefc89d7a055ac95be2d858eaa5c5: own npm ci, typecheck exit 0, 267/267 tests; four sequential isolated web-host runs (dark/light at 1440/360). verification.json binds source hashes, count/unknown/zero, owner/age order and gate/question/board destinations. Both shared-count mutants fail as required (sent/relayed: 2 assertions; unchecked-zero: 7).
- DONE: A minimal acceptance script the FO can rerun as written in a fresh shell, running captures one at a time, with each step's expected output
  acceptance.sh is a five-step fresh-shell script; acceptance.md gives the absolute bash command, prerequisites, expected outputs and limits. bash -n passes; component commands were exercised here. FO still owes the complete as-written run before the gate.
- DONE: Material findings and limits, including that no right-side panel, storage, permission or relay change was added and decision-claim matching is unchanged; do not re-report the phone failure-state clipping (the Captain's known-issue ruling) or roborev findings already dispositioned unless their evidence changes
  Full eight-file candidate diff assessed: no new material finding or POC boundary crossing; no right-panel/header, storage, permission, relay, send/record or decision-claim matching change. Existing dispositions remain settled; no evidence changed.

### Summary

PASSED for the accepted bounded POC at the exact candidate. Independent tests, host captures and two shared-count mutations support both criteria; no implementation, PR or live-daemon change was made. Gate and delivery authority remain with FO/Captain.

### Findings

No new Material, Deferred risk, Polish or Needs decision finding. Evidence root: r10-sidebar-count-popover/evidence/validation-1/. Canonical captures: dark-1440-final, light-1440-final, dark-360-final, light-360-final (50 PNGs); earlier dark-1440-approved is excluded because the harness expected a nonexistent board label. Corrected harness verifies visible By decision/By FO controls and compact board exit.
AC-1: count 4; loading and failed each show ?; settled none has no count control; Captain-owned empty-text question remains 1. Shared-count tests exclude finished/sent/relayed/permission/review items and ignore unrelated review-source failure. mutations/sent-relayed.xml and unchecked-zero.xml show assertion failures when those protections are removed.
AC-2: popovers show Gates 2/Questions 2 and mixed oldest-first order at 60/35/12/5 minutes with owner/age. Real host clicks reach gate decision controls and the named question message box; Open Bridge reaches the board. Component tests also check Commander and unchanged label routes; removing the target-param effect breaks destination assertions.
Presentation: independently viewed desktop dark and phone dark/light popovers; measured compact cue, scrollable last item and reachable Open Bridge verified. All 12 actual host foreground/background pairs exceed 4.5:1 with inherited opacity 1 (per-folder contrast.json).
Necessity: source reads prove counts before Bridge mounts; shared predicate and unknown branch prove truthful attention; target routing proves item/board exits; warning tokens and measured cue implement the authorized pass-1 repair. No extra production seam, dependency or POC boundary crossing found.
ADR 0008 remains Accepted at base and candidate; sha256:d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f. Command: python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.34.0/scripts/adr_lint.py docs/adr --since 224b03f2da6eefc89d7a055ac95be2d858eaa5c5 --require 8; adr-lint.log exit 0, 7 records checked.
Guards: comment-ratio.log exit 0 (179 code lines, 0 comments, 0.0%, maximum 5%); dispatch-records.log exit 0 (all 6 records complete; requirements traced to criteria/authorized repair). number-guards-exact.log exit 0 at full stack base/candidate; migration guard skipped because no migrations-path is declared and no migration changed. Gap 3/R4 did not trigger.
Documents: doc-impact.log exit 0 lists no affected documents. OVERVIEW.md updated; its count/incomplete-source/order/navigation/reader claims agree with candidate and observed behavior. No retained diagram changed.
SKIPPED: design_surfaces.py exit 1 is known package gap 2 (missing FO-owned Surfaces:/Visible change:); no FO section repaired. roborev not run, known package gap 5; FO-owned clean review 1473 is context, not my independent check.
Limits: deterministic SDK/RPC injection exercises production components in the installed isolated web host; live fleet correctness and physical iOS/Android remain unverified. Injection changes only disposable copies; all pre-injection source hashes match candidate git blobs. acceptance.sh declares installed Paseo, agent-browser/browser and app-dist prerequisites explicitly; no general fresh-machine portability claimed.
Environment: sandbox npm test/socket bind failed with EPERM; approved unchanged tests/captures ran outside the restriction. Empty prelaunch directory removed. First state commit encountered sandbox index.lock denial; retry requires the approved filesystem scope. These are environment limits, not product findings.
Cleanup: cleanup-final.json verifies all five launched daemon PIDs stopped and homes removed, including the superseded capture; all three candidate/root/flywheel-live heads and branches unchanged and clean. Captures were sequential with private HOME/--home and fresh profiles blocking localhost. Live daemon untouched; no agent command lines printed or existing /tmp files overwritten.
PR: pr-readback.json independently confirms #69 OPEN/Draft, unmerged, exact head/base; no PR mutation or code commit. Only this entity and its validation evidence are submitted to state. FO must run acceptance.sh exactly and complete the pending gate; this verdict is not delivery approval.

## Stage Report: implementation (cycle 4)

- DONE: Captain amendment 1 (「此外我對於順序想改下，應該越新的越上面」, 2026-11-05): move AC-2's block verbatim from ## Acceptance criteria into the amendment entry under a "Superseded text:" line and write AC-3 "Amended by Captain, amendment 1": the popover lists the items newest first (most recently waiting at the top), with gate and question counts, owner and age, each opening Bridge on that item and "Open Bridge" opening the board; change only the popover's item order to newest first, keeping counts, filters, colours and the incomplete-source note; a test that fails on 2a31ef4 if the order reverts to oldest first
  33952f9b3d02fceab104ba09272d65e432a3d095 reverses only summary()'s since comparator; unchanged key tie-break, counts, filters, colours, source note and routing. amendment.json verifies AC-2 moved verbatim under Amendment 1; AC-1/AC-3 are active.
- DONE: Re-capture the popover at 1440 (anchored) and 360 (bottom sheet) in dark and light at the new head; npm test and typecheck pass; push to PR #69 (it is ready for review — do not change its state, do not merge); a short "## Stage Report: implementation (cycle 4)" section
  evidence/cycle-4/: order-red.log fails on the 2a31ef4 source; order-green.log passes 13/13; npm-test.log passes 267/267; typecheck.log exit 0. Four sequential isolated-host captures bind to 33952f9; pr-after.json confirms #69 OPEN, ready (isDraft false), unmerged, exact head and unchanged base.

### Summary

Implemented Captain Amendment 1: newest waiting items first. OVERVIEW.md now describes that order; no other product behavior changed, no new file/dependency/storage/permission/relay work. Evidence root: r10-sidebar-count-popover/evidence/cycle-4/.

### Findings

Regression: “popover sorts gates and questions together newest first” asserts the newer gate precedes the older question and still exercises gate/question detail plus Open Bridge routes. It fails with “newer gate must precede the older question” on unmodified 2a31ef4 production bytes (12 pass/1 fail), then passes after the comparator reversal; reverting to oldest-first would fail it again.
Captures: dark-1440, light-1440, dark-360, light-360; 10 PNGs (sidebar, popover, plus phone tail). verification.json / verify.py verify actual mixed order Commander question 5m, Export FO gate 12m, Demo FO question 35m, Demo FO gate 1h, owner/age labels, Gates 2/Questions 2, phone-only scroll cue, reachable Open Bridge and no horizontal overflow. All four popovers visually inspected.
Provenance: each run installed the disposable candidate copy in the existing Paseo web host with deterministic SDK/RPC injection. All 85 tracked package files' pre-injection SHA-256 hashes match git blobs at 33952f9b3d02fceab104ba09272d65e432a3d095. No live-daemon/plugin change; live fleet correctness and physical iOS/Android remain unverified. Fixture/harness stay in task evidence, not the candidate.
Cleanup: verification.json confirms all four captured daemon PIDs stopped and their owned homes removed; browser close completed, fresh profiles blocked localhost, safe random ports were used, captures ran one at a time. Root/main and flywheel-live stayed clean and unchanged; no agent command lines printed and no existing /tmp files overwritten.
Guards: comment-ratio.log exit 0 (1 code line added, 0 comments, 0%; below 20-line enforcement minimum); doc-impact.json is []; retained OVERVIEW.md checked against actual ordering/navigation. number-guards.log exit 0 at base 224b03f2da6eefc89d7a055ac95be2d858eaa5c5, no findings, migration check skipped because no migrations-path is declared. No ADR added/changed; ADR 0008 remains Accepted at base/head, SHA-256 d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f.
SKIPPED: design_surfaces.py exit 1 remains package gap 2 (FO-owned Surfaces:/Visible change: absent); no FO fields repaired. roborev not run, package gap 5; FO reruns its gate on this pushed head. No new material finding or POC boundary crossing; the Captain's accepted phone failure-state clipping disposition is unchanged.
Delivery: only the r10 branch was pushed; PR #69 remains ready for review and unmerged. Independent revalidation and FO/Captain gate work remain; this implementation report is not delivery approval.
