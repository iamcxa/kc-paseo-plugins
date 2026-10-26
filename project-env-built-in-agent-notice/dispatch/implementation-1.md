# Dispatch record: project-env-built-in-agent-notice implementation-1

Dispatched: 335d129a6ecf5fce11fc31917f005bd871f65de6
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved revision 2 design exactly, starting from evidence/candidate-disposable.diff in this task's folder: the revision 2 notice text added in agent.create through the shared hasVariables predicate, the default-prompt box removed with the prompt key dropped from the schema (amendment 1), the Danger zone and Stop managing wording, the "Projects › <name>" breadcrumb link with its discard question, and project-env/OVERVIEW.md from design/OVERVIEW.draft.md.
Land evidence for AC-1 to AC-4 with the clauses they name on the real branch build (adapt evidence/harness/ to your own S and PORT), rerun the comprehension check's harness on the final notice text for at least one Claude and one Codex run, plus whole-page screenshots at 1280 and 400 px of the work, legacy, list and discard states, under this task's state folder.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `design_surfaces.py check` on this task and `doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.31.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 335d129a6ecf5fce11fc31917f005bd871f65de6. Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`, e.g. `feat(project-env): …`. Merging is the Captain's, or FO's under ADR 0007 class 2 after an approved validation.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.31.0/extensions/roborev/roborev_gate.py --repo <worktree> --base 335d129a6ecf5fce11fc31917f005bd871f65de6`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: backlog approval (2026-10-24, 「開…」), amendment 1 (2026-10-25, 「拿掉避免誤會」), revise (2026-10-25) and ideation approval of revision 2 (2026-10-26, 「准」), which accepted the revision 2 notice text, dropping a saved prompt silently, and AC-4.
Evidence goes under this task's state folder, never on the candidate branch. Report findings as findings; add no checklist lines of your own. Harness ports and folders: not /tmp/pe-astra, /tmp/pe-vcr*, /tmp/pe-ban, /tmp/pe-bn2 or ports 6920, 6934, 6935, 6944, 6945, 6971, 6972, 6981, 6991, 6993. Comprehension runs use fake values only and never Kent's live plugin.
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
