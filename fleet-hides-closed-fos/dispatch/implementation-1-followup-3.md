Dispatched: from 713ae00fef28e0c30a182f6671fc22380bbfc38e (follow-up message to the live Codex implementation worker; FO fix authorization for roborev Medium on 713ae00f)
Model: codex gpt-6.1-sol, reasoning high (Captain: 「接下來都用codex astra /sol 作為 ensgin 以節省額度，推理至少爲 high」, chat 2026-10-23)

## Checklist

In the 380 px board, a one-line row (review rows included) keeps the title visible when the row also shows repo#number, the owner, the "Tab closed" badge, the age and the ↗ button: the owner text shrinks and truncates before the title does, the title keeps a visible minimum width, and nothing overflows into the ↗ button; isolated screenshot at 380 px of a review row with a long owner name and the badge
npm test and typecheck pass; push to PR #40 (still Draft); a short "## Stage Report: implementation (cycle 4)" section

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main`: as a Codex agent without SendMessage, finish with a final reply whose first line starts "Done:".
Layout only; no rule or text change. Evidence under /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/fleet-hides-closed-fos/evidence/cycle-4/. Commit the report with `spacedock state commit fleet-hides-closed-fos --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`. Never mark the PR ready, never merge, never push main. Same isolation limits as implementation-1.
roborev not run: the FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/extensions/roborev/roborev_gate.py on the pushed head (package gap 5).
