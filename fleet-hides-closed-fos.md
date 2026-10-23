---
title: Flywheel round 2 — FOs whose Paseo tab is closed carry a Closed badge, and the composer has no web focus outline
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
gates:
    version: 1
    records:
        - id: gate:fleet-hides-closed-fos:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:fleet-hides-closed-fos-backlog-1
              briefing:
                id: briefing:fleet-hides-closed-fos:backlog:attempt-1:revision-1
                digest: sha256:6b2959fe21ea3a51a815bdb3b60cfe530c08b699b67229dfe419d0f22e12185c
                room-ref: ./fleet-hides-closed-fos/review/backlog/briefing-1
              withdrawal:
                by: agent:first-officer
                at: "2026-10-23T14:57:43.084643Z"
                reason: 'Seed amended before decision: the first step must read real tab labels read-only from the live daemon, not close a tab in the Captain''s app.'
            - id: gate-attempt:fleet-hides-closed-fos-backlog-2
              briefing:
                id: briefing:fleet-hides-closed-fos:backlog:attempt-2:revision-1
                digest: sha256:e0def32c46dafe670cd332551bb106194f799a662ceaba8fd8749dc86c053510
                room-ref: ./fleet-hides-closed-fos/review/backlog/briefing-2
              resolution:
                type: Resolution
                id: resolution:spacedock:fleet-hides-closed-fos:backlog:2
                briefing: briefing:fleet-hides-closed-fos:backlog:attempt-2:revision-1
                by: agent:first-officer
                at: "2026-10-23T14:58:25.605778Z"
                decision: approve
                reason: 'Flywheel round 2 backlog gate under ADR 0008: theme chosen by the Captain in round 1 UAT; rule and display from design-partner and chief-engineer triage; no security, permission, relay/recording, release, outward or merge change.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md (ADR 0008, merged by the Captain in PR #38, 78ce6c1c), Captain chat 2026-10-23'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-23T14:58:54Z
worktree: .worktrees/spacedock-ensign-fleet-hides-closed-fos
---

Round 2 of the POC flywheel under ADR 0008: the Captain cannot tell a live FO from one whose Paseo tab he closed, and a rectangular browser focus outline appears around the composer input after he types.

Captain, 2026-10-23: 「已經在 passeo 內關閉的 FO 對話，仍會出現在 fleet 內，該怎麼辦？怎樣偵測才合理？」; in UAT of PR #34: 「我覺得可能要可以區分 FO 是否已經 inactive 例如已經把 tab 關閉」; round 1 UAT option answers: most bothersome 「關閉的 FO 分不出來」, next 「區分關閉的 FO (Recommended)」; and 「這個奇怪的綠色框線可以移除嗎？輸入文字後才出現的」.

bite: on 2026-10-23, `mcp__paseo__list_agents` showed role=fo agents with `archivedAt: null`, status `error` or `idle`, and every `paseo.open-agent-tab.<client>` label `"false"`; `boardStatus` in `shared/board.ts` treats only `archivedAt` or status `closed` as offline, so they look live. The composer `TextInput` in `client/co-chat.tsx` sets no outline style, so react-native-web draws the browser focus outline outside the rounded border (Captain's screenshot, 2026-10-23).
consumer: the Captain, reading the Bridge.

## Scope

- Signal: Paseo stores `paseo.open-agent-tab.<client-id>` = "true"/"false" per agent; Paseo's own app code defines `hasOpenAgentTab(labels)` as any such label being "true" (Paseo 0.12 app bundle, 2026-10-23; not in plugin SDK docs).
- Rule (design partner Astra, 2026-10-23; chief-engineer agreed): an FO is "Closed" only when at least one such label exists, every such label is "false", and the agent is not running. No label (never opened) is not Closed; one "true" is not Closed; running is not Closed. Archived and status `closed` keep today's offline path, unchanged.
- Display: a neutral "Closed" badge beside the FO's name in By FO and on the owning FO in By decision rows and the next card. The FO keeps its group, position, contrast and tap behavior; nothing is faded, hidden or collapsed.
- Composer: on web only, the `TextInput` sets no browser outline (`outlineStyle: "none"`), keeping the rounded border's hover and focus change; native is unchanged; send and decision buttons keep their focus indicators.
- First implementation step (chief-engineer): read the real `paseo.open-agent-tab.*` values of existing role=fo agents from the live daemon, read-only (`paseo ls`/`list_agents`; no UI action, no install, no reload), and record which agents would be Closed; if they contradict the rule, stop and report without tuning the rule. Closing a tab and the phone half of the two-client check are the Captain's, at play time.
- Flywheel delivery (ADR 0008): the worker pushes its branch and opens a Draft PR with base `main` (first layer of the stack); nothing merges.
- Non-goals: hiding closed FOs, archiving agents, the By FO layout beyond the badge, board loading/error states (round 3 candidate).

## Acceptance criteria

**AC-1**: The Closed rule is right on its cases.
Verified by: `npm test` with cases: labels present, all "false", not running → Closed; no label → not Closed; one "true" and one "false" → not Closed; running with all "false" → not Closed; archived → offline path unchanged.

**AC-2**: The Captain can see which FOs are closed, and the composer has no outline.
Verified by: the recorded real label values of existing FOs; screenshots of the badge in By FO and on the owning FO in By decision; a web screenshot of the composer after typing with no rectangular outline.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 1 UAT; the rule and display come from the design partner and chief-engineer triage recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.


## Stage Report: implementation

- DONE: First step: read the real paseo.open-agent-tab.* values of existing role=fo agents from the live daemon read-only (paseo ls --json -g --label role=fo and per-cwd list; no UI action, install or reload) and record which would be Closed under the rule; if they contradict the rule, stop and report
  evidence/live-fo-labels.json: 13 FOs observed; OMP trial FO and recce PR review FO match Closed; Doc FO's mixed true/false does not; no contrary observation and no live mutation.
- DONE: The Closed rule and badge (By FO name, By decision rows and next card; nothing hidden, faded or moved; archived/closed offline path unchanged) with npm test cases for all five rule cases (AC-1) and isolated-daemon screenshots (AC-2)
  Candidate 66faf94de8777263478125ba2004b7a64a6d0bca; 78 tests pass, including all five cases plus unknown values; removing the Closed classifier fails the all-false test (negative-rule.txt); capture-3 shows every required badge, retaining groups/actions.
- DONE: Composer TextInput sets outlineStyle none on web only, keeping the rounded border's hover and focus change, with a web screenshot after typing (AC-2); branch pushed and a Draft PR opened with base main; External review rounds left to the FO
  capture-3/composer-typed-no-outline.png and observed-states.json prove focused typed input outline none and three distinct border colors; typecheck passes; Draft PR #40 targets main at 66faf94de877; external rounds left to FO.

### Findings

SKIPPED: design_surfaces — known package gap 2: missing Surfaces/Visible change seed markers; implementation cannot rewrite the approved seed. number_guards passed, so its known R4 gap 3 did not occur. Roborev not run — known package gap 5 and dispatch: FO runs the local gate and external review rounds on the pushed head.
No new ADR or migration reserved/added. ADR 0008 read at base 78ce6c1cbcf1258a7ddd7223ea2c93e02d29cc6c; digest in evidence/README.md. All six changed files map to the rule, badge, outline, fixture compatibility, or user explanation; classifier mutation exposes the pre-change missing signal. No persistent-state boundary crossed.
checks.json: comment_ratio 31 code lines, 0 comment lines, 0.0% <= 5%; adr_lint 7 records pass; doc_impact 0 documents listed; OVERVIEW.md updated to describe the new badge. npm/typecheck logs and harness are under this task's evidence directory, never in the candidate branch.
Successful isolated proof used ports 7061/7062, separate HOME/--home and a fresh browser profile blocking localhost; captured PID 18043 stopped and its home removed. capture-2 retains the failed uppercase-heading wait and successful cleanup; capture-3 passed and its three required screenshots were visually inspected. Native appearance, live two-client tab actions, installed deployment and Captain acceptance remain unverified.

### Summary

Delivered Closed badges and the web-only composer outline fix in one committed, pushed branch with Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/40 (base main), using the accepted POC scope. Tests, typecheck, classifier counterexample and isolated web screenshots establish the implementation proof; live main stayed clean and no live daemon, Release PR #18, ready state or merge was changed. External reviews and the Captain's physical tab/phone trial remain the FO's next work.


## Stage Report: implementation (cycle 2)

- DONE: roborev:1123 Low: the owner name next to the Closed badge (spacedock-bridge/client/board.tsx, the next-card owner row) gets flexShrink 1 like the names in the agent cards, so a long FO name truncates instead of pushing the badge offscreen; add a long-name case to the isolated screenshot capture showing the badge still visible
  Commit 03b96fb9f3dcef4e8f22910b1cce04bd46b28903 makes the one-line explicit style change; cycle-2-after/long-name-next-card.png and geometry assert ellipsis, shrink 1 and badge containment; screenshot visually inspected.
- DONE: npm test and typecheck pass; push to the same branch (PR #40 stays Draft); a short "## Stage Report: implementation (cycle 2)" section
  cycle-2-tests.log: 78/78 pass; cycle-2-typecheck.log: exit 0; PR #40 verified OPEN/Draft, base main, head 03b96fb9f3dc; branch pushed.

### Findings

Baseline web overflow was not reproduced: the dependency already computed flexShrink 1 and kept the badge visible. The baseline overflow-expectation assertion failed accordingly; cycle-2.md records the observation without claiming observed web harm was repaired. The authorized explicit constraint is now in product code.
cycle-2-checks.json: comment ratio 0.0% (maximum 5%); ADR lint seven pass; doc impact zero documents; number guards pass. No new ADR/migration. Roborev not run per dispatch; FO owns its next review. Prior design-surfaces gap 2 remains skipped.
Isolated after-proof used ports 7061/7062 and a fresh HOME/profile, captured PID 75212 stopped and temporary root removed; no live install/reload, main write, ready transition or merge. Native layout remains unverified.

### Summary

Applied only the authorized next-card name constraint and added a long-name screenshot case with measured badge containment. Evidence is in fleet-hides-closed-fos/evidence/cycle-2*; external review remains with the FO.
