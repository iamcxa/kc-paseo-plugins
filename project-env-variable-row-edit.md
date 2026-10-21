---
id:
title: Each variable is one row with its field, Remove and last Test result
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1.5
journey-story: add-remove-variable
journey-required-tasks: '["project-env-variable-row-edit"]'
journey-mapping-complete: true
gates:
    version: 1
    records:
        - id: gate:project-env-variable-row-edit:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-variable-row-edit-backlog-1
              briefing:
                id: briefing:project-env-variable-row-edit:backlog:attempt-1:revision-1
                digest: sha256:0206a1bba6667ba86102e83a22ccdfb37f9636fb30efa5d6976585321881b1b8
                room-ref: ./project-env-variable-row-edit/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-variable-row-edit:backlog:1
                briefing: briefing:project-env-variable-row-edit:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-21T08:40:40.237397Z"
                decision: approve
                reason: 'Captain 2026-10-21: 「准」 — accepts this release r1.5 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-21T08:41:59Z
---

Release r1.5 of the paseo-project-env journey: on his own Mac, Kent stores a token only after it is checked, sees why a token fails, edits each variable where it sits, and sees test results that match his draft; his own use accepts it. Captain, 2026-10-20: 「我覺得UI不夠直覺」. Captain accepted this task list on 2026-10-21: 「可以」. Today all Remove buttons sit after all fields, Add accepts reserved names, and the name input is not cleared after Add.

## Scope

In: the variables card laid out one row per variable holding its field, its Remove button and its last Test result (Captain 2026-10-21 「可以」, layout recommended as one row per variable); Add refuses a reserved name with the reason, using isReservedName, with DYLD_* and LD_PRELOAD added to the reserved set and ADR 0004 amended (Captain 2026-10-21, journey add-remove-variable/q5); the name input clears after Add. Settled in ideation: journey add-remove-variable/q4 and q7. Non-goals: field references by ID (r1b). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: Each variable is one row holding its field, its Remove button and its last Test result.
Verified by: Kent's own use on his Mac, with a screenshot in the PR.

**AC-2**: Add refuses every reserved name, including DYLD_* and LD_PRELOAD, and says why.
Verified by: a unit test over the reserved set, and Kent's own use.

## FO alignment

Surfaces: ui
Visible change: The variables card shows one row per variable with its own Remove and Test result.
Direction alignment with the Captain: done — the Captain chose one row per variable on 2026-10-21 (「可以」 to the recommended layout).
Result: one row per variable holding its field, Remove button and last Test result.
Release review: paseo-project-env/r1.5 at 9489e13

## Design

### PRFAQ

**Press release.** Kent opens the Environment variables card and sees each variable as one row: its name, the reference it reads, a Remove button and the result of the last Test, side by side. He no longer matches a name in one list to a Remove button in another, and a Test result no longer sits in a card of its own. Typing a name Paseo or the agent owns, such as `PATH` or `DYLD_INSERT_LIBRARIES`, is refused on the spot with the reason.

**FAQ.**
- *What did the Captain decide?* One row per variable holding its field, its Remove and its last Test result (2026-10-21, 「可以」); reserved names grow by `DYLD_*` and `LD_PRELOAD`, not `ANTHROPIC_*` (journey add-remove-variable/q5).
- *Does Remove save?* No. Removing a variable edits the draft; Save writes it and Discard throws it away, so per-row Remove needs no confirmation. The project-level button is the one that saves at once; it is renamed and asks first (q7 below).
- *Where does Test live now?* In the variables card, in its own row under the last variable, shown only when the project has a variable. Its results appear on the rows. The old results list and the card named "Check and save" are gone; the card that keeps Save, Discard and Stop managing is named "Save".
- *Which names are refused?* The 16 names ADR 0004 reserves, any name starting `DYLD_`, and `LD_PRELOAD`. Refusal also covers a duplicate and a bad shape, with one message each.
- *Is the whole picture drawn from a real run?* Yes: `spike/` on an isolated daemon, the real Paseo web client, fake `op`, `security` and `git`; not drawn: the Paseo desktop app and phone app.

### What changes (read from `project-env/` on main at 487b9b0, 2026-10-21)

Today `client/settings-screen.tsx` draws every reference field, then every `Remove NAME` action, then the add row; Test and its results list sit in "Check and save"; Add is gated by an inline regex and a duplicate check with no message; the name field keeps its text after Add; Import adds every name it finds, reserved or not.

```mermaid
flowchart TD
  A[Kent opens a project] --> B[Variables card: one row per variable]
  B --> C{Kent acts}
  C -->|edits a field| D[draft changes; row keeps its last result until T4 clears it]
  C -->|Remove on a row| E[row leaves the draft; nothing saved]
  C -->|Test| F[rows show set, failed with reason, or Not applied]
  C -->|types a new name| G{refusal name existing}
  G -->|reserved, duplicate or bad shape| H[reason under the name field; Add stays off]
  G -->|accepted| I[Add enabled]
  I --> J[row appended, name field cleared]
  C -->|Import| K{each name}
  K -->|reserved| L[skipped and named in the Import help line]
  K -->|new and allowed| M[row appended]
  C -->|Stop managing| N[dialog: deletes now, token stays]
  N -->|Keep| B
  N -->|Stop managing| O[project removed and saved at once]
  C -->|Save or Discard| P[leave the editor]
```

### UI proposal

UI proposal: The Environment variables card shows one row per variable: the variable name on the left with one line under it for its last Test result (set, failed with a plain reason, or for a reserved name "Not applied" with the reason), the reference field in the middle and a Remove button at the right end of the same row; a Test button sits in its own row under the last variable, and the separate results list is gone; Add refuses a reserved name and says why under the name field with the Add button off, and the name field clears after Add; Import skips reserved names and names them in its help line; the project-level button is renamed Stop managing and opens a confirmation dialog; after Browse vault each field becomes a pill that opens a list of fields.

Preview: project-env-variable-row-edit/design/preview-desktop-dark-tested.png

The main picture is the one above. The proposed design is the set `design/preview-*.png` in this task's folder, taken from a real run: the spike plugin in `spike/` (the real settings screen with the new rows, fake `op`/`security`/`git` from `test/fakes`) on a throwaway daemon (own home, port 6812, plugin id `row-edit-spike`, no model provider), driven through Paseo's own web client with a headless browser. It is operable: while the daemon is up, `http://127.0.0.1:6812` opens the screen at Settings, Plugins, Actions, Project environment, and Add, Remove, Test, Import, Browse vault and Stop managing all work. Disposable: the daemon, the plugin and `/tmp/variable-row-edit-spike-r15` are removed at the end of ideation (teardown recorded in the Stage Report); `spike/` keeps the sources and the commands to run it again. Pictures: desktop dark saved (before Test), tested, add refused (`DYLD_INSERT_LIBRARIES`), import skipped, stop-managing dialog, browse loaded, browse picker, 12 variables with a 53-character name and an 88-character reference, empty; desktop light tested and add refused with a duplicate; compact (390 px) dark saved, tested, 12 long, add refused, stop-managing dialog.

Row composition (observed 2026-10-21, Paseo 0.12.0 web client): `SettingsRow` draws its `children` at the right end of the row, label and hint on the left, and stacks them under the label at compact width; `SettingsInput` and `SettingsSelect` accept `children` in their types but draw none, and a `SettingsSelect` nested inside a `SettingsRow` truncates the reference to `op://Dev/…` and stretches the row. So a row is a `SettingsRow` whose children are the field and a Remove pressable; after Browse vault the field is a pill (`RefPicker`) that opens the host `Modal` with the fields listed, which keeps the whole reference visible. The old `SettingsSelect` swap is not used.

### Add, Import and saved variables

`project-env/shared/config.ts` gains three pure functions beside the existing predicate: `reservedReason(name): string | null` (the one table: agent names, plugin name, Paseo names, the `DYLD_` prefix and `LD_PRELOAD`), `isReservedName(name)` (its boolean view, unchanged signature, still used by `resolveProject` and `openSession`), `refusal(name, existing): string | null` (bad shape, reserved, duplicate; null when acceptable or empty) and `splitImported(names, existing): { add, skipped }`. The screen disables Add on a non-null refusal, shows it under the name field, and Add's handler checks it again. Reasons shown: "the agent needs its own value to run" (PATH, HOME, NODE_OPTIONS), "this plugin uses it to reach 1Password" (OP_SERVICE_ACCOUNT_TOKEN), "Paseo sets or removes it after plugins run" (the twelve Paseo names), "it makes the agent load other code" (`DYLD_*`, `LD_PRELOAD`); the message is `NAME is reserved: reason. The agent keeps its own value.` Run on the spike copy, 2026-10-21: the 9 sampled reserved names (including `LD_PRELOAD`, `DYLD_INSERT_LIBRARIES`) return a refusal and `DATABASE_URL`, `LD_LIBRARY_PATH`, `path`, `ANTHROPIC_API_KEY`, `DYLDX` return null.

**q4 (journey add-remove-variable/q4): does the refusal also cover Conductor import and variables saved before this release?** Import: yes, it follows ADR 0004's consequence that refusing on Add reuses the predicate; reserved names are skipped and the help line names them (picture: import skipped; a name already in the project is skipped silently, as today). Saved variables: no migration and no settings-schema change, so the screen still loads a project that holds `PATH` or, after this release, a `DYLD_*` name; the row shows "Not applied: reason" in place of a Test result, always, because session open already skips it (ADR 0004; verified by `test/session-open.test.ts` "neither applies nor blanks a reserved name, and reports it failed"), and Remove works. Consequence to know: an existing variable named `DYLD_*` or `LD_PRELOAD` stops being applied at the next session open after release. None is known to exist.

**q7 (journey add-remove-variable/q7): should the project's Remove, which saves at once, change?** Per-variable Remove: no confirmation, because it edits the draft and Discard reverts it. The project-level button deletes saved configuration at once, and with a Remove on every row it would be the one button of that name that does not wait for Save; so it is renamed "Stop managing", its help line says it deletes the project's variables and prompt now and that the token stays, and it opens a dialog (host `Modal`) with Keep and Stop managing. Alternatives not chosen: leave it (an unconfirmed destructive save beside twelve harmless ones); make it a draft edit saved by Save (a new "project removed" draft state, more than this task).

### Existing-code check

Boundary: the variables card, the name check and the reserved set in `project-env/` on main. Two searches, 2026-10-21: `grep -rn isReservedName project-env --exclude-dir=node_modules` (shared/config.ts, server/secrets.ts, server/session-open.ts, test/secrets.test.ts) and `grep -rln "reserved" project-env --exclude-dir=node_modules` (adds shared/cause.ts, the tests). Completeness: the predicate works through the journey at session open and Test (session-open and failure-reason tests); the Add gate is a regex in JSX with no message (not found: no refusal, no reason). Need: Captain ruling 2026-10-21 (q5) and ADR 0004's consequence line. Decision: extend `isReservedName` into one table with reasons rather than add a second list; reuse `rowHint` and `Modal`, `Icon` and `TextInput` from `@getpaseo/plugin/client/react-native`. Unknowns: other consumers of `isReservedName` outside the repository, and the desktop and phone apps (only the web client of the same Paseo build was driven).

### ADR 0004 amendment (draft; no number change, no new file)

Amend `docs/adr/0004-reserved-variable-names-are-skipped-not-blanked.md` at implementation: under Decision add "**Amendment, 2026-10-21** (Captain, journey add-remove-variable/q5, 「可以」): the reserved set also holds every name starting `DYLD_` and `LD_PRELOAD`, which make a process load other code; `ANTHROPIC_*` is not reserved, because a person may set it on purpose. The set is now a table of exact names and one prefix, still behind one predicate, `isReservedName` in `project-env/shared/config.ts`, which has a reason for each class, `reservedReason`." Under Consequences replace the Add line with "Add, Conductor import and the variables card use the same table: Add and import refuse a reserved name with its reason; a saved reserved variable stays, shows 'Not applied' and is skipped at session open." and add "An existing variable named `DYLD_*` or `LD_PRELOAD` stops being applied at the next session open." Status stays Accepted.

### Acceptance evidence plan

- **AC-1** (not yet verified; no implementation). Current evidence: the operable spike on the real Paseo web client shows each variable as one row with its field, Remove and last Test result, at desktop and 390 px width (`design/preview-*.png`). To prove: on Kent's Mac, open Settings, Plugins, Project environment on the branch's install (throwaway plugin id, never his live `paseo-project-env`), edit a project with at least three variables, press Test, and attach a screenshot showing every row with its field, Remove and result; press Remove on one row and see only that row go. Reproduce the picture with `spike/` (see Spike notes). A unit test cannot prove JSX composition, so none is claimed.
- **AC-2** (not yet verified in code). Current evidence: `refusal` run in the spike copy as stated above. To prove: `project-env/test/variable-name.test.ts` (new) with a table of every name in the ADR 0004 set plus `DYLD_INSERT_LIBRARIES` and `LD_PRELOAD`, each must return a refusal containing the name and a reason, `DATABASE_URL`, `LD_LIBRARY_PATH` and `ANTHROPIC_API_KEY` must return null, and `isReservedName(n) === (reservedReason(n) !== null)` for the table; it fails if one name leaves the table, if the `DYLD_` prefix check or `LD_PRELOAD` is dropped, or if a reason is empty. Plus `test/session-open.test.ts` gains a `DYLD_INSERT_LIBRARIES` case asserting it is reported `reserved-name` and the fake `op` log shows no call for it, a `splitImported` case (reserved skipped and named, existing skipped, rest added), and Kent typing `PATH` in Add on his Mac and seeing the reason with Add off.

### Interface for siblings

T4 (project-env-test-results-match-draft, after this task): the row's result is `test.data?.results.find((r) => r.name === v.name)` drawn through `rowHint`; T4 clears it by `test.reset()` on a draft change and owns the sentence that set does not prove acceptance. T1, T2, T5 (token, paste, browse): this task leaves their rows alone; T5 keeps its error in the Browse vault action row and feeds `RefPicker` through `refs.data`.

### Design review

Design review: design/ideation-1.yaml

Design finding 1: Needs decision: a row edited after Test keeps its result until T4 clears it (T4 AC-1 already owns that, and T4 runs after this task); recommendation: leave it to T4 and merge T4 before Kent accepts r1.5.
Design finding 2: Needs decision: the unsaved-changes cue is the Captain's deferred story unsaved-warning (release r3) and stays out; recommendation: add one sentence to the Test row hint here, "Checks the variables as edited here, saved or not", which this preview does not yet show.
Design finding 3: declined: the page title, Back link and the token and vault card order are the host's chrome and today's layout, outside this task.
Design finding 4: declined: the action rows and the separate name field and Add button are today's rows from the host kit; merging them is not in the accepted scope.
Design finding 5: declined: the token row belongs to project-env-token-works-cause (T1).
Design finding 6: declined: ADR 0004 rules a reserved name a failed variable, so it takes the failed tone; the saved-state red line is the intended cue that the variable does nothing.
Design finding 7: declined: the word set and its explanation belong to T4 (AC-2 there); the words come from `rowHint`.
Design finding 8: declined: the host row grows by one line when a result appears; pinning the height would need fixed-height rows that break long names (see twelve-long).
Design finding 9: declined: the name field is the host's input at its own width; the reference field is wider so references stay readable.
Design finding 10: declined: the Captain asked for a Remove button on each row; it uses the host button look, and Kent's own use in AC-1 judges its weight.
Design finding 11: declined: the host kit exports no bare select; the pill shows the full reference where the nested host select truncated it (observed, see Row composition).
Design finding 12: declined: the host action row has one style; Stop managing is renamed and confirmed (q7), which marks it apart from Save.
Design finding 13: declined: the host Modal offers no danger style; the dialog names the project as the section title does, and the plugin id in the page title is a spike artefact.
Design finding 14: declined: the message uses the host input's error slot; the placeholder and focus ring are the host's, and the duplicate refusal is drawn in preview-desktop-light-add-refused-duplicate.png.
Design finding 15: declined: Import's help line is the host's text slot; the skipped names are named there, and marking added rows is not accepted scope.
Design finding 16: declined: Browse vault listing states belong to T5 and the r1b rebuild (pick-field); today's select also replaces free text.
Design finding 17: declined: the first row of an empty card is the name field with its label, which already says what to do.
Design finding 18: declined: the host input scrolls long values and the button reads Testing… while a run is on; a failure count is not in scope.
Design finding 19: declined: control sizes are the host's, the same as today's screen at 390 px.
Design finding 20: declined: the pill opens a modal list because the host exports no anchored menu to plugins; the chevron states that it opens a choice.
Design finding 21: fixed: drew the missing states, compact add-refused and stop-managing dialog (a bottom sheet) and light add-refused with a duplicate, as preview-compact-dark-add-refused.png, preview-compact-dark-stop-confirm.png and preview-desktop-light-add-refused-duplicate.png.

### Spike notes

Machine dependencies, declared: Paseo.app 0.12.0 CLI at `/Users/kent/.local/bin/paseo`, Node 24.18.0, `agent-browser`, Paseo.app's `app-dist` as the web client. Run (2026-10-21): `S=/tmp/variable-row-edit-spike-r15`; put `spike/plugin/` at `$S/plugin` with the repository's `project-env/node_modules` linked in; `spike/home-config.json` is the daemon config (port 6812, plugins on, relay, speech and MCP off); `PASEO_HOME=$S/home PASEO_LISTEN=127.0.0.1:6812 PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist paseo daemon run --home $S/home`, then `paseo --home $S/home plugin install $S/plugin`. `spike/fx.py` writes the project fixtures (names and references only, no value); `spike/open-editor.sh`, `ref.sh` and `ab.sh` drive the browser. Facts learned: Paseo's plugin loader rejects a module outside `client/`, `server/` or `shared/`, and `import.meta.dirname` and `import.meta.url` are undefined at runtime, so the spike keeps the fakes under `server/fakes` and hardcodes their path. No real Keychain, 1Password or model provider was touched; Kent's daemon (`~/.paseo`, port 6767) was never written, only listed.

## Journey answers for the map

- add-remove-variable/q4: answered as above (import skips and names reserved names; saved ones stay, show Not applied, are skipped at session open; no migration).
- add-remove-variable/q7: answered as above (row Remove unconfirmed because it edits the draft; project button renamed Stop managing and confirmed).
- add-remove-variable/q2: "the 16 reserved names" becomes the 16 names plus every `DYLD_` name and `LD_PRELOAD` (q5 ruling); the map itself is not edited here.
- add-remove-variable/q1: removals sit on the row of the variable they remove.

## Stage Report: ideation

- DONE: Design the variables card as one row per variable holding its field, its Remove button and its last Test result (Captain 2026-10-21, 「可以」); settle journey add-remove-variable/q4 (does the reserved refusal cover Conductor import and saved variables) and q7 (Remove without confirmation).
  `## Design` composes the row from `SettingsRow` children (observed in the real client); q4: import skips and names reserved names, saved ones stay with "Not applied", no migration; q7: row Remove unconfirmed (draft only), project button renamed Stop managing with a dialog.
- DONE: Design Add refusing every reserved name with its reason via isReservedName, with DYLD_* and LD_PRELOAD added, and draft the ADR 0004 amendment (no number change).
  `reservedReason` table beside `isReservedName`, `refusal`, `splitImported`; draft under "ADR 0004 amendment"; run on the spike copy: 9 reserved names refused, 5 allowed names null.
- DONE: Keep AC-1 and AC-2 with reproducible evidence clauses and produce the artifact the ui surface owes, including how T4's results sit in the row.
  Artifact: `UI proposal:` and `Preview:` lines, 17 real-client pictures in `design/`, spike sources in `spike/`, review `design/ideation-1.yaml`; T4 interface is the per-row `test.data` lookup that T4 clears with `test.reset()`.
- DONE: AC-1 — each variable is one row with its field, Remove and last Test result.
  Not yet verified: no implementation. Current evidence: the operable spike pictures; plan is Kent's use on his Mac with a screenshot.
- DONE: AC-2 — Add refuses every reserved name, including DYLD_* and LD_PRELOAD, and says why.
  Not yet verified in the repository: plan is `test/variable-name.test.ts` (falsified by dropping a name, the `DYLD_` prefix or `LD_PRELOAD`, or an empty reason) plus a session-open case and Kent's use; current evidence is the spike-copy run only.
- DONE: Run `design_surfaces.py check` and cite its output.
  `design surfaces presentable`; `design review design/ideation-1.yaml: 21 findings, 1 fixed, 0 criteria, 18 declined, 2 decisions` (exit 0, before this report was appended).

### Summary

Each variable is one row built from `SettingsRow` (field and Remove at the right, last Test result under the name); Test moves into the variables card under the last row. Add refuses reserved, duplicate and malformed names under the field with the reason; Import skips reserved names; saved reserved variables stay and read "Not applied"; Stop managing replaces the project Remove and asks first. Two Needs decisions from the design review (both small, recommendations given): a row edited after Test keeps its result until T4 clears it, and whether to add one "checks the draft, saved or not" sentence to the Test row. Not done on purpose: ADR 0004 file edit and any repository code (ideation writes none). The spike daemon, throwaway plugin and `/tmp/variable-row-edit-spike-r15` are removed; `paseo plugin ls` on Kent's daemon still shows `paseo-project-env` running, unchanged. Known limit: the in-row field picker is new code (a host `Modal` list), the price of keeping Browse vault inside one row, and r1b may replace it.
