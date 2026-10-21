# Dispatch record: project-env-browse-vault-survives ideation-1

Dispatched: 487b9b02a895b4a795141ba80a994992af1b4730
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design listing that survives one unreadable item: skip it, name it with a plain reason, keep listing the rest; the confirmed trigger is an item typed SSH Key whose op item get fails with "invalid PEM private key" (Kent's vault, 2026-10-21); include a Secure Note with custom fields as a case that must still list.
Assess listing field labels and types without reading values into the plugin (op item get returns values today), and say what op offers for that.
Keep AC-1 and AC-2 with reproducible evidence clauses and produce the artifact the ui surface owes.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Journey map: release r1.5 of paseo-project-env on main (487b9b02a895b4a795141ba80a994992af1b4730), `docs/journey/project-env/give-agents-their-project-setup.yaml`; the r1.5 questions are interrogated there, and those deferred to a task's ideation name the task.
Rulings: docs/adr/0001–0005 and the map's ruling lists. r1 is merged, released as project-env-v0.1.0 and accepted by the Captain (「通過」, 2026-10-21); r1.5 is Kent-only and accepted by his own use. Captain 2026-10-20: 「我覺得UI不夠直覺」.
Other r1.5 tasks, each its own branch off main merged by squash, never stacked: project-env-token-works-cause (T1), project-env-paste-token-check-first (T2, after T1), project-env-variable-row-edit (T3), project-env-test-results-match-draft (T4, after T3), project-env-browse-vault-survives (T5). Name any interface you need from a sibling instead of designing it.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check by shape only.
Kent's live plugin install `paseo-project-env` now runs from /Users/kent/Project/kc-paseo-plugins/project-env (main): do not change, reload or remove it, and do not switch that checkout's branch. A runtime probe uses an isolated daemon (own home and port, as earlier r1 probes did) and a throwaway plugin id, removed afterwards.
