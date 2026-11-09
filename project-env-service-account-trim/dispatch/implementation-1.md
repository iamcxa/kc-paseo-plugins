# implementation-1
Dispatched: e4acaec1a454ccf39bb9aaaa48a478ac5333b561 (workflow checkout)
Model: sonnet

## Checklist
- Implement the approved design (trim the service account name on save and before every token lookup, for Test and agent start; no screen word changes) and the unit test that fails on main.
- Reproduce AC-1 on the candidate on an isolated Paseo at the newest release with fake `op` and `security`: a name typed with spaces saves trimmed, Test passes and a new agent gets its variable; a name without spaces behaves as today; pictures at 1280 and 400 px.
- Run `npm test` and `npx tsc --noEmit` in `project-env` and save both outputs; count the comment lines your diff adds.
- Commit with a conventional title scoped to the plugin, push, open a Draft PR on iamcxa/kc-paseo-plugins with the evidence; do not mark it ready or merge.

## Scope notes
Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.36.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Batch public-release-prep: three independent PRs off main, merged in the order service-account-trim, op-auth-and-cache, registry-listing. Branch from a freshly fetched `origin/main`.
Never read or print a secret value; check secrets only by shape. Kent's live plugin install `paseo-project-env`, his global `paseo` and his settings must not be changed, reloaded or removed; live probes run only on an isolated Paseo (own PASEO_HOME and ports, fake `op` and `security`).
Close only browser sessions you opened yourself, by name; never close all sessions. Stop only daemons you started.
Docs: retake the docs pictures with `docs/project-env/capture/` (isolated home only, never the global `paseo`) and compare them with the committed ones; for every screen word or picture your change alters, update `docs/project-env/install.md`, `prepare-1password.md` or `project-env/OVERVIEW.md` in the same PR, and say in the stage report which pictures and sentences changed, or `docs: no change` with the capture diff.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.36.0/extensions/roborev/roborev_gate.py --repo <worktree> --base e4acaec1a454ccf39bb9aaaa48a478ac5333b561`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
