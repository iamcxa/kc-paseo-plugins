# Pending-send state survives reopening — cycle 4

Repair base: `cb0fd5fa51ca90581d7fce9de12db386dd1b0187`. Candidate: `8d9a68b92389aab55c96595245dc85e887251dd5`. Stack base: `e91b9755a0c3444ebf4390f5396499ddf2070457`. `pr42.json` verifies the pushed head, OPEN Draft PR #42 and previous-round base; reload-loss disclosure remains in its body.

FO authorized the picky user B blocking item in `dispatch/implementation-1-followup-3.md`: the Captain can start a slow reply, go back and reopen the target, where local sending state reset and offered an active ↑/Enter path while the first send was still pending.

## Repair

The existing memory-only draft store now also owns sending state keyed by the identical agent/gate/stage draft key. Its existing keyed subscriber mechanism notifies mounted composers when pending state changes. useDraft exposes the subscribed flag and writer; CoChat removes its local sending state, keeps its existing disabled controls, and shows a sending hint. The handler guard reads pending state directly from the store, so Enter and button paths share the same lock even before a render. Existing composer try/finally always releases that key when the operation settles; draft clearing remains compare-and-clear, and errors retain the draft. Other targets are independently available.

No decision chip markup/handler implementation, decideGate, claim/release or relay text was changed. The existing composer busy guard now reads shared state; no new decision or delivery protocol was added. No dependencies changed. OVERVIEW.md describes disabled sending across reopen and failure re-enabling.

## Proof

`regression-red.log` records the eight prior mounted/subscription cases passing and the two new pending success/failure cases failing: after reopening, the actual DOM send button was enabled. For this behavioral baseline, the former component-local sending useState was mechanically moved into the existing hook boundary before being replaced with subscribed store state. This is a real mounted React/handler test of the old pattern, not an unmodified hosted Paseo run.

`tests-final.log`: 98/98 pass. `typecheck-final.log`: exit 0. The two regressions defer transport completion, remount, assert an actual disabled send button and sending indication, attempt button and Enter re-entry, and assert exactly one transport dispatch. They switch to a different draft key (available), switch back (still locked), and settle success/failure. Success clears and releases pending; failure retains the displayed draft and enables sending, and a subsequent explicit retry dispatches again. Removing shared pending state, releasing it too early, removing the handler guard, or not releasing it in finally causes the relevant assertions to fail. Prior edit-preservation, refusal, subscription and store regressions stay green. DOM roots/windows close after tests and deferred operations settle in test finally cleanup.

Reproduce from `spacedock-bridge`: `npm ci`, `npm test`, `npm run typecheck`. Focused mounted tests: `./node_modules/.bin/tsx --test test/draft-subscriptions.test.mts`. Production hook, store, composer handlers and React DOM mounting are real; only the external transport is deferred. No real agent message or decision was sent.

## Checks and limits

`checks.json`: repair comment ratio 23 code/0 comment lines; stack 81/0; both 0.0% <= 5%. doc_impact: zero hits; OVERVIEW.md updated directly. ADR lint: seven records PASS; number guards PASS, no R4 failure (gap 3 not needed). No ADR/migration or new POC boundary. Scripts ran by absolute path from the loaded Codex 0.28.0 package as recorded in the commands.

Known package gap 2: design_surfaces requires declarations omitted by the accepted POC seed; SKIPPED. RoboRev: SKIPPED under package gap 5; FO reruns the pushed head. This cycle proves the store/hook/handler/DOM behavior; it does not claim a new native/hosted browser walk, live installation or Captain UAT. Pending state and drafts remain memory-only and disappear on plugin/app reload. No new automatic retry, server persistence, ready/merge/release action, main or previous-round branch mutation occurred.
