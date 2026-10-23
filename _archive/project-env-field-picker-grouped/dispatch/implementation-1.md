# Dispatch record: project-env-field-picker-grouped implementation-1

Dispatched: d197f9d1cee1f6e08d1d20974da6709acb22fa57
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, including every interface it names for its sibling tasks.
Land tests so each acceptance criterion passes with the evidence its clause names and fails when its behaviour is removed, plus whole-page screenshots of the built change at desktop and 400 px.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-field-picker-grouped.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main d197f9d1cee1f6e08d1d20974da6709acb22fa57, which now holds the openProject store (#22), the save bar and Danger zone (#23), the one-line connection (#25) and the field pill rows with the stand-in picker (#24). Change the draft only through openProject.update. Do not stack. The PR merges by squash.
Parallel work: project-env-test-summary-failure-mark and project-env-field-picker-grouped are implemented at the same time off this base; stay inside your own part of settings-screen.tsx, since the second to merge will merge main.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base d197f9d1cee1f6e08d1d20974da6709acb22fa57`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: direction A5 (「就這樣」) and this task's ideation approval (2026-10-22); where that gate's question stated a recommendation, it is part of the approval.
UI evidence: whole-page screenshots of the built change from a running build on an isolated Paseo (own PASEO_HOME and port, throwaway plugin id, fake op/security/git), at desktop and 400 px, saved in the task folder; the Captain sees them. Show the page with the save bar, connection line and pill rows present.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
Stand-in to replace: main holds project-env/client/field-picker.tsx and project-env/shared/field-picker.ts, copied unchanged from this task's design stand-in by project-env-field-pill-one-control (PR #24). Replace them with this task's real picker, keeping the interfaces the pill uses (FieldPicker, VaultList, sameName, and what settings-screen.tsx imports).
Findings routed here from PR #24, to fix in this task: (1) roborev:1033: the picker keeps its search text after a pick closes it; (2) Codex round 2 P2: the "Type a reference…" check accepts references with empty or whitespace-only path segments (`op://Dev/item//field`, `op://Dev/ /field`) that the server's `parseRef` rejects; make Use apply the same segment rules as `parseRef` (shared/ref.ts). Each needs a test that fails without the fix.
"Type a reference…" stays: the Captain's ideation approval included the recommendation to keep it.
