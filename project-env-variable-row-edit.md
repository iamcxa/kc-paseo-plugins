---
id:
title: Each variable is one row with its field, Remove and last Test result
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1.5
journey-story: add-remove-variable
journey-required-tasks: '["project-env-variable-row-edit"]'
journey-mapping-complete: true
gates:
    version: 1
    records:
        - id: gate:project-env-variable-row-edit:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-variable-row-edit-backlog-1
              briefing:
                id: briefing:project-env-variable-row-edit:backlog:attempt-1:revision-1
                digest: sha256:0206a1bba6667ba86102e83a22ccdfb37f9636fb30efa5d6976585321881b1b8
                room-ref: ./project-env-variable-row-edit/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-variable-row-edit:backlog:1
                briefing: briefing:project-env-variable-row-edit:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-21T08:40:40.237397Z"
                decision: approve
                reason: 'Captain 2026-10-21: 「准」 — accepts this release r1.5 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-21T08:41:59Z
---

Release r1.5 of the paseo-project-env journey: on his own Mac, Kent stores a token only after it is checked, sees why a token fails, edits each variable where it sits, and sees test results that match his draft; his own use accepts it. Captain, 2026-10-20: 「我覺得UI不夠直覺」. Captain accepted this task list on 2026-10-21: 「可以」. Today all Remove buttons sit after all fields, Add accepts reserved names, and the name input is not cleared after Add.

## Scope

In: the variables card laid out one row per variable holding its field, its Remove button and its last Test result (Captain 2026-10-21 「可以」, layout recommended as one row per variable); Add refuses a reserved name with the reason, using isReservedName, with DYLD_* and LD_PRELOAD added to the reserved set and ADR 0004 amended (Captain 2026-10-21, journey add-remove-variable/q5); the name input clears after Add. Settled in ideation: journey add-remove-variable/q4 and q7. Non-goals: field references by ID (r1b). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: Each variable is one row holding its field, its Remove button and its last Test result.
Verified by: Kent's own use on his Mac, with a screenshot in the PR.

**AC-2**: Add refuses every reserved name, including DYLD_* and LD_PRELOAD, and says why.
Verified by: a unit test over the reserved set, and Kent's own use.

## FO alignment

Surfaces: ui
Visible change: The variables card shows one row per variable with its own Remove and Test result.
Direction alignment with the Captain: done — the Captain chose one row per variable on 2026-10-21 (「可以」 to the recommended layout).
Result: one row per variable holding its field, Remove button and last Test result.
Release review: paseo-project-env/r1.5 at 9489e13
