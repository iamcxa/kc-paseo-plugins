# Independent validation of ADR 0008

Verdict: PASSED for AC-1 and Captain amendment 1 at `987698fa90a7ec7b05c672872b8b5ba8a7888aa0`, against base `e4f95aee269cf14df571fb8f14e4d82d6cb9da45`. This is approval-ready grant wording, not an activated grant. The sole candidate change adds the 128-line ADR; the candidate and main checkouts were clean.

## Scope and authority comparison

References below are candidate ADR line numbers, independently read against the task's Scope, amendment 1, and all three implementation dispatch records. The interim lifecycle is attested by the committed follow-up dispatch and implementation report; this validation does not independently authenticate the original chat.

| Accepted requirement | Candidate evidence and judgment |
| --- | --- |
| One ADR; next free number; supersedes 0006 | Only ADR 0008 added; lines 11–15 supersede 0006 in full only on effectiveness. Existing 0006 remains byte-unchanged. 0007 is explicitly reserved by the assignment; number guard reports R4 only, no duplicate-number R5. |
| Flywheel: FO theme, backlog, workers, validation, stacked PR, top reload, play card and option feedback | Lines 49–55 retain every actor and step. No product implementation added. |
| Fresh validation, design partner, two picky users, observer; nothing unresolved; chief-engineer orders next rounds | Lines 71–73 retain all participants and the satisfaction condition. These are future round obligations, not additional workers owed by this document-validation task. |
| Never merge into any branch; release-please sees nothing; outcome report; no downstream task or profile choice; close stack afterward | Lines 75–79 and 88–92 retain each term, with the Captain's explicit cleanup decision rather than an automatic terminal transition. Earlier quote 4's different closure suggestion is preserved as historical wording; the final Scope controls. |
| Ten rounds or 2026-11-06; twice unsatisfied on a theme; consecutive observer violations; four POC boundary stops | Lines 94–98 preserve both limits, both repeated-failure conditions and all four boundaries. |
| Round records, ledger, play card, answers, separate violation classes, executable repair evidence, recurrence | Lines 100–104 retain each field and require running the relevant script and committing its output. |
| Captain retains security, permissions, relay/record rules, releases/outward actions, deletion, exit and merges | Lines 106–108 retain these, with only amendment 1's explicit push/PR exception. |
| Captain accepts running unreviewed top-of-stack code | Lines 54–55 and 125–126 retain the accepted exposure and distinguish it from release. |
| Explicit README exception, only backlog/validation gates; no merge | Lines 110–119 retain the quoted sentence and narrow gate exception, plus the separately granted push/PR authority. |
| Grant task's own gates and merge remain Captain-only | Lines 11–15 and 61–62 prevent self-activation or marking this grant's PR ready. Status remains Proposed. |
| Non-goals: no dev2, README, project-env or plugin changes | Lines 127–128 state these; the exact candidate diff confirms all are untouched. |
| Amendment 1: verbatim push/stacked-PR grant; supersedes none | Line 40 byte-matches the source; lines 57–69 grant only round push/PR actions. Optional ready-for-Codex-review and fixes-on-top follow the authorized repair dispatch; restrictions narrow execution and create no merge authority. |
| Interim lifecycle from accepted design | Lines 81–92 retain pending terminal approval, the round-log marker, no rework/forced terminal status, package-gap reporting and Captain handling of closed-without-merge cleanup. |

## Current workflow compatibility

Compared candidate README to `c143dc73cdb8` (kc-dev-flow-2 0.28.0): only commission/version metadata, amendment timing wording and migration-guard clarification changed. The authority exception sentence, delivery authority and pending-merge obligations relevant to this ADR did not change. The quote matches the README sentence after joining its Markdown line wraps; AC-1's byte-exact requirement applies to the Chinese quotation spans, all ten of which pass without normalization.

`docs/dev2-poc/_mods/pr-merge.md` is identical at the candidate and c143dc7. Its explicit standing push/PR authority is supplied by amendment 1; its prohibition on archiving before observed merge is respected by keeping round tasks pending. Closing without merge still returns to the Captain. The mod's trunk-push, local-merge fallback and restacking mechanics do not expand the narrower grant: the README explicitly subjects hook instructions to Captain authority, while this ADR prohibits main pushes, any merge and rewriting existing rounds. No automatic stack-delivery terminal exists or is claimed.

## Checks, necessity and limits

`checks.json` records command arguments, working directories, stdout, stderr and exit codes. ADR lint exits 0 (7 files, 0 legacy); document impact exits 0 with zero listed documents, so the implementation's empty affected-document disposition is correct; comment ratio exits 0 (0 code/comment lines); dispatch records exits 0 (4 complete); whitespace exits 0. No CI configuration changed.

All ten nested/outer Chinese quote spans match the task's accepted source before any Stage Report. The in-memory full-width-B-to-ASCII-B mutation is rejected; no candidate bytes were changed. The base has no ADR 0008, the initial candidate lacks amendment 1, and the pre-final candidate lacks the interim lifecycle paragraph: removing these additions loses accepted terms. Each retained paragraph maps above to the goal, source attribution, a boundary or the required lifecycle; no runtime machinery or unrelated surface was retained.

SKIPPED: design_surfaces acceptance enforcement — observed exit 1 for missing Surfaces/Visible change; known package gap 2 in `_l3-dogfood/rounds.md`, Round 0. SKIPPED: number_guards R4 acceptance enforcement — observed exit 1 for no ADR reservation; known package gap 3 conflicts with POC's no-reservation rule. No new failure class appeared. Migration checks say skipped because no migrations-path is declared; this candidate changes no migration or runtime code.

No Material or Needs decision finding. The dispatch reports RoboRev 1115 clean; it was not independently rerun or counted here. GitHub read-only metadata observed PR #38 OPEN, Draft, unmerged at the exact candidate (saved separately). No gate, PR, merge, reload, round task, candidate branch or original task source was changed. No POC runtime boundary crossing occurred in authoring/validating this document; the actual flywheel, hook execution, future round review satisfaction and end cleanup remain unproven.

## Minimal acceptance script

Run unchanged in a fresh shell:

```sh
/bin/bash --noprofile --norc /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/flywheel-grant-adr/evidence/validation-1/acceptance.sh
```

The script contains three numbered actions and expected observations, declares Python 3/Git and all required checkout/package paths, and needs no inherited shell variables. Its observed output is `acceptance-output.txt`. The package path resolves from the loaded Codex skill, as the stage's Dispatch facts require; it differs from the dispatch's Claude cache path. FO must rerun and show every step in full beside its output before the Captain's gate. It proves exact artifact/quotation/lint properties, not semantic authorization, operational success or delivery.
