# Dispatch record: project-env-variable-row-edit ideation-1

Dispatched: 487b9b02a895b4a795141ba80a994992af1b4730
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design the variables card as one row per variable holding its field, its Remove button and its last Test result (Captain 2026-10-21, 「可以」); settle journey add-remove-variable/q4 (does the reserved refusal cover Conductor import and saved variables) and q7 (Remove without confirmation).
Design Add refusing every reserved name with its reason via isReservedName, with DYLD_* and LD_PRELOAD added, and draft the ADR 0004 amendment (no number change).
Keep AC-1 and AC-2 with reproducible evidence clauses and produce the artifact the ui surface owes, including how T4's results sit in the row.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Journey map: release r1.5 of paseo-project-env on main (487b9b02a895b4a795141ba80a994992af1b4730), `docs/journey/project-env/give-agents-their-project-setup.yaml`; the r1.5 questions are interrogated there, and those deferred to a task's ideation name the task.
Rulings: docs/adr/0001–0005 and the map's ruling lists. r1 is merged, released as project-env-v0.1.0 and accepted by the Captain (「通過」, 2026-10-21); r1.5 is Kent-only and accepted by his own use. Captain 2026-10-20: 「我覺得UI不夠直覺」.
Other r1.5 tasks, each its own branch off main merged by squash, never stacked: project-env-token-works-cause (T1), project-env-paste-token-check-first (T2, after T1), project-env-variable-row-edit (T3), project-env-test-results-match-draft (T4, after T3), project-env-browse-vault-survives (T5). Name any interface you need from a sibling instead of designing it.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check by shape only.
Kent's live plugin install `paseo-project-env` now runs from /Users/kent/Project/kc-paseo-plugins/project-env (main): do not change, reload or remove it, and do not switch that checkout's branch. A runtime probe uses an isolated daemon (own home and port, as earlier r1 probes did) and a throwaway plugin id, removed afterwards.
