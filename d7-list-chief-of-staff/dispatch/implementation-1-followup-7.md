Dispatched: from 3fbbdfb9845ba04935e1d703c837e3d1ab26542b (PR #80 head; Captain amendment 2)
Model: codex gpt-6.1-sol, reasoning high (same worker 8c5dd6d6, continued; Captain: 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」, chat 2026-10-27)

## Checklist

Captain amendment 2: add a read-only fleet MCP tool that returns a waiting gate's prepared briefing by its board key, reusing Bridge's existing gate briefing reader (the one DecisionCard uses), bounded in size, refusing keys not on the board; keep get_agent_activity in her tools for reading an FO's recent messages; tests for the tool (known key returns the briefing, unknown or stale key refused, no write) (AC-1)
Rewrite her prompt: before recommending a gate or question, read its briefing or the FO's recent messages; never prompt, message or create an FO for information; recommendations cite what she read; lists and previews are standard markdown tables, choices answered by replying a number or keyword, no ui widget blocks; keep the confirmation-before-send and permission rules unchanged; prompt tests for each sentence (AC-1, AC-2)
Real model proof on a fresh isolated real daemon with fictional board sources including one gate whose fictional briefing supports a clear recommendation and one fictional FO message: one triggered list whose recommendation for that gate cites the briefing; a markdown table, no ui block; no FO prompted; 「全照建議」 gives a text preview and zero relay; tokens and times by turn id; if the Claude weekly limit blocks the model, stop and report (AC-1, AC-2)
npm test and typecheck pass; commit and push to the PR #80 branch (no force push); write "## Stage Report: implementation (cycle 5)" naming the new head

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.35.0
Send your completion message to `main`. You run as a Codex agent started through Paseo, so you have no SendMessage tool: finish with a final reply whose first line starts "Done:"; the FO receives Paseo's finish notification.

Authorized by the Captain's 「好」 (amendment 2). Not in scope: Compass, the transport-loss display, the archived-officer record (finding 17), roborev 1647 items. PR #80 stays Draft. All hard limits and the POC boundary of implementation-1 stand; fictional content only in committed files.
roborev not run: the Codex worker sandbox cannot reach the roborev daemon (package gap 5); the FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.35.0/extensions/roborev/roborev_gate.py on the pushed head with base f40c340e8204f4b7dddef238f215aea3f3a6eaab.
Commit the task file with `spacedock state commit d7-list-chief-of-staff --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`.
