# doc-site (local extension, trial)

Trial of a repo-local dev2 extension for kc-paseo-plugins, for one or two rounds of project-env ui tasks. Captain: 「試」 (FO chat, 2026-10-28), answering FO's question whether to run the trial the kc-plugin dev2 FO proposed after the Captain told it 「…讓他 dogfood 一兩輪，再主動跟你討論」. It lives in the state checkout, not in `docs/` (published by GitHub Pages) and not in the synced workflow README.

- **Joins:** the implementation and validation dispatch of every task whose `Surfaces:` includes `ui` and whose diff touches `project-env/client/` or `project-env/shared/` text shown on screen.
- **Instruction FO adds to the implementation scope notes:** "Docs: retake the docs pictures with `docs/project-env/capture/` and compare them with the committed ones; for every screen word or picture your change alters, update `docs/project-env/install.md`, `prepare-1password.md` or `project-env/OVERVIEW.md` in the same PR, and say in the stage report which pictures and sentences changed, or `docs: no change` with the capture diff."
- **Instruction FO adds to the validation scope notes:** "Docs: follow the built Install and Prepare 1Password pages' words through the screens this change touches, and report any sentence or picture that no longer matches."
- **Read:** FO records, per task, under `### Local extension doc-site` in the task file: what it asked, what it caught (or `nothing`), what it cost (worker time if reported, extra cycle), and any place FO told a worker about it by hand.
- **End of trial:** after one or two rounds FO tells the kc-plugin dev2 FO, without waiting to be asked, whether it paid and what the package would need for a local extension to load like a package one.
