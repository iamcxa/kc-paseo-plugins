# Dispatch record: project-env-paste-token-check-first implementation-1

Dispatched: 948e98aeb418be30ae63d379af0b20e31bad59f0
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design on top of main (which now holds T1's `checkToken(token)`, the eight token states and `shared/token.ts`): a shape check (ops_ prefix, not exactly 128 characters, no whitespace, control character, quote or backslash), then `checkToken` on the pasted token, and only an ok token is written; the token goes to `security -i` on stdin as `-X <hex>`, never on argv; the write refuses a service name with a quote, backslash or control character; the overwrite warning names the other project(s) with Replace and Cancel; a refused token stays in the field.
Land tests so AC-1 to AC-4 pass with the evidence their clauses name and fail when their behaviour is removed, including a test that the token never appears on a security argv and that a newline in a token cannot start a second command; record Kent's on-Mac use as owed.
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/design_surfaces.py check docs/dev2/.spacedock-state/project-env-paste-token-check-first.md` and `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 948e98aeb418be30ae63d379af0b20e31bad59f0. Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`. Merging is the Captain's.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base <base sha>`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: ideation approval 「准五個設計」 (2026-10-21) with the additions in its gate record (AC-4 and the rewritten AC-3 for this task).
Never read or print a secret value: run no command that fetches a 1Password field value or a Keychain password; use only throwaway keychain files with fake values for security probes, deleted afterwards. Run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or switch the main checkout's branch.
