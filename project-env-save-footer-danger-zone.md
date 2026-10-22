---
id:
title: A save bar shows unsaved changes and Stop managing has its own section
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: a footer save bar with an unsaved-change count, Discard and Save; Save confirms with a toast; Stop managing sits in its own section, shown only for a saved project, with a destructive-looking confirm button (review finding 9). Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: The footer shows the number of unsaved changes, and Save confirms with a toast.
Verified by: screenshots on an isolated Paseo.

**AC-2**: Stop managing appears only for a saved project, in its own section, and its confirm button looks destructive.
Verified by: screenshots of an unsaved and a saved project and of the dialog.

## FO alignment

Surfaces: ui
Visible change: A save bar shows how many changes are unsaved, and Stop managing sits in its own section.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.
