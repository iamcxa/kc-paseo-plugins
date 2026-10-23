Dispatched: from 03b96fb9f3dcef4e8f22910b1cce04bd46b28903 (follow-up message to the live Codex implementation worker; FO fix authorization, see "### FO findings before the gate" in the task file)
Model: codex gpt-6.1-sol, reasoning high (Captain: 「接下來都用codex astra /sol 作為 ensgin 以節省額度，推理至少爲 high」, chat 2026-10-23)

## Checklist

The badge text reads "Tab closed" (not "Closed") everywhere it appears, with tests and screenshots updated
The decision card for an item whose FO is tab-closed shows the same "Tab closed" badge beside the FO's name, with a screenshot
The next card's badge uses the same outlined badge treatment as By FO and the rows; npm test and typecheck pass; push to PR #40 (still Draft); a short "## Stage Report: implementation (cycle 3)" section

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main`: as a Codex agent without SendMessage, finish with a final reply whose first line starts "Done:".
Change only what these items need; the rule itself is unchanged. Evidence under /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/fleet-hides-closed-fos/evidence/cycle-3/. Commit the report with `spacedock state commit fleet-hides-closed-fos --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`. Never mark the PR ready, never merge, never push main. Same isolation limits as implementation-1 (isolated daemon, fresh browser profile, live daemon read-only).
roborev not run: the FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/extensions/roborev/roborev_gate.py on the pushed head (package gap 5).
