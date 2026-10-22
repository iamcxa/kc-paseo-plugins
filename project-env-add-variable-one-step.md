---
id:
title: Add opens the field picker and names the variable from the field
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
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
