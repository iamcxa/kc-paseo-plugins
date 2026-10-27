Dispatched: from 1969785502aac992c015a680e235af9be6509938 (follow-up message to the live Codex implementation worker; FO fix authorization for the Captain's round 6 colour-difference screenshot, see "### FO notes" in the task file)
Model: codex gpt-6.1-sol, reasoning high (Captain: 「注意用 sol high 取代 sonnet，用 astra xhigh 取代 opus」, chat 2026-10-27)

## Checklist

Captain's screenshot /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/_l3-dogfood/walks/round-6/captain/colour-difference.png (「色差在這裡，注意看“審#1306文字左右背景有差異”」): first find, read-only, which style paints the lighter background on the "CL merges …" queue row (hover, focus, pressed, next or selected) and why its box is inset on the left, runs to the right edge and ends flush on the next row's title; report the cause with the symbol; then make every queue row highlight share the row's own bounds with symmetric insets and spacing so it never touches the next row's text, in both views
A capture at 360 and 1440 px of a highlighted row followed by another row in both views, measuring the highlight box against the row box (left and right inset equal, no overlap with the next row); a test or check that fails on 1969785 if the box geometry is a pure-style property you can assert; npm test and typecheck pass; push to PR #57 (still Draft); a short "## Stage Report: implementation (cycle 2)" section

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0
Send your completion message to `main`: as a Codex agent without SendMessage, finish with a final reply whose first line starts "Done:".
Push authority as in implementation-1 (「可以，我授權你在飛輪過程中推送及開 ＰＲ」, ADR 0008); push only the r7 branch; never mark PR #57 ready or merge. No other change. Same hard limits and report rules as implementation-1 (evidence under /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/r7-one-clear-way-to-decide/evidence/cycle-2/, captures one at a time); commit with `spacedock state commit r7-one-clear-way-to-decide --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`.
roborev not run: package gap 5; the FO reruns /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0/extensions/roborev/roborev_gate.py on the new head.
