# Single-source draft subscriptions — cycle 3

Repair base: `9bc63dc40ce2a8ed83c7e365c4ecbdcd5d544959`. Candidate: `cb0fd5fa51ca90581d7fce9de12db386dd1b0187`. Stack base: `e91b9755a0c3444ebf4390f5396499ddf2070457`. `pr42.json` verifies the pushed candidate, OPEN Draft state, previous-round base, and retained plugin/app reload-limit disclosure.

FO explicitly changed the approach after RoboRev findings 1131 and 1132. The Captain's ordinary pending send → remount workflow left the visible composer with an old local copy while completion cleared the store. Send then read a value different from the displayed text, violating value-ac[AC-1] retention/consistent-target behavior. The authorized remedy is one memory-only source with subscriptions, rather than another sequence-specific repair.

## Implementation

`shared/drafts.ts` owns per-target values and per-target change subscribers. Writes notify only on value changes; unsubscribe releases the listener and empty listener sets. `client/use-draft.ts` uses React useSyncExternalStore with stable callbacks keyed to the target. CoChat consumes that hook and has no local draft copy; typing, seeds and composer clears all write the same store. Its send port reads that store. Existing compare-and-clear behavior and all decision delivery, relay text and claim/release logic remain unchanged. OVERVIEW.md describes edits and clears appearing in every open composer for a target.

## Proof

`regression-red-behavior.log` records eight failures before subscriptions: the pre-existing useState/read/write pattern was mechanically extracted into the hook boundary, and the real React DOM tests showed stale textarea values on store writes and delayed completion. This is a behavioral baseline using the former local-copy implementation, not an unmodified hosted Paseo run. The earlier `regression-red.log` is only a missing-test-dependency setup failure and is not proof of the defect.

`tests-final.log`: 96/96 pass. `typecheck-final.log`: TypeScript exit 0. The eight new tests exercise keyed subscribe/unsubscribe, same-target cross-mount edits through the production hook's setter, seed updates, target changes, and delayed send/decision outcomes (clear, newer edit, refusal). They remount real React components into jsdom, assert actual textarea values, and verify the following Send emits precisely the displayed value (or sends nothing for an empty composer). Removing notification, retaining a local state copy, dropping unsubscribe or clearing newer edits causes relevant assertions to fail. The earlier store, compare-and-clear, refusal and seed tests remain green.

Run from the candidate's `spacedock-bridge`: `npm ci`, `npm test`, `npm run typecheck`; focused mounted regressions: `./node_modules/.bin/tsx --test test/draft-subscriptions.test.mts`. Deferred promises replace only external send/decision completion. Production store, hook, React mounting and composer handlers remain real; DOM roots and windows are closed after each test.

React DOM 19.1.0 matches existing React 19.1.0; jsdom 26.1.0 and their types are pinned development dependencies for these mounted tests. `dependency-check.json` records 38 added development package entries, unchanged existing versions/URLs/integrities, and npm's removal of the old yaml dev=true marker to match the already-existing production dependency declaration. No new runtime dependency is declared.

## Checks and limits

`checks.json`: repair comment ratio 25 code/0 comment lines; stack ratio 64/0; both 0.0% <= 5%. doc_impact lists zero documents; OVERVIEW.md updated directly. ADR lint passes seven records; number guards PASS, no R4 failure (gap 3 not needed). No ADR or migration added/reserved. Scripts ran by absolute path from the loaded Codex 0.28.0 package, as recorded in checks.json.

Known package gap 2: design_surfaces requires declarations the approved POC seed omits; SKIPPED. RoboRev is SKIPPED under package gap 5; FO reruns it on the pushed head. This cycle establishes the store/hook/DOM/composer integration; no new Paseo daemon, browser walkthrough, live install or Captain UAT is claimed. Earlier screenshots remain historical. Drafts remain memory-only and are lost on plugin/app reload; no POC boundary was crossed. No ready, merge, release, main or previous-round branch mutation was performed.
