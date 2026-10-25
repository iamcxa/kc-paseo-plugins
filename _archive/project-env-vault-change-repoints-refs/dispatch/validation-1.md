# Dispatch record: project-env-vault-change-repoints-refs validation-1

Candidate: 1450008e9bf687c7f75c054007dcb4b32844a314
Dispatched: 1450008e9bf687c7f75c054007dcb4b32844a314
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 1450008e9bf687c7f75c054007dcb4b32844a314 (PR iamcxa/kc-paseo-plugins#50, base main e55cb33) against AC-1, AC-2 and AC-3 and the approved design: rebuild and run it yourself on an isolated Paseo; confirm the re-point line text and that Done then Save writes the new vault and moved refs while Cancel and a third-vault ref change nothing; the outside mark shows before any Test; the focus outline differs from the danger and dashed borders in dark and light; Discard drops the re-point; the ADR 0005 amendment matches the task's draft and the Captain's words; give a verdict.
Run the built screen review your validation principles require (design-director pass 2a on your own screenshots of the built screen at 1280 and 400 px) and write its Built screen review lines; write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0/scripts/adr_lint.py docs/adr --since e55cb33` recording its exit code.
Record what the Captain should see in the screenshots and every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 1450008e9bf687c7f75c054007dcb4b32844a314
Work from `git archive` of the candidate, not the shared worktree. Evidence goes under this task's state folder. Report findings as findings; add no checklist lines of your own.
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
If you cannot dispatch the design director for the built screen review, say so in the report and do not write a waiver; FO will run it.
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards; not /tmp/pe-astra, /tmp/pe-vcr or ports 6920, 6971, 6972, 6981.
