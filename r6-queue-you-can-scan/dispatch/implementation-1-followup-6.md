Dispatched: from e8817b8ce6da8608367dc4befaa96e48adec98a1 (follow-up message to the live Codex implementation worker; FO fix authorization for roborev:1242, the second finding in the By FO preview class after 1236; class-level repair, last repair cycle of this round)
Model: codex gpt-6.1-sol, reasoning high (Captain: 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」, chat 2026-10-27)

## Checklist

roborev:1242 and its class: in By FO, an FO's unread-question preview is hidden only when a displayed row on that card represents that same question; any other combination of waiting items (gate, review, labelled question) keeps it visible as its own row; one table test over the combinations (unlabelled unread question alone, with a gate, with a review, with a labelled question row for the same reply) that fails on e8817b8
npm test and typecheck pass; push to PR #54 (still Draft); a short "## Stage Report: implementation (cycle 7)" section

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.30.0
Send your completion message to `main`: as a Codex agent without SendMessage, finish with a final reply whose first line starts "Done:".
Push authority as in implementation-1 (「可以，我授權你在飛輪過程中推送及開 ＰＲ」, ADR 0008); push only the r6 branch; never mark PR #54 ready or merge. Scope frozen: no other change. Same hard limits and report rules as implementation-1; commit with `spacedock state commit r6-queue-you-can-scan --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`.
roborev not run: package gap 5; the FO reruns /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.30.0/extensions/roborev/roborev_gate.py on the new head.
