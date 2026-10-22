# Dispatch record: project-env-draft-survives-remount validation-1

Candidate: 8831beb37a6019519e8954f964b0cb9be8630e74
Dispatched: 8831beb37a6019519e8954f964b0cb9be8630e74
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 8831beb37a6019519e8954f964b0cb9be8630e74 (PR iamcxa/kc-paseo-plugins#22, base main 1adf630) against AC-1 and the approved design: rerun the resize harness yourself on an isolated Paseo against both main 1adf630 (must fail) and the candidate (must pass), check the store unit tests fail when the store is removed or not cleared on Save, Discard and Stop managing, and check the session guard added for roborev findings; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page screenshots at 1280, 719 and 400 px and record what the Captain should see; record every unverified obligation, without touching the live paseo-project-env install.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 8831beb37a6019519e8954f964b0cb9be8630e74
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards.
