Dispatched: from b8fb54c38cce2bbc7a9356961535d73902d69321 (PR #74 head; repair cycle 1 of the seed's two)
Model: codex gpt-6.1-sol, reasoning high (same worker 523cd98b, continued; Captain: 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」, chat 2026-10-27)

## Checklist

Fix authorization for items 1-3 of "## Investigation result: roborev 1532 and design review 1": implement the proposed class-level fixes (message provenance before collection state; collection replies validated by provenance, not by brackets, braces, fences or field mentions; newest-first admission charging only admitted bytes) with the proposed regressions, each shown failing at b8fb54c38cce2bbc7a9356961535d73902d69321 and passing after (AC-1)
Fix authorization for items 4-6: Open FO routes the exact source host/agent into Bridge's existing FO conversation-only detail with ← Commander and retained drafts; the unavailable-source state leads the card, names the requested original and qualifies or suppresses uncheckable lines; the selected point stays outside the scroll area and the phone opening shows all three context lines with the actions fixed — if the supported SDK layout cannot fit that, stop and report the host constraint instead of changing the design (AC-1, AC-2)
New captures at 1440 and 360 of the states the director reviewed plus Open FO arrival and return, source unavailable, phone opening with three lines, scrolled bottom with the point visible, a long original, and switching between two points; npm test and typecheck pass; commit, push to the PR #74 branch (no force push), and write "## Stage Report: implementation (cycle 2)" naming the new head (AC-2)

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.35.0
Send your completion message to `main`. You run as a Codex agent started through Paseo, so you have no SendMessage tool: finish with a final reply whose first line starts "Done:"; the FO receives Paseo's finish notification.

The FO authorizes exactly the six fixes your investigation proposed, nothing wider. AC-4 measurement stays skipped. PR #74 stays Draft; never mark it ready or merge; never push main or earlier stack branches. All hard limits and the POC boundary of implementation-1 stand; captures use fixtures or an isolated setup that provably avoids the live Bridge's files, port 6787 and the live daemon.
roborev not run: the Codex worker sandbox cannot reach the roborev daemon (package gap 5); the FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.35.0/extensions/roborev/roborev_gate.py on the pushed head with base 33952f9b3d02fceab104ba09272d65e432a3d095.
Commit the task file with `spacedock state commit d3-commander-digest-slice-1 --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`.
