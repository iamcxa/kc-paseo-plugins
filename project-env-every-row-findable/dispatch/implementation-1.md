# Dispatch record: project-env-every-row-findable implementation-1

Dispatched: cad57e0ce2279c4d88f2eca3283528ae58d19158
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, starting from the spike diff and tests in this task's spike/ folder.
Land tests so each acceptance criterion passes with the evidence its clause names and fails when its behaviour is removed (including a mutation that removes the scroll margin, which ideation did not run), plus whole-page screenshots of the built change at desktop and 400 px.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-every-row-findable.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main cad57e0ce2279c4d88f2eca3283528ae58d19158 (Task A merged as PR #29). Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base cad57e0ce2279c4d88f2eca3283528ae58d19158`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: this task's backlog approval (Design Director Task B with the ≠ wording) and its ideation approval (2026-10-23, 「准」).
UI evidence: whole-page screenshots from a running build on an isolated Paseo built with this task's spike/harness or docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ (own S and PORT; not /tmp/pe-astra or 6920), at desktop and 400 px, saved in the task folder.
Without-it: list any added line you cannot justify under "without-it unanswered" in the PR body. Count the comment lines your diff adds; delete any that restate the code next to them.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
