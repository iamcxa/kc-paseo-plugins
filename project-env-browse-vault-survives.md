---
id:
title: Browse vault lists fields even when one item cannot be read
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1b
journey-story: pick-field
gates:
    version: 1
    records:
        - id: gate:project-env-browse-vault-survives:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-browse-vault-survives-backlog-1
              briefing:
                id: briefing:project-env-browse-vault-survives:backlog:attempt-1:revision-1
                digest: sha256:e29f9846d02624608745c9068f3ce3b9f7f6cdd4959900b09996caa9867d5813
                room-ref: ./project-env-browse-vault-survives/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-browse-vault-survives:backlog:1
                briefing: briefing:project-env-browse-vault-survives:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-21T08:41:04.452867Z"
                decision: approve
                reason: 'Captain 2026-10-21: 「准」 — accepts this release r1.5 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-21T08:42:14Z
---

Release r1.5 of the paseo-project-env journey: on his own Mac, Kent stores a token only after it is checked, sees why a token fails, edits each variable where it sits, and sees test results that match his draft; his own use accepts it. Captain, 2026-10-20: 「我覺得UI不夠直覺」. Captain accepted this task list on 2026-10-21: 「可以」. Kent hit this on 2026-10-21: Browse vault failed with op's raw "invalid PEM private key passed in" because one item in his vault is typed SSH Key; listRefs runs op item get per item and one failure fails the whole list. Captain confirmed the item and approved this task on 2026-10-21 (「可以」).

## Scope

In: an item that cannot be read is skipped and named with a plain reason; the other fields are still listed; Browse vault errors show cause text, never op output; ideation assesses listing field names without reading values into the plugin. Pulled from story pick-field (r1b): references by ID and a bounded browse stay in r1b. Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: When one item fails to read, the other items' fields are still listed and the failed item is named with a plain reason.
Verified by: in `project-env`, `npm test` runs `test/browse-vault.test.ts`: a fake op vault holds a Login item, a Secure Note with custom fields (its `notesPlain` NOTES field not listed) and an item typed SSH Key whose `op item get` fails with stderr `invalid PEM private key passed in`; the test asserts the readable items' field references are all listed and the SSH Key item is named with the reason `1Password could not read this item (ssh key)`. A second case where an item get fails with a rejected token asserts the list stops with fixed text instead. The first case fails on today's code (probe on main 487b9b0, 2026-10-21: the whole list throws the raw stderr line). Also Kent's own use: Browse vault on his vault lists the other items' fields and names the SSH Key item.

**AC-2**: No Browse vault error shows op output or a value.
Verified by: in the same file, a test puts a fixed sentinel in stderr of a failing `op item list`, of a skipped item's `op item get` and of a rejected-token `op item get`, in malformed stdout of `op item list` and of `op item get`, and a second sentinel as the value of every field of the readable items; it calls the registered `vault.list-refs` handler and asserts neither sentinel appears in the returned result or in a thrown error's message. It fails if the error passes through `RunFailure.message` or `JSON.parse`'s message as today.

## FO alignment

Surfaces: ui
Visible change: Browse vault lists the fields it can read and names the item it skipped.
Direction alignment with the Captain: not needed — the Captain approved this task on 2026-10-21 (「可以」); it pulls part of r1b's pick-field into r1.5 (signal 2), recorded here.
Release review: paseo-project-env/r1.5 at 9489e13

## Design

### PRFAQ

**Press release (future).** When Kent presses Browse vault and one item cannot be read, such as an item typed SSH Key, the rest of the vault still lists, and the item that was skipped is named with a plain reason.

**FAQ**
- *Why does it fail today?* `listRefs` reads each item in one loop with no per-item catch, so one failing `op item get` throws out of the whole list, and `run` makes that error's message op's first stderr line. Observed 2026-10-21 with a throwaway fake op outside the repository (one Login, one item typed SSH Key whose get fails with `invalid PEM private key passed in`, one Secure Note): `listRefs` threw `[ERROR] … invalid PEM private key passed in`, which `settings-screen` shows verbatim in the Browse vault action's `error`.
- *What is skipped, and what stops the list?* An item whose get fails for a reason about that item (op's failure classifies as `unexpected` or `missing-field`, or its output is not JSON) is skipped and named. A failure that would hit every item (`classifyOpFailure` gives `rejected-token` or `unreachable`, which includes a timeout) stops the list with that cause's fixed text, because naming every item as skipped would hide the real problem. A failed `op item list`, a missing token and a missing vault also stop the list with fixed text.
- *What reason is shown?* One fixed phrase, `1Password could not read this item`, followed by the item's type from `op item list`'s `category` key, lower-cased with underscores as spaces (`ssh key`), only when it matches `^[A-Z_]+$`; without a usable `category` the type is left out. No stderr text is ever copied. Recommendation: do not add a class to `CAUSES`. Those eight classes describe a variable failing to resolve (ADR 0002, plain-failure-reason) and the `failure-reason` test requires each to be produced by `resolveProject`; an item skipped by Browse is a different fact. The phrase lives beside `causeText` in `shared/cause.ts`. Past rulings checked: ADRs 0001-0005 name no behaviour for Browse vault beyond 0005's last consequence ("an item typed SSH Key or Document can still fail to read"); `git -C <state> grep -n 'Override:'` finds only archived prose, none about this area.
- *How do whole-list errors stop leaking?* `listRefs` throws `new Error(causeText[cause])` for every failure outside the per-item skip, and treats an unparsable `op` output as `unexpected`; the message never comes from `RunFailure.message` or `JSON.parse`. Recommendation over returning a cause in the result: the client already renders a thrown error under the action, so no new state is drawn.
- *What does the wire look like?* `vault.list-refs` output becomes `{ refs: string[], skipped: { item: string, reason: string }[] }`, with `skipped` defaulting to `[]` so a client older than the daemon still parses (the `cause`-as-plain-string precedent). The reason is final text; the client draws it verbatim.
- *Can listing avoid reading values? (checklist item 2)* No. Assessment of what `op` offers, from `op item get --help` and `op item list --help` on op 2.30.3 on this Mac, 2026-10-21: `op item list --format json` returns item summaries, no fields (its help documents only filters such as `--categories`). `op item get` returns the item's fields; its flags are `--fields label=…|type=…` (which "Return data from specific fields", so it returns their values), `--otp`, `--reveal` ("Don't conceal sensitive fields"), `--share-link`; there is no flag that returns labels or types without values. A direct field read needs a full reference and returns a value. So listing field labels requires `op item get`, and the values reach the daemon's memory; the plugin keeps only `label`, `type` and `purpose` and sends only references over the wire. This adds no new class of exposure: the same daemon process already holds resolved values at session open (ADR 0001). The remaining protections are the test (AC-2's value sentinel) and the code path that drops values at once. Not verified: whether `op item get --format json` includes a concealed field's `value` by default (the reveal flag's text suggests human output conceals it; this session may not run a command that fetches a value), and whether `op item template get` works with a service account (it timed out asking for desktop authorization here, a path the plugin does not use).
- *Is a Secure Note with custom fields still listed?* Yes, unchanged: fields with a label and not purpose `NOTES` are listed, so `notesPlain` is not and the custom fields are. AC-1's test keeps it as a case that must list.
- *Which sibling interfaces?* None needed. `project-env-variable-row-edit` (T3) re-lays the variables card; this task only adds rows right after the Browse vault action and does not touch variable rows or how `refs` fill them. Both edit `client/settings-screen.tsx`; whichever merges second rebases.
- *Non-goals.* Bounding a large vault and rate limits (journey pick-field/q2, release r1b); references by ID, duplicate titles and text-only fields (pick-field/q1, r1b); the variables-card layout (T3); showing a skipped item's fix; a row for an empty vault (unchanged from today); clearing the rows when the account or vault changes (the options already stay until the next Browse).

```mermaid
flowchart TD
  A[Kent presses Browse vault] --> B{token stored?}
  B -- no --> E1[error under Browse: no token stored for this service account]
  B -- yes --> C[op item list]
  C -- fails or not JSON --> E2[error under Browse: fixed cause text]
  C -- ok --> D[op item get, one item at a time]
  D -- readable --> F[its field labels join the references]
  D -- rejected token or unreachable --> E3[stop: error under Browse, fixed cause text]
  D -- any other failure --> G[item joins skipped with the fixed reason and its type]
  F --> H{another item?}
  G --> H
  H -- yes --> D
  H -- no --> I[variable fields offer the references; one Not listed row per skipped item]
```

### Existing-code check

Searches on main 487b9b0, 2026-10-21: `git grep -n -E 'listRefs|item get|item list' -- project-env` finds the loop in `server/secrets.ts`, its handler in `server/contribute.ts`, the rpc in `shared/config.ts` and the caller in `client/settings-screen.tsx`, and no test; `git grep -n -E 'classifyOpFailure|causeText' -- project-env` finds the classifier and the fixed texts. Conclusion: repair `listRefs` in place and reuse the classifier and texts; nothing is replaced. The fake op (`test/fakes/op.mjs`) implements only a field read and `vault list`, so the test seam extends the scenario with per-account `items` (id, title, category, fields) and a per-item failure entry, and answers `item list` and `item get`.

### UI proposal

UI proposal: In the "Environment variables" card of the plugin's settings screen, pressing Browse vault, as today, fills the variable fields with the references it could read. When it skipped an item, one extra row per skipped item appears under the Browse vault action: the item's title as the label and `Not listed: 1Password could not read this item (ssh key)` as the help line. When the list stops (no token, 1Password rejected the token, could not be reached, an unrecognised error), the action shows one fixed sentence as its error, as today's error line does, never op's text. No tool output and no value appears anywhere.

Preview: project-env-browse-vault-survives/design/preview.html

The preview is an operable page, disposable and not Paseo's real styling: open it, press Browse vault, and use the dashed preview controls to switch between one skipped, nothing skipped, all skipped, whole list fails, many skipped and a long title, and between light and dark; `?w=390` draws a phone width. Pictures of it, in the same folder, are `design/preview-*.png`: before browse, loading (desktop light, phone dark), nothing skipped, one skipped (desktop and phone, light and dark), all skipped (desktop light, phone dark), whole list fails (desktop light and dark, phone light, and with the unrecognised-error sentence), eight skipped drawn to the end (desktop light, phone dark), and a long title (phone light, desktop dark). A new Browse vault press clears the previous result first (the loading picture shows no skipped rows), and a failed run leaves no skipped rows. The variables card is drawn as it is today with two variable fields; its layout is variable-row-edit's. Fidelity limit: real rows are Paseo's `SettingsRow` and `SettingsAction`, which have label and help text only, no colour control; the action's error line is drawn red as an approximation.

### Design review

Design review: design/ideation-1.yaml

Design finding 1: declined: rows are Paseo's `SettingsRow`, which has no weight or marker control; the `Not listed:` help text marks the row as a result.
Design finding 2: declined: the type in the reason can differ per item, and a long run of identical rows is the unbounded-vault case journey pick-field/q2 (release r1b) owns.
Design finding 3: declined: spacing of the action's error line is Paseo's `SettingsAction`; the preview only approximates it.
Design finding 4: declined: row height is Paseo's row component; the preview only approximates it.
Design finding 5: declined: Browse vault stays the card's one action, as today.
Design finding 6: declined: button and select size are Paseo's components, unchanged by this task.
Design finding 7: declined: a remedy sentence belongs to the token-cause and setup-guide work (T1 and the setup-guide release); the fixed cause text is the ruled form (ADR 0002).
Design finding 8: fixed: failure in dark, failure with the unrecognised-error sentence, loading on phone dark and eight-skipped pictures added; the previous result clears on a new press and a failure keeps no skipped rows, written into the design above.
Design finding 9: declined: capping or scrolling the skipped list is the bounded browse of release r1b (pick-field/q2); `preview-many-desktop-light.png` and `preview-many-phone-dark.png` are redrawn to the end of the list.
Design finding 10: declined: with every item skipped, each is named with its reason, which is the cue; a silent empty vault is unchanged from today and is a stated non-goal.
Design finding 11: declined: no confirmation after a clean run is today's behaviour and unchanged here.
Design finding 12: fixed: dark and phone pictures added for failure, eight skipped, all skipped and long title; the red error colour is drawn on a dark background in `preview-failure-desktop-dark.png`.
Design finding 13: declined: the select arrow is Paseo's `SettingsSelect`; skipped rows carry no control by design.

## Stage Report: ideation

- DONE: Design listing that survives one unreadable item: skip it, name it with a plain reason, keep listing the rest; the confirmed trigger is an item typed SSH Key whose op item get fails with "invalid PEM private key" (Kent's vault, 2026-10-21); include a Secure Note with custom fields as a case that must still list.
  `## Design` PRFAQ and flowchart: per-item catch, skip only for item-specific failures, stop on rejected token or unreachable; reproduced on main 487b9b0 with a throwaway fake op (list throws the raw stderr line). Secure Note case is in AC-1's test.
- DONE: Assess listing field labels and types without reading values into the plugin (op item get returns values today), and say what op offers for that.
  Design FAQ: op 2.30.3 help shows no labels-only mode; item list has no fields, item get carries values; exposure is no new class (ADR 0001 daemon already holds values). Unverified: concealed values in JSON by default; `op item template get` timed out without desktop authorization.
- DONE: Keep AC-1 and AC-2 with reproducible evidence clauses and produce the artifact the ui surface owes.
  Both ACs keep their first sentence and gain `npm test` / `test/browse-vault.test.ts` clauses; UI proposal, operable `design/preview.html` and 20 pictures; design review `design/ideation-1.yaml` with 13 MINOR findings dispositioned (2 fixed, 11 declined).
- DONE: AC-1 current evidence.
  Not yet verified: the test does not exist; only the failure on today's code is observed (probe, 2026-10-21).
- DONE: AC-2 current evidence.
  Not yet verified: the test does not exist; today's raw stderr line reaching the Browse vault error is observed in the same probe.
- DONE: design_surfaces.py check.
  Output: "project-env-browse-vault-survives.md: design surfaces presentable" / "design review design/ideation-1.yaml: 13 findings, 2 fixed, 0 criteria, 11 declined, 0 decisions", exit 0.

### Summary

Browse vault gets a per-item catch in `listRefs`: an unreadable item is skipped and named (`1Password could not read this item (ssh key)`), while a rejected token or an unreachable 1Password stops the list with fixed text; every Browse error is built from `causeText`, never op or `JSON.parse` text. Recommendations (no Captain decision needed): do not grow `CAUSES`, and throw the fixed text rather than return a cause. Known limits: a missing vault reads with the closest existing text "field not found in the vault"; `category` in `op item list` JSON is unverified here and the type text is dropped without it; bounding a large vault stays in r1b.
