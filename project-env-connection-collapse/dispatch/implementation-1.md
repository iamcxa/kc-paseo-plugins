# Dispatch record: project-env-connection-collapse implementation-1

Dispatched: d61e24396b42dfb15827bacd6970627c6f6425ba
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, including every interface it names for its sibling tasks and, where present, Captain amendment 1 in the task file.
Land tests so each acceptance criterion passes with the evidence its clause names and fails when its behaviour is removed, plus whole-page screenshots of the built change at desktop and 400 px.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-connection-collapse.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main d61e24396b42dfb15827bacd6970627c6f6425ba, which holds project-env-draft-survives-remount (the openProject store: change the draft only through openProject.update(change, countsAsEdit); saved values are `initial`). Do not stack. The PR merges by squash.
Parallel work: project-env-field-pill-one-control, project-env-save-footer-danger-zone and project-env-connection-collapse are implemented at the same time off this base; stay inside your own part of settings-screen.tsx so the second and third to merge only need a small merge of main.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base <base sha>`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: direction A5 (「就這樣」) and this task's ideation approval (2026-10-22), including the recommendation or amendment its gate stated.
UI evidence: whole-page screenshots of the built change from a running build on an isolated Paseo (own PASEO_HOME and port, throwaway plugin id, fake op/security/git), at desktop and 400 px, saved in the task folder; the Captain sees them.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
