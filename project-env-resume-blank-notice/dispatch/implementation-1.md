# Dispatch record: project-env-resume-blank-notice implementation-1

Dispatched: 06aa5bee9dd0bf0f0741b09783ab75b87bb96c8c
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved design exactly, starting from evidence/candidate-disposable.diff in this task's folder: the "Resumed without N project variables" row at the end of the first turn after a resume, the per-agent memory so the same failure is not repeated, the agent-notice sentence and the two OVERVIEW.md sentences.
Land AC-1's evidence at the candidate commit with evidence/harness/resume-check.sh (adapt to your own folder and port), plus the unit test that fails when the resume branch is removed, a screenshot of a failed first turn, whole-page pictures at 1280 and 400 px, and a rerun of the agent comprehension harness on the new notice sentence (project-env-built-in-agent-notice's evidence/comprehension harness in the archive: Codex gpt-6.1-sol medium, Claude claude-sonnet-5-5 medium and low, at least 4 runs per cell for the blank-variable scenario).
Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `design_surfaces.py check` on this task and `doc_impact.py <base> <candidate>`, then open the Draft PR.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.33.1 (run check scripts from this root)
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 06aa5bee9dd0bf0f0741b09783ab75b87bb96c8c. Do not stack. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit title scoped `project-env`, e.g. `feat(project-env): …`. Merging is the Captain's, or FO's under ADR 0007 class 2 after an approved validation.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.33.1/extensions/roborev/roborev_gate.py --repo <worktree> --base 06aa5bee9dd0bf0f0741b09783ab75b87bb96c8c`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: backlog 「開」 (2026-10-30) and ideation 「准」 (2026-10-31), which accepted that the line shows when the first turn after a resume ends.
Docs (local extension doc-site, trial, docs/dev2/.spacedock-state/local-ext/doc-site.md): retake the docs pictures with docs/project-env/capture/ and compare them with the committed ones; for every screen word or picture your change alters, update docs/project-env/install.md, prepare-1password.md or project-env/OVERVIEW.md in the same PR, and say in the stage report which pictures and sentences changed, or `docs: no change` with the capture diff.
Isolation: Paseo 0.14.0 only from a throwaway npm install with its own home and port, never replacing /Applications/Paseo.app or the global `paseo`; ports not used earlier (6920-9417, 18491, 18492). Fake `op` and `security`; comprehension runs use fake values only.
Evidence goes under this task's state folder, never on the candidate branch. Report findings as findings; add no checklist lines of your own.
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
