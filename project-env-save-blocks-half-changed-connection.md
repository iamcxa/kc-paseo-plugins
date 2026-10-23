---
id:
title: Save never overwrites a working connection with a half-changed one
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-save-blocks-half-changed-connection:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-save-blocks-half-changed-connection-backlog-1
              briefing:
                id: briefing:project-env-save-blocks-half-changed-connection:backlog:attempt-1:revision-1
                digest: sha256:68cd0349e206be3d459bf6f1958ab5472ef4db855b689196ff52ca7ef67971e9
                room-ref: ./project-env-save-blocks-half-changed-connection/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-save-blocks-half-changed-connection:backlog:1
                briefing: briefing:project-env-save-blocks-half-changed-connection:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T05:25:30.795084Z"
                decision: approve
                reason: 'Captain 2026-10-23: 「准」 — answers the backlog question put in chat: approves Design Director Tasks A and B, A first, with both stated recommendations (token store refreshes the field list; the ≠ explanation adds ''Check it is the field you mean.'').'
              application:
                target-stage: ideation
                state: consumed
        - id: gate:project-env-save-blocks-half-changed-connection:ideation
          stage: ideation
          attempts:
            - id: gate-attempt:project-env-save-blocks-half-changed-connection-ideation-1
              briefing:
                id: briefing:project-env-save-blocks-half-changed-connection:ideation:attempt-1:revision-1
                digest: sha256:646e2600975060d36683adf86e3850abda580cbd5f84db5db3f230adfd7b92e3
                room-ref: ./project-env-save-blocks-half-changed-connection/review/ideation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-save-blocks-half-changed-connection:ideation:1
                briefing: briefing:project-env-save-blocks-half-changed-connection:ideation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T06:10:53.023547Z"
                decision: approve
                reason: 'Captain 2026-10-23: 「准」 — approves this Task A design and its acceptance criteria into implementation.'
              application:
                target-stage: implementation
                state: pending
started: 2026-10-23T05:26:08Z
---

Polish round after the A5 settings-screen rework of the project-env plugin (main 40849b4). Source: the picky-user pass (two reviewers on different models, `ux-review-a5-polish/astra-review.md` and `gemini-review.md`) and the Design Director's ruling (`ux-review-a5-polish/design-director.md`, Task A, rows R1, R11 and R2), approved by the Captain on 2026-10-23 with 「准」, including the Director's recommendation that storing a token refreshes the field list.

## Scope

In: the footer Save is disabled, with its reason shown in the save bar, while the 1Password connection is being changed, and works again after Done or Cancel (R1); a saved project keeps its place in the project list (R11); storing a token drops the vault field list already loaded, so the next field press reads the vault again (R2). Out: the first-setup form of a project never connected (R10, release r1b). Stop condition: the acceptance criteria pass. Runs before project-env-every-row-findable, which branches from this task's merged main.

## Acceptance criteria

**AC-1**: While Change is open with an unchecked account name typed, Save is disabled and the save bar says why; after Done or Cancel, Save works again, also after the window crosses 720 px.
Verified by: a unit test on the Save rule that fails when the open-change term is removed; a runtime script on an isolated Paseo at 1280 and 400 px that presses Save during Change and finds `projects.json` unchanged.

**AC-2**: Saving any project leaves the project list in the same order.
Verified by: a unit test that saves the middle of three projects and finds it still in the middle; a runtime check of the list text before and after Save.

**AC-3**: After a token is stored, the next press on a field opens a list read again from the vault.
Verified by: a runtime script with a fake `op` that returns different fields for two tokens stored under one account name; the second list shows the new fields.

## FO alignment

Surfaces: ui
Visible change: Save is off while you are changing the 1Password connection, and a saved project stays where it was in the list.
Direction alignment with the Captain: done — the Captain approved the Design Director's Task A and its recommendation on 2026-10-23 (「准」).
Result: ux-review-a5-polish/design-director.md, Task A; every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a polish of the r1.5 settings screen from the Captain-approved picky-user pass; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this polish task.

## Design

### PRFAQ

**Press release.** Kent presses Change on a connected project, types a different 1Password account name, and the footer Save goes dim. The save bar says "Finish or cancel the connection change first" under its unsaved count, so he cannot write a half-changed connection over the working one. He presses Done or Cancel and Save lights again. Saving a project leaves it where it was in the project list. Storing a new token under an account name makes the next press on a field read the vault again.

**FAQ.**
- *What counts as "being changed"?* The connection card is open through Change. The store already records it as `open.changing` (set by Change, cleared by Done and Cancel), so the block survives the remount Paseo does at 720 px. It is not tied to the typed text, which is what the Director ruled ("while the connection is being changed"): the block holds from the press on Change until Done or Cancel.
- *Why is Save blocked even when Change is open and untouched?* Two ways out are one press away (Done or Cancel); one rule is simpler than guessing whether the typed text differs. Nothing is lost: edits to rows and prompt stay in the draft. The reason line shows only when there is something to save (the count is above zero, or the project is new): with nothing to save Save is dim already, and picture 2 reads "No unsaved changes" without the line.
- *Is the first setup of a project that never connected blocked?* No. That form is the setup view, not Change, so `open.changing` stays null; saving an unfinished first setup stays allowed (R1 ruling, work-bare, picture 12).
- *Where does the reason sit?* One line in the save bar's left column, under the count, shown only while Save is blocked for this reason. The "N with no field picked yet" note stays on its own line below it, so Task B can make that note a button without moving the reason.
- *Does the project list order matter?* Yes: when two saved entries match one repository the first in list order wins (project-env-worktree-real-paths). Save replaces the entry where it sits; a project not yet saved is added at the end.
- *Why does storing a token drop the field list?* The list is loaded once per account and vault and kept. A token stored under the same account name can read other data, so the stored list is stale; the Captain approved dropping it on a stored token (2026-10-23, 「准」). A token the vault rejects stores nothing and leaves the list alone.

```mermaid
flowchart TD
  A[Connected project open: Save follows the unsaved count] -->|press Change| B[Change open: open.changing set]
  B --> C[Save off; save bar adds Finish or cancel the connection change first]
  C -->|window crosses 720 px| C
  C -->|Done, connection works| D[open.changing cleared, Save follows the count again]
  C -->|Cancel| D
  C -->|store a token| E[token stored: vault field list dropped, connection re-checked]
  E --> C
  D -->|Save| F[replace the project where it sits in the list, toast, back to the list]
  G[Never connected project: setup view] -->|Save| F
```

### What changes (read from `project-env/` on main at 40849b4, 2026-10-23)

Today `SaveBar` computes `canSave = pending && !saving && unnamed === 0` and `save` returns only on `unnamed > 0`, so neither reads `open.changing`; `save` writes `[...others, draft]`, which moves the project to the end; the `store` mutation's `onSuccess` calls `check()` and never `refs.reset()`, and `refs` resets only on `[account, draft.vault]`. New: `saveRule({ pending, saving, unnamed, changing })` returning `canSave` and `reason`, and `replaceProject(projects, draft)` in `shared/config.ts` (pure, so unit-testable like `unsavedCount`); a `changing` prop and a reason line in `SaveBar`; the same guard inside `save`, so a stale press cannot write; `refs.reset()` in `onSuccess` of `store`. No new setting, store field, RPC or dependency.

Existing-code check: the capability is missing, not broken. Two bounded searches over `project-env/client` and `project-env/shared` excluding `node_modules`: `grep -n "changing" client/settings-screen.tsx client/open-project.ts` finds the store field and the Done and Cancel handlers but no read in `SaveBar` or `save`; `grep -n "canSave\|others, draft" client/settings-screen.tsx` finds only the two unguarded sites. The store field is used, not rebuilt. Not searched: other plugins in other repositories.

### UI proposal

UI proposal: The save bar keeps its shape (count on the left, Close or Discard and Save on the right, pinned at the bottom of the web client). While the connection card is open through Change, Save is the existing dimmed outline and when there is something to save, a second line under the unsaved count reads "Finish or cancel the connection change first" in normal text colour; the line is absent otherwise (also while Change is open and nothing is unsaved, where Save is dim and the bar reads "No unsaved changes"), and the "N with no field picked yet" note stays beneath it in muted text. Nothing else on the page changes: Done and Cancel in the connection card are as today, and after either the line disappears and Save lights again.

Preview: project-env-save-blocks-half-changed-connection/design/preview-desktop-dark-3-change-typed-checked.png

The proposed design is the set `design/preview-*.png`, drawn from a running build of the real `project-env` client at main 40849b4 with only this task's change applied (`spike/save-polish.diff`), on a throwaway Paseo 0.12.0 daemon (own home `/tmp/pe-save`, port 6931, plugin id `pe-save`, fake `op`, `security` and `git` from `test/fakes`, one extra fake account `b` that reads different fields), driven through Paseo's own web client with a headless browser. Each picture is the whole settings page. Desktop 1280 px: 1 connected (Save off, nothing to save), 2 Change open untouched, 3 an unchecked account name typed and checked (the main picture), 4 after Cancel (Save back, 1 unsaved), 5 Change open with an unrelated prompt edit (Save still off), 6 after Done (Save on), 7 work-many with the "4 with no field picked yet" note below the reason, 8 the project list after saving the second project, 9 and 10 the field list before and after a token for another account is stored, 11 Change open after the token is stored, 12 first setup of a never-connected project (Save on), 13 an unchecked account name typed together with a prompt edit (the count reads 2). 400 px: the same 1 to 8, 10, 12 and 13. Light: picture 3 at both sizes. It is operable while the daemon is up. Disposable: the daemon, the plugin and `/tmp/pe-save` are removed at the end of ideation (teardown in the Stage Report); `spike/` keeps the diff, the test and the harness.

### Design review

Design review: design/ideation-1.yaml
Design finding 1: declined: the reason is 13 px in full text colour under the 14 px count, a deliberate step so it reads as the cause; the Director asked for a simple slot Task B can put its note beside, so no mark or size change.
Design finding 2: declined: Discard already opens "Discard N unsaved changes?" and drops the whole draft, connection included, and a typed connection change counts in N (picture 13 reads 2); the line names the two exits Done and Cancel that unblock Save.
Design finding 3: fixed: the FAQ and the UI proposal now say the line shows only when there is something to save, as drawn in preview-desktop-dark-2-change-open-untouched.png (Save already dim, "No unsaved changes").
Design finding 4: fixed: preview-desktop-dark-13-connection-draft-plus-prompt-edit.png and preview-compact-dark-13-connection-draft-plus-prompt-edit.png draw a connection draft with a prompt edit (count 2, Save off, reason shown); Check failed is drawn in picture 3 ("No token in Keychain"); a running Check lasts a second and Done is dim then, as in picture 3; the 400 px bar with a muted note and the reason is drawn in compact picture 7 (three text lines above the button row).
Design finding 5: declined: the Vault text input appears because the failed check gives no vault list, which is today's connection card and not touched by this task.
Design finding 6: declined: the bar wraps its buttons on a narrow window today (project-env-save-footer-danger-zone); the reason adds one line and Task B adds another, accepted there.
Design finding 7: declined: the 4 px inset difference is today's bar padding, not part of this change.
Design finding 8: declined: every button on the page is about 32 px high, and the dimmed Save is today's disabled style (project-env-save-footer-danger-zone design finding 7 and 5).
Design finding 9: declined: "Back" and "Back to plugins" are drawn by Paseo, not by the plugin.
Design finding 10: declined: light adds only theme colours to the same layout and picture 3 shows the new line in light at both sizes; picker pictures at 400 px for token 9 and 11 repeat the desktop states and picture 10 shows the 400 px list after the token.

### Acceptance evidence plan

Each result below was observed on 2026-10-23 on the isolated Paseo from the spike (`spike/save-polish.diff` on main 40849b4, port 6931); the merged implementation is not yet verified.

AC-1: unit rule `spike/save-rule.test.ts` (4 tests on `saveRule`): fails when `&& !changing` is removed from `canSave` (mutation run: 1 failed, "blocks Save with a reason while the connection change is open"). Runtime `spike/harness/ac1.sh 1280 1750` and `ac1.sh 400 2500` on work-empty with a prompt edit and Change open, an unchecked name typed and checked: Save disabled both sizes, pressing Save left `projects.json` byte-identical (shasum equal), Save stayed disabled after the window crossed 700 px and back, enabled after Cancel, and the saved file then changed. The same script on an unpatched main build (port 6932) wrote the file during Change (shasum differed) and re-ordered the list, so the script fails without the change. First setup (work-bare, picture 12): Save enabled.
AC-2: unit test `replaceProject` in the same file: fails when the entry is filtered out and appended (mutation run: 1 failed). Runtime: `ac1.sh` prints the order before and after saving the second of four projects: `work, work-empty, work-many, work-bare` both times; on unpatched main the saved project moved to the end (`work, work-many, work-bare, work-empty`).
AC-3: runtime `spike/harness/ac3.sh 1280 1000`: the field list before (token a) held SENTRY and not ROTATED; after storing a fake token for account b under the same account name `sa-a` it held ROTATED and not SENTRY (pictures 9 and 10). On unpatched main the same script still listed SENTRY after the token was stored. Not tested: a refused token (stores nothing, list unchanged, by source), and the phone app.

Not yet verified: the merged implementation; `npm test` and `npm run typecheck` on the merged branch (on the spike copy: typecheck clean, 262 of 262 tests pass, 2026-10-23); the phone app, where the sticky bar is skipped.

### Needs decision

None. The two Director recommendations (the save bar block with its reason, and the token store refreshing the list) were approved by the Captain on 2026-10-23 (「准」). Past rulings checked: `git -C docs/dev2/.spacedock-state grep -n 'Override:'` and the ADRs in the area name no behaviour for Save while Change is open.

### Spike notes

Machine dependencies, declared: Paseo.app 0.12.0 CLI at `/Users/kent/.local/bin/paseo`, Node, `agent-browser`, python3 with PIL only to crop pictures. `spike/harness/` is the review harness with an added fake account `b` (`setup.sh`); its defaults point at `/tmp/pe-save-ckpt` (a copy of `project-env` from main 40849b4 with `spike/save-polish.diff` applied, `node_modules` linked) on port 6931. The test copy and `/tmp/pe-save*` are removed at teardown. No real Keychain, 1Password or model provider was touched; Kent's `~/.paseo` and the live plugin were not touched.

## Stage Report: ideation

- DONE: Design the change your Scope names inside the current settings screen (direction A5 as built on main), with each acceptance criterion kept and given a reproducible evidence clause.
  `## Design` holds the PRFAQ, Mermaid, existing-code check, UI proposal and an evidence plan per criterion; AC-1 to AC-3 are unchanged; the spike diff is `spike/save-polish.diff` on main 40849b4.
- DONE: Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px, including the save bar's reason while Change is open, plus the design review, with each finding dispositioned.
  26 whole-page pictures in `design/` from the real client on an isolated Paseo 0.12.0 (port 6931); `design/ideation-1.yaml` (10 MINOR, no MAJOR; only its `preview:` path was prefixed with the task folder to match the Preview line); `design_surfaces.py check`: "design surfaces presentable; design review design/ideation-1.yaml: 10 findings, 2 fixed, 0 criteria, 8 declined, 0 decisions".
- DONE: Name any decision the Captain must make (at most one), with a recommendation; the two Design Director recommendations are already approved and are not decisions.
  None needed; both approved recommendations are designed in (reason line in the save bar; token store drops the field list).
- DONE: AC-1 While Change is open with an unchecked account name typed, Save is disabled and the save bar says why; after Done or Cancel, Save works again, also after the window crosses 720 px.
  Spike 2026-10-23: `save-rule.test.ts` fails when the `changing` term is removed (mutation: 1 failed); `ac1.sh` at 1280 and 400 px: Save disabled, `projects.json` shasum unchanged after pressing Save, still disabled after a 700 px round trip, enabled after Cancel; unpatched main wrote the file. Not yet verified: the merged implementation.
- DONE: AC-2 Saving any project leaves the project list in the same order.
  Spike: `replaceProject` test fails when the entry is filtered and appended (mutation: 1 failed); `ac1.sh` list order identical before and after; unpatched main moved the project to the end. Not yet verified: the merged implementation.
- DONE: AC-3 After a token is stored, the next press on a field opens a list read again from the vault.
  Spike: `ac3.sh`: list held SENTRY before, ROTATED after storing a token for account b under `sa-a`; unpatched main still held SENTRY. Not yet verified: a refused token (by source only), the merged implementation.

Teardown (2026-10-23): daemon on port 6931 stopped, browser session closed, `/tmp/pe-save*` removed; Kent's `~/.paseo`, the live plugin and `/tmp/pe-astra` (port 6920) were not touched.

### Summary

Save is blocked with a one-line reason in the save bar from the press on Change until Done or Cancel, a saved project is replaced where it sits, and a stored token drops the loaded field list; all three were built as a spike on main 40849b4 (about 30 changed lines, no new store field or RPC), drawn at 1280 and 400 px, and shown to fail on unpatched main. The design review found no MAJOR finding; the reason slot is one line under the count so Task B's no-field note sits beside it. No Captain decision remains.
