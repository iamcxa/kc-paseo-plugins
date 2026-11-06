# Independent validation — Commander digest slice 1

Candidate: ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43; base: 33952f9b3d02fceab104ba09272d65e432a3d095. The candidate branch is spacedock-ensign/d3-commander-digest-slice-1 in its assigned worktree. GitHub readback confirms PR #74 OPEN/Draft at that head. No product edits, candidate commits, PR mutations or live Bridge actions were made.

## Verdict

AC-1, AC-2 and AC-3 pass within the dispatched fixture boundary. AC-4 is SKIPPED under the recorded FO ruling, without a cost claim. The overall delivery recommendation is HOLD / Needs decision for the POC persistent-state boundary below; validation does not authorize installation or merge.

## Independent automated evidence

- npm ci completed; npm run typecheck exited 0; npm test passed 403/403. The first sandboxed npm test could not open tsx IPC (EPERM); the identical command passed with approved local-socket access, retained in tests-authorized.log.
- Seven own disposable-copy mutations each changed a passing named test to a failure, recorded with exact replacement text in mutations.json: wrong round, foreign source, changed reread hash, empty per-line refs, an agent notification ending collection provenance, a rejected collection entering the question reader, and retaining context after a whole Replay request rejection. The hash counterexample independently changes the reread text while retaining round membership, proving the actual hash check rather than only the membership check.
- The whole-failure mutation is caught for both earlier/later, Commander revalidation and transport errors. Existing controls also cover typed side-only failure, actual end-of-history, null/refusal, pending retry and superseded responses. The seven individual baseline runs all exited 0. The initial summary parser expected TAP while Node printed its spec reporter; the preserved failing logs were parsed correctly without rerunning tests (parser-correction.txt).
- The exact candidate's sequence-zero tests validate every context ref, reread source #0, return neighbors [0,1,2], never emit a negative cursor, preserve #1 -> after #0 behavior, and reject epoch/hash/range/gap/missing-row corruption. Commander intervals beginning at zero are exercised for both singleton and split replies. These are schema-checked fixtures, not an independent full daemon timeline proof.
- Confirmation tests prove no effects for confirm=false and create -> persist -> archive for confirm=true; UI tests and captures prove offer/cancel cause no archive. The Captain-settled disk-write retry risk remains the existing FO decline; no new trigger makes it material here.

## Visible evidence

The successful desktop-4/ run contains 20 states at 1440x1000; phone-2/ supplies the first 17 states and the settled phone-switch-2/ run supplies three switch states at 360x780 (40 accepted captures total), bound to all original candidate files by source-identity.json and capture-binding.json. They exercise digest, each line's own #3/#5/#7 source, same-FO window, paging from edges, all three exits, actual in-Bridge FO arrival and Commander return with both unsent drafts, source-unavailable leading the card, switch offer/cancel/confirm, and retained old conversation without a composer. Assertions check settled focus on both reply exits, zero unsolicited sends, visible fixed exits, true-bottom scroll, no horizontal overflow and no selected gate. The layout and source/exit relationships match the accepted d1 cycle-5 REVIEW.md; this is the validator's assessment, not a new design-director ruling.

The real installed Paseo 0.15.1 host renders unchanged candidate JSX using fictional SDK/RPC results and a no-op server entrypoint. The real product server is never launched. Each daemon uses a fresh home, distinct non-live ports and a captured PID; each browser uses a fresh profile, isolated HOME, short private socket path and localhost-name blocking. No provider authentication or credential file was used. Captures are sequential. All attempts, including harness failures, are retained and cleaned. Early attempts exposed socket-length limits and system-language selectors; the first phone run used Escape instead of the visible phone-sheet exit, so its switch images are rejected. phone-2/ then reached the switch but reopened the sheet before settlement; its switch images are also excluded. The corrected focused switch run waits for dismissal and reopens only after settlement; it records per-state effects and completes. A shortened-harness helper omission was also corrected before its final three images. None required product changes.

These captures prove rendered browser behavior with fictional data, not provider fidelity, real daemon source retention/races, physical-device behavior, soft keyboards or a live collection. Hash identity does not establish paraphrase truth or causality.

## Findings

- F1 Needs decision: boundary-crossed: persistent-state. server/coordinator.ts adds ~/.local/share/paseo-fo-coordinator/coordinator-switch.json and reads its replacement/previous IDs in later sessions. A two-process probe using the real default store in a disposable HOME observed one creation in the first process and reuse with zero creation in the second (persistence.json). This meets the loaded POC profile's explicit beyond-session state trigger; no recorded exception or profile promotion was found. The accepted new-officer feature itself is not rejected and no user-visible error was observed. The candidate's Accepted ADR 0008 also explicitly stops for persistent-state crossings (exact commit/digest in adr-read.json). FO should present the profile/storage decision to the Captain under references/profiles/poc.md; do not repair or silently promote the profile.

## Package and document checks

All scripts run by absolute path from the loaded Codex kc-dev-flow-2 0.35.0 package: comment ratio 529 code / 0 comments, 0.0%; seven existing ADRs pass; doc-impact finds zero candidate-mentioned documents; design surfaces pass; nine dispatch records complete; number guards pass with no R4 failure (the dispatched R4 skip carve-out was not needed). No ADR number was reserved under the FO POC ruling. No added comments exist. OVERVIEW.md and coordinator/EXTENSION.md accurately describe the checked behavior and its storage, memory-round and measurement limits. No diagrams changed.

The dispatch names the Claude 0.35.0 package while the loaded skill's explicit rule chooses the Codex package. package-identity.json records that four checked scripts match exactly while design_surfaces.py and dispatch_records.py differ; results identify the loaded package and do not mix installations. RoboRev was not run by this worker: dispatch package gap 5 assigns exact-head review to FO.

## Goal sufficiency and necessity

Within the bounded proof, sources/validator/shared grouping serve AC-1, Replay/FO navigation and retained context serve AC-2, confirmed replacement/read-only history serve AC-3, and collect-now exposes the unmeasured AC-4 action without adding scheduling. Mutations establish the necessity of the source/provenance/failure guards. Existing base-goal and repair-negative evidence was read as supporting historical evidence, not counted as an independent rerun. No unrelated refactor, dependency, migration or temporary candidate scaffolding remains. The required durable switch IDs also establish F1's profile transition; a passing feature is not a profile exception.

## Acceptance and pending work

acceptance.sh provides five fresh-shell steps under five minutes: exact revision/clean worktree, npm ci/typecheck, all tests, seven mutation counterexamples and capture/evidence integrity. acceptance.md explains prerequisites and limits. The worker ran that script unchanged in a fresh shell with exit 0 (acceptance-run.log); FO owns its separate gate-time run, the Captain's storage/profile decision and any installation; PR #74 remains Draft/unmerged, with no new merge authorization. AC-4 requires a separately authorized configurable fleet port/data directory before measurement. Do not interpret the skipped item as zero cost.
