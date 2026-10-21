# Dispatch record: project-env-notice-missing-variable ideation-1

Dispatched: 60799d96ea70215eba145893357c1d773903d242
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Spike first: show by a real run, not by reading docs, whether a plugin can append a timeline item from `agent.session_open` before the agent is saved; if not, prove the fallback (append after the hook returns) works; record commands and output in the task file.
Settle journey questions notice-missing-variable/q3 (history-only opens) and q7 (one line per opening or per variable), and produce the artifact the `ui` surface owes for the timeline renderer.
Keep AC-1 (Kent sees the line on his daemon) and AC-2 (a failed append never stops the agent) with reproducible evidence clauses.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Journey map: release r1 as ruled on 2026-10-20 lives on branch `docs/project-env-r1-split` (PR #6, commit 760bfaa), not yet on main. Read it with `git -C /Users/kent/Project/kc-paseo-plugins show 760bfaa:docs/journey/project-env/give-agents-their-project-setup.yaml`; main's copy is the old 17-story r1.
Rulings: docs/adr/0001, 0002, 0003, plus the Captain's 2026-10-20 rulings recorded in the map (r1 is Kent-only and accepted by his own use; an empty value is a failed variable, 「算失敗」).
Other r1 tasks: project-env-new-agent-env (shared test fakes, merge), project-env-plain-failure-reason (cause classes), project-env-notice-missing-variable (timeline line), project-env-worktree-real-paths, project-env-vault-boundary. Implementation merges in that dependency order; ideation runs in parallel, so name any interface you need from a sibling instead of designing it.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check secrets only by shape (set or missing, length, prefix).
Kent's live plugin install `paseo-project-env` (from /Users/kent/Project/paseo-project-env) serves his relay setup: do not change, reload or remove it. Any runtime probe uses a separate install id and is removed afterwards.
Task note: this is r1's riskiest claim. The spike may install a throwaway plugin under a separate install id on Kent's daemon only if it cannot touch `paseo-project-env`; if that is not certain, stop and report what you need instead.
