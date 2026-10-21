# Dispatch record: project-env-token-works-cause implementation-1

Dispatched: 487b9b02a895b4a795141ba80a994992af1b4730
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design: the eight token states with fixed text from shared/token.ts, `checkToken(token)` and `tokenStatus` built on it, the vault list on the token row and picking the only readable vault when none is chosen, Check-driven re-checks instead of per-keystroke, and the removal of the "ADR 0027" comment; OP_CONNECT handling stays as today (left out at the gate).
Land tests so AC-1 to AC-3 each pass with the evidence their clauses name and fail when the behaviour is removed; record AC-2's on-Mac use as owed.
Run `npm test`, `npm run typecheck`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/design_surfaces.py check <task file>` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 487b9b02a895b4a795141ba80a994992af1b4730. Do not stack on another task's branch. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries) — covers pushing your task branch and opening a Draft PR to iamcxa/kc-paseo-plugins. Commit and PR titles use conventional commits scoped `project-env`, because release-please reads them. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base <base sha>`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain rulings for r1.5: docs/adr/0001–0005, the map's ruling lists, and this task's ideation gate approval 「准五個設計」 (2026-10-21) with the additions named in its gate record.
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; check by shape only. Run no op or security command that can raise a 1Password desktop authorization prompt.
Kent's live plugin `paseo-project-env` runs from /Users/kent/Project/kc-paseo-plugins/project-env on main: do not change, reload or remove it, and do not switch that checkout's branch. A runtime probe uses an isolated daemon (own home and port) and a throwaway plugin id, removed afterwards.
