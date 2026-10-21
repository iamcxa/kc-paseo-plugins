---
id:
title: A project registered at a worktree path gives its agents their variables
status: implementation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree: .worktrees/spacedock-ensign-project-env-worktree-project-root
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-worktree-project-root:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-worktree-project-root-backlog-1
              briefing:
                id: briefing:project-env-worktree-project-root:backlog:attempt-1:revision-1
                digest: sha256:a8511e0a77264672d5ec078e18c0b2ad322e13b5de9906d81266a0ce1ce9e9a7
                room-ref: ./project-env-worktree-project-root/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-worktree-project-root:backlog:1
                briefing: briefing:project-env-worktree-project-root:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-21T09:42:21.906728Z"
                decision: approve
                reason: 'Captain 2026-10-21: 「准」 — accepts this bug-fix task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
        - id: gate:project-env-worktree-project-root:ideation
          stage: ideation
          attempts:
            - id: gate-attempt:project-env-worktree-project-root-ideation-1
              briefing:
                id: briefing:project-env-worktree-project-root:ideation:attempt-1:revision-1
                digest: sha256:4741d4fd480ba368e9712db705b0da678999993297e9190aa283f1e36df788e0
                room-ref: ./project-env-worktree-project-root/review/ideation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-worktree-project-root:ideation:1
                briefing: briefing:project-env-worktree-project-root:ideation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-21T11:22:05.825515Z"
                decision: approve
                reason: 'Captain 2026-10-21: 「可以，同意你的計畫」 — accepts this ideation design and its acceptance criteria into implementation.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-21T09:42:39Z
---

Kent found on 2026-10-21 that agents in /Users/kent/conductor/repos/qnow-adopt-dev2 start with none of the project's variables (reported missing, not empty, and no timeline line), while Test reads them. That directory is a linked worktree of /Users/kent/conductor/repos/qnow and is itself the project's saved root. `projectForCwd` in project-env/server/secrets.ts maps every working directory to its main checkout (`mainCheckout`) and compares only that with the saved roots, so a project saved at a worktree path never matches. Captain, 2026-10-21: 「也准加入」 — added to the release r1.5 batch.

## Scope

In: a working directory matches a saved project when its own worktree root is that project's root, and otherwise when its main checkout is; registered-worktree trust stays. Non-goals: resumed agents (r2). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: An agent started in a linked worktree that is itself a saved project's root receives that project's variables.
Verified by: (a) a fake-git test in `project-env/test/project-for-cwd.test.ts`: main checkout `repo` with registered linked worktrees `wt` and `wt2`, the project saved at `wt`, `projectForCwd` called with cwd `wt` returns that project; the same test fails on main 487b9b0 (returns null) and passes after the fix; (b) after the fix merges and Kent reloads `paseo-project-env`, a new agent in /Users/kent/conductor/repos/qnow-adopt-dev2 on Kent's daemon runs, for each variable name in the project, `[ -n "${NAME}" ] && echo set || echo missing` and every name reads `set` (shape only, no value printed), with no missing-variables timeline row.

**AC-2**: A project saved at a main checkout still serves agents in its registered worktrees, and an unconnected repository still matches nothing.
Verified by: the seven existing cases in `project-env/test/project-for-cwd.test.ts` staying green, plus two added cases: a project saved at `repo` still returns for cwd `wt`; a project saved at `wt` returns null for cwd `other` (an unconnected repository).

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: not needed — a defect fix the Captain approved on 2026-10-21 (「也准加入」).
Release review: not needed: a bug fix carrying no journey story; the Captain placed it in the r1.5 batch.

## Design

**Press release.** An agent started in a directory that is itself a saved project's root gets that project's variables, even when the directory is a linked git worktree. Kent saved `/Users/kent/conductor/repos/qnow-adopt-dev2` as a project; agents there now start with their variables instead of none.

**FAQ.**
- *What matches?* The agent's working directory is first resolved to its own worktree root (`git rev-parse --show-toplevel`, realpath). If a saved project's root (realpath) equals it, that project serves the agent. Otherwise the main checkout (`dirname` of `--git-common-dir`, realpath) is compared with the saved roots, as today.
- *Which wins when both a worktree and its main checkout are saved?* The worktree's own project, in that worktree only. It is the more specific entry and the one a person saved on purpose for that directory. The main checkout's project still serves the main checkout and every other registered worktree. Order in the saved list does not matter.
- *Does a project saved at one worktree serve its sibling worktrees?* No. Only a project saved at the main checkout reaches siblings, as today.
- *Is the registered-worktree trust check kept?* Yes, unchanged and applied before either comparison: the worktree root must appear in `git worktree list --porcelain` run from the main checkout. A stray `.git` file naming another repository still yields no match, and the new comparison uses the verified worktree root, so it adds no way to claim a root the directory does not have.
- *Do symlinks still work?* Yes. Both sides go through `realOrSelf`, as the existing cases require.

```mermaid
flowchart TD
  A[agent starts in cwd] --> B[git: worktree root and main checkout of cwd]
  B -->|git fails| N[no project, nothing applied]
  B --> C{worktree root registered by the main checkout?}
  C -->|no, stray .git file| N
  C -->|yes| D{a saved project root equals the worktree root?}
  D -->|yes| P1[that project serves the agent]
  D -->|no| E{a saved project root equals the main checkout?}
  E -->|yes| P2[that project serves the agent]
  E -->|no| N
```

**Existing-code check.** `projectForCwd` already resolves both the worktree root (`top`, used only for the trust check) and the main checkout (`root`) and discards `top`. The smallest change keeps both from the one function that already computes them and compares `top` before `root`. No new git call, no new export, no replacement mechanism. Proposed shape: `mainCheckout` body becomes a private `locate(cwd)` returning `{ top, root }` or null; `mainCheckout` stays exported with unchanged behaviour (`locate(cwd)?.root ?? null`); `projectForCwd` does `roots.indexOf(place.top)` first, then `roots.indexOf(place.root)`. About ten changed lines in `server/secrets.ts`; no other file.

**Observation that shows the change is needed.** On main 487b9b0, with real git and no secrets involved (read-only, 2026-10-21): for cwd `/Users/kent/conductor/repos/qnow-adopt-dev2` (registered linked worktree of `/Users/kent/conductor/repos/qnow`), `mainCheckout` returns `/Users/kent/conductor/repos/qnow`; `projectForCwd` with a project saved at the worktree path returns null at the root and at a subdirectory. A prototype of the shape above, run on a scratch copy (not the repository), returns the project at both, null for the sibling worktree `.worktrees/r1-walk`, and still returns a project saved at `qnow` for the worktree.

Scratch cases run on main and on the prototype (6 new cases, fake git plus one real-git case, run with the 7 existing cases):
- main 487b9b0: the 7 existing pass; of the new cases, fail: project saved at `wt` serves cwd `wt`; both saved, `wt` wins in `wt`; real linked worktree matches. Pass: saved at `repo` serves `wt`; saved at `wt` does not serve `other`; saved at `wt` does not serve sibling `wt2`.
- prototype: all 13 pass.

## Interface conflict check

Checked 2026-10-21 against the three branches off main (`git diff main` on `project-env/server/secrets.ts`, committed plus working tree):
- project-env-variable-row-edit: does not touch `server/secrets.ts` (changes `client/settings-screen.tsx`, `shared/config.ts`). No conflict.
- project-env-token-works-cause: edits `secrets.ts` imports, `opEnv`, `tokenStatus` and `readToken` area, and the final `return { mainCheckout, projectForCwd, tokenStatus, checkToken, ... }` line. It does not touch `mainCheckout` or `projectForCwd` bodies. Conflict risk: the return line, which this design leaves alone (`mainCheckout` stays exported), and a one-line gap between `projectForCwd` and its `readToken` hunk. Expect a clean textual merge; whichever task lands second rebases.
- project-env-browse-vault-survives: edits the `node:path` import line and the `listRefs` region from about line 153 on, plus `contribute.ts`, `config.ts`, `cause.ts`, `test/world.ts`, `test/fakes/op.mjs`. No overlap with lines 72-96. This design adds no import and does not touch `test/world.ts` or `test/fakes/`, which both siblings change. No conflict.
- Test file: only `test/project-for-cwd.test.ts` gains cases; neither sibling edits it.

No interface (exported signature, shared type, setting shape) changes, so no sibling must wait.

## Unresolved decisions for the Captain

None. Past rulings checked: ADRs 0001-0005 name no rule for matching a working directory to a project root, and `git -C docs/dev2/.spacedock-state grep -n 'Override:'` finds only prose in sibling tasks, none on this area.

Known limits (not decisions): the qnow-adopt-dev2 agent check in AC-1(b) cannot run before merge, because Kent's live plugin runs from the main checkout; it is owed after merge and reload, by shape only. The AC-1(b) shell check assumes the agent can run a shell. One pre-existing test, `session-open.test.ts` "blanks a variable 1Password does not answer in time and returns at the deadline", failed once on main 487b9b0 in `npm test` while other agents were running; not investigated, not related to this change.

## Stage Report: ideation

- DONE: Design the match: a working directory matches a saved project when its own worktree root (realpath) is that project's root, otherwise when its main checkout is; keep the registered-worktree trust check; say which wins if both a worktree root and its main checkout are saved as projects.
  See Design: worktree root compared first, then main checkout; trust check unchanged and applied first; when both are saved the worktree's own project wins in that worktree only. Mermaid matches the prose.
- DONE: Reproduce the defect on main with fake git (a project saved at a linked-worktree path, an agent in that worktree) and keep AC-1 and AC-2 with reproducible evidence clauses, including the owed qnow-adopt-dev2 agent check on Kent's daemon by shape.
  On main 487b9b0 three new scratch cases fail (fake-git AC-1, both-saved, real-git) and the 7 existing pass; real qnow-adopt-dev2 layout via read-only git returns null; a prototype passes all 13. AC-1 clauses (a) test and (b) post-merge shape check, AC-2 clause named; (b) is not yet verified, it needs merge and Kent's reload.
- DONE: Name the interface conflict, if any, with project-env-variable-row-edit, project-env-token-works-cause and project-env-browse-vault-survives (all in implementation off main), since this task touches project-env/server/secrets.ts.
  See Interface conflict check: no signature change; only a possible adjacent textual merge with token-works-cause around the exports line, none with the other two.
- DONE: AC-1 evidence (current)
  Defect reproduced on main (above); fix proven only on a scratch prototype, repository tests not yet written; live-daemon check not yet verified.
- DONE: AC-2 evidence (current)
  The 7 existing project-for-cwd cases and the two sibling-negative cases pass on the prototype; not yet run in the repository after the real change.
- DONE: design_surfaces check
  `python3 <package>/scripts/design_surfaces.py check <task>` printed "design surfaces presentable", exit 0 (Surfaces: none).

### Summary

Smallest fix is about ten lines in `server/secrets.ts`: keep the worktree root that the trust check already computes and compare it with saved roots before the main checkout. No decision needs the Captain. Scratch reproduction and prototype lived in /tmp/wtpr only; no repository file, branch or commit was made.

## Stage Report: implementation

- DONE: Implement the approved design in project-env/server/secrets.ts: match the agent's own worktree root against saved project roots first, then its main checkout; keep the registered-worktree trust check; a worktree's own project wins in that worktree only.
  Commit 09bc5c9 on spacedock-ensign/project-env-worktree-project-root (base 15b1e3f): private `locate(cwd)` returns `{top, root}` after the unchanged trust check; `mainCheckout` stays exported; `projectForCwd` indexes `top` before `root`. 2 files, +93/-6.
- DONE: Land the fake-git cases so AC-1's unit clause and AC-2 pass and the new cases fail on today's projectForCwd; record the qnow-adopt-dev2 agent check on Kent's daemon as owed.
  Seven cases added to `project-for-cwd.test.ts`. Falsifiable pair, failing on 15b1e3f before the fix (observed): "serves an agent in a linked worktree from a project saved at that worktree" (AC-1a; revert top-first match and it returns null) and "lets a worktree's own project win in that worktree only, whatever the list order" (own beats main in wt, main serves wt2, both list orders). AC-2 and trust (pass before and after, pin behaviour): project at `repo` serves `wt`; project at `wt` returns null for `other` and for sibling `wt2`; unregistered worktree with its project saved returns null. The seven existing cases stay green. Real-git scratch repo with two linked worktrees (removed afterwards): saved at wt serves wt, not wt2; saved at repo serves wt. AC-1(b) is OWED: needs merge and Kent's reload, then the shape-only `[ -n "${NAME}" ]` check for every variable in /Users/kent/conductor/repos/qnow-adopt-dev2; not run.
- DONE: Run `npm test`, `npm run typecheck`, the roborev gate and doc_impact.py, then open the Draft PR.
  `npm test` 127 pass 0 fail (an earlier run on unfixed code also failed the load-sensitive session-open deadline test, which passed on the full rerun); typecheck clean; roborev gate exit 0 `clean on 09bc5c984; evidence=roborev:976`; `doc_impact.py 15b1e3f HEAD`: "0 document(s) mention what changed", nothing to record; `comment_ratio.py`: code lines 86, comment lines 0, 0.0%, max 5% met; `design_surfaces.py check`: presentable. Draft PR: https://github.com/iamcxa/kc-paseo-plugins/pull/19 (pushed under the Captain's standing grant).

### Summary

Port of the approved ~10-line design, no deviations: worktree root compared first, main checkout second, trust check first. The worktree was at 487b9b0 and was fast-forwarded to origin/main 15b1e3f before work; no rebase needed. CHANGELOG.md is release-please generated and was not edited. No ADR added or changed; Number guards: not applicable (Surfaces: none, no migration). Limits: AC-1(b) owed after merge and reload; a `node_modules` symlink to the main checkout was used locally for test runs and removed before the gate, not committed.
