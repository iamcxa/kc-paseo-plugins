---
id:
title: Test shows a summary line and marks failed rows with a red border and (!)
status: done
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree: .worktrees/spacedock-ensign-project-env-test-summary-failure-mark
pr: pr-merge:27
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
                state: consumed
        - id: gate:project-env-test-summary-failure-mark:ideation
          stage: ideation
          attempts:
            - id: gate-attempt:project-env-test-summary-failure-mark-ideation-1
              briefing:
                id: briefing:project-env-test-summary-failure-mark:ideation:attempt-1:revision-1
                digest: sha256:d2bd165b77248ca78a04ec7a71f650572d3beb3c79e46cb468082b4c13830dc3
                room-ref: ./project-env-test-summary-failure-mark/review/ideation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-test-summary-failure-mark:ideation:1
                briefing: briefing:project-env-test-summary-failure-mark:ideation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-22T07:45:20.099608Z"
                decision: approve
                reason: 'Captain 2026-10-22: 「准」 — accepts this A5 rework design and its acceptance criteria into implementation, including the recommendation stated in this gate''s question.'
              application:
                target-stage: implementation
                state: consumed
        - id: gate:project-env-test-summary-failure-mark:validation
          stage: validation
          attempts:
            - id: gate-attempt:project-env-test-summary-failure-mark-validation-1
              briefing:
                id: briefing:project-env-test-summary-failure-mark:validation:attempt-1:revision-1
                digest: sha256:6097dc877303707895c5c7d3f81e4ff3bacb3664098b0bf2216fd4d8b41732ff
                room-ref: ./project-env-test-summary-failure-mark/review/validation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-test-summary-failure-mark:validation:1
                briefing: briefing:project-env-test-summary-failure-mark:validation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T04:05:46.974405Z"
                decision: approve
                reason: 'Captain 2026-10-23: 「准」 — approves delivery of PR #27 at 782ac4c per the gate question.'
              application:
                target-stage: done
                state: consumed
started: 2026-10-22T04:16:52Z
verdict: PASSED
completed: 2026-10-23T04:12:52Z
archived: 2026-10-23T04:12:52Z
---

Settings-screen rework of release r1.5 of the project-env plugin. Design reference: the design-director review (ux-review-r1.5/index.html) and direction A5 (ux-review-r1.5/direction-a5.html, shots/a5-*.png) in the state checkout; Captain approved A5 on 2026-10-22 (「就這樣」) after 「這個 UX 完全不行」, and the Add flow on 2026-10-22 (「可以」).

## Scope

In: per-row status text is removed; a failed row gets a red pill border and a (!) after the pill whose plain one-sentence reason opens on hover and on tap or click; the Variables header shows a summary next to Test ("2 failed · 3 set", "All 5 set", "Not tested since changes"); editing a row clears only that row's mark (review findings 6, 7; A5). The tooltip must not cover a neighbouring row's name or (!). Supersedes project-env-test-row-draft-note. Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: After Test, failed rows show a red border and a (!) whose reason opens on hover and on tap, and the header shows the failed and set counts.
Verified by: unit tests in `project-env/test/test-marks.test.ts` of the summary text in every state (no Test yet, Testing…, N failed · M set, all failed, N set · K no field, All N set, Not tested since changes, no variables) and of one capitalised, full-stopped sentence for every entry of `CAUSES`; then on an isolated Paseo (own `PASEO_HOME` and port, throwaway plugin id, fake `op`, `security`, `git`) at 1280 px and 400 px after Test, with a failed first row, middle row and last row and the longest sentence (the `unexpected` cause): the failed rows have a red border and a (!); the reason opens on hover (1280 px only; a touch screen has no hover) and on click or tap; the measuring script `measure.js` finds the open reason overlapping no other row's name, (!), field control or Remove button, and at most two lines; Tab reaches the (!) and Enter opens it; a click 18 px outside the glyph still opens it; a second click, another (!) or Test closes it; the field name of the failed row is readable beside the open reason in the 1280 px screenshot; whole-page screenshots at both sizes, dark and light, with a reason open. Falsified by: status text back on the row, or a reason that covers another row (the script lists what it covered).

**AC-2**: Editing one row clears only that row's mark and sets the summary to "Not tested since changes".
Verified by: unit tests that editing one row's reference clears that row's mark only and the summary reads "Not tested since changes"; that an account or vault change clears every mark; that an added or removed row, or an edit made while Test runs, shows no mark for that row; and that editing back to the tested reference restores the marks; then `ac2.sh` on the isolated Paseo reading the accessibility tree (the summary text and the rows that carry a (!)) and screenshots at both sizes. Falsified by each of three changes to the prototype failing a named unit test: ignoring the vault, ignoring edits in the summary, clearing every mark on any edit.

## FO alignment

Surfaces: ui
Visible change: Failed rows get a red border and (!) with the reason on hover or tap, and Test shows a summary line.
Direction alignment with the Captain: done — the Captain chose direction A5 and the Add flow on 2026-10-22.
Result: direction A5 (ux-review-r1.5/direction-a5.html); every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a rework of the r1.5 settings screen the Captain ruled on 2026-10-22; it adds no journey story.

Map footprints: not needed: no journey story or open map question is attached to this rework task.
Reviewer: kc-dev-flow-2:engineering-reviewer not run 2026-10-23: the replacing amendment's effect was ruled by the Captain at validation, judged by validation cycle 2 at 782ac4c, and approved by him for delivery after he saw the result; the task is merged (40849b4), so a review of whether it withdraws what he approved would not change the build. Raised again at his UAT.
## Design

### PRFAQ

**Press release.** After Kent presses Test, the Variables header says what happened in a few words: "2 failed · 3 set". The rows stay quiet. A failed row's field control gets a red border and a red (!) after it; pointing at the (!) or clicking it shows one plain sentence saying why. When Kent edits a row, only that row's mark goes away, and the header says "Not tested since changes" so nobody reads an old result as current.

**FAQ.**
- *Which text goes away?* The status line under each variable's name ("set", "failed: …", "No field picked", "Not applied: …"). The reason moves into the (!); "set" is the absence of a mark; a row with no field is the field-pill task's dashed "Pick a field" control.
- *When does a row show its mark?* Only while the row's reference, the service account and the vault are what Test was sent. This is computed from the draft and the sent copy, so no edit path has to remember to clear anything, and a result that arrives late for an edited row is simply not shown. It replaces the rule merged with project-env-test-results-match-draft (any edit hides every result), which Direction A5 and review finding 6 reject. Two consequences, recorded for the gate: editing a row back to the tested reference brings its mark back, and an account or vault change still hides every mark because the results came from a different token.
- *What does the header say?* Nothing before the first Test. "Testing…" while it runs. After it, while the draft is exactly what was sent: "N failed · M set", "All N set" only when every row is set, and "· K no field" appended for rows that have no field picked (a deviation from the A5 mock, which left such rows out of the count; without it "All 5 set" would sit above a "Pick a field" row). After any difference: "Not tested since changes". A saved reserved name (for example `DYLD_INSERT_LIBRARIES`) always carries a (!) reading "Not applied: it makes the agent load other code." and counts as failed.
- *Where does the sentence come from?* `causeText` capitalised with a full stop (`causeSentence` in `shared/cause.ts`), the same source the missing-variables notice uses, so the (!) and the notice never differ. `causeText` itself is unchanged.
- *Why does the bubble sit inside the row?* The Scope forbids covering a neighbour's name or (!). A floating bubble below the (!) does that at 400 px, where the next row's name is directly under the field. So at 1280 px the bubble opens to the left of the (!) on the same row (hover or click, one open at a time), and at 400 px the sentence opens as a line under the field (click or tap; there is no hover on touch).
- *Where does the Test explanation go?* Behind the (i) beside the title (review finding 11), with "Set means a value came back from 1Password; it does not prove the service accepts that key." kept from project-env-test-results-match-draft. The sentence "Checks the variables as edited here, saved or not." from project-env-test-row-draft-note is dropped with that task, as Scope says: the summary now says it. FO closes that task as superseded.
- *Existing-code check (read from `project-env/` on main at 1adf630, 2026-10-22):* complete and working: Test, causes, the server. Needed: Captain's A5 (2026-10-22 「就這樣」). Missing: a per-row rule (today `edits` counts every change and hides all results) and a place for the reason that is not a text line. The host offers `SettingsSection trailing` and `info` (a string, shown as a host tooltip on hover or tap; observed 2026-10-22) but no tooltip for a row (`grep` over `@getpaseo/plugin/dist/client/ui.d.ts` and `react-native.d.ts`: Modal, Toast, Icon only), so the bubble is a small plugin component. Nothing is replaced: the Test row, `variableLine` and its tests go because nothing calls them after this change; `rowHint` stays because `session-open.test.ts` and `failure-reason.test.ts` assert through it.

### What changes

```mermaid
flowchart TD
  A[Kent presses Test] --> B[run = the draft that was sent + its results; header says Testing]
  B --> C[results arrive]
  C --> D{for each row: same reference, account and vault as sent?}
  D -->|yes, failed| E[red border + (!) with the cause sentence]
  D -->|yes, set| F[no mark]
  D -->|no| F
  C --> G{draft identical to the one sent?}
  G -->|yes| H[header: N failed · M set / All N set / + K no field]
  G -->|no| I[header: Not tested since changes]
  E --> J{Kent points at or presses the (!)}
  J -->|1280 px| K[bubble left of the (!), inside its own row]
  J -->|400 px| L[sentence under the field]
  K --> M[closes on second press, another (!), Test, or pointer leaving if only hovered]
  L --> M
  F --> N[Kent edits a row]
  E --> N
  N --> D
  N --> G
```

Code shape for implementation (the prototype is `design/spike/preview.diff` and `design/spike/test-marks.ts`): a new `shared/test-marks.ts` (`rowReason`, `summaryParts`, the `Run` type) with `causeSentence` added to `shared/cause.ts`; `ProjectEditor` keeps `run` (the sent project and its results, returned by the Test mutation) and one `openMark` name; a `FailureMark` component in `client/`; the Variables section gets `trailing` (summary, Test) and `info`; the Test row, the per-row hint and error, `variableLine` and its tests are removed. Server and `causeText` do not change.

### Interfaces named from sibling tasks (none designed here)

- **project-env-field-pill-one-control**: the field control takes a failed look (red `statusDanger` border) and every row reserves a 32 px slot to its right for the (!), so the control keeps one width whether or not a mark shows; the control must be able to shrink (today's fixed 260 px control plus the slot overflowed Remove at 400 px, and the prototype lets it shrink). Where "No field picked" goes: the dashed "Pick a field" control; reserved-name text: the (!) through `rowReason`. Replacing Remove by ✕ (A5 mock) is in none of the seven task scopes; FO should give it to this task's neighbour. The bubble can cover the right part of its own control while open; a wider control keeps the field text readable.
- **project-env-add-variable-one-step**: the Variables header `trailing` slot is shared: summary, then Test, then "+ Add" (the prototype draws a stand-in "+ Add"; at 400 px Test and "+ Add" fit beside the title only because the summary drops to its own line under it, since "Not tested since changes" would not fit). Whoever merges second adds its control to the one header.
- **project-env-draft-survives-remount**: its note asks that Test results are not kept and the header read "Not tested since changes" after a remount. Recommended instead: its store also holds `run` (the `Run` type), because `run` holds names, ok and cause only and no secret, so marks and summary survive a remount. If it does not, there is no `run` after a remount and the header shows nothing, never "All set"; "Not tested since changes" needs a Test to have happened first.
- **project-env-save-footer-danger-zone**: "N unsaved" and "Not tested since changes" are different facts and may stand together. Its Save must not clear `run`.
- **project-env-field-picker-grouped, -connection-collapse**: picking a field is an edit and clears that row's mark by the rule above; Change on the connection card that alters the account or vault clears every mark by the same rule. Neither needs an interface.

### UI proposal

UI proposal: After Test, a failed row's field control has a red border and a red (!) after it, and its status text is gone; hovering or clicking the (!) opens its one-sentence reason in a bubble inside the row at 1280 px, and tapping it shows the sentence under the field at 400 px. The Variables header carries a summary beside Test ("2 failed · 3 set · 1 no field", "All 5 set", "Testing…", "Not tested since changes"; on its own line under the title at 400 px), and editing one row clears only that row's mark and turns the summary to "Not tested since changes". The Test explanation sits behind the (i) next to the title.

Preview: project-env-test-summary-failure-mark/design/preview-desktop-dark-tip-open.png

The pictures are the real Paseo 0.12.0 web client on an isolated daemon (`PASEO_HOME` and port 6867 under `/tmp/pe-tsfm`, throwaway plugin id `pe-tsfm`, fake `op` and `security` from `project-env/test/fakes`, no real token, Keychain item or secret), disposable and operable, drawn from the build in `design/spike/preview.diff` on main at 1adf630. Every picture is the whole page. Everything except this task's change is today's page drawn as is, and three sibling items are stand-ins: the field controls show today's raw paths (Browse vault pressed so they are pickers; the pill is project-env-field-pill-one-control's), "+ Add" does nothing (project-env-add-variable-one-step), and the connection card and Save rows are today's (project-env-connection-collapse, -save-footer-danger-zone). The composition of all of them is the A5 mock (`ux-review-r1.5/direction-a5.html`).

| State | 1280 px | 400 px |
| --- | --- | --- |
| before any Test (no summary, no marks) | `preview-desktop-dark-before-test.png`, light | `preview-compact-dark-before-test.png`, light |
| Testing… | `preview-desktop-dark-testing.png`, light | `preview-compact-dark-testing.png`, light |
| after Test (2 failed · 3 set · 1 no field) | `preview-desktop-dark-results.png`, light | `preview-compact-dark-results.png`, light |
| reason open by click | `preview-desktop-dark-tip-open.png`, light | `preview-compact-dark-tip-open.png`, light |
| reason open by hover | `preview-desktop-dark-tip-hover.png`, light | no hover at 400 px |
| one row edited (Not tested since changes, other mark kept) | `preview-desktop-dark-not-tested.png`, light | `preview-compact-dark-not-tested.png`, light |
| two failures fixed, a no-field row left | `preview-desktop-dark-set-no-field.png`, light | `preview-compact-dark-set-no-field.png`, light |
| every row set | `preview-desktop-dark-all-set.png`, light | `preview-compact-dark-all-set.png`, light |
| (i) open | `preview-desktop-dark-info-open.png` | `preview-compact-dark-info-open.png` |

"light" is the same name with `light` for `dark`. Today's page after Test, for comparison, is `ux-review-r1.5/shots/18-tested.png`.

Measured on the prototype (`design/spike/measure.js`, rectangles of the open reason against every other row's name, (!), field control and Remove button): at 1280 px and at 400 px, dark and light, for SENTRY_PROJECT and STRIPE_KEY the open reason covers nothing of another row; one reason at a time; hovering away closes a hover-only reason; a second press closes a pressed one. The hit area of the (!) is 40 px wide and 44 px tall (a click 18 px from the glyph opens it, 24 px does not).

### Design review

Design review: design/ideation-1.yaml
Design finding 1: AC-1 tests it: the bubble covers the right part of its own control in today's 260 px raw-path control; the design states it and AC-1 requires the failed row's field name to stay readable in the 1280 px screenshot beside the open reason, on the implemented wider control.
Design finding 2: fixed: the (!) draws a white ring while its reason is open or hovered (all `tip-open` and `tip-hover` pictures, redrawn).
Design finding 3: fixed: the (!) hit area is 40 by 44 px (was 24 px; the host's `hitSlop` does nothing on web), shown by a click-offset run, and AC-1 requires the 18 px click.
Design finding 4: declined: the row's cue is the dashed "Pick a field" control of project-env-field-pill-one-control, and the summary counts it as "no field"; an extra amber border is not in A5.
Design finding 5: AC-1 tests it: all failed, no variables and the longest sentence are written into AC-1 (unit tests for "5 failed" and no summary without variables; the measuring script on the `unexpected` sentence, at most two lines); not drawn, because they change only a word count or a line.
Design finding 6: fixed: drew light for every state listed in the table except (i) open, which is the host's tooltip and takes its colours from the theme; keyboard focus uses the host's default focus ring and AC-1 requires Tab and Enter to work.

The reviewer opened only two pictures (its first limitation), so findings come from `tip-open` at both sizes; the other pictures were not reviewed. Its limitation about a bubble near the card edge is covered by AC-1 (first and last failed row measured), and about dismissal by AC-1 (second press, another (!), Test) and by the diagram.

### Spike notes

Machine dependencies, declared: Paseo.app 0.12.0 CLI `/Users/kent/.local/bin/paseo`, Node 24, `agent-browser`, Paseo.app's `app-dist` as the web client. Run (2026-10-22): copy `client/ server/ shared/ test/ index.* paseo-plugin.json package.json tsconfig.json` to `/tmp/pe-tsfm/plugin`, link `project-env/node_modules`, apply `design/spike/preview.diff` and add `test-marks.ts` and `test-marks.test.ts`; `mkworld.ts` builds the fake `op`/`security` world (names, references and fake sentinels only) and its directory is written into `index.server.ts` because Paseo's plugin loader has no `import.meta.dirname`; `config.json` is the daemon config (port 6867, plugins on, relay off); `PASEO_HOME=/tmp/pe-tsfm/home PASEO_LISTEN=127.0.0.1:6867 PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist paseo daemon run --home /tmp/pe-tsfm/home`; after an edit run `paseo --home /tmp/pe-tsfm/home plugin reload pe-tsfm` or the old bundle is served. `capture.sh`, `allset.sh`, `ac2.sh`, `measure.js`, `lib.sh` drive the browser and hardcode `/tmp/pe-tsfm`. Facts learned: showing the reason on focus makes a clicked (!) impossible to close (the click leaves focus on it), so hover and press only; the host's `info` takes a string, a React node renders nothing. Kent's daemon (`~/.paseo`, port 6767) and live plugin were never touched.

### Acceptance evidence plan

- **AC-1**: current evidence is the prototype: 177 tests pass (11 new in `design/spike/test-marks.test.ts`; one unidentified failure in a first run under load did not recur), the table of pictures, and the measurement above for two failed rows. Not yet verified: the first, last and longest-sentence rows, Tab and Enter, the 1280 px readability of the field name (the prototype control is today's 260 px one), and everything on the implemented change; the implementation run repeats `capture.sh` and `measure.js`.
- **AC-2**: current evidence is `design/spike/ac2.out` (prototype, accessibility tree): after Test "2 failed · 3 set · 1 no field" with marks on SENTRY_PROJECT and STRIPE_KEY; after editing STRIPE_KEY "Not tested since changes" with only SENTRY_PROJECT marked; editing it back restores both; an account change shows no mark; an edit made while Test runs leaves that row unmarked and the summary at "Not tested since changes". Each of three falsifying changes (ignore the vault, ignore edits in the summary, clear every mark on any edit) failed a named unit test. Not yet verified on the implemented change.

Unresolved decisions for the Captain: none. Consequences recorded for his gate: editing a row back to the tested reference brings its mark back; the header counts rows with no field ("· 1 no field"), which the A5 mock did not; the section title reads "Variables" as in the mock.

## Stage Report: ideation

- DONE: Design the change your Scope names inside direction A5, with each acceptance criterion kept and given a reproducible evidence clause.
  `## Design` makes a row's mark a pure function of the draft and the Test run (`shared/test-marks.ts`), the header summary a second function of the same, and the reason a bubble inside its row at 1280 px and a line under the field at 400 px; AC-1 and AC-2 text is unchanged and each `Verified by:` now names unit tests, a runtime run and a falsifier.
- DONE: Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px, plus the design review, with each finding dispositioned.
  32 whole-page pictures in `design/` from the real Paseo 0.12.0 client on an isolated daemon (port 6867, throwaway plugin id, fake op/security/git), dark and light; `Design review: design/ideation-1.yaml`, 6 MINOR findings: 3 fixed, 2 AC-1 / 1 declined (checker: 3 fixed, 2 criteria, 1 declined, 0 decisions).
- DONE: Name every interface you need from a sibling rework task, and any decision the Captain must make (at most one), with a recommendation.
  Interfaces: field-pill-one-control (failed look, 32 px slot, shrinkable control; the ✕ for Remove is in no task scope), add-variable-one-step (shared header), draft-survives-remount (store should also hold `run`), save-footer-danger-zone. No Captain decision; three consequences recorded for the gate.
- DONE: AC-1 After Test, failed rows show a red border and a (!) whose reason opens on hover and on tap, and the header shows the failed and set counts.
  Prototype evidence: 11 new unit tests (177 of 177 pass; one unidentified failure in a first full run under load did not recur), pictures at both sizes and themes, `measure.js` finding no other row covered for two failed rows, hit area 40 by 44 px (`hit.out`). Not yet verified: first, last and longest-sentence rows, Tab and Enter, field-name readability beside the bubble on the real wider control, and everything on the implemented change.
- DONE: AC-2 Editing one row clears only that row's mark and sets the summary to "Not tested since changes".
  Prototype evidence: `design/spike/ac2.out` (accessibility tree on the isolated daemon) and three falsifying code changes each failing a named unit test. Not yet verified on the implemented change.

### Summary

The change moves each row's status into a red border and a (!), keeps one open reason per screen inside its own row so no neighbour is covered, and puts a summary beside Test that reads "Not tested since changes" as soon as the draft differs from what was tested. The mark rule is derived, so editing a row back to the tested reference brings its mark back; the header also counts rows with no field, which the A5 mock did not. `design_surfaces.py check` reported "design surfaces presentable"; no Captain decision is open. The isolated daemon, plugin id `pe-tsfm`, browser session and `/tmp/pe-tsfm` are removed; Kent's live `paseo-project-env` install and `~/.paseo` were not touched.

## Stage Report: implementation

- DONE: Implement the approved design exactly, including every interface it names for its sibling tasks.
  Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/27 (commits 54c1b95, cad3e89 on spacedock-ensign/project-env-test-summary-failure-mark, off d197f9d). Draft changes only through `openProject.update`; one deviation, below. Interfaces: failed look and 32 px (!) slot on the field pill, header `trailing` holds summary then Test (no "+ Add": add-variable-one-step's), `run` kept local to ProjectEditor so after a remount the header is empty, never "All set"; Save does not touch `run`; Remove stays an X icon as #24 left it.
- DONE: Deviation recorded: the reason opens as a line under the field at every width, not as a bubble left of the (!) at 1280 px.
  On the implemented control the left bubble covered the field name (probe screenshot showed "POSTH"), which AC-1 forbids; the line is one line at 1280 px and two at 400 px for the `unexpected` sentence (impl/out/cap-*.out `lines`). Hover at 1280 px opens it too and shifts the rows below it by one line while open. FO: the approved previews in design/ show the bubble; the Captain's screenshots in impl/shots show the line.
- DONE: Land tests so each acceptance criterion passes with the evidence its clause names and fails when its behaviour is removed.
  `test/test-marks.test.ts` (14 tests). Mark rule: editing one row clears only that row, an account or vault change clears all, an edit made while Test ran shows nothing, editing back restores. Summary: every state of AC-1. Sentence: one capitalised full-stopped sentence for each of `CAUSES`. Falsified by hand: ignore the vault, ignore edits in the summary, clear all marks on any edit, drop the full stop; each fails a named test.
- DONE: AC-1 After Test, failed rows show a red border and a (!) whose reason opens on hover and on tap, and the header shows the failed and set counts.
  Isolated Paseo (PASEO_HOME and port 6881 under /tmp/pe-tsfm-impl, plugin id pe-tsfm, fake op/security/git), `impl/out/cap-*.out`: first, middle and last failed rows and the `unexpected` sentence at 1280 and 400 px, dark and light: `coversOtherRows` empty, `ownFieldTextCoveredByReason` 0, `lines` 1 (1280) and 2 (400); one open at a time; second press, another (!) and Test close it. `out/keys-*.out`: Tab from the field control lands on the (!), Enter opens and closes it; a click 18 px from the glyph opens it, 24 px does not. Not shown: a hover-open screenshot (screenshot tool hung with the pointer on the (!)); hover is measured only.
- DONE: AC-2 Editing one row clears only that row's mark and sets the summary to "Not tested since changes".
  `impl/out/ac2.out` (accessibility tree): after Test "3 failed · 2 set · 1 no field" with 3 marks; edit STRIPE_KEY: "Not tested since changes", its mark gone, the other two kept; edit back: all restored; service account sa-b: no mark; back to sa-a: restored; SENTRY_PROJECT edited while Test ran: no mark on it. `out/allset-*.out`: "5 set · 1 no field" then, after picking a field and Test, "All 6 set".
- DONE: Whole-page screenshots of the built change at desktop and 400 px, with the save bar, connection line and pill rows.
  30 PNGs in `impl/shots/` (desktop 1280x1900, compact 400x2100; before-test, testing, results, tip-open-first, tip-open, not-tested, dark and light; set-no-field, all-set, info-open dark). Built from the worktree by `impl/run.sh`; `impl/all.sh` reruns every check.
- DONE: Run `npm test`, `npm run typecheck`, the roborev gate, design_surfaces check and doc_impact.
  `npm test` 202 of 202 pass, typecheck clean. Roborev: `clean on cad3e8910; evidence=roborev:1055`. design_surfaces: "design surfaces presentable". comment_ratio: "code lines 290, comment lines 2, 0.7%", max 5% met. doc_impact lists docs/adr/0004-reserved-variable-names-are-skipped-not-blanked.md: unaffected: a saved reserved name still stays and shows "Not applied" with its reason, now in the (!). Number guards: none apply.
- DONE: Open the Draft PR.
  https://github.com/iamcxa/kc-paseo-plugins/pull/27, Draft, body carries evidence, limits and `without-it unanswered` (OpenProject.edits has no reader in the screen).

### Summary

Row marks and the header summary are derived from the draft and the Test run in `shared/test-marks.ts`, so editing a row clears only its mark and "Not tested since changes" needs no per-edit bookkeeping. The only departure from the approved design is where the reason opens (under the field, not in a left bubble) because the bubble hid the field name; the Captain should look at `impl/shots/desktop-dark-tip-open.png`. Observation, not investigated: in one run the field picker of the isolated daemon listed one field fewer after the service account was typed as an unknown name and back; a restart restored it.

## Stage Report: validation

- DONE: Independently check candidate cad3e8910ee5c2cfb79606a9350ed33f1c22220a against AC-1 and AC-2 and the approved design; rebuild and run it yourself on an isolated Paseo; give a verdict.
  Verdict PASSED, no Material finding. Built from the worktree at cad3e89 onto my own daemon (PASEO_HOME /tmp/pe-val-dir, port 6891, plugin pe-val, own agent-browser session, fake op/security/git; removed afterwards). Re-ran the implementer's scripts (copied with paths changed, measure.js read first) and got the same results at 1280 and 400 px, dark and light: first, middle and last failed rows plus the `unexpected` sentence cover no other row and not the row's own field text; one reason open at a time; Test closes it; Tab reaches the (!), Enter opens and closes; click 18 px away opens, 24 px does not; 1 line at 1280, 2 lines at 400 for the longest sentence. Header: "3 failed · 2 set · 1 no field"; edit STRIPE_KEY -> "Not tested since changes", only its mark gone; edit back restores; sa-a -> sa-b clears all, back restores; a row edited while Test ran shows no mark; fixing everything gives "All 6 set". Hover at 1280 opens the same line (alerts=1, measured; PNG not kept). Pill picker, connection line (Connected, Change), Save (wrote the new ref to the isolated projects.json) and Discard (confirm dialog) still work.
- DONE: Confirm the test-marks tests fail when their behaviour is removed.
  `npm test` 202 of 202 and typecheck clean (one first run failed session-open's deadline test; alone 16 of 16 pass, rerun 202 of 202). On a /tmp copy I removed each behaviour from `shared/test-marks.ts` / `shared/cause.ts`: ignore the vault -> "clears for every row when the account or the vault changes" fails; summary ignores edits -> "reads Not tested since changes after any edit..." and "shows nothing for a row the Test sent edited while it ran" fail; row ref edit ignored -> "clears for the edited row only..." fails; clear every mark on any edit -> "clears for the edited row only..." fails; drop the full stop or the capital -> "is a capitalised sentence for every cause" fails.
- DONE: Judge the worker's one departure from the approved design (line under the field at every width instead of a bubble left of the (!) at 1280 px).
  Accept the line. The bubble cannot meet AC-1 as written: at 1280 px the free space right of the field text inside the control is 155 px (SENTRY_PROJECT, text ends x=888 of 1043), 103 px (POSTHOG_CLI_API_KEY, 940) and 41 px (STRIPE_KEY, 1002, the ≠ badge and chevron sit there), while the longest sentence is 358 px on one line, so within AC-1's two-line limit it needs about 185 px; only a short sentence on a short field (row 1) fits. AC-1 names the last row and the `unexpected` sentence. Cost of the line, measured: rows below shift 24 px down while it is open (SENTRY_AUTH_TOKEN pill 455 -> 479 at 1280, 490 -> 514 at 400 for a one-line reason; about 40 px for the two-line one, read from its 32 px box, not measured); hover opens it too and it closes when the pointer leaves.
- DONE: Capture the open reason at 1280 and 400 px for the Captain, side by side with the approved design preview.
  `project-env-test-summary-failure-mark/validation/sbs-1280-dark.png`, `sbs-400-dark.png`, `sbs-1280-light.png`, `sbs-400-light.png` (left approved preview, right candidate, SENTRY_PROJECT open); 31 whole-page PNGs in `validation/shots/` (longest sentence open: `desktop-dark-tip-open.png`, `compact-dark-tip-open.png`).
- DONE: Write the minimal acceptance script FO will rerun in a fresh shell, and run adr_lint.
  `validation/acceptance.sh` (6 steps, PASS/FAIL per check, exit 0 only if all pass, cleans up after itself): run `bash <state>/project-env-test-summary-failure-mark/validation/acceptance.sh`. I ran it as `env -i HOME=$HOME PATH=$PATH bash ...`: ALL PASS, 4 min 20 s. Does not cover: real 1Password or Keychain, a touch device, Paseo versions other than 0.12.0, screen readers, a remount (draft-survives-remount), sibling tasks. `python3 <package>/scripts/adr_lint.py docs/adr --since 60799d9`: "5 ADR file(s) checked, 0 legacy", exit 0. Also `comment_ratio.py d197f9d cad3e89`: 290 code lines, 2 comment lines, 0.7%, exit 0; `dispatch_records.py`: 3 records complete, exit 0.
- DONE: Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.
  Captain should see: Variables header with "3 failed · 2 set · 1 no field" (red count) beside Test, on its own line under the title at 400 px; failed rows with a red-bordered field control and a red (!) in its own slot, no status text under any name; an open reason as one red line under the field (two lines at 400 px) with the (!) ringed white; "Not tested since changes" with only the untouched failed rows still marked; the dashed "Pick a field" row unmarked. Viewed: desktop-dark tip-open, results-after-edit, desktop-light tip-open, compact-dark tip-open and the four side-by-sides; the other PNGs were not opened. Unverified: a real touch tap (a click at 400 px stands in); hover-screenshot PNG; pointer path from a hovered (!) down to the next row while rows reflow; the 1280 px bubble (not built); screen-reader announcement of role=alert; the `info` tooltip text beyond the screenshot; the implementer's unexplained observation of one fewer picker field after typing an unknown service account (not reproduced in my runs, not investigated).

### Findings

- Polish: at 1280 px a second click on the (!) does not visibly close the reason while the pointer stays on it, because hover keeps it open (3 clicks without moving: alerts 1, 1, 1; after moving off it stays open only when the click count was odd). AC-1 says a second click closes it; the approved design also closes a hovered reason on pointer leave. The implementer's script moved the pointer off before counting, so its line "second press closes (pointer moved off)" does not exercise this. No current loss: moving the pointer away closes it. Would become Material if the Captain wants click to dismiss under the pointer.
- Polish: comment in `shared/test-marks.ts` "The one-sentence reason a row carries on its (!), or null when it carries none." restates `rowReason`; the other added comment states the rule and stays.

### Summary

PASSED at cad3e89: AC-1 and AC-2 reproduce on my own isolated Paseo at 1280 and 400 px, the test-marks tests fail for each removed behaviour, and the line under the field is the right call because the bubble cannot keep the field name readable for the longest sentence on the last row. The line shifts rows below by one line (24 px) while open. Two Polish findings, no Material one; unverified obligations are listed above. The isolated daemon, `/tmp/pe-val-dir`, plugin id pe-val and browser session tsfmval are removed; Kent's ~/.paseo, live plugin and the main checkout branch were not touched.

## Captain amendments

### Amendment 1 — 2026-10-23, validation (design change)
Captain: 「改 hover 泡泡」 (chat, choosing between the two options FO put)
Asked: "回「改 hover 泡泡」或「維持下方一行」" — after FO's recommendation: "改回 hover 浮動泡泡，同時把 AC-1 放寬成「可以暫時蓋住鄰列，但不能蓋住這一列自己的欄位名稱」".
Effect: the reason opens as a floating bubble (hover at 1280 px, click or tap at both widths), not as a line under the field. AC-1's "overlapping no other row's name, (!), field control or Remove button" is relaxed to: the open bubble may cover neighbouring rows while open, and never covers its own row's field name. The falsifier "a reason that covers another row" is withdrawn; "covers its own row's field name" replaces it.
Supersedes: the implementation's line-under-the-field departure (candidate cad3e89).

### Feedback cycle 1 (Captain amendment 1)

- DONE: The reason opens as a floating bubble: hover at 1280 px, click or tap at both widths; it may cover neighbouring rows and never covers its own row's field name.
  The bubble draws under the whole field (below the row's field control, however many lines it wraps to), above the rows below it. `shared/test-marks.ts` `nextMark` holds one open reason (hover shows, press pins, a second press closes while the pointer stays, another (!) replaces it); `client/failure-mark.tsx` `MarkBubble` is drawn in an overlay at the end of the Variables section because host rows each paint their own layer and a bubble inside its row went under the next row's text (seen in a screenshot).
- DONE: One bubble open at a time; a second click on the (!) closes it even while the pointer stays; Tab then Enter opens it (validation Polish 1).
  `test/test-marks.test.ts` "which (!) shows its reason" (4 tests), falsified by never closing on the second press and by a hover that keeps the old reason; `impl/out/cap-*.out` "second press closes while the pointer stays on the (!): alerts=0" at 1280 and 400 px, dark and light; `out/keys-*.out` Tab lands on the (!) and Enter opens then closes it.
- DONE: Remove the comment in shared/test-marks.ts that restates `rowReason` (Polish 2).
  Removed; `comment_ratio.py 0314c91 HEAD`: "code lines 387, comment lines 1, 0.3%", max 5% met.
- DONE: Update measure.js and the tests to the amended AC-1.
  `impl/measure.js` reports `coversOwnName`, `ownFieldTextCoveredByReason`, `statusTextOnRows` (status text such as "set" or "failed: …" on any row), `inViewport`, and lists covered neighbours as allowed. All 14 measurements (first, middle, last failed rows, the `unexpected` sentence, hover; 1280 and 400 px; dark and light): false, 0, [], true. Neighbour coverage is allowed and reported only.
- DONE: Retake the open-reason screenshots at 1280 and 400 px, dark and light.
  `impl/shots/{desktop,compact}-{dark,light}-tip-open*.png`, retaken at the merged head 782ac4c (30 PNGs).
- DONE: Rerun `npm test` and typecheck; run the roborev gate with --base d197f9d.
  After amendment: 206 of 206 and typecheck clean. Gate on that range found three real defects, each fixed and rerun: a pinned bubble left behind when rows move (now closes when the variables or a row's size change), a hover measured after the pointer left reopening it (a hover flag guards the late measurement), and the bubble placed from the (!) centre instead of below the field. Evidence lines: roborev:1061, 1062, 1063 (findings, then fixed); the final gate is the one in the main-merge note below.

### Main merge (0314c91)

- DONE: Merge origin/main (0314c91, PR #28 on top of #27's picker) into the branch with a merge commit.
  a67eef3, no rebase or force-push; one conflicted file, `client/settings-screen.tsx`, resolved by hand. `shared/config.ts` merged cleanly with `variableLine` still removed.
- DONE: Variables header reads summary, Test, "+ Add".
  `impl/shots/desktop-dark-tip-open.png`: "3 failed · 2 set · 1 no field", Test, "+ Add"; at 400 px the summary drops under the title and Test and "+ Add" stay on it. Section title is "Variables" with the Test explanation behind the (i), as designed; #28's Add flow, name-only rows and save-bar blocking are kept. The "Check the variables" row is gone (Test is in the header).
- DONE: Settle the save-bar note.
  #28's "N without a field will read failed until you pick one" now reads "N with no field picked yet", matching the summary's "no field". Rows still being named (empty name) are ignored by the summary and are not a change since Test (`test-marks.test.ts` "ignores a row that is still being named"); Test sends only named rows.
- DONE: After Test, confirm that a name-only row shows the no-field treatment.
  `impl/out/cap-*.out`: after Test, POSTHOG_CLI_HOST (name, no field) shows the dashed "no field picked" control (pill=1), no (!) (marks-on-it=0), and the header reads "3 failed · 2 set · 1 no field"; fixing every row then reads "All 6 set".
- DONE: Rerun `npm test` and typecheck; run the roborev gate with --base 0314c91.
  `npm test` 256 of 256, typecheck clean. Gate: `clean on 782ac4cf1; evidence=roborev:1065`.
- DONE: Push; point the acceptance scripts at the new head.
  Branch pushed (782ac4c). `impl/run.sh` builds from the worktree head, so every script in `impl/` ran against 782ac4c; outputs and 30 screenshots are in `impl/out` and `impl/shots`. comment_ratio against 0314c91: 0.3%. doc_impact lists only ADR 0004: unaffected (a saved reserved name still shows "Not applied" with its reason, now in the (!)).

### Summary

The reason is a bubble again as the Captain ruled, drawn in an overlay so it sits above the rows below it. Main is merged; the header, the Add flow and the save-bar note agree with the summary. Limits unchanged: no hover-open screenshot (the screenshot tool hangs with the pointer on the (!); hover is measured), and after a remount the Test run is gone so the header shows nothing until Test is pressed again.

## Stage Report: validation (cycle 2)

- DONE: Revalidate candidate 782ac4cf190d4236aa76d7b57e3dc192ab4edf2e against AC-1 as amended (Captain amendment 1, 2026-10-23) and AC-2; rebuild and run it yourself on an isolated Paseo at 1280 and 400 px, dark and light; give a verdict.
  Verdict PASSED, no Material finding, no repair finding. Built from the worktree at 782ac4c onto my own daemon (home /tmp/pe-val2-dir, port 6892, plugin pe-val2, own browser session, fake op/security/git; removed afterwards). I re-ran the implementer's scripts (paths changed; measure.js read, and I added one geometric check `belowOwnPill`: reason top is at or below the own field control's bottom). First, middle and last failed rows plus the `unexpected` sentence, dark and light at both widths: `coversOwnName` false, `ownFieldTextCoveredByReason` 0, `belowOwnPill` true (e.g. 1280 px last row: bubble top 756, own control bottom 752), `inViewport` true, `statusTextOnRows` empty; the bubble covers a neighbour only where the amendment allows (next row's control at 1280, next row's Remove at 400); 1 line (2 for `unexpected`, 280 px bubble).
- DONE: Second press closes while the pointer stays on the (!); Tab then Enter opens and closes; one open at a time; hover at 1280 px.
  Real mouse at 1280 px: hover opens (alerts=1); leaving closes a hover-only reason; press pins; second press with the pointer still on the (!) closes (alerts=0), third reopens, a press after moving away and back closes the pinned one. This is the cycle-1 Polish 1 case; it now passes. Tab from the field control lands on the (!), Enter opens, Enter closes, at 1280 and 400 px; click 18 px away opens, 24 px does not. Another (!) replaces the open one; Test closes it.
- DONE: AC-2 on the merged head.
  `ac2.sh`: "3 failed · 2 set · 1 no field" with 3 marks; edit STRIPE_KEY -> "Not tested since changes", only its mark gone; edit back restores; sa-a -> sa-b clears all, back restores; a row edited while Test ran shows no mark; fixing everything reads "All 6 set" (1280 and 400 px).
- DONE: The header reads summary, Test, "+ Add"; a name-only row after Test shows the no-field treatment and the summary counts it; the save-bar note reads "N with no field picked yet"; #28's Add flow and the pill, picker, connection line and save bar still work.
  Header accessibility order "About Variables", "Test", "+ Add"; summary under the title at 400 px. After Test, POSTHOG_CLI_HOST (name only) is the dashed "Pick a field" control, no (!), counted in "1 no field". "+ Add" opens the picker; picking TWILIO_AUTH_TOKEN adds a named row ("1 unsaved change", "1 with no field picked yet"); typing NEW_API_KEY and choosing "Add NEW_API_KEY and pick the field later" adds a no-field row ("2 unsaved changes", "2 with no field picked yet"); second Test "3 failed · 3 set · 2 no field", no mark on either no-field row; Save wrote `TWILIO_AUTH_TOKEN -> op://V/TWILIO/TWILIO_AUTH_TOKEN` and `NEW_API_KEY -> ""` to the isolated projects.json. Pill picking, Discard (confirm dialog), Change on the connection line and the save bar all worked. Not run: Import, Stop managing, Remove.
- DONE: Confirm the test-marks tests fail when their behaviour is removed.
  `npm test` 256 of 256 and typecheck clean (first run, no flake). On a /tmp copy of `shared/test-marks.ts` and `shared/cause.ts`, each removal fails a named test: ignore the vault -> "clears for every row when the account or the vault changes"; summary ignores a changed row list -> "reads Not tested since changes after any edit..."; summary always unchanged -> that test and "shows nothing for a row the Test sent edited while it ran"; row ref edit ignored -> "clears for the edited row only..."; second press never closes -> "keeps a pressed reason open when the pointer leaves, and a second press closes it while the pointer stays" and the touch test; hover keeps the old reason -> "shows one reason at a time"; hover-out never closes -> "opens on hover and closes when the pointer leaves"; press closes a hover-only reason instead of pinning -> the pinned-reason test; drop the full stop -> "is a capitalised sentence for every cause".
- DONE: Update and rerun the acceptance script in a fresh shell at 782ac4cf190d4236aa76d7b57e3dc192ab4edf2e and record its output; run adr_lint.
  `validation/cycle2/acceptance.sh` (7 steps, 32 checks), run as `env -i HOME=$HOME PATH=$PATH bash ...`: ALL PASS, 5 min 30 s (output below). `python3 <package>/scripts/adr_lint.py docs/adr --since 60799d9`: "5 ADR file(s) checked, 0 legacy", exit 0. `comment_ratio.py 0314c91 782ac4c`: 387 code lines, 1 comment line, 0.3%, exit 0 (the one added comment states the "current result" rule and stays; the restating comment is gone); `comment_ratio.py d197f9d 782ac4c` 0.3%, exit 0; `dispatch_records.py`: 6 records complete, exit 0.
- DONE: Capture the open bubble at 1280 and 400 px for the Captain, record what he should see and every unverified obligation.
  Side by side (approved design | cycle 1 line | cycle 2 bubble): `validation/cycle2/sbs-1280-dark.png`, `sbs-400-dark.png`, `sbs-1280-light.png`, `sbs-400-light.png`; readable crops `crop-1280-bubble.png`, `crop-400-bubble.png`; 34 whole-page PNGs in `validation/cycle2/shots/` including `desktop-dark-hover.png`. Captain should see: a small dark bubble with the one-sentence reason opening just under the failed field's control, right edge at the (!) (ringed white while open); on the first row it overlaps the top of the next row's control; on the last row it overlaps the Import row, half-hiding the Import label while open; the failed row's own name and field text always fully readable; header "3 failed · 2 set · 1 no field", Test, "+ Add"; no status text under any name. Viewed: the three crops, the 1280 and 400 px dark tip-open and hover pages, the Add-flow page; other PNGs not opened.
  Unverified: a real touch tap (a click at 400 px stands in); a screen reader; scrolling while a bubble is pinned; Paseo versions other than 0.12.0; real 1Password; the merge resolution of `settings-screen.tsx` was exercised through behaviour, not line-reviewed; Import, Stop managing and Remove not run; Add flow with a vault whose items have long names; the implementer's earlier "one fewer picker field" observation (not reproduced).

### Acceptance script output (fresh shell, 782ac4c)

```
1/7 PASS HEAD is 782ac4c
2/7 PASS npm test 256 pass, typecheck clean
3/7 PASS daemon answers on 6892
4/7 (desktop and compact, 8 checks each) PASS: first, middle, last bubble cover no own row name; bubble starts below its own field control; own field text not covered; bubble inside the viewport; no status text on rows; second press closes, one open at a time, Test closes; longest sentence shown; name-only row shows no-field control, no (!), counted as no field
5/7 PASS hover/press/second press
6/7 PASS 1280 and 400 px Tab, Enter, click offsets; after Test 3 failed, 3 marks; edit one row clears only its mark; account change clears every mark; row edited while Test ran shows no mark; header title, Test, + Add; Add by field; Add by name; second Test counts no-field rows, never marks them; Save wrote both added rows
7/7 5 ADR file(s) checked, 0 legacy -- PASS adr_lint exit 0
ALL PASS   (5:30.48)
```

### Findings

- Polish: while a bubble is open at 1280 px it can hide a neighbour's content (the last row's bubble half-hides the Import label; the first row's covers the top of the next control). The Captain's amendment allows it; the bubble has pointer events off, so Import stays clickable. Would become Material only if the Captain wants nothing hidden.
- Polish: AC-1's text in `## Acceptance criteria` is unchanged and still says "overlapping no other row"; the amendment in `## Captain amendments` governs and was what I judged by. FO may want to update the criterion text.

### Summary

PASSED at 782ac4c: AC-1 as amended and AC-2 reproduce on my own isolated Paseo at 1280 and 400 px, dark and light; the bubble never covers its own row's field name, the second press closes under a still pointer, and #28's Add flow, name-only rows and the "N with no field picked yet" note work beside the marks. Both cycle-1 Polish findings are fixed. The fresh-shell acceptance script passes all 32 checks in 5 min 30 s. The isolated daemon, /tmp/pe-val2-dir, plugin pe-val2 and browser session tsfmval2 are removed; Kent's ~/.paseo, live plugin and the main checkout branch (main) were not touched.

### FO declines

- Validation cycle 2 Polish 1 (at 1280 px the open bubble half-hides the Import label or the top of the next control): declined; Captain amendment 1 allows a bubble to cover neighbouring rows, and the bubble ignores pointer events so Import stays clickable (validation cycle 2, crop-1280-bubble.png at 782ac4c).
- Validation cycle 2 Polish 2 (AC-1's text under Acceptance criteria still reads "overlapping no other row"): declined; the amendment rule appends Captain amendments and changes nothing else in the criteria, so AC-1 is read with amendment 1.
- Without-it unanswered for the Captain: `OpenProject.edits` in client/open-project.ts has no reader in the screen after this change; open-project.test.ts still asserts it (named in the PR body).

## FO records

External review rounds at the validation gate: Codex 1 (code review clean at 782ac4c, after Captain amendment 1 and the main merge). The local roborev gate is not an external round.
delivery_gate.py check passed at 782ac4c before the ask (merge/ask-1.json); the Captain approved with 「准」 on 2026-10-23 and FO merged as 40849b4.
FO response to observer.md: the amendment entry carries an FO-written Effect line and names no AC id under Supersedes, and the worker did not move AC-1 under a Superseded text line; the record stays as written and AC-1 is read with amendment 1. The Design FAQ on the in-row bubble is withdrawn by amendment 1. The OpenProject.edits item is a without-it question for the Captain, not a decline. Later amendments follow the template.
