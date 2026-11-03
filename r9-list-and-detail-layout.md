---
title: Flywheel round 9 — narrow list beside a wide detail, with state kept across reopen and the comms officer
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r9-list-and-detail-layout
gates:
    version: 1
    records:
        - id: gate:r9-list-and-detail-layout:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r9-list-and-detail-layout-backlog-1
              briefing:
                id: briefing:r9-list-and-detail-layout:backlog:attempt-1:revision-1
                digest: sha256:68612bfe2b0d881755d124f7a48c50b31751ea11fd3131d1c85cee58f3c89cbf
                room-ref: ./r9-list-and-detail-layout/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r9-list-and-detail-layout:backlog:1
                briefing: briefing:r9-list-and-detail-layout:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-11-03T10:36:57.281706Z"
                decision: approve
                reason: 'Accepts direction: builds the design the Captain accepted on 2026-11-03; scope split by chief-engineer; no semantic, storage or permission change; stacked unmerged on #57.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'Captain chat 2026-10-23, recorded as ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38); design accepted 2026-11-03: 「照這個方向做可以」'
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-03T10:37:18Z
worktree: .worktrees/spacedock-ensign-r9-list-and-detail-layout
pr: 68
---

Round 9 of the POC flywheel under ADR 0008 builds the layout and navigation of the design the Captain accepted in round 8: a narrow list beside a wide detail, grouped, one status per row, filters with counts, and switching items without losing drafts, choices or progress.

Captain, 2026-11-03: 「照這個方向做可以」 to 「照這個方向做，還是有哪裡要改？」 on the round 8 mockups; round 7 UAT most bothersome 「桌面決定區太窄」.

bite: the installed build (316c9ef) gives the open decision a narrow side column beside a mostly empty comms conversation (`_l3-dogfood/walks/round-7/screenshots/1440-gate-open-expanded.png`); the accepted reference is `r8-list-and-wide-detail/design/LIST-AND-DETAIL.md` and `r8-list-and-wide-detail/mockups/` (23 states at 1440 and 360).
consumer: the Captain, deciding from the Bridge on desktop and phone.

## Scope

- From chief-engineer (codex/gpt-6-astra:xhigh, 2026-11-03), round 9 of a two-round split:
  - bridge.tsx replaces the permanent comms chat plus fixed-width board with the list/detail layout (phone: list or detail, back keeps position).
  - board.tsx stops replacing its list with a detail card; grouping by kind, one status marker per row (icon plus text: your turn / waiting on someone else / done), filters with counts (all, permissions, reviews, gates, questions) that say when a source is incomplete; selection survives view changes.
  - The comms officer conversation opens in the shared detail from its question row and from an always-available, uncounted entry; an unassigned review opens it directly with the prefilled ask, keeping drafts.
  - CoChat renders the selected recipient and tells loading and failure apart from an empty conversation.
  - decision-card supplies item content and progress to the shared detail; its reading order, action wording, button proportions and phone bottom actions are round 10.
- POC boundary: session-only presentation memory; no new persistent storage, history, recovery duty or integration; no change to Confirm, required reasons, permissions, or what is sent, relayed or recorded; no in-place permission approval, next-item control, or unread/later/running filters. Any needed host (Paseo) extension returns to the Captain.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): seventh stack layer on `spacedock-ensign/r7-one-clear-way-to-decide` at 316c9ef; Draft PR with that base; nothing merges.
- Non-goals: round 10's detail reading order, action wording, proportions and phone bottom actions; historical briefing retrieval; the real-phone keyboard check (the Captain's device, after round 10).

## Acceptance criteria

**AC-1**: The built layout matches the accepted mockups for list, grouping, status and filters.
Verified by: one combined fixture with the real components across the 23 reference states at 1440 and 360, both list views, long titles and hover/focus/link bounds; the design director compares the captures with `r8-list-and-wide-detail/mockups/`, with round 10 differences declared.

**AC-2**: Nothing is lost when moving between items and the comms officer.
Verified by: tests named up front — "reopen keeps the confirmed choice and reason", "sent and relayed progress survives a comms detour", "a recorded item never becomes actionable again", "switching items keeps separate drafts and rejects stale actions", "errors and progress stay with their own source and owner".

**AC-3**: Status and counts are decided in one place.
Verified by: one status-priority function with a table test over every waiting kind in LIST-AND-DETAIL.md; counts keep pending items, exclude finished ones and tell an incomplete source from zero.

## FO alignment

Alignment: not needed: the Captain accepted the design on 2026-11-03; scope and split from chief-engineer, recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
Reviewer: kc-dev-flow-2:chief-engineer codex/gpt-6-astra:xhigh 2026-11-03 — scope round 9 (build the accepted list-beside-wide-detail design; one round or split)
Reviewer: kc-dev-flow-2:chief-engineer codex/gpt-6-astra:xhigh 2026-11-03 — is round 9 converging after roborev 1430, 1432 and 1437 in the retained-surface class; which rule closes it, repair or decline 1437

### FO notes

- Captain 2026-11-03, asked 「要把 comms 入口移到清單最上方嗎？」, answered 「我覺得要搬到最顯眼的地方，不然沒辦法區別，而且操作重點應該是盡可能讓 comm officier 可以成為指揮官。目前的 UI 好的地方在於切換時更明確，但是我認為，大方向跟指揮官談，細節必要時可以去跟不同 FO 聊，或是去 checking 進度。但是現在這樣 UX 感覺不太像是這樣。但仍然我覺得這個方向會比現在更好」. FO put the implementation worker on hold (no further edits, no push) before asking how to proceed.
- Worker held at a safe point (2026-11-03): uncommitted edits to bridge.tsx, board.tsx, co-chat.tsx, decision-card.tsx; new list-status.ts, bridge-continuity.test.mts, list-status.test.mts, test/helpers/bridge-host.mts; the five continuity tests and the status/count table test written (3 pass, 4 fail); nothing pushed, no PR.
- Added after the backlog gate: round 9's design reference becomes r9-commander-first (home is the comms officer conversation; a pinned Commander card tops the board; By FO lists every FO; one tap back to the commander from any drill-down), on top of r8-list-and-wide-detail.
- Captain ruling on that scope addition, 2026-11-03, asked 「照這個方向做，還是有哪裡要改？確認後，我就讓第 9 輪的工人照這個方向繼續寫程式，它先前寫的測試大多用得上。」, answered 「就這樣」.
- Worker question 2026-11-03: the accepted mockups reopen a recorded item through browser history, but the Paseo plugin screen props (@getpaseo/plugin 0.12) expose no back/history subscription or route mutation, so a recorded item that has left the pending list cannot be reopened after returning to the Commander. FO ruling (implementation choice, no scope or acceptance change): do not wait for a host capability; meet the accepted "recorded item reopened" state with session-only in-plugin memory — items recorded this session stay reachable at the end of the board under the existing "done" status, uncounted and never actionable, reopening to result and reason; no host history, storage or history page. Flagged for the design director's comparison and the Captain's trial.

## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto the previous stack layer (git reset --hard 316c9eff7bd6ce2f5e15db7382dea1aba1197a26, branch spacedock-ensign/r7-one-clear-way-to-decide) and confirm HEAD; read the accepted design /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-list-and-wide-detail/design/LIST-AND-DETAIL.md and /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-list-and-wide-detail/mockups/ (REVIEW.md, ASSUMPTIONS.md, index.html, PNGs); write the five named continuity tests and the status-priority table test before changing layout code; report both
  Empty branch reset to 316c9eff7bd6ce2f5e15db7382dea1aba1197a26 before layout edits; r8/r9 accepted references read. before-layout-red.log and commander-before.log precede their layout changes; baseline-falsifier.json rejects unchanged 316c9ef.
- DONE: bridge.tsx: list/detail layout replaces the permanent comms chat and fixed-width board (phone: list or detail, back keeps position); board.tsx: list stays, grouping by kind, one status marker per row (icon plus text: your turn / waiting on someone else / done), filters with counts (all, permissions, reviews, gates, questions) that say when a source is incomplete, selection survives view changes; the comms officer conversation opens in the shared detail from its question row and an always-available uncounted entry; an unassigned review opens it with the prefilled ask; CoChat renders the selected recipient and tells loading and failure apart from empty; decision-card supplies content and progress to the shared detail; one combined fixture with the real components across the 23 reference states at 1440 and 360, both list views, long titles and hover/focus/link bounds, with round 10 differences declared (AC-1)
  3f4e56ca94049c969c31a01e8aa1d96797c9b785 supplies the integrated layout, grouping, single row status, scoped source counts and retained details. capture-accepted-final/ has all 23 r8 states plus commander-first states; DIFFERENCES.md declares round 10 and host differences.
- DONE: Tests "reopen keeps the confirmed choice and reason", "sent and relayed progress survives a comms detour", "a recorded item never becomes actionable again", "switching items keeps separate drafts and rejects stale actions", "errors and progress stay with their own source and owner" (AC-2); one status-priority function with a table test over every waiting kind in LIST-AND-DETAIL.md, counts keeping pending items, excluding finished ones and telling an incomplete source from zero (AC-3); npm test and typecheck pass; branch pushed and a Draft PR titled "[flywheel, do not merge] ..." opened with base spacedock-ensign/r7-one-clear-way-to-decide (seventh stack layer)
  npm-test-accepted.log: all 152 tests pass; typecheck-accepted.log exits 0. Shared itemStatus/filterCounts are table-tested. pr68.json verifies OPEN/Draft PR #68 on the assigned base and exact pushed head.
- DONE: Resume from your held worktree state; the design reference is now /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r9-commander-first/design/COMMANDER-FIRST.md and /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r9-commander-first/mockups/ on top of /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r8-list-and-wide-detail/: home (default detail) is the comms officer conversation; a pinned Commander card tops the board and is never hidden by filters, showing a waiting question and its age on the card instead of a duplicate Questions row; By FO lists every FO, including FOs with nothing waiting, each opening its conversation; every drill-down inside Bridge has a fixed "← Commander" that returns in one step keeping selections, reason and message drafts, sent progress, the commander draft and conversation position; phone opens on the commander with a Board button; keep grouping, one status marker per row, filters with counts and the list beside the wide detail
  Commander is default; desktop entry is pinned, mobile opens its conversation, all FOs remain reachable, and each internal drill-down has a fixed Commander return. Browser pointer/keyboard checks retain separate drafts and restore conversation scroll 60 to 60 at both widths.
- DONE: Extend the named tests with "every drill-down returns to the commander in one step keeping drafts and progress" and "an FO with nothing waiting is reachable from By FO"; the combined fixture covers the r9-commander-first states (home, commander question, gate and FO drill-downs, return, progress board, phone home and drill-down) plus the round 8 states at 1440 and 360, with round 10 differences declared; npm test and typecheck pass; branch pushed and a Draft PR titled "[flywheel, do not merge] ..." opened with base spacedock-ensign/r7-one-clear-way-to-decide (seventh stack layer); a "## Stage Report: implementation" section
  The two requested Commander tests, original five continuity tests, recorded-reopen test and two extra regressions run with the status/count table. capture-accepted-final/ contains 82 state/view captures plus 8 hover/focus captures at 1440/360; source-identity.json and safety.json bind them to 3f4e56c.
- DONE: Do not wait for a host capability and do not use host history: items recorded during this session stay reachable at the end of the board under the existing "done" status marker, outside every count and filter total, never actionable, reopening to their result and reason; the memory lives in plugin state for the session only (no storage, no history page); test "a recorded item reopens to its result and reason this session and is never actionable"; declare this navigation difference from the mockups in the fixture's round 10 / differences list; then continue the checklist of implementation-1-followup-1 (push, Draft PR, stage report)
  Done this session at the board end reopens retained result/reason, stays outside pending/filter counts, and exposes no decision actions. The requested named mounted test passes; recorded-reopened/back-list captures and DIFFERENCES.md show the FO-authorized navigation difference.

### Summary

Implemented the commander-first session navigation and shared detail at 3f4e56ca94049c969c31a01e8aa1d96797c9b785, pushed as Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/68 on the seventh stack layer. The bounded browser proof and all 152 tests pass; independent validation, design acceptance and the FO's exact-head RoboRev remain subsequent work.

### Findings

- Choice/reason and sent/relayed tests fail if a detour remounts the card or clears its claim; recorded tests fail if terminal items become actionable, disappear from session navigation, lose their reason or enter pending totals.
- Separate-draft/stale-action and source-owner tests fail on a shared draft target, a hidden card claiming after a deferred target check, or a comms read failure appearing as an empty/other-officer conversation. Ordinary-message regression fails if a discussion consumes decision controls.
- Commander-return/no-waiting-FO and desktop-default tests fail if return needs two steps, the roster derives from the queue/filter, or desktop Board leaves an empty detail. Both browser widths retain the Commander DOM conversation/draft and scroll 60 to 60 while a confirmed decision is sent once.
- The status table covers permission, open/closed/recorded gate, sent/relayed/overdue, FO/comms question, assigned/unassigned review, loading/failure and tab-closed input. Counts retain pending progress, exclude terminal entries and reject an incomplete source represented as zero.
- Package checks: comment-ratio.log reports 240 code lines, 0 comment lines, 0.0% against maximum 5%; adr-lint.log checks 7 records; number-guards-head.log PASS, no migration path or migration changes. R4 package gap 3 did not trigger. doc-impact.json lists 0 affected documents; OVERVIEW.md was updated for the changed navigation. No ADR added or changed.
- SKIPPED: design_surfaces.py reports absent Surfaces/Visible change fields in the FO-owned task (known package gap 2); report retained as design-surfaces.log. SKIPPED: RoboRev daemon access (known package gap 5); FO runs the dispatched gate on pushed 3f4e56c with base 316c9ef.
- Capability boundary: existing useDraft/shared drafts and decision/relay/recording contracts remain unchanged. Retained mounted cards replace the old global sent presentation cache; no storage, history route, permissions, native approval or new host imports were added. The mockup host-history dependency returned to FO and follow-up 2 supplied the session Done route.
- Cleanup/limits: safety.json verifies matching candidate hashes, clean candidate/main/live worktrees, removed isolated homes and closed ports; captured PIDs were stopped and fresh browsers closed. Real provider delivery, physical phone keyboard/native accessibility and independent design acceptance are unverified. No live daemon/install, ready-state, merge or release action occurred.

### FO findings before the gate

- Roborev (FO-run, package gap 5) on 3f4e56c (roborev:1430): High — completion is keyed by workflow and task slug only, so recording one stage's gate hides the same task's next-stage gate from the queue and counts; Medium — a failed first briefing read never retries when the retained card is reopened and polling never starts, so decisions stay unavailable until reload. FO authorizes cycle 2.


## Stage Report: implementation (cycle 2)

- DONE: roborev:1430 High: completion and retained details are keyed per gate attempt (workflow, task, stage and attempt or briefing id), so a recorded gate never hides a newer open gate of the same task from the queue or counts; a test with successive stages of one task that fails on 3f4e56c
  Server/RPC/queue preserve the source workflow and briefing identity. Mounted tests cover successive stages and same-stage attempts while the old Done entry retains its result/reason and no actions; cycle-2/baseline-final-tests.log rejects 3f4e56c and scoped-tests.log passes the repair.
- DONE: roborev:1430 Medium: an unresolved briefing read retries when its retained card becomes active again (or from a visible retry control), keeping drafts, and polling starts once the briefing loads; a test for failed-first-read then reopen that fails on 3f4e56c; npm test and typecheck pass; push to PR #68 (still Draft); a short "## Stage Report: implementation (cycle 2)" section
  Reopen retries thrown/error replies without clearing message drafts; loaded open briefings poll without a prior send. Stale failed reads cannot overwrite a successful reopen. cycle-2/npm-test.log passes 159 tests; typecheck.log exits 0; pr68.json verifies Draft/open, assigned base and pushed head 625c62841250d951c89a75190c6feefdc7f5ee5f.

### Summary

Repaired attempt-scoped completion/detail identity and recovery of retained briefing reads in 625c62841250d951c89a75190c6feefdc7f5ee5f, pushed to existing Draft PR #68. Seven new tests pass with all 159 tests and typecheck; independent exact-head RoboRev remains with the FO.

### Findings

- Five core regression cases fail against exact 3f4e56c: two later-attempt variants, thrown/error first-read variants, and server/RPC/attachment/queue identity across distinct workflows. The new server test also preserves identity without a waiting-time commit. Two supplementary tests cover active replacement and late failure; all seven pass on the repair.
- The first expanded baseline run stalled in a supplementary case after four reproduced failures and was interrupted; baseline-interrupted.log is retained. The bounded core replay exits 1 with five failures; baseline-final.json and baseline-cleanup.json record its scope and removal. No temporary baseline root remains.
- cycle-2/safety.json verifies exact committed source bytes, pushed SHA, clean candidate/main/live worktrees and no temporary baseline roots. Existing owner routing, draft storage, Confirm/reason rules, permissions, sending/relay/record contracts and host imports remain unchanged; OVERVIEW.md describes the recovery/identity behavior.
- Package checks pass: comment-ratio.log 1/33 code lines, 3.0% against 5%; adr-lint.log seven records; number-guards.log PASS with no migrations path; doc-impact.log zero referenced documents. No ADR or migration added.
- SKIPPED: design_surfaces.py retains known package gap 2; no layout change or new browser capture in cycle 2. Original visual evidence remains bound to 3f4e56c. SKIPPED: RoboRev daemon access, package gap 5; FO reruns on pushed 625c628. No ready-state, merge, release or live daemon/install action occurred.
- Roborev:1432 on 625c628: two Medium in the retained-detail class that 1430's Medium opened — a retained decision card reads and validates its original gate with the officer's latest workflow directory; a retained chat never retries a failed read on reactivation. FO authorizes one class-level repair (cycle 3): every retained surface keeps its own identity and re-reads unresolved data when it becomes active.


## Stage Report: implementation (cycle 3)

- DONE: roborev:1432 and its class: every retained surface (decision card, FO and commander chats, and any other reader kept mounted across navigation) carries its own identity captured when opened — gate attempt with its own workflow directory, recipient, source — and never takes identity from the officer's latest row; every retained reader that is unresolved or failed re-reads when its surface becomes active and offers a retry control, keeping drafts; one table test over the retained surfaces × (identity changed upstream, failed read then reactivate) that fails on 625c628
  c916545b044c65580be629b1c8385b0aa5ce2645 captures opened officer/recipient/source and uses gate.workflowDir for reads and validation. Eight retained-reader table rows cover upstream identity changes, failed reactivation, explicit retry and pending-read recovery with drafts; cycle-3/baseline-final-tests.log rejects exact 625c628 with 49 failures of 55, while all 55 pass in npm-test.log.
- DONE: npm test and typecheck pass; push to PR #68 (still Draft); a short "## Stage Report: implementation (cycle 3)" section
  cycle-3/npm-test.log and tests.json: 214 pass, zero fail; typecheck.log exits 0. pr68.json confirms OPEN/Draft, assigned base and pushed c916545b044c65580be629b1c8385b0aa5ce2645; safety.json verifies clean candidate/main/live and committed-source identity.

### Summary

Closed the retained-reader repair class across detail identity, briefing, decision record, relay status, FO/review/Commander conversations, Commander question/connection, subscriptions and the retained phone Board. The existing Draft PR #68 now points to c916545b044c65580be629b1c8385b0aa5ce2645; independent exact-head RoboRev remains with the FO.

### Findings

- The table covers gate briefing, gate discussion, assigned-review discussion, FO discussion, Commander discussion, decision record, relay status and Commander question. It fails if reopening adopts a latest officer row, changes recipient/title, uses the officer workflow instead of the gate source, loses a draft, lacks retry, or ignores a failed/pending reactivation. A separate source-workflow case also checks validation before Confirm.
- Supplementary cases exercise subscription-ready and error-event failures, connection failure through reactivation/manual retry, and phone Board gates/tasks/review-source and FO-question recovery. Pending-reader cases reject older reads after recovery; restored results and drafts must survive. Each status reader owns its errors, so briefing success cannot erase a relay/decision-record failure.
- Retained details keep their opening identity; live Board discovery still follows the current fleet using guarded request identities. Board reactivation retries incomplete sources. Review source retry reads existing poller state and does not request a new GitHub poll, permission or integration. Existing draft store, Confirm/reason rules and decision/relay/record contracts remain unchanged; OVERVIEW.md describes the behavior.
- Evidence is in cycle-3/. A baseline diagnostic timed out while Node formatted a failed DOM-object equality assertion; presence assertions now use booleans, and the full bounded replay exits 1 with 49 failures and 6 passes. baseline-before-boolean-assertions.log retains the diagnostic; baseline-cleanup.json/runtime-cleanup.json verify temporary cleanup and no surviving baseline test children. No daemon/browser was launched.
- Package checks pass: comment-ratio.log 0/133 code lines, 0.0% against 5%; adr-lint.log seven records; number-guards.log PASS, no migrations path; doc-impact.log zero referenced documents. No ADR or migration added.
- SKIPPED: design_surfaces.py known package gap 2; no new browser/provider/native-device proof in cycle 3, and original visual captures remain bound to 3f4e56c. SKIPPED: RoboRev daemon access, package gap 5; FO reruns on pushed c916545. No ready-state, merge, release or live daemon/install action occurred.
- Roborev:1437 on c916545 (Medium): a retained card keeps a loaded decision claim and never rechecks it, so a claim released by another client still shows as sent and hides the decision controls until reload — the third finding in the retained-surface class. FO called chief-engineer before any further repair.
- Chief-engineer drift call (2026-11-03): converging; the cycle 3 freshness rule was incomplete. Keep surfaces mounted (smaller and safer than remounting). Single rule: on reactivation refresh every mutable server-derived value under its captured identity, without overwriting a newer local submission or reopening a recorded decision. Repair 1437 with authoritative null clearing and race protection; declining it is inappropriate because failed sends release claims and the stale display blocks the decision journey. No ADR 0008 stop is established by roborev counts. FO authorizes cycle 4.


## Stage Report: implementation (cycle 4)

- DONE: Single rule for every retained surface: on reactivation, refresh every mutable server-derived value (briefing, claim and progress, gate state, conversation) under its captured identity, not only unresolved reads; an authoritative null clears a released claim; a refresh never overwrites a newer local submission still in progress and never makes a recorded decision actionable; extend the retained-surface table test with "claim released by another client then reopen" (fails on c916545) and "refresh read overlaps a local send" (the local send wins)
  b15870e178be97eafc9b13dd044dc64a948af6ea refreshes retained mutable readers on every reactivation, clears authoritative released claims and cached progress, and guards reads with local submission revisions while preserving terminal records. cycle-4/baseline-final-tests.log: 55 pass/18 fail on exact c916545; scoped-tests.log: all 73 pass on the repair.
- DONE: npm test and typecheck pass; push to PR #68 (still Draft); a short "## Stage Report: implementation (cycle 4)" section
  cycle-4/npm-test.log and tests.json: 232 pass/0 fail; typecheck.log exits 0. pr68.json verifies Draft/open on the assigned base at pushed b15870e178be97eafc9b13dd044dc64a948af6ea. safety.json binds committed bytes, remote head and clean candidate/main/live worktrees.

### Summary

Applied one freshness rule to the existing mounted surfaces: reactivation refreshes mutable state under its captured identity regardless of previous success. Authoritative null clears a released claim, newer local submissions win over overlapping reads, and recorded results remain terminal; Draft PR #68 is pushed at b15870e178be97eafc9b13dd044dc64a948af6ea for FO verification.

### Findings

- Eighteen added cases extend the retained-surface table for loaded briefing, claim, relay, gate/FO/review/Commander conversation and Commander question updates, plus phone Board live sources. The named released-claim case fails if null preserves the old claim; its cached-local-progress companion also rejects a leftover Sent marker. Draft and mounted-composer assertions remain active.
- The named overlapping-send cases cover stale null and stale external claims read before a local send, and reads begun during the send but completed afterward; local reason, claim and single delivery must win. Briefing overlap cases reject a stale closure while permitting an authoritative recorded result, which never regains decision controls after later null reads.
- Reactivation now refreshes successful readers as well as incomplete readers; open-card polling also refreshes claims. Changed claim identity resets relay progress. Read request generations and local submission revisions reject older mutable responses/errors while a valid recorded result remains sticky. Surfaces stay mounted; no general recovery layer or round 10 redesign was added.
- The first full suite caught the existing board-retry test's one-subscription cleanup assumption. That assertion now checks every successful initial/reactivation subscription was released; npm-test-before-lifecycle-expectation.log preserves the failure. The final full suite passes. baseline-final.json/baseline-cleanup.json show the bounded baseline test exited without timeout and its temporary checkout was removed; no daemon/browser was launched.
- Package checks pass: comment-ratio.log 0/56 code lines, 0.0% against 5%; adr-lint.log seven records; number-guards.log PASS with no migration path; doc-impact.log zero referenced documents. OVERVIEW.md documents the freshness rule; no ADR, migration, draft-store, permission, Confirm/reason, message routing or recording-contract change.
- SKIPPED: design_surfaces.py known package gap 2; no new browser/provider/native-device proof, and original visual captures remain bound to 3f4e56c. SKIPPED: RoboRev daemon access, package gap 5; FO reruns against pushed b15870e. No ready-state, merge, release or live daemon/install action occurred.
- Roborev:1440 on b15870e: High — gates with the same task slug in two workflows both attach to the first officer whose task matches the slug, so the second gate's decision is sent to the wrong officer; Medium — gate drafts and sending state are keyed by officer, slug and stage only, so two distinct retained gates share drafts and choices. A new class opened by cycle 2's per-attempt keys: gate identity not scoped by workflow everywhere. FO authorizes one class-level repair (cycle 5): one gate-identity key (workflow, task, stage, attempt or briefing) used for ownership, drafts, sending state and choices, with an audit of every key that names a gate.


## Stage Report: implementation (cycle 5)

- DONE: roborev:1440 and its class: define one gate identity (workflow directory, task slug, stage, and attempt or briefing id) in one shared function and use it everywhere a gate is named — ownership (prefer the officer matching both workflow and task before any fallback), message and reason drafts, sending state, chosen decision, completion and retained details; list in the stage report every key you changed and every place that names a gate and already used it; tests: "identical slugs in two workflows keep separate recipients" and "two retained gates sharing officer, slug and stage keep separate drafts, choices and sending state", both failing on b15870e
  a30049f2a2ef57c2b01a6da5592a246951fb4bc3 introduces shared gateKey and routes all plugin gate keys through it; exact workflow/task ownership wins before existing fallbacks. Both named mounted regressions (including workflow and briefing variants) and the strengthened server/RPC/queue recipient test fail on exact b15870e (four failures) and pass on the repair; see cycle-5/baseline-final-tests.log, scoped-tests.log and npm-test.log.
- DONE: npm test and typecheck pass; push to PR #68 (still Draft); a short "## Stage Report: implementation (cycle 5)" section
  cycle-5/npm-test.log/tests.json: 235 pass/0 fail; typecheck.log exits 0. pr68.json verifies Draft/open, assigned base and pushed a30049f2a2ef57c2b01a6da5592a246951fb4bc3. safety.json verifies committed bytes, exact remote head and clean candidate/main/live worktrees.

### Summary

Unified gate naming with one shared gateKey(workflow, slug, stage, briefing/attempt) and corrected identical-slug recipient selection before legacy fallbacks. The new key isolates retained message/reason drafts, choices and sending locks without changing their storage lifecycle or decision/recording protocol; Draft PR #68 is pushed at a30049f2a2ef57c2b01a6da5592a246951fb4bc3 for FO verification.

### Findings

- Canonical key: shared/gate-identity.ts gateKey serializes the existing g/workflow/slug/stage/briefing tuple. GateIdentityFields is shared by AwaitingGate and CoChat. ID-less legacy inputs retain the existing preparedAt/null fallback; no identity is invented and no storage or history is added.
- Changed server keys: server/tasks.ts readGatesInner.seen deduplication and server/gate.ts preparedCache now call gateKey. Changed ownership key: shared/board.ts attachGates compares a row's workflow/task in the complete gate identity before the existing task-only and workflow-only fallbacks.
- Changed queue key: shared/queue.ts QueueItem.key calls gateKey with the source workflow (officer workflow only when absent). Its serialized full identity is unchanged from cycle 2; this replaces its private tuple construction with the shared function.
- Changed draft key: shared/drafts.ts draftKey now combines recipient and gateKey. This changes the namespace for message drafts, sending Set, draft subscribers, decision-composer word/reason/target drafts and their listeners, plus CoChat's retained React key; useDraft, seeding, clearing, edit protection and notification lifecycles are unchanged.
- Changed detail keys: DecisionCard's sentByBriefing map becomes sentByGate keyed by gateKey; decisionTarget/currentTarget uses recipient + shared key + briefing ID/digest freshness tokens. The captured source workflow is passed into CoChat before draftKey is computed. Board's gate-state type now preserves all identity fields explicitly.
- Already complete/derived keys: Board open, visited, progress/reportProgress, recordedItems, pending/filter exclusions and retained React detail keys all use QueueItem.key. CoChat useDraft/readDraftSending, decision reason snapshots/handlers and subscriptions already consumed the supplied draft key; they now inherit the complete identity through draftKey without a second identity function.
- Already qualified source lookups: DecisionCard captures gate.workflowDir and reads workflow/slug/stage/briefing ID; beforeSend checks the current attempt in that workflow/stage. server/gate.ts resolves the workflow's entity path and stage attempt, and resolution lookups use briefing ID within that entity. Those source and stale-action guards remain intact.
- Unchanged protocol references: shared/decide.ts and shared/relay.ts send the existing FO id, slug, stage, briefing ID/digest and decision words. server/decisions.ts claim/read use the existing briefing-ID token and release uses decisionId; relay receipts use captured claim.foId/decisionId. These backend transport/record references are unchanged; no message, claim schema, authoritative gate record or Confirm/reason change was made.
- Falsifiers: the recipient test sends both same-slug workflows' decisions and checks actual FO ids in claims/messages. The retained tests keep an ordinary send pending while a second workflow/briefing chooses and confirms independently; old message/choice/reason/sending lock remain scoped, its eventual clear cannot clear the second draft, and both mounted composers survive. The pipeline test checks exact source workflow equals recipient workflow through server/RPC/attachment/queue.
- Evidence: an initial message assertion used an incorrectly escaped regex; red-before-message-assertion.log/green-first.log retain that diagnostic. The assertion now checks the literal recipient string; the final bounded original-source replay fails all four core cases without timeout. baseline-cleanup.json removes its temporary checkout; no daemon/browser was launched.
- Package checks pass: comment-ratio.log 0/40 code lines, 0.0% against 5%; adr-lint.log seven records; number-guards.log PASS, no migration path; doc-impact.log zero referenced documents. OVERVIEW.md describes identity/ownership; no ADR or migration added.
- SKIPPED: design_surfaces.py known package gap 2; no new browser/provider/native-device proof and original visual captures remain bound to 3f4e56c. SKIPPED: RoboRev daemon access, package gap 5; FO reruns on pushed a30049f. No round 10, ready-state, merge, release or live daemon/install action occurred.
- Roborev:1441 on a30049f (Medium): decision records and claims match by briefing id only; two workflows sharing a briefing id would share a claim, hiding one card's controls and rejecting its send. FO check: the server's decision store (server/decisions.ts, claim and read by briefingId) already matched by briefing id at the stack base 316c9ef — a pre-existing limit surfaced by round 9's per-workflow gates, not a round 9 regression. Repairing it changes how the decision store matches records, which ADR 0008 keeps with the Captain (decision recording), and it is the sixth head with findings this round; FO stops and asks the Captain before any repair.

- Pre-gate team pass 1 on a30049f: design director NOT SATISFIED, block — the board headline "Waiting on you · 7" counts items waiting on someone else (sent, relayed); make it neutral, e.g. "Board · 7", keeping per-row status and counts; layout, Done section and host differences accepted. Picky B NOT SATISFIED (annoys, the same headline). Picky A NOT SATISFIED (annoys, the same headline; and an FO with nothing waiting is labelled "QUESTION" and "waiting 9m" in its detail). FO authorizes one repair (cycle 6). Under ADR 0008 a second unsatisfied team pass on this round stops and asks the Captain.

- Roborev:1445 on fdd9081: High — decision claims match by briefing id only (the same finding as 1441, now rated High, no new evidence of the trigger); it stays under the Captain's known-risk ruling in `### FO declines`. Medium — a retained question detail is keyed by officer only, so a later question from the same officer opens with the first question's frozen title. FO authorizes cycle 7 for the Medium.

### FO declines

- roborev:1441 on a30049f2a2ef57c2b01a6da5592a246951fb4bc3 — decision records and claims match by briefing id only, so two workflows with the same task slug at the same stage would share a claim. Declined as a known risk by the Captain's ruling 2026-11-03, asked 「決定紀錄只用簡報編號辨認（兩個工作流程有同名任務、同階段時會混淆），這輪要怎麼處理？」, answered 「先記成已知風險 (Recommended)」. Pre-existing at 316c9ef (server/decisions.ts). Would become Material: when two watched workflows hold open gates with the same task slug and stage at the same time, or a card shows a decision as sent that the Captain did not make.


## Stage Report: implementation (cycle 6)

- DONE: Board headline: neutral wording that does not claim everything waits on the Captain (for example "Board · 7"), in both views and both widths, with per-row status markers and filter counts unchanged; a test that a sent or relayed item never appears under a "waiting on you" claim
  fdd9081fb1e842f053138c72d3627a5653fbe858 uses Board · count in both views/widths. Eight sent/relayed × decision/FO × compact/wide cases assert the neutral headline, unchanged status markers and pending/filter counts; all fail on a30049f and pass on this head.
- DONE: An FO opened from By FO with nothing waiting shows no "QUESTION" label and no "waiting" age in its detail — only the conversation with that FO; a test for that case; re-capture the changed states at 1440 and 360 one at a time at the new head; npm test and typecheck pass; push to PR #68 (still Draft); a short "## Stage Report: implementation (cycle 6)" section
  FO roster entries render conversation-only detail without QUESTION, waiting age, resize grip or briefing controls; two width cases retain drafts and send to the same FO. cycle-6/npm-test.log/tests.json: 245 pass/0 fail; typecheck.log exits 0. Fourteen changed-state PNGs at this head are verified in capture-verification.json; pr68.json confirms Draft/open, assigned base and pushed fdd9081.

### Summary

Made the Board headline neutral while preserving pending counts and per-row statuses, and removed invented question/waiting presentation from the FO roster's general conversations. Draft PR #68 is pushed at fdd9081fb1e842f053138c72d3627a5653fbe858 with 245 passing tests, typecheck and fourteen isolated-host captures; decision-record matching is unchanged as directed.

### Findings

- Headline tests fail if sent/relayed rows sit under a waiting-on-you claim, pending counts shrink, or Waiting for relay/record markers change. Conversation tests fail if an idle FO is labelled QUESTION, gets a waiting age/briefing control, remounts its composer on return, loses its draft or sends to another recipient. baseline-final-tests.log rejects exact a30049f with all ten failures; scoped-tests.log passes all ten.
- Capture coverage: capture-1440/ and capture-360-final/ each contain seven PNGs: Board, sent and relayed in By decision and By FO, plus the no-waiting FO detail. Runs were sequential with separate isolated homes, captured PIDs, fresh browser profiles and ports outside the forbidden ranges. capture-verification.json matches every tracked package source hash and both head.json records to fdd9081, checks all fourteen PNG hashes and no horizontal overflow, and records conversation-only detail assertions.
- The capture uses real product JSX loaded by an isolated Paseo host with a synthetic RPC/timeline adapter; only dependency injection and the disposable server port change. Both new fixture gates include their briefing identities. The first phone harness run clicked the host menu even though Bridge was already displayed and failed before capture; capture-360.log and cleanup.json retain it. The visibility-aware retry succeeded and kept the headline in frame; no product edit followed the tested commit.
- scope-check.json confirms shared/list-status.ts and all server/shared decision, gate and relay files are unchanged, as is DecisionCard's read/claim/relay/record logic. RoboRev 1441 remains the Captain-declined known risk; no decision-record matching repair was attempted. Actual question rows keep their existing question detail; only FO roster conversation entries bypass that presentation.
- safety.json verifies exact pushed source bytes and clean candidate/main/live worktrees. Both successful capture homes and the failed phone run were deleted, their captured daemons stopped, browsers closed and all six isolated ports closed; no temporary baseline/capture roots remain. No live install or daemon mutation occurred.
- Package checks: comment-ratio.log reports 7 added code lines/0 comments, with threshold not enforced below 20 lines; adr-lint.log seven records; number-guards.log PASS, no migration path; doc-impact.log zero referenced documents. OVERVIEW.md describes the neutral headline and general conversation; no ADR or migration added.
- SKIPPED: design_surfaces.py known package gap 2; RoboRev daemon access known package gap 5, FO reruns on pushed fdd9081. New captures cover the changed states only; the earlier complete 90-image fixture remains bound to 3f4e56c. No physical-phone/provider proof, round 10 redesign, ready-state, merge or release action occurred.


## Stage Report: implementation (cycle 7)

- DONE: roborev:1445 Medium: a retained question detail takes its identity from the question (officer plus the question's own message or timestamp), so a later question from the same officer opens with its own title and age while the recipient and drafts are kept; a test where one officer asks two questions in turn, failing on fdd9081; do not change decision-claim matching (the Captain's known-risk ruling on 1441/1445 High)
  224b03f2da6eefc89d7a055ac95be2d858eaa5c5 keys question details by officer plus message/time/title, preserves timeline message identity/time, and passes the captured question time to detail. Four labelled/reply × wide/compact consecutive-question cases plus three repeated-question cases fail on exact fdd9081; all nine new cases pass on this head. scope-check.json verifies decision-claim matching remains unchanged.
- DONE: npm test and typecheck pass; push to PR #68 (still Draft); a short "## Stage Report: implementation (cycle 7)" section
  cycle-7/npm-test.log/tests.json: 254 pass/0 fail; typecheck.log exits 0. pr68.json verifies Draft/open on the assigned base and pushed 224b03f2da6eefc89d7a055ac95be2d858eaa5c5. safety.json verifies committed source bytes, exact remote head and clean candidate/main/live worktrees.

### Summary

Fixed retained question identity so a later question from the same officer opens its own title and age while keeping the prior surface mounted and the existing recipient discussion draft. Draft PR #68 is pushed at 224b03f2da6eefc89d7a055ac95be2d858eaa5c5 with 254 passing tests and typecheck; the Captain's known-risk ruling on decision-claim matching remains intact.

### Findings

- Question keys replace a:officer/unread:officer with q/officer/message ID/question timestamp/title. Timeline-derived questions carry the last assistant entry's seqStart and timestamp through ReplyFact; label-derived questions use their question text and attention timestamp, borrowing reply metadata only when it represents the same question. General officer activity is excluded from identity. Existing legacy age fallback remains when the source has no own timestamp.
- Board passes the question's captured since value into DecisionCard so its waiting age follows that question rather than the officer's latest activity. Gate and review ages, gate identity, counts/status priority and ordinary FO conversation presentation are unchanged. Question classification and label/reply deduplication rules are unchanged.
- The named consecutive-question test covers labelled and timeline questions at both compact modes. It rejects a new row opening an old frozen title, checks the new question's own 3m age even when officer activity is newer, verifies the old surface remains mounted, reuses the new detail on reopen, preserves the existing recipient draft and sends the exact discussion text only to the same FO.
- Repeated-text cases independently vary message sequence, own timestamp or label attention timestamp and require a distinct detail. Two unrelated-activity cases require the same detail and age to survive an officer update. baseline-final-tests.log reports seven failures/two passes on exact fdd9081, without timeout; scoped-tests.log passes all nine. baseline-cleanup.json removes the temporary checkout.
- scope-check.json confirms server/shared decision and gate/relay files, shared gate identity, draft store, decision composer, useDraft and status/count logic are unchanged; DecisionCard's read/claim/relay/record logic is byte-identical. RoboRev 1441/1445 High is not repaired per the Captain's known-risk ruling. Discussion drafts keep their existing recipient scope across question details; no new storage, history, protocol or routing behavior is added.
- Package checks pass: comment-ratio.log 22 added code lines/0 comments, 0.0% against 5%; adr-lint.log seven records; number-guards.log PASS with no migration path; doc-impact.log zero referenced documents. OVERVIEW.md describes question identity/age; no ADR or migration added.
- SKIPPED: design_surfaces.py known package gap 2; RoboRev daemon access known package gap 5, FO reruns on pushed 224b03f. No new browser/provider/native-device proof was requested or produced; prior fourteen changed-state captures remain bound to fdd9081 and the full visual fixture to 3f4e56c. No live daemon/install, round 10, ready-state, merge or release action occurred.
