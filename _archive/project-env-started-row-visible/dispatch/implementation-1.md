# Dispatch record: project-env-started-row-visible implementation-1

Dispatched: 6fcce94de4514d490cd1922a4ab935f1cc05c731
Model: sonnet (stage default emitted by spacedock dispatch build)

Reconstructed by FO on 2026-11-06, after the dispatch, from the dispatch build FO sent (checklist and scope files kept under /tmp/r1bpolish, builder output under /tmp/spacedock-dispatch). FO did not save this record at dispatch time. What the worker received is reproduced unchanged below; the scope notes it received carried no `Package root:` line and no completion-recipient line.

## Checklist

- Base your branch on the rate-limit-cause candidate, not on main: fetch `origin spacedock-ensign/project-env-rate-limit-cause` and start from commit 6fcce94 (PR #73, stacked on #72), because both touch `project-env/OVERVIEW.md` and tests. Open your Draft PR against `main`; say in the body that it stacks on #73 and #72 and must merge after them.
- Implement the approved design: add the Started-without row only at `agent.turn_ended` (remove the `agent.created` listener and the ten-minute expiry `PENDING_TTL_MS`/`prune`), the test changes listed in `## Design`, and the two stale sentences in `docs/project-env/index.md` and `project-env/OVERVIEW.md`.
- Run `npm test` and `npx tsc --noEmit` in `project-env` and save both; show that putting the `agent.created` listener back fails the new test.
- AC-2 (Captain amendment 1) only: on an isolated Paseo at the newest release (own PASEO_HOME and ports, fake `op` and `security`), repeated starts recording each row's position and whether it is on the page in the default chat display, pictures at 1280 and 400 px. Note: the rate-limit worker saw on 0.15.2 that today's Started-without line sits inside the turn's collapsed tool group; confirm the candidate's row is outside it.
- Docs: retake the docs pictures with `docs/project-env/capture/` and compare them with the committed ones; for every screen word or picture your change alters, update `docs/project-env/install.md`, `prepare-1password.md` or `project-env/OVERVIEW.md` in the same PR, and say in the stage report which pictures and sentences changed, or `docs: no change` with the capture diff.
- Commit with a conventional title scoped to the plugin (e.g. `fix(project-env): the Started without line stays visible after the first turn`), push, open the Draft PR; do not mark it ready or merge. Keep `gh` calls few.
- Never touch the Captain's live install or its settings; never read or print a secret value. Close only browser sessions you opened yourself, by name; stop only daemons you started.

## Scope notes

Batch r1b-polish-1, third code task. #73 is in validation in parallel; if its branch changes, FO will tell you.
