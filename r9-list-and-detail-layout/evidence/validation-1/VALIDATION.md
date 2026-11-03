# Independent validation of round 9

Candidate: 224b03f2da6eefc89d7a055ac95be2d858eaa5c5. Stack base: 316c9eff7bd6ce2f5e15db7382dea1aba1197a26. Draft PR: https://github.com/iamcxa/kc-paseo-plugins/pull/68, open and draft on the assigned base (pr68.json). Assessed only; no candidate commit, provider send, live install, PR edit or merge.

## Acceptance evidence

AC-1 PASSED within the accepted round 9 / round 10 split. Independently ran the combined fixture with real Bridge, Board, DecisionCard, CoChat and FeedbackPressable at 1440×1000 and 360×780. Selected evidence is captures/1440-*.png and captures-phone/360-*.png: 82 state/view images plus 8 hover/focus images. capture-verification.json checks every 32 named scenario at both widths, both list views, all 23 round 8 states, commander-first home/question, gate/FO drill-downs, idle FO, Commander return, progress, session Done/reopen and long links. No horizontal overflow; hit testing and keyboard focus/link containment succeed. exact-source.json compares all 82 captured source files directly with candidate Git blobs, independently of the earlier implementation screenshots.

Compared all reference screenshot sheets under r9-commander-first/mockups/ and r8-list-and-wide-detail/mockups/ with these fresh candidate pictures; contact sheets are retained here. Desktop keeps the pinned Commander entry and a 330-pixel list; phone opens on Commander and keeps the fixed Commander return. Source failure is distinct from empty/loading; counts retain sent/relayed items, remove finished items and mark incomplete sources. The idle FO opens only its conversation. The full reference examples use different fictional content; equal fixture text is not claimed.

Accepted differences remain those in ../DIFFERENCES.md: host chrome/palette/fonts and its 320-pixel sidebar reduce available detail width; current decision detail order, wording, proportions and phone action placement belong to round 10. Commander-first replaces round 8's empty home; the session Done section replaces mockup host-history reopening. It is outside counts/filters, and recorded details have no decision controls. The neutral Board headline and conversation-only idle FO are the accepted later corrections recorded in the task. No additional unapproved difference affecting AC-1 was observed. Visual assessment here does not replace the task's separately recorded design-director decision.

AC-2 PASSED. Independent npm ci, npm run typecheck and npm test succeeded (254/254); tests.json contains all test names. The five named continuity tests plus Commander return, idle-FO reachability and recorded-reopen tests exercise actual mounted components. The fixture also keeps independent Commander/reason/FO-message drafts, sends one decision, and restores conversation scroll from 60 to 60 at both widths. Removing visibleRef.current from DecisionCard's before-send predicate makes the stale-action test fail with one unwanted claim instead of zero; continuity-mutation.log records that behavioral failure.

AC-3 PASSED. shared/list-status.ts is the sole status-priority implementation used by board rows, Commander and comms questions; filterCounts supplies kind totals. The table covers permission, gate open/sent/relayed/recorded/closed/overdue, FO/comms question, assigned/unassigned review, failed/loading source and closed tab. Counts retain pending progress, exclude finished items and distinguish unknown from zero. Disabling the failed/problem/overdue priority branch makes the table fail (status-mutation.log). Both mutations ran only in disposable copies, removed afterward (mutations.json).

## Scope and necessity

scope.json compares the stack-base and candidate bytes of shared/composer.ts, shared/decision-composer.ts, shared/decide.ts, shared/relay.ts, server/decisions.ts, client/use-draft.ts, shared/control.ts, server/control.ts, shared/coordinator.ts, server/coordinator.ts and paseo-plugin.json; all are unchanged. These own Confirm and required-reason handling, separate discussion sending, decision transport/relay, claim matching/records, permission control and coordinator behavior. DecisionCard/CoChat changed retention, visibility, source refresh and presentation; shared/drafts.ts changed the per-gate namespace, preserving its memory-only lifecycle. No new persistent store, history page, native permission approval, host capability or autonomous commander authority was added.

Goal sufficiency: the accepted navigation and session-continuity journey works with the real components at the exact candidate. Minimal necessity: Bridge/Board own layout and retained navigation (AC-1/2); list-status owns status/count truth (AC-3); gate identity, source ownership, draft namespaces and retained readers prevent the independently tested cross-attempt/source failures (AC-2); question identity preserves the accepted drill-down's own title/age; OVERVIEW describes those behaviors. No unrelated product surface remains in the 27-file diff. The one added code comment explains why gate identity survives missing waiting-time data. comment-ratio.log is 1/488 lines, 0.2%, passing the 5% maximum.

The Captain's known-risk ruling on briefing-ID-only decision-claim matching, including RoboRev 1441/1445/1450, is unchanged: server/decisions.ts is byte-identical to the stack base. The FO's settled replacement-attempt race disposition remains unchanged. This validation found no new trigger evidence and does not reopen either finding. No new Material or Needs decision finding; no POC boundary crossing observed.

## Tool checks and limits

adr-lint.log: exit 0, seven records; no new/changed ADR or reservation. adr-authority.json pins accepted ADR 0008 to the candidate and its digest. doc-impact.log: exit 0, zero listed references; OVERVIEW.md was updated and its changed claims were checked against the tested behavior. dispatch-records.log: exit 0, ten complete records read and traced to the task's criteria or recorded rulings. number-guards.log: exit 0, no migration path declared or candidate migration change; known R4 package gap 3 did not trigger. SKIPPED design_surfaces.py: exit 1 for missing FO-owned Surfaces/Visible change fields, known package gap 2. RoboRev not run by this worker, package gap 5; FO owns its exact-head gate.

Browser fixtures use synthetic RPC/timelines and an isolated real Paseo plugin host. No real provider delivery, actual decision recording, permission response, native screen-reader painting or physical-phone keyboard was exercised. Historical briefing retrieval and round 10 detail redesign remain outside scope. No claim of production readiness, approval, merge or live adoption.

The inherited capture tool needed three evidence-only adaptations: current fixture gate IDs and the visibility-aware host-menu handling from cycle 6; phone Board refresh before injecting a recorded state; complete-PID-file readiness before reading its JSON. The first full run retained all desktop images before the old phone sequencing failed; the successful phone rerun covers the complete phone matrix. The first acceptance run hit the PID-file race; acceptance-failed-cleanup.json records stopping its own captured daemon and removing its home. Failed attempts remain in their logs. No product repair was made.

## Minimal acceptance script

Run in a fresh shell:

```sh
python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r9-list-and-detail-layout/evidence/validation-1/acceptance.py
```

The script creates a new unique /tmp/r9-acceptance-* directory without overwriting an existing path; prints its path; uses the exact worktree above; and fails if it is dirty or has another head/branch. Optional --output accepts only a new directory. Required local tools are python3, node/npm, /Users/kent/.local/bin/paseo, /Users/kent/.npm-global/bin/agent-browser with its browser installed, and /Applications/Paseo.app/Contents/Resources/app-dist. npm registry/cache access and local loopback sockets are required. These are declared machine dependencies, not repository-only portability claims.

The five steps and exact expected lines are:

1. Verify exact head, assigned branch and clean candidate: `STEP 1 PASS: exact candidate and clean assigned branch`.
2. Run npm ci, npm run typecheck and npm test in spacedock-bridge: `STEP 2 PASS: npm ci, typecheck, 254 tests / 0 failed`.
3. Capture the 1440 board, both views and long-link hover/focus in its own isolated host: `STEP 3 PASS: 1440 board, both views, long links, hover/focus`.
4. Only after step 3 finishes, capture the same 360 cases in another isolated host: `STEP 4 PASS: 360 board, both views, long links, hover/focus`.
5. Compare captured hashes, check captured PIDs/ports/homes and clean candidate: `STEP 5 PASS: source hashes match, daemon stopped, ports closed, homes removed, candidate clean`.

Each underlying command is fully specified in acceptance.py and writes its own log; captures run one at a time. The short script checks the core board at both widths plus all component tests. It does not repeat the full 90-picture matrix, the two mutation probes, human visual comparison or any provider/native-phone check. Those independent results remain in this evidence folder. FO still reruns this exact script before its gate.
