---
id:
title: Unsaved edits survive the settings screen re-mounting
status: done
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree: .worktrees/spacedock-ensign-project-env-draft-survives-remount
pr: pr-merge:22
gates:
    version: 1
    records:
        - id: gate:project-env-draft-survives-remount:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-draft-survives-remount-backlog-1
              briefing:
                id: briefing:project-env-draft-survives-remount:backlog:attempt-1:revision-1
                digest: sha256:4ccabc9aa6689722fe6567c055e57f94a00afd38a626df0476c51b0d1a6063c8
                room-ref: ./project-env-draft-survives-remount/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-draft-survives-remount:backlog:1
                briefing: briefing:project-env-draft-survives-remount:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-22T04:14:35.862941Z"
                decision: approve
                reason: 'Captain 2026-10-22: 「准」 — accepts this A5 settings-screen rework task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
        - id: gate:project-env-draft-survives-remount:ideation
          stage: ideation
          attempts:
            - id: gate-attempt:project-env-draft-survives-remount-ideation-1
              briefing:
                id: briefing:project-env-draft-survives-remount:ideation:attempt-1:revision-1
                digest: sha256:f02ff4af014c0fe4b2cb25ac666d695a8fffc8f317ae4575dfe1134842e349a7
                room-ref: ./project-env-draft-survives-remount/review/ideation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-draft-survives-remount:ideation:1
                briefing: briefing:project-env-draft-survives-remount:ideation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-22T07:44:49.89192Z"
                decision: approve
                reason: 'Captain 2026-10-22: 「准」 — accepts this A5 rework design and its acceptance criteria into implementation, including the recommendation stated in this gate''s question.'
              application:
                target-stage: implementation
                state: consumed
        - id: gate:project-env-draft-survives-remount:validation
          stage: validation
          attempts:
            - id: gate-attempt:project-env-draft-survives-remount-validation-1
              briefing:
                id: briefing:project-env-draft-survives-remount:validation:attempt-1:revision-1
                digest: sha256:143b5319777ce97d26a75f09af1261c5fb5997e1b9ff92878295b203ea6a2554
                room-ref: ./project-env-draft-survives-remount/review/validation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-draft-survives-remount:validation:1
                briefing: briefing:project-env-draft-survives-remount:validation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-22T08:46:31.893778Z"
                decision: approve
                reason: 'Captain 2026-10-22: 「准。先做完讓我試試看好了，我暫時沒有時間看得太仔細」 — approves delivery of PR iamcxa/kc-paseo-plugins#22 at head 8831beb37a6019519e8954f964b0cb9be8630e74 by squash after the clean Codex round (summary:6335926273).'
              application:
                target-stage: done
                state: consumed
started: 2026-10-22T04:16:26Z
verdict: PASSED
completed: 2026-10-22T08:56:37Z
archived: 2026-10-22T08:56:37Z
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: keep the open project and its unsaved draft outside the screen component that Paseo re-mounts when the window crosses a width between 700 and 800 px (review finding 3; shots 30a, 30b). Non-goals: an unsaved-changes warning (r3). Stop condition: the acceptance criterion passes.

## Acceptance criteria

**AC-1**: Resizing the window across the narrow-wide breakpoint keeps the open project and every unsaved edit.
Verified by: a runtime check on an isolated Paseo (own `PASEO_HOME` and port, throwaway plugin id, fake `op`, `security` and `git`) that adds a variable and types a prompt at 1280 px, resizes to 719 px and to 400 px, and asserts the editor, the added row and the prompt text are still on screen, then grows back to 1280 px and asserts the same; the same run starting at 400 px and growing; a new unsaved project; and Save, Discard and the revision-conflict refusal after a resize. Before and after screenshots at desktop and 400 px. A unit test of the open-project store covers begin, update, edit count, revision kept and close.

## FO alignment

Surfaces: ui
Visible change: Resizing the window no longer drops unsaved edits.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this rework task.

## Design

### PRFAQ

**Press release.** Kent edits a project in Project environment settings, rotates his phone or snaps the window narrow, and the screen stays exactly where he left it: same project, same added row, same typed prompt. Save, Discard and Stop managing work as before.

**FAQ.**
- *Why did the edits vanish?* Paseo draws plugin settings in a wide layout at 720 px and up and a compact layout at 719 px and below; crossing 720 px re-mounts the plugin screen. The open project and the draft were React state inside that screen (`Configured` and `ProjectEditor` in `client/settings-screen.tsx`), so the re-mount dropped them. Measured 2026-10-22 on Paseo 0.12.0: 720 px keeps the editor, 719 px returns to the project list.
- *What survives?* The plugin module itself: its client code ran once per page load across the re-mount (a `console.warn` at module top printed once at page load and not again after the Edit click or the resize). So the open project and its draft move into a small module-level store.
- *What does the store hold?* One open project: `session`, `initial` (the project as opened), `draft`, `edits` (the counter Test uses to know its results are stale) and `revision` (the settings revision seen when it opened, so a save over another client's change is still refused after a re-mount).
- *What is deliberately not kept?* The service-account token being typed (a secret stays in its input only), Test results, the open field picker, the Stop managing dialog and the import note. After a crossing a Test must be re-run, and an open dialog closes while the draft stays (pictures below).
- *When is the draft dropped?* On Save, Discard and Stop managing (the three existing `onDone` exits), and on a full page reload. It also survives leaving the settings screen inside the app and coming back, because that is the same re-mount; the unsaved-changes warning stays r3, as Scope says.
- *Does the host offer something already?* No. Bounded searches 2026-10-22: `grep -rniE "remount|persist|storage|session"` over `@getpaseo/plugin/dist/client/*.d.ts` finds no UI-state store (client state is workspace and agent snapshots only; settings are saved documents), and `grep` for module-level state under `project-env/client` and `project-env/shared` finds only constant sets. Not searched: Paseo's closed app source.

### What changes (read from `project-env/` on main at 1adf630, 2026-10-22)

```mermaid
flowchart TD
  A[Kent presses Edit or picks Add a project] --> B[store.begin: session, initial, draft, edits 0, revision]
  B --> C[ProjectEditor reads draft, edits, revision from the store]
  C --> D{what happens}
  D -->|edit anything| E[store.update changes the draft and counts the edit]
  E --> C
  D -->|window crosses 720 px either way| F[host re-mounts the screen; local state is gone]
  F --> G[screen mounts, finds the open project in the store]
  G --> C
  D -->|Save accepted| H[store.close, back to the project list]
  D -->|Save refused: settings changed elsewhere| I[stay in the editor, message shown, draft kept]
  I --> C
  D -->|Discard or Stop managing confirmed| H
  D -->|full page reload| J[store is empty: project list]
```

Code shape for implementation (not written here): a new `client/open-project.ts` with `openProject.begin`, `openProject.update(change, countsAsEdit)`, `openProject.close` and a `useOpenProject()` hook on `useSyncExternalStore`; `Configured` shows the editor whenever the store holds a project; `ProjectEditor` drops its `useState` for draft, edits and revision, and its `patch`, import and prompt handlers call `openProject.update`. The disposable spike is 85 diff lines plus a 40-line store (`design/spike/prototype.patch`, `design/spike/open-project.ts`); it typechecks with the repository's `tsc`.

Existing-code check: journey bounded to "open a project, edit, resize" in `client/settings-screen.tsx`. Complete: the editor works at both widths (unit and runtime). Needed: Captain goal, review finding 3. Missing: any state that outlives the screen (two bounded searches above). Repair by adding the store; nothing is replaced or removed.

### Interfaces named from sibling tasks (none designed here)

- **project-env-save-footer-danger-zone** must count unsaved changes from the store (`initial` against `draft`, read through `useOpenProject()`), not from component state, or after a re-mount its footer says "No unsaved changes" over a kept draft.
- **project-env-test-summary-failure-mark** keeps its marks in component state, which a re-mount clears: with `edits > 0` and no results its header must read "Not tested since changes", never "All set".
- **project-env-field-pill-one-control, -field-picker-grouped, -add-variable-one-step, -connection-collapse** change the draft only through `openProject.update(change, countsAsEdit)`; an open picker or an expanded connection form is local and closes on a re-mount. All six siblings edit the top of `ProjectEditor`, so this task should merge first or the others rebase over its state lines.

### UI proposal

UI proposal: The settings screen looks the same as today; what changes is that the open project and its unsaved edits stay open and intact when the window crosses 720 px in either direction, and Save, Discard and Stop managing still return to the project list exactly as before.

Preview: project-env-draft-survives-remount/design/preview-compact-dark-after-fix-edits-kept.png

The preview is the real Paseo 0.12.0 web client on an isolated daemon (`PASEO_HOME` and port 6862 under `/tmp/draft-remount-spike`, throwaway plugin id `draft-remount-spike`, fake `op`, `security` and `git` from `project-env/test/fakes`), disposable and operable: the plugin is installed on that daemon and each picture comes from `design/spike/scenario*.sh`. Whole page, not the control. Each pair is today's page next to the page with the prototype:

| State | Today (main) | With the store |
| --- | --- | --- |
| desktop 1280, edited (added LINEAR_API_KEY, typed a prompt) | `preview-desktop-dark-edited-before-resize.png` | same picture |
| resized to 400 px | `preview-compact-dark-before-fix-edits-lost.png` (project list) | `preview-compact-dark-after-fix-edits-kept.png` |
| grown back to 1280 px | `preview-desktop-dark-before-fix-edits-lost.png` | `preview-desktop-dark-after-fix-edits-kept.png` |
| edited at 400 px, grown to desktop | not drawn (lost, scripted check) | `preview-compact-dark-edited-at-400.png`, `preview-desktop-dark-after-fix-grown-from-400-kept.png` |
| unsaved new project, resized to 400 px | `preview-compact-dark-before-fix-new-project-lost.png` | `preview-desktop-dark-new-project-edited.png`, `preview-compact-dark-after-fix-new-project-kept.png` |
| Save at 400 px after a crossing | | `preview-compact-dark-after-fix-list-after-save.png` |
| Discard at 400 px after a crossing | | `preview-compact-light-after-fix-list-after-discard.png` |
| Stop managing dialog open, then crossing | | `preview-desktop-light-after-fix-stop-dialog-open.png`, `preview-compact-light-after-fix-stop-dialog-closed-edits-kept.png` |
| another client saved first, then Save | | `preview-compact-dark-after-fix-conflict-refused.png` (message "Settings changed on another client. Reload before saving again.") |
| light theme | `preview-desktop-light-edited-before-resize.png` | `preview-compact-light-after-fix-edits-kept.png`, `preview-desktop-light-after-fix-edits-kept.png` |

Scripted results of the runs (2026-10-22, counting accessibility-tree rows, not reading values): without the store the added row and the prompt are gone after 400 px (scenarios A, B and C: the row and the prompt are not found); with it both are found in every step; Save after a crossing wrote the draft to the settings file; Discard after a crossing left no draft on reopening; a Save after the revision changed elsewhere left the other writer's value in the file and kept the editor open.

### Design review

Design review: design/ideation-1.yaml
Design finding 1: Needs decision: not a new Captain decision; for FO. The Stop managing look and confirm are the scope of project-env-save-footer-danger-zone AC-2 (own section, destructive confirm, review finding 9), and this task leaves that card as it is; no action here unless FO rules otherwise.
Design finding 2: declined: the unsaved-change cue is project-env-save-footer-danger-zone AC-1; this task supplies `initial` and `draft` for its count.
Design finding 3: declined: what Save does with an unpicked row is unchanged and out of scope; the sticky footer is project-env-save-footer-danger-zone.
Design finding 4: declined: the duplicated connection fact is project-env-connection-collapse.
Design finding 5: declined: repeated "Save" wording belongs to project-env-save-footer-danger-zone, which rebuilds that section.
Design finding 6: declined: Test help text moves in project-env-test-summary-failure-mark (review finding 11); this task changes no text.
Design finding 7: declined: input widths are today's layout, reworked by project-env-field-pill-one-control; this task draws no new control.
Design finding 8: declined: the placeholder is today's and the whole name row goes in project-env-add-variable-one-step.
Design finding 9: declined: clipped references are project-env-field-pill-one-control (review finding 2).
Design finding 10: fixed: drew the list after Save and after Discard and the Stop managing dialog before and after a crossing (`preview-compact-dark-after-fix-list-after-save.png`, `preview-compact-light-after-fix-list-after-discard.png`, the two `stop-dialog` pictures); an open dialog closes on a crossing and the draft stays, written into the FAQ. Browse vault panel and Vault menu are not drawn: the first is removed by project-env-field-pill-one-control and a menu is host-drawn local state like the dialog. Loading and read-only host not drawn: this task adds neither.
Design finding 11: declined: button radius and weight are the host's controls and the field-pill task's rows.
Design finding 12: declined: touch target size of the host's `SettingsAction` and header arrow is not changed by this task.
Design finding 13: fixed: drew the desktop light picture (`preview-desktop-light-after-fix-edits-kept.png`); light new-project and conflict pictures are not drawn because the mechanism does not depend on the theme.

The reviewer read only the one named picture (its first limitation), so findings 10 and 13 came from the file list; pictures it did not open are not reviewed.

### Spike notes

Machine dependencies, declared: Paseo.app 0.12.0 CLI `/Users/kent/.local/bin/paseo`, Node 24.18.0, `agent-browser`, Paseo.app's `app-dist` as the web client. The spike plugin is a copy of `project-env/` plus `server/fakes` and `server/spike-world.ts`; `design/spike/` holds the scenario scripts, `fx.py` (fixture, names and references only), `prototype.patch` and the store. After editing the plugin the daemon needs `paseo --home <home> plugin reload <id>`; without it the old client bundle is served. Kent's daemon (`~/.paseo`, port 6767) and live plugin were never touched; no real Keychain, 1Password or `op` was reached.

### Acceptance evidence plan

- **AC-1**: current evidence is the scripted run and pictures above on a prototype; the implementation run on the real change repeats `design/spike/scenario.sh`, `scenario3.sh`, `scenario2.sh` and `scenario4.sh` against the built client and adds the store unit test (`project-env/test/open-project.test.ts`: `begin` then `update` keeps the draft and counts edits; `update(..., false)` leaves `edits`; `close` empties the store; `begin` twice yields different `session`s; `revision` is the one passed to `begin`). Falsified by: removing the store read in `Configured` makes the 400 px run return to the list.

Unresolved decisions for the Captain: none. Recorded consequence for his gate: a draft is also kept when he leaves the settings screen and returns inside the app.

## Stage Report: ideation

- DONE: Design the change your Scope names inside direction A5, with each acceptance criterion kept and given a reproducible evidence clause.
  `## Design` keeps the open project, draft, edit count and revision in a module-level store (`openProject`) that survives Paseo's re-mount at 720 px; AC-1 text is unchanged and its `Verified by:` names the scripted run, the unit test and the pictures. Cause measured: 720 px keeps the editor, 719 px drops it.
- DONE: Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px, plus the design review, with each finding dispositioned.
  18 whole-page pictures in `design/` from the real client on an isolated Paseo (port 6862, throwaway plugin id, fake op/security/git), before and after, dark and light; `Design review: design/ideation-1.yaml`, 13 findings, each with a `Design finding n:` line (2 fixed, 10 declined as sibling or unchanged scope, 1 for FO).
- DONE: Name every interface you need from a sibling rework task, and any decision the Captain must make (at most one), with a recommendation.
  Interfaces: save-footer reads `initial` and `draft` from the store; test-summary shows "Not tested since changes" when edits exist and results are gone; the four picker and pill tasks change the draft only through `openProject.update`; merge order recommended first. No Captain decision; one consequence recorded: a draft also survives leaving and re-entering the screen.
- DONE: AC-1 Resizing the window across the narrow-wide breakpoint keeps the open project and every unsaved edit.
  Current evidence on a prototype, not the implementation: scenarios A, B, C, D, E, F in `design/spike/` found the added row and prompt after every crossing with the store and not without it; the unit test and the run on the real change are not yet verified.

### Summary

The edits vanish because Paseo re-mounts the plugin screen at 720 px and the draft lived in that screen's React state; a module-level store survives because the plugin module loads once per page. The prototype keeps the draft in both directions, for a new project, and across Save, Discard and the revision-conflict refusal. Design finding 1 (Stop managing looks like Save) is for FO to route to the save-footer task; `design_surfaces.py check` reported "design surfaces presentable" with 13 findings, 2 fixed, 10 declined, 1 decision.

## Stage Report: implementation

- DONE: Implement the approved design: a module-level open-project store (initial, draft, edits, revision, session) that survives the settings screen re-mounting, cleared on Save, Discard, Stop managing and a full reload, exposing the interfaces the sibling designs named (saved, draft, close(), openProject.update(change, countsAsEdit)); the typed token, Test results and open dialogs are not kept.
  `project-env/client/open-project.ts` (`openProject.begin/update/close/get`, `useOpenProject`), `ProjectEditor` takes the open project as a prop and every edit goes through `openProject.update`; `onDone` closes the store. `initial` is what the footer task calls `saved`. Added beyond the design: optional `session` argument on `update` and `close` so a stale Import or Save completion cannot touch another project (roborev findings, below). Commits 1f7bc4b, 7f61bf9, 8831beb on `spacedock-ensign/project-env-draft-survives-remount`.
- DONE: Land the store unit test and the scripted resize run on an isolated Paseo so AC-1 passes with the evidence its clause names, with before and after whole-page screenshots at desktop and 400 px; the evidence must fail on main.
  `project-env/test/open-project.test.ts` (8 tests; each fails if its store behaviour is removed, e.g. dropping the session check fails the two stale-session tests). Run on final HEAD 8831beb: `implementation/run-after-worktree.log` 0 failed; same script on main 1adf630: `implementation/run-before-main-1adf630.log` 22 failed (719/400/1280 editor, row and prompt gone; Save after crossing writes nothing; conflict refusal lost; dialog case loses draft). Harness `implementation/harness/` (`setup.sh`, `resize.sh`), 26 whole-page pictures in `implementation/screenshots/` (before-/after-, a/b/c/d/e/f/g steps, 1280 and 400/719).
- DONE: Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `design_surfaces.py check` and `doc_impact.py <base> <candidate>`, then open the Draft PR.
  `npm test` 174 pass, 0 fail (final HEAD); `tsc --noEmit` exit 0; `design_surfaces.py check`: "design surfaces presentable"; `doc_impact.py 1adf630 HEAD`: 0 documents listed, nothing to record; `comment_ratio.py`: 1.4% (2 of 139), under the 5% maximum; roborev final `clean on 8831beb37; evidence=roborev:1026` (earlier runs: roborev:1023 and roborev:1025 each found one Medium, both fixed: an Import finishing after another project opened, and a Save finishing after another project opened). Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/22.
- DONE: AC-1 Resizing the window across the narrow-wide breakpoint keeps the open project and every unsaved edit.
  All clause scenarios pass on final HEAD (edit at 1280 then 719, 400, back; start at 400 and grow; new unsaved project; Save, Discard and revision-conflict refusal after a crossing) and fail on main; unit test passes.

### Summary

The open project and its draft moved out of the re-mounted screen into a module-level store; Save, Discard, Stop managing and reload clear it. Roborev twice found a stale async completion writing to or closing another project's draft; both are fixed with an optional session argument and tested, and the final gate is clean (the second re-run is the cap in the dispatch). Not drawn again: the sibling-facing note that `saved` is named `initial` in the store.

### Limits

- Evidence reads the accessibility tree for names and labels; no pixel diff. The harness uses the Paseo 0.12.0 desktop web client at `/Applications/Paseo.app`.
- The "before" run was made once on the first build of the harness; the "after" run was repeated on final HEAD. The before code (main 1adf630) did not change between them.
- Machine dependencies (declared): Paseo.app 0.12.0 CLI `/Users/kent/.local/bin/paseo`, Node 24.18.0, `agent-browser`; run `implementation/harness/setup.sh <worktree> <base sha>` then `resize.sh draft-after after <dir>` and `resize.sh draft-before before <dir>`.
- Temporary scaffolding: the daemon and `/tmp/draft-remount-impl` are throwaway, stopped after the run.

## Stage Report: validation

- DONE: Independently check candidate 8831beb37a6019519e8954f964b0cb9be8630e74 (PR iamcxa/kc-paseo-plugins#22, base main 1adf630) against AC-1 and the approved design: rerun the resize harness yourself on an isolated Paseo against both main 1adf630 (must fail) and the candidate (must pass), check the store unit tests fail when the store is removed or not cleared on Save, Discard and Stop managing, and check the session guard added for roborev findings; give a verdict.
  Verdict: PASSED (recommended). Own isolated daemon (port 6882, `/tmp/draft-remount-val`, throwaway ids, fake op/security/git), harness copied from `implementation/harness/` with path and port changed only. Candidate: 40 PASS, exit 0, "0 check(s) failed". Main 1adf630: 18 PASS, 22 FAIL, exit 1 (editor, added row and prompt gone at 719, 400 and back to 1280; new project lost; Save wrote nothing; conflict refusal lost; Stop-managing dialog case loses the draft), matching the implementation log. Same-checkout `npm test` 174 pass 0 fail, `tsc --noEmit` exit 0.
  Mutations (store unit tests, copy of the candidate, restored after): `begin` stores nothing fails 6 of 8; `close` a no-op fails 2; `update` ignoring the session fails 1; `close` ignoring the session fails 1; no edit count fails 1; revision overwritten fails 1.
  Mutations (runtime, two throwaway plugin copies of the candidate): `done()` not closing the store fails Save and Discard and Stop-managing steps (d, e, h: 8 checks); Stop managing not calling `onDone` fails 3 checks (h). My extra step H (confirm Stop managing at 400 after a crossing) passes on the candidate: list shown, project removed from the file, editor stays closed after growing to 1280. Not mutated at runtime: the session argument on Import and Save completion; that guard is proved at unit level only (two stale-session tests, each fails when its check is removed), no runtime stale-completion probe was run.
- DONE: Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
  `adr_lint.py docs/adr --since 60799d9`: "5 ADR file(s) checked, 0 legacy", exit 0 (the candidate adds no ADR; no Number guards section). Other package checks at the candidate: `comment_ratio.py 1adf630 8831beb` 1.4% (2 of 139), exit 0; `doc_impact.py` 0 documents, exit 0; `design_surfaces.py check` presentable, exit 0; `dispatch_records.py` 3 records complete, exit 0. Script below.
- DONE: Look at the whole-page screenshots at 1280, 719 and 400 px and record what the Captain should see; record every unverified obligation, without touching the live paseo-project-env install.
  Seen on the candidate: at 1280 the editor shows the project with the added LINEAR_API_KEY row ("No field picked") and the typed prompt; at 719 and at 400 the same editor, row and prompt (compact layout stacks inputs, the Remove and Save controls stay reachable); on main at 400 the page is only the project list ("demo-app, Edit" and "Add a project"). Plugin title reads the throwaway id. Live install and ~/.paseo not touched; daemon, agent-browser session and /tmp copies removed (nothing on 6882).

### Minimal acceptance script

Needs: Paseo.app 0.12.0 CLI `/Users/kent/.local/bin/paseo`, `agent-browser`, Node 24, the worktree `/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-draft-survives-remount` at 8831beb, and the state checkout `/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state`. Uses port 6872 and `/tmp/draft-remount-impl`; stop any run left over first. About 3 minutes.

1. `WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-draft-survives-remount; cd $WT/project-env && npm test 2>&1 | grep -E "^ℹ (pass|fail)"` expect `pass 174`, `fail 0` (use `rtk proxy npm test` if output is filtered; rerun the session-open deadline test alone if it is the only failure).
2. `H=/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-draft-survives-remount/implementation/harness; $H/setup.sh $WT 1adf630` expect a `server-id: srv_...` last line.
3. `$H/resize.sh draft-after after /tmp/draft-remount-impl-shots; echo exit $?` expect `RESULT after: 0 check(s) failed` and `exit 0`.
4. `$H/resize.sh draft-before before /tmp/draft-remount-impl-shots; echo exit $?` expect `RESULT before: 22 check(s) failed` and `exit 1` (main loses the edits).
5. `cd $WT && python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9; echo exit $?` expect `exit 0`.
6. Look at `/tmp/draft-remount-impl-shots/after-a3-400.png` (editor, LINEAR_API_KEY row and prompt at 400 px) and `before-a3-400.png` (project list only). Cleanup: `kill $(cat /tmp/draft-remount-impl/daemon.pid); agent-browser --session draft-remount-impl close; rm -rf /tmp/draft-remount-impl /tmp/draft-remount-impl-shots`.

Does not cover: a real 1Password or Keychain (fakes only), Paseo versions other than 0.12.0, a real phone rotation or drag-resize by hand, pixel-level layout, or the unsaved-changes warning (r3).

### Unverified obligations

- Session guard on stale Import and Save completion: unit level only; no runtime probe of a completion landing after another project opened.
- Real Keychain, 1Password and `op` never reached; Token check, Test and Browse vault behaviour across a crossing not exercised (Test results and an open picker are deliberately not kept, per design).
- Harness reads the accessibility tree (names, labels), not pixels; the screenshots were looked at by me, not diffed.
- Not exercised: leaving the settings screen and returning inside the app keeps the draft (design consequence recorded for the Captain, not run in my harness); the sibling interfaces (`initial` read by the save-footer task) are design-only.
- PR #22 CI and merge state not checked in this stage; live paseo-project-env install not touched, so nothing here shows the change working in Kent's own Paseo.

### Summary

PASSED: the candidate passes every resize, Save, Discard, Stop managing and conflict step on an isolated Paseo and the same harness fails 22 checks on main 1adf630; mutating the store, the close-on-exit paths and the session check each makes a test or runtime step fail. Package checks all exit 0 (adr_lint exit 0). Open limits are above, chiefly that the roborev session guard is unit-proved only.

## FO records

Review rounds at the validation gate: roborev 1 (clean, roborev:1026); Codex 1 (clean, summary:6335926273).
Delivery reading: FO read 「先做完讓我試試看好了」 as a go-ahead to finish and merge the A5 tasks, not a hold, and told the Captain so in chat on 2026-10-22, inviting objection.
