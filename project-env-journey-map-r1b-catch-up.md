---
id:
title: The project-env journey map shows what shipped since the last map update
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-journey-map-r1b-catch-up:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-journey-map-r1b-catch-up-backlog-1
              briefing:
                id: briefing:project-env-journey-map-r1b-catch-up:backlog:attempt-1:revision-1
                digest: sha256:f4a599f8cb65c195dcf2ded408822569026e2adee0aea425e69c101239199e80
                room-ref: ./project-env-journey-map-r1b-catch-up/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-journey-map-r1b-catch-up:backlog:1
                briefing: briefing:project-env-journey-map-r1b-catch-up:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T08:39:15.647329Z"
                decision: approve
                reason: '「開這批」 — Captain in FO chat, 2026-11-05. Asked: 「回「開這批」，我就開這 4 個任務，同時派設計」 after FO proposed batch r1b-polish-1 (picker-slow-hint, rate-limit-cause, started-row-visible, journey-map-r1b-catch-up) and recommended opening it.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-11-05T08:40:29Z
---

Batch: r1b-polish-1, approved by the Captain on 2026-11-05 (「開這批」) with four members: project-env-picker-slow-hint, project-env-rate-limit-cause, project-env-started-row-visible, project-env-journey-map-r1b-catch-up. Since the map update merged as #59 (637d054), PR #61 shipped story `pick-repository` (task project-env-pick-repository, UAT OK 2026-11-05) and PR #58 shipped the docs site story `read-the-docs` (task project-env-docs-site, UAT OK 2026-10-28); both still read `gap` on `docs/journey/project-env/give-agents-their-project-setup.yaml`. The terminal limit the Captain asked to document (「加」, 2026-11-05) is not on the map.

## Scope

In: set `pick-repository` and `read-the-docs` to `exists` with evidence symbols read on main, record the terminal limit where the map's rules allow, and correct the status card.
Non-goals: any other story's status, any release goal, plugin code, the canvas.
Budget: one ideation, implementation and validation round.
Stop condition: the acceptance criterion passes.

## Acceptance criteria

**AC-1**: The journey file carries those edits, every `exists` story's evidence symbol is found on main, and the journey lint passes.
Verified by: `node <kc-journey-map>/lib/journey-lint.mjs docs/journey/project-env/give-agents-their-project-setup.yaml <repo root>` exiting 0 at the candidate and a diff showing only those edits.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: done — he answered 「開這批」 on 2026-11-05 to FO's proposed batch naming this task.
Result: the batch question and this Scope.
Release review: not needed: map maintenance recording shipped work; it moves no task into a release.
Map footprints: not needed: no open map question is answered by this task.
