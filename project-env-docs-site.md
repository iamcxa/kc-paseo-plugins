---
id:
title: A public docs page introduces project-env and walks a new teammate through setup
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1b
journey-story: install-one-command
gates:
    version: 1
    records:
        - id: gate:project-env-docs-site:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-docs-site-backlog-1
              briefing:
                id: briefing:project-env-docs-site:backlog:attempt-1:revision-1
                digest: sha256:d58c363dda8bb88a084208b56ec6a6222cfccb5d65341e235bb07d347294f430
                room-ref: ./project-env-docs-site/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-docs-site:backlog:1
                briefing: briefing:project-env-docs-site:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-27T15:33:25.323767Z"
                decision: approve
                reason: '「可以，先文件」 — Captain in FO chat, 2026-10-27. Asked: 「你要決定的：先做哪一個？建議先做「文件網站加插件介紹」…可以併進「r1b 新同事上手」…回「先文件」或「先保險庫」。」 FO had recommended docs first. The page''s scope and the Pages switch-on are confirmed at the ideation gate.'
              application:
                target-stage: ideation
                state: consumed
---

From the Captain on 2026-10-27, before opening project-env to the recce team: 「顯然還缺 plugin 介紹，文件說明，以及可以的話應該架一個基於 github md 檔案的 release page…方便大家看設定看文件看圖片等」. FO's research (`research/2026-10-27-1password-agents-and-docs-site.md` in this state checkout) recommended GitHub Pages with its built-in Jekyll from the repository's Markdown. Asked which to do first, the docs page or agent-organised vaults, he answered 「可以，先文件」. FO checked on 2026-10-27: `project-env/OVERVIEW.md` has one line on prerequisites and no install steps for the 1Password CLI; the journey map (`docs/journey/project-env/give-agents-their-project-setup.yaml`) marks the install story `unverified` and its prerequisite and plugin-enable stories `gap`.

## Scope

In: one public page set built from Markdown in iamcxa/kc-paseo-plugins: a short introduction to project-env with screenshots, install steps that a new teammate can follow from nothing (Paseo version, enabling plugins, `paseo plugin add github:iamcxa/kc-paseo-plugins:project-env`, the 1Password CLI), how to prepare 1Password (one read-only service account per vault, an expiry, the `agent-<project>-<env>` vault name from ADR 0005), the existing troubleshooting notes, and links to the GitHub releases. Internal documents (`docs/adr`, `docs/dev2`, `docs/dev2-poc`, state) are not published. Turning on GitHub Pages is a public, outward-facing step: it is done only after the Captain approves the built page at validation. Out: agent-organised vaults, a search or sidebar theme, Netlify, spacedock-bridge's own pages beyond a link. Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: Built from the repository with GitHub Pages' own Jekyll, the site shows the project-env introduction, install, 1Password preparation and troubleshooting pages with their pictures, and no file from `docs/adr`, `docs/dev2` or `docs/dev2-poc`.
Verified by: a local build with the GitHub Pages gem set, a crawl of the built site listing every page and image, a check that no internal path is present, and whole-page pictures at desktop and 400 px.

**AC-2**: The install and preparation steps were followed as written by someone starting from a Mac without the plugin, up to an agent that starts with one mapped variable set.
Verified by: a run on an isolated Paseo home following only the page's words, with fake `op` and `security` where a real account is needed, recording each step and any place the words were not enough.

## FO alignment

Surfaces: ui
Visible change: A public page introduces project-env and gives a new teammate install, 1Password preparation and troubleshooting steps with pictures.
Direction alignment with the Captain: done — he asked for the introduction, docs and a Markdown-based page on 2026-10-27 and chose docs first (「可以，先文件」); the page's scope and the Pages switch-on are confirmed at the ideation gate.
Release review: paseo-project-env/r1b at 4e22d4ad63bc50d4bcc32a403720b429152bad8a — signal 1: this task is admitted into r1b under story install-one-command and writes the words for r1b's get-plugin and prepare-1password stories, so r1b is marked changed and kc-journey-map review-release runs at the first implementation dispatch.
Map footprints: not needed: no journey answer is recorded by this task; the ideation report lists the stories for a later map update.
