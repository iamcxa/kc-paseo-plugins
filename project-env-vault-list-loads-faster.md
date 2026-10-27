---
id:
title: The field picker's vault list loads faster
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

From the Captain's UAT of the vault re-point task on 2026-10-25: 「為何Loading the vault…要那麼久？」. FO's answer, read from code at main 7e038cd and rechecked at 0b55dfd on 2026-10-27: to build the field list, `listRefs` in `project-env/server/secrets.ts` runs `op item list` for the vault and then one `op item get` per item, one after another, so the wait grows with the number of items. The time per call has not been measured. On 2026-10-27 FO asked whether to open a task for it, recommending measuring first and then reading items concurrently; the Captain answered 「開」.

## Scope

In: measure where the "Loading the vault…" wait goes, then shorten it without changing which fields the picker lists or the reasons it shows for an unreadable item. Out: caching values, any change to how a token or value is read, stored or logged, and the Test path. Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: For the same vault, the field picker's list is ready sooner than on main 0b55dfd, and the list it shows (fields and skipped items with their reasons) is unchanged.
Verified by: a timing run on an isolated Paseo with a fake `op` whose per-call delay is fixed, for vaults of several sizes, before and after, plus a unit test comparing the listed references and skipped items; the measured times are recorded, not estimated.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: done — he approved opening the task on 2026-10-27 (「開」) after FO's recommendation to measure first.
Release review: not needed: the screen is unchanged and only the wait behind "Loading the vault…" shortens; a speed fix to the r1.5 field picker; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this task.
