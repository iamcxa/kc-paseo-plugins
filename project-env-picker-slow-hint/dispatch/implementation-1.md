# Dispatch record: project-env-picker-slow-hint implementation-1

Dispatched: c1458f7f53ad1c230a7772917ebcc1d61173564a
Model: sonnet (stage default emitted by spacedock dispatch build)

Reconstructed by FO on 2026-11-06, after the dispatch, from the dispatch build FO sent (checklist and scope files kept under /tmp/r1bpolish, builder output under /tmp/spacedock-dispatch). FO did not save this record at dispatch time. What the worker received is reproduced unchanged below; the scope notes it received carried no `Package root:` line and no completion-recipient line.

## Checklist

- Branch from a freshly fetched `origin/main`; implement the approved design (`vaultListFailure` and `FIX_CONNECTION_HINT` in `project-env/shared/field-picker.ts`, the small `settings-screen.tsx` change) and its tests; every other failure keeps today's words.
- Run `npm test` and `npx tsc --noEmit` in `project-env` and save both outputs; show that removing the timeout branch fails a test.
- Take the AC-1 pictures on an isolated Paseo at the newest release you can install (own PASEO_HOME and ports, fake `op`), timeout and connection-failure cases, 1280 and 400 px; never touch the Captain's live install `paseo-project-env` or its settings and never read or print a secret value.
- Docs: retake the docs pictures with `docs/project-env/capture/` and compare them with the committed ones; for every screen word or picture your change alters, update `docs/project-env/install.md`, `prepare-1password.md` or `project-env/OVERVIEW.md` in the same PR, and say in the stage report which pictures and sentences changed, or `docs: no change` with the capture diff.
- Commit with a conventional title scoped to the plugin (e.g. `fix(project-env): a timed-out vault list says it took too long`), push, open a Draft PR on iamcxa/kc-paseo-plugins with the evidence; do not mark it ready or merge.
- Close only browser sessions you opened yourself, by name; never close all sessions.

## Scope notes

Batch r1b-polish-1, first of three code tasks in order (picker-slow-hint, rate-limit-cause, started-row-visible); rate-limit-cause later adds its branch to vaultListFailure, so keep that function easy to extend. Release review r1b-2 (project-env-picker-slow-hint/release-review-r1b-2.md) cleared the batch to enter implementation.
