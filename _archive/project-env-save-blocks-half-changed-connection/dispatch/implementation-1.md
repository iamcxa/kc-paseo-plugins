# Dispatch record: project-env-save-blocks-half-changed-connection implementation-1

Dispatched: 40849b49bc727dae0731e797e2b207370946c5c2
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, starting from the spike diff in this task's spike/ folder.
Land tests so each acceptance criterion passes with the evidence its clause names and fails when its behaviour is removed, plus whole-page screenshots of the built change at desktop and 400 px.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-save-blocks-half-changed-connection.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 40849b49bc727dae0731e797e2b207370946c5c2. Do not stack. The PR merges by squash. project-env-every-row-findable (Task B) branches from this task's merged main afterwards; keep the save bar's reason line as designed.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base 40849b49bc727dae0731e797e2b207370946c5c2`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: this task's backlog approval (Design Director Task A with the token-refresh recommendation) and its ideation approval (2026-10-23, 「准」).
UI evidence: whole-page screenshots from a running build on an isolated Paseo built with docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ (own S and PORT; not /tmp/pe-astra or 6920), at desktop and 400 px, saved in the task folder.
Comments: count the comment lines your diff adds; delete any that restate the code next to them.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
