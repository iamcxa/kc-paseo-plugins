# Dispatch record: project-env-worktree-project-root ideation-1

Dispatched: 487b9b02a895b4a795141ba80a994992af1b4730
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design the match: a working directory matches a saved project when its own worktree root (realpath) is that project's root, otherwise when its main checkout is; keep the registered-worktree trust check; say which wins if both a worktree root and its main checkout are saved as projects.
Reproduce the defect on main with fake git (a project saved at a linked-worktree path, an agent in that worktree) and keep AC-1 and AC-2 with reproducible evidence clauses, including the owed qnow-adopt-dev2 agent check on Kent's daemon by shape.
Name the interface conflict, if any, with project-env-variable-row-edit, project-env-token-works-cause and project-env-browse-vault-survives (all in implementation off main), since this task touches project-env/server/secrets.ts.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Found 2026-10-21: /Users/kent/conductor/repos/qnow-adopt-dev2 is a linked worktree of /Users/kent/conductor/repos/qnow (git-common-dir /Users/kent/conductor/repos/qnow/.git) and is itself the saved project root; `projectForCwd` compares only `mainCheckout(cwd)` with saved roots, so it returns null and the session-open hook applies nothing. Captain 2026-10-21: 「也准加入」 and 「准」.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check by shape only. Run no op or security command that can raise a 1Password desktop authorization prompt.
Kent's live plugin `paseo-project-env` runs from /Users/kent/Project/kc-paseo-plugins/project-env on main: do not change, reload or remove it, and do not switch that checkout's branch. A runtime probe uses an isolated daemon (own home and port) and a throwaway plugin id, removed afterwards.
