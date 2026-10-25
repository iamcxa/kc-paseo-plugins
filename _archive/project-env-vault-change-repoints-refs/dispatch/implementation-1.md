# Dispatch record: project-env-vault-change-repoints-refs implementation-1

Dispatched: e55cb332ceec876d3e6e7599da0b94743d7030ed
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, starting from evidence/candidate-disposable.diff in this task's folder: the re-point line between Vault and "Use this connection", Done re-pointing exactly the old-vault references through settleConnection/repointRefs, the outside-vault mark (markedOutside) before Test, the 2 px accent focus outline, and the dated ADR 0005 amendment from the task's Design.
Land evidence for AC-1, AC-2 and AC-3 with the clauses they name (adapt evidence/harness/drive.sh and env.sh to your own ROOT, PORT and SESSION), plus whole-page screenshots at desktop and 400 px of the picked, after-Done, after-Test and outside states, under this task's state folder.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/scripts/adr_lint.py` on docs/adr, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-vault-change-repoints-refs.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main e55cb332ceec876d3e6e7599da0b94743d7030ed (ADR 0007 and project-env-connection-done-cancel-one-row merged). Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`, e.g. `feat(project-env): …`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/extensions/roborev/roborev_gate.py --repo <worktree> --base e55cb332ceec876d3e6e7599da0b94743d7030ed`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: backlog approval (2026-10-23, 「准」, re-point behaviour) and ideation approval (2026-10-25, 「准」). The ADR 0005 amendment's date is the day the Draft PR opens.
Evidence goes under this task's state folder, never on the candidate branch. Report findings as findings; add no checklist lines of your own. Harness: copy from this task's evidence/harness/ with your own ROOT, PORT and SESSION (not /tmp/pe-vcr, 6971, 6972, /tmp/pe-astra or 6920).
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
