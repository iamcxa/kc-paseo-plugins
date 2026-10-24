---
title: Flywheel round 4 — on a phone the briefing panel collapses fully, the composer follows the keyboard, and it clears the Android navigation bar
status: validation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r4-phone-layout
gates:
    version: 1
    records:
        - id: gate:r4-phone-layout:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r4-phone-layout-backlog-1
              briefing:
                id: briefing:r4-phone-layout:backlog:attempt-1:revision-1
                digest: sha256:25ddc8b232dd4fc1aeeea777908f7b3889f4a7d3fcabbf4f5a74b5648f62c289
                room-ref: ./r4-phone-layout/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r4-phone-layout:backlog:1
                briefing: briefing:r4-phone-layout:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-24T16:03:26.671198Z"
                decision: approve
                reason: 'Flywheel round 4 backlog gate under ADR 0008: theme chosen by the Captain in round 3 UAT with his three phone problems; scope from chief-engineer triage; Route A approximate padding inside the plugin; no Paseo upstream request (outward, his); no security, permission, relay/recording, release, outward or merge change.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md (ADR 0008, merged by the Captain in PR #38, 78ce6c1c), Captain chat 2026-10-23'
              application:
                target-stage: implementation
                state: consumed
        - id: gate:r4-phone-layout:validation
          stage: validation
          attempts:
            - id: gate-attempt:r4-phone-layout-validation-1
              briefing:
                id: briefing:r4-phone-layout:validation:attempt-1:revision-1
                digest: sha256:0791e9a7e2cf6f02325583e98cf887ba7afcd7e3351964266a4be20a2fc7f8d6
                room-ref: ./r4-phone-layout/review/validation/briefing-1
started: 2026-10-24T16:03:46Z
worktree: .worktrees/spacedock-ensign-r4-phone-layout
pr: 46
---

Round 4 of the POC flywheel under ADR 0008: on the Captain's Android phone, a long briefing hides the discussion, typed text disappears under the keyboard, and the composer and buttons overlap the Android navigation bar.

Captain, 2026-10-24, with an Android screenshot of a gate decision card: 「還有幾個手機問題，在手機上簡報面板應該要可以整個收合，不然比較長的健保會遮蔽到對話顯示空間，而且目前沒有偵測鍵盤開啟時ui要自動調整，導致看不到打字內容，按照截圖也可以發現，整個composer與按鈕太靠近底部，實際上有點蓋到android的底部的操作bar了」; round 3 UAT option answers: most bothersome 「手機版排版」, next 「手機版 (Recommended)」.

bite: at 8d9a68b9 (PR #42, his live install) the decision card's briefing panel has a minimum height (`MIN_TOP = 72` in `client/decision-card.tsx`) so it cannot collapse; the plugin screen gets no keyboard handling from the host (the SDK's keyboard positioning applies only inside its `Modal`); `PluginHostProps.layout` is `{ compact, platform }` with no safe-area insets, and his screenshot shows the composer over the navigation bar (chief-engineer reading of `@getpaseo/plugin` types and the installed Paseo web bundle, 2026-10-24).
consumer: the Captain, deciding from the Bridge on his Android phone.

## Scope

- (a) On compact layouts the briefing panel collapses to one line (the question) with an expand control, giving the discussion all remaining height; expanded behavior is unchanged.
- (b) On `layout.platform !== "web"`, the composer column adds bottom padding equal to the keyboard height from `Keyboard.addListener("keyboardDidShow"/"keyboardDidHide")` (`endCoordinates.height`), removing listeners on unmount; web is unchanged.
- (c) Route A (chief-engineer): on Android compact, a fixed bottom padding under the composer (a guess near the navigation bar height, 16–24 dp), dropped while the keyboard is open. The plugin cannot read the bar height; an exact inset needs a Paseo host change, which is outward and the Captain's decision after his UAT.
- Imports: only modules the host plugin loader provides (`react`, `react-native`, `@getpaseo/plugin` and its client entries, `@tanstack/react-query`, `zod`); `react-native-safe-area-context` and `react-native-keyboard-controller` are forbidden (the host refuses them and the plugin stops loading).
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): third stack layer on `spacedock-ensign/r3-reply-clear-and-safe` at 8d9a68b9; Draft PR with that base; nothing merges; no Paseo issue or PR.
- Non-goals: 320 px two-line rows, the phone-tab confirmation, KeyboardAvoidingView header-offset tuning, the composer-in-Modal route, any Paseo upstream request.

## Acceptance criteria

**AC-1**: The briefing panel collapses fully on a phone.
Verified by: isolated-daemon web client at a 360×780 viewport: collapsed panel height about one line and the discussion gains the difference (measured from the page); expanding restores the briefing; screenshots.

**AC-2**: The composer follows the keyboard and keeps a bottom margin on Android.
Verified by: tests with faked `Keyboard` events: padding equals the keyboard height on show, returns on hide, listeners removed on unmount; with `layout={{compact:true, platform:"android"}}` the bottom padding is present and dropped while the keyboard is open. On-device behavior is unproven until the Captain's UAT on his Android phone (one screenshot with the keyboard open, one closed).

## FO alignment

Alignment: not needed: the Captain chose this theme in round 3 UAT; scope from chief-engineer triage recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto the previous stack layer (git reset --hard 8d9a68b92389aab55c96595245dc85e887251dd5, branch spacedock-ensign/r3-reply-clear-and-safe) and confirm HEAD; then (a) the compact-layout collapsible briefing panel (one line when collapsed, discussion gets the rest, expand restores) with an isolated-daemon measurement and screenshots at 360x780 (AC-1)
  Commit 9b6c11104b78 is based on 8d9a68b92389aab55c96595245dc85e887251dd5; evidence/implementation-ix9e4r73/candidate-final measures briefing 403.1875→44→403.1875 px and discussion 254.8125→628→254.8125 px at 360×780, with screenshots. Baseline run shows no collapse control.
- DONE: (b) keyboard-following composer padding on non-web from Keyboard keyboardDidShow/keyboardDidHide with listeners removed on unmount, and (c) a fixed Android compact bottom padding dropped while the keyboard is open, with faked-keyboard and layout tests (AC-2); report on-device behavior as unproven until the Captain's Android UAT
  composer-padding.test.mts mounts the production hook: fake show heights replace the Android margin, hide restores 20 dp, web has zero/subscriptions removed, wide Android and iOS omit the closed margin, unmount removes listeners; deleting callback/cleanup or adding 20 to keyboard height fails. Android on-device behavior is unproven pending Captain UAT.
- DONE: Only host-provided imports (react, react-native, @getpaseo/plugin and its client entries, @tanstack/react-query, zod); npm test and typecheck pass; branch pushed and a Draft PR opened with base spacedock-ensign/r3-reply-clear-and-safe (third stack layer)
  Runtime additions use react/react-native only; isolated plugin loading, npm test (99 passed) and typecheck pass at 9b6c11104b78. Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/46 is OPEN, isDraft=true, correct base and exact pushed head (pr46.json).

### Findings

- SKIPPED: design_surfaces.py — known package gap 2: approved POC seed lacks Surfaces/Visible change; checks-final.json records exit 1. No task declarations invented.
- SKIPPED: roborev — known package gap 5: worker sandbox cannot reach the daemon; FO runs roborev_gate.py on 9b6c11104b78 with base 8d9a68b92389aab55c96595245dc85e887251dd5.
- comment_ratio.py: 46 code lines, 1 comment, 2.2% <= 5%; doc_impact.py: 0 documents; OVERVIEW.md: updated. adr_lint.py: 7 records, 0 legacy. number_guards.py: PASS, no findings; no R4 failure/gap-3 skip required; no ADR/migration added or reserved.
- Evidence and reproducible isolated-daemon harness: r4-phone-layout/evidence/implementation-ix9e4r73/README.md. All captured test PIDs stopped and homes removed; live checkout/install unchanged. Approximate Android clearance requires Captain keyboard-open/closed screenshots.
- ADR 0008 remains Accepted at the pinned base, SHA-256 d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f; no new enduring ruling. Existing card/CoChat path checked before implementation; missing collapse reproduced at the base. POC boundary retained, no new persistent state/external seam.

### Summary

Compact cards now collapse to a one-line question and expand to their previous height; native chat reserves the keyboard height and compact Android uses 20 dp when the keyboard is closed. Exact-candidate web measurements and mounted fake-keyboard tests pass; Draft PR #46 is the third unmerged stack layer. Fresh independent validation, FO-run RoboRev and Captain Android UAT remain; no ready, merge, release or live-install action was taken.

## Stage Report: implementation (cycle 2)

- DONE: The composer padding hook initializes from the keyboard already shown at mount (Keyboard.metrics() when available, else 0) and updates on keyboard frame changes (keyboardDidChangeFrame) as well as show and hide, removing every listener on unmount; tests for mounting with a visible keyboard and for a frame change without a show event; existing tests still pass
  Commit cd139fd: lazy initialization and platform resync use optional Keyboard.metrics() with a 0 fallback; keyboardDidChangeFrame joins show/hide, and all three subscriptions are removed. cycle-2/red.log reproduces first-render 20≠284 and frame-only 20≠316; green.log passes both regressions plus existing layout/cleanup checks.
- DONE: npm test and typecheck pass; push to PR #46 (still Draft); a short "## Stage Report: implementation (cycle 2)" section
  cycle-2/tests.log: npm test 101 passed; typecheck.log: exit 0. Pushed head cd139fdea5636bd30a316be56c436b8aee58f72b; PR #46 remains OPEN/Draft with the unchanged stack base (cycle-2/pr46.json).

### Findings

- Repaired the two FO-authorized Medium findings affecting value-ac[AC-2]: native composer remount with a visible keyboard and frame changes without show can leave typed content covered; red.log supplies both triggers. Android on-device behavior remains unproven pending Captain UAT.
- comment_ratio.py: 9 code lines, 0 comments, 0%; threshold not enforced below 20 lines. doc_impact.py: 0 documents; OVERVIEW.md unaffected: existing keyboard description remains accurate. number_guards.py PASS; adr_lint.py: 7 records, 0 legacy. No new dependencies, ADRs, migrations or POC boundaries.
- SKIPPED: roborev — package gap 5; FO reruns roborev_gate.py on the pushed head. Existing design-surface package gap 2 remains skipped; no declaration or briefing UI change in this repair.
- Evidence: r4-phone-layout/evidence/cycle-2/README.md. No daemon/browser launched or temporary runtime left by this follow-up; no ready, merge, release or live-install action.

### Summary

The composer now has correct padding on its first render when keyboard metrics are available and follows frame changes without needing another show event. Both regressions were observed before repair and all 101 tests plus typecheck pass afterward; Draft PR #46 contains the pushed repair. Independent re-review and Captain Android UAT remain with the FO/Captain.

### FO declines

- roborev:1141 Medium, `client/use-composer-padding.ts`, candidate cd139fdea563: on Android 11+ React Native emits no `keyboardDidChangeFrame` and fires show/hide only on visibility changes, so switching keyboard modes while it stays open leaves stale padding; the cycle 2 Android frame-change test simulates an event Android does not produce. Deferred risk: the Captain's reported problem is the keyboard opening over typed text, which show/hide handles; a resize-while-open needs window insets the plugin cannot read (`PluginHostProps.layout` has none — the same host limit as the navigation bar). Would become Material if his Android UAT shows stale padding after switching input modes; then it joins the Paseo insets question that is his decision. The frame-change handler stays for iOS; the validation report must not read the Android frame-change test as on-device proof.

### FO findings before the gate

- Pre-gate team on cd139fdea563: design partner NOT SATISFIED — blocks: delivery status, "Recorded" and "do not resend" warnings render only inside the expanded briefing, so collapsing hides decision feedback; annoys: "← Bridge" disappears when collapsed; cosmetic: "Expand" does not say what is hidden. Picky users A and B NOT SATISFIED — annoys: "← Bridge" hidden when collapsed; "blocks acceptance": no Android keyboard or navigation-bar evidence. FO authorizes a repair of the first three (feedback and back control outside the collapsible part; a "Show briefing ▾ / Hide briefing ▴" label). The device evidence is by design the Captain's Android UAT (AC-2: "unproven until the Captain's UAT"); no worker can produce it, so it is not a repair item and the recheck asks the picky users to judge the plugin-side work with that limit stated.
- Validation-1 on cd139fdea563 was canceled by the FO before it reported because the head changes; its partial evidence folder was removed. An unrelated isolated daemon seen afterwards belongs to the project-env FO (/private/tmp/pe-vcr/…) and was left alone.

## Stage Report: implementation (cycle 3)

- DONE: Decision feedback stays visible when the briefing is collapsed: delivery status, "Recorded", unresolved-delivery and "do not resend" warnings, and errors render outside the collapsible part, in both states
  Commit 9fdc6ac moves feedback/errors outside the briefing branch. cycle-3/final/observed-states.json exercises sent, unresolved/do-not-resend, recorded, recording mismatch and error visibility in both states; red.log reproduces hidden feedback at cd139fd before repair.
- DONE: The card's "← Bridge" back control stays visible when collapsed; the collapse control reads "Show briefing ▾" when collapsed and "Hide briefing ▴" when expanded; isolated screenshots at 360x780 of collapsed (with a delivery state shown) and expanded
  cycle-3/final contains visually inspected collapsed-warning-360x780.png and expanded-warning-360x780.png, plus recorded/error screenshots. Browser checks confirm Show briefing ▾ / Hide briefing ▴, visible ← Bridge in both states, and its working return to the board.
- DONE: npm test and typecheck pass; push to PR #46 (still Draft); a short "## Stage Report: implementation (cycle 3)" section
  cycle-3/tests.log: npm test 101 passed; typecheck.log: exit 0. Pushed 9fdc6ac6923aa594f2cd0df67b501abaeca912ff; PR #46 remains OPEN/Draft with unchanged stack base (pr46.json).

### Findings

- Repaired the three FO-authorized findings: collapsing hid delivery/recorded/do-not-resend feedback, hid the card back control and left an unclear Expand label. red/observed-states.json records all three failing observations; the same real-plugin browser walk passes at the candidate.
- comment_ratio.py: 35 code lines, 0 comments, 0.0% <= 5%; doc_impact.py: 0 documents; OVERVIEW.md updated for feedback/back/current labels. number_guards.py PASS; adr_lint.py: 7 records, 0 legacy. No new imports, dependencies, ADRs, migrations or POC boundaries; keyboard/bottom-padding code unchanged (checks.json).
- SKIPPED: roborev — package gap 5; FO runs roborev_gate.py on pushed head. Design-surface package gap 2 remains skipped; no declarations invented. Captain Android UAT remains unproven; the FO decline on Android input-mode resizing is unchanged and fake frame events do not establish Android behavior.
- Evidence/reproduction/cleanup: r4-phone-layout/evidence/cycle-3/README.md. All isolated test PIDs stopped, browser sessions closed and proof homes removed; no real message/decision sent. No ready, merge, release or live-install action.

### Summary

Decision feedback and errors now stay above the collapsible briefing, alongside a persistent card back control and explicit Show briefing ▾ / Hide briefing ▴ controls. Exact-candidate 360×780 browser regressions, 101 npm tests and typecheck pass; Draft PR #46 contains the repair. FO re-review and Captain Android UAT remain outside this worker's completion.

## Stage Report: implementation (cycle 4)

- DONE: roborev:1144 first finding: on compact native layouts, when the keyboard opens the briefing auto-collapses (and restores the user's previous state when it closes), so the keyboard padding never competes with an expanded briefing for the card's height; a test with the briefing expanded, keyboard shown, composer area at least the keyboard height plus the composer
  Commit 3d1f176 shares native keyboard height with the card and derives temporary collapse without changing the user preference. cycle-4/final/observed-states.json: expanded→show(284)→collapsed, chat 516 >= keyboard 284 + composer 171, composer bottom 496=780−284; hide restores expanded, and a separate cycle restores collapsed. Parent red.log fails this test.
- DONE: roborev:1144 second finding: the persistent delivery feedback outside the collapsible part is bounded (status line plus at most two lines of the reason or sent text, with a "more" control to see the rest); a 360x780 screenshot with a long multiline reason showing the discussion and composer still visible
  cycle-4/final/long-reason-360x780.png: 40-line sent reason in a 32 px/two-line preview below one status line, discussion content and composer visible. More opens the host scrollable feedback dialog; scrolling reaches line 40 and backdrop dismisses it. Combined long-reason/keyboard screenshot also passes layout assertions. Parent feedback was 1204 px and pushed composer outside the viewport.
- DONE: npm test and typecheck pass; push to PR #46 (still Draft); a short "## Stage Report: implementation (cycle 4)" section
  cycle-4/tests-final.log: npm test 101 passed; typecheck-final.log: exit 0. Pushed 3d1f176c0ca1fa8d266c5793c91a93c6c1a82c9e; PR #46 remains OPEN/Draft with unchanged stack base (pr46.json).

### Findings

- Repaired the two FO-authorized Medium findings on 9fdc6ac: native keyboard padding competed with expanded briefing height, and unbounded delivery text displaced the composer. cycle-4/red records both failures; the exact candidate passes the same actual-client geometry tests.
- comment_ratio.py: 50 code lines, 0 comments, 0.0% <= 5%; doc_impact.py: 0 documents; OVERVIEW.md updated. number_guards.py PASS; adr_lint.py: 7 records, 0 legacy. No new dependency, ADR, migration or POC boundary. Decision logic, relay payloads and draft code unchanged (checks.json).
- SKIPPED: roborev — package gap 5; FO runs roborev_gate.py on pushed head. Design-surface package gap 2 remains skipped. The fake Android contract uses RN web rendering, not device evidence; Captain Android UAT remains unproven and the prior Android input-mode-resize decline remains settled.
- Evidence/reproduction/diagnostic attempts/cleanup: r4-phone-layout/evidence/cycle-4/README.md. All five isolated test PIDs stopped, browser sessions closed and homes removed. No real message/decision sent; no ready, merge, release or live-install action.

### Summary

Compact native cards temporarily collapse the briefing while the keyboard is open, preserving the user's previous state for keyboard close. Persistent feedback is bounded with a More dialog for the full text; compact chat keeps enough discussion/composer space, and 360×780 fake-keyboard/long-reason regressions plus 101 tests/typecheck pass. Draft PR #46 contains the repair; FO re-review and Captain Android UAT remain.
- roborev:1145 Medium, `client/use-composer-padding.ts`, candidate 3d1f176c0ca1: if the Android host window uses `adjustResize`, the plugin's keyboard padding doubles the clearance. Deferred risk: the Captain's 2026-10-24 Android screenshot shows typed text hidden under the keyboard, i.e. the host does not resize the plugin screen today; chief-engineer named the same risk and said one UAT settles it. Would become Material if his Android UAT shows a large empty gap above the keyboard; then the padding is gated on the observed behaviour. roborev:1145's second finding repeats roborev:1141 (declined above, evidence unchanged).


## Stage Report: validation

- DONE: Independent verdict on AC-1 and AC-2 for PR #46 at the candidate head, from your own npm ci / typecheck / test run and your own isolated-daemon measurement at a 360x780 viewport (collapsed panel about one line, discussion gains the difference, expand restores; "← Bridge" and decision feedback visible while collapsed; long feedback bounded), with screenshots; AC-2's on-device behavior reported as unproven until the Captain's Android UAT, not PASS
  Candidate 3d1f176c0ca1fa8d266c5793c91a93c6c1a82c9e: AC-1 PASS (260→44→260 px briefing, 286→516→286 px discussion); fake-event AC-2 checks/101 tests/typecheck PASS, device UNPROVEN; overall REJECTED pending F1 disposition. Own measurements/screenshots: evidence/validation-2/web-current/ and native/.
- DONE: A minimal acceptance script the FO can rerun as written in a fresh shell, with each step's expected output
  evidence/validation-2/README.md gives four exact fresh-shell acceptance.sh commands, prerequisites and expected output; underlying commands ran independently, wrapper syntax passed, FO's complete as-written replay remains owed. Neither script nor screenshots establish Android device behavior.
- DONE: Material findings and limits, including that only host-provided modules are imported, web layout is unchanged when not compact, decision logic and drafts are unchanged, and how the FO-declined Android resize limit reads
  Runtime imports are host-provided and decision/draft bytes unchanged (runtime-imports.json/source-audit.json); noncompact web padding stays zero but whole-layout preservation is FALSE (F1); Android resize/host-window limits remain unproven and the two prior FO declines are not re-reported.

### Findings

- F1 Needs decision: normal noncompact desktop gate cards also receive the persistent toolbar/bounded feedback; at 1440×1000 discussion drops 371.609375→326.8125 px versus base 8d9a68b9, with composer still visible and unchanged. This contradicts dispatch/validation-2.md#checklist's unchanged noncompact-web claim, but overlaps the authorized feedback repair and establishes no AC-1/AC-2 harm. Trigger: evidence/validation-2/desktop-base/desktop.json versus web-current/desktop.json and both screenshots. Recommend FO explicitly accept the shared feedback layout and narrow the preservation claim to keyboard padding, or route a scoped repair if the broader claim remains required; validator does not choose that scope.
- Independent execution: npm ci/typecheck exit 0; npm test 101/101 after sandbox socket EPERM was retried with permission. Existing decision/refusal/draft tests pass; shared decision/relay/draft modules and send callbacks are byte-identical to base. No real decision/message was sent; PR #46 independently remains OPEN/Draft at the exact head/base (pr46.json).
- Falsifiability: web assertions fail if 44 px collapse, exact discussion gain, restoration, visible feedback/back, or working return is removed. Fake keyboard assertions fail if auto-collapse/padding/restoration or 32 px feedback bounds/full-text retrieval is removed; keyboard tests fail on missing callbacks/cleanup or adding 20 to open-keyboard height. Prior cycle-2/cycle-4 red logs were read, not rerun, and reproduce the repaired failures (README.md distinguishes their provenance).
- AC-2 limit: native inputs are faked over React Native web; show(284) gives composer bottom 496=780−284 and hide restores 20 px. Long reason remains two lines, More scrolls to line 40. Real Android keyboard/navigation-bar behavior is UNPROVEN until Captain keyboard-open/closed screenshots; fake frame events do not establish Android resize events.
- Settled roborev:1141/:1145 dispositions remain unchanged: stale padding after input-mode switching or excessive gap under a resizing host would become Material only with the named new Android UAT evidence; neither is claimed resolved or newly reported here.
- Package 0.29.0 absolute-path checks: adr_lint.py docs/adr --since 8d9a68b92389aab55c96595245dc85e887251dd5 exit 0 (7 records/0 legacy); comment_ratio 103 code/1 comment, 1.0% <=5%; doc_impact 0 documents, OVERVIEW.md updated/consistent; dispatch_records 6 complete; number_guards PASS, no R4 gap-3 skip needed (checks.json).
- SKIPPED: design_surfaces.py — known package gap 2, exit 1 for missing approved-POC Surfaces/Visible change fields; no declarations invented. SKIPPED: roborev — package gap 5, FO owns its gate run.
- POC scope: no added persistent state/external seam or dependency. The retained compact reserve, hook lifecycle, feedback bounds and full-text view address observed failures; F1 is the remaining scope question. Evidence harnesses reuse implementation fixtures with synthetic data; only disposable entry inputs/fleet ports differ, candidate client/shared bytes do not.
- Cleanup: all three captured daemon PIDs absent, homes removed, browser-close receipts saved; candidate/main/flywheel-live worktrees clean (cleanup-verification.json). No candidate commit, PR edit, merge, live install or unrelated process action.

### Summary

Independent phone-collapse, persistent-feedback, long-feedback and fake-keyboard checks pass at the exact candidate; Android device acceptance remains UNPROVEN. REJECTED for unqualified acceptance until FO disposes F1's noncompact-web preservation mismatch; the report recommends an explicit narrowed claim rather than silently calling the wide layout unchanged. Report/evidence only; FO retains gate/delivery decisions and Captain retains Android UAT.
- FO disposition of validation-2 F1 (Needs decision, candidate 3d1f176c0ca1): accepted as in scope. The cycle 3 repair the FO authorized puts decision feedback and "← Bridge" outside the collapsible part "in both states" (design partner's blocking item), and that applies to every layout; at 1440×1000 the discussion is 45 px shorter than base with the composer visible and unchanged. The preservation claim is narrowed: on non-compact web, collapse and keyboard padding are absent (padding zero, no collapse control); the persistent feedback and back toolbar is shared by all layouts. No AC-1/AC-2 harm; no Captain ruling or contract protects desktop pixel parity. FO reran acceptance.sh steps 1–4 in fresh shells: all PASS (101/101; compact collapse and feedback; fake keyboard and long feedback; records).

### FO declines

- roborev:1145 Medium, `client/use-composer-padding.ts`, candidate 3d1f176c0ca1 — restated here under the designated heading (observer, pre-gate): it was first written below the implementation cycle 4 summary. If the Android host window uses `adjustResize`, the plugin's keyboard padding doubles the clearance. Deferred risk: the Captain's 2026-10-24 Android screenshot shows typed text hidden under the keyboard, so the host does not resize the plugin screen today. Would become Material if his Android UAT shows a large empty gap above the keyboard. Its second finding repeats roborev:1141 (declined above; evidence unchanged).
