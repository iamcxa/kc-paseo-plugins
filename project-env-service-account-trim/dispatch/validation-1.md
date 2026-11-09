# validation-1
Dispatched: e4acaec1a454ccf39bb9aaaa48a478ac5333b561 (workflow checkout)
Model: opus
Candidate: 7035292f7ebbd9ef12c7a9f6f664ef21d4a3645d

## Checklist
- Validate PR #83 at its exact head against AC-1: on an isolated Paseo at the newest release with fake `op` and `security`, a service account name typed with leading or trailing spaces passes the connection check and a new agent gets its mapped variables; a name saved earlier with spaces also works; a name without spaces behaves as today; pictures at 1280 and 400 px.
- Run `npm test` and `npx tsc --noEmit` in `project-env` at the candidate; reproduce that the new unit test fails without the server trim, and rerun the client-half falsifier the implementation did not rerun (design clause 4).
- Write the minimal acceptance script FO will rerun in a fresh shell; do not push, mark ready or merge.

## Scope notes
Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.36.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Fresh validation; you did not write this change. Batch public-release-prep, independent PR off main; it merges first.
Never read or print a secret value; check secrets only by shape. Kent's live plugin install, his global `paseo` and his settings must not be touched. Close only browser sessions you opened yourself; stop only daemons you started.
Docs: follow the built Install and Prepare 1Password pages' words through the screens this change touches, and report any sentence or picture that no longer matches.
