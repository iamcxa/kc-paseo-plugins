Dispatched: from 66faf94de8777263478125ba2004b7a64a6d0bca (follow-up message to the live Codex implementation worker; FO fix authorization for roborev:1123)
Model: codex gpt-6.1-sol, reasoning high (Captain: 「接下來都用codex astra /sol 作為 ensgin 以節省額度，推理至少爲 high」, chat 2026-10-23)

## Checklist

roborev:1123 Low: the owner name next to the Closed badge (spacedock-bridge/client/board.tsx, the next-card owner row) gets flexShrink 1 like the names in the agent cards, so a long FO name truncates instead of pushing the badge offscreen; add a long-name case to the isolated screenshot capture showing the badge still visible
npm test and typecheck pass; push to the same branch (PR #40 stays Draft); a short "## Stage Report: implementation (cycle 2)" section

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main`: as a Codex agent without SendMessage, finish with a final reply whose first line starts "Done:".
Change only what the finding needs. Do not run the roborev gate; the FO runs it. Evidence under /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/fleet-hides-closed-fos/evidence/. Commit the report with `spacedock state commit fleet-hides-closed-fos --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`. Never mark the PR ready, never merge, never push main.
roborev not run: the FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/extensions/roborev/roborev_gate.py on the pushed head (package gap 5).
