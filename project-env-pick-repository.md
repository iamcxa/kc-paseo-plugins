---
id:
title: A new teammate can add a repository even when Paseo has no project or the project list fails
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1b
journey-story: pick-repository
---

Journey release r1b story `pick-repository` ("Pick the repository from Paseo's project list") is a gap. FO read `Configured` in `project-env/client/settings-screen.tsx` at origin/main 7b63c31 on 2026-10-28: the "Add a project" select is drawn only when `candidates.length > 0`, so when Paseo has no project, every project is already configured, or `paseo.projects.list()` fails, the section shows nothing and says nothing. The r1b release review (`project-env-docs-site/release-review-r1b.md`) and the docs-site AC-2 run both met it; the Prepare page works around it with words. Asked whether to open this task first among r1b's code tasks, recommending it, the Captain answered 「r1b開。跟 dev2 fo 講這個需求」 on 2026-10-28.

## Scope

In: the project list section always tells a person what to do next: with no unconfigured Paseo project it says how to add the repository to Paseo first (the path the Prepare page names), and when the project list fails to load it says so and offers a retry, instead of drawing nothing. The existing "Add a project" select is unchanged when candidates exist.
Non-goals: creating a Paseo project from inside the plugin; the field picker; the other r1b stories (pick-field, find-settings, setup-guide); the docs pages beyond the one Prepare step that describes this screen.
Budget: one ideation, implementation and validation round; a second validation cycle returns to the Captain.
Stop condition: the acceptance criteria pass and the Captain's UAT is recorded.

## Acceptance criteria

**AC-1**: On an isolated Paseo with no project, with every project already configured, and with the project list failing, the project list section shows a sentence that names the next step (and, on failure, a retry), never an empty section; with an unconfigured project the "Add a project" select works as today.
Verified by: a runtime run of the four states at 1280 and 400 px with whole-page pictures, and a unit test for the state that fails when the empty-state branch is removed.

## FO alignment

Surfaces: ui
Visible change: The project list section tells a new teammate how to add a repository when Paseo has none, and says when the list failed to load.
Direction alignment with the Captain: done — he approved opening it on 2026-10-28 (「r1b開」) after FO's recommendation to do pick-repository first.
Release review: paseo-project-env/r1b at 637d05404ccafa198d9f283e1d7d2183c8304dea — the task carries story pick-repository, already in r1b at the journey file's last edit (#59), and no goal changed since the 2026-10-28 review.
Map footprints: not needed: no open map question is answered by this task.
