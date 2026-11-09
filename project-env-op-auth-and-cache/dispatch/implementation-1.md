# implementation-1
Dispatched: e4acaec1a454ccf39bb9aaaa48a478ac5333b561 (workflow checkout)
Model: sonnet

## Checklist
- Implement the approved design in `project-env/server/secrets.ts`: `opEnv` removes every `OP_`-prefixed variable then sets the token; a cache generation counter so a read started before `clearCache` is returned but not cached; `storeToken` goes through `clearCache()`.
- Add `test/op-identity.test.ts` and `test/cache-after-clear.test.ts` (both clear paths) and show each fails on main.
- Run `npm test` and `npx tsc --noEmit` in `project-env` and save both outputs; count the comment lines your diff adds.
- Commit with a conventional title scoped to the plugin, push, open a Draft PR on iamcxa/kc-paseo-plugins with the evidence; do not mark it ready or merge.

## Scope notes
Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.36.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Batch public-release-prep: three independent PRs off main, merged in the order service-account-trim, op-auth-and-cache, registry-listing. Branch from a freshly fetched `origin/main`.
Never read or print a secret value; check secrets only by shape. Kent's live plugin install `paseo-project-env`, his global `paseo` and his settings must not be changed, reloaded or removed; live probes run only on an isolated Paseo (own PASEO_HOME and ports, fake `op` and `security`).
Close only browser sessions you opened yourself, by name; never close all sessions. Stop only daemons you started.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.36.0/extensions/roborev/roborev_gate.py --repo <worktree> --base e4acaec1a454ccf39bb9aaaa48a478ac5333b561`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
