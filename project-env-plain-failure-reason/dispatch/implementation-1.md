# Dispatch record: project-env-plain-failure-reason implementation-1

Dispatched: 60799d96ea70215eba145893357c1d773903d242 (worker resets onto 6244ff6ffa5fcd4300a94f2ff9b2e4c3fd1e06a9)
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design: the seven cause classes in `shared/cause.ts` and `server/cause.ts` (`classifyOpFailure`, `parseRef`, `causeText`), mapping A's `stage` values including `reserved`, the log line and the settings Test row, so AC-1 and AC-2 pass with the evidence their clauses name (two sentinels, captured console, RPC JSON and row text, and a presence check).
Include the Captain-approved one-line fix in `run` so a failure with empty stderr never echoes the command's arguments (the `storeToken` token case), with a test that fails without it.
Run `npm test`, `npm run typecheck`, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-plain-failure-reason.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, and open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: this task builds on project-env-new-agent-env, which is in validation as Draft PR iamcxa/kc-paseo-plugins#7 (branch `spacedock-ensign/project-env-new-agent-env`, head 6244ff6ffa5fcd4300a94f2ff9b2e4c3fd1e06a9), not yet merged. Before any edit, reset your worktree branch onto that head (`git -C <your worktree> fetch origin && git -C <your worktree> reset --hard 6244ff6ffa5fcd4300a94f2ff9b2e4c3fd1e06a9` on your own fresh branch only), use its `createSecrets(tools)` seam, fakes, `makeWorld`/`calls()` and `npm test`, and open your Draft PR with base `spacedock-ensign/project-env-new-agent-env`. If #7 changes or merges while you work, rebase onto the new head and say so in your report.
Captain rulings carried into r1: an empty value is a failed variable (「算失敗」); a reserved name is neither applied nor blanked (「做法一」, ADR 0004). Both 2026-10-20.
PRs go to iamcxa/kc-paseo-plugins as a Draft; commit and PR titles use conventional commits scoped to the plugin, e.g. `fix(project-env): …`, because release-please reads them. Merging is Kent's.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check secrets only by shape.
Kent's live plugin install `paseo-project-env` (from /Users/kent/Project/paseo-project-env) must not be changed, reloaded or removed. A live probe uses a separate install id and is removed afterwards; if that cannot be made certain, skip it and say which proof is still owed.
