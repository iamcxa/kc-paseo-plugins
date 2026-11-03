Dispatched: from c916545b044c65580be629b1c8385b0aa5ce2645 (follow-up message to the live Codex implementation worker; FO fix authorization for roborev:1437 under the chief-engineer's single freshness rule)
Model: codex gpt-6.1-sol, reasoning high (Captain: 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」, chat 2026-10-27)

## Checklist

Single rule for every retained surface: on reactivation, refresh every mutable server-derived value (briefing, claim and progress, gate state, conversation) under its captured identity, not only unresolved reads; an authoritative null clears a released claim; a refresh never overwrites a newer local submission still in progress and never makes a recorded decision actionable; extend the retained-surface table test with "claim released by another client then reopen" (fails on c916545) and "refresh read overlaps a local send" (the local send wins)
npm test and typecheck pass; push to PR #68 (still Draft); a short "## Stage Report: implementation (cycle 4)" section

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.34.0
Send your completion message to `main`: as a Codex agent without SendMessage, finish with a final reply whose first line starts "Done:".
Push authority as in implementation-1 (「可以，我授權你在飛輪過程中推送及開 ＰＲ」, ADR 0008); push only the r9 branch; never mark PR #68 ready or merge. Keep surfaces mounted; no remount redesign, no generalized recovery infrastructure, nothing from round 10. Same hard limits and report rules as implementation-1; commit with `spacedock state commit r9-list-and-detail-layout --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`.
roborev not run: package gap 5; the FO reruns /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.34.0/extensions/roborev/roborev_gate.py on the new head.
