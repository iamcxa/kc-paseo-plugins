# Docs site theme comparison

**Recommendation: switch to `just-the-docs` as a remote theme.** It is the only one of the four that lists all five pages in a navigation, marks the current page, and has search, with a one-file change (`_config.yml`). Keep `minima` if you want nothing new to depend on.

Yes, the theme can change. A theme is two lines in `_config.yml`. Nothing else in the site was edited for these tests.

## What GitHub Pages supports

- Pages supports 13 themes with no extra plugin: Architect, Cayman, Dinky, Hacker, Leap day, Merlot, Midnight, Minima, Minimal, Modernist, Slate, Tactile, Time machine (https://pages.github.com/themes/, read 2026-10-28). Set one with `theme: jekyll-theme-minimal` (https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-a-theme-to-your-github-pages-site-using-jekyll, read 2026-10-28).
- Any other public GitHub theme works with `remote_theme: OWNER/REPO`, loaded by `jekyll-remote-theme`. That plugin is in the `github-pages` 232 set (0.4.3 per https://pages.github.com/versions.json) and its README says it is "Supported on GitHub Pages" (https://github.com/benbalter/jekyll-remote-theme, read 2026-10-28). It is not on by default, so `plugins: [jekyll-remote-theme]` is needed. Add `@v0.12.0` to pin a release.

## Results (built with github-pages 232, Ruby 3.3, Docker; pictures in this folder)

| | minima (now) | cayman | minimal | just-the-docs v0.12.0 |
|---|---|---|---|---|
| Five pages in nav, no extra files | Yes, via `header_pages` already in config | No nav at all | No nav at all | Yes, automatic, but A-Z: Changelog, Install, Introduction, Prepare 1Password, Reference, plus the home page last |
| Current page marked | No | n/a | n/a | Yes (bold, shaded) |
| Phone menu | Hamburger; open list is 213 px tall | none | none | Hamburger; open panel 252 px tall, includes the search box |
| Dark mode | None | None | None | A built-in dark colour scheme exists, set by one config line; it does not follow the phone setting. Not rendered here |
| Search | No | No | No | Yes, built in |
| Adds | nothing | nothing | nothing | `remote_theme` + `plugins` lines; about 970 KB of CSS and JS (minima: 20 KB) |
| 400 px scrollWidth | 400 | 400 | 400 (body 384) | 400 |
| Broken images | 0 | 0 | 0 | 0 |

No theme scrolled sideways at 400 px, and all seven images loaded in each.

## What breaks or looks off

- **cayman** and **minimal** keep the pages but drop the navigation, so visitors can only move through links in the text. Fixing that needs a new `_includes` file. Cayman also puts a large green banner on every page that repeats the page title and site tagline.
- **just-the-docs** orders the menu A-Z and lists the home page last as "kc-paseo-plugins". Fixing the order needs `nav_order` in each page's front matter (not tested).
- cayman and minimal printed a "not a git repository" warning in Docker only. I did not check Pages itself.

## What gets worse with just-the-docs

- The build needs GitHub reachable to fetch the theme, so it depends on one more outside project.
- The look changes more (sidebar, purple links), and the page is about 50x heavier in assets.
- It was tested locally only. I did not publish it to Pages.

## Files

`<theme>-intro-1280.png` and `<theme>-intro-400.png` for each theme, plus `minima-menu-400.png` and `just-the-docs-menu-400.png`. Throwaway builds are in `/tmp/docs-themes/` (`build.sh` there is the Docker build adapted from `capture/build-site.sh`).
