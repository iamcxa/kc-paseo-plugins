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
