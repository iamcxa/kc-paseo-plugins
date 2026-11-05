---
id:
title: The "Started without" line stays visible in Paseo 0.14.0's default chat display
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-started-row-visible:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-started-row-visible-backlog-1
              briefing:
                id: briefing:project-env-started-row-visible:backlog:attempt-1:revision-1
                digest: sha256:eb4dd08340d0c8b5167526612bc02c2060333e0836cac51024e7ed618aa87970
                room-ref: ./project-env-started-row-visible/review/backlog/briefing-1
---

Batch: r1b-polish-1, approved by the Captain on 2026-11-05 (「開這批」) with four members: project-env-picker-slow-hint, project-env-rate-limit-cause, project-env-started-row-visible, project-env-journey-map-r1b-catch-up. On 2026-10-30 the resume-notice task observed on an isolated Paseo 0.14.0 that the existing "Started without N project variables" row is visible when it lands before the first user message (seq 1) and is folded by the default "Collapse turns" display when it lands after it (seq 3 in one run); a row appended at turn end stays visible (archived project-env-resume-blank-notice, "Observation record"). The Captain runs Paseo 0.14.0 (`paseo --version`, 2026-11-01).

## Scope

In: find out on an isolated Paseo 0.14.0 when the start row is folded and make it always visible in the default display, with the smallest change; keep the resume row as it is.
Non-goals: the resume row; Paseo's display settings; the agent notice text.
Budget: one ideation, implementation and validation round; if ideation finds no way the plugin can keep it visible, the task stops with the evidence.
Stop condition: the acceptance criterion passes and the Captain's UAT is recorded, or ideation's evidence shows no plugin-side fix and the Captain accepts that.

## Acceptance criteria

**AC-1**: On an isolated Paseo 0.14.0 in the default chat display, a new agent that starts without a mapped variable shows the "Started without" line on the page after its first turn ends, in every run of the case that folded it before.
Verified by: repeated runs on an isolated Paseo 0.14.0 with fake `op` and `security`, recording each row's position and whether it is on the page, pictures at 1280 and 400 px, and a unit test for the chosen placement.

## FO alignment

Surfaces: ui
Visible change: The "Started without N project variables" line is no longer folded away by Paseo 0.14.0's default chat display.
Direction alignment with the Captain: done — he answered 「開這批」 on 2026-11-05 to FO's proposed batch naming this task.
Result: the batch question and this Scope.
Release review: not needed: it follows a host release and adds no journey story.
Map footprints: not needed: no map answer is recorded by this task.
