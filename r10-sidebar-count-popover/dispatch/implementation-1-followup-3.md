Dispatched: investigation (read-only) from f55910a5794578335abd58b13d3db0565f5fa13c for the pre-gate team findings — no candidate mutation; the fix is authorized separately after the FO reads the cause
Model: codex gpt-6.1-sol, reasoning high (Captain: 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」, chat 2026-10-27)

## Checklist

Read-only: (1) why both sidebar-none.png captures show "1" — a capture-fixture flaw or a product bug in the zero state; name the symbol and the sequence; (2) which theme tokens the badge, "Open Bridge" and "Check again" use now, and which existing Paseo theme token gives a bright amber (or other high-contrast attention colour) like the reference's badge, without adding a colour library or animation; (3) the smallest scroll cue for the phone bottom sheet when items exceed the visible height; report each with the smallest fix and the test or capture that would prove it; no edits, commits or pushes; a short "## Investigation: pre-gate team pass 1" section in the task file

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.34.0
Send your completion message to `main`: as a Codex agent without SendMessage, finish with a final reply whose first line starts "Done:".
Read-only: do not change the candidate worktree, branch or PR. Commit only the task-file section with `spacedock state commit r10-sidebar-count-popover --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`. Reference look: zhjiang22/paseo-plugins agent-observatory (no licence — reference only). Same hard limits as implementation-1.
