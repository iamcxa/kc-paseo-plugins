# Dispatch record: project-env-save-blocks-half-changed-connection validation-1

Candidate: e5e41ccdd9bea76d09d12fe0cb8c58106eb18f8d
Dispatched: e5e41ccdd9bea76d09d12fe0cb8c58106eb18f8d
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate e5e41ccdd9bea76d09d12fe0cb8c58106eb18f8d (PR iamcxa/kc-paseo-plugins#29, base main 40849b4) against AC-1 to AC-3 and the approved design: rebuild and run it yourself on an isolated Paseo built with docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ (own S and PORT); confirm Save is disabled with its reason while Change is open, projects.json is unchanged after pressing Save then, it stays disabled across a 720 px round trip and works after Done and after Cancel; a saved project keeps its place in the list; after a token is stored the next field press reads the vault again; confirm the new unit tests fail when their behaviour is removed; check the rest of the screen still works; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: e5e41ccdd9bea76d09d12fe0cb8c58106eb18f8d
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards; not /tmp/pe-astra or port 6920.
