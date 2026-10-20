---
id:
title: Agents in a worktree or symlinked checkout get the repository's variables
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1
journey-story: worktree-env
journey-required-tasks: '["project-env-worktree-real-paths"]'
journey-mapping-complete: true
---

Kent uses worktrees daily. Worktree membership already resolves real paths, but the stored repository root is compared with git's common-dir parent as written, so a symlinked path fails to match.

## Scope

In: resolving both the stored root and git's common-dir parent to real paths before comparing. Non-goals: resumed agents (r2). Depends on: project-env-new-agent-env (fakes). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: An agent started in a registered worktree, or through a symlinked path, of the connected repository starts with its variables.
Verified by: a fake-git test with a symlinked root, and one worktree agent on Kent's daemon reporting set or missing per variable without printing values.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: not needed — the outcome follows rulings already recorded (docs/adr/0001, docs/adr/0002, and the Captain's 2026-10-20 rulings in the journey map); release r1 was marked changed by signal 2 (the Captain narrowed r1 on 2026-10-20: 「可以改成兩段，不用第一時間給隊友，要先我用到覺得可以」, 「就五個，剩下做 r1.5」). kc-journey-map review-release ran on r1 at 60799d9; after the rulings, a fresh audit, the map split and an interrogation of the changed stories, this task split was re-derived from the map at 760bfaa (branch docs/project-env-r1-split, PR #6).
Release review: paseo-project-env/r1 at 760bfaa
