# 9. The docs site uses the just-the-docs theme pinned at v0.12.0

Date: 2026-10-28

## Status

Accepted

## Context

The public docs site is built from this repository's Markdown by GitHub Pages' built-in
Jekyll (task `project-env-docs-site`). The first design used the stock minima theme, which
has no sidebar and no search. FO compared four themes on 2026-10-28
(`evidence/themes/comparison.md` in that task's state folder): only just-the-docs lists the
pages in a sidebar that marks the current page and has built-in search. Its cost is a
build that fetches the theme from GitHub through `jekyll-remote-theme` (0.4.3, in the
`github-pages` 232 set, `pages.github.com/versions.json` read 2026-10-28) and about 970 KB
of CSS and JS where minima has 20 KB.

The design review of the built pictures measured the theme's search-result page label at
2.1 to 1 on white (`rgb(184,169,246)`): `_sass/search.scss` of v0.12.0 sets
`.search-result-doc.search-result-doc-parent` to `opacity: 0.5` over the link colour, with
no variable or option to change it. With the opacity at 1 the same colour is 5.0 to 1.

## Decision

**Words:**
1. 「just-the-docs」 — Captain, 2026-10-28, answering 「回「換 just-the-docs」或「維持 minima」。」 while the ideation gate of `project-env-docs-site` was open
2. 「准」 — Captain, 2026-10-28, on the second ideation gate of `project-env-docs-site`, asked "Approve the revised docs site design (just-the-docs pinned at v0.12.0, six pages in reader order with search, two root wrapper files) and AC-1 and AC-2 into implementation? ... Say if you object to any part."; the design he approved allows one stylesheet rule that darkens the search result's page label to at least 4.5 to 1

**Options considered:**
- the just-the-docs remote theme pinned at v0.12.0, light scheme, with one site-owned stylesheet rule for the search result's page label (chosen)
- the stock minima theme, no site-owned stylesheet
- just-the-docs with the label left at the theme's 2.1 to 1
- cayman or minimal, which have no navigation

**Recommended:** stock minima in the first gate question; just-the-docs in FO's later theme comparison; the one stylesheet rule in the second gate question

**Protects:**
- `_config.yml` — the `remote_theme` line, the version pin
- `_sass/custom/custom.scss` — the one rule on the search result's page label

The site loads just-the-docs at the tag v0.12.0 and no other version. The only site-owned
stylesheet is `_sass/custom/custom.scss`, one rule that keeps the search result's page
label at 4.5 to 1 or better on white. Another theme, another version or another
site-owned rule needs a new ruling.

## Consequences

- A version bump re-checks the label's contrast and the build crawl in the task's
  acceptance criteria before the pin moves.
- The Pages build depends on GitHub serving the theme; a failed fetch fails the build.
- The theme copies two sample photographs (about 590 KB) into the site that no page uses.
- Reopen if the theme stops building on GitHub Pages or a reader-facing defect appears
  that only a second site-owned rule can fix.
