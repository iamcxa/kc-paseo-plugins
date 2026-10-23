# Dispatch record: project-env-vault-naming-rule-adr implementation-3

Dispatched: cf04532dca0991a0762a20b831a9df34efa45149
Model: sonnet (resumed implementation worker; follow-up message)

## Checklist

Fix Codex round 1 P2 on PR #30: in docs/adr/0005, the fact "Secret references are case-insensitive" must say it is a property of 1Password's resolver, and that project-env still requires a mapping's vault segment to match the saved vault's spelling exactly (`isOutsideVault` compares with `!==`; covered by project-env/test/vault-boundary.test.ts), so `op://dev/...` under a saved vault `Dev` is blanked as outside the vault. Change nothing else. Rerun adr_lint --require 5 and the roborev gate (--base 40849b49bc727dae0731e797e2b207370946c5c2), push, append a "Feedback cycle 2 (Codex P2)" note and commit the state.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Docs only. Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
