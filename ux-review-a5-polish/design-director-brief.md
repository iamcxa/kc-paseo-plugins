# Brief: Design Director ruling on the picky-user reviews

You are the Design Director for the `project-env` Paseo plugin. Two picky users, each on a different model and with a different persona, have reviewed the settings screen as it is on main 40849b4. You did not build this screen and owe it no defence. Decide, for each thing they disliked:
- whether it should be solved;
- how;
- when.

## Read

- The two reviews, in this folder:
  - `astra-review.md`: an experienced user on gpt-6-astra, including its section "Rerun after the fixture fix".
  - `gemini-review.md`: a first-week newcomer on Gemini.
- Their screenshots in `astra-shots/` and `gemini-shots/`, and their briefs.
- One known artifact: Gemini's complaint 2, and Astra's first-pass complaint 2, both say "every field fails Test". That came from the test copy's fake vault, which had no values. Treat it as withdrawn unless Astra's rerun section says it still stands.
- What the Captain (Kent, the product owner and only user today) has already ruled:
  - The A5 direction, in `../ux-review-r1.5/index.html` and `direction-a5.html`.
  - Each archived task's `## Captain amendments`, `### FO declines` and gate reasons, under `../_archive/project-env-*.md`. In particular, he chose the hover bubble that may cover neighbouring rows (project-env-test-summary-failure-mark, amendment 1). He also chose that a variable's name is editable only while it is being added (project-env-add-variable-one-step).
- The product's decision records in `/Users/kent/Project/kc-paseo-plugins/docs/adr/` (0001 to 0005). The journey map is `/Users/kent/Project/kc-paseo-plugins/docs/journey/project-env/give-agents-their-project-setup.yaml`; note its releases r1b, r2 and r3.
- The code at `/Users/kent/Project/kc-paseo-plugins/project-env`, read-only, mainly `client/settings-screen.tsx`, `client/open-project.ts`, `shared/`.

## You may reproduce

A test Paseo runs this build with fake data at http://127.0.0.1:6920/settings/hosts/srv_dEMNhlVgGn4y/plugins/pe-astra/projects. Drive it with `agent-browser --session director`. The data is shared, so write nothing you do not undo. Do not stop it. Reproduce any complaint whose cause you are not sure of before you rule on it.

## Decide

Merge duplicate complaints across the two reviews. For each merged complaint, give:
- **Sources:** for example "Astra 1, Gemini 1".
- **Real?** One of: reproduced, read in code, or not reproduced. Give the evidence.
- **Verdict:** one of:
  - solve;
  - do not solve, with the reason;
  - Captain decision, when it contradicts a ruling of his or changes scope or an acceptance criterion.
- **How:** the direction in one or two sentences, and which part of the screen it touches (connection, variable rows, picker, header, save bar, Danger zone, project list, other).
- **When:** one of:
  - this polish round;
  - r1b (a teammate's first setup);
  - later, with the release;
  - never.

  Say why. A blocker that lets a person save a broken setup belongs in this round.

Where the two users disagree, say whose view you take and why. Do not count an item as consensus just because both models said it; judge each item on its merits.

## Then propose this round's work

Turn the items marked "this polish round" into at most three backlog tasks. Nearly all of them touch `client/settings-screen.tsx`; last round, running seven tasks in parallel on that one file cost five extra merge-and-revalidate cycles. So group by area, and say which tasks must run one after another. For each task give:
- a title, as an outcome the user sees;
- its scope;
- one to three acceptance criteria, each with how it is proven;
- a rough size.

## Hand back

Write `/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/ux-review-a5-polish/design-director.md`:
1. A one-paragraph verdict.
2. The ruling table.
3. The proposed tasks.
4. Items for the Captain, if any.
5. What this picky-user pass caught that the earlier per-task reviews and validations missed, and what it cost you nothing to ignore. This is input for making the method a standard dev2 step.

## Limits

- Read-only on code and git.
- Never read or print a secret value.
- Do not run `op` or `security`.
- Do not touch `~/.paseo` or the live plugin.
- Close your browser session when done.
