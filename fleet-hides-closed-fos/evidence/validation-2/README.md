# Independent validation of PR #40

Verdict: PASSED for AC-1 and AC-2 at `e91b9755a0c3444ebf4390f5396499ddf2070457`, relative to `78ce6c1cbcf1258a7ddd7223ea2c93e02d29cc6c`. Live GitHub read confirmed OPEN/Draft, base main, exact candidate. This is the bounded desktop/web POC, not release or Captain acceptance.

## Checks executed by this validator

- `npm-ci.log`: own clean dependency install, exit 0. `typecheck.log`: own `npm run typecheck`, exit 0.
- `tests.log`: initial sandbox denied tsx's local IPC pipe before tests started. `tests-final.log`: same `npm test` with local process permission, 78 pass / 0 fail. Cases assert all-false idle/error, missing labels, mixed true/false, running, archived/lifecycle-closed, and unknown values. Removing the classifier fails all-false; treating a missing label as closed, using any-false, or omitting running/offline exclusions fails the corresponding case. Existing `../negative-rule.txt` was read as the concrete classifier counterexample; that classifier/test assertion is unchanged by later presentation repairs.
- `live-fo-labels.json`: own read-only global FO discovery, then connector reads at each discovered working directory, 13 FOs. `live-rule-check.json`: actual candidate `toRow` evaluated against all 13 captured cases and compared to the accepted rule; all match. OMP trial FO and recce PR review FO are Tab closed; Doc FO has mixed client labels and stays unbadged. No physical tab state was inferred beyond the labels.
- `badge-composer/`: own execution of the existing cycle-3 capture, with a long FO name, fresh HOME/daemon/profile, ports 7081/7082. Visually inspected By FO, By decision/next card, typed composer and opened decision screenshots. Assertions check exact Tab closed wording, matching 1px outlined badges, long-name ellipsis and badge containment, successful opening, outlineStyle none, and three distinct normal/hover/focus border colors. Restoring the old label, dropping any required badge, removing web outline suppression or collapsing focus/hover color breaks a corresponding assertion.
- `narrow-row/`: own cycle-4 capture on ports 7083/7084. Visually inspected the direct 380px board PNG: title 64px, owner shrinks with ellipsis, badge/age remain visible, and content clears the external-link button. `../cycle-4/before/review-row-geometry.json` is the existing baseline counterexample (title 9.14px); the strict current assertions reject it. The row opens without sending a message or decision.
- Both capture harnesses stop their captured daemon PID, check its exit, close the named browser session and delete the temporary root. Both cleanup receipts report homes removed. Synthetic agents, gates, reviews and command responses are declared fixtures. Only the throwaway copy's fleet-server port changes; candidate client/shared bytes are unchanged. No live install, reload, message or decision was performed.
- `checks.json`: ADR lint including required ADR 8 exits 0 (7 records); comment ratio exits 0 (60 code / 0 comment lines, 0.0% <= 5%); doc impact exits 0 (no documents listed); number guards exits 0; all 6 dispatch records complete. OVERVIEW.md directly updates the affected badge claim and agrees with the implementation. No added comments, new ADR, migration or reserved number.
- `verification.json`: exact candidate, versions, script hashes, run exits and unchanged protected source checks. All server/decision relay/recording files and the server entrypoint are byte-identical to base. `boardStatus` and `attachGates` are unchanged; archived/lifecycle-closed offline behavior passes existing tests. Decision-card changes only owner presentation; co-chat changes only the web input style/import.

## Findings, necessity and limits

No new Material finding. Rule classification, its BoardRow field, shared badge and its four display sites meet the accepted distinction without changing grouping or actions. Web-only outline removal addresses the typed input artifact while keeping the border feedback. Test/fixture additions and OVERVIEW.md match those behaviors. The 380px row repair has an observed baseline failure; the explicit next-card flexShrink line had no reproduced web overflow before repair and is only a consistency constraint, as cycle 2 already records. Nothing adds durable state or a new external seam; no POC boundary crossing found.

SKIPPED: design_surfaces exit 1, known package gap 2: approved POC seed omits Surfaces/Visible change markers. Number guards passed; the known R4 package gap 3 did not occur. Roborev not run under dispatch/package gap 5; FO owns those review rounds. The committed FO decline for 320px compact rows is settled; this validation adds no changed evidence to it.

Native appearance, compact/phone layouts, physical two-client tab closing, live deployment, actual relay/recording and Captain acceptance remain unverified. The all-false labels are a declared signal, not independent proof of the user's physical actions. No CI configuration changed; no CI cost measurement claimed.

## Minimal acceptance script

Run unchanged in a fresh shell:

```bash
bash /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/fleet-hides-closed-fos/evidence/validation-2/acceptance.sh
```

The script contains five numbered steps and each expected output: pin/clean check; clean install/typecheck/78 tests; badge/composer capture; 380px row capture; cleanup/clean check. It declares every local tool/asset path and socket prerequisite, creates a unique output directory without overwriting prior evidence, and takes under five minutes with cached dependencies. The script passed `bash -n`; its substantive commands were executed independently in this validation, rather than repeating the already-green suite just to run the wrapper. FO must run the complete script as written before presenting the gate, preserve its output and inspect its generated screenshots. FO retains the validation-gate and authorized stack-delivery decision; no merge is authorized.
