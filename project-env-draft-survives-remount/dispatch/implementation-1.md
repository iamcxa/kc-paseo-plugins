# Dispatch record: project-env-draft-survives-remount implementation-1

Dispatched: 1adf63042be22646c0192c47028f72a1b1960c11
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design: a module-level open-project store (initial, draft, edits, revision, session) that survives the settings screen re-mounting, cleared on Save, Discard, Stop managing and a full reload, exposing the interfaces the sibling designs named (saved, draft, close(), openProject.update(change, countsAsEdit)); the typed token, Test results and open dialogs are not kept.
Land the store unit test and the scripted resize run on an isolated Paseo so AC-1 passes with the evidence its clause names, with before and after whole-page screenshots at desktop and 400 px; the evidence must fail on main.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-draft-survives-remount.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 1adf63042be22646c0192c47028f72a1b1960c11. Do not stack. The PR merges by squash. This task merges first among the A5 rework tasks.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base <base sha>`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: direction A5 (「就這樣」), this task's ideation approval 「准」 (2026-10-22), accepting that a draft also survives leaving and returning to the settings screen.
UI evidence: whole-page screenshots from a running build on an isolated Paseo (own PASEO_HOME and port, throwaway plugin id, fake op/security/git), saved in the task folder; the Captain sees them at the gate.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
