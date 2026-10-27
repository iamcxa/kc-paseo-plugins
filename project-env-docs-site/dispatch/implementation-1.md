# Dispatch record: project-env-docs-site implementation-1

Dispatched: bed5a6644c646e91c9cbc235807f33bce878cc8f
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Implement the approved revision 2 design exactly from this task's site-draft/, capture/ and evidence/source-edits.diff: `_config.yml` with the just-the-docs remote theme pinned at v0.12.0, `nav_order`, search and every internal path excluded; the Introduction, Install and Prepare 1Password pages; the two root wrapper files; the one `_sass/custom/custom.scss` rule that takes the search result's page label to at least 4.5:1 on white; the OVERVIEW.md, README.md and CHANGELOG.md edits; the screenshots; and the capture and check scripts with their hard-coded paths turned into arguments.
Write ADR 0009 (reserved under ## Number guards), "The docs site uses the just-the-docs theme pinned at v0.12.0", recording the Captain's words 「just-the-docs」 (2026-10-28) and his 「准」 on the one contrast rule (ideation attempt 2, 2026-10-28) with the questions they answered, and run adr_lint and number_guards check.
Land AC-1's evidence at the candidate commit (build with the github-pages gem set, crawl, exclusions, scrollWidth, previews at 1280 and 400 px, the search label's contrast) and AC-2's run from the built pages' own words on an isolated Paseo home with fake op and security up to an agent that starts with one mapped variable set, recording every place the words were not enough; then run the roborev gate, design_surfaces.py check and doc_impact.py, and open the Draft PR with `without-it unanswered` listing the capture scripts.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0 (run check scripts from this root)
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main bed5a6644c646e91c9cbc235807f33bce878cc8f. Do not stack. The PR merges by squash.
Number guards: ADR: 0009
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Conventional commit titles scoped `project-env`, e.g. `docs(project-env): …`. Merging is the Captain's, or FO's under ADR 0007 class 2 after an approved validation.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0/extensions/roborev/roborev_gate.py --repo <worktree> --base bed5a6644c646e91c9cbc235807f33bce878cc8f`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Captain: backlog 「可以，先文件」 (2026-10-27), amendment 1 「just-the-docs」 (2026-10-28) and ideation 「准」 (2026-10-28), which allowed the one contrast rule and kept the two wrapper files. Release review: project-env-docs-site/release-review-r1b.md; do not edit the journey map in this task.
Turning on GitHub Pages or any repository setting is outward-facing and not yours: build and preview locally only. Evidence goes under this task's state folder, never on the candidate branch. Report findings as findings; add no checklist lines of your own. Pictures carry no real account, vault, host or person name. Use your own ports, not ones used earlier (6920-7410).
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
