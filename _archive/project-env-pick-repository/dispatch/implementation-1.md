# Dispatch record: project-env-pick-repository implementation-1

Dispatched: d973876544a8af1d18b052aaf069665b2f27b38f
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, starting from design/evidence/ in this task's folder: the pure function in shared/project-list.ts with its unit tests, the Add a project row's five states in Configured (no project, all configured, list failed with Try again, loading, the select unchanged), and the one Prepare-page sentence in docs/project-env/prepare-1password.md.
Land AC-1 and AC-2 evidence on the real branch build with the clauses they name (isolated Paseo, the four runs at 1280 and 400 px, the failed-retry sequence, a repository added through the sidebar appearing without reload, the unit tests failing when either new branch is removed), retake the docs screenshots with docs/project-env/capture/ and confirm none changed, under this task's state folder.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `design_surfaces.py check` on this task and `doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.1 (run check scripts from this root)
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main d973876544a8af1d18b052aaf069665b2f27b38f. Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit title scoped `project-env`, e.g. `feat(project-env): …`. Merging is the Captain's, or FO's under ADR 0007 class 2 after an approved validation.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.1/extensions/roborev/roborev_gate.py --repo <worktree> --base d973876544a8af1d18b052aaf069665b2f27b38f`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: backlog 「r1b開」 and ideation 「准」 (2026-10-28), which kept AC-2 and accepted the 8 px label shift.
Evidence goes under this task's state folder, never on the candidate branch. Report findings as findings; add no checklist lines of your own. Harness folder and ports your own (not 6920-7410, 18491, 18492, or the ideation's /tmp/pick-repo-*). Pictures for the PR carry no host or person name.
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
