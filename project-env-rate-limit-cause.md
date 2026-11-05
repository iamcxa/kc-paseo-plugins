---
id:
title: A 1Password rate limit is shown as a rate limit, not as an unreadable item
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-rate-limit-cause:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-rate-limit-cause-backlog-1
              briefing:
                id: briefing:project-env-rate-limit-cause:backlog:attempt-1:revision-1
                digest: sha256:9cc7bc06629d94af1bc25367bf9acbbecafb8a0db28bdfaf6a8f4bb64f0f5f88
                room-ref: ./project-env-rate-limit-cause/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-rate-limit-cause:backlog:1
                briefing: briefing:project-env-rate-limit-cause:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T08:38:52.116562Z"
                decision: approve
                reason: '「開這批」 — Captain in FO chat, 2026-11-05. Asked: 「回「開這批」，我就開這 4 個任務，同時派設計」 after FO proposed batch r1b-polish-1 (picker-slow-hint, rate-limit-cause, started-row-visible, journey-map-r1b-catch-up) and recommended opening it.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-11-05T08:40:17Z
---

Batch: r1b-polish-1, approved by the Captain on 2026-11-05 (「開這批」) with four members: project-env-picker-slow-hint, project-env-rate-limit-cause, project-env-started-row-visible, project-env-journey-map-r1b-catch-up. On 2026-10-27 the vault-list task found that `classifyOpFailure` in `project-env/server/cause.ts` returns `unexpected` for 1Password's "Too Many Requests: You've reached the maximum number of this type of requests…" reply, so after a limit is hit every item read lands in skipped as "1Password could not read this item" (archived project-env-vault-list-loads-faster, "Findings from the runs"). Service-account limits are per hour and per day (research/2026-10-27-1password-agents-and-docs-site.md).

## Scope

In: recognise 1Password's rate-limit reply as its own cause, show it in the field picker, in Test and in the "Started without" line with the screen's own words and a next step, and add it to the troubleshooting notes.
Non-goals: retrying or backing off; changing how many reads are made; any other cause's wording.
Budget: one ideation, implementation and validation round; a second validation cycle returns to the Captain.
Stop condition: the acceptance criterion passes and the Captain's UAT is recorded.

## Acceptance criteria

**AC-1**: When `op` returns 1Password's rate-limit reply, the picker, Test and the "Started without" line name the rate limit and what to do, and the troubleshooting notes carry a heading for it; other failures keep their causes.
Verified by: a fake `op` that returns the rate-limit reply on an isolated Paseo, pictures at 1280 and 400 px, a unit test for the classification that fails when the new branch is removed, and `npm test` passing (the troubleshooting-notes test covers the new heading).

## FO alignment

Surfaces: ui
Visible change: A rate-limited 1Password read is shown as a rate limit with a next step, not as an unreadable item.
Direction alignment with the Captain: done — he answered 「開這批」 on 2026-11-05 to FO's proposed batch naming this task.
Result: the batch question and this Scope.
Release review: paseo-project-env/r1b at 637d05404ccafa198d9f283e1d7d2183c8304dea — signal 1: admitted into r1b under story pick-field ("reports a slow or limited vault"); review-release runs at the batch's first implementation dispatch.
Map footprints: not needed: no map answer is recorded by this task.
