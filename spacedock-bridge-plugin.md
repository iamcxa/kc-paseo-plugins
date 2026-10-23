---
id:
title: Spacedock Bridge is a kc-paseo-plugins plugin that installs and runs from this repo
status: validation
variant: kc-dev-flow-2
profile: poc
merge: pr
worktree: .worktrees/spacedock-ensign-spacedock-bridge-plugin
pr:
gates:
    version: 1
    records:
        - id: gate:spacedock-bridge-plugin:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:spacedock-bridge-plugin-backlog-1
              briefing:
                id: briefing:spacedock-bridge-plugin:backlog:attempt-1:revision-1
                digest: sha256:868cd146b00d9a84b86831de32e71623afad82aa5bf0efde7fe6f09b52c2036b
                room-ref: ./spacedock-bridge-plugin/review/backlog/briefing-1
              withdrawal:
                by: agent:first-officer
                at: "2026-10-23T06:14:38.379607Z"
                reason: 'Seed amended before decision: AC-2 must install into an isolated Paseo daemon, not the live one (the live daemon already runs the POC copy, which holds port 6787 and the shared data directory); and the release PR #18 interaction is recorded.'
            - id: gate-attempt:spacedock-bridge-plugin-backlog-2
              briefing:
                id: briefing:spacedock-bridge-plugin:backlog:attempt-2:revision-1
                digest: sha256:b7ec0ba36edd7fb7f7a6ef72ea92746ba2763d387abdba5c37bd375a1726fbd2
                room-ref: ./spacedock-bridge-plugin/review/backlog/briefing-2
              resolution:
                type: Resolution
                id: resolution:spacedock:spacedock-bridge-plugin:backlog:2
                briefing: briefing:spacedock-bridge-plugin:backlog:attempt-2:revision-1
                by: person:captain
                at: "2026-10-23T07:13:34.866838Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the backlog gate review for briefing attempt-2 (sha256:b7ec0ba36edd): approve to enter implementation in an isolated worktree with a PR.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-23T07:16:56Z
---

The Captain runs his FOs from the Spacedock Bridge, a Paseo plugin that today exists only as a proof of concept in another repository's local worktree, installed from a path that disappears when that worktree is cleaned. Moving it into this monorepo gives it a durable home, a release line, and the POC workflow it will grow in until he decides to polish it.

Captain, 2026-10-23: 「我想要你在 kc-paseo-plugins 開一個新的 monorepo plugin，暫時only adopt dev2 poc profile，之後都用 poc profile 推進直到我決定開始打磨」. Name and profile: 「可以，之後要改名字再重新選，現在就是先 poc 到滿意」, accepting the proposal: directory `spacedock-bridge`, plugin id `paseo-spacedock-bridge`, display name `Spacedock Bridge`.

bite: the plugin installs from `/Users/kent/conductor/workspaces/kc-claude-plugins/colombo/.context/paseo-fo-board/scripts/paseo-fo-console-poc`, a temporary worktree on a local-only branch (`iamcxa/paseo-fo-board-relay`, never pushed), so it has no history anyone else can read and would vanish with the worktree.
consumer: the Captain, who uses the Bridge screen and the Fleet panel daily; the comms officer agent, which the plugin creates and gives the `fleet_status` tool.

## Scope

- Source: the plugin directory `scripts/paseo-fo-console-poc` at commit `dbee7baf` of the worktree `/Users/kent/conductor/workspaces/kc-claude-plugins/colombo/.context/paseo-fo-board` (read it with `git -C <that worktree> show dbee7baf:<path>` or `git archive`). Bring the plugin's own files: `paseo-plugin.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `index.client.tsx`, `index.server.ts`, `client/`, `server/`, `shared/`, `probe/` tests and the `coordinator/EXTENSION.md` draft. Leave behind probe scripts that only drove the old POC (`probe/run.mts`) unless a test needs them.
- Into a new top-level directory `spacedock-bridge/`, beside `project-env/`, following this repo's conventions (project-env's layout, package scripts, `files` list and an `OVERVIEW.md`).
- Rename the plugin: `paseo-plugin.json` `id` `paseo-spacedock-bridge`, `name` `Spacedock Bridge`; package name to match. No behaviour change. The data directory `~/.local/share/paseo-fo-coordinator` (decisions, review requests, fleet token) keeps its path, so the Captain's live state carries over.
- Register the component in `release-please-config.json` and `.release-please-manifest.json` the way `project-env` is registered, under the repo's `initial-version: 0.1.0` policy, and add one line for it to the root `README.md`.
- Release PR #18 is open in this repo; a new package entry changes what that release PR carries. Merging it stays the Captain's call.
- Work only in a worktree: `/Users/kent/Project/kc-paseo-plugins` on `main` is the live source of the Captain's installed project-env plugin; never switch its branch or leave it dirty (kc-paseo-plugins dev2 FO, 2026-10-23).
- Non-goals: new features or UI changes; publishing to the Paseo registry; removing the old POC directory from kc-claude-plugins; changing Paseo config; switching the Captain's installed plugin over (that happens after merge, by hand).
- Stop condition: the plugin typechecks, its tests pass and it installs and runs from this repo's checkout. Budget: one implementation round; a second only to fix what validation finds.

## Acceptance criteria

**AC-1**: The moved plugin builds and its existing tests pass from `spacedock-bridge/`.
Verified by: `npm ci`, `npm run typecheck` and `npm test` in `spacedock-bridge/`, with their output; the test count is not lower than the 42 that pass at `dbee7baf`.

**AC-2**: The plugin installs and starts from this repository under its new id.
Verified by: an isolated Paseo daemon (its own `--home` and its own `HOME` for the daemon process, listening on a port outside 6767, 6787 and 6860–6935), with plugins enabled there; `paseo plugin install <worktree>/spacedock-bridge --home <isolated>`, `paseo plugin ls` showing `paseo-spacedock-bridge` `running` with no error, `paseo plugin logs` showing `Plugin ready`; then stop that daemon and delete its home. Never install into the Captain's live daemon (`~/.paseo`): it already runs the POC copy, which holds port 6787 and the shared data directory, and a second copy would start a second review poller. Limit: this proves it loads, not that the screens render; rendering is the Captain's check after merge.

**AC-3**: Release tooling knows the new component.
Verified by: the diff of `release-please-config.json`, `.release-please-manifest.json` and `README.md`, matching how `project-env` is registered.

## FO alignment

Alignment: not needed: the Captain set the profile, the name and the scope's intent himself on 2026-10-23, and the work moves code without changing behaviour.
Release review: not needed: spacedock-bridge has no journey map yet, and this is a move, not a story.

## Stage Report: implementation

- DONE: spacedock-bridge/ builds and its tests pass (npm ci, typecheck, test), test count not below 42 (AC-1)
  In `spacedock-bridge/` at 78eef81: `npm ci` ok; `npm run typecheck` no errors; `npm test` = tests 42, pass 42, fail 0. The tests assert the moved board/gate/relay/reviews/queue/tasks/markdown/preview logic; each fails if that logic's output changes.
- DONE: The plugin installs and reports Plugin ready under id paseo-spacedock-bridge in an isolated Paseo daemon, never the live ~/.paseo (AC-2)
  Isolated daemon (own --home and HOME, 127.0.0.1:6950): `plugin ls` showed `paseo-spacedock-bridge running yes`, empty ERROR; `plugin logs` showed `Plugin ready`. Daemon stopped, home deleted, live daemon on 6767 still listening.
- DONE: release-please config, manifest and root README register spacedock-bridge the same way as project-env, with a Draft PR open (AC-3)
  Manifest entry `0.0.0` and package.json `0.0.0`, as project-env was registered in bdebd38; README line added. Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/31; Release PR #18 untouched.

### Summary

Moved the plugin from `dbee7baf` into `spacedock-bridge/`; client/server/shared/coordinator/index/tsconfig and the 8 test files are byte-identical to source (`diff -r`), `probe/` renamed `test/`, `probe/run.mts` and the `probe` script left behind. Comment ratio: 5% maximum met (`comment_ratio.py main HEAD`). `doc_impact.py main HEAD`: 0 documents listed, nothing to mark. No ADR, no number guards, no boundary-crossed.

Limits: the fleet MCP port 6787 is hard-coded, so a second copy cannot start the fleet server while the live POC copy holds it; observed as a caught `EADDRINUSE` in the isolated run, plugin still ready. The Captain must remove the POC plugin from the live daemon before or when switching over, or the new copy has no `fleet_status`. Screen rendering is unproven (Captain's check after merge). `coordinator/EXTENSION.md` still says it lives in the POC directory (kept verbatim). The `package-lock.json` came from the source worktree's untracked file, changed only in root name/version.

## Stage Report: validation

- DONE: Independent verdict on AC-1..AC-3 for PR #31 at head 78eef81, from my own run of npm ci / typecheck / test (count not below 42) and my own isolated-daemon install (never the live ~/.paseo)
  Verdict PASSED for AC-1, AC-2, AC-3 at 78eef814cc5ac4c9f243b904a5eb948d6d573628 (PR head confirmed by `gh pr view 31`, Draft, only check GitGuardian SUCCESS). AC-1: from a clean `git archive` of 78eef81, `npm ci` 0, `tsc --noEmit` 0, `npm test` = tests 42, pass 42, fail 0 (the reviews test asserts only the marker prefix, not the title content). AC-2: isolated daemon (own --home and HOME, 127.0.0.1:17891, relay and MCP injection off), `plugin install <worktree>/spacedock-bridge` -> `paseo-spacedock-bridge running yes`, logs `Plugin ready`; daemon stopped, homes deleted; live daemon 6767 pid 10060 untouched, `~/.paseo` not written. AC-3: manifest `"spacedock-bridge": "0.0.0"` and the package entry mirror project-env as registered in bdebd38 (also `0.0.0`); README line added.
- DONE: A minimal acceptance script the FO can rerun as written in a fresh shell, with each step's expected output
  Script below, run by me under `env -i` bash with the expected outputs shown; also saved at /tmp/bridge-pr31-acceptance.sh.
- DONE: Material findings and limits, including the fleet port 6787 collision with the live POC copy and the unproven screen rendering
  See Findings below. Implementer's claims re-checked from `git archive dbee7baf` vs `git archive 78eef81`: client/, server/, shared/, coordinator/, index.client.tsx, index.server.ts, tsconfig.json byte-identical (`diff -rq`); package.json differs only in name, `files` + OVERVIEW.md, `probe` script removed, `test` glob; paseo-plugin.json only id/name; the 8 test files identical (probe/run.mts left behind); package-lock.json differs from the source's untracked lockfile in 2 name lines only. `comment_ratio.py main 78eef81` exit 0 (0.4%, all verbatim source comments); `adr_lint.py docs/adr --since main` exit 0; no `## Number guards`; no `boundary-crossed:` found (state stays under the existing data dir, no new seam or duty).

### Findings

- Needs FO: `dispatch_records.py <task folder>` exit 1; the task folder has no `dispatch/` directory (`no dispatch records under dispatch/`, confirmed with `rtk proxy find`). A missing record is an FO finding, not a product defect; no checklist item failed.
- Fleet port 6787 collision (limit, observed): `fleet MCP server did not start: ... EADDRINUSE 127.0.0.1:6787` in the isolated run because the live POC copy holds 6787 (lsof: Paseo process). Plugin still reports `running`, so the failure is visible only in `plugin logs`. While both copies are installed the new copy's comms officer starts without `fleet_status`. The Captain must remove the POC copy when switching over.
- Screen rendering unproven: AC-2 proves load and `Plugin ready` only; Bridge screen, Fleet panel and chat were not opened. No screenshot was taken, so no claim about what the Captain sees.
- Prompt-injection path (pre-existing, not introduced by the move; classification Needs decision, not Material by the stage's four-field rule because no AC, ruling or contract protects it and the task scope is "No behaviour change"):
  1. Identity: `cmp` shows shared/reviews.ts, shared/coordinator.ts, server/coordinator.ts, index.server.ts byte-identical to dbee7baf; server/reviews.ts also identical (`diff -rq` lists no difference). The live POC copy carries the same exposure today.
  2. Path: server/reviews.ts `checkReviews` sends `wakeMessage(fresh)` to the comms officer; `wakeMessage` interpolates `r.title` and `r.author` verbatim from `gh search prs --review-requested=@me`. Titles are free text set by whoever opened the PR (author logins are GitHub-restricted).
  3. Tools: `COORDINATOR_OPTIONS.allowedTools` includes `mcp__paseo__create_agent` and `send_agent_prompt`, `list_agents`, `get_agent_activity`, plus `mcp__fleet__fleet_status`; denied: Bash/Read/Edit/Write/Agent/Task and permission, terminal, kill, schedule tools.
  4. Hook: `server.before("agent.create")` in index.server.ts deletes `allowedTools` and `settings` and the fleet MCP server from any agent whose providerOptions settings contain `mcp__paseo__respond_to_permission` (the comms officer's deny list), so an agent the comms officer creates has full tools; this is deliberate so FOs are fully tooled, but it makes `create_agent` the escalation step.
  5. Marker: AUTOMATED_MARKER plus the COORDINATOR_PROMPT line and the message's closing sentence say the message is plugin data, not the Captain's ruling, and forbid "outward action because of it". It does not cover: delimiting or escaping the title (it sits inside text the prompt tells the CO to "follow its routing steps" from); defining whether create_agent counts as an outward action (the prompt elsewhere lets the CO start FOs); any technical enforcement (prompt-only).
  Not exercised: I did not craft a title or run a comms officer, so the end-to-end steer is unproven; the hook's behaviour on a CO-created agent and Paseo's copying of providerOptions (comment in index.server.ts) were read, not run. Trigger needs someone able to request the Captain's review on a PR (I believe GitHub limits this to repo collaborators; not verified). Would become Material if the Captain rules the comms officer's tool boundary a protected boundary, or an observed steered agent creation.
- Necessity: OVERVIEW.md and committed package-lock.json match project-env's layout; no surface without a brief-named consumer found.

### Summary

PASSED: AC-1, AC-2, AC-3 hold at 78eef81 from my own runs; the move is byte-identical to dbee7baf except the recorded rename and test move. Open for FO: missing dispatch record, port 6787 cutover, unproven rendering, and the pre-existing wakeMessage injection path needing the Captain's call on whether to fix it before or after the move (a fix is a behaviour change).

### Acceptance script

Needs node, npm, paseo 0.12.0, git; touches only a temp dir; never `~/.paseo`. Run `bash /tmp/bridge-pr31-acceptance.sh` or paste:

    WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-spacedock-bridge-plugin
    git -C $WT rev-parse HEAD                      # 78eef814cc5ac4c9f243b904a5eb948d6d573628
    cd $WT/spacedock-bridge && npm ci --silent && npm run typecheck && npm test 2>&1 | grep -E '^ℹ (tests|pass|fail) '
                                                   # ℹ tests 42 / ℹ pass 42 / ℹ fail 0
    git -C $WT diff 78eef81^ 78eef81 -- release-please-config.json .release-please-manifest.json README.md | grep -E '^\+[^+]'
                                                   # adds "spacedock-bridge": "0.0.0", its package block, one README line
    lsof -nP -iTCP:17891 -sTCP:LISTEN                # expect no output (port free)
    H=$(mktemp -d); mkdir -p $H/paseo $H/user; export HOME=$H/user
    printf '{"version":1,"daemon":{"listen":"127.0.0.1:17891","mcp":{"injectIntoAgents":false},"browserTools":{"enabled":false},"relay":{"enabled":false}},"pluginsEnabled":true}\n' > $H/paseo/config.json
    paseo daemon start --home $H/paseo; paseo plugin install $WT/spacedock-bridge --home $H/paseo; sleep 6
    paseo plugin ls --home $H/paseo                # paseo-spacedock-bridge  running  yes
    paseo plugin logs paseo-spacedock-bridge --home $H/paseo | grep -E 'Plugin ready|EADDRINUSE'
                                                   # "Plugin ready"; EADDRINUSE on 6787 while the POC copy runs
    paseo daemon stop --home $H/paseo; rm -rf $H

Does not cover: screen rendering, the fleet MCP server actually starting (blocked by 6787 while the POC runs), review polling against real GitHub, the comms officer's behaviour, the injection path.

## Stage Report: implementation (cycle 2)

- DONE: Run the roborev gate on the committed candidate against base 40849b49bc727dae0731e797e2b207370946c5c2 and put its evidence= or incomplete: line in a new implementation stage report section
  `roborev_gate.py --repo <worktree> --base 40849b49...` exited 1: `findings on 78eef814c; evidence=roborev:1084`.
- DONE: Report every roborev finding to FO; change no code, because this task's scope is a move with no behaviour change
  Seven findings below; no code changed, nothing committed to the candidate branch (HEAD stays 78eef81).

### Roborev findings (roborev:1084), all in moved code that is byte-identical to source at dbee7baf

- High, `server/decisions.ts:29`: decision claims keyed only by `briefingId`; two repos sharing an ID block each other as "already sent". Fix: scope by canonical workflow state identity.
- High, `shared/board.ts:154`: gate owner matched by task slug before workflow; unrelated workflows reusing a slug attach the gate to the wrong FO. Fix: match slug within the same repo/workflow.
- Medium, `server/tasks.ts:141`: gate dedup key is slug+title only; same-named tasks in two workflows lose a gate. Fix: add workflow identity to the key.
- Medium, `client/decision-card.tsx:144`: coordinator open happens after the claim is persisted but outside the release-on-error block; a failed open leaves the claim stuck as "already sent". Fix: guard the open and release on failure.
- Medium, `client/bridge.tsx:86`: compact-layout tab switch unmounts the inactive pane, dropping chat drafts and coordinator monitoring. Fix: keep both mounted or hold state in the parent.
- Medium, `client/co-chat.tsx:202`: working state follows live turn events only; opening a chat mid-turn (or reconnecting) shows idle and hides stop. Fix: init/reconcile from agent snapshots.
- Low, `shared/board.ts:157`: attaching gates drops `preparedAt`, so queue ordering and waiting ages use activity timestamps. Fix: preserve `preparedAt`; test the attach-to-queue path.

### Summary

The gate found real behaviour defects, but every one is already in the POC source this task moved unchanged; none was introduced by the move. Fixing any of them changes behaviour, which this task's scope excludes, so FO decides whether to open follow-up work; I made no change.
