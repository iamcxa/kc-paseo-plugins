---
id:
title: Unsaved edits survive the settings screen re-mounting
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: keep the open project and its unsaved draft outside the screen component that Paseo re-mounts when the window crosses a width between 700 and 800 px (review finding 3; shots 30a, 30b). Non-goals: an unsaved-changes warning (r3). Stop condition: the acceptance criterion passes.

## Acceptance criteria

**AC-1**: Resizing the window across the narrow-wide breakpoint keeps the open project and every unsaved edit.
Verified by: a runtime check on an isolated Paseo, resizing across 700-800 px with an edit open, with before and after screenshots.

## FO alignment

Surfaces: ui
Visible change: Resizing the window no longer drops unsaved edits.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.
