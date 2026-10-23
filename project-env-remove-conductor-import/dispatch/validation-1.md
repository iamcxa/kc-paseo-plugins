# Dispatch record: project-env-remove-conductor-import validation-1

Candidate: 099e7b790d89ca8b63b28afb65f98f3d71c6f30e
Dispatched: 099e7b790d89ca8b63b28afb65f98f3d71c6f30e
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 099e7b790d89ca8b63b28afb65f98f3d71c6f30e (PR iamcxa/kc-paseo-plugins#41, base main 78ce6c1) against AC-1 to AC-3 and the approved design: rebuild and run it yourself on an isolated Paseo; confirm no project shows an import row at 1280 and 400 px and the plugin serves no project.import-conductor call; previously imported variables and prompts in a saved project still load and save; the Default prompt section still works; the save bar, pills, picker, Test and the connection line still work; journey-lint passes on give-agents-their-project-setup.yaml with the two stories gone, r2 renamed and add-remove-variable's evidence nameFromLabel; ADR 0004 carries the dated amendment and adr_lint exits 0; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 099e7b790d89ca8b63b28afb65f98f3d71c6f30e
Work from `git archive` of the candidate, not the shared worktree. Evidence goes under this task's state folder. Report findings as findings; add no checklist lines of your own.
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards; not /tmp/pe-astra or port 6920.
