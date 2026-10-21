# Dispatch record: project-env-vault-boundary implementation-1

Dispatched: 60799d96ea70215eba145893357c1d773903d242 (worker fast-forwards onto f53d485f1e963388e8a8b513f483bdb24d65f6e5)
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design: at the top of the per-variable step in `resolveProject`, before the cache and `op`, refuse a reference whose vault part (via `parseRef`) is not exactly the saved `vault` string, blanking it with cause `outside-vault`; with no vault saved every reference is outside.
Land the fake-op tests for AC-1 (op not called for that reference) and AC-2 (the matching-rule table), each failing when the check is removed.
Run `npm test`, `npm run typecheck` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, and open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: this task builds on project-env-plain-failure-reason (Draft PR iamcxa/kc-paseo-plugins#9, branch `spacedock-ensign/project-env-plain-failure-reason`, head f53d485f1e963388e8a8b513f483bdb24d65f6e5), which itself sits on project-env-new-agent-env (PR #7, head 6244ff6). Neither is merged. Before any edit, bring your own fresh worktree branch to that head with `git -C <your worktree> fetch origin` then `git -C <your worktree> merge --ff-only f53d485f1e963388e8a8b513f483bdb24d65f6e5`, use the shipped seams (`createSecrets(tools)`, `contribute(server, tools)`, fakes, `makeWorld`/`calls()`, `shared/cause.ts`, `server/cause.ts` with `parseRef` and `causeText`), and open your Draft PR with base `spacedock-ensign/project-env-plain-failure-reason`. If #9 or #7 changes or merges while you work, rebase onto the new head and say so in your report.
Captain rulings carried into r1: an empty value is a failed variable (「算失敗」); a reserved name is neither applied nor blanked (「做法一」, ADR 0004). Both 2026-10-20.
PRs go to iamcxa/kc-paseo-plugins as a Draft; commit and PR titles use conventional commits scoped to the plugin, e.g. `feat(project-env): …`, because release-please reads them. Merging is Kent's.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check secrets only by shape.
Kent's live plugin install `paseo-project-env` (from /Users/kent/Project/paseo-project-env) must not be changed, reloaded or removed. A live probe uses a separate install id and an isolated daemon, as the ideation spike did, and is removed afterwards; if that cannot be made certain, skip it and say which proof is still owed.
roborev not run: the extension was listed on 2026-10-21 (PR #12), after this dispatch; line added 2026-10-21 by FO, which ran roborev_gate.py on the delivered head afterwards: clean on a30ad63, evidence=roborev:956.
