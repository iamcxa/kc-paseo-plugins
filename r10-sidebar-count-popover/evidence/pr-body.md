The Bridge sidebar now shows how many gates and questions still wait for the Captain, with ? while a source is incomplete and no badge at zero. Its count opens an anchored desktop popover or compact bottom sheet listing gate/question totals and the oldest items first; each item opens its Bridge detail, and Open Bridge opens the board.

This is the eighth unmerged flywheel stack layer, based on `spacedock-ensign/r9-list-and-detail-layout` at `224b03f2da6eefc89d7a055ac95be2d858eaa5c5`. Keep this PR as a draft. Do not merge.

Validation: `npm test` passes 259 tests; `npm run typecheck` passes. Isolated Paseo host captures at 1440 and 360 cover count, loading, failure, zero, popover presentation and item/board navigation. The compact list scrolls while Open Bridge remains in view. Runtime source hashes match `d4dad9393436b897a329ee63ae0f8a721d3ab1f1`; fixture data establishes host presentation/navigation, not live Captain data or physical-device behavior.

The sidebar uses the existing source readers and shared status/count functions. It does not create a coordinator, alter decision-claim matching, send/record behavior, permissions, relay, persistent storage, or the right-side panel. No CI configuration changed. RoboRev is delegated to the First Officer on this pushed head because this worker cannot reach its daemon.

Report and captures: `r10-sidebar-count-popover.md` and `r10-sidebar-count-popover/evidence/` on `spacedock-state/dev2-poc`.
