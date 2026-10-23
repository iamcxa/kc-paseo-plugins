Dispatched: from 78ce6c1cbcf1258a7ddd7223ea2c93e02d29cc6c
Model: codex gpt-6.1-sol, reasoning high (Captain: 「接下來都用codex astra /sol 作為 ensgin 以節省額度，推理至少爲 high」, chat 2026-10-23)

## Checklist

First step: read the real paseo.open-agent-tab.* values of existing role=fo agents from the live daemon read-only (paseo ls --json -g --label role=fo and per-cwd list; no UI action, install or reload) and record which would be Closed under the rule; if they contradict the rule, stop and report
The Closed rule and badge (By FO name, By decision rows and next card; nothing hidden, faded or moved; archived/closed offline path unchanged) with npm test cases for all five rule cases (AC-1) and isolated-daemon screenshots (AC-2)
Composer TextInput sets outlineStyle none on web only, keeping the rounded border's hover and focus change, with a web screenshot after typing (AC-2); branch pushed and a Draft PR opened with base main; External review rounds left to the FO

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
Send your completion message to `main`. You run as a Codex agent started through Paseo, so you have no SendMessage tool: finish with a final reply whose first line starts "Done:"; the FO receives Paseo's finish notification.

Flywheel round 2 under ADR 0008 (docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md): this PR is the first layer of a stack and is never merged. Push your branch and open a Draft PR with base main; never mark it ready, never merge, never push main.
Run package scripts by absolute path only, e.g. `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py`, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/comment_ratio.py`, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/doc_impact.py`. Do not run the roborev gate; the FO runs it (your sandbox cannot reach the roborev daemon).
Report rules: findings under findings, no checklist lines of your own; evidence under /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/fleet-hides-closed-fos/evidence/, never in the candidate branch; /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/design_surfaces.py and /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/number_guards.py R4 failures are known package gaps 2 and 3 → SKIPPED with that reason.
Hard limits: work only in the dispatch worktree; never switch branch on, or leave dirty, /Users/kent/Project/kc-paseo-plugins (live install source); never install into, stop or restart the live Paseo daemon (~/.paseo) — the live daemon may only be read (paseo ls / list); screenshots from an isolated daemon with its own --home and HOME on a port outside 6767, 6787 and 6860-6935, stopped by captured PID and its home deleted, browser with a fresh profile and localhost blocked; never print agent command lines; never overwrite an existing /tmp file; commit as `feat(spacedock-bridge): ...`, stage by name, hooks run normally; Release PR #18 untouched. Write your stage report in the task file and commit with `spacedock state commit fleet-hides-closed-fos --workflow-dir /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc`.

roborev not run: the Codex worker sandbox cannot reach the roborev daemon (package gap 5, _l3-dogfood/rounds.md); the FO runs /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/extensions/roborev/roborev_gate.py on the pushed head.
