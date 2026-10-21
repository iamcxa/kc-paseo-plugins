# Dispatch record: project-env-worktree-project-root validation-1

Candidate: 09bc5c98488f75d77e14c9bf73bd532457dd490e
Dispatched: 09bc5c98488f75d77e14c9bf73bd532457dd490e
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 09bc5c98488f75d77e14c9bf73bd532457dd490e (PR iamcxa/kc-paseo-plugins#19, base main) against AC-1, AC-2 and the approved design, including that the new cases fail on main's projectForCwd and that every existing project-for-cwd case still passes; also run the match read-only with real git against /Users/kent/conductor/repos/qnow-adopt-dev2 and a saved root equal to it; give a verdict.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Record every unverified obligation, including the qnow-adopt-dev2 agent check on Kent's daemon, without touching the live paseo-project-env install.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: 09bc5c98488f75d77e14c9bf73bd532457dd490e
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or switch the main checkout's branch.
