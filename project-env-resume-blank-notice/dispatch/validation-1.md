# Dispatch record: project-env-resume-blank-notice validation-1

Candidate: 9d8760b85a71f72087a11821eb276ccf2d3d0ec2
Dispatched: 9d8760b85a71f72087a11821eb276ccf2d3d0ec2
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 9d8760b85a71f72087a11821eb276ccf2d3d0ec2 (PR iamcxa/kc-paseo-plugins#66, base main 06aa5be) against AC-1 and the approved design: from git archive run `npm ci && npm test` and `npm run typecheck`; run the resume harness yourself on an isolated Paseo 0.14.0 for the lost, healthy and blank agents, and try to capture the unreadable case on an unpatched one-hour release if the run can wait (say so if it cannot); check the row after a failed first turn; check the resume branch is caught by a unit test when removed; rerun the agent comprehension harness on the new notice sentence and grade it independently; give a verdict.
Classify the implementation's two open points: its deviation from "refresh stays silent" (notices.retain forgets shown variables a refresh read, no row or UI change) and roborev:1371 (Medium: a refresh that reads every variable during a resumed turn can suppress one later identical failure); say whether docs/project-env/index.md's "a line at the top of the new conversation" is still true.
Run the built screen review your validation principles require (design-director pass 2a on your own screenshots of the built screen at 1280 and 400 px) and write its Built screen review lines; write the minimal acceptance script FO will rerun in a fresh shell.
Record what the Captain should see in the screenshots and every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.33.1 (run check scripts from this root)
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 9d8760b85a71f72087a11821eb276ccf2d3d0ec2
Work from `git archive` of the candidate, not the shared worktree. Evidence goes under this task's state folder (evidence/val/). Report findings as findings; add no checklist lines of your own.
Docs (local extension doc-site, trial, docs/dev2/.spacedock-state/local-ext/doc-site.md): follow the built Install and Prepare 1Password pages' words through the screens this change touches, and report any sentence or picture that no longer matches.
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Isolation: Paseo 0.14.0 only from a throwaway npm install with its own home and port, never replacing /Applications/Paseo.app or the global `paseo`; ports not used earlier (6920-9500, 18491, 18492). Fake `op` and `security`; comprehension runs use fake values only.
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
