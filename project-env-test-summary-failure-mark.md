---
id:
title: Test shows a summary line and marks failed rows with a red border and (!)
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-test-summary-failure-mark:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-test-summary-failure-mark-backlog-1
              briefing:
                id: briefing:project-env-test-summary-failure-mark:backlog:attempt-1:revision-1
                digest: sha256:3765029300073892d0da5c11fbaec0050f8c6403bd5aa5295d79730bdd45925d
                room-ref: ./project-env-test-summary-failure-mark/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-test-summary-failure-mark:backlog:1
                briefing: briefing:project-env-test-summary-failure-mark:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-22T04:15:22.498305Z"
                decision: approve
                reason: 'Captain 2026-10-22: 「准」 — accepts this A5 settings-screen rework task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: pending
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: per-row status text is removed; a failed row gets a red pill border and a (!) after the pill whose plain one-sentence reason opens on hover and on tap or click; the Variables header shows a summary next to Test ("2 failed · 3 set", "All 5 set", "Not tested since changes"); editing a row clears only that row's mark (review findings 6, 7; A5). The tooltip must not cover a neighbouring row's name or (!). Supersedes project-env-test-row-draft-note. Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: After Test, failed rows show a red border and a (!) whose reason opens on hover and on tap, and the header shows the failed and set counts.
Verified by: unit tests of the summary text and screenshots at desktop and 400 px with the reason open.

**AC-2**: Editing one row clears only that row's mark and sets the summary to "Not tested since changes".
Verified by: a runtime check on an isolated Paseo with screenshots.

## FO alignment

Surfaces: ui
Visible change: Failed rows get a red border and (!) with the reason on hover or tap, and Test shows a summary line.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.
