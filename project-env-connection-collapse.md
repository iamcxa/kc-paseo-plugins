---
id:
title: The 1Password connection collapses to one line once the token works
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-connection-collapse:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-connection-collapse-backlog-1
              briefing:
                id: briefing:project-env-connection-collapse:backlog:attempt-1:revision-1
                digest: sha256:22ae5b236de78b8e78296e10b884c16e701657e8fe055d9a3ed903a2265d24fe
                room-ref: ./project-env-connection-collapse/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-connection-collapse:backlog:1
                briefing: briefing:project-env-connection-collapse:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-22T04:15:44.262945Z"
                decision: approve
                reason: 'Captain 2026-10-22: 「准」 — accepts this A5 settings-screen rework task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: pending
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: once the token works and a vault is chosen, the connection card collapses to one line (status dot, service account, vault) with a Change button that reopens the full form (review finding 8). Stop condition: the acceptance criterion passes.

## Acceptance criteria

**AC-1**: A working connection shows as one line with Change, and Change reopens the account, token and vault controls.
Verified by: screenshots on an isolated Paseo before and after Change.

## FO alignment

Surfaces: ui
Visible change: A working 1Password connection shows as one line with a Change button.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.
