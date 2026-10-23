---
id:
title: The variables card no longer offers a Conductor import
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-remove-conductor-import:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-remove-conductor-import-backlog-1
              briefing:
                id: briefing:project-env-remove-conductor-import:backlog:attempt-1:revision-1
                digest: sha256:a3046e92a8559a59e091dfb11880787c120d91ff767ab4c5bc4f5d92d205b508
                room-ref: ./project-env-remove-conductor-import/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-remove-conductor-import:backlog:1
                briefing: briefing:project-env-remove-conductor-import:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T12:21:58.418798Z"
                decision: approve
                reason: 'Captain 2026-10-23: 「准」 — answers the backlog question put in chat: approves Design Director round-2 Tasks 1 to 3 in order, with option A, the re-point behaviour and the r2 rename as stated.'
              application:
                target-stage: ideation
                state: pending
---

Polish round 2 of the project-env settings screen. Source: the Captain's UAT on 2026-10-23 (「這個 use this connection 按鈕是否可以放在 vault 選擇的後面？或是換個方式重新設計儲存跟取消」, 「import from conductor 功能可以移除」, and the qnow vault rename that blanked five variables live) and the Design Director's ruling in `ux-review-polish-2/design-director.md`, approved by the Captain on 2026-10-23 with 「准」, including option A, the re-point behaviour and the r2 wording.

## Scope

In (design-director.md Task 1): remove the Conductor import from the client row and its state, the `importConductor` RPC, `server/conductor.ts`, its handler, `splitImported` and their tests; variables and prompts it already imported stay. Journey map: delete the two stories that cite it, rename r2 to "RELEASE 2 — Standing instructions" with the goal "New agents follow the repository's standing instructions.", and drop "import" from the answer to add-remove-variable/q9. ADR 0004 gains a dated amendment recording the removal. Out: the default prompt section, and Paseo's session-open "import" reason. Stop condition: the acceptance criteria pass. Runs first; project-env-connection-done-cancel-one-row branches from its merged main.

## Acceptance criteria

**AC-1**: No project shows an import row at 1280 or 400 px, and the plugin serves no `project.import-conductor` call.
Verified by: a runtime text check of all four fixture projects at both widths; a search of `project-env/` for `importConductor`, `conductor` and `splitImported` finds nothing outside `CHANGELOG.md`; `npm test` and `npm run typecheck` pass.

**AC-2**: The journey map passes its check with no story citing a removed symbol, and r2 reads as the Captain confirmed.
Verified by: `node lib/journey-lint.mjs <journey> <repoRoot>` on give-agents-their-project-setup.yaml reports no citation failure; a text diff of the r2 entry.

## FO alignment

Surfaces: ui
Visible change: The Import names and prompt from Conductor row is gone from every project.
Direction alignment with the Captain: done — the Captain approved the Design Director's Task 1 and the r2 wording on 2026-10-23 (「准」).
Result: ux-review-polish-2/design-director.md, Task 1; every ui gate shows the Captain screenshots of the screen.
Release review: not needed: the Captain ruled the removal and the r2 rename directly at backlog; the task carries the map edit itself.
Map footprints: owed: this task deletes two journey stories and renames r2; its implementation report records the edits.
