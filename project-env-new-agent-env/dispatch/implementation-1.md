# Dispatch record: project-env-new-agent-env implementation-1

Dispatched: 60799d96ea70215eba145893357c1d773903d242
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved ideation design so AC-1 to AC-5 each pass with the evidence their clauses name: blank-not-inherit for failed, empty and late variables; cache keyed by service account and reference; one deadline under Paseo's 30-second hook limit; reserved names skipped per the Captain's ruling 「做法一」 (journey new-agent-env/q6).
Land the test seam and fakes the sibling r1 tasks reuse (`createSecrets(tools)`, `server/tools.ts`, `test/` fakes, `makeWorld`, `calls()`) and a passing `npm test` run with the real op, security and git off PATH; run `npm run typecheck` too.
Land ADR 0004 recording the reserved-name exception to ADR 0002 in the Captain's words, run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/number_guards.py check --workflow-dir docs/dev2 --task docs/dev2/.spacedock-state/project-env-new-agent-env.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, and open the PR titled with a conventional commit scoped `project-env`.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
ADR: 0004
Captain rulings carried into this task: an empty value is a failed variable (「算失敗」, 2026-10-20); a reserved name is neither applied nor blanked, the agent keeps its own value and the name is reported failed with a reserved-name cause (「做法一」, 2026-10-20). Both are recorded in the journey map on branch `docs/project-env-r1-split` (PR #6).
This task merges first; project-env-plain-failure-reason, -notice-missing-variable, -worktree-real-paths and -vault-boundary rebase over it. Keep the interfaces named in your design stable; until plain-failure-reason merges, failed results only need to be marked failed with a `stage` field.
PRs go to iamcxa/kc-paseo-plugins as a Draft; commit and PR titles use conventional commits scoped to the plugin, e.g. `feat(project-env): …`, because release-please reads them. Merging is Kent's.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check secrets only by shape. Capturing real error text from the tools is out of scope here.
Kent's live plugin install `paseo-project-env` (from /Users/kent/Project/paseo-project-env) serves his relay setup: do not change, reload or remove it. A live probe uses a separate install id and is removed afterwards; if you cannot make it certain the live install is untouched, skip the probe and say AC-1's daemon proof is still owed.
