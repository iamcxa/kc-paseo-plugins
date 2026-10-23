---
title: Clickable things on the Bridge respond to hover and press, decisions look distinct, and By decision rows say which FO
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
---

Round 1 of the L3 dogfood (ADR 0006): the Captain's UAT of PR #34 found that nothing on the Bridge shows it can be clicked, the three decision buttons look alike, the By decision rows do not say which FO an item belongs to, and an FO's question disappears from By decision when that FO also has a gate.

Captain, 2026-10-23, UAT of PR #34: 「可以按的東西應該要有 hover 高亮反應之類的提示？」 and 「此外，輸入pan 也要hover高亮，三個決策按鈕應該要有某種區分？截圖二裡面的 FO 跟圖三的為何差異那麼多？我意思是 by descision 跟 by FO 有差異」.

bite: on 2026-10-23 the Captain's live Bridge (spacedock-bridge at 5eb0ba4) showed no hover or press change on the `repo#number ↗` link, rows, "Open" or the composer; 准, 要求修改 and 暫緩 used one chip style; By decision rows showed a title and an age with no FO; and the OMP trial FO's question ("whether OMP needs its own Spacedock host adapter") appeared in By FO but not in By decision, because `buildQueue` adds an ask only when the FO has no gates.
consumer: the Captain, using the Bridge screen.

## Scope

- Every pressable element in `spacedock-bridge/client/` (board rows, next card and its buttons, `repo#number ↗` and row ↗, section toggles, "Show N earlier messages", "Read full briefing", composer box and ↑, decision chips) shows a hover state on web/desktop and a pressed state on press, using React Native `Pressable` state and the theme's existing colors; the composer box highlights its border on hover and focus.
- 准, 要求修改 and 暫緩 are visually distinct from each other with the theme's existing status colors (准 positive, 要求修改 warning, 暫緩 muted), keeping the dashed "needs a reason" state.
- Each one-line By decision row shows the owning FO's short title in muted text before the age (no FO: "no FO").
- `buildQueue` keeps an FO's question (`next-owner=captain` with a `next` label) as its own Questions item even when the FO also has gates, unless the `next` text only restates that gate.
- Non-goals: briefing language, inactive/closed FOs (task fleet-hides-closed-fos), the virtual office, the By FO view's layout.

## Acceptance criteria

**AC-1**: Pressable elements respond to hover and press, and the decision buttons are distinct.
Verified by: isolated-daemon screenshots of a row and the composer in normal, hover and pressed (or focused) states, and of the three decision chips side by side.

**AC-2**: Rows say which FO, and no question is lost.
Verified by: `npm test` with a test that an FO with one gate and a separate `next` question yields both a gate item and a question item, and a screenshot of rows showing FO titles.

## FO alignment

Alignment: not needed: the Captain named each change in his UAT on 2026-10-23.
Release review: not needed: spacedock-bridge has no journey map yet.
