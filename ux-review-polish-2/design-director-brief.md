# Brief: Design Director, polish round 2 for the project-env settings screen (main 5eb0ba4)

You are the Design Director for the `project-env` Paseo plugin. You did not build this screen. The Captain (Kent, the only user today) ran UAT on the round-1 polish build and raised these items, which are the core of round 2:

1. 「這個 use this connection 按鈕是否可以放在 vault 選擇的後面？或是換個方式重新設計儲存跟取消」: in the Change form, "Use this connection / Done" and "Keep the current connection / Cancel" are two full rows under Vault. He wants them placed after the vault choice, or the save and cancel design rethought. His screenshots show the two rows at 1280 px.
2. 「import from conductor 功能可以移除」: remove the "Import names and prompt from Conductor" feature.
3. Found live on 2026-10-23: after the saved vault was changed to `agent-qnow-dev` (a vault rename), every variable reference still pointed at `op://qnow-dev/…`. project-env blanks a reference outside the saved vault (`isOutsideVault`, ADR 0001), so all five variables were silently blanked for new agents and the screen showed nothing. The FO re-pointed them by hand. Decide how the screen should handle a vault change: re-point the references automatically, warn and offer to re-point, or something else.

Also put in your table the items still open from round 1, so the Captain can choose with everything in view. Read `../ux-review-a5-polish/traceability.md`. The open ones:
- R3a: at 400 px the save bar covers the Danger zone text on first load.
- The focused pill's border is faint when the no-field note takes you to a row.
- The note's cursor restarts after a 720 px remount.
- R16: "All N set". Both reviewers still object.
- Gemini's new nitpick: the disabled Save has no reason on hover.

## Read

- `../ux-review-a5-polish/design-director.md`, your round-1 ruling.
- `../ux-review-a5-polish/traceability.md`.
- The re-review sections in `../ux-review-a5-polish/astra-review.md` and `gemini-review.md`.
- The archived round-1 tasks under `../_archive/project-env-*.md`, for the Captain's amendments and FO declines.
- The ADRs in `/Users/kent/Project/kc-paseo-plugins/docs/adr/`. ADR 0001 covers one vault per repository; ADR 0005 is now amended with vault naming guidance.
- The journey map `/Users/kent/Project/kc-paseo-plugins/docs/journey/project-env/give-agents-their-project-setup.yaml`. The Conductor import is a shipped story there; say what removing it means for the map and for any ADR.
- The code at `/Users/kent/Project/kc-paseo-plugins/project-env`, read-only.

## You may reproduce

The harness is `../ux-review-a5-polish/harness/`: `setup.sh` and `teardown.sh`, with `CHECKOUT`, `S` and `PORT` as environment variables. Run it with your own `S=/tmp/pe-dd2` and `PORT=6925`. Drive it with `agent-browser --session director2`. Tear it down when you are done.

## Decide

For each item, give:
- Real? (reproduced or read in code)
- Verdict: solve, do not solve, or Captain decision. A Captain decision is needed when the item contradicts a ruling of his, or changes scope or an acceptance criterion.
- How: one or two sentences, and the part of the screen it touches.
- When: this round, a named release, or never.

For item 1, show two or three layout options as quick mock screenshots or annotated captures from a running build, and recommend one.

## Then propose

At most three backlog tasks. All of them touch `client/settings-screen.tsx`, so say which must run in sequence. For each task give:
- a title, as an outcome the user sees;
- its scope;
- one to three acceptance criteria, each with how it is proven;
- a rough size.

Also give a **traceability table**: one row per item, mapping it to the task and the AC that carries it. At acceptance, the original reviewers and the Captain will check against this table.

## Hand back

Write `design-director.md` in this folder with these sections:
1. Verdict.
2. Ruling table.
3. Layout options for item 1, with pictures.
4. Proposed tasks.
5. Traceability table.
6. Items for the Captain.

## Limits

- Read-only on code and git.
- Never read or print a secret value.
- Do not run `op` or `security`.
- Do not touch `~/.paseo` or the live plugin.
- Close your browser session and tear down your daemon when you are done.
