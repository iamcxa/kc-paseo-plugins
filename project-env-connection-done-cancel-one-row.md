---
id:
title: Finishing or cancelling a connection change is one row right after the vault
status: validation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree: .worktrees/spacedock-ensign-project-env-connection-done-cancel-one-row
pr: pr-merge:44
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
                state: consumed
        - id: gate:project-env-connection-done-cancel-one-row:ideation
          stage: ideation
          attempts:
            - id: gate-attempt:project-env-connection-done-cancel-one-row-ideation-1
              briefing:
                id: briefing:project-env-connection-done-cancel-one-row:ideation:attempt-1:revision-1
                digest: sha256:68e0041fa16999a10e54750dbb42b016d478a6e524ca4abe7ada711e0f511a5a
                room-ref: ./project-env-connection-done-cancel-one-row/review/ideation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-connection-done-cancel-one-row:ideation:1
                briefing: briefing:project-env-connection-done-cancel-one-row:ideation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-24T03:40:53.301159Z"
                decision: approve
                reason: 'Captain 2026-10-24, in the FO chat: 「准」. Asked: approve the one-row Cancel/Done design (option A) and its acceptance criteria into implementation, also accepting the recommendation to leave the save bar unchanged in this task.'
              application:
                target-stage: implementation
                state: consumed
        - id: gate:project-env-connection-done-cancel-one-row:validation
          stage: validation
          attempts:
            - id: gate-attempt:project-env-connection-done-cancel-one-row-validation-1
              briefing:
                id: briefing:project-env-connection-done-cancel-one-row:validation:attempt-1:revision-1
                digest: sha256:354fa4d2a1e613ee2548ed3ff96eeae608f5345156a8ed080a508641e376e4f4
                room-ref: ./project-env-connection-done-cancel-one-row/review/validation/briefing-1
              withdrawal:
                by: agent:first-officer
                at: "2026-10-24T04:06:24.177022Z"
                reason: 'Re-prepare: the summary lacked the declined items delivery_gate.py requires.'
            - id: gate-attempt:project-env-connection-done-cancel-one-row-validation-2
              briefing:
                id: briefing:project-env-connection-done-cancel-one-row:validation:attempt-2:revision-1
                digest: sha256:7ca8be0fa2458feb817144211715f022a6eca5ea8d83a69f05367da10f5cc1d5
                room-ref: ./project-env-connection-done-cancel-one-row/review/validation/briefing-2
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-connection-done-cancel-one-row:validation:2
                briefing: briefing:project-env-connection-done-cancel-one-row:validation:attempt-2:revision-1
                by: person:captain
                at: "2026-10-24T15:57:18.095352Z"
                decision: approve
                reason: 'Captain 2026-10-24, in the FO chat: 「准合併」. Asked: approve delivery of PR #44 at 88c49d4 (squash merge after delivery_gate.py check, worktree removal, live plugin update).'
              application:
                target-stage: done
                state: pending
started: 2026-10-24T01:18:38Z
---

Polish round 2 of the project-env settings screen. Source: the Captain's UAT on 2026-10-23 (「這個 use this connection 按鈕是否可以放在 vault 選擇的後面？或是換個方式重新設計儲存跟取消」, 「import from conductor 功能可以移除」, and the qnow vault rename that blanked five variables live) and the Design Director's ruling in `ux-review-polish-2/design-director.md`, approved by the Captain on 2026-10-23 with 「准」, including option A, the re-point behaviour and the r2 wording.

## Scope

In (design-director.md Task 2, option A): in the Change form only, the "Use this connection / Done" and "Keep the current connection / Cancel" rows become one row right after Vault, with Cancel and Done on the right styled like the save bar's buttons, and the reason a disabled Done is disabled shown in the row. Cancel and Done keep their behaviour, including the blocked Save and its survival across 720 px. Out: the first-setup form (r1b) and the save bar. Stop condition: the acceptance criteria pass. Branches from project-env-remove-conductor-import's merged main.

## Acceptance criteria

**AC-1**: In the Change form with a working vault picked, Cancel and Done sit in one row after Vault and both end above the save bar, at 1280 × 1400 and 400 × 900.
Verified by: a measuring script (`project-env-connection-done-cancel-one-row/evidence/drive.sh` with `measure.js`, the A5 harness plus a second readable vault `Ops`) on an isolated Paseo built from the candidate, project `work`, Change opened and `Ops` picked, at 1280 × 1400 and 400 × 900: the two buttons' top edges differ by at most 2 px, both tops are below the Vault select's bottom, both bottoms are above the save bar's top. On the disposable build at main 4e22d4a plus the option-A edit: tops 605 and 605, Vault bottom 570, bottoms 638 against bar top 1312 at 1280; tops 658 and 658, Vault bottom 623, bottoms 691 against bar top 786 at 400 (`evidence/measure-after.txt`). The same script on main fails the shared-top-edge clause at both widths (tops 668 and 603 at 1280, 721 and 656 at 400, `evidence/measure-before.txt`), which is what a two-row layout cannot pass. Correction to the backlog text: on main with this fixture the picked state at 400 × 900 is still above the bar (Cancel bottom 753 against bar top 786); Cancel goes under the bar there only in the unchecked-account state (bottom 798 against 786, `shots/before-400-unchecked.png`) or once a line sits above the buttons, as the Design Director's mock did.

**AC-2**: With an unchecked account name Done is disabled and the row reads "Available once the connection works."; with a typed unsaved token it reads "Save the token or clear the field first."; Cancel brings back the previous account and vault.
Verified by: the same script at 1280 and 400: with the account edited to an unchecked name (`sa-x`) the section text holds "Available once the connection works." and the Done button's `aria-disabled` is true; with a token typed into the token field it holds "Save the token or clear the field first." and Done is disabled; after Cancel, from each of the picked (`Ops`), unchecked and failed-Check states, the section reads "Connected · sa-a · Dev", the previous account and vault (`evidence/measure-after.txt`, lines `section` and `after-Cancel`). `npm test` and `npm run typecheck` in `project-env/` pass on the candidate with `test/save-rule.test.ts` untouched (273 of 273, `evidence/typecheck-and-tests-candidate.txt`; main also 273 of 273). The behaviour already holds on main, so this criterion guards the move: removing a hint or a Cancel reset from the new row makes the script's text or after-Cancel line differ.

## FO alignment

Surfaces: ui
Visible change: Cancel and Done sit together in one row right after the vault choice.
Direction alignment with the Captain: done — the Captain chose option A on 2026-10-23 (「准」).
Result: ux-review-polish-2/director-shots/opt-a-*.png; every ui gate shows the Captain screenshots of the screen.
Release review: not needed: a polish of the r1.5 settings screen the Captain ruled at backlog; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this polish task.

## Design

### PRFAQ

**Headline.** In the 1Password card's Change form, finishing or cancelling is one row, "Use this connection", right after Vault, with Cancel and Done at its right edge.

**Who and why.** The Captain, who changes the connection on his own setup. On 2026-10-23 he asked 「這個 use this connection 按鈕是否可以放在 vault 選擇的後面？或是換個方式重新設計儲存跟取消」 and approved option A with 「准」. Today two full rows sit under Vault, and Cancel can lie under the sticky save bar.

**FAQ.**
- *Do Cancel and Done behave differently?* No. Done still returns to the connection line only when the connection works and no token is pending; Cancel still restores the previous account and vault and clears the typed token; both keep the Save block and its survival across 720 px (`open.changing`, untouched).
- *Where does the disabled-Done reason go?* In the row's hint, beside the buttons: the same two strings as today.
- *What does the row say when Done is ready?* "Cancel keeps the current one." (the Design Director's proposal; Cancel has no label of its own any more). Cancel keeps the accessible name "Keep the current connection".
- *Where does project-env-vault-change-repoints-refs put its line?* In its own row between Vault and this row ("3 variables point at Dev. Done points them at agent-dev. ..."), as the Director drew it. This row needs no change.
- *First-setup form and save bar?* Untouched (`view === "setup"` and `SaveBar`).

```mermaid
flowchart LR
  subgraph Today
    V1[Vault] --> D1[row: Use this connection ... Done] --> C1[row: Keep the current connection ... Cancel]
  end
  subgraph After
    V2[Vault] --> L2[reserved: re-point line of the next task] --> R2[one row: Use this connection, hint ... Cancel Done]
  end
  R2 -->|Done, connection works| B[connection line]
  R2 -->|Cancel| P[previous account and vault restored, then connection line]
  R2 -->|Done disabled| H[hint gives the reason, row stays]
```

Stops: the row ends at the card's last row; it does not touch Check, Save token, the save bar or the first-setup form.

### Existing-code capability check

Boundary: the two `SettingsAction` rows labelled "Use this connection" and "Keep the current connection" in `ProjectEditor` (`client/settings-screen.tsx`). The host's `SettingsRow` with buttons inside already exists in this file (the Danger zone row), and `barButton`/`barText` already draw the save bar's tones. Consumers of the old rows: none outside the screen (`git grep -n "Keep the current connection\|Use this connection" -- . ':!docs/dev2'` finds only these two, 2026-10-24, main 4e22d4a). Need: Captain-ruled. Decision: reuse `SettingsRow`, `barButton`, `barText`; add no component. The edit in the disposable copy is 76 diff lines, one file (`evidence/candidate-disposable.diff`), `npm run typecheck` clean and 273 of 273 tests pass in it.

### UI proposal and preview

UI proposal: In the Change form only, replace the two rows "Use this connection / Done" and "Keep the current connection / Cancel" with one row right after Vault: label "Use this connection", a hint under it, and Cancel (plain tone) and Done (primary tone, off when it cannot be pressed) at the right, drawn like the save bar's Discard and Save. The hint is "Available once the connection works." for an unchecked or failed account, "Save the token or clear the field first." for a typed unsaved token, and "Cancel keeps the current one." when Done is ready.

Preview: project-env-connection-done-cancel-one-row/shots/

The preview is two running builds of the real plugin on an isolated Paseo (own home; ports 6962 and 6963; fake `op`, `security`, `git`; the A5 harness with its fake vault list widened to `Dev` and `Ops`): "before" is main 4e22d4a, "after" is the same tree with the option-A edit in a throwaway copy, disposable and never on a branch. Pictures, all project `work`, dark theme unless named: `after-1280-{picked,unchecked,token,failed}.png` (whole page at 1280 × 1400), `after-400-{...}.png` (400 × 900 window with the sticky bar), `after-400-page-{...}.png` (400 px, whole page), `after-800-{picked,unchecked}.png` (800 × 1000), `after-light-{1280,400,400-page}-{picked,unchecked,token}.png`, `after-1280-after-done.png`; each `before-*` is today's build in the same state, and `room-after-*` is the same row with a stand-in line above it (disposable, `evidence/room-standin.diff`). States: `picked` is `Ops` chosen with a working token, `unchecked` is the account edited to `sa-x`, `token` is a token typed and not saved (a fake string), `failed` is `sa-x` after Check ("No token in Keychain"). Measured, 400 × 900, picked: buttons end at y 691, the bar starts at 786 (95 px clear); with the stand-in line above the row they end at 775 (11 px clear). So the next task's line fits, with a thin margin that task must re-measure.

### Design review

Design review: design/ideation-2.yaml

Design finding 1: Needs decision: with a typed, unsaved token the save bar reads "No unsaved changes" and offers Close; the bar is out of Scope and `before-400-token.png` shows the same today, so this row did not cause it. See Needs decision.
Design finding 2: AC-2 (the Done hint "Save the token or clear the field first." is the Captain's own AC-2 wording, tested by AC-2's script; the check row's sentence "The token you typed is not saved yet." is today's, `before-400-token.png`, and outside this row).
Design finding 3: AC-1 (that is AC-1 of project-env-vault-change-repoints-refs, not of this task): what a vault change does to the variables, and the "Dev ·" prefixes and "≠" chips, is that task's line above this row, which the Captain approved on 2026-10-23 (`room-after-400-picked.png` shows its place).
Design finding 4: declined: the failed-check title and the token help text belong to the Check row, which this task does not touch (`before-*` shows the same); the new row's own reason for the disabled Done is correct in that state.
Design finding 5: declined: Vault turning into a text box when the account is unchecked is today's behaviour (`before-400-unchecked.png`); no Vault code moves.
Design finding 6: declined: the sticky bar's covering and its two heights are the A5 bar and round-1 ruling R3a, out of Scope.
Design finding 7: declined: Cancel and Done are the save bar's own `barButton` (height and 8 px gap) as the Captain chose; a taller pair would differ from the bar beside it.
Design finding 8: declined: the Variables card is untouched by the candidate diff (`evidence/candidate-disposable.diff`); the squeeze is today's.
Design finding 9: declined: the disabled style is the save bar's (0.5 opacity), the same for Save; a theme-wide contrast change is outside this row.
Design finding 10: declined: check-in-progress shares Done's off expression and hint with unchecked; a long account name sits in the account input and a long vault list in the host's menu, neither in this row; the failed state at 1280 and 400 and after Done at 1280 are drawn, and AC-2's script reads the failed state's hint and after-Cancel line at both widths (`evidence/measure-after.txt`).
Design finding 11: declined: the ready hint is the Design Director's proposal under the approved option A, and Cancel has no label of its own once the old row is gone; "Uses Ops with sa-a." would repeat the connection line.

Design review run 1 (`design/ideation-1.yaml`, before the failed, 800 px and light previews were drawn) raised the same three MAJOR themes plus the save bar's repeated "Finish or cancel the connection change first" sentence; run 2 no longer lists the last one, and it stays in the decision below.

### Needs decision

1. **Does the save bar change in this task?** Recommendation: no. Design finding 1 (and run 1's repeated-sentence finding) is about the bar, which Scope excludes and which Task A's wording the Captain approved on 2026-10-23; both read the same on today's build. What gets worse: a person can press Close with a typed, unsaved token and see "No unsaved changes" (finding 1), and the connection sentence appears in the bar and in the row (finding 2) until a later task. If the Captain wants finding 1 fixed (count a typed token as an unsaved change), it is a separate backlog task, because it changes `unsavedCount` and the Close/Discard flow. Past rulings checked: ADRs 0001-0008 name no save-bar behaviour; `git -C docs/dev2/.spacedock-state grep -n 'Override:'` finds only archived prose about other areas.

### Evidence plan and honest limits

Already run on the disposable build during ideation: the measuring script at 1280, 400 and 800 (AC-1, AC-2 texts, after-Cancel lines), `npm run typecheck` and `npm test`. Not run: anything on a real candidate branch, hover, focus and open-menu states, a real 1Password account, a touch device. No new durable test is added: the existing save-rule tests cover the behaviour that did not change, and the layout is only observable in a browser, which the validation script covers; without it a regression to two rows would show in AC-1's shared top edge at the next validation. Limits: the fixture has one token, so "picked" means a second vault of the same account, not a different account; the Task 3 line in `room-after-*` is a stand-in with that task's wording and a placeholder count; `drive.sh` carries this run's `/tmp/pe-cdc` paths and is a record of the run, validation adapts its paths.

### Batch overlap

- project-env-vault-change-repoints-refs (backlog): changes `client/settings-screen.tsx` in the same Change form (its line goes in its own row above this one, and Done's handler gets the re-point) and `shared/config.ts`; it branches from this task's merged main and must re-run AC-1's script with its line present (margin 11 px at 400 × 900 with the stand-in).
- project-env-test-row-draft-note (backlog): changes the Test row hint in a different region of the same file.
- No ADR is changed by this task, so no shared ADR index is touched.
Recommended order: this task, then project-env-vault-change-repoints-refs; project-env-test-row-draft-note after its own prerequisite.

## Stage Report: ideation

- DONE: Design the change your Scope names (option A: one row right after Vault with Cancel and Done on the right, the disabled-Done reason in the row), with each acceptance criterion kept and given a reproducible evidence clause.
  `## Design` holds the PRFAQ, Mermaid, capability check and UI proposal; AC-1 and AC-2 keep the Captain's wording and carry `evidence/drive.sh` + `measure.js` clauses. Correction recorded in AC-1: on main with this fixture the picked state at 400 x 900 is above the bar (Cancel bottom 753 vs bar top 786); today fails the shared-top-edge clause at both widths and hides Cancel only when unchecked (798 vs 786).
- DONE: Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px (working vault picked; unchecked account with Done disabled; typed unsaved token), plus the design review, with each finding dispositioned.
  `shots/` (after-/before- at 1280, 400 window, 400 whole page; plus failed, 800, light, after-Done); `design/ideation-2.yaml` (run 2 of 2; run 1 kept as `ideation-1.yaml`); 11 findings dispositioned. `design_surfaces.py check`: "design surfaces presentable; 11 findings, 0 fixed, 2 criteria, 8 declined, 1 decisions". In ideation-2.yaml I changed only the `preview:` value to the task-relative path so it equals the `Preview:` line (the checker resolves it against the state checkout).
- DONE: Leave room in the row for project-env-vault-change-repoints-refs's re-point line.
  The line is its own row above this one; with a stand-in line the 400 x 900 picked state still ends at y 775 against bar top 786 (11 px), `room-after-400-picked.png`; that task must re-run AC-1.
- DONE: Name any decision the Captain must make (at most one), with a recommendation; option A is already chosen.
  One: keep the save bar unchanged in this task (recommended); the typed-token "No unsaved changes" finding is a separate backlog item if wanted.
- DONE: AC-1 evidence (not yet a pass on a candidate branch).
  Disposable build: tops 605/605 (1280) and 658/658 (400), both bottoms above bar (638 < 1312; 691 < 786); main fails shared top (668 vs 603; 721 vs 656). Falsified by a two-row layout.
- DONE: AC-2 evidence (not yet a pass on a candidate branch).
  Both hints read as specified at 1280, 400 and 800; Done `aria-disabled` true; after Cancel the line reads "Connected · sa-a · Dev" from picked, unchecked and failed states; 273 of 273 tests and typecheck pass on the disposable build, save-rule tests untouched.

### Summary

Option A is drawn from a running build: one `SettingsRow` after Vault with `barButton` Cancel and Done, 76 diff lines in one file, nothing new added. The one Captain decision is whether the save bar stays out of this task; two MAJOR review findings (typed token shows "No unsaved changes", same on main) hang on it. Implementation: the candidate edit lives only as `evidence/candidate-disposable.diff`, no branch exists.

### Batch overlap

See `### Batch overlap` under `## Design`.

## Stage Report: implementation

- DONE: Implement the approved design exactly, starting from evidence/candidate-disposable.diff in this task's folder: one "Use this connection" row right after Vault with Cancel and Done on the right, the disabled-Done reason in the row; Cancel and Done keep their behaviour. Leave the save bar unchanged.
  Commit 88c49d4 on `spacedock-ensign/project-env-connection-done-cancel-one-row`, the disposable diff applied unchanged: one file, `client/settings-screen.tsx`, 33 added, 20 removed; no test, save bar or first-setup code touched. Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/44.
- DONE: Land evidence for AC-1 and AC-2 with the clauses they name (adapt evidence/drive.sh and measure.js to your own paths), plus whole-page screenshots at desktop and 400 px, under this task's state folder.
  `evidence/candidate-88c49d4/` (`measure-after.txt`, `measure-before.txt`, `shots/`, `typecheck-and-tests.txt`), harness copy in `evidence/harness/` (S /tmp/pe-cdc-impl, ports 6964 main and 6965 candidate; torn down). AC-1 clause: tops 605/605 (1280) and 658/658 (400), tops below Vault bottom (570, 623), bottoms 638 and 691 above bar tops 1312 and 786; main fails the shared top (668 vs 603; 721 vs 656). Falsified by a two-row layout. AC-2 clause: unchecked `sa-x` reads "Available once the connection works." and Done is aria-disabled; typed token reads "Save the token or clear the field first." and Done is disabled; after Cancel from picked, unchecked and failed states at both widths the section reads "Connected · sa-a · Dev". Falsified by removing a hint or the Cancel reset from the row. Shots: `cand-{1280,400}-{picked,unchecked,token,failed}.png`, `cand-400-page-*.png`, `main-*` for before. Same numbers as the ideation run on the disposable build.
- DONE: Run `npm test`, `npm run typecheck`, the roborev gate, `design_surfaces.py check` and `doc_impact.py <base> <candidate>`, then open the Draft PR.
  `npm run typecheck` exit 0; `npm test` 273 of 273 (`test/save-rule.test.ts` untouched; asserts the save and unsaved-count rules, fails if Save/Discard logic changes). Roborev gate exit 0: `clean on 88c49d4cc; evidence=roborev:1136`. `design_surfaces.py check`: "design surfaces presentable". `doc_impact.py 4e22d4a HEAD`: 0 documents mention what changed, so none to record. `comment_ratio.py`: 0 comment lines of 33 code lines, under the 5% maximum. Draft PR #44 opened.

### Summary

The option-A row is in a Draft PR, built from the approved disposable diff with no changes. Measurements on an isolated Paseo built from the candidate reproduce the ideation numbers and main still fails the shared-top clause. Limits: no hover, focus, open-menu, real 1Password account or touch run; the typed-token "No unsaved changes" save bar behaviour is unchanged (Captain kept the bar out of scope). No ADR added; no number guards apply.

## Stage Report: validation

- DONE: Independently check candidate 88c49d4ccccc02845d868fc8761e3e5156ecde2e (PR iamcxa/kc-paseo-plugins#44, base main 4e22d4a) against AC-1 and AC-2 and the approved design: rebuild and run it yourself on an isolated Paseo; confirm in the Change form Cancel and Done share one row after Vault and both end above the save bar at 1280x1400 and 400x900, including the unchecked-account state; the hints read "Available once the connection works." and "Save the token or clear the field first." with Done disabled; Cancel restores the previous account and vault; Done still works; the save bar's blocked-Save behaviour and its survival across 720 px still hold; give a verdict.
  Verdict PASSED, no repair finding. Built from `git archive` of the candidate on its own Paseo (ports 6972/6973 for the AC runs, 6974 for the script; plugin ids pe-cdc-val and pe-cdc-accept; own agent-browser sessions, all removed). 1280: Cancel and Done tops 605/605, Vault bottom 570, bottoms 638, bar top 1312. 400: tops 658/658 (picked) and 706/706 (unchecked), bottoms 691 and 739 against bar top 786. Hints, disabled Done, Cancel restore (picked, unchecked, failed), Done to "sa-a · Ops", Save blocked with "Finish or cancel the connection change first" and the form surviving 1280>700>1280>700 all PASS (`project-env-connection-done-cancel-one-row/evidence/validation-1/accept-output-cand.txt`, 25 PASS, 0 FAIL; `measure-cand.txt`). `npm run typecheck` exit 0; `npm test` 273 of 273 (`tests-candidate.txt`; the flaky session-open test passed in the full run).
- DONE: Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
  adr_lint exit 0 ("7 ADR file(s) checked, 0 legacy"). Script: `bash project-env-connection-done-cancel-one-row/evidence/validation-1/accept.sh` (steps below). Same script on main 4e22d4a exits 1 with 7 FAIL (tops 668 vs 603 and 721 vs 656 differ; unchecked 400 Cancel bottom 798 under bar top 786; no ready hint), so it detects the old two-row layout (`accept-output-main-falsifier.txt`). Other scripts at base 4e22d4a..88c49d4: comment_ratio exit 0 (0 of 33 code lines), doc_impact exit 0 (0 documents), design_surfaces check exit 0, dispatch_records exit 0 (3 complete); no Number guards section.
- DONE: Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.
  Seen: `project-env-connection-done-cancel-one-row/evidence/validation-1/shots/cand-1280-picked.png`, `cand-400-page-unchecked.png`, `cand-400-picked.png`. See "What the Captain should see" and "Unverified" below.

### Acceptance script

Run `bash /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-connection-done-cancel-one-row/evidence/validation-1/accept.sh` (about 75 s; needs paseo, agent-browser, node, python3; exit 0 means all PASS; it removes everything it creates). It does, in order:
1. Archives commit 88c49d4 and runs `npm run typecheck` in project-env (expect PASS typecheck).
2. Starts a throwaway Paseo on port 6974 with a fake 1Password (vaults Dev and Ops) and opens the project "work" Change form.
3. At 1280x1400 and 400x900 with Ops picked, then with account edited to sa-x, then with a typed token: expect Cancel and Done tops within 2 px, below Vault, bottoms above the save bar; hints "Cancel keeps the current one.", "Available once the connection works.", "Save the token or clear the field first."; Done disabled in the last two.
4. Cancel from picked and unchecked: expect "sa-a · Dev" back on the connection line.
5. With Ops picked, expect the save bar to say "Finish or cancel the connection change first" with Save disabled, still so after the window goes 1280>700>1280>700 px with the form open.
6. Done: expect "sa-a · Ops" and Save enabled.
Does not cover: light theme, 800 px, hover/focus/open menu, a real 1Password account, touch, the failed-Check state or Cancel from a typed token (the failed state and its Cancel are in `measure-cand.txt`), or pressing Save.

### What the Captain should see

At 1280 the card ends with the row "Use this connection" with "Cancel keeps the current one." under it and Cancel (outlined) and Done (white) at the right edge, directly under Vault; the save bar sits far below. At 400 px the same row follows Vault with both buttons side by side and clear of the bar; with an unchecked account the Vault is a plain text box, the hint wraps to two lines, Done is greyed and the bar reads "1 unsaved change / Finish or cancel the connection change first" with Save greyed. The Variables card, Danger zone and bar look as on main.

### Findings

- F1 Polish: with an unchecked account Done is disabled at 0.5 opacity and reads faint on the dark theme; this is the save bar's own disabled style and ideation declined it (Design finding 9).
- F2 Deferred risk: with a typed unsaved token the save bar reads "No unsaved changes" on main and candidate alike; the Captain kept the bar out of scope (Needs decision 1); would become material if the bar is brought into a task.

### Unverified obligations

Hover, focus and open-menu states; light theme and 800 px (read from ideation evidence only, not rerun); a real 1Password account or different account; a touch device; the "Done" ready state at 400 px beyond the geometry run; the re-point line of project-env-vault-change-repoints-refs (margin 11 px at 400x900 is that task's to re-measure); the roborev result is the implementation report's (roborev:1136), not rerun.

### Summary

The candidate passes AC-1 and AC-2 on an independent build: one row after Vault at both widths in every state, hints and Cancel restore as specified, Done works, and the blocked Save and its survival across 720 px hold; main fails the same script. Only the declined polish and the Captain-ruled save-bar item remain.

### FO declines

- Validation F1 (Polish): disabled Done at 0.5 opacity reads faint on the dark theme. Declined: it is the save bar's own disabled style, so both read alike; ideation declined the same finding (design/ideation-2.yaml). Material if the Captain cannot tell disabled Done from enabled at UAT; candidate revision: a stronger disabled colour shared by the save bar and this row.
- Validation F2 (Deferred risk): a typed unsaved token shows "No unsaved changes" in the save bar, on main and on the candidate. Deferred by the Captain's ideation approval (save bar out of scope). Material if a typed token is lost by Close at UAT; candidate revision: count a typed unsaved token as an unsaved change.

## FO records

External review rounds at the validation gate: Codex 1 (code review clean at 88c49d4). The local roborev gate is not an external round.
delivery_gate.py check passed at 88c49d4 before the ask and just before the merge (after the first prepared gate was withdrawn to add its declined items). FO reran evidence/validation-1/accept.sh before the ask (25 PASS, 0 FAIL). The Captain approved in the FO chat with 「准合併」 and FO merged as b20a949, then updated the live plugin (settings backed up and unchanged).
FO response to observer.md: from the next task the landed sentinel is set only after observer.md is committed; FO's own acceptance rerun output is committed under the task folder; the 0.29.0 validation rules (a `Built screen review:` line and design_surfaces output for a ui task, `Decline check:` lines on declined design findings) apply from the vault re-point task on. The live-plugin update was named in the gate question the Captain approved.
