# ideation-1
Dispatched: e4acaec1a454ccf39bb9aaaa48a478ac5333b561 (workflow checkout)
Model: opus

## Checklist
- Read the saved publishing guide and REVIEW.md and list every requirement that applies to a public GitHub folder source (iamcxa/kc-paseo-plugins, path project-env), with what main e4acaec already meets and what it lacks.
- Propose the manifest description, the listing media (public HTTPS image URLs or packaged files; the docs site pictures under docs/project-env/img/ are candidates), and every overview change the rules or the plugin's data access require, including where values go once an agent has them; check each overview claim against the code, including the Paseo version requirement.
- Name the licence options for the Captain with one recommendation; do not add a licence.
- Write the PRFAQ and AC-1 evidence clauses a reviewer can rerun; the compliance record format is part of the design.
- Every project-env change you propose names how `npm test` in project-env stays green; run `npm test` on main once and record the result.

## Scope notes
Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.36.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Batch public-release-prep has three members ideating in parallel; stay inside this task's Scope. Ideation writes no repository file, branch or commit. The release reviews and Paseo registry documents are in docs/dev2/.spacedock-state/research/2026-11-09-public-release-review/.
Never read or print a secret value; check secrets only by shape. Kent's live plugin install `paseo-project-env` and its settings must not be changed, reloaded or removed; live probes run only on an isolated Paseo (own PASEO_HOME and ports, fake `op` and `security`).
Close only browser sessions you opened yourself, by name; never close all sessions. Stop only daemons you started.
