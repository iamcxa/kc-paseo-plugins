# Dispatch record: project-env-remove-conductor-import ideation-1

Dispatched: f849058121e61120d91e460bedca081c71a1aaea
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design the removal your Scope names (code, tests, journey map edits, ADR 0004 amendment), with each acceptance criterion kept and given a reproducible evidence clause; list every symbol, file and journey story the removal touches.
Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px of a project before and after the removal, plus the design review, with each finding dispositioned.
Name any decision the Captain must make (at most one), with a recommendation; the removal and the r2 wording are already approved.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Source: docs/dev2/.spacedock-state/ux-review-polish-2/design-director.md (Task 1, row 2) and the Captain's backlog approval (2026-10-23, 「准」). Two siblings follow in order and branch from this task's merged main.
Harness: docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ (CHECKOUT, S, PORT env vars); use your own S and PORT, not /tmp/pe-astra or 6920.
Evidence goes under this task's folder in the state checkout, never on the candidate branch. Report review findings as findings; add no checklist lines of your own.
Journey map tools: the kc-journey-map plugin's lib/journey-lint.mjs (`node lib/journey-lint.mjs <journey.yaml> <repoRoot>`).
Code: main f849058121e61120d91e460bedca081c71a1aaea. Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
