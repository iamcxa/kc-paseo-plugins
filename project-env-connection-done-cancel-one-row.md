---
id:
title: Finishing or cancelling a connection change is one row right after the vault
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-connection-done-cancel-one-row:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-connection-done-cancel-one-row-backlog-1
              briefing:
                id: briefing:project-env-connection-done-cancel-one-row:backlog:attempt-1:revision-1
                digest: sha256:c33390948f4dcb7c3991563a2b4968b4b2d3f53caa6a940a480cbd2a10c51c2f
                room-ref: ./project-env-connection-done-cancel-one-row/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-connection-done-cancel-one-row:backlog:1
                briefing: briefing:project-env-connection-done-cancel-one-row:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T12:22:04.513444Z"
                decision: approve
                reason: 'Captain 2026-10-23: 「准」 — answers the backlog question put in chat: approves Design Director round-2 Tasks 1 to 3 in order, with option A, the re-point behaviour and the r2 rename as stated.'
              application:
                target-stage: ideation
                state: pending
---

Polish round 2 of the project-env settings screen. Source: the Captain's UAT on 2026-10-23 (「這個 use this connection 按鈕是否可以放在 vault 選擇的後面？或是換個方式重新設計儲存跟取消」, 「import from conductor 功能可以移除」, and the qnow vault rename that blanked five variables live) and the Design Director's ruling in `ux-review-polish-2/design-director.md`, approved by the Captain on 2026-10-23 with 「准」, including option A, the re-point behaviour and the r2 wording.

## Scope

In (design-director.md Task 2, option A): in the Change form only, the "Use this connection / Done" and "Keep the current connection / Cancel" rows become one row right after Vault, with Cancel and Done on the right styled like the save bar's buttons, and the reason a disabled Done is disabled shown in the row. Cancel and Done keep their behaviour, including the blocked Save and its survival across 720 px. Out: the first-setup form (r1b) and the save bar. Stop condition: the acceptance criteria pass. Branches from project-env-remove-conductor-import's merged main.

## Acceptance criteria

**AC-1**: In the Change form with a working vault picked, Cancel and Done sit in one row after Vault and both end above the save bar, at 1280 × 1400 and 400 × 900.
Verified by: a measuring script: the two buttons share a top edge within 2 px, the row starts below the Vault row, both bottoms are above the bar's top; today's build fails at 400 × 900 (Cancel under the bar, ux-review-polish-2/director-shots/opt-today-400-picked.png).

**AC-2**: With an unchecked account name Done is disabled and the row reads "Available once the connection works."; with a typed unsaved token it reads "Save the token or clear the field first."; Cancel brings back the previous account and vault.
Verified by: a runtime script at both widths reading the hint and, after Cancel, the connection line; the existing save-rule unit tests pass unchanged.

## FO alignment

Surfaces: ui
Visible change: Cancel and Done sit together in one row right after the vault choice.
Direction alignment with the Captain: done — the Captain chose option A on 2026-10-23 (「准」).
Result: ux-review-polish-2/director-shots/opt-a-*.png; every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a polish of the r1.5 settings screen the Captain ruled at backlog; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this polish task.
