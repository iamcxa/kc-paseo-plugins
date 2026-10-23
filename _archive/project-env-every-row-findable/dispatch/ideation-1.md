# Dispatch record: project-env-every-row-findable ideation-1

Dispatched: d540a045c239dd563522b5fc78066b63009ae839
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design the change your Scope names inside the current settings screen, with each acceptance criterion kept and given a reproducible evidence clause.
Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px (a new row and a note-reached row above the save bar; the note stepping through the no-field rows; a Test summary across a 720 px round trip; the long name wrapping at underscores; the ≠ explanation), plus the design review, with each finding dispositioned.
Name any decision the Captain must make (at most one), with a recommendation; the ≠ wording is already approved and is not a decision.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Source: the picky-user pass and the Design Director's ruling in docs/dev2/.spacedock-state/ux-review-a5-polish/ (design-director.md Task B, rows R3b, R4, R5, R6, R7); the Captain approved Task B and the ≠ wording on 2026-10-23 (「准」). Task A (project-env-save-blocks-half-changed-connection) merged as PR #29: the save bar now has a reason line under the count; place the no-field note so both fit, and keep Task A's reason line.
Harness: docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ builds an isolated Paseo from a checkout (CHECKOUT, S, PORT; fake vault with values; work-many has 12 rows, 4 with no field and a 54-character name). Use your own S and PORT, not /tmp/pe-astra or 6920.
UI previews must be drawn from a running build of the real client on an isolated Paseo and must show the WHOLE settings page around your change at desktop and 400 px. The Captain sees these screenshots at the gate.
Code: main d540a045c239dd563522b5fc78066b63009ae839. Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin paseo-project-env or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
