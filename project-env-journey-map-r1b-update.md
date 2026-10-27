---
id:
title: The project-env journey map matches what shipped and what release r1b now holds
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-journey-map-r1b-update:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-journey-map-r1b-update-backlog-1
              briefing:
                id: briefing:project-env-journey-map-r1b-update:backlog:attempt-1:revision-1
                digest: sha256:e545cb4fda61288435ac157772214d0e05d179a62e0c1211134629e71adc60bc
                room-ref: ./project-env-journey-map-r1b-update/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-journey-map-r1b-update:backlog:1
                briefing: briefing:project-env-journey-map-r1b-update:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-27T18:32:37.452639Z"
                decision: approve
                reason: '「開」 — Captain in FO chat, 2026-10-28. Asked: 「下一件要你決定的：要不要開一個「更新旅程地圖」的小任務？我建議開…回「開」或「先不用」。」 FO had recommended opening it.'
              application:
                target-stage: ideation
                state: consumed
---

The r1b release review of 2026-10-28 (`project-env-docs-site/release-review-r1b.md` in this state checkout) found `docs/journey/project-env/give-agents-their-project-setup.yaml` out of date: four r1.5 stories that merged (#21, #15, #17, #20) still read `gap`, r1b's `slice_because` says no plugin code is needed although four of its stories need code, and the introduction, reference and changelog pages the Captain asked for (「plugin 介紹，文件說明」, 2026-10-27) belong to no story. The Captain ruled 「移出」 on 2026-10-28: story `agent-lays-out-vault` leaves r1b. Asked whether to open a task for the map edit, recommending it, he answered 「開」.

## Scope

In: one edit of the journey file that (1) takes `agent-lays-out-vault` out of r1b, (2) sets `paste-token`, `token-works`, `add-remove-variable` and `test-each-variable` to `exists` with evidence symbols read from main, (3) replaces r1b's `slice_because` with a true reason, (4) adds one story for reading the plugin's introduction and docs, quoting the Captain's words, and (5) corrects the status card so it says r1.5 is merged and r1b is not built. Out: any plugin code, any other release's goal, r1b's goal sentence (the review's open point on "in-app steps" goes to the Captain separately), the canvas. Stop condition: the acceptance criterion passes.

## Acceptance criteria

**AC-1**: The journey file carries the five edits in Scope, every `exists` story's evidence symbol is found on main, and the journey lint passes.
Verified by: `node <kc-journey-map>/lib/journey-lint.mjs docs/journey/project-env/give-agents-their-project-setup.yaml <repo root>` exiting 0 at the candidate, and a diff showing only the five edits.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: done — he ruled 「移出」 on agent-lays-out-vault and answered 「開」 to this task on 2026-10-28.
Release review: not needed: map maintenance carrying the review-release output and the Captain's ruling; it moves no task into a release.
Map footprints: not needed: no open map question is answered by this task.
