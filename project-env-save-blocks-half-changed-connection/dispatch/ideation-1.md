# Dispatch record: project-env-save-blocks-half-changed-connection ideation-1

Dispatched: 40849b49bc727dae0731e797e2b207370946c5c2
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design the change your Scope names inside the current settings screen (direction A5 as built on main), with each acceptance criterion kept and given a reproducible evidence clause.
Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px, including the save bar's reason while Change is open, plus the design review, with each finding dispositioned.
Name any decision the Captain must make (at most one), with a recommendation; the two Design Director recommendations are already approved and are not decisions.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Source: the picky-user pass and the Design Director's ruling in docs/dev2/.spacedock-state/ux-review-a5-polish/ (astra-review.md, gemini-review.md, design-director.md Task A, rows R1, R11, R2); the Captain approved Task A and the token-refresh recommendation on 2026-10-23 (「准」). Its sibling project-env-every-row-findable (Task B) runs after this task merges and also edits SaveBar; keep the save bar's reason slot simple so Task B can add its no-field note beside it.
Harness: docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ builds an isolated Paseo from a checkout (CHECKOUT, S, PORT env vars; fake vault with field values, SENTRY_PROJECT deliberately unreadable). Use your own S and PORT, not /tmp/pe-astra or 6920, which stay up for the review.
UI previews must be drawn from a running build of the real client on an isolated Paseo and must show the WHOLE settings page around your change at desktop and 400 px. The Captain sees these screenshots at the gate.
Code: main 40849b49bc727dae0731e797e2b207370946c5c2. Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin paseo-project-env or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
