---
title: Flywheel round 4 — on a phone the briefing panel collapses fully, the composer follows the keyboard, and it clears the Android navigation bar
status: backlog
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
