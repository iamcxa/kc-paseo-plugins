---
id:
title: An agent's timeline shows each variable it started without
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1
journey-story: notice-missing-variable
journey-required-tasks: '["project-env-notice-missing-variable"]'
journey-mapping-complete: true
gates:
    version: 1
    records:
        - id: gate:project-env-notice-missing-variable:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-notice-missing-variable-backlog-1
              briefing:
                id: briefing:project-env-notice-missing-variable:backlog:attempt-1:revision-1
                digest: sha256:d10200920463a8f1d2ab5a24fbfc9bd205274498f7b8ab1d665960667213a1bb
                room-ref: ./project-env-notice-missing-variable/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-notice-missing-variable:backlog:1
                briefing: briefing:project-env-notice-missing-variable:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-20T14:17:08.80465Z"
                decision: approve
                reason: 'Captain 2026-10-20: 「准。」 — accepts this release r1 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
        - id: gate:project-env-notice-missing-variable:ideation
          stage: ideation
          attempts:
            - id: gate-attempt:project-env-notice-missing-variable-ideation-1
              briefing:
                id: briefing:project-env-notice-missing-variable:ideation:attempt-1:revision-1
                digest: sha256:5d730f13a2da52c7c3250973f3b1a10d93c111aba03f4f23ee4b025a0bca8cc4
                room-ref: ./project-env-notice-missing-variable/review/ideation/briefing-1
started: 2026-10-20T14:19:51Z
---

ADR 0002 rules that an unresolved variable is shown on the agent's timeline. Today the failure goes only to the daemon log, and the plugin registers no timeline renderer.

## Scope

In: appending a line to a new agent's timeline for its blanked variables, and a client renderer for it. Ideation first spikes whether a plugin can append from `agent.session_open` before the agent is saved, with the fallback of appending after the hook returns (journey `notice-missing-variable/q6`); one line per opening or per variable, and behaviour on history-only opens, are open for ideation (q3, q7). Non-goals: resumed agents (r2). Depends on: project-env-new-agent-env, project-env-plain-failure-reason. Stop condition: the acceptance criteria below pass on Kent's daemon.

## Acceptance criteria

**AC-1**: A new agent that started with a blanked variable shows a timeline line naming each such variable and its cause class, with no value and no raw tool output.
Verified by: Kent seeing the line on his own daemon for an agent with a wrong field reference.

**AC-2**: Adding the line never stops the agent from starting.
Verified by: a unit test where the append fails.

## FO alignment

Surfaces: ui
Visible change: A new agent's timeline shows a line naming each variable it started without and why.
Direction alignment with the Captain: not needed — the outcome follows rulings already recorded (docs/adr/0001, docs/adr/0002, and the Captain's 2026-10-20 rulings in the journey map); release r1 was marked changed by signal 2 (the Captain narrowed r1 on 2026-10-20: 「可以改成兩段，不用第一時間給隊友，要先我用到覺得可以」, 「就五個，剩下做 r1.5」). kc-journey-map review-release ran on r1 at 60799d9; after the rulings, a fresh audit, the map split and an interrogation of the changed stories, this task split was re-derived from the map at 760bfaa (branch docs/project-env-r1-split, PR #6).
Release review: paseo-project-env/r1 at 760bfaa

## PRFAQ

**Press line.** When Kent starts a new agent in a connected repository and some variable could not be set, the top of that agent's timeline shows one warning row naming each such variable and why. The row never holds a value or raw tool output, and a failure to add it never stops the agent.

**What is wrong today** (read from `project-env/index.server.ts`, 2026-10-20): a failed variable is reported only by `console.error` to the daemon log, and `index.client.tsx` registers no timeline renderer, so Paseo would draw any plugin row from this plugin as "Plugin timeline item unavailable."

**FAQ**
- *Can the plugin append the row from `agent.session_open`?* No. Spiked 2026-10-20 (record below): the hook runs before Paseo registers the agent, and `timeline.append` fails with `Unknown agent`. On create, resume and history openings alike.
- *What is the fallback, and does it work?* Yes. The hook carries the failed `{name, cause}` pairs in memory, keyed by `agentId`; the daemon's `agent.created` event (new agents only) carries the same id, and its handler appends the row. Spiked: seq 1, rendered by a real client.
- *Does a failed append stop the agent?* No. Spiked: an append that fails inside the handler, and a handler that throws uncaught, both left the agent created and completed; the daemon logs `Lifecycle hook agent.created failed`. A throw inside the before-hook does fail the opening (`Failed to create agent`), so nothing in the hook may throw.
- *q3: should a history-only opening resolve and show the line?* No. A history opening is an archived agent opened to read (`purpose: "history"`, observed on `paseo archive` then `paseo logs`); it runs nothing, `agent.created` does not fire for it, and an append in its hook fails anyway. The hook returns the request unchanged and resolves nothing, saving an `op` round trip per view. A non-archived closed agent opened for viewing is `reason: "resume", purpose: "interactive"` (observed): it resolves as new-agent-env designs and shows no line.
- *q7: one line per opening or per variable?* One row per opening, one line per variable inside it. The row has a fixed id per agent (`project-env-missing-variables`); re-appending an id replaces the row (observed: the second append's data replaced the first at the same position). Per-variable rows would add one row per failure; ADR 0002 asks for a line "naming the variable and the reason", and AC-1 for "a timeline line naming each such variable".
- *What happens to the row when a later opening resolves everything?* Nothing in r1. The row records how that agent started, and a resumed opening never appends (r2, `resumed-env`): `agent.created` fires only on creation (one emit site in `agent-manager.js`), and the in-hook append also fails on resume (observed).
- *Is the row permanent?* No. It lives in the daemon's in-memory timeline: Paseo's plugin skill says rows do not survive a daemon restart, and after restarting the isolated daemon the agent's timeline no longer held the row (observed; the mock provider replays no history, so this alone does not distinguish). Known limit; no r1 mechanism re-adds it.
- *What exactly is in the row?* `{ variables: [{ name, cause }] }`, nothing else. `cause` is the class identifier from plain-failure-reason; the client turns it into words.

```mermaid
flowchart TD
  A[Paseo opens an agent session] --> B[hook: agent.session_open]
  B --> C{purpose is history?}
  C -- yes --> Z[return request unchanged; no resolve, no row]
  C -- no --> D[openSession resolves variables - new-agent-env]
  D --> E{reason is create and at least one failed?}
  E -- no --> R[return request; no row]
  E -- yes --> F[remember name+cause by agentId; return request]
  F --> G[Paseo registers the agent, emits agent.created]
  G --> H[handler takes the remembered entry]
  H --> I[timeline.append: one row, fixed id]
  I -- ok --> J[client renderer draws the warning row]
  I -- fails --> K[log one line; agent unaffected]
  F -. createSession fails, no agent.created .-> L[entry dropped by agent.closed or 10 min age]
```

## Design

**Mechanism.**
1. `shared/config.ts` gains the row contract: `missingVariablesKind = "missing-variables"`, `version = 1`, and a zod schema `{ variables: array of { name: string, cause: string } (min 1) }`. `cause` is `z.string()` on the wire so a daemon newer than the client does not turn the row into the "unavailable" placeholder. The kind has no dot: `spike.notice` was rejected client-side (`Invalid timeline renderer kind`) while the server accepted it, which shows as the silent placeholder; kind and version must match between server and client, hence one constant.
2. New `server/missing-variables-notice.ts`: `createNotices({ now, log })` returns `record(agentId, failures)` and `flush(agentId, appendRow)`, where `appendRow` is a function the composition root builds from `paseo.agents.ref(id).timeline.append`. `record` keeps entries for at most 10 minutes (a choice, not measured; it only needs to exceed the gap between the hook and `agent.created`, observed at about 5 ms with a mock provider) and prunes older ones on each call; `agent.closed` also drops the entry. `flush` takes the entry once, builds the row from `{name, cause}` only, awaits `appendRow` inside try/catch, and on failure logs one line `[project-env] could not add the missing-variables line for agent <id>` with the error's message. `flush` and `record` never throw.
3. `index.server.ts`: in the `agent.session_open` hook, return the request unchanged when `request.purpose === "history"` (before any resolving); after `openSession` (new-agent-env), when `request.reason === "create"` and some `results` failed, `record(request.agentId, failures)`. A new `server.on("agent.created", ...)` calls `flush(agent.id, ...)`, and `server.on("agent.closed", ...)` drops the entry.
4. `index.client.tsx`: `client.addTimelineRenderer({ kind, version, schema, Component })`. The component is read-only: a `TriangleAlert` icon in `theme.colors.statusWarning`, the title "Started without N project variable(s)" in `foreground`, then one line per variable, the name monospace in `foreground`, an em dash and the cause words in `foregroundMuted`. Words come from plain-failure-reason's label function with the fallback "reason not available" for an unknown class. The spike component (`spike/index.client.tsx`) is the starting point.
5. Test seam: files under `project-env/test/` run by new-agent-env's `npm test` (`node --test`). No new dependency.

**Needs from siblings (named, not designed).**
- new-agent-env: `openSession(...)` returns `{ request, results }`, each result `{ name, ok, error?, stage? }`, and `reason` and `purpose` stay on `request` (its design already says so). Its `npm test` and `createSecrets(tools)` fakes are what the AC-1 unit test reuses.
- plain-failure-reason: the cause-class identifiers, a function mapping a failed result to one identifier, and a label function from identifier to words, exported from `shared/` so the client can import it. Until it lands, the spike's six identifiers and labels are placeholders only. If its label function does not exist, this task adds the words for the classes ADR 0001 and 0002 name.
- Merge order is the task's stated dependency order (new-agent-env, then plain-failure-reason, then this); the hook edit rebases over new-agent-env's `openSession` change.

**Existing-code check.** Boundary: the hook and client entry. Searched `project-env/` for `timeline`, `addTimelineRenderer` and `agent.created`: none. Upstream: Paseo's own `timeline.append` and `addTimelineRenderer` are the capability; read in Paseo's plugin skill and server source and run in the spike, not taken from a sibling's usage. Alternatives rejected: `console.error` (the current report, invisible to Kent); a toast (client-only, transient, no history); `session.notice` (provider-only). Smallest mechanism: one handoff map, two handlers, one renderer.

**Spike facts the design depends on.** Observed and not observed:
- Observed: in-hook append fails (create, resume, history); `agent.created` append works; same-id re-append replaces; handler failure leaves the agent running; before-hook throw fails the opening; the real Paseo web client drew the row; a kind with no renderer draws the placeholder; dark, light, phone and desktop render.
- Not observed: the row's position against a real provider's first user message (the mock emits none; here the row came before the assistant reply); a real provider's gap between hook and `agent.created`; the Paseo desktop app and phone clients (only the web build of the same client served by the isolated daemon was driven).

### UI proposal

UI proposal: When a new agent starts without one or more mapped project variables, the top of its timeline shows one read-only warning row: a warning icon, the title "Started without N project variable(s)", then one line per variable with the variable name in monospace and the cause in muted text after an em dash (for example "STRIPE_API_KEY — 1Password rejected the token"); it shows no value, has no controls, and sits above the agent's first reply.

Preview: project-env-notice-missing-variable/design/preview-desktop-dark-3-variables.png

The main picture is the one above; the proposed design is the set `design/preview-*.png` in this task's folder, taken from a real run: the spike plugin (`spike/`) on a separate throwaway daemon (own home, port 6799, mock provider), driven through Paseo's own web client with a headless browser. The surface has no controls, so pictures of the real client are the operable preview; the daemon, install and browser session were disposable and are removed at the end of ideation. Pictures: desktop dark with 1, 3 and 12 variables and with an unknown cause class; phone-size dark with 1 and 12 variables; phone-size light with 12 variables. Context only: `design/context-no-renderer-placeholder.png`.

### Design review

Design review: design/ideation-1.yaml

Design finding 1: declined: weight and a container are polish; the row uses the host's theme colours, and Kent's own use in AC-1 judges whether it reads as a notice.
Design finding 2: declined: Kent's repositories map a handful of variables; capping or grouping would hide names, which are the point of the row. Twelve was a stress case.
Design finding 3: declined: the host wraps text by character and names that long are rare; a long cause is not an r1 case because the labels are short fixed phrases.
Design finding 4: declined: ADR 0002 and the Captain's ruling ask for the variable and its cause class; where to fix it is the settings Test row. The fallback text is set to "reason not available" in Design item 4.
Design finding 5: declined: the label wording and its grammar belong to plain-failure-reason's one string table; this task only imports it.
Design finding 6: declined: the row is an ordinary timeline row at the top and scrolls away with the conversation (stated in Design and Known limits); the resumed-agent state is r2.
Design finding 7: declined: colours come from the host theme tokens, and light was checked on phone size with 12 variables; desktop light and mid width are unverified and Kent's own use covers them.
Design finding 8 (limitation: whether the row is dismissible or persists across reload and resume): declined: no dismiss control by design; persistence is the daemon-restart limit and the r2 resume limit in Known limits.

## Spike record (2026-10-20)

Isolated on purpose: Kent's daemon (home `~/.paseo`, port 6767) was only read (`paseo plugin ls` showed `paseo-project-env` before and after; its config was not written). The probe ran on a separate daemon: its own `PASEO_HOME`, port 6799, relay and speech off, a throwaway plugin id `notice-spike`, and a mock provider so no Claude call or token was used. Machine dependencies, declared: Paseo.app 0.12.0 CLI at `/Users/kent/.local/bin/paseo`, Node 24.18.0, `agent-browser` for the screenshots, hardcoded paths `/tmp/notice-line-spike-r1/...` in `spike/index.server.ts` (a sibling task deleted my first directory, `/tmp/pe-spike`, mid-run, so the run was redone here). Sources are in `spike/`; `spike/home-config.json` is the daemon config.

```
S=/tmp/notice-line-spike-r1
PASEO_HOME=$S/home PASEO_LISTEN=127.0.0.1:6799 PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true \
  PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist paseo daemon run --home $S/home &
paseo --home $S/home plugin install $S/plugin          # notice-spike  running
paseo --home $S/home run --provider mock --cwd $S/work --title spike1 "hello"
```
Plugin log, first run (create):
```
session_open agent=3ac1f473-... reason=create purpose=interactive provider=mock
PROBE in-hook append FAILED after 3ms: Request failed: Unknown agent '3ac1f473-...' requestType=agent.timeline.append.request code=handler_error
provider session.open e444f36d-... history=skip
agent.created 3ac1f473-... provider=mock
PROBE after-created append OK seq=1
turn_ended 3ac1f473-... timeline=plugin:spike-after-created-3ac1f473-... | assistant_message
```
Other probes, same log format (abridged):
- Append fails in the `agent.created` handler (flag file): `PROBE after-created append FAILED: spike: forced append failure`; `paseo run` still printed the agent `completed`.
- Handler throws uncaught: `paseo run` printed the agent `completed`; plugin log: `Lifecycle hook agent.created failed Error: spike: uncaught throw in agent.created handler`; `paseo plugin ls` still `running`.
- Before-hook throws: `Error: Failed to create agent: Plugin notice-spike before agent.session_open failed: spike: before hook throws`.
- View a closed agent (`paseo logs b50e0e5`): `session_open ... reason=resume purpose=interactive`, in-hook append `FAILED ... Unknown agent`, no `agent.created`.
- Archive then view (`paseo archive 808635a`, `paseo logs 808635a`): `session_open ... reason=resume purpose=history`, in-hook append `FAILED ... Unknown agent`.
- Same-id re-append: a first `turn_ended` showed `plugin:{"probe":"after-created"}`; after the second append with the same id, a later `turn_ended` showed one plugin row with `{"probe":"second-append-same-id"}`.
- Daemon restart (`paseo daemon stop`, run again, `paseo send`): `session_open ... reason=resume`; `turn_ended timeline=tool_call | assistant_message`, no plugin row.
- Client: first attempt used kind `spike.notice`: browser console `[Plugins] Failed to evaluate ... Invalid timeline renderer kind: spike.notice`, rows drew "Plugin timeline item unavailable." After renaming to `missing-variables`, the row drew as in the previews, with a three-variable, a twelve-variable, a one-variable and an unknown-cause scenario (`scenario.json` read by the server probe).

Teardown: `paseo --home $S/home daemon stop`, `rm -rf $S /tmp/pe-asar`, `agent-browser` sessions closed; `paseo plugin ls` on Kent's daemon afterwards (recorded in the Stage Report).

## Journey answers for the map (the map is not edited here)

- `notice-missing-variable/q3`: answered. A history opening is an archived agent opened to read; it resolves nothing and shows no line. Basis: spike, `purpose=history` observed.
- `notice-missing-variable/q6`: answered. No: an append from `agent.session_open` fails with `Unknown agent`; the fallback appends from `agent.created` and works. Basis: spike.
- `notice-missing-variable/q7`: answered. One row per opening with a line per variable and a fixed per-agent id; later openings change nothing in r1.
- New known limit for the map: the row is lost when the daemon restarts.

## Acceptance criteria (evidence clauses)

AC-1 and AC-2 are the Captain's wording, kept verbatim. The `Reproduce:` lines add the proof.

**AC-1**: A new agent that started with a blanked variable shows a timeline line naming each such variable and its cause class, with no value and no raw tool output.
Reproduce: (a) `npm test`, test *row holds only name and cause*: run `openSession` with new-agent-env's fakes (a fixed fake value `SECRET_FAKE_VALUE` for one variable, a fixed fake stderr text for another failure), feed the results through `record` and `flush` with a capturing `appendRow`; the captured row equals `{ variables: [{ name, cause }] }` for the failed names, and `JSON.stringify` of it contains neither fixed string. It fails if the row is built from `results` wholesale or from `error`. (b) On Kent's daemon: for a throwaway probe install of the implemented plugin under its own plugin id (never `paseo-project-env`, removed afterwards), connect a temp repository whose variable points at a field that does not exist, start a new agent there, and see the warning row naming that variable and the cause. Not run in ideation: nothing was installed from the implementation, and Kent's live install was not touched. Current evidence: the same row, drawn by the spike's renderer from a fallback append, was seen in Paseo's web client (the previews).

**AC-2**: Adding the line never stops the agent from starting.
Reproduce: `npm test`, tests *failed append is swallowed* and *hook never throws*: `flush` with an `appendRow` that rejects resolves and logs one line; `record` and the guard paths never throw; with `purpose: "history"`, `reason: "resume"` or no failures, nothing is remembered (fails if the guard is removed); an entry older than 10 minutes is pruned on the next `record` (fails if the prune is removed, by an injected clock). Current evidence: the spike's append that failed inside `agent.created`, and the uncaught throw in that handler, both left the agent `completed`.

## Known limits (not decisions)
- The row disappears when the daemon restarts, and resumed agents get no row until r2. ADR 0002 says the failure is "shown on the timeline"; in r1 that holds for the daemon's lifetime.
- The row's position against a real provider's first user message is not observed; the mock provider has none.
- A twelve-line row is accepted as is (design findings 1 and 2).
- No CI job is added; the tests run locally.

### Needs decision

None. Past rulings checked: ADRs 0001 to 0003 and the `Override:` lines in the state checkout (`git grep -n 'Override:'` finds none recorded; the one hit is a sibling's prose) name no behaviour for this row beyond ADR 0002.

## Stage Report: ideation

- DONE: Spike first: show by a real run, not by reading docs, whether a plugin can append a timeline item from `agent.session_open` before the agent is saved; if not, prove the fallback (append after the hook returns) works; record commands and output in the task file.
  `## Spike record`: in-hook append fails `Unknown agent` (create, resume, history); the `agent.created` fallback appended seq 1 and a real Paseo web client drew it. Isolated daemon, Kent's `paseo-project-env` untouched (`paseo plugin ls` after teardown unchanged).
- DONE: Settle journey questions notice-missing-variable/q3 (history-only opens) and q7 (one line per opening or per variable).
  `## Journey answers for the map`: q3 history opening resolves nothing and shows no line; q7 one row per opening, a line per variable, fixed per-agent id; q6 also answered. The map itself is not edited here.
- DONE: Produce the artifact the `ui` surface owes for the timeline renderer.
  `UI proposal:` and `Preview:` lines, seven real-client pictures in `project-env-notice-missing-variable/design/`, design review `design/ideation-1.yaml` (7 MINOR, 0 MAJOR, all declined with reasons). Its `preview:` field was normalized to the checker's path form after the run; nothing else in the report was edited.
- DONE: Keep AC-1 (Kent sees the line on his daemon) with a reproducible evidence clause.
  AC-1 not yet verified: no implementation. Evidence plan: unit test *row holds only name and cause*, then Kent seeing the row on a throwaway probe install on his daemon. Current evidence is the spike's rendered row only.
- DONE: Keep AC-2 (a failed append never stops the agent) with a reproducible evidence clause.
  AC-2 not yet verified in code. Evidence plan: unit tests *failed append is swallowed*, *hook never throws*, guard and prune tests. Current evidence: spike, a failed append and an uncaught handler throw both left the agent `completed`.
- DONE: Run `design_surfaces.py check` and cite its output.
  `design surfaces presentable` / `design review design/ideation-1.yaml: 7 findings, 0 fixed, 0 criteria, 7 declined, 0 decisions`, exit 0.

### Summary

The plugin cannot append from `agent.session_open` because Paseo registers the agent after the hook; the design carries the failed `{name, cause}` pairs by agent id and appends from `agent.created`, which a real client rendered. No decision is needed from the Captain. One limit to know: the row lives in the daemon's memory and is gone after a daemon restart, and resumed agents get no row until r2. Needs from siblings: `openSession(...).results` (new-agent-env) and cause identifiers plus a label function in `shared/` (plain-failure-reason).
