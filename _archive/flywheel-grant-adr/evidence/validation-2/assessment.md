# Repair validation of ADR 0008

Verdict: PASSED at `81096c60d65655610ae5c83ca2899fb708d12e0b`, compared with validated `987698fa90a7ec7b05c672872b8b5ba8a7888aa0` and base `e4f95aee269cf14df571fb8f14e4d82d6cb9da45`.

The complete tree diff since the validated head modifies only ADR 0008. A byte comparison proves the entire file is exactly the prior file with its sole Status value changed from Proposed to Accepted. The full Context is identical, including the condition that the grant takes effect only when the Captain merges the PR himself. Accepted is the record status for the eventual merged document; it does not override that explicit effectiveness condition. The FO-authorized repair in the task and implementation follow-up 3 is exactly satisfied.

The prior validation-1 assessment's Scope, amendment, lifecycle and workflow compatibility analysis is reused for unchanged content. Its references to Proposed and the prior head are superseded by this assessment; no fresh operational proof is claimed. The one-line repair addresses the recorded post-merge status ambiguity without altering authority or adding machinery. Thus the accepted document goal remains sufficient, and the retained change is the minimum authorized repair. Ten nested/outer quotation spans still match task-source bytes exactly; the full-width-B mutation is rejected.

## Observed evidence

- `acceptance.sh` ran unchanged in a fresh Bash without profiles, starting at `/`: exit 0. It checks the exact clean candidate, one added ADR since base, one-line repair since prior validation, identical Context, ten source quotes and ADR lint. Counterexamples reject the old status, changed effectiveness condition and a changed quoted byte. A further changed byte or path fails repair equality.
- ADR lint: `python3 /Users/kent/.codex/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008` from the candidate worktree: exit 0, seven records, zero legacy. A missing required ADR or section fails.
- `checks.json`: document impact exit 0, zero listed documents (no disposition missing); comment ratio exit 0, zero code/comment lines; dispatch records exit 0, six complete; whitespace exit 0.
- `pr38.json`: GitHub connector independently observed PR 38 open, draft, unmerged, with exact head `81096c60d65655610ae5c83ca2899fb708d12e0b`. No PR mutation was performed.

## Findings and limits

No new Material or Needs decision findings. SKIPPED: design_surfaces acceptance enforcement, known package gap 2, observed exit 1 for missing Surfaces/Visible change. SKIPPED: number_guards R4 acceptance enforcement, known package gap 3, observed exit 1 for no ADR reservation under POC. Both dispositions follow the dispatch; no additional failure appeared. Migration guard reports no declared migrations path; no migration file changes.

RoboRev 1117 clean is supplied by the dispatch and was not rerun or counted as a new review round. Earlier chat provenance and semantic comparison retain validation-1's stated limits. No UI changed. Runtime flywheel operation, future team reviews, reload and cleanup remain unproven. No boundary crossing is created by this document validation. The Captain's gate and merge remain pending; neither Accepted nor passing checks activate the grant.

## Acceptance command

Run `/bin/bash --noprofile --norc /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/flywheel-grant-adr/evidence/validation-2/acceptance.sh` unchanged. Three steps, expected under one minute; Python 3, Git, named code/state checkouts and the loaded Codex 0.28.0 package are declared prerequisites. Output is saved in `acceptance-output.txt`. FO must rerun and present the full steps and observations before the Captain's gate. The script proves artifact, quote and lint properties, not semantic authorization, execution, adoption or merge.
