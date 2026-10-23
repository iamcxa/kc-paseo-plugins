# Dispatch record: project-env-remove-conductor-import implementation-1

Dispatched: 78ce6c1cbcf1258a7ddd7223ea2c93e02d29cc6c
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved removal exactly (Design section of the task file): delete the Conductor import from client, server, shared and tests; apply the journey map edits, including the approved repair of story add-remove-variable's stale evidence newName to nameFromLabel; add the dated ADR 0004 amendment.
Land evidence for AC-1 to AC-3 with the clauses they name, plus whole-page screenshots of the built change at desktop and 400 px, under this task's state folder.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the journey lint, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since 60799d9`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-remove-conductor-import.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 78ce6c1cbcf1258a7ddd7223ea2c93e02d29cc6c. Do not stack. The PR merges by squash. project-env-connection-done-cancel-one-row branches from this task's merged main afterwards.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/extensions/roborev/roborev_gate.py --repo <worktree> --base 78ce6c1cbcf1258a7ddd7223ea2c93e02d29cc6c`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: backlog approval and ideation approval (2026-10-23, 「准」, d-1mybcg) with the stated recommendations.
Evidence goes under this task's state folder, never on the candidate branch. Report review findings as findings; add no checklist lines of your own. Harness: docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ with your own S and PORT (not /tmp/pe-astra or 6920).
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
