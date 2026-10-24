## Summary

Long briefings previously occupied most of a phone decision card, and the chat did not reserve space for native keyboards or the Android navigation bar. Compact cards now collapse their briefing to one question line and expand back to its previous height. Native chat columns follow keyboard show/hide events; compact Android adds an approximate 20 dp bottom margin while the keyboard is closed.

Third unmerged flywheel stack layer on `spacedock-ensign/r3-reply-clear-and-safe` (PR #42), base `8d9a68b92389aab55c96595245dc85e887251dd5`. Keep this PR draft; never merge it.

## Test plan

- `npm test`: 99 passed, including a mounted hook test with faked keyboard events, Android compact/wide and iOS/web layouts, height changes, hide restoration and listener cleanup.
- `npm run typecheck`: passed.
- Isolated Paseo daemon, fresh browser profile, 360×780: briefing 403.1875 → 44 → 403.1875 px; discussion 254.8125 → 628 → 254.8125 px. Previous stack layer has no collapse control. Captured daemon PIDs stopped and temporary homes removed.
- Host plugin loader successfully loaded the candidate; no new runtime dependency. Comment ratio, ADR lint and number guards passed. Design-surface check skipped for recorded package gap 2; RoboRev is delegated to the workflow coordinator for the pushed head.

Evidence: split-root task `r4-phone-layout`, `evidence/implementation-ix9e4r73/`; screenshots and receipts stay outside this candidate branch. Android on-device keyboard and navigation-bar behavior remains unproven until Captain UAT; 20 dp is approximate because the host provides no safe-area inset.
