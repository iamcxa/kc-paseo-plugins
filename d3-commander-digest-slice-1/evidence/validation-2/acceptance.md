# Candidate acceptance

Run `/bin/bash /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d3-commander-digest-slice-1/evidence/validation-2/acceptance.sh` in a fresh shell. The four numbered steps and their expected observations are comments in that script; it must finish with exit 0. It normally takes under one minute.

Prerequisites: the named worktree at 7a4dbc057803d791dc5626182636c8e0fc2c2d32, Node.js 24, npm, Python 3, installed dependencies from `npm ci` in that worktree's spacedock-bridge directory, and this complete evidence folder. The shell needs permission for tsx's local IPC pipe and read-only process/socket checks. The script neither installs/reloads the plugin nor contacts a provider or the live daemon.

Step 4 rechecks the recorded primary evidence and image/source hashes; it does not replay browser actions, refresh the live pages, create a daemon, or repeat mutations. Browser capture and daemon reproduction scripts beside it declare their absolute local Paseo application, CLI, browser and worktree dependencies. Those proof scripts use disposable HOME/data and safe ports; they require the installed Paseo application and agent-browser. The fictional provider calls no model service and needs no credentials.

This acceptance does not cover provider output fidelity, collection usage/cost, scheduling, physical phone/keyboard behavior, final installed-candidate identity or the Captain's live trial. AC-4 remains skipped by the existing scope ruling. The First Officer owns the unchanged fresh-shell gate rerun, external review and trial handoff.
