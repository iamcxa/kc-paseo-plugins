# Dispatch record: project-env-built-in-agent-notice validation-1

Candidate: cf1d3a8510525fbc2cf5bdc60363256af0ec261d
Dispatched: cf1d3a8510525fbc2cf5bdc60363256af0ec261d
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate cf1d3a8510525fbc2cf5bdc60363256af0ec261d (PR iamcxa/kc-paseo-plugins#53, base main 335d129) against AC-1 to AC-4 and the approved revision 2 design: rebuild and run it yourself on an isolated Paseo; confirm the exact notice reaches agents only in projects with at least one variable and names no variable or value; no prompt box and a saved prompt never sent and gone after Save; the "Projects ›" link returns to the project list, asks first with unsaved changes, and has a press area of at least 44 px; OVERVIEW.md explains every cause in shared/cause.ts (tick each one); run the comprehension harness on the candidate's notice for at least one Claude and one Codex run; classify the implementation's open roborev Medium (an internal agent gets no notice while agent.session_open still injects its variables; main 335d129 behaves the same); give a verdict.
Run the built screen review your validation principles require (design-director pass 2a on your own screenshots of the built screen at 1280 and 400 px) and write its Built screen review lines; write the minimal acceptance script FO will rerun in a fresh shell.
Record what the Captain should see in the screenshots and every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.31.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: cf1d3a8510525fbc2cf5bdc60363256af0ec261d
Work from `git archive` of the candidate, not the shared worktree. Run the package's check scripts from the Package root above (the implementation ran them from 0.29.0). Evidence goes under this task's state folder. Report findings as findings; add no checklist lines of your own.
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
If you cannot dispatch the design director for the built screen review, say so in the report and do not write a waiver; FO will run it.
Never read or print a secret value; run no op or security command; comprehension runs use fake values only. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards; not /tmp/pe-astra, /tmp/pe-vcr*, /tmp/pe-ban, /tmp/pe-bn2 or ports 6920, 6934, 6935, 6944, 6945, 6951, 6971, 6972, 6981, 6991, 6993.
