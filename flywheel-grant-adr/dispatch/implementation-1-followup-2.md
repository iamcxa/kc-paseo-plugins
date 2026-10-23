Dispatched: from 7d3babeb9e52c5f61146092931459771be6e3c36 (follow-up message to the live Codex implementation worker; FO fix authorization for roborev:1113)
Model: codex gpt-6.1-sol, reasoning high

## Checklist

ADR 0008 states the interim lifecycle of round tasks that the Captain accepted with words 6 (the design he approved said, in the FO's chat message: until dev2 adds a "delivered to the stack counts as done" ending, round tasks stay at "approved, awaiting merge", recorded as "stacked, not merged" in the round log, and are closed together when he ends the journey): round tasks stay at the pending terminal approval; FO does not run merge guard --rework or force a terminal status; when a round PR is closed at the end, FO brings the pr-merge hook's closed-without-merge prompt to the Captain as part of his end-of-POC cleanup decision; the missing terminal is a package gap logged for the dev2 FO (roborev:1113)
adr_lint passes (--since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008); every 「…」 quote still byte-matches the task file; PR #38 updated

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main`: as a Codex agent without SendMessage, finish with a final reply whose first line starts "Done:".
This adds no authority: it records the lifecycle the approved design already stated. Edit only ADR 0008. Do not run roborev (the FO runs it). Write a "## Stage Report: implementation (cycle 3)" section and commit with `spacedock state commit flywheel-grant-adr --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`. PR stays Draft; never mark it ready, never merge.
