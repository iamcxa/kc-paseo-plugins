Dispatched: from 40849b49bc727dae0731e797e2b207370946c5c2 (worktree base of spacedock-ensign/spacedock-bridge-plugin)
Model: sonnet
Recorded after the fact on 2026-10-23: FO dispatched without saving this record; the content below is the exact checklist and scope-notes files given to dispatch build.

## Checklist

spacedock-bridge/ builds and its tests pass (npm ci, typecheck, test), test count not below 42 (AC-1)
The plugin installs and reports Plugin ready under id paseo-spacedock-bridge in an isolated Paseo daemon, never the live ~/.paseo (AC-2)
release-please config, manifest and root README register spacedock-bridge the same way as project-env, with a Draft PR open (AC-3)

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (SendMessage(to="main", ...)); the completion block below names `team-lead`, but this FO session listens as `main`.

Hard limits (Captain and repo rules):
- Work only in the dispatch worktree. Never switch branch on, or leave dirty, /Users/kent/Project/kc-paseo-plugins (it is the live source of the Captain's installed project-env plugin).
- Never install anything into the live Paseo daemon (~/.paseo), never stop or restart it. AC-2 uses an isolated daemon with its own --home and its own HOME, on a port outside 6767, 6787 and 6860-6935; stop it and delete its home afterwards.
- Never print full Paseo agent command lines or process args (they carry bearer tokens).
- Source is read-only: `git -C /Users/kent/conductor/workspaces/kc-claude-plugins/colombo/.context/paseo-fo-board show dbee7baf:scripts/paseo-fo-console-poc/<path>` or `git archive dbee7baf scripts/paseo-fo-console-poc`. Do not modify that worktree.
- No version hand-bumps beyond the release-please registration; commit as `feat(spacedock-bridge): ...`; stage files by name; commit hooks run normally.
- Push the branch and open a Draft PR in iamcxa/kc-paseo-plugins with the evidence (AC-1 output, AC-2 install/ls/logs output, AC-3 diff). Do not merge, do not touch Release PR #18.

roborev not run: FO omitted the roborev instruction from this dispatch; it is sent as follow-up implementation-1-followup-1.
