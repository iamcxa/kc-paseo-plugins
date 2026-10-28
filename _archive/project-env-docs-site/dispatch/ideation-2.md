# Dispatch record: project-env-docs-site ideation-2

Dispatched: bed5a6644c646e91c9cbc235807f33bce878cc8f
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Revise the design for the Captain's revise of 2026-10-28 (quoted in the ideation gate record): switch the site to the just-the-docs remote theme pinned at v0.12.0 (`remote_theme` plus `plugins: [jekyll-remote-theme]`), with the home page first and the pages in reader order via `nav_order`, each page's title heading shown, and search on; keep the rest of the design, AC-1 and AC-2; update `_config.yml`, the page drafts and the design text, and say whether the dark scheme is used, with a reason.
Rebuild with the github-pages gem set and retake the whole-page previews at 1280 and 400 px (each page, the open phone menu, and search results for one query), recheck the crawl, exclusions and scrollWidth, and run the design review of the new pictures with each finding dispositioned; name any decision the Captain must make (at most one), with a recommendation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
This is ideation cycle 2. Cycle 1's design, drafts, capture scripts and previews are in this task's folder and `## Design`; the theme comparison and just-the-docs pictures are in evidence/themes/ (comparison.md, built with /tmp/docs-themes/build.sh, which you may reuse). Revise in place and add a short "Revision 2" note naming what changed. Base: main bed5a6644c646e91c9cbc235807f33bce878cc8f. The stock-minima Needs decision and its "ADR:" title are withdrawn by this choice; do not carry them.
Turning on GitHub Pages or any repository setting is outward-facing and not yours: build and preview locally only. No branch; evidence under this task's folder. Report findings as findings; add no checklist lines of your own. Use your own ports, not ones used earlier (6920-7410).
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
