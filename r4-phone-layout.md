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
started: 2026-10-24T16:03:46Z
worktree: .worktrees/spacedock-ensign-r4-phone-layout
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
