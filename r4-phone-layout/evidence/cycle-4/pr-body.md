## Summary

Phone decision cards can collapse a long briefing while keeping the card back control, decision feedback and errors visible. Compact native cards now temporarily collapse the briefing while the keyboard is open and restore the user's previous choice afterward. Persistent feedback is limited to one status line and two content lines; More opens the complete text in the host's scrollable dialog. Compact layouts reserve room for discussion and the composer.

Native chat follows available keyboard metrics and show/hide/frame events. Compact Android uses an approximate 20 dp margin while the keyboard is closed. Decision logic, relay payloads and draft behavior are unchanged.

Third unmerged flywheel stack layer on `spacedock-ensign/r3-reply-clear-and-safe` (PR #42), base `8d9a68b92389aab55c96595245dc85e887251dd5`. Keep this PR draft; never merge it.

## Test plan

- `npm test`: 101 passed. Mounted hook tests cover visible-at-mount keyboard metrics, frame changes without show, show/hide, Android compact/wide, iOS/web and listener cleanup.
- `npm run typecheck`: passed.
- Isolated daemon, fresh browser, 360×780 with a fake native Keyboard boundary: expanded briefing temporarily collapses at keyboard show and restores after hide; both expanded and collapsed preferences survive. At a fake keyboard height of 284 px, the chat area is 516 px, above keyboard + composer (284 + 171 = 455 px), and composer bottom is 496 = 780 − 284 px.
- A synthetic 40-line sent reason stays in a 32 px/two-line preview; discussion and composer remain visible with keyboard closed and open. More opens the complete text, scrolling reaches line 40, and backdrop dismisses it. Parent behavior fails the same regression. Earlier evidence covers sent, unresolved/do-not-resend, recorded, recording mismatch and error visibility in both briefing states, plus working card navigation.
- Comment ratio, number guards and ADR lint passed. RoboRev is delegated to the workflow coordinator for the pushed head; design-surface check remains skipped for recorded package gap 2.

Evidence lives outside the candidate branch in split-root task `r4-phone-layout/evidence/`, including `cycle-4/` for this repair. All isolated test daemons, profiles and homes are cleaned up. Fake native events and React Native web geometry do not prove Android device behavior or Android input-mode resize support. Keyboard/navigation-bar behavior remains unproven until Captain Android UAT; the host provides no exact inset. No merge, ready, release or live-install action was taken.
