---
title: Clickable things on the Bridge respond to hover and press, decisions look distinct, and By decision rows say which FO
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
gates:
    version: 1
    records:
        - id: gate:r1-hover-and-row-owner:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r1-hover-and-row-owner-backlog-1
              briefing:
                id: briefing:r1-hover-and-row-owner:backlog:attempt-1:revision-1
                digest: sha256:f8353a435da4aed6de76ee8a7838b2d1dea9c4073775a9541af62c8dc01f0175
                room-ref: ./r1-hover-and-row-owner/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r1-hover-and-row-owner:backlog:1
                briefing: briefing:r1-hover-and-row-owner:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-23T11:36:08.796108Z"
                decision: approve
                reason: 'L3 class 1 (spacedock-bridge POC backlog gate) under ADR 0006: scope traces to the Captain UAT words of 2026-10-23 quoted in the task; no security, permission, relay/recording, release or outward change.'
                conn:
                    quote: 同意，就用這個方式。但改成每一輪摘要寫到一個 dev2 fo 可以存取的地方，不要讓它一直被你們打斷
                    source: 'docs/adr/0006-the-bridge-fo-decides-three-classes-of-poc-gates-by-record.md (ADR 0006, merged in PR #36, f849058), Captain chat 2026-10-23'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-23T11:36:35Z
worktree: .worktrees/spacedock-ensign-r1-hover-and-row-owner
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


## Stage Report: implementation

- DONE: Every pressable element in spacedock-bridge/client/ shows a hover and a pressed state, and the composer box highlights on hover and focus, with isolated-daemon screenshots of normal, hover and pressed/focused states (AC-1)
  c3c818e27146ac13e66a91f1a9241cfa55ea1c40 uses one native Pressable feedback wrapper throughout the client; docs/evidence/r1-hover-and-row-owner contains seven screenshots, measurements and capture.py. Its real isolated-daemon run passed 16 cancelled-press checks and three distinct composer border states; removing the feedback styles or focus handlers fails those checks.
- DONE: 准, 要求修改 and 暫緩 are visually distinct with theme status colors while keeping the dashed needs-a-reason state, with a screenshot (AC-1)
  decision-colors.png and decision-with-reason.png show statusSuccess/statusWarning/foregroundMuted; capture.py asserts three distinct text colors, solid/dashed/dashed without a reason and all solid with a reason, without sending any decision.
- DONE: By decision rows show the owning FO's short title, and buildQueue keeps an FO's separate question when it also has a gate, with a test and a screenshot (AC-2); roborev gate run with its evidence= or incomplete: line; Draft PR open
  board-normal.png shows OMP FO beside both gates and its separate question, plus no FO on an unmatched review. npm test passed 72 tests; the added gate-plus-question test fails against f849058 because only the gate remains; the attachment test catches an FO-owned next step being misclassified as a Captain ask; blank/exact gate restatements stay deduplicated.
  Draft PR: https://github.com/iamcxa/kc-paseo-plugins/pull/37 at c3c818e27146ac13e66a91f1a9241cfa55ea1c40. roborev exit 0: clean on c3c818e27; evidence=roborev:1106. The initial sandbox-only incomplete result was superseded by this socket-enabled review.
- DONE: Required implementation checks and affected documents
  npm run typecheck and git diff --check passed; comment_ratio.py: code lines 319, comment lines 1, 0.3%, maximum 5% met; number_guards.py: PASS, base f849058121e6, head c3c818e27146, no migrations; adr_lint.py: 6 records checked, 0 legacy, none added or changed.
  doc_impact.py lists docs/evidence/r1-hover-and-row-owner/README.md: updated with observed states, declared local tools, reproduction and cleanup. spacedock-bridge/OVERVIEW.md unaffected: deployment, storage, relay and installed fleet port behavior are unchanged.
- SKIPPED: Workflow design-surface metadata check
  FO disposition — README asks for Surfaces/Visible change only on the five-stage route; package gap 2 in _l3-dogfood/rounds.md round 0

### Summary

Implemented the approved POC UI feedback and ownership/queue corrections in the assigned branch, committed and pushed them, and opened Draft PR #37; decision relay and recording files have no diff. The reproducible synthetic proof used separate HOME/--home, ports 7043/7044 and a new browser profile with localhost blocked; its captured daemon and browser stopped, all proof homes were removed, and manual proof ports 7041/7042 are also closed.

Web/desktop interactions were exercised; native-device hover/press, live delivery and Captain acceptance remain unproven. No persistent schema, release or installed-daemon change was made; validation remains with the First Officer; the design-surface check is skipped under the FO disposition above.
