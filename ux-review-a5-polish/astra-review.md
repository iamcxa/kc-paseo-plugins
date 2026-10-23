# Project environment: demanding-user review

I would not recommend this screen today. The unfinished connection can be saved past its own disabled Done button, and the supplied test app did not let me reach a successful variable test.

Reviewed on 2026-10-23, only in the private test app at `http://127.0.0.1:6920/settings/hosts/srv_Bhly3M8r36L4/plugins/pe-astra/projects`, using `agent-browser --session astra`. Viewports: 1280 × 1400 and 400 × 900. Screenshot links below are relative to this review; all files are in `astra-shots/` beside it. These are captures of the app's visible internal scroll area, not stitched captures of every off-screen row.

## First five seconds

| Project | 1280 px | 400 px |
| --- | --- | --- |
| work | I see a connected account and three name-to-field mappings. The amber ≠ symbols make me wonder whether these mappings are broken or merely differently named. | Stacked names and fields are understandable. The prompt and import section push the explanation and destructive controls below the fold. |
| work-empty | The empty-state sentence tells me exactly where to start. The import and prompt controls compete with the one thing I came to do. | + Add remains obvious. The bottom bar overlaps the destructive section's explanation. |
| work-many | I can scan most mappings and spot four empty fields. The long variable name breaks mid-word into three lines despite the wide window. | I see only the first few mappings, while the footer says four have no field. It gives me a count but no route to those rows. |
| work-bare | I need to supply a local credential name, but the main label says “1Password service account.” I have to read the small helper text to understand that distinction. | The connection form consumes nearly the whole screen. Check, Save token, and the bottom Save make me work out what each one commits. |

Initial captures: [work wide](astra-shots/work-wide.png), [work narrow](astra-shots/work-narrow.png), [empty wide](astra-shots/empty-wide.png), [empty narrow](astra-shots/empty-narrow.png), [many wide](astra-shots/many-wide.png), [many narrow](astra-shots/many-narrow.png), [bare wide](astra-shots/bare-wide.png), [bare narrow](astra-shots/bare-narrow.png).

## Complaints, worst first

### 1. Save bypasses the connection's own completion check — blocker

- **Screen:** work, 1280 px.
- **Did:** Opened Change, replaced `sa-a` with the deliberately unfinished name `sa-draft`, and pressed the footer Save without Check or Done.
- **Expected:** Finish or cancel the connection edit before committing it; at least explain exactly what Save will commit.
- **Happened:** Done was disabled and the connection said “Not checked for sa-draft yet,” but Save committed that name and returned to the project list. I reopened it and restored `sa-a` using Check, Done, then Save. I would stop trusting this form with working projects.
- **Screenshots:** [unfinished connection with enabled Save](astra-shots/footer-save-draft.png), [draft name persisted](astra-shots/footer-draft-persisted.png).

### 2. The picker offers fields that Test says do not exist — blocker in this test app

- **Screen:** work at 1280 px; work-bare at 1280 px; work-many at 400 px.
- **Did:** Tested the existing mappings, inspected the failure explanation, and reselected the suggested SENTRY_AUTH_TOKEN field. In work-bare I connected the supplied working account and selected POSTHOG_CLI_API_KEY for its generic OLD_VAR row. In work-many I reselected SENTRY_AUTH_TOKEN and tested again.
- **Expected:** A field offered by the connected vault should resolve, or the failure should tell me a useful recovery step.
- **Happened:** work reported three failures; work-bare's freshly picked field failed; work-many reported eight failures plus four missing selections. The failure explanation was “Field not found in the vault.” Reselecting the suggested field did not produce a successful repair. I cannot tell whether this is a fixture/resolver issue or a product issue from the screen alone; I did not inspect code or a real provider.
- **Screenshots:** [failure explanation](astra-shots/failure-hover-wide.png), [fresh selection fails](astra-shots/bare-configured-test.png), [many after narrow repair attempt](astra-shots/many-narrow-retest.png).

### 3. Removing one row makes me rebuild it or discard unrelated edits — annoying

- **Screen:** work, 1280 px.
- **Did:** Added two variables, removed STRIPE_KEY, then changed my mind.
- **Expected:** Undo that removal while keeping both additions.
- **Happened:** There was no individual Undo. Discard was the only reversal control, and it applied to the whole draft. I reopened Add, chose stripe's secret-key, changed the generated SECRET_KEY name back to STRIPE_KEY, and pressed Enter. The restored row moved to the end.
- **Screenshots:** [removed row, no Undo](astra-shots/remove-no-undo.png), [restored row after Save](astra-shots/work-saved.png).

### 4. The fixed footer hides content I am trying to finish reading — annoying

- **Screen:** work-empty and work-bare, 400 px.
- **Did:** Read the destructive-action explanation and the lowest visible variable control.
- **Expected:** Content should end above the action bar, or scroll into view without being obscured by it.
- **Happened:** In work-empty, the bar covers the lower explanation of Stop managing. In work-bare it cuts across the OLD_VAR field area. I can scroll, but the overlap makes the page feel unfinished and makes me check whether I missed text.
- **Screenshots:** [covered destructive explanation](astra-shots/empty-narrow.png), [covered field area](astra-shots/bare-narrow.png).

### 5. The missing-field count does not help me reach the missing fields — annoying

- **Screen:** work-many, especially 400 px.
- **Did:** Tried to find and repair the four rows counted in the footer.
- **Expected:** A clickable count, next-problem action, or filter would take me to the work.
- **Happened:** I had to move down the long list. Searching for LINEAR, RESEND, and SLACK produced no matches in the supplied vault. The screen offered a manual reference escape route, but no field I could honestly choose for those variables. I left them unfinished rather than assign unrelated credentials. The absent fixture fields are a test limitation; the unhelpful navigation is the UX complaint.
- **Screenshots:** [count with problems below the fold](astra-shots/many-narrow-attention.png), [LINEAR search](astra-shots/many-linear-no-match.png), [RESEND search](astra-shots/many-resend-no-match-wide.png), [SLACK search](astra-shots/many-slack-no-match-wide.png).

### 6. Connection setup makes me translate implementation terms — annoying

- **Screen:** work-bare at both widths; connection editor at 1280 px.
- **Did:** Set up the project from no account and later edited a connection.
- **Expected:** A clear “use an existing connection” path and an obvious final commit action.
- **Happened:** “1Password service account” actually asks for a Keychain item name (a local credential-store entry). Check, Save token, Done, Cancel, and footer Save describe several different stages. Entering `sa-a` and pressing Check did connect and select Dev, but I only knew the correct name because the brief supplied it.
- **Screenshots:** [initial setup](astra-shots/bare-narrow.png), [multiple connection actions](astra-shots/connection-draft-wide.png).

### 7. The name-difference symbol makes a harmless alias look like a problem — nitpick

- **Screen:** work at both widths; work-many at 400 px.
- **Did:** Tried to understand the amber ≠ beside STRIPE_KEY and the very long database variable.
- **Expected:** A short plain explanation of whether I need to act.
- **Happened:** I had to open the explanation to learn only that the field and variable names differ. That is useful information, but the warning-like presentation does not tell me whether the mapping is intentional. The long name also breaks inside words, even in the wide layout.
- **Screenshots:** [wide long-name wrapping](astra-shots/many-wide.png), [expanded explanation on narrow layout](astra-shots/many-long-name-narrow.png).

### 8. Failure explanations overlap the next row — nitpick

- **Screen:** work, 1280 px.
- **Did:** Hovered the first failure icon.
- **Expected:** Read the explanation without obscuring the next mapping.
- **Happened:** The bubble extends into the next row's area. It is transient and goes away when I move the pointer, so I would grumble mildly, not stop using the screen.
- **Screenshot:** [failure bubble](astra-shots/failure-hover-wide.png).

## Verdict on the five specified behaviors

| Behavior | Would I complain? | Judgment and evidence boundary |
| --- | --- | --- |
| (a) Save bar covers Danger zone or a new row's edge | Yes — annoying. | Observed overlapping destructive explanation and field content at 400 px. A persistent action bar is useful, but content needs clearance. The newly-added-row variant was not separately isolated. |
| (b) Changed token leaves a stale field list until reload | Yes — blocker if this occurs. | This would make me distrust which account's data I am selecting. This judgment is based on the behavior supplied in the brief, not an independently reproduced token swap: no second known-working token with different data was supplied, and I did not invent one. No screenshot is claimed as proof of that transition. |
| (c) Footer Save works during connection editing | Yes — blocker. | Reproduced: unchecked `sa-draft` persisted even with Done disabled. See complaint 1. |
| (d) An unpicked field counts as “no field” after Test | No complaint. | Observed “3 failed · 2 no field” and “8 failed · 4 no field.” That correctly distinguishes unfinished setup from a reference that failed to resolve. Calling an unpicked field “not found in the vault” would send me looking in the wrong place. |
| (e) Hover failure bubble covers the row below | Yes — nitpick. | Observed. Small, temporary interference; far below the connection and recovery problems in priority. |

## What actually completed

- Opened all four projects at both requested widths. Added LINEAR_API_KEY and LATER_API_KEY in work through search and “pick the field later.” LINEAR had no match; both remained explicit empty mappings.
- Pressed Test, read the failure reason, and attempted the offered repair by reselecting the matching field. No successful resolution was observed. Existing and freshly chosen fields failed in the supplied test app.
- Changed the account name and used Cancel: the original `sa-a` connection returned while the variable additions remained. Separately reproduced footer Save bypassing Done, then restored and saved `sa-a`.
- Removed and manually restored STRIPE_KEY. Saved and reopened work: all five rows remained, including both unfinished additions and the restored mapping. The order changed because the restored row was appended.
- Set up work-bare with `sa-a`; Check selected Dev. Mapped OLD_VAR to the offered POSTHOG_CLI_API_KEY as a fake-data exercise, tested, saved, and reopened it. Connection and mapping persisted; successful resolution did not. See [saved setup](astra-shots/bare-saved.png).
- In work-many, inspected the long-name mismatch and four unpicked rows at both widths, searched for the missing services, reselected the suggested Sentry field at each width, and retested. The narrow retest captured eight failures and four unpicked fields. Some wide captures after resizing/retesting showed no result summary; they are not evidence of a pass. No usable matching fields were available for the four unpicked rows, so I did not fabricate successful fixes or save unrelated substitutions.

Final test data: work has five variables and the restored `sa-a` connection; work-bare has the saved connection and one fake mapping; work-empty and work-many were left unchanged. Browser session `astra` was closed successfully. No code edits, commits, pushes, real credential access, or daemon shutdown were performed.

## Things I would genuinely miss

1. Selecting named vault fields without displaying or copying their values.
2. Saving explicitly unfinished variables, with a persistent count of missing selections.
3. Seeing each environment name next to its chosen item and field, including the stacked narrow layout.

I would not recommend this screen to a colleague today; a single unambiguous connection-save boundary and a successful, understandable test-and-repair flow would change my answer.

## Rerun after the fixture fix

**Complaint 2 is withdrawn as a general blocker.** The earlier all-fields-fail observation was real, but the follow-up brief identifies its cause as missing fake field values. The corrected test copy now successfully resolves ordinary fields, isolates the deliberately failing SENTRY_PROJECT field, and supports recovery by selecting a working field. The original review above remains the historical record; this section supersedes its conclusion about resolution being broken.

Reran only the requested Test-and-repair and initial-setup flows, at 1280 × 1400 and 400 × 900, on `http://127.0.0.1:6920/settings/hosts/srv_dEMNhlVgGn4y/plugins/pe-astra/projects`. No real provider behavior is claimed.

### Results at both widths

| Flow | 1280 px | 400 px |
| --- | --- | --- |
| work: initial Test | “All 3 set.” | “All 3 set.” |
| work: deliberately break SENTRY_AUTH_TOKEN by selecting SENTRY_PROJECT | “1 failed · 2 set.” Hovering the failure icon explained “Field not found in the vault.” | The same row failed; clicking its failure icon exposed the explanation. |
| work: restore SENTRY_AUTH_TOKEN to its original field and Test | “All 3 set”; draft returned to “No unsaved changes.” | “All 3 set”; original mapping restored. |
| work-many: initial Test | Test run on the original twelve rows; the wide result display was transient, as described below. | “1 failed · 7 set · 4 no field,” correctly isolating SENTRY_PROJECT. |
| work-many: change the failed row to a readable field and Test | “8 set · 4 no field” in the text snapshot. | “8 set · 4 no field.” |
| work-bare: start with no account, enter sa-a, Check, select POSTHOG_CLI_API_KEY for OLD_VAR, Test | Connected to Dev; “All 1 set.” | Repeated from the unsaved starting state; connected to Dev and “All 1 set.” |

The work-many substitution was deliberately temporary: mapping SENTRY_PROJECT to SENTRY_AUTH_TOKEN proves that changing the reference clears a read failure, **not** that an authentication token is a valid project name. I discarded it at each width. The intended SENTRY_PROJECT field is deliberately unreadable in this fixture, so a genuine repair of that value cannot be completed here. The existing long database-variable mapping to TWILIO's apiKey also illustrates that readability does not establish application correctness.

Evidence: work [initial wide pass](astra-shots/rerun-work-wide-pass.png), [wide failure and reason](astra-shots/rerun-work-wide-fail.png), [wide repair](astra-shots/rerun-work-wide-repaired.png), [initial narrow pass](astra-shots/rerun-work-narrow-pass.png), [narrow failure](astra-shots/rerun-work-narrow-fail.png), [narrow repair](astra-shots/rerun-work-narrow-repaired.png); work-many [narrow initial result](astra-shots/rerun-many-narrow-test.png), [narrow temporary substitution](astra-shots/rerun-many-narrow-remapped.png), [wide temporary substitution](astra-shots/rerun-many-wide-remapped.png); work-bare [wide success](astra-shots/rerun-bare-wide-pass.png), [narrow success](astra-shots/rerun-bare-narrow-pass.png).

### What I can do about the four absent fields

LINEAR_API_KEY, RESEND_API_KEY, SLACK_BOT_TOKEN, and SLACK_SIGNING_SECRET have no matching field in this vault. I searched LINEAR at 400 px and RESEND and SLACK at 1280 px. The screen lets me leave the rows explicitly unfinished, remove them, or enter a manual reference. I opened “Type a reference…”: it presents a reference input with an example and a Use button. That is a reasonable expert escape route if I already know a valid reference; it cannot create the missing vault data.

I would keep these rows unfinished until the appropriate vault fields exist. I would not pick unrelated secrets to improve the count. “4 no field” is honest and useful, and the absence of fixture data is not a product defect. My earlier complaint about finding the affected rows still stands; additionally, the no-match state could tell me to add the field in 1Password and return, instead of leaving the recovery step implicit. See [LINEAR no match](astra-shots/rerun-many-narrow-missing.png), [manual reference route](astra-shots/rerun-many-narrow-reference.png), [RESEND no match](astra-shots/rerun-many-wide-resend.png), and [SLACK no match](astra-shots/rerun-many-wide-slack.png).

### Additional complaints, ranked

#### 1. A Test result can disappear before I finish reading it — annoying

- **Screen:** work-many, 1280 px.
- **Did:** Changed the failing row to a readable field, pressed Test, waited, read the page text, then captured a screenshot without editing another mapping.
- **Expected:** The result should remain until I change something relevant or explicitly retest.
- **Happened:** The text snapshot reported “8 set · 4 no field,” but the immediately following screenshot had no result summary beside Test. The row substitution and unsaved-change count remained. This is an intermittent observation in the test copy, not an established cause or claim that every Test result disappears. It makes me wonder whether the test completed or was invalidated.
- **Severity:** annoying.
- **Screenshot:** [wide result no longer visible after successful text result](astra-shots/rerun-many-wide-remapped.png). The same screenshot shows the edited mapping still present.

#### 2. “All set” overstates what this test established — nitpick

- **Screen:** work at both widths; work-many temporary substitution at both widths.
- **Did:** Tested the original mappings, then used a readable but inappropriate field for SENTRY_PROJECT as a temporary repair probe.
- **Expected:** Wording such as “3 fields resolved” should describe this specific check.
- **Happened:** work said “All 3 set” even though one existing variable named TWILIO_AUTH_TOKEN pointed at TWILIO_ACCOUNT_SID. In work-many, the temporary token-for-project substitution counted as set, with only the name-difference symbol remaining. The tool need not understand every application's variable semantics; I want the success wording to make its limited promise clear.
- **Severity:** nitpick.
- **Screenshots:** [All 3 set with visibly different names](astra-shots/rerun-work-narrow-repaired.png), [temporary substitution](astra-shots/rerun-many-narrow-remapped.png).

All temporary changes in work-many and work-bare were discarded through the confirmation dialog. work returned to its original mapping without needing Save. The final project list showed work with three variables, work-many with twelve, and work-bare with no service account. The `astra` browser session was closed successfully; no code, real credential store, or daemon was changed. The earlier footer-Save bypass finding was outside this rerun and was not retested.

I still would not recommend this screen to a colleague today: basic Test-and-repair now works, but resolving the previously reproduced unfinished-connection Save bypass would change my answer.

## Re-review on main c46720f

**The connection-save blocker is fixed. Three original complaints are fixed, two are better but not fixed, and three still reproduce. I found no new blocker.**

Reviewed on 2026-10-23 using only the supplied private test Paseo at `http://127.0.0.1:6920/settings/hosts/srv_tgN_YkcmCjVf/plugins/pe-astra/projects`, with `agent-browser --session astra2`, at 1280 × 1400 and 400 × 900. The build identification in this heading comes from the brief; these are observed browser results, not an independent verification of the running binary's commit. I read the original review and its fixture-fix rerun before testing. Screenshots capture the visible internal scroll area.

### The original eight complaints, retested in order

1. **Save bypasses connection completion — fixed.** In work, I opened Change and replaced `sa-a` with unchecked `sa-draft`. Both Done and footer Save were disabled; the footer explicitly said “Finish or cancel the connection change first.” Cancel restored `sa-a`. I repeated the cancellation after adding variables: the additions survived, and subsequent Save persisted the original connection. This removes the original reason I would not trust the form. [Unchecked draft and disabled Save](astra-shots/r3-01-save-blocked.png); [saved project reopened](astra-shots/r3-saved-work.png).

2. **Offered fields cannot be successfully tested — fixed in this test app, confirming the previous withdrawal.** Original work mappings produced “All 3 set.” I selected SENTRY_PROJECT for SENTRY_AUTH_TOKEN, got “1 failed · 2 set,” read “Field not found in the vault,” restored SENTRY_AUTH_TOKEN, and got “All 3 set” again. The failure was initiated at 400 px and completed after resizing to 1280 px; the repair also survived resizing. In work-bare, I entered `sa-a`, pressed Check, selected POSTHOG_CLI_API_KEY for OLD_VAR, and got “All 1 set.” [Initial success](astra-shots/r3-02-pass-resize.png); [isolated failure](astra-shots/r3-08-failure-bubble.png); [successful repair](astra-shots/r3-repaired.png); [new setup, wide](astra-shots/r3-bare-pass-wide.png) and [narrow](astra-shots/r3-bare-pass-narrow.png). This proves fake-field readability, not real-provider access or correct application configuration.

3. **Removing a row requires rebuilding it or losing other edits — not fixed.** I added LINEAR_API_KEY and LATER_API_KEY, removed STRIPE_KEY, and changed my mind. There was still no row Undo. To keep both additions, I used Add, chose stripe's secret-key, changed the generated SECRET_KEY name to STRIPE_KEY, and pressed Enter. Saving and reopening retained all five rows, with STRIPE_KEY now last. The original annoyance survives exactly. [Removal without Undo](astra-shots/r3-03-remove-no-undo.png); [restored row at the end](astra-shots/r3-saved-work.png).

4. **The footer hides content — better but not fixed.** At 400 px, work-empty's initial view still cuts off the destructive-action explanation, and work-bare's initial view still clips the bottom of OLD_VAR's picker. Scrolling the actual content area to its bottom exposes the complete destructive explanation above Save, so it is reachable. The targeted-row improvement does work: the added LINEAR_API_KEY row and rows reached through the missing-field button sit above the bar. I still dislike reading text through a persistent overlay, but the navigation target is no longer the casualty. [Empty initial overlap](astra-shots/r3-04-empty-narrow.png); [complete explanation after scrolling](astra-shots/r3-empty-scrolled-bottom.png); [bare initial picker](astra-shots/r3-06-bare-narrow.png); [new row clear of Save](astra-shots/r3-added-row.png).

5. **The missing-field count provides no route to the rows — fixed.** In work-many at 400 px, repeated clicks visited LINEAR_API_KEY, RESEND_API_KEY, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, then wrapped to LINEAR_API_KEY. The target picker received a visible outline and stayed above Save. That is the action I wanted from this count. Searching LINEAR still found no matching field; this does not undo the navigation fix or justify selecting an unrelated secret. [First target](astra-shots/r3-05-next-linear.png); [second target](astra-shots/r3-05-next-resend.png); [last target](astra-shots/r3-05-next-slack.png); [wrap to first](astra-shots/r3-05-wrap-linear.png); [no matching vault field](astra-shots/r3-missing-search.png).

6. **Setup requires translating implementation terms — not fixed.** Starting work-bare from no account still presents “1Password service account” for a Keychain item name, a separate token input, Check, Save token, and footer Save. I could complete it using the supplied `sa-a`, but the screen still expects that prior knowledge. The connection editor's new save boundary fixes complaint 1; it does not make initial connection discovery understandable. [Initial setup, narrow](astra-shots/r3-06-bare-narrow.png); [wide](astra-shots/r3-bare-wide.png).

7. **The alias marker looks like a problem, and long names split inside words — better but not fixed.** I opened the long database variable's ≠ explanation at 400 px: it now adds “Check it is the field you mean.” At both widths, the supplied long name breaks at underscores instead of inside words. Those improvements are visible. The amber marker still makes an intentional alias look unresolved; there is no distinction between an alias I have checked and one I have overlooked. [Expanded explanation](astra-shots/r3-07-alias-narrow.png); [wide wrapping](astra-shots/r3-07-long-wide.png).

8. **Failure explanations overlap the next row — not fixed.** After deliberately selecting the broken field in work, I hovered its failure icon at 1280 px. The bubble still enters STRIPE_KEY's row below. It is a brief, mild annoyance, not a blocker. [Failure bubble over the following row](astra-shots/r3-08-failure-bubble.png).

### Whole-screen use and the earlier rerun findings

The first look is largely unchanged: work is scannable, work-empty has a useful Add instruction, work-many now offers a practical way to reach unfinished rows, and work-bare still demands connection knowledge before I can get started. The import section and prompt continue to occupy substantial narrow-screen space. I inspected all four projects at both widths: [work wide](astra-shots/r3-work-wide.png), [work narrow](astra-shots/r3-02-pass-resize.png), [empty wide](astra-shots/r3-empty-wide.png), [empty narrow](astra-shots/r3-04-empty-narrow.png), [many wide](astra-shots/r3-07-long-wide.png), [many narrow](astra-shots/r3-many-narrow.png), [bare wide](astra-shots/r3-bare-wide.png), [bare narrow](astra-shots/r3-06-bare-narrow.png).

The full work flow completed: add two unfinished variables, deliberately break and repair a mapping, cancel an unfinished connection change while preserving additions, remove and manually restore a row, Save, and reopen. The project stayed first in the list. I also saved and reopened work-bare with its working connection and selected fake mapping. [Reopened work](astra-shots/r3-saved-work.png); [reopened work-bare](astra-shots/r3-bare-saved.png); [final list order](astra-shots/r3-final-projects.png).

The earlier disappearing-Test-result complaint did **not reproduce**. In work-many, the original Test showed “1 failed · 7 set · 4 no field.” A temporary substitution of the readable SENTRY_AUTH_TOKEN field for SENTRY_PROJECT produced “8 set · 4 no field”; the summary remained in both screenshots after resizing, including a resize begun while Test was running. I discarded that substitution using the confirmation dialog. [Original many result](astra-shots/r3-07-long-wide.png); [temporary substitution, wide](astra-shots/r3-many-repaired-wide.png) and [narrow](astra-shots/r3-many-repaired-narrow.png). This is evidence for these runs, not proof that an intermittent result-loss bug can never occur.

The earlier **“All set” overstates the check** nitpick remains. A token substituted for a project name counts as set, and work still reports “All 3 set” while TWILIO_AUTH_TOKEN points to TWILIO_ACCOUNT_SID. The new alias explanation helps, but “fields resolved” would describe the promise more accurately. The screenshots above demonstrate readability without application correctness; I did not save the inappropriate work-many substitution.

### New complaints

None beyond the original eight and the earlier rerun's success-wording complaint. The remaining issues above are reproduced observations, not a list of presumed deferred work.

### Evidence limits and final test state

The claimed field-list refresh after storing a token remains **unverified**: the brief supplied a working stored account, not a replacement token with distinguishable vault contents. I did not invent a token or access the real credential store. A row-level failed Test was observed; a separate transport-wide Test failure was not induced.

Final fake data: work has five variables, including the two unpicked additions and the manually restored STRIPE_KEY at the end, with `sa-a` unchanged. work-bare has `sa-a` / Dev and OLD_VAR mapped to POSTHOG_CLI_API_KEY. work-empty remains empty; work-many retains its original twelve mappings, including four unpicked fields and the deliberately broken SENTRY_PROJECT reference. Browser session `astra2` was closed successfully. No code edits, commits, real credential commands, access to `~/.paseo`, or test-daemon shutdown were performed.

I would recommend this screen to an experienced colleague today, with the remaining annoyances disclosed; a recurrence of unchecked connection saving or disappearing Test results would change my answer.
