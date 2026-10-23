---
id:
title: You can find and read every variable row
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Polish round after the A5 settings-screen rework of the project-env plugin. Source: the picky-user pass (`ux-review-a5-polish/astra-review.md`, `gemini-review.md`) and the Design Director's ruling (`ux-review-a5-polish/design-director.md`, Task B, rows R3b, R4, R5, R6 and R7), approved by the Captain on 2026-10-23 with 「准」, including the Director's recommendation to add "Check it is the field you mean." to the ≠ explanation.

## Scope

In: rows the screen scrolls to end above the save bar (R3b); the "N with no field picked yet" note moves you to each such row in turn (R4); the last Test result survives a remount at 720 px (R5); long names break only after underscores (R6); the ≠ explanation reads "The field name differs from the variable name. Check it is the field you mean." with the amber colour kept (R7). Out: undo of a removed row (R9, r3), Test results kept after Save (R13, r2), moving Conductor import and the prompt (R14, r2). Stop condition: the acceptance criteria pass. Starts after project-env-save-blocks-half-changed-connection merges, from that main.

## Acceptance criteria

**AC-1**: In work-many at 400 × 900 and 1280 × 1400, a newly added row ends fully above the save bar, and so does each row reached through the note.
Verified by: a measuring script on an isolated Paseo comparing each row's bottom edge with the bar's top edge at both widths.

**AC-2**: Pressing the note four times in work-many visits LINEAR_API_KEY, RESEND_API_KEY, SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET in order, and a fifth press returns to the first.
Verified by: a runtime script at both widths.

**AC-3**: A Test summary reads the same before and after the window crosses 720 px and back; the 54-character name starts every new line right after an underscore and its copied text equals the name; the open ≠ explanation reads "The field name differs from the variable name. Check it is the field you mean."
Verified by: a runtime resize script comparing the summary text; a measuring script checking where each line starts and reading the name's text content; a text check of the open ≠ explanation. Each clause is falsified on its own.

## FO alignment

Surfaces: ui
Visible change: Rows are never hidden under the save bar, the no-field count takes you to those rows, Test results survive a resize and long names wrap at underscores.
Direction alignment with the Captain: done — the Captain approved the Design Director's Task B and its recommendation on 2026-10-23 (「准」).
Result: ux-review-a5-polish/design-director.md, Task B; every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a polish of the r1.5 settings screen from the Captain-approved picky-user pass; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this polish task.
