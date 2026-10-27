# Independent validation of round 6

Candidate: `f10a3f29a43fb09adff4beda268799f514f7b43b`; base: `6f16429c24d4853c15698091f0fb42830185c951`.

## Reproduce in a fresh shell

Required local runtime: Python 3, Node.js/npm, `/Users/kent/.local/bin/paseo` (observed 0.13.0), `/Users/kent/.npm-global/bin/agent-browser` (observed 0.32.0 with Chromium installed), and `/Applications/Paseo.app/Contents/Resources/app-dist`. These are explicit local test dependencies, not repository-delivered dependencies. The candidate checkout and evidence scripts must be present at their declared absolute paths. Local sockets and npm network/cache access must be permitted; a sandbox refusing sockets cannot run this proof.

```sh
python3 /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r6-queue-you-can-scan/evidence/validation-1/acceptance.py
```

Fresh-shell execution passed all five steps in 75.5 seconds (`acceptance-run.txt`, full artifacts in `acceptance-dlxcth_r/`). Each step prints its expected result:

1. `PASS 1: exact candidate and declared runtime prerequisites`
2. `PASS 2: npm ci, typecheck and 133 tests`
3. `PASS 3: 360/1440 rows, destinations, counts and honest ages`
4. `PASS 4: unread previews, pending/loaded/failed retry and review next check`
5. `PASS 5: shared-builder mutation rejected; isolated homes/PIDs cleaned`

It creates a new `acceptance-*` evidence folder and prints its path and elapsed seconds. Each fixture uses its own daemon HOME, `--home`, port pair outside the forbidden ranges, fresh browser profile blocking localhost, synthetic SDK data and local `gh`/`spacedock` stubs. Only the isolated plugin's fleet port and entry-point fixture adapter are changed; the candidate product modules remain byte-identical. No live agent receives a message or decision. Captured PIDs stop and isolated homes/profile roots are deleted.

## Primary observations

- `npm-ci.log`, `typecheck.log`, `tests-unsandboxed.log`: independent installation, typecheck and 133 passing tests.
- `ac1-360-run2/` and `ac1-1440/`: four long titles measure 36 px/two lines with metadata below in both views, six distinct FO rows, all four gate destinations plus review/question/comms navigation, matching counts, a two-hour timestamp age and unknown when missing.
- `runtime-360/` and `question-1440/`: both views retain an unlabelled unread question beside a gate, count two, and expose failed-source controls on the board. PNGs were visually inspected alongside the long-title captures.
- `runtime-360/observed.json`: actual comms subscription failure → manual retry with subscription readiness held → visible Loading state → loaded, then another retry → visible Loading → failed again. Review failure shows a real scheduled next-check time from the unchanged isolated server poller; no immediate review retry is offered.
- `mutation.json`, `mutation.log`: disabling the unread fallback in a disposable copy of the shared question builder makes six of the 12 combination cases fail (seven failures including the parent). The assertion is that each view shows the actual unread question exactly once; candidate bytes never changed, and the copy was removed.
- `checks.json`: comment ratio 157 code/0 comment lines (0.0%, max 5%); ADR lint checks seven records; documentation impact lists zero documents and the changed OVERVIEW claims match observed behavior; number guards pass; nine dispatch records complete. design_surfaces is SKIPPED as known package gap 2 (missing FO Surfaces/Visible change). R4 gap 3 did not occur. RoboRev was not run by this validator, package gap 5; the dispatch records FO review 1246 clean.
- `pr54-live.json`: independent GitHub read confirms OPEN Draft, exact candidate, required r5 base and no merge. `safety.json`: candidate/main/live clean; eight daemon PIDs absent; eight isolated roots removed; draft/keyboard/composer files byte-identical to base.

## Scope and limits

AC-1, AC-2 and AC-3 pass within the POC scope. The recorded read-only live identity check (`../implementation/live-identity.json`) establishes no common originating request identity; source schemas still expose no such identity. The mounted retry test and browser fixture show identical wording retained as two separately attributed comms/FO rows. No cross-source merging was added.

The decisive counterexample is the independent shared-builder mutation. The implementation's negative base fixture is supporting evidence for the layout necessity, not a claim of another independent base run. New row layout maps to AC-1, manual guards/subscription readiness and schedule disclosure to AC-2, and preserving attributed rows to AC-3. No new persistence, timer, polling path, backoff, background recovery, relay protocol, permission or decision-recording duty was added; existing timer durations remain unchanged. The draft store, keyboard hook and both composers are byte-identical to base.

This proves synthetic browser rendering/navigation and guarded read behavior. It does not prove native phone UAT, live external service recovery, Captain acceptance, FO gate approval, merge or release. FO must rerun the acceptance command before its gate. The recorded two-unsatisfied-team-pass stop is governed by accepted ADR 0008; no new team pass was commissioned here.

## Harness limits retained

The initial sandboxed test was refused at a local tsx IPC socket (`tests.log`); browser setup was refused at bind before starting a daemon and left empty `ac1-360/`. Attempting that same existing output directory was rejected by the harness; the successful 360 run uses a fresh `ac1-360-run2/`. Initial sandboxed GitHub access also failed (`pr54.json` is a failure marker); the explicit allowed read is `pr54-live.json`. These are environment/harness outcomes, not product failures. An early safety inspection guessed a nonexistent chat.tsx; the corrected check uses the actual co-chat.tsx and decision-card.tsx. No candidate repair was made.
