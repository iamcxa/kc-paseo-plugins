# Dispatch record: project-env-connection-collapse validation-1

Candidate: 4dc112307ded792890fab8d7886359c2ca6dd01b
Dispatched: 4dc112307ded792890fab8d7886359c2ca6dd01b
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 4dc112307ded792890fab8d7886359c2ca6dd01b (PR iamcxa/kc-paseo-plugins#25, base main d61e243) against AC-1 and the approved design: rebuild and run it yourself on an isolated Paseo; confirm a working connection is one line with Change, Change reopens the account, token and vault controls, Cancel restores the line, a failed check shows red with its cause, and a Change in progress survives a resize across 720 px; confirm the `connectionLine` tests fail when their behaviour is removed; give a verdict.
Judge the two departures from the design: the initial view is computed from the draft rather than `initial`, and the Change-in-progress state lives in a module-level variable keyed by session instead of the `openProject` store that project-env-draft-survives-remount added for exactly this kind of re-mount state. Say whether the second should move into the store, and whether the `view` transitions need a test that fails when they are removed.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 4dc112307ded792890fab8d7886359c2ca6dd01b
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards.
