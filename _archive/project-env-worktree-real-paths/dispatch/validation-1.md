# Dispatch record: project-env-worktree-real-paths validation-1

Candidate: 2defea5e13c58735ee736f3d77dd4597f092ed00
Dispatched: 2defea5e13c58735ee736f3d77dd4597f092ed00
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 2defea5e13c58735ee736f3d77dd4597f092ed00 (PR iamcxa/kc-paseo-plugins#8, stacked on #7) against AC-1 and the approved design, including that each of the seven cases fails when the behaviour it guards is removed; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Record every unverified obligation, including AC-1's daemon worktree check, without running it against the live `paseo-project-env` install.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 2defea5e13c58735ee736f3d77dd4597f092ed00
This candidate is stacked on project-env-new-agent-env (PR #7, head 6244ff6, itself in validation). Judge only the delta of #8 against its base, but run the full `npm test`.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check secrets only by shape.
Kent's live plugin install `paseo-project-env` (from /Users/kent/Project/paseo-project-env) must not be changed, reloaded or removed.
