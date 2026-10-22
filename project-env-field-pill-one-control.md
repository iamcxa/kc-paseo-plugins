---
id:
title: Each variable row has one field pill showing item and field
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-field-pill-one-control:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-field-pill-one-control-backlog-1
              briefing:
                id: briefing:project-env-field-pill-one-control:backlog:attempt-1:revision-1
                digest: sha256:1b21722b990eadd31f70a3870ffae57d37c3fa1a2bfadbd523c707de76da39ff
                room-ref: ./project-env-field-pill-one-control/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-field-pill-one-control:backlog:1
                briefing: briefing:project-env-field-pill-one-control:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-22T04:14:47.505108Z"
                decision: approve
                reason: 'Captain 2026-10-22: 「准」 — accepts this A5 settings-screen rework task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-22T04:16:32Z
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: every variable row shows one field pill in every state, reading `ITEM › field` without the vault and never cut off mid-field; the whole pill opens the field picker; the separate Browse vault row is removed and the vault list loads the first time a picker opens (review findings 1, 2; A5). A row with no field shows a dashed "Pick a field" pill. A label that differs from the variable name shows a small ≠ mark with its detail on hover or tap. Non-goals: the picker's contents (project-env-field-picker-grouped). Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: Each row shows one pill reading `ITEM › field` with the full field name, and clicking it opens the picker; no Browse vault row exists.
Verified by: screenshots at desktop and 400 px on an isolated Paseo, and a source check that no Browse row remains.

**AC-2**: A label that differs from the variable name shows the ≠ mark with its detail on hover and on tap.
Verified by: a unit test of the label comparison and a screenshot with the detail open.

## FO alignment

Surfaces: ui
Visible change: Each variable row shows one field pill reading item and field; the Browse vault row is gone.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.
