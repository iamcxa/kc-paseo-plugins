---
id:
title: Save never overwrites a working connection with a half-changed one
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-save-blocks-half-changed-connection:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-save-blocks-half-changed-connection-backlog-1
              briefing:
                id: briefing:project-env-save-blocks-half-changed-connection:backlog:attempt-1:revision-1
                digest: sha256:68cd0349e206be3d459bf6f1958ab5472ef4db855b689196ff52ca7ef67971e9
                room-ref: ./project-env-save-blocks-half-changed-connection/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-save-blocks-half-changed-connection:backlog:1
                briefing: briefing:project-env-save-blocks-half-changed-connection:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T05:25:30.795084Z"
                decision: approve
                reason: 'Captain 2026-10-23: 「准」 — answers the backlog question put in chat: approves Design Director Tasks A and B, A first, with both stated recommendations (token store refreshes the field list; the ≠ explanation adds ''Check it is the field you mean.'').'
              application:
                target-stage: ideation
                state: pending
---

Polish round after the A5 settings-screen rework of the project-env plugin (main 40849b4). Source: the picky-user pass (two reviewers on different models, `ux-review-a5-polish/astra-review.md` and `gemini-review.md`) and the Design Director's ruling (`ux-review-a5-polish/design-director.md`, Task A, rows R1, R11 and R2), approved by the Captain on 2026-10-23 with 「准」, including the Director's recommendation that storing a token refreshes the field list.

## Scope

In: the footer Save is disabled, with its reason shown in the save bar, while the 1Password connection is being changed, and works again after Done or Cancel (R1); a saved project keeps its place in the project list (R11); storing a token drops the vault field list already loaded, so the next field press reads the vault again (R2). Out: the first-setup form of a project never connected (R10, release r1b). Stop condition: the acceptance criteria pass. Runs before project-env-every-row-findable, which branches from this task's merged main.

## Acceptance criteria

**AC-1**: While Change is open with an unchecked account name typed, Save is disabled and the save bar says why; after Done or Cancel, Save works again, also after the window crosses 720 px.
Verified by: a unit test on the Save rule that fails when the open-change term is removed; a runtime script on an isolated Paseo at 1280 and 400 px that presses Save during Change and finds `projects.json` unchanged.

**AC-2**: Saving any project leaves the project list in the same order.
Verified by: a unit test that saves the middle of three projects and finds it still in the middle; a runtime check of the list text before and after Save.

**AC-3**: After a token is stored, the next press on a field opens a list read again from the vault.
Verified by: a runtime script with a fake `op` that returns different fields for two tokens stored under one account name; the second list shows the new fields.

## FO alignment

Surfaces: ui
Visible change: Save is off while you are changing the 1Password connection, and a saved project stays where it was in the list.
Direction alignment with the Captain: done — the Captain approved the Design Director's Task A and its recommendation on 2026-10-23 (「准」).
Result: ux-review-a5-polish/design-director.md, Task A; every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a polish of the r1.5 settings screen from the Captain-approved picky-user pass; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this polish task.
