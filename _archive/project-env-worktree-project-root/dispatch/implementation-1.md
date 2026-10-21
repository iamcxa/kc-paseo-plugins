# Dispatch record: project-env-worktree-project-root implementation-1

Dispatched: 15b1e3fcb6aabd039758a290b24e36890910e3fd
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design in project-env/server/secrets.ts: match the agent's own worktree root against saved project roots first, then its main checkout; keep the registered-worktree trust check; a worktree's own project wins in that worktree only.
Land the fake-git cases so AC-1's unit clause and AC-2 pass and the new cases fail on today's projectForCwd; record the qnow-adopt-dev2 agent check on Kent's daemon as owed.
Run `npm test` (rerun the known load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 15b1e3fcb6aabd039758a290b24e36890910e3fd (now holding #16 and #17). Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base <base sha>`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: 「也准加入」, 「准」 and 「可以，同意你的計畫」 (2026-10-21).
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or switch the main checkout's branch.
