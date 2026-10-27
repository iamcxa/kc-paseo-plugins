# Dispatch record: project-env-vault-list-loads-faster implementation-1

Dispatched: 0b55dfd1a534b8dbd04bd1739ca2037e92202f55
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, starting from evidence/candidate-secrets.patch and evidence/fakes-proposed/ in this task's folder: listRefs reads up to ITEM_READS_AT_ONCE = 4 items at once with unchanged op arguments, results folded in item-list order, the earliest item's whole-list cause wins and no new read starts after one; add test/vault-list-concurrency.test.ts from the draft and the fake op delay support it needs, keeping every existing test passing.
Land AC-1's evidence on the real change with the clauses it names (grid.mjs server timing and e2e-matrix.sh on-screen timing at 10, 30 and 100 items, before on main and after on the branch, with load average recorded; the four tests failing and passing as stated), under this task's state folder.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `design_surfaces.py check` on this task and `doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.31.0 (run check scripts from this root)
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 0b55dfd1a534b8dbd04bd1739ca2037e92202f55. Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`, e.g. `perf(project-env): …`. Merging is the Captain's, or FO's under ADR 0007 class 2 after an approved validation.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.31.0/extensions/roborev/roborev_gate.py --repo <worktree> --base 0b55dfd1a534b8dbd04bd1739ca2037e92202f55`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: backlog 「開」 and ideation 「准」 (2026-10-27), which keeps the vault passed by name. Out of scope: the timeout hint and rate-limit classification (r1b), caching, the Test path.
Evidence goes under this task's state folder, never on the candidate branch. Report findings as findings; add no checklist lines of your own. Timing harness: your own S and PORT, not /tmp/pe-vlf or ports 6920-7188 used earlier; record load average with every timing.
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
