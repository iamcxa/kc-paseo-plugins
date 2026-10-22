---
id:
title: The field picker is grouped, searchable and suggests the matching field
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-field-picker-grouped:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-field-picker-grouped-backlog-1
              briefing:
                id: briefing:project-env-field-picker-grouped:backlog:attempt-1:revision-1
                digest: sha256:f428f8bb6c8bdab68e5d6c0cd4036a200caddabb65d3f032a157d1e45225a6d0
                room-ref: ./project-env-field-picker-grouped/review/backlog/briefing-1
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: the field picker groups fields by item, has a search box, lists first the field whose label equals the variable name (ADR 0005), marks fields used by another variable, shows a reference missing from the vault in red as "not in vault", and lists unreadable items as "not listed" with their reason outside the variable rows (review findings 4, 10). Non-goals: references by ID (r1b). Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: The picker groups fields by item, filters by search, and lists the same-name field first.
Verified by: unit tests of grouping, filtering and ordering, and a screenshot of the open picker.

**AC-2**: A field used by another variable is marked, and a saved reference missing from the vault shows as not in vault.
Verified by: unit tests and a screenshot.

## FO alignment

Surfaces: ui
Visible change: The field picker is grouped by item, searchable, and suggests the field named like the variable.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.
