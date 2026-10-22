# Dispatch record: project-env-field-picker-grouped validation-1

Candidate: 76e16752897362c7cc5ba9b27d708b04941bac88
Dispatched: 76e16752897362c7cc5ba9b27d708b04941bac88
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 76e16752897362c7cc5ba9b27d708b04941bac88 (PR iamcxa/kc-paseo-plugins#26, base main d197f9d) against AC-1 and AC-2 and the approved design, including the ruled "Type a reference…" row: rebuild and run it yourself on an isolated Paseo; confirm the picker groups fields by item, filters by search, lists the same-name field first, marks a field another variable uses, and shows a saved reference missing from the vault as not in vault; confirm the two routed fixes (search text cleared after a pick and reopen; Use disabled for references with empty or blank path segments, enabled for a valid one); confirm the field-picker tests fail when their behaviour is removed; check the pill rows, save bar and connection line still work around the picker; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page and picker screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 76e16752897362c7cc5ba9b27d708b04941bac88
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards.
