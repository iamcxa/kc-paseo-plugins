---
id:
title: Add opens the field picker and names the variable from the field
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-add-variable-one-step:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-add-variable-one-step-backlog-1
              briefing:
                id: briefing:project-env-add-variable-one-step:backlog:attempt-1:revision-1
                digest: sha256:56a8cabfdc21525ca19ff247496c689f70f98c6630aa46578291d32eba570d87
                room-ref: ./project-env-add-variable-one-step/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-add-variable-one-step:backlog:1
                briefing: briefing:project-env-add-variable-one-step:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-22T04:15:11.024862Z"
                decision: approve
                reason: 'Captain 2026-10-22: 「准」 — accepts this A5 settings-screen rework task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-22T04:16:46Z
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: "+ Add" in the Variables header opens the field picker; picking a field adds a row named from the field label (kept when it is a valid unused name; converted to upper snake case and selected for editing otherwise; left empty with the reason when it is reserved or already used); the picker also offers "add with this name, pick the field later" from its search text. The old name row and Add row are removed (review finding 5; Captain 「可以」 2026-10-22). Depends on: project-env-field-picker-grouped. Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: Picking a field from Add creates a row named from its label, or converted, or empty with a reason for a reserved or used name.
Verified by: unit tests of the naming rule over those cases, and screenshots of the flow.

**AC-2**: Add can create a named row with no field yet, which shows "Pick a field".
Verified by: a screenshot on an isolated Paseo.

## FO alignment

Surfaces: ui
Visible change: Add opens the field picker and names the new variable from the picked field.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.
