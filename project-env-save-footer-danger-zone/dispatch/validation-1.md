# Dispatch record: project-env-save-footer-danger-zone validation-1

Candidate: aded5429f8ac5e24c8e722f7109c22ecbaa7a994
Dispatched: aded5429f8ac5e24c8e722f7109c22ecbaa7a994
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate aded5429f8ac5e24c8e722f7109c22ecbaa7a994 (PR iamcxa/kc-paseo-plugins#23, base main d61e243) against AC-1 and AC-2 and the approved design: rebuild and run it yourself on an isolated Paseo, make three edits and confirm the save bar counts 3, Save writes them and shows the toast, Discard leaves the saved file unchanged, the Danger zone shows only for a saved project and its confirm button is destructive; confirm `unsavedCount` tests fail when a counted change stops counting; judge the worker's one departure (service account compared raw, not trimmed) against Save's write; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: aded5429f8ac5e24c8e722f7109c22ecbaa7a994
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards.
