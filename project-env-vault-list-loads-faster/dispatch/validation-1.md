# Dispatch record: project-env-vault-list-loads-faster validation-1

Candidate: 924d213e844c1e123bba6d56a8bc784f74c9ad54
Dispatched: 924d213e844c1e123bba6d56a8bc784f74c9ad54
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 924d213e844c1e123bba6d56a8bc784f74c9ad54 (PR iamcxa/kc-paseo-plugins#55, base main 0b55dfd) against AC-1 and the approved design: rebuild from git archive, rerun the server timing and the on-screen timing yourself at 10, 30 and 100 items, before on main (with the fake op delay support only) and after on the candidate, recording load average; confirm the listed fields, skipped items and their reasons are identical; confirm the op arguments and call count are unchanged (N+1); check that the four concurrency tests fail and pass as AC-1 states and that a mutation of the bound or of the earliest-cause rule is caught; read the change for an unhandled rejection, a read started after a whole-list failure, or a lost result; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and record every unverified obligation (real op time, reads per get, burst throttling).

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.31.0 (run check scripts from this root)
Send your completion message to `main`.
Candidate: 924d213e844c1e123bba6d56a8bc784f74c9ad54
Work from `git archive` of the candidate, not the shared worktree. Evidence goes under this task's state folder (evidence/val/). Report findings as findings; add no checklist lines of your own. Surfaces: none, so no built screen review is owed.
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Runtime probes use their own daemon, folder and port (not /tmp/pe-vlf* or ports 6920-7301 used earlier), removed afterwards.
