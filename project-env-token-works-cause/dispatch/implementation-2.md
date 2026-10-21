# Dispatch record: project-env-token-works-cause implementation-2 (follow-up to the live implementation worker)

Dispatched: 487b9b02a895b4a795141ba80a994992af1b4730
Model: sonnet (same live worker, spacedock-ensign-project-env-token-works-cause-implementation)

## Checklist

Revert the OP_CONNECT handling to today's behaviour: remove the two `delete env.OP_CONNECT_*` lines in `opEnv` and the "OP_CONNECT variables" test in `project-env/test/token-state.test.ts`. The Captain's ideation gate record says removing the OP_CONNECT names "is left out and listed for the Captain", and implementation-1's checklist said it "stays as today"; keeping it is outside the approved scope.
Rerun `npm test`, `npm run typecheck` and the roborev gate (`python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base <base sha>`), push the new head to PR #15 with an ordinary push, and append the result and new head SHA to your implementation stage report.
In the PR body, list the OP_CONNECT question under `without-it unanswered` for the Captain, with the observed fact that a set OP_CONNECT_HOST/OP_CONNECT_TOKEN makes op refuse even with a service-account token.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Draft PR grant and all constraints from implementation-1 still apply.
