---
id:
title: Test shows a summary line and marks failed rows with a red border and (!)
status: ideation
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
                state: consumed
started: 2026-10-22T04:16:52Z
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
