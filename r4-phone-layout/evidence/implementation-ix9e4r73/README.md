# Round 4 phone layout implementation evidence

Candidate: `9b6c11104b78`; base: `8d9a68b92389aab55c96595245dc85e887251dd5`. Draft PR: https://github.com/iamcxa/kc-paseo-plugins/pull/46, base `spacedock-ensign/r3-reply-clear-and-safe`. `pr46.json` records the full candidate and remote metadata. No merge, ready, live installation or release action was performed.

## Required proof

`candidate-final/observed-states.json` measures the actual candidate client in an isolated Paseo daemon at 360×780: briefing 403.1875 → 44 → 403.1875 px; discussion 254.8125 → 628 → 254.8125 px. The 373.1875 px gained equals the removed briefing height plus the 14 px resize handle. Expanded, collapsed and restored screenshots are retained; expanded/restored and the preceding identical collapsed screenshot were visually inspected. No messages or decisions were sent. `candidate-1` is the earlier dirty-tree development check, not the exact-candidate receipt.

`baseline/` exercises the previous stack layer, whose compact panel has no collapse button. The same fixture therefore cannot perform the candidate's collapse/restore walk. This is the observed falsifier for the new layout; it is not a source-text assertion.

`tests-final.log`: 99 tests pass. The new mounted hook test emits faked keyboardDidShow heights 284, 316, 240 and 301; keyboardDidHide restores compact Android's 20 dp padding. It also checks wide Android gets no closed-keyboard margin, switching to web removes subscriptions and yields zero padding, iOS gets keyboard height only, and unmount removes both listeners. Deleting the show callback, adding 20 to an open keyboard, retaining native padding on web, or omitting cleanup breaks the assertions. It tests the hook used by CoChat, not an Android device or native rendering. `typecheck-final.log`: passed.

The implementation adds only the collapse state, one native-padding hook, its behavioral test, and the existing overview's affected behavior. Existing card/CoChat wiring was read before implementation: the card had MIN_TOP=72 with a resize grip; client/shared searches and bridge/CoChat inspection found no keyboard listener or alternative collapse route. The bounded searches exclude host internals, external/native runtime behavior and dormant consumers. Those remain limited by the declared SDK layout contract and pending device UAT. No abstraction or capability was removed.

## Reproduction and cleanup

Requires Python 3, git, npm, installed Paseo with matching web assets, agent-browser and Chromium. Run npm ci in the candidate's spacedock-bridge directory, then `python3 capture.py --worktree <candidate> --paseo <CLI> --browser <agent-browser CLI> --web-dist <Paseo app-dist> --port <unused permitted port> --output <new directory>`. Add `--baseline 8d9a68b92389aab55c96595245dc85e887251dd5` for the old missing control. Machine-specific assets are explicit arguments, not hidden dependencies. Existing output directories and reserved ports are refused.

Each run uses synthetic agents/gates/reviews, stub gh/spacedock commands, an isolated HOME and --home, and a fresh browser profile blocking localhost resolution. The disposable server copy changes only the fleet port; candidate client/shared bytes are unchanged. The final run uses 7133/7134, baseline 7135/7136. Each cleanup.json records its captured daemon PID, browser close and removed temporary home. Temporary scaffolding lives only in the proof root and is removed at the end of each run; capture.py stays in task evidence for independent reproduction. No task-level elapsed budget was specified; no harness timeout was reached.

## Package checks and limits

`checks-final.json`: comment_ratio 46 code lines, 1 comment line, 2.2% <= 5%; doc_impact zero hits; adr_lint seven records, zero legacy; number_guards PASS with no findings. No ADR/migration was added or reserved. OVERVIEW.md: updated with compact collapse, native keyboard and approximate Android clearance behavior.

Design surfaces: SKIPPED for known package gap 2 (approved POC seed lacks Surfaces/Visible change). Number guards passed; no R4 failure or gap-3 skip was needed. RoboRev: SKIPPED for known package gap 5 (worker sandbox cannot reach daemon); FO runs the gate on pushed head with base 8d9a68b92389aab55c96595245dc85e887251dd5. Scripts ran by absolute path from the dispatch's loaded 0.29.0 package.

ADR 0008 was read and remains Accepted at the pinned base; SHA-256 d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f. No new enduring ruling was introduced. POC boundary remains session-local layout work, without a new persistent store or external seam. Only host-provided runtime imports were added; isolated plugin loading succeeded.

Android device behavior is unproven until Captain UAT with keyboard-open and keyboard-closed screenshots. The 20 dp Android margin is approximate because the host provides no inset. Browser screenshots establish compact web layout only, and fake events establish hook behavior only; neither establishes Android keyboard resizing or actual navigation-bar clearance.
