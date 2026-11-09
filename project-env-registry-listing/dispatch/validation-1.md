# validation-1
Dispatched: e4acaec1a454ccf39bb9aaaa48a478ac5333b561 (workflow checkout)
Model: opus
Candidate: 41e981017104e2c7359d4c3b954587e6eb06c89f

## Checklist
- Validate PR #82 at its exact head against AC-1: check the compliance record line by line against the saved publishing guide and REVIEW.md (research/2026-11-09-public-release-review/), re-deriving each status yourself rather than trusting it; confirm every media URL returns HTTP 200 with an image content type; check every OVERVIEW.md claim against the code at the candidate.
- Check the overview against the publishing guide's content rules (no install commands, no em dashes, sentence case, no licence or changelog sections, data flow including agent providers).
- Report every place outside this PR that now contradicts the overview (for example "login Keychain" in docs/project-env/ pages or the screen hint in shared/token.ts) as findings.
- Run `npm test` in `project-env` at the candidate; write the minimal acceptance script FO will rerun; do not push, mark ready or merge.

## Scope notes
Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.36.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Fresh validation; you did not write this change. Batch public-release-prep, independent PR off main; it merges last, after #81 and the service-account PR.
Never read or print a secret value; check secrets only by shape. Kent's live plugin install, his global `paseo` and his settings must not be touched. Close only browser sessions you opened yourself; stop only daemons you started.
