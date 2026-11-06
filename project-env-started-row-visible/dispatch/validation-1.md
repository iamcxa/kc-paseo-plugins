# Dispatch record: project-env-started-row-visible validation-1

Candidate: 9439ec8b2aec5fcd2604e4bb0846d5a197ec1949
Candidate: 2e07bb25939d852e0b5bac3024d9745009c75d6c
Dispatched: 9439ec8b2aec5fcd2604e4bb0846d5a197ec1949
Model: sonnet (stage default emitted by spacedock dispatch build)

Reconstructed by FO on 2026-11-06, after the dispatch, from the dispatch build FO sent (checklist and scope files kept under /tmp/r1bpolish, builder output under /tmp/spacedock-dispatch). FO did not save this record at dispatch time. What the worker received is reproduced unchanged below; the scope notes it received carried no `Package root:` line and no completion-recipient line.

## Checklist

- Validate PR #75 at its exact head (name the SHA as the Candidate; it stacks on #73 at 6fcce94, so judge only the diff 6fcce94..head) against AC-2 (Captain amendment 1): on an isolated Paseo at the newest release (own PASEO_HOME and ports, fake `op` and `security`), in the default chat display, a new agent that starts without a mapped variable shows the Started-without line on the page after its first turn ends, in every run of the case that folded it before; record each row's position and visibility over repeated starts (warm, cold, stopped, failed) for candidate and base; pictures at 1280 and 400 px.
- Run `npm test` and `npx tsc --noEmit` in `project-env` at the candidate; confirm the placement test fails when the `agent.created` listener is put back.
- Check the PR body's `without-it unanswered` item (removal of the ten-minute expiry) and say what you observe about its cost.
- Docs: follow the built pages' words through the screens this change touches (including the changed sentences in `docs/project-env/index.md` and `project-env/OVERVIEW.md`), and report any sentence or picture that no longer matches.
- Run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.34.0/scripts/design_surfaces.py check <task>` and record it.
- Never touch the Captain's live install `paseo-project-env`, his global `paseo` or his settings; never read or print a secret value. Do not push, mark ready or merge. Close only browser sessions you opened yourself, by name; stop only daemons you started. Keep `gh` calls few.

## Scope notes

Fresh validation; you did not write this change. Batch r1b-polish-1, third code task, stacked on #73 (validated PASSED at 6fcce94) and #72. The implementation's harness note: on 0.15.2 a fresh browser lands on the welcome screen, see evidence/harness/cases152.sh.

## FO note (2026-11-06, not sent to the worker)

After the Captain approved validation and #72 was squash-merged, GitHub reported this PR conflicting because its branch still carried #72's original commit. With the Captain's 「可以」 (FO chat, 2026-11-06) FO rebased the branch onto main 53c9ab3 and force-pushed 2e07bb25939d852e0b5bac3024d9745009c75d6c. `git diff 9439ec8b2aec5fcd2604e4bb0846d5a197ec1949 2e07bb25939d852e0b5bac3024d9745009c75d6c` changes only docs/journey/project-env/give-agents-their-project-setup.yaml, which #71 merged to main; every project-env file is identical to the validated head. FO ran `npm test` (335 pass, 0 fail) and `tsc --noEmit` (exit 0) on the new head. No worker re-validated it.
