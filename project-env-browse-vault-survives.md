---
id:
title: Browse vault lists fields even when one item cannot be read
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1b
journey-story: pick-field
gates:
    version: 1
    records:
        - id: gate:project-env-browse-vault-survives:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-browse-vault-survives-backlog-1
              briefing:
                id: briefing:project-env-browse-vault-survives:backlog:attempt-1:revision-1
                digest: sha256:e29f9846d02624608745c9068f3ce3b9f7f6cdd4959900b09996caa9867d5813
                room-ref: ./project-env-browse-vault-survives/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-browse-vault-survives:backlog:1
                briefing: briefing:project-env-browse-vault-survives:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-21T08:41:04.452867Z"
                decision: approve
                reason: 'Captain 2026-10-21: 「准」 — accepts this release r1.5 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-21T08:42:14Z
---

Release r1.5 of the paseo-project-env journey: on his own Mac, Kent stores a token only after it is checked, sees why a token fails, edits each variable where it sits, and sees test results that match his draft; his own use accepts it. Captain, 2026-10-20: 「我覺得UI不夠直覺」. Captain accepted this task list on 2026-10-21: 「可以」. Kent hit this on 2026-10-21: Browse vault failed with op's raw "invalid PEM private key passed in" because one item in his vault is typed SSH Key; listRefs runs op item get per item and one failure fails the whole list. Captain confirmed the item and approved this task on 2026-10-21 (「可以」).

## Scope

In: an item that cannot be read is skipped and named with a plain reason; the other fields are still listed; Browse vault errors show cause text, never op output; ideation assesses listing field names without reading values into the plugin. Pulled from story pick-field (r1b): references by ID and a bounded browse stay in r1b. Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: When one item fails to read, the other items' fields are still listed and the failed item is named with a plain reason.
Verified by: a test whose fake op fails one item get, and Kent's own use against his vault.

**AC-2**: No Browse vault error shows op output or a value.
Verified by: a test with a fixed stderr sentinel.

## FO alignment

Surfaces: ui
Visible change: Browse vault lists the fields it can read and names the item it skipped.
Direction alignment with the Captain: not needed — the Captain approved this task on 2026-10-21 (「可以」); it pulls part of r1b's pick-field into r1.5 (signal 2), recorded here.
Release review: paseo-project-env/r1.5 at 9489e13
