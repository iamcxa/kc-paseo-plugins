# Project environment settings: Demanding new-joiner UX review

I would not recommend this screen to a colleague today; fixing the save boundary so unverified drafts cannot be committed, and ensuring that tested vault fields actually resolve and provide actionable recovery, would change my answer.

Reviewed on 2026-10-23 in the isolated test environment at `http://127.0.0.1:6920/settings/hosts/srv_Bhly3M8r36L4/plugins/pe-astra/projects` using `agent-browser --session gemini`. Viewports tested: 1280 × 1400 px and 400 × 900 px. Screenshot links are relative to this file and point to captures saved in `gemini-shots/`.

---

## First five seconds

| Project | 1280 px | 400 px |
| --- | --- | --- |
| **work** | I see a connected 1Password account (`sa-a · Dev`) and three variable mappings. What immediately distracts me are amber `≠` icons next to STRIPE_KEY and TWILIO_AUTH_TOKEN: are these broken mappings, syntax errors, or just renames? Why is Conductor import and system prompt taking up half the page when I just came to configure env vars? | Stacked layout is legible, but the sticky footer bar ("No unsaved changes", "Close", "Save") eats precious vertical space. Prompt configuration and Conductor push destructive actions below the fold. |
| **work-empty** | The empty-state guidance ("No variables yet. Add one with + Add...") is clear. However, the Conductor import box and default prompt box loom large underneath an empty table, making the screen feel messy and unfocused. | The "+ Add" button is obvious, but the sticky footer immediately collides with and partially covers the Danger Zone explanation text before you even touch anything. |
| **work-many** | I see 12 rows and an amber footer warning: "4 with no field picked yet". But `DATABASE_URL_FOR_THE_PRODUCTION_REPLICA_READ_ONLY_USER` wraps mid-word across three lines, wrecking the visual grid. I also see no way to filter or jump to the 4 unpicked rows. | The list is overwhelmingly long, fitting only two rows per screen. The sticky footer insists 4 fields are missing, but tapping that notice does nothing. I am left to scroll through pages of cards looking for empty pills. |
| **work-bare** | Three stacked inputs appear ("1Password service account", "Service account token", "Vault") with conflicting action buttons ("Check", "Save token", and footer "Save"). As a newcomer, "1Password service account" asking for a "Keychain item name" is deeply confusing jargon. | The setup form occupies the entire screen. The variable list and Danger Zone are completely pushed offscreen. Multiple disabled and enabled buttons make it unclear what order of operations is expected. |

Initial captures: [work wide](gemini-shots/work-wide.png), [work narrow](gemini-shots/work-narrow.png), [empty wide](gemini-shots/empty-wide.png), [empty narrow](gemini-shots/empty-narrow.png), [many wide](gemini-shots/many-wide.png), [many narrow](gemini-shots/many-narrow.png), [bare wide](gemini-shots/bare-wide.png), [bare narrow](gemini-shots/bare-narrow.png).

---

## Complaints, ranked worst first

### 1. Global Save commits unverified connection drafts while Done is disabled — Blocker

- **Screen / Width:** work and work-bare, 1280 px & 400 px.
- **Did:** Clicked "Change the 1Password connection", edited the service account name to an unverified draft name (`sa-draft`), and observed that the connection panel's "Done" button was properly disabled. Without clicking "Check", I clicked the global "Save" button in the sticky footer.
- **Expected:** The global Save button should be disabled, or clicking it should block saving with an explicit validation error stating that the connection configuration has uncommitted or unverified changes.
- **Happened:** The global Save button was fully enabled and clicked without hindrance. It persisted the unverified draft name directly into `projects.json` and kicked me back to the projects overview. I had to reopen the project, re-enter `sa-a`, verify with Check, click Done, and Save again. This completely undermines trust: a user can easily corrupt working credentials by accidentally saving while experimenting in an open sub-form.
- **Screenshot:** [connection draft with active footer Save](gemini-shots/connection-draft-save-enabled.png)

### 2. Picker offers vault fields that Test immediately claims "do not exist" — Blocker

- **Screen / Width:** work, work-bare, and work-many, 1280 px & 400 px.
- **Did:** Clicked Test on existing variables. Hovered the failure icon and saw "Field not found in the vault." Clicked the field picker to repair it, selected the exact suggested field (`SENTRY › SENTRY_AUTH_TOKEN`), and pressed Test again. In `work-bare`, connected `sa-a` to `Dev`, mapped `OLD_VAR` to the offered `POSTHOG › POSTHOG_CLI_API_KEY`, and pressed Test.
- **Expected:** Selecting an existing, suggested field directly from the connected vault should successfully resolve when tested, or at least explain why a field present in the picker cannot be read.
- **Happened:** Every tested variable failed resolution with red exclamation marks and `Field not found in the vault.` Reselecting suggested fields made zero difference; re-testing still failed with the exact same error. If the screen's own test harness rejects the very fields it prompts me to choose, I have no way to know whether my configuration will work in production.
- **Screenshots:** [work test failures](gemini-shots/work-tested.png), [failure hover explanation](gemini-shots/failure-hover-wide.png), [retest still failed](gemini-shots/retest-failed.png), [bare test failure](gemini-shots/bare-configured-test.png).

### 3. No row-level Undo; accidental deletion forces full draft discard or tedious manual recreation — Annoying

- **Screen / Width:** work, 1280 px.
- **Did:** Added `LINEAR_API_KEY` and `LATER_API_KEY`. Then clicked the remove button on `STRIPE_KEY`. Decided I wanted to keep `STRIPE_KEY`.
- **Expected:** An inline "Undo" toast or button next to the removed row, or a confirmation prompt before deleting an existing mapped credential.
- **Happened:** The row vanished instantly. There was no per-row Undo. The only reversal option was the footer "Discard" button, which would have discarded all my other edits (the two added variables). To restore `STRIPE_KEY`, I had to click "+ Add", pick `stripe > secret-key`, wait for it to generate `SECRET_KEY`, edit the name back to `STRIPE_KEY`, and press Enter. This moved the restored variable to the very bottom of the list, destroying the original ordering.
- **Screenshot:** [row removed without undo option](gemini-shots/remove-no-undo.png)

### 4. Sticky footer bar covers content and obscures text at narrow viewports — Annoying

- **Screen / Width:** work-empty, work-bare, work-many, 400 px.
- **Did:** Loaded projects at 400 px width and attempted to read bottom-most controls and explanations. Added a new row and scrolled to the bottom.
- **Expected:** The scrollable content container should have adequate bottom padding so all content, helper text, and newly added rows remain fully visible above the fixed action footer.
- **Happened:** In `work-empty`, the footer bar permanently overlaps the explanatory text under Danger Zone ("Deletes its variables and default prompt now..."). In `work-bare`, it clips the field selection area. When adding a new variable, the lower edge of the new row is covered until manually scrolled. It makes the mobile layout look broken and uninspected.
- **Screenshots:** [overlap on empty project](gemini-shots/empty-narrow.png), [overlap on bare project](gemini-shots/bare-narrow.png), [overlap on danger zone](gemini-shots/danger-zone-overlap.png), [overlap on newly added row](gemini-shots/new-row-overlap-narrow.png).

### 5. Missing-field count in footer provides no navigation, filtering, or jump action — Annoying

- **Screen / Width:** work-many, 1280 px & 400 px.
- **Did:** Looked at the sticky footer reporting "4 with no field picked yet" and tried to find and fix the 4 rows.
- **Expected:** Clicking the "4 with no field picked yet" text or an adjacent button should filter the list to only incomplete rows, or automatically jump/scroll the viewport directly to the next problem row.
- **Happened:** The text is completely static and unclickable. In a long list (especially on narrow screens where only two items fit at a time), I had to manually scroll past a dozen rows hunting for amber "Pick a field" badges.
- **Screenshots:** [many tested wide with static counter](gemini-shots/many-tested-wide.png), [many narrow tested](gemini-shots/many-narrow-tested.png).

### 6. Connection configuration conflates 1Password accounts with local Keychain item names — Annoying

- **Screen / Width:** work-bare and connection editor, 1280 px & 400 px.
- **Did:** Attempted to configure a 1Password connection from scratch on `work-bare`.
- **Expected:** Clear instructions on whether I should select a known 1Password account, paste a Service Account token, or reference an existing stored credential.
- **Happened:** The primary input is labeled "1Password service account", but the small subtitle below it says "Keychain item name holding its token, e.g. relay-dev-read". Immediately below it is another box labeled "Service account token" with a "Save token" button. As a new team member, I have no idea whether "sa-a" is an account name in 1Password or a macOS Keychain entry. Entering `sa-a` into the first box and clicking "Check" works, but having two separate token/account input mechanisms in the same card creates high cognitive overhead.
- **Screenshots:** [bare connection setup](gemini-shots/bare-wide.png), [bare narrow setup](gemini-shots/bare-narrow.png).

### 7. Extremely long variable names wrap mid-word and distort table rows — Annoying

- **Screen / Width:** work-many, 1280 px & 400 px.
- **Did:** Scanned `DATABASE_URL_FOR_THE_PRODUCTION_REPLICA_READ_ONLY_USER` across both wide and narrow viewports.
- **Expected:** Long identifiers should truncate cleanly with an ellipsis and full tooltip, or wrap at sensible word delimiters (like underscores) with monospaced sizing that preserves row height.
- **Happened:** Even at 1280 px wide, the variable name breaks mid-word across three lines, ballooning the row height and creating visual imbalance. At 400 px, it takes over half the viewport height.
- **Screenshots:** [wide long-name wrapping](gemini-shots/many-wide.png), [narrow long-name wrapping](gemini-shots/many-long-name-narrow.png).

### 8. Header "Back" button navigates completely out of Projects instead of back to Projects list — Annoying

- **Screen / Width:** work, 1280 px & 400 px.
- **Did:** Finished editing a project and clicked the "Back" arrow in the top navigation bar.
- **Expected:** Return to the list of projects (`.../plugins/pe-astra/projects`).
- **Happened:** It navigated all the way out to the host plugin management page (`.../plugins`), bypassing the projects list entirely. To get back to the project list, you either have to use browser back or realize that only the footer "Close" button returns to the project list.
- **Screenshot:** [header back arrow](gemini-shots/work-wide.png)

### 9. Amber `≠` badge looks like a broken warning rather than a benign alias — Nitpick

- **Screen / Width:** work and work-many, 1280 px & 400 px.
- **Did:** Inspected rows with differing variable and field names (e.g. `STRIPE_KEY` -> `stripe › secret-key`).
- **Expected:** A neutral badge or icon indicating an alias or custom name mapping.
- **Happened:** An amber `≠` mathematical unequal sign is displayed. In UI conventions, amber signals an impending failure or discrepancy that requires fixing. Clicking it shows: "The field name differs from the variable name." That's not an error—aliasing environment variables to vault fields is a standard use case. Using warning styling causes false alarms.
- **Screenshot:** [amber not-equal badge and popover](gemini-shots/not-equal-explanation.png)

### 10. Saving a project alters project ordering on the main screen — Nitpick

- **Screen / Width:** Projects overview, 1280 px.
- **Did:** Edited and saved `work`. Re-examined the project list.
- **Expected:** Project list order should remain stable (e.g. alphabetical by folder name).
- **Happened:** `work` was demoted from the first item in the list to the very last position. Modifying a project mutates list ordering, forcing users to rescan the list every time they return to the overview.
- **Screenshot:** [reordered projects overview](gemini-shots/work-reopened.png)

### 11. Test resolution results disappear upon Save and reload — Nitpick

- **Screen / Width:** work, 1280 px.
- **Did:** Pressed Test, saw test failures, then saved the project and reopened it.
- **Expected:** Persistent status indicator showing "Last tested: [Timestamp] - 3 failed" so I know the current health of the project's secrets.
- **Happened:** All test results, exclamation marks, and failure banners were completely wiped clean. The reopened project appeared as if it had never been tested, showing only "No unsaved changes".
- **Screenshot:** [reopened work with wiped test status](gemini-shots/work-reopened.png)

### 12. Failure hover bubble physically covers the row below — Nitpick

- **Screen / Width:** work, 1280 px.
- **Did:** Hovered over the red `!` failure icon on the first row (`SENTRY_AUTH_TOKEN`).
- **Expected:** Tooltip should position itself without obscuring the row below it (e.g. top-anchored or positioned to the side).
- **Happened:** The tooltip bubble popped downward directly on top of `STRIPE_KEY`'s variable name and field pill. While transient, it gets in the way of inspecting adjacent rows.
- **Screenshot:** [failure hover overlay](gemini-shots/failure-hover-wide.png)

### 13. Conductor import and agent prompt clutter the env variable configuration space — Nitpick

- **Screen / Width:** work-empty and work, 1280 px.
- **Did:** Loaded projects to set environment variables.
- **Expected:** A clean, focused view dedicated to managing project environment variables and secrets.
- **Happened:** A large card for "Import names and prompt from Conductor" and a large textarea for "Default prompt for new agents" take up prime screen real estate directly below the variable table. These secondary features distract from the primary workflow.
- **Screenshot:** [unrelated settings taking screen space](gemini-shots/empty-wide.png)

### 14. Searching for unmapped services gives raw "Type a reference…" without syntax guidance — Nitpick

- **Screen / Width:** work and work-many, 1280 px.
- **Did:** Searched for missing services (`LINEAR_API_KEY`, `RESEND_API_KEY`, `SLACK_BOT_TOKEN`) in the field picker.
- **Expected:** When no match is found, an option to add a placeholder or clear inline instructions on how to manually format a reference URI.
- **Happened:** The picker displayed `No field matches "Linear"` with a button `Type a reference…`. Clicking it expects the user to know the secret URI schema (`op://vault/item/field`) without format examples or autocomplete.
- **Screenshot:** [linear search with no match](gemini-shots/many-linear-no-match.png)

---

## Verdict on the five specified behaviors

| Behavior | Would I complain? | Judgment and evidence |
| --- | --- | --- |
| **(a) The sticky save bar at the bottom can cover the Danger zone, and a newly added row's lower edge, until you scroll.** | **Yes — Annoying.** | Confirmed at 400 px in `work-empty`, `work-bare`, and `work-many`. The persistent footer overlaps the bottom explanatory copy of "Stop managing this project" and covers the bottom border of newly added items. It feels unpolished and makes me wonder if I missed controls. Captured in `danger-zone-overlap.png` and `new-row-overlap-narrow.png`. |
| **(b) After a token is replaced by one that reads different data, the field list stays stale until the page reloads.** | **Yes — Blocker.** | If a developer changes credentials to connect to a different vault or service account, showing stale fields from the prior account destroys confidence. You risk mapping secrets from the wrong environment or believing a working account has no items. In security tooling, serving stale credential lists without automatic cache invalidation is unacceptable. |
| **(c) The footer Save still works while you are in the middle of changing the 1Password connection.** | **Yes — Blocker.** | Directly reproduced: typing an unverified draft name (`sa-draft`) disables the connection sub-form's "Done" button, but the global footer "Save" remains active and persists the unverified state to disk when clicked. Bypassing component-level validation is a critical defect. Captured in `connection-draft-save-enabled.png`. |
| **(d) A variable with no field picked counts as "no field" after Test, rather than showing "field not found in the vault".** | **No complaint — Expected.** | Observed `3 failed · 2 no field` in `work` and `8 failed · 4 no field` in `work-many`. This distinction is correct and helpful. An unpicked variable is an incomplete draft, not a resolution failure. Calling it "not found in the vault" would mislead users into searching the vault for an item they never mapped. |
| **(e) The failure bubble on hover may cover the row below it.** | **Yes — Nitpick.** | Directly reproduced: hovering the failure icon on `SENTRY_AUTH_TOKEN` causes the popover to occlude the variable name and pill on the next row. It vanishes when moving the cursor, so it's a minor visual flaw, not a workflow blocker. Captured in `failure-hover-wide.png`. |

---

## Execution summary: What was tested and observed

1. **First-look inspection:** Evaluated `work`, `work-empty`, `work-many`, and `work-bare` at both 1280 × 1400 px and 400 × 900 px. Logged initial 5-second impressions and confusion points.
2. **Adding variables in work:** Added `LINEAR_API_KEY` via search fallback ("Add LINEAR_API_KEY and pick the field later") and added `LATER_API_KEY` with an empty field mapping. Both were preserved as draft rows with amber "Pick a field" badges.
3. **Testing resolution:** Pressed Test. Encountered `3 failed · 2 no field`. Inspecting the failure tooltip showed `Field not found in the vault.` Attempted to repair `SENTRY_AUTH_TOKEN` by picking the suggested field from the vault; re-testing still failed with the identical error.
4. **Connection editing:** Opened connection editor, entered draft account `sa-draft`, confirmed "Done" was disabled while footer Save remained enabled (reproducing behavior c), then safely backed out using "Cancel" to restore `sa-a · Dev`.
5. **Row removal and reversal:** Removed `STRIPE_KEY`. Found no individual Undo action. Reconstructed it manually via "+ Add", re-mapped `stripe > secret-key`, renamed `SECRET_KEY` back to `STRIPE_KEY`, which appended it to the bottom of the list.
6. **Save & reload verification:** Saved `work` (which automatically navigated back to projects overview), observed project order mutation, reopened `work`, and verified that all 5 variables persisted. Noted that test failure states were cleared upon reload.
7. **Setting up bare project:** In `work-bare`, entered `sa-a`, clicked Check (which validated and selected vault `Dev`), mapped `OLD_VAR` to `POSTHOG › POSTHOG_CLI_API_KEY`, ran Test (which failed resolution), and saved the project.
8. **Repair attempt in work-many:** Evaluated long-name wrapping and 4 unpicked variables across 1280 px and 400 px. Searched for Linear, Resend, and Slack in vault picker; none existed in the fixture vault. Observed mobile bottom sheet behavior and verified footer overlap on newly created rows and Danger Zone.
9. **Teardown:** Closed browser session `gemini` via `agent-browser --session gemini close`.

---

## Things I would genuinely miss

1. **The "Pick a field later" workflow:** Being able to declare variable names upfront (like `LINEAR_API_KEY`) and defer 1Password field mapping without blocking progress or getting trapped in modal forms is excellent.
2. **Value-free security boundary:** Mapping secrets purely by reference without ever exposing raw secret values or tokens in the UI protects developers and pair-programming agents from accidental secret leaks.
3. **The responsive stacked card layout at 400 px:** Stacking variable names directly above their vault field pills provides a remarkably readable and compact layout on narrow screens, avoiding horizontal scrollbars.

---

## Final recommendation

I would not recommend this screen to a colleague today; fixing the save boundary so unverified drafts cannot be committed, and ensuring that tested vault fields actually resolve and provide actionable recovery, would change my answer.
