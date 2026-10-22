# Dispatch record: project-env-draft-survives-remount ideation-1

Dispatched: 1adf63042be22646c0192c47028f72a1b1960c11
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design the change your Scope names inside direction A5, with each acceptance criterion kept and given a reproducible evidence clause.
Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px, plus the design review, with each finding dispositioned.
Name every interface you need from a sibling rework task, and any decision the Captain must make (at most one), with a recommendation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Direction: A5, approved by the Captain on 2026-10-22 (「就這樣」), and the Add flow (「可以」). Read the design-director review and the mocks in the state checkout: docs/dev2/.spacedock-state/ux-review-r1.5/index.html, direction-a5.html and shots/a5-*.png. Your design must fit A5 and the other six rework tasks (project-env-draft-survives-remount, -field-pill-one-control, -field-picker-grouped, -add-variable-one-step, -test-summary-failure-mark, -save-footer-danger-zone, -connection-collapse); name any interface you need from a sibling instead of designing it.
UI previews must be drawn from a running build of the real client on an isolated Paseo (own PASEO_HOME and port, throwaway plugin id, fake op/security/git from project-env/test/fakes), as earlier r1.5 probes did, and must show the WHOLE settings page around your change at desktop and 400 px, not only the changed control. The Captain sees these screenshots at the gate.
Code: main 1adf63042be22646c0192c47028f72a1b1960c11 (r1.5 tasks merged). Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin paseo-project-env or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
