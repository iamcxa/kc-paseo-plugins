# Dispatch record: project-env-journey-map-r1b-update implementation-1

Dispatched: bed5a6644c646e91c9cbc235807f33bce878cc8f
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Apply the approved edits to docs/journey/project-env/give-agents-their-project-setup.yaml exactly as the task's Design writes them (design/journey-six-edits.diff): the five edits plus the sixth (write-prompt and new-agent-instructions to gap without evidence), nothing else.
Land AC-1's evidence at the candidate commit: journey-lint with an explicit repo root exits 0, the diff against origin/main touches only those hunks, and `git grep -nw` finds each of the four exists symbols; then run the roborev gate and doc_impact.py, and open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0 (run check scripts from this root)
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main bed5a6644c646e91c9cbc235807f33bce878cc8f. Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit title scoped `project-env`, e.g. `docs(project-env): …`. Merging is the Captain's, or FO's under ADR 0007 class 2 after an approved validation.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0/extensions/roborev/roborev_gate.py --repo <worktree> --base bed5a6644c646e91c9cbc235807f33bce878cc8f`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: 「移出」, 「開」 and ideation 「准」 (2026-10-28), which accepted the sixth edit. Do not render or edit a canvas.
Evidence goes under this task's state folder, never on the candidate branch. Report findings as findings; add no checklist lines of your own.
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
