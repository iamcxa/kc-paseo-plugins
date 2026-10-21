---
id:
title: A project registered at a worktree path gives its agents their variables
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Kent found on 2026-10-21 that agents in /Users/kent/conductor/repos/qnow-adopt-dev2 start with none of the project's variables (reported missing, not empty, and no timeline line), while Test reads them. That directory is a linked worktree of /Users/kent/conductor/repos/qnow and is itself the project's saved root. `projectForCwd` in project-env/server/secrets.ts maps every working directory to its main checkout (`mainCheckout`) and compares only that with the saved roots, so a project saved at a worktree path never matches. Captain, 2026-10-21: 「也准加入」 — added to the release r1.5 batch.

## Scope

In: a working directory matches a saved project when its own worktree root is that project's root, and otherwise when its main checkout is; registered-worktree trust stays. Non-goals: resumed agents (r2). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: An agent started in a linked worktree that is itself a saved project's root receives that project's variables.
Verified by: a fake-git test with a project saved at a worktree path, failing on today's projectForCwd, and a new qnow-adopt-dev2 agent on Kent's daemon reporting each variable set or missing by shape.

**AC-2**: A project saved at a main checkout still serves agents in its registered worktrees, and an unconnected repository still matches nothing.
Verified by: the existing project-for-cwd cases staying green.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: not needed — a defect fix the Captain approved on 2026-10-21 (「也准加入」).
Release review: not needed: a bug fix carrying no journey story; the Captain placed it in the r1.5 batch.
