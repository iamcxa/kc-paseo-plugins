# Dispatch record: project-env-every-row-findable validation-1

Candidate: fc4b095610925af7ea32e1402fbaf74659317d81
Dispatched: fc4b095610925af7ea32e1402fbaf74659317d81
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate fc4b095610925af7ea32e1402fbaf74659317d81 (PR iamcxa/kc-paseo-plugins#33, base main cad57e0) against AC-1 to AC-3 and the approved design: rebuild and run it yourself on an isolated Paseo; confirm a newly added row and each row reached through the note end above the save bar at 400x900, 1280x1400 and 1280x800; the note's five presses visit LINEAR_API_KEY, RESEND_API_KEY, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET and back to the first; the Test summary survives a 720 px round trip; the 54-character name breaks only after underscores and copies exactly; the ≠ explanation has the new sentence; Task A's Save block and reason line still work beside the note; confirm the new tests fail when their behaviour is removed; give a verdict. FO has dispositioned roborev:1089 (overlapping Test runs) under FO declines; report it only if you find it changes what a user sees.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: fc4b095610925af7ea32e1402fbaf74659317d81
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards; not /tmp/pe-astra or port 6920.
