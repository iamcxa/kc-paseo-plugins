---
id:
title: The Test row says it checks the variables as edited, saved or not
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-test-row-draft-note:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-test-row-draft-note-backlog-1
              briefing:
                id: briefing:project-env-test-row-draft-note:backlog:attempt-1:revision-1
                digest: sha256:a6aa846d49cc90cb521438732b5a97979e9ce101d23ae59961227b484bc25289
                room-ref: ./project-env-test-row-draft-note/review/backlog/briefing-1
---

Test resolves the variables in the editor's draft, not the saved settings, so a Test that reads set can sit beside a saved project whose new agents still miss the variable until Save. Captain, 2026-10-21, asked whether to add the sentence 「Checks the variables as edited here, saved or not」 to the Test row: 「好」.

## Scope

In: one sentence on the Test row hint, "Checks the variables as edited here, saved or not.", alongside the existing "Set means a value came back from 1Password; it does not prove the service accepts that key." Non-goals: an unsaved-changes warning (journey story unsaved-warning, r3). Starts after project-env-token-works-cause (PR #15) merges, because both change client/settings-screen.tsx. Stop condition: the acceptance criterion below passes.

## Acceptance criteria

**AC-1**: The Test row shows "Checks the variables as edited here, saved or not." before any Test is run.
Verified by: a grep of client/settings-screen.tsx for the sentence and a screenshot of the Test row on an isolated Paseo.

## FO alignment

Surfaces: ui
Visible change: The Test row states that it checks the variables as edited, saved or not.
Direction alignment with the Captain: not needed — the Captain approved the exact sentence on 2026-10-21 (「好」).
Release review: not needed: a one-sentence wording follow-up to release r1.5 test-each-variable, carrying no new story.
