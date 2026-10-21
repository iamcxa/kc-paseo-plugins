# Dispatch record: project-env-paste-token-check-first validation-1

Candidate: c23b96cc184b1294422d49e4277600235ef3c0dd
Dispatched: c23b96cc184b1294422d49e4277600235ef3c0dd
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate c23b96cc184b1294422d49e4277600235ef3c0dd (PR iamcxa/kc-paseo-plugins#21, base main 948e98a) against AC-1 to AC-4 and the approved design, including that each decisive test fails when its behaviour is removed (write before check, no shape gate, token on argv, no name guard, own root counted) and that a token is never on a security argv; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, including the "Not saved:" text and the overwrite warning text the ui surface owes, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Record every unverified obligation, including the hex round trip with a real token and Kent's on-Mac use, without touching the live paseo-project-env install.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: c23b96cc184b1294422d49e4277600235ef3c0dd
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; any security probe uses a throwaway keychain file with fake values, deleted afterwards. Run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or switch the main checkout's branch.
