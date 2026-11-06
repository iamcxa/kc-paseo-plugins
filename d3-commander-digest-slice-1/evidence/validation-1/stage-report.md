

## Stage Report: validation

- DONE: Independent verdict on AC-1 for PR #74 at ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43, from your own npm ci / typecheck / test run: your own mutations of the digest validator (accept a wrong round, a foreign source, a hash mismatch, a missing per-line ref), of collection provenance (let an agent notification end a collection; let a rejected collection reply reach the question reader) and of the Replay whole-failure state (keep context lines after a whole-request failure) each make a named test fail; and a sequence-0 source reads back exactly (AC-1)
  AC-1 PASSED: own npm ci/typecheck and 403/403 tests; seven own passing-baseline/failing-mutant counterexamples cover all named guards, including a reread-hash mismatch within valid round membership. Exact source #0, singleton/split Commander and epoch/hash/range/gap controls pass (mutations.json, tests-authorized.log, acceptance-run.log).
- DONE: Independent verdict on AC-2 and AC-3: your own isolated-host or fixture-host captures at 1440 and 360 of the digest, a Replay with three sourced context lines and the same-FO window, earlier/later, each of the three exits including Open FO arrival and ← Commander return with drafts kept, source unavailable leading the card, and the switch offer, confirm and the old conversation after the switch; your own check that no archive happens without confirm (AC-2, AC-3)
  AC-2/AC-3 PASSED within fixture scope: 40 bound captures (desktop-4/, phone-2/ first 17, phone-switch-2/) exercise each source, same-FO paging, three exits/focus, actual FO arrival/return with both drafts, leading source loss, cancel/no archive, confirmed replacement and read-only history. All eight attempts cleaned (capture-binding.json, cleanup-verified.json).
- SKIPPED: AC-4 is SKIPPED (the collect-now measurement needs a configurable Bridge fleet port and data directory, outside this task; pending the Captain); record it so, with no cost claim
  Unmeasured under the recorded FO ruling: configurable fleet port/data directory need separate scope/Captain handling. No provider turn, usage sample or cost claim.

### Findings

- F1 Needs decision: boundary-crossed: persistent-state. Normal trigger: Captain confirms the accepted new-officer switch. server/coordinator.ts adds ~/.local/share/paseo-fo-coordinator/coordinator-switch.json; the real default store in a disposable HOME survives process exit and is reused by a second process (persistence.json: creates 1 then 0). No user-visible error was observed; this is a profile boundary, not an AC failure.
  Affected boundary: contract[references/profiles/poc.md#poc-bounded-proof] sends beyond-session state back to profile selection. The candidate's Accepted ADR 0008 also stops for this crossing (adr-read.json pins full commit/digest); no exception for the new file was found. FO/Captain own the profile/storage decision; no repair or promotion is authorized here.

Verdict: AC-1/AC-2/AC-3 PASSED at fixture depth; AC-4 SKIPPED; overall HOLD / Needs decision on F1 before recommending delivery. The Captain-settled disk-write retry risk remains the existing FO decline; no new material trigger was observed.
Candidate: ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43; base 33952f9b3d02fceab104ba09272d65e432a3d095; PR #74 verified OPEN/Draft at that head (pr-verified.json). No candidate commit, PR edit, merge, install or live Bridge action.
Evidence: d3-commander-digest-slice-1/evidence/validation-1/RESULT.md records falsifiers, guard/document checks, goal sufficiency/minimal necessity, rejected harness attempts and limits. All candidate changes map to sources/Replay/confirmed replacement/collect-now; no unrelated refactor or candidate scaffolding remains.
Package: absolute scripts from loaded Codex kc-dev-flow-2 0.35.0; comment ratio 529 code/0 comments (0.0%), seven existing ADRs, design surfaces, nine dispatch records and number guards pass; doc-impact finds zero affected mentions. No R4 failure, so its package-gap skip was unnecessary. package-identity.json records two differences from the dispatch's Claude scripts; results use the loaded skill root, not mixed installations.
RoboRev not run: package gap 5 assigns exact-head review to FO. No ADR reserved under the FO POC ruling; no added migration/comment/dependency. OVERVIEW.md and coordinator/EXTENSION.md reflect exercised behavior; no diagrams changed.
Acceptance: evidence/validation-1/acceptance.sh has five steps under five minutes and ran unchanged in a fresh shell with exit 0 (acceptance-run.log); acceptance.md explains prerequisites/limits. FO owns its gate-time run and Captain handoff.
Limits: installed Paseo 0.15.1 UI/SDK components with unchanged JSX, fictional SDK/RPC and a disposable no-op server. No provider/credential/live Bridge access, physical-device/keyboard proof, paraphrase-fidelity proof or full real-daemon source-retention/race proof. Captured PIDs are absent, homes removed and all assigned non-live ports closed; candidate/main/flywheel-live remain unchanged.

### Summary

Independently validated the pinned digest, Replay and confirmed-officer behavior with 403 passing tests, seven falsifying mutations and 40 accepted desktop/phone captures. The assessment is complete with the durable-ID POC boundary returned to FO/Captain as Needs decision; AC-4 stays skipped and PR #74 stays Draft/unmerged.
