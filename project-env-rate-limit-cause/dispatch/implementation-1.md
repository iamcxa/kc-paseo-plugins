# Dispatch record: project-env-rate-limit-cause implementation-1

Dispatched: b684b68de779ba2174a5efc6437f2a7d6805e26d
Model: sonnet (stage default emitted by spacedock dispatch build)

Reconstructed by FO on 2026-11-06, after the dispatch, from the dispatch build FO sent (checklist and scope files kept under /tmp/r1bpolish, builder output under /tmp/spacedock-dispatch). FO did not save this record at dispatch time. What the worker received is reproduced unchanged below; the scope notes it received carried no `Package root:` line and no completion-recipient line.

## Checklist

- Base your branch on the picker-slow-hint candidate, not on main: fetch `origin spacedock-ensign/project-env-picker-slow-hint` and start from commit b684b68 (PR #72, not yet merged), because the approved design adds a branch to its `vaultListFailure`. Open your Draft PR against `main`; say in the body that it stacks on #72 and must merge after it.
- Implement the approved design: the `rate-limited` cause in `classifyOpFailure` (after the missing-item pattern, before network and authentication), its phrase on picker, Test and the Started-without line, the picker stop and hint via `vaultListFailure`, and the `OVERVIEW.md` troubleshooting heading; no existing test or guard edited.
- Run `npm test` and `npx tsc --noEmit` in `project-env` and save both; show that removing the classifier line and the stop condition each fail tests.
- Take the AC-1 pictures on an isolated Paseo at the newest release (own PASEO_HOME and ports, fake `op` and `security` returning the rate-limit reply), picker, Test and Started line, 1280 and 400 px; never touch the Captain's live install `paseo-project-env` or its settings and never read or print a secret value.
- Docs: retake the docs pictures with `docs/project-env/capture/` and compare them with the committed ones; for every screen word or picture your change alters, update `docs/project-env/install.md`, `prepare-1password.md` or `project-env/OVERVIEW.md` in the same PR, and say in the stage report which pictures and sentences changed, or `docs: no change` with the capture diff.
- Commit with a conventional title scoped to the plugin (e.g. `fix(project-env): a 1Password rate limit is shown as a rate limit`), push, open the Draft PR; do not mark it ready or merge.
- Close only browser sessions you opened yourself, by name; never close all sessions. Stop only daemons you started.

## Scope notes

Batch r1b-polish-1, second of three code tasks. picker-slow-hint (#72) is in validation in parallel; if its validation changes its branch, FO will tell you. started-row-visible stacks on your branch next (shared OVERVIEW.md).
