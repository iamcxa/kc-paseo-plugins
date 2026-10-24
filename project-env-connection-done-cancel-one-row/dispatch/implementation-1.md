# Dispatch record: project-env-connection-done-cancel-one-row implementation-1

Dispatched: 4e22d4ad63bc50d4bcc32a403720b429152bad8a
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, starting from evidence/candidate-disposable.diff in this task's folder: one "Use this connection" row right after Vault with Cancel and Done on the right, the disabled-Done reason in the row; Cancel and Done keep their behaviour. Leave the save bar unchanged.
Land evidence for AC-1 and AC-2 with the clauses they name (adapt evidence/drive.sh and measure.js to your own paths), plus whole-page screenshots at desktop and 400 px, under this task's state folder.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-connection-done-cancel-one-row.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 4e22d4ad63bc50d4bcc32a403720b429152bad8a. Do not stack. The PR merges by squash. project-env-vault-change-repoints-refs branches from this task's merged main and adds its re-point line in its own row above this one.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/extensions/roborev/roborev_gate.py --repo <worktree> --base 4e22d4ad63bc50d4bcc32a403720b429152bad8a`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: backlog approval (option A) and ideation approval (2026-10-24, 「准」), including leaving the save bar unchanged.
Evidence goes under this task's state folder, never on the candidate branch. Report findings as findings; add no checklist lines of your own. Harness: docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ with your own S and PORT (not /tmp/pe-astra or 6920).
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
