---
id:
title: A slow vault list says it is slow, not that the connection is broken
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-picker-slow-hint:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-picker-slow-hint-backlog-1
              briefing:
                id: briefing:project-env-picker-slow-hint:backlog:attempt-1:revision-1
                digest: sha256:87ff607726b6323bfb8b4910998490eee45679cd899804ebfe342c7686371b8d
                room-ref: ./project-env-picker-slow-hint/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-picker-slow-hint:backlog:1
                briefing: briefing:project-env-picker-slow-hint:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T08:38:39.893569Z"
                decision: approve
                reason: '「開這批」 — Captain in FO chat, 2026-11-05. Asked: 「回「開這批」，我就開這 4 個任務，同時派設計」 after FO proposed batch r1b-polish-1 (picker-slow-hint, rate-limit-cause, started-row-visible, journey-map-r1b-catch-up) and recommended opening it.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-11-05T08:40:10Z
---

Batch: r1b-polish-1, approved by the Captain on 2026-11-05 (「開這批」) with four members: project-env-picker-slow-hint, project-env-rate-limit-cause, project-env-started-row-visible, project-env-journey-map-r1b-catch-up. On 2026-10-27 the vault-list task saw the field picker on main give up at 30 s on a 100-item vault with a working connection and show "Plugin RPC timed out" under the hint built in `settings-screen.tsx` ("Close this list, fix the 1Password connection on this page, then open it again."), which sends a person to fix a connection that is fine (archived project-env-vault-list-loads-faster, "Findings from the runs"). Reads are now four at a time, so the limit moved out but did not go away.

## Scope

In: when the field picker's list fails because the call timed out, the picker says the vault took too long to list and what to try, instead of asking the person to fix the connection; other failures keep today's words.
Non-goals: making the list faster; raising any timeout; the Test path; caching.
Budget: one ideation, implementation and validation round; a second validation cycle returns to the Captain.
Stop condition: the acceptance criterion passes and the Captain's UAT is recorded.

## Acceptance criteria

**AC-1**: When the vault list call times out, the picker shows a sentence that says the list took too long and names a next step, and does not tell the person to fix the 1Password connection; a connection failure still shows today's hint.
Verified by: an isolated Paseo with a fake `op` slow enough to hit the timeout, pictures at 1280 and 400 px of both cases, and a unit test that fails when the timeout branch is removed.

## FO alignment

Surfaces: ui
Visible change: A field picker that times out says the vault took too long to list instead of blaming the connection.
Direction alignment with the Captain: done — he answered 「開這批」 on 2026-11-05 to FO's proposed batch naming this task.
Result: the batch question and this Scope.
Release review: paseo-project-env/r1b at 637d05404ccafa198d9f283e1d7d2183c8304dea — signal 1: admitted into r1b under story pick-field ("release 1b bounds the browse and reports a slow or limited vault"); review-release runs at the batch's first implementation dispatch.
Map footprints: not needed: no map answer is recorded by this task.

## Design

Evidence folder: `project-env-picker-slow-hint/design/` in this state checkout. Everything below was run on an isolated Paseo 0.15.1 (own home, port 7391, fake `op` and `security`, no secret read) from a copy of main 6709c72 under `/tmp`; the proposed change is a throwaway copy of the same (`design/evidence/candidate.diff`). No branch, no repository file, no live install touched.

### PRFAQ

**Press release.** A person who opens the field picker on a big vault and waits sees "Listing this vault took too long." and a next step, instead of "Plugin RPC timed out: <plugin id>.invoke" under "Close this list, fix the 1Password connection on this page, then open it again." Their connection was never the problem; now the screen no longer says it is. A connection that really fails keeps today's words.

**FAQ.**
- *What does main show today?* Reproduced: 100 items, each fake `op` call 1.5 s, reads four at a time. After 31.4 to 32.4 s of "Loading the vault…" (5 runs) the picker shows the red line "Plugin RPC timed out: pe-psh.invoke" and, under it, the connection hint (`design/main-timeout-1280.png`, `-400.png`). The same words came from a run with 3 items where every `op item list` waits 35 s (`design/evidence/rpc-wire.txt`).
- *What will it show?* Red line: "Listing this vault took too long." Under it: "Type the reference below instead. A large vault can be too slow to list." The "Type a reference…" row below stays; in the preview I pressed it, typed `op://Dev/Item 5/KEY_5`, pressed Use, and the row KEY_5 was added (`design/proposed-timeout-typed-1280.png`, `-used-1280.png`). The sentence carries no number of seconds: the limit is Paseo's, not ours.
- *Where can a timeout be told apart from a connection failure?* Three places were read. (1) Paseo's plugin host rejects any plugin call that runs 30 s with `Plugin RPC timed out: <pluginId>.<type>` (app bundle, `REQUEST_TIMEOUT_MS = 30000`; the error frame has `code: "handler_error"`, the same code any plugin error gets, so the code does not tell them apart; `rpc-wire.txt`). (2) Our server kills one `op` call after 30 s (`CALL_TIMEOUT_MS`, `run` in `server/secrets.ts`) and classifies it `unreachable`, "1Password could not be reached". That sentence never reached the picker in any run: the daemon's 30 s clock starts when the call is sent and ours after the token lookup, so the daemon always speaks first, even with one call that hangs 35 s. (3) The client error text. The only discriminator is the daemon's sentence in the client error text.
- *Smallest change?* In the client, where the picker's failure line is built (`list` in `settings-screen.tsx`, the `refs.isError` branch): a small pure function `vaultListFailure(rawMessage)` in `shared/field-picker.ts` strips the `Request failed:` prefix and ` requestType=…` suffix as the line does now, and when the text starts with `Plugin RPC timed out` returns the two sentences above; otherwise the same message with today's hint, which moves into the exported constant `FIX_CONNECTION_HINT`. No server change, no new cause in `CAUSES`.
- *What if Paseo changes that sentence?* The match misses and the picker shows today's words, no worse than today. The unit test feeds the sentence, so it cannot notice; the AC-1 rerun on a Paseo (clause b) does. The sentence was seen on this Mac's 0.15.1 today and in the archived run of 2026-10-27 (version not recorded there); not seen on 0.14.0, which the Captain's install may still be.
- *Why not a deadline in our server, say 25 s?* It would give us a sentence of our own, but adds a timer racing a constant we do not own, changes what the reads do, and is the "bound the browse" half of r1b `pick-field` q2, not "report a slow vault". It would also stop the reads the client gave up on: the archived vault-list run found the daemon keeps reading after the client gives up. Out of Scope (non-goal: raising any timeout, making the list faster); stated so the Captain can pull it in.
- *Does the same sentence show on the Test path?* Test builds its own line from the same two regexes in `useMutation` for `test`; this task does not touch it (non-goal).
- *Cost?* One pure function and one constant in `shared/field-picker.ts`, three lines of `settings-screen.tsx` changed, one test file with two tests. No dependency, no server change, no docs page names the old text (`grep` of `docs/project-env`, `OVERVIEW.md`, `docs/journey`).

```mermaid
flowchart TD
  A[Person opens the field picker] --> B[Loading the vault…]
  B -- list returns --> R[Grouped fields, as today]
  B -- daemon times the call out at 30 s --> T["Red: Listing this vault took too long.<br/>Type the reference below instead. A large vault can be too slow to list."]
  B -- op fails fast, e.g. network error --> C["Red: 1Password could not be reached<br/>Close this list, fix the 1Password connection on this page, then open it again."]
  T -- presses Type a reference, types it, presses Use --> V[Variable added with that reference]
  C -- fixes the connection, opens the list again --> A
```

### Existing-code check

Boundary: the picker's failure line, `list` in `client/settings-screen.tsx`, and `VaultList` in `client/field-picker.tsx`. Search: `grep -rn "Close this list\|requestType=" project-env/client project-env/shared project-env/server` finds the hint once (`fix`, used for the list failure and the unusable-token line) and the strip regexes twice (the list line and the Test line). Completeness: the list failure shows the daemon's raw sentence, so it works but misleads; the error row, the "Type a reference…" row and the search hiding are existing and reused unchanged. Need: r1b story `pick-field` q2 ("reports a slow or limited vault"), the vault-list task's finding, and today's reproduction. Unknowns: other Paseo versions' wording (above). Conclusion: repair the existing line with one pure function; build no replacement and no server deadline.

### UI proposal

UI proposal: When the field picker's list call times out, the red line reads "Listing this vault took too long." and the line under it reads "Type the reference below instead. A large vault can be too slow to list."; the "Type a reference…" row below stays and works. Every other list failure keeps its red line and "Close this list, fix the 1Password connection on this page, then open it again."

Preview: /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-picker-slow-hint/design/previews.html

The preview is whole-page pictures from a running isolated Paseo (disposable): `main-*` is today, `proposed-*` is main plus `candidate.diff`; both timeout cases at 1280 and 400 px, the next step operated at 1280, and the connection failure at both widths (its pictures were taken before one hint word changed; that branch is untouched by it). The sidebar shows this Mac's host name; working evidence, not docs pictures.

### Design review

Design review: design/ideation-1.yaml
Design finding 1: AC-1 (clause 6: the reference row, once opened, shows the placeholder `op://Dev/item/field` with the saved vault; `design/proposed-timeout-ref-empty-1280.png`)
Design finding 2: AC-1 (clause 6: the top box stays live in the timeout state, typing a name offers "Add NEW_NAME and pick the field later", as it does today when the list works; `design/proposed-timeout-search-name-1280.png`)
Design finding 3: AC-1 (clause 6: a reference outside the vault or not shaped like one leaves Use off, shows "Use op://Dev/item/field" and keeps the dialog open; `design/proposed-timeout-ref-outside-1280.png`, `-ref-malformed-1280.png`)
Design finding 4: fixed: added the 400 px typed state (`design/proposed-timeout-ref-typed-400.png`: Use shares the row with the input, the hint wraps to two lines); the light theme is not pictured: both lines use the theme tokens of today's error row, so it is a stated limit below

(`design/ideation-1.yaml` is the director's report with only its `preview:` line cut to the path of the Preview line above, because the check compares them exactly; the report as returned is `design/ideation-1.as-returned.yaml`.)

### Acceptance evidence plan

- AC-1, current evidence: (a) today's behaviour reproduced and photographed at both widths (`main-timeout-*`, `main-conn-*`); (b) the proposed text photographed at both widths and operated at 1280 (`proposed-*`) from a throwaway copy; (c) `npm test` on main 6709c72: 325 of 325 pass (`design/evidence/main-npm-test.txt`); on the candidate: 327 of 327, `tsc --noEmit` exit 0 on main and on the candidate; (d) removing the timeout branch fails the timeout test, and changing today's hint fails the connection test (`design/evidence/candidate-tests.txt`). Not yet verified: any of this on the real implementation, and on the Captain's Paseo version.
- AC-1, clauses a reviewer reruns on the implementation: (1) `cd project-env && npm test && npm run typecheck` exit 0, with a test whose input is the raw timeout frame text `Request failed: Plugin RPC timed out: <id>.invoke requestType=plugin.rpc.invoke.request code=handler_error` and a second whose input is a connection failure; (2) replace the timeout branch with `false` and the timeout test fails; (3) `design/evidence/harness/` (`setup.sh` with `N=100 DELAY=1500`, then `shoot.sh` at `W=1280` and `W=400`, `CHECKOUT` pointing at the implementation) shows "Listing this vault took too long." and not "fix the 1Password connection" at both widths, after 30 to 33 s; (4) the same harness with `FAILLIST=1 N=3 DELAY=50` still shows "1Password could not be reached" over the old hint at both widths; (5) `operate.sh` after (3) adds the typed reference as a variable row; (6) `operate2.sh` after (3) shows the placeholder `op://Dev/item/field` in the opened reference row, "Add NEW_NAME and pick the field later" after typing a name in the top box, and Use off with "Use op://Dev/item/field" for `op://Other/x/y` and for `not a reference`. Limits: dark theme only; a fake `op`, not a real large vault or its real time to the timeout. In `proposed-timeout-ref-empty-1280.png` an "Add NEW_NAME" row remains after my script cleared the top box; I did not investigate it and the code it runs is today's.

### Needs decision

None. Open for the gate, not a decision: the sentence's wording is mine and the Captain's UAT reads it; the fix depends on Paseo's own sentence (see "What if Paseo changes that sentence?").

### Batch overlap

`project-env-rate-limit-cause` (ideation, no design yet when read 2026-11-05): will show a rate-limit reply in the picker's failure line, the same `list` branch in `client/settings-screen.tsx`, and adds a heading to `OVERVIEW.md` (this task adds none). `project-env-started-row-visible` and `project-env-journey-map-r1b-catch-up`: none (session start row; the journey YAML). `project-env-test-row-draft-note` (backlog): one sentence on the Test row, another region of `settings-screen.tsx`. No shared test file, table or numbered record; `CHANGELOG.md` is generated. Recommended order: this task first, then `project-env-rate-limit-cause` adds its branch to `vaultListFailure` instead of building a second place that picks the hint.

## Stage Report: ideation

- DONE: Reproduce the 30 s timeout on main with a slow fake `op` on an isolated Paseo and record what the picker shows (picture at 1280 and 400 px).
  100 items at 1.5 s per call: list gives up after 31.4 to 32.4 s (5 runs) with "Plugin RPC timed out: pe-psh.invoke" over the connection hint; `design/main-timeout-1280.png`, `-400.png`; connection failure for contrast in `main-conn-*`.
- DONE: Find where a timeout can be told apart from a connection failure (server cause or client error) and propose the smallest change; quote the proposed sentence.
  The daemon's 30 s plugin-call limit speaks first (frame in `design/evidence/rpc-wire.txt`, `code` is `handler_error` for every plugin error); our own 30 s `op` kill never reached the picker. Change: pure `vaultListFailure` in `shared/field-picker.ts` matching the daemon's sentence in the client; proposed "Listing this vault took too long." / "Type the reference below instead. A large vault can be too slow to list."
- DONE: Write the PRFAQ, Mermaid and the ui artifact the Surfaces value owes, plus AC-1 evidence clauses that a reviewer can rerun.
  `## Design` has PRFAQ, Mermaid, existing-code check, UI proposal, Preview (`design/previews.html`, operated pictures at 1280 and 400), clauses (1) to (6); design review `design/ideation-1.yaml`, 4 MINOR findings: 1 fixed, 3 to AC-1 clauses, 0 declined; `design_surfaces.py check` exit 0.
- DONE: Every project-env change you propose names how `npm test` in project-env stays green; run `npm test` on main once and record the result.
  Main 6709c72: 325 of 325 pass (`design/evidence/main-npm-test.txt`); candidate: 327 of 327 (adds one file, two tests), `tsc --noEmit` exit 0 on both; the change touches no server file or existing test, since no test names the old text.
- DONE: Live probes run only on an isolated Paseo (own PASEO_HOME, fake `op`/`security`); never touch the Captain's live install or its settings, and never read or print a secret value.
  Own home `/tmp/pe-psh/s-*`, port 7391, plugin id `pe-psh`, torn down at the end; no real `op` or `security` run, no secret read.

### AC mapping
- AC-1: current evidence: both cases photographed at 1280 and 400 px on main and on a throwaway candidate; candidate unit tests fail when the timeout branch is removed (`candidate-tests.txt`); next step operated. Not yet verified: the real implementation, Paseo versions other than 0.15.1, a real large vault.

### Findings
- Paseo's host rejects any plugin call at 30 s, so one `op` call that hangs also surfaces as "Plugin RPC timed out", never as our "1Password could not be reached".
- The only discriminator is Paseo's own sentence; a reworded sentence degrades to today's words. Not seen on 0.14.0.
- The daemon keeps reading after the client gives up (archived vault-list run); this design leaves that alone (Non-goals).

### Summary
The picker's list failure gets one pure function that recognises the daemon's timeout sentence and shows "Listing this vault took too long." with a working next step (the existing "Type a reference…" row); every other failure keeps today's words. No decision for the Captain; the sentence wording and the dependence on Paseo's wording are open for the gate. Ideation wrote no repository file, branch or commit.
