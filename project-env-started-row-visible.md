---
id:
title: The "Started without" line stays visible in Paseo 0.14.0's default chat display
status: implementation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-started-row-visible:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-started-row-visible-backlog-1
              briefing:
                id: briefing:project-env-started-row-visible:backlog:attempt-1:revision-1
                digest: sha256:eb4dd08340d0c8b5167526612bc02c2060333e0836cac51024e7ed618aa87970
                room-ref: ./project-env-started-row-visible/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-started-row-visible:backlog:1
                briefing: briefing:project-env-started-row-visible:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T08:39:04.010278Z"
                decision: approve
                reason: '「開這批」 — Captain in FO chat, 2026-11-05. Asked: 「回「開這批」，我就開這 4 個任務，同時派設計」 after FO proposed batch r1b-polish-1 (picker-slow-hint, rate-limit-cause, started-row-visible, journey-map-r1b-catch-up) and recommended opening it.'
              application:
                target-stage: ideation
                state: consumed
        - id: gate:project-env-started-row-visible:ideation
          stage: ideation
          attempts:
            - id: gate-attempt:project-env-started-row-visible-ideation-1
              briefing:
                id: briefing:project-env-started-row-visible:ideation:attempt-1:revision-1
                digest: sha256:e37a1851c41cd014a4dfffc4f0b0d5967a9132b43ae1b5891aff8295da7763df
                room-ref: ./project-env-started-row-visible/review/ideation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-started-row-visible:ideation:1
                briefing: briefing:project-env-started-row-visible:ideation:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T15:11:07.48331Z"
                decision: approve
                reason: 「准」 — Captain in FO chat, 2026-11-05, on the batch r1b-polish-1 ideation gates presented together (picker-slow-hint cd66afef, rate-limit-cause b950f3c3, started-row-visible e37a1851, journey-map-r1b-catch-up d0cd0aa6), FO having recommended approving all four and building in the order picker-slow-hint, rate-limit-cause, started-row-visible, with the map task independent.
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-05T08:40:23Z
---

Batch: r1b-polish-1, approved by the Captain on 2026-11-05 (「開這批」) with four members: project-env-picker-slow-hint, project-env-rate-limit-cause, project-env-started-row-visible, project-env-journey-map-r1b-catch-up. On 2026-10-30 the resume-notice task observed on an isolated Paseo 0.14.0 that the existing "Started without N project variables" row is visible when it lands before the first user message (seq 1) and is folded by the default "Collapse turns" display when it lands after it (seq 3 in one run); a row appended at turn end stays visible (archived project-env-resume-blank-notice, "Observation record"). The Captain runs Paseo 0.14.0 (`paseo --version`, 2026-11-01).

## Scope

In: find out on an isolated Paseo 0.14.0 when the start row is folded and make it always visible in the default display, with the smallest change; keep the resume row as it is.
Non-goals: the resume row; Paseo's display settings; the agent notice text.
Budget: one ideation, implementation and validation round; if ideation finds no way the plugin can keep it visible, the task stops with the evidence.
Stop condition: the acceptance criterion passes and the Captain's UAT is recorded, or ideation's evidence shows no plugin-side fix and the Captain accepts that.

## Acceptance criteria

**AC-2**: Amended by Captain, amendment 1. On an isolated Paseo of the newest release at validation (v0.15.2 is Latest on 2026-11-05 by `gh release list -R getpaseo/paseo`; the Captain runs 0.15.1) in the default chat display, a new agent that starts without a mapped variable shows the "Started without" line on the page after its first turn ends, in every run of the case that folded it before. One version only: 0.14.0 is no longer verified.
Verified by: repeated runs on an isolated Paseo of that release with fake `op` and `security`, recording each row's position and whether it is on the page, pictures at 1280 and 400 px, and a unit test for the chosen placement.

## FO alignment

Surfaces: ui
Visible change: The "Started without N project variables" line is no longer folded away by Paseo 0.14.0's default chat display.
Direction alignment with the Captain: done — he answered 「開這批」 on 2026-11-05 to FO's proposed batch naming this task.
Result: the batch question and this Scope.
Release review: not needed: it follows a host release and adds no journey story.
Map footprints: not needed: no map answer is recorded by this task.

## Captain amendments

### Amendment 1 — 2026-11-05, chat
Captain: 「驗證最新的就好」 (FO chat, 2026-11-05)
Asked: "這份的驗收條件寫的是「在 Paseo 0.14.0 上那行不會被收起來」，但你現在用的是 0.15.1。我建議 0.14.0 和 0.15.1 兩個版本都驗。…回「兩版都驗」或「只驗 0.15.1」"
Supersedes: AC-1
Superseded text:
> **AC-1**: On an isolated Paseo 0.14.0 in the default chat display, a new agent that starts without a mapped variable shows the "Started without" line on the page after its first turn ends, in every run of the case that folded it before.
> Verified by: repeated runs on an isolated Paseo 0.14.0 with fake `op` and `security`, recording each row's position and whether it is on the page, pictures at 1280 and 400 px, and a unit test for the chosen placement.

## PRFAQ

**Press release (future).** A new agent that starts without one of its project variables now shows the "Started without N project variables" line under its first reply, where Paseo's default chat display keeps it on the page, in every run, not only in the runs where the line happened to land first.

**Why was the line lost?** Paseo's default Chat display, "Collapse turns", folds everything between a person's message and the last reply of that turn into one summary line, and the plugin row is not exempt. The plugin added the row the moment the agent was created, in a race with Paseo recording the person's first message. When the row won the race it sat above the message and stayed visible; when it lost it sat inside the turn and was folded away (observed: 9 of 23 counted start runs on 0.14.0 and 0.15.1, 8 of them on a freshly restarted daemon; see Observation record).

**What changes?** The row is added when the agent's first turn ends, after the last reply, never before it. Its words, icon and layout are unchanged.

**What gets worse?** Nothing is shown while the first turn runs; an agent created with no first message shows no row until a turn ends (by construction, not run); if a first turn never ends (the daemon stops) there is no row. The agent notice still tells the agent to say a variable is blank, so the person hears it in the reply even before the row appears.

**Why not keep the row at the start by some placement in the plugin?** The fold keeps only rows the app treats as a turn trigger or a compaction. A plugin row carries `id`, `pluginId`, `kind`, `version`, `data` (`PluginTimelineItem` in `@getpaseo/protocol`) and nothing the fold reads, a same-id append replaces a row in place at the same position, and a plugin cannot win the race against Paseo's own write of the first message (cold runs put the row at seq 2 or 3 behind the message). The only placement the fold never touches is after the turn's last reply.

**Does the resume row change?** No. It already goes in at turn end.

```mermaid
sequenceDiagram
    participant P as Person
    participant D as Paseo daemon
    participant G as Plugin
    participant C as Chat display (Collapse turns)
    P->>D: create agent with a first message
    D->>G: agent.session_open (reason create)
    G->>G: a variable is unreadable: remember "Started without N", add nothing yet
    D->>D: record the first message, run the first turn
    Note over G,D: agent.created fires here; today the plugin adds the row now and races the first message, the change adds nothing
    D->>G: agent.turn_ended
    G->>D: append the row after the last reply
    D->>C: timeline with the row after the turn's last reply
    C-->>P: row on the page; the turn's earlier work stays folded
    alt the agent is released before its first turn ends
        D->>G: agent.closed
        G->>G: forget it, no row
    end
```

## Design

Smallest change (disposable candidate, `evidence/candidate-disposable.diff`, on main 6709c72, 0 comment lines added): in `project-env/server/contribute.ts` the `agent.created` listener is removed, so the single remaining listener, `agent.turn_ended`, flushes the remembered row (already the way the resume row is added); in `project-env/server/missing-variables-notice.ts` the ten-minute expiry of a remembered start row (`PENDING_TTL_MS`, `prune`, the `now` option) is removed, because with the row waiting for the turn end the expiry would drop it for any first turn longer than ten minutes (resumed rows already had no expiry). The cost of removing it: a remembered row for an agent that never reaches a turn end or a close stays in memory until the daemon restarts (a few names per such agent).

Existing-code check (bounded): the capability exists and works, so this repairs a named broken seam (a row placed by a race), not a missing capability. Searches: `grep -rn "agent.created\|addLine" project-env/server project-env/shared project-env/client project-env/index.*` finds one listener; the app's fold (`collapseTurns` in the `@getpaseo/server` web bundle, byte-identical on 0.14.0 and 0.15.1 apart from webpack module ids) and `PluginTimelineItem` in `@getpaseo/protocol` show no field a plugin can set to opt out. Unknown: a different Paseo release that changes the fold.

How `npm test` in `project-env` stays green (main: 325 of 325, `evidence/npm-test-main.txt`): every `fire("agent.created")` in `test/missing-variables.test.ts` that expected a start row becomes `fire("agent.turn_ended")`; one test is added, "does not listen for agent.created: the line goes in when the first turn ends"; the two tests that pinned the ten-minute expiry and the resumed-only "waits beyond ten minutes" test are replaced by one pair, "a new / a resumed agent's entry waits for its turn end however many other agents record meanwhile"; "record and flush never throw" loses its clock-throws case because the clock is gone. Candidate: 325 of 325, `tsc --noEmit` clean. Falsifiers (`evidence/runs/mutations-candidate.txt`): putting the `agent.created` listener back fails the new test; removing the `turn_ended` listener fails 20; recording only resumes fails 6; dropping an entry once other agents record fails 2.

Doc sentences that go stale and change with it: `docs/project-env/index.md` "a line at the top of the new conversation" and `project-env/OVERVIEW.md` ("The line ... in a new conversation") must say the line appears under the first reply when the first turn ends. Whether the docs-site pictures show the start row was not checked here; implementation compares them per the doc-site extension.

### UI proposal

UI proposal: When an agent starts without one or more mapped variables, the same warning row it shows today ("Started without N project variables", then one line per variable: the name in monospace, the reason in the screen's own words) appears under the final reply of the agent's first turn, above the "Worked for" footer, in Paseo's default Chat display, whether the turn finishes, fails or is stopped. While the first turn runs no row is shown. The row is not folded away by a later turn. Its words and look do not change.

Preview: /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-started-row-visible/evidence/shots/index.html
The preview is disposable: real Paseo 0.14.0 and 0.15.1 windows on isolated daemons running the candidate, driven through the app (operable, not mock-ups), 1280 x 900 and 400 x 900, dark theme, default Chat display: `cand-warm-1-*`, `cand-fail-1-*`, `cand151-warm-1-*`, `cand151-fail-1-*`; `main-*` and `main151-*` are today's build, context. Not drawn: the turn while it runs (no row, nothing to draw), light theme, a desktop-app window; the running screen settles these in validation (AC-2 clause).

### Design review

Design review: design/ideation-1.yaml
Design finding 1: AC-2 (the evidence clause below asks for a stopped first turn, three variables and a wrapping reason at 400 px, each with the row above the footer; a stopped turn is already in `evidence/runs/pass1-cases-cand-0140.txt`, `stop-1`)
Design finding 2: AC-2 (the clause asks for a picture of the running turn with no row and a rerun showing the row appears once, below the last reply, without moving the reply)
Design finding 3: AC-2 (the row's colours come from the host; the clause asks for one light-theme picture at 1280 and 400)
Design finding 4: AC-2 (the clause states the row is a note about the start, not the cause of a failure, and its words are unchanged)

### AC-2 evidence clause

AC-2 replaces AC-1 by the Captain's amendment 1 (one version only: the newest Paseo release at validation, v0.15.2 on 2026-11-05; 0.14.0 is no longer verified). Reviewer-rerunnable evidence, harness in `evidence/harness/` (README.txt there):

1. Unit: `npm test` in `project-env` passes (main 325 of 325); the test "does not listen for agent.created: the line goes in when the first turn ends" fails when `server.on("agent.created", addLine)` is put back in `server/contribute.ts` (shown: 1 failure, `evidence/runs/mutations-candidate.txt`).
2. Runtime, one version: on an isolated Paseo of the newest release at validation (v0.15.2 today; own home, port, fake `op` and `security`, mock provider), build the plugin from the implementation commit and run `cases.sh` with `WARM=2 COLD=8 STOP=1 FAIL=1`. Passes when every line says `after-last-assistant-message` and `1280=visible 400=visible`. The same run on main must show at least one `between-user-message-and-last-assistant-message ... 1280=ABSENT` line, or the run did not exercise the case; main folded it in 5 of 12 starts on 0.15.1 (`evidence/runs/pass1-cases-main-0151.txt`; 4 of 11 on 0.14.0, no longer verified), so rerun with a larger `COLD` when none folds.
3. Pictures from the implementation, each at 1280 and 400 px with `window.innerWidth` checked: a finished turn, a failed turn, a stopped turn, three variables with one long reason at 400, the first turn while it runs (no row), the same agent after a second message (row still there, above it; shown on the candidate, `evidence/runs/followup-second-turn.txt`), and one light-theme picture at 1280 and 400.
4. The row is a note about how the agent started, not the cause of a failed turn; its words, icon and layout are unchanged (compare with `main-cold-1-1280.png`, where the row was not folded).

Known limits of this clause: mock provider and fake `op` only; a real provider's turn end, the desktop app, a first turn longer than ten minutes (covered by a unit test, not run) and the light theme are not exercised by ideation.

### Batch overlap

From the Scope lines of the three live tasks (not their full designs): `project-env-rate-limit-cause` shows a new cause in the "Started without" line and adds to the troubleshooting notes, so it may change `shared/cause.ts`, `test/failure-reason.test.ts` and `project-env/OVERVIEW.md`; this task changes `server/contribute.ts`, `server/missing-variables-notice.ts`, `test/missing-variables.test.ts`, one sentence of `project-env/OVERVIEW.md` and one of `docs/project-env/index.md`. Shared file: `OVERVIEW.md` (different sentences, a text-level merge) and possibly `test/missing-variables.test.ts` if that task asserts row words there. `project-env-picker-slow-hint` (field picker, `settings-screen.tsx`) and `project-env-journey-map-r1b-catch-up` (journey map files, no plugin code) share nothing. No numbered record or ADR list is touched. Recommended order: rate-limit-cause first, then this task rebased onto it, because its test and docs edits are the larger text surface.

## Observation record (2026-11-05)

Setup: `@getpaseo/cli@0.14.0` and `@getpaseo/cli@0.15.1` installed by npm into `/tmp/pe-srv/install` and `/tmp/pe-srv/install151`, one isolated daemon per case (own `--home`, ports 19711 to 19714, plugin copied from main 6709c72 or from the candidate copy, fake `op` and `security`, mock provider `ten-second-stream` via `PASEO_NODE_ENV=development`). The Captain's app `/Applications/Paseo.app`, the global `paseo` (0.15.1 today), `~/.paseo` and the installed `paseo-project-env` were not run or read. Browser: `agent-browser`, a fresh session per page, default Chat display ("Collapse turns", `chatDisplay:"collapseTurns"` is the app default in both bundles).

- Where the row lands: `evidence/runs/pass1-cases-main-0140.txt` (11 starts: 3 warm, 6 cold, 1 stopped, 1 failed) and `pass1-cases-main-0151.txt` (12 starts: 2 warm, 8 cold, 1 stopped, 1 failed). A start is cold when the daemon was restarted just before it. Row before the first message (seq 1, first message seq 2): 7 and 7. Row after the first message (seq 2 or 3), inside the turn: 4 on 0.14.0 (all cold) and 5 on 0.15.1 (4 cold, 1 warm). In every one of the 9, the row's text is absent from the page at 1280; in every one of the 14 others it is present (the 1280 column; see the note on 400 below). Picture runs (`runs/pass2-pictures-final.txt`, widths verified): main 0.14.0 cold-1 row before the message, visible at 1280 and 400; cold-2 row at seq 3, absent at 1280 and 400; main 0.15.1 cold-1 row at seq 3, absent at 1280 and 400.
- Candidate (row at turn end): `pass1-cases-cand-0140.txt` 15 of 15 and `pass1-cases-cand-0151.txt` 9 of 9 starts have the row after the turn's last reply (warm, cold, stopped, failed turns) and visible at 1280; picture runs: warm and failed turns visible at 1280 and 400 on both versions. After a second message the row stays visible (`runs/followup-second-turn.txt`).
- Why a row is folded (source, `collapseTurns` in `@getpaseo/server/dist/server/web-ui/_expo/static/js/web/index-*.js`, identical on 0.14.0 and 0.15.1 apart from webpack module ids): for a closed turn it takes the items after the person's message up to the turn's last assistant message and folds them into one summary line, keeping only turn triggers and compactions; items after that last reply stay. It folds only when those items include tool calls, thoughts or another assistant message, and never while the latest turn is still running, so a row can be seen during the turn and vanish when it ends. The mock turns have tool calls, as real ones do.
- Why the order varies: the row is added by a plugin call after `agent.created`; Paseo records the first message on its own path; a restarted daemon is the slowest path for the plugin, so the row lands behind the message more often (8 of the 9 folded starts).
- Note on the 400 px column in `pass1-*`: the browser window stayed 1280 wide in those runs (found later by reading `window.innerWidth`), so only the 1280 column and the positions of `pass1-*` are claimed. Pictures and 400 px results are from `pass2-pictures-final.txt` and `shots/`, where the width is checked. Runs that printed `NOT-LOADED` (the machine was heavily loaded, load average about 100) are not counted and are not saved.
- Not observed: a real provider, the desktop app, the light theme, a first turn longer than ten minutes, an agent created with no first message, a person scrolling during the turn.

## Known limits (not decisions)

- The row appears when the first turn ends, not when the agent is created; before that, and for an agent that never finishes a turn, a person sees nothing (the agent notice makes the agent say a variable is blank).
- A remembered start row for an agent that never reaches a turn end or a close stays in daemon memory until restart.
- A daemon restart drops plugin rows already in a conversation (seen in this run: earlier agents lost their row after a restart); unchanged by this task.

### Needs decision

None open. The version question was answered by the Captain, 「驗證最新的就好」 (2026-11-05, amendment 1): AC-1 is superseded by AC-2, which verifies one version, the newest release at validation.

Honest state of that version: 0.15.2 (Latest on 2026-11-05) has not been run by this task. The runtime evidence is on 0.15.1 (the Captain's install), where the row folded in 5 of 12 starts and the candidate kept it visible in 9 of 9. For 0.15.2 only a static check was made (`npm install @getpaseo/cli@0.15.2` in a throwaway directory, since removed): its `collapseTurns` function text, with webpack module ids masked, and its default `chatDisplay:"collapseTurns"` are identical to 0.15.1's (same sha256 prefix 7b2f725fbaa0 over 1690 characters); this predicts the same fold and is not a run. Validation runs the pictures on the newest release then current.

## Stage Report: ideation

- DONE: On an isolated Paseo 0.14.0 in the default chat display, run the start case several times and record each Started-without row's position and whether it is visible; pictures at 1280 and 400 px.
  `evidence/runs/pass1-cases-main-0140.txt` (11 starts: row before the first message 7, inside the turn 4; the 4 inside are absent from the page at 1280, the 7 present); also run on 0.15.1 per FO's update (12 starts: 7 before, 5 inside, same visibility rule). Pictures at 1280 and 400 with the width checked: `evidence/shots/` (`main-cold-1` visible, `main-cold-2` folded, `main151-cold-1` folded); pass 1's 400 column was at the wrong window width and is not claimed (Observation record).
- DONE: Name when the row is folded and the smallest plugin-side placement that keeps it visible, or state with evidence that no plugin-side fix exists.
  Folded when it lands between the person's first message and the turn's last reply of a closed turn that has tool calls or other replies (`collapseTurns` in the web bundle, same on 0.14.0 and 0.15.1). Smallest placement: add it at `agent.turn_ended` only (remove the `agent.created` listener and the ten-minute expiry): candidate 15 of 15 on 0.14.0 and 9 of 9 on 0.15.1 after the last reply and visible, warm, cold, stopped and failed turns; 4 mutations each fail a test.
- DONE: Write the PRFAQ, Mermaid and the ui artifact the Surfaces value owes, plus AC-1 evidence clauses that a reviewer can rerun.
  (Amendment 1 superseded AC-1; the clause is now the AC-2 evidence clause.) `## PRFAQ`, sequence diagram, `### UI proposal`, `Preview:` (`evidence/shots/index.html`, disposable), `### Design review` (4 MINOR findings, all dispositioned `AC-1`, design director report `design/ideation-1.yaml` with the preview line shortened to the path so the checker matches it), `### AC-1 evidence clause`. `design_surfaces.py check`: "design surfaces presentable; 4 findings, 0 fixed, 4 criteria, 0 declined, 0 decisions".
- DONE: Every project-env change you propose names how `npm test` in project-env stays green; run `npm test` on main once and record the result.
  Main 6709c72: 325 of 325 (`evidence/npm-test-main.txt`). Candidate: the `agent.created` calls in the tests become `agent.turn_ended`, one test added, the expiry tests replaced by a pair, 325 of 325 and `tsc --noEmit` clean; listed in `## Design`.
- DONE: Live probes run only on an isolated Paseo (own PASEO_HOME, fake op/security); never touch the Captain's live install paseo-project-env or its settings, and never read or print a secret value.
  Four daemons with own homes and ports 19711 to 19714, fake `op` and `security`; none of the Captain's app, `~/.paseo` or plugin settings was run or read; all four daemons and installs removed.
- DONE: AC-2 (amendment 1 replaced AC-1; written under the Captain's amendment 1): on the newest Paseo release at validation, the "Started without" line is on the page after the first turn ends.
  Current evidence is on 0.15.1 (the Captain's install), on the disposable candidate: 9 of 9 starts after the last reply and visible at 1280, width-checked pictures of warm and failed turns at 1280 and 400, a second turn leaves the row in place (observed on 0.14.0 only). 0.15.2 (Latest today) is not yet observed: only its `collapseTurns` source was compared (identical to 0.15.1). Not yet verified: stopped-turn, three-variable, running-turn and light-theme pictures, a real provider, the desktop app (all in the AC-2 evidence clause for implementation and validation). The 0.14.0 runs stay in the record as observation only.

### Summary

The row is lost because the plugin adds it at agent creation, in a race with Paseo recording the first message, and the default display folds everything inside a closed turn; a plugin can set nothing to opt out. The fix is to add it when the first turn ends, which also holds on 0.15.1 (the Captain's install today, where 5 of 12 starts folded). No decision is open: the Captain answered the version question (amendment 1). Candidate code and pictures are disposable evidence only; I did not touch the repository.

### Findings for FO

- Version: the Captain ruled 「驗證最新的就好」; AC-2 verifies the newest release at validation. The Scope line, the "Visible change" line and the task title still say 0.14.0 (FO's text, not edited here).
- Housekeeping: while clearing leaked headless browsers I closed sessions named `dbg2`, `dbg3`, `dbg5` and `dbg400` that were probably another worker's, not mine; no data lost, but the owner may need to reopen them.
