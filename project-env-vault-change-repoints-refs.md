---
id:
title: Changing the vault keeps every variable pointing into it, and the screen marks any variable outside it before Test
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Polish round 2 of the project-env settings screen. Source: the Captain's UAT on 2026-10-23 (「這個 use this connection 按鈕是否可以放在 vault 選擇的後面？或是換個方式重新設計儲存跟取消」, 「import from conductor 功能可以移除」, and the qnow vault rename that blanked five variables live) and the Design Director's ruling in `ux-review-polish-2/design-director.md`, approved by the Captain on 2026-10-23 with 「准」, including option A, the re-point behaviour and the r2 wording.

## Scope

In (design-director.md Task 3): after another vault is picked in Change, a line says how many variables point at the old vault and that Done will point them at the new one; Done re-points exactly those references. A reference outside the saved vault shows the danger border and an outside line on its row before any Test. The focused pill's ring stands apart from the danger border and the dashed empty border. ADR 0005's consequence about vault renames gains a dated amendment: choosing the new vault in Change re-points those mappings, the screen marks mappings outside the saved vault, and identity by vault id stays deferred. Out: saving the vault by id (r3) and refusing to save outside references. Stop condition: the acceptance criteria pass. Branches from project-env-connection-done-cancel-one-row's merged main.

## Acceptance criteria

**AC-1**: In a fixture with saved vault Dev, three op://Dev/… refs and a token that reads only agent-dev, picking agent-dev in Change shows "3 variables point at Dev. Done points them at agent-dev. …"; Done then Save write vault agent-dev with three op://agent-dev/… refs, and Test reads "All 3 set".
Verified by: a runtime script on an isolated Paseo at 1280 and 400 px reading names and refs from projects.json; a unit test on the re-point rule that fails when the rewrite is removed; today's build writes op://Dev/… (observed by the Design Director).

**AC-2**: Only exact old-vault references move: Cancel after picking another vault changes none; a reference into a third vault is left alone; an empty previous vault moves nothing; a vault saved by id moves the references written with that id.
Verified by: a unit test table, one row per case.

**AC-3**: A reference outside the saved vault shows the danger border and the outside line before any Test, and the focused pill's ring differs from both the danger border and the dashed empty border.
Verified by: a runtime check on a fixture with one op://Other/… ref reading the line's text; a computed-style check comparing focused and unfocused pills; pictures for the ui gate.

## FO alignment

Surfaces: ui
Visible change: Picking another vault re-points the variables that used the old one, and a variable outside the vault is marked before Test.
Direction alignment with the Captain: done — the Captain approved the re-point behaviour on 2026-10-23 (「准」), knowing the screen then edits references he did not touch.
Result: ux-review-polish-2/director-shots/i3-*.png and opt-a-1280-picked.png; every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a polish of the r1.5 settings screen the Captain ruled at backlog; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this polish task.
