# Dispatch record: project-env-connection-done-cancel-one-row validation-1

Candidate: 88c49d4ccccc02845d868fc8761e3e5156ecde2e
Dispatched: 88c49d4ccccc02845d868fc8761e3e5156ecde2e
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 88c49d4ccccc02845d868fc8761e3e5156ecde2e (PR iamcxa/kc-paseo-plugins#44, base main 4e22d4a) against AC-1 and AC-2 and the approved design: rebuild and run it yourself on an isolated Paseo; confirm in the Change form Cancel and Done share one row after Vault and both end above the save bar at 1280x1400 and 400x900, including the unchecked-account state; the hints read "Available once the connection works." and "Save the token or clear the field first." with Done disabled; Cancel restores the previous account and vault; Done still works; the save bar's blocked-Save behaviour and its survival across 720 px still hold; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 88c49d4ccccc02845d868fc8761e3e5156ecde2e
Work from `git archive` of the candidate, not the shared worktree. Evidence goes under this task's state folder. Report findings as findings; add no checklist lines of your own.
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards; not /tmp/pe-astra or port 6920.
