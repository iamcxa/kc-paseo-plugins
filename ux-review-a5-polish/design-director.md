# Design Director ruling: picky-user reviews of the project-env settings screen (main 40849b4)

## 1. Verdict

Fix one blocker this round, then one polish pass on the variable list. Everything else waits for its release or is already ruled. The blocker: the footer Save writes a connection that is still being changed. It ignores the connection's own disabled Done button, so a person can overwrite a working connection with an unchecked one. Both reviewers reproduced it, and the code confirms it. The rest of the screen holds up: after the fixture fix, Test, failure reasons and repair all work, and both reviewers would miss the same three things (fields picked by name with no value shown, rows that can be saved unfinished, and the stacked narrow layout). This round has two tasks that run one after the other. Task A makes Save safe and stable. Task B makes every variable row easy to find and read. Setup wording for a newcomer goes to r1b (a teammate's first setup). The Captain has two small decisions: refreshing the field list after a new token is stored, and the wording of the ≠ explanation.

## 2. Ruling table

Sources: "Astra" means `astra-review.md` (experienced user), and "Astra rerun" means its section "Rerun after the fixture fix". "Gemini" means `gemini-review.md` (first-week user). (a) to (e) are the five known behaviours both briefs asked about. My reproduction shots are in `director-shots/`. I wrote no data; the test Paseo was left as I found it (work 3, work-empty 0, work-many 12, work-bare 1 variable, no unsaved draft).

| # | Complaint | Sources | Real? | Verdict | How (area) | When |
|---|---|---|---|---|---|---|
| R1 | Footer Save commits a connection still being changed, while Done is disabled | Astra 1, Gemini 1, (c) | Read in code, and both reviewers reproduced it (`astra-shots/footer-save-draft.png`, `footer-draft-persisted.png`, `gemini-shots/connection-draft-save-enabled.png`). `SaveBar` computes `canSave = pending && !saving && unnamed === 0`, with no term for an open connection change (`open.changing`). The same defect was found earlier as roborev:1041 finding 2 and deferred "until the Captain tries the screen". | Solve | Disable Save while the connection is being changed, and say why in the save bar ("Finish or cancel the connection change first"). Key it on `open.changing`, which is kept in the store, so the block survives a remount. Do not block the first setup of a project that was never connected: there is no working connection to overwrite, and saving an unfinished first setup stays allowed, the same as a row with no field. Areas: save bar, connection. | This round. It is the one item that lets a person save a broken setup over a working one. |
| R2 | After a token is replaced by one that reads different data, the field list stays stale | Astra (b), Gemini (b) | Read in code. Neither reviewer reproduced it, because no second token was supplied. The loaded list is reset only by the effect on `[account, draft.vault]`. When a token is stored, the `store` mutation's `onSuccess` calls `check()` but never `refs.reset()`. | Captain decision | It changes a design the Captain approved: field-pill-one-control keeps the list "until the account or vault changes". The First Officer's deferral of it reads "material if the Captain wants a replaced token to refresh the list". Recommendation: drop the loaded vault list when a token is stored, so the next picker press reads the vault again. Area: connection, picker. | This round, in Task A, if the Captain agrees: it is one line in code Task A already changes. Otherwise r1b, with the rotate-token story. Both reviewers called it a blocker, and I do not agree. It needs a different account's token stored under the same Keychain name, and Test still fails any field the new token cannot read. |
| R3a | The sticky save bar covers the Danger zone text until you scroll | Astra 4, Gemini 4, (a) | Reproduced at 400 × 900 in work-empty. At scroll 0 the bar covers the Stop managing hint (`director-shots/empty-400-top.png`). After 71 px of scroll nothing is covered (`empty-400-end.png`). | Do not solve | This is what a sticky bar does, and the Captain chose a sticky bar (direction A5, critique finding 9). Every line can be reached by scrolling. A spacer under the content would not change the first view. | Never |
| R3b | A row the screen itself scrolls to, such as a newly added row, lands under the save bar | Gemini 4, (a); also deferred to the Captain's UAT in project-env-add-variable-one-step "FO declines" | Read in code: `VariableRow` reveals a new row with `scrollIntoView({ block: "nearest" })` and no allowance for the bar. Gemini's `new-row-overlap-narrow.png` shows the result. | Solve | Give each variable row a bottom scroll margin the height of the save bar, so any row the screen moves to ends fully above it. R4 needs the same margin. Area: variable rows, save bar. | This round, in Task B |
| R4 | The "N with no field picked yet" count does not take you to those rows | Astra 5, Gemini 5, Gemini's first look at work-many | Read in code: the save-bar note is plain `Text`. Both reviewers saw it in work-many at 400 px, where two rows fit on a screen. | Solve | Make the note a button. Each press scrolls to the next row with no field picked, in list order, and wraps around. Reuse the existing reveal and the margin from R3b. Area: save bar, variable rows. | This round, in Task B |
| R5 | A Test result disappears before you finish reading it | Astra rerun 1 | Reproduced: work-many at 1280 px, Test gives "1 failed · 7 set · 4 no field". Resizing to 700 px and back blanks the summary and marks, but the draft survives. Cause: the Test result lives in the editor's component state, which Paseo drops when it remounts the screen at 720 px. The draft lives in the `openProject` store and survives. This is a known limit in project-env-test-summary-failure-mark's Summary. I did not replay Astra's exact steps. | Solve | Keep the last Test run in the `openProject` store next to the draft. The existing "Not tested since changes" rule then applies unchanged. Area: Variables header, rows. | This round, in Task B. A blank header after a resize reads as "never tested". The fix copies the pattern of project-env-draft-survives-remount. |
| R6 | A long variable name breaks mid-word, even at 1280 px | Astra 7 (part), Gemini 7 | Reproduced: at 1280 px the 54-character name reads "DATABASE_URL_FOR_THE_PR / ODUCTION_REPLICA_READ_O / NLY_USER" (`director-shots/many-test-1280.png`). Cause: a 200 px name column, and `WRAP = { overflowWrap: "anywhere" }`. | Solve | Break only after an underscore when the name has one. Text a person copies must still equal the name exactly. Gemini also asked for truncation with a tooltip; I reject that, because the name is what tells rows apart (r1.5 critique finding 2: never cut it off). Area: variable rows. | This round, in Task B. It is cheap and shows on first look. The 54-character fixture name has existed since project-env-add-variable-one-step preview 13. |
| R7 | The amber ≠ makes a harmless alias look like a problem | Astra 7, Gemini 9 | Read in code: `statusWarning` colour; the explanation reads "The field name differs from the variable name." | Captain decision | Amber is the Captain's A5 choice (project-env-field-pill-one-control design finding 2 was declined on A5), and I keep it. I take neither reviewer's "harmless" reading. A differing name is how a wrong field hides: in this fixture, TWILIO_AUTH_TOKEN points at TWILIO_ACCOUNT_SID and Test still says "All 3 set". Astra's real point is that the screen does not say whether to act. Recommendation: add one sentence to the explanation, "Check it is the field you mean." Area: variable rows. | This round, in Task B, if the Captain agrees. Otherwise never. |
| R8 | The failure bubble covers the row below it | Astra 8, Gemini 12, (e) | Reproduced by both reviewers | Do not solve | The Captain chose this bubble knowing it may cover neighbouring rows (project-env-test-summary-failure-mark, amendment 1). Both reviewers rate it a nitpick, which adds nothing new. | Never |
| R9 | Remove has no Undo; restoring a row means re-adding it, and it moves to the end | Astra 3, Gemini 3 | Read in code: `removeRow` filters the draft. Discard reverts the whole draft. project-env-field-pill-one-control accepted "no confirm and no undo of its own". | Do not solve now | Nothing is lost until Save, and the picker re-adds the field. A per-row Undo needs a new "removed" row state that is not in A5, and the host toast has no action button (`ToastOptions` holds only variant and duration). | Later, with r3 (keep it working; it covers unsaved edits), or sooner if the Captain hits it himself |
| R10 | Connection setup asks for a Keychain item name under the label "1Password service account", and shows several action buttons | Astra 6, Gemini 6, both reviewers' first look at work-bare | Read in code: label "1Password service account", hint "Keychain item name holding its token…", then Check, Save token, Done, Cancel and the footer Save. This is known: r1.5 critique finding 8, and journey questions find-settings/q1 ("this Mac's Keychain" should name the Mac running Paseo) and setup-guide. | Solve | When the project has never been connected, show numbered steps that name each box plainly: a name you choose for the token on the Mac running Paseo, then paste the token, then the vault. This belongs to the r1b in-app steps (setup-guide). Area: connection. | r1b. The Captain already knows this form. The person it confuses is r1b's teammate, which is exactly Gemini's persona. |
| R11 | Saving a project moves it to the end of the project list | Gemini 10 | Read in code: `save` writes `[...others, draft]`. No earlier review reported it. | Solve | Replace the project where it sits. Order matters beyond looks: project-env-worktree-real-paths records that when two saved entries match one repository, the first in list order wins. Area: project list, save. | This round, in Task A, which already changes `save` |
| R12 | Back leaves the plugin instead of returning to the project list | Gemini 8 | Reproduced: both the "Back to plugins" button and the ← in the header are drawn by Paseo, not by the plugin; the client code has no Back control. The editor is not a separate page, so Back leaves the plugin page. Recorded consequence of project-env-draft-survives-remount: the draft survives leaving and coming back. I did not exercise that. | Do not solve | Paseo owns the header. Close in the save bar returns to the list. | Never, unless Paseo gives plugins sub-routes |
| R13 | Test results are gone after Save and reopen | Gemini 11 | Read in code: results are never stored | Do not solve now | Keeping a saved health record is new scope. It belongs with the project-list health idea in r1.5 critique finding 13, which was not taken. | Later, with r3 |
| R14 | Conductor import and the default prompt crowd the variables screen | Gemini 13, Gemini's first look | Real; it is the current layout | Do not solve now | Both are shipped r2 stories, and A5 keeps the prompt section. Astra, the experienced user, did not object. | Later, with r2 |
| R15 | "Type a reference…" gives no syntax help; a search with no match gives no next step | Gemini 14; Astra rerun ("What I can do about the four absent fields") | Reproduced: searching "Linear" shows "No field matches "Linear"". Type a reference then shows a box with the placeholder `op://Dev/item/field` and a Use button (`director-shots/type-ref.png`). | Syntax part: do not solve. Next-step part: solve. | On syntax I take Astra's view over Gemini's: the example is on screen. Astra's real ask is that a search with no match should say "add the field in 1Password, then come back". That belongs with the r1b in-app steps and with ADR 0005 (an agent lays out the vault; a person fills the values). Area: picker. | Syntax: never. Next step: r1b. |
| R16 | "All N set" claims more than Test proves | Astra rerun 2 | Read in code: the Variables (i) already says "Set means a value came back from 1Password; it does not prove the service accepts that key." | Do not solve | "N set" is the approved A5 wording, and the limit is stated once behind (i). The mismatch signal is the ≠ (R7). | Never |
| R17 | The picker offers fields that Test says do not exist | Astra 2, Gemini 2 | Withdrawn: the test copy's fake vault had no values. Astra's rerun shows ordinary fields resolve, SENTRY_PROJECT fails as designed, and picking another field repairs the row, at both widths. | Do not solve | Not a product defect | Never |

Behaviour (d), where a row with no field counts as "no field" after Test: both reviewers said they would not complain and called it correct. No change.

**Where the reviewers disagree, or where I disagree with both:**
- R2: both called it a blocker. I rate it annoying. It needs a different account's token stored under the same Keychain name, and Test still catches the result.
- R6: Gemini asked for truncation; Astra only objected to the mid-word break. I side with Astra, because the name must never be cut off.
- R7: both called the ≠ a false alarm. I disagree, because the fixture's own TWILIO row shows the warning catching a real mismatch. I keep amber and propose clearer words.
- R15: Gemini said there is no syntax help; Astra saw an example. I reproduced it, and Astra is right.
- R14 and R12 come from Gemini only. R14 is out of this release; R12 is the host's control.

## 3. Proposed tasks for this round

Two tasks, run one after the other: Task A first, then Task B from Task A's merged main. Both edit `SaveBar` and `ProjectEditor` in `client/settings-screen.tsx`, so running them in parallel would repeat last round's merge-and-revalidate cost. A third task would only split Task B's row and save-bar code across two more branches that would still run one after another.

### Task A: Save never overwrites a working connection with a half-changed one

- **Scope:**
  - Save is disabled, with its reason shown in the save bar, while the connection is being changed (R1).
  - A saved project keeps its place in the project list (R11).
  - Storing a token drops the loaded vault list (R2), only if the Captain agrees.
  - Code touched: `client/settings-screen.tsx` (`SaveBar`, `save`, and `onSuccess` of the `store` mutation) plus unit tests. Out of scope: the first-setup form of a project that was never connected (R10, r1b).
- **Acceptance criteria:**
  1. While Change is open with an unchecked account name typed, Save is disabled and the save bar says why. After Done or Cancel, Save works again. This still holds after the window crosses 720 px. *Proof:* a unit test on the Save rule, which fails when the open-change term is removed. A runtime script on an isolated Paseo at 1280 and 400 px presses Save during Change and finds `projects.json` unchanged.
  2. Saving any project leaves the project list in the same order. *Proof:* a unit test that saves the middle of three projects and finds it still in the middle. A runtime check of the list text before and after Save.
  3. Applies only if the Captain agrees to R2. After a token is stored, the next press on a field opens a list read again from the vault. *Proof:* a runtime script with a fake `op` that returns different fields for two tokens stored under one account name. The second list shows the new fields.
- **Size:** small. One implementation and validation pass.

### Task B: You can find and read every variable row

- **Scope:**
  - Rows the screen scrolls to end above the save bar (R3b).
  - The "N with no field picked yet" note moves you to each such row (R4).
  - The last Test result survives a remount (R5).
  - Long names break only after underscores (R6).
  - The ≠ explanation gains "Check it is the field you mean.", only if the Captain agrees (R7).
  - Code touched: `client/settings-screen.tsx` (`VariableRow`, `SaveBar`, `FieldPill`), `client/open-project.ts` (stores the run), and unit tests.
- **Acceptance criteria:**
  1. In work-many at 400 × 900 and 1280 × 1400, a newly added row ends fully above the save bar, and so does each row reached through the note. *Proof:* a measuring script compares each row's bottom edge with the bar's top edge at both widths.
  2. Pressing the note four times in work-many visits LINEAR_API_KEY, RESEND_API_KEY, SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET in order, and a fifth press returns to the first. *Proof:* a runtime script at both widths.
  3. Each of these holds and is falsified on its own:
     - A Test summary reads the same before and after the window crosses 720 px and back.
     - The 54-character name starts every new line right after an underscore, and its copied text equals the name.
     - Only if the Captain agrees to R7: the ≠ explanation reads "The field name differs from the variable name. Check it is the field you mean."

     *Proof:* a runtime resize script that compares the summary text. A measuring script that checks where each line starts, and reads the name's text content. A text check of the open ≠ explanation.
- **Size:** medium. One implementation and validation pass, plus the screenshots for the ui gate.

## 4. Items for the Captain

The two decisions are independent of each other.

1. **Refresh the field list after a token is stored (R2).** Should storing a token drop the vault list the screen has already loaded, so the next picker press reads the vault again? Recommendation: yes, as Task A's third criterion. Reason: otherwise, after a different account's token is stored under the same Keychain name, the picker offers the old account's fields until the page reloads. What gets worse: the rule you approved in field-pill-one-control ("kept until the account or vault changes") gains a third trigger. If you say no, R2 moves to r1b with the rotate-token story.
2. **The ≠ explanation (R7).** Should the explanation add "Check it is the field you mean."? Recommendation: yes. Keep the amber colour you chose in A5. Reason: both users read the ≠ as a false alarm, but a differing name is how a wrong field slips past Test. In this fixture TWILIO_AUTH_TOKEN reads TWILIO_ACCOUNT_SID and Test says "All 3 set". What gets worse: one more sentence in the explanation. If you say no, R7 becomes "never" and Task B drops it.

For information, no decision needed:
- R1 was deferred to you by the First Officer (roborev:1041 finding 2). The brief's rule puts a save-a-broken-setup blocker in this round, so I ruled it solve.

## 5. What this picky-user pass caught, and what it cost nothing to ignore

**It did not find a new kind of defect; it ranked deferred ones.** The blocker (R1) was found earlier by roborev:1041 and deferred "until the Captain tries the screen". R2, R3b and R5 were also deferred or recorded as known limits in single tasks. Five per-task deferrals pointed at "the Captain's UAT" (his own try of the screen), and none had an owner until a pass looked at the whole screen. The pass added a user's rating of severity and one place where the deferrals met. Recommendation for dev2: route any deferral that says "raise with the Captain when he tries the screen" into this pass, which turns each one into a ruled item.

**It caught seams between tasks.** Each task validated its own criteria. Behaviour that spans tasks fell between them: the save bar against the rows (R3b, R4), and a remount against the Test result (R5).

**Genuinely new findings, all small:**
- R11 project order, the only one with an effect beyond looks.
- R6 mid-word wrap. The fixture had the long name for two tasks, and nobody flagged it.
- R4 no route to the unfinished rows.
- R16 wording, and R15 next step.

**Cost nothing to ignore:**
- R17 is a fixture artifact. It cost one rerun. Before reviewers are dispatched, one smoke Test on the fixture should return "set".
- R12 is host chrome.
- R14 is r2 scope.
- R8 is already ruled.
- R16 is already stated behind (i).
- R15's syntax point was contradicted by the screen.
- About half of the newcomer's 14 complaints were in these groups, or were r1b setup items (R10, R15). Those are useful input for r1b, not for this round.

**Two models:**
- Agreement did not mean correctness. Both called R2 a blocker without reproducing it, and both read the ≠ as a false alarm.
- Disagreements were settled by reproducing them (R15).
- The persona mattered more than the model. The newcomer brief surfaced the r1b setup friction; the experienced brief surfaced the reachability and wording issues.
