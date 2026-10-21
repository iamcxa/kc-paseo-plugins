# Dispatch record: project-env-worktree-real-paths ideation-1

Dispatched: 60799d96ea70215eba145893357c1d773903d242
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design real-path resolution of both the stored root and git's common-dir parent (see `mainCheckout` and `projectFor`), including what happens when a path no longer exists.
Keep AC-1 with a fake-git symlink test and the worktree agent check on Kent's daemon as its evidence clause.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Journey map: release r1 as ruled on 2026-10-20 lives on branch `docs/project-env-r1-split` (PR #6, commit 760bfaa), not yet on main. Read it with `git -C /Users/kent/Project/kc-paseo-plugins show 760bfaa:docs/journey/project-env/give-agents-their-project-setup.yaml`; main's copy is the old 17-story r1.
Rulings: docs/adr/0001, 0002, 0003, plus the Captain's 2026-10-20 rulings recorded in the map (r1 is Kent-only and accepted by his own use; an empty value is a failed variable, 「算失敗」).
Other r1 tasks: project-env-new-agent-env (shared test fakes, merge), project-env-plain-failure-reason (cause classes), project-env-notice-missing-variable (timeline line), project-env-worktree-real-paths, project-env-vault-boundary. Implementation merges in that dependency order; ideation runs in parallel, so name any interface you need from a sibling instead of designing it.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check secrets only by shape (set or missing, length, prefix).
Kent's live plugin install `paseo-project-env` (from /Users/kent/Project/paseo-project-env) serves his relay setup: do not change, reload or remove it. Any runtime probe uses a separate install id and is removed afterwards.
