---
id:
title: A slow vault list says it is slow, not that the connection is broken
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Batch: r1b-polish-1, approved by the Captain on 2026-11-05 (「開這批」) with four members: project-env-picker-slow-hint, project-env-rate-limit-cause, project-env-started-row-visible, project-env-journey-map-r1b-catch-up. On 2026-10-27 the vault-list task saw the field picker on main give up at 30 s on a 100-item vault with a working connection and show "Plugin RPC timed out" under the hint built in `settings-screen.tsx` ("Close this list, fix the 1Password connection on this page, then open it again."), which sends a person to fix a connection that is fine (archived project-env-vault-list-loads-faster, "Findings from the runs"). Reads are now four at a time, so the limit moved out but did not go away.

## Scope

In: when the field picker's list fails because the call timed out, the picker says the vault took too long to list and what to try, instead of asking the person to fix the connection; other failures keep today's words.
Non-goals: making the list faster; raising any timeout; the Test path; caching.
Budget: one ideation, implementation and validation round; a second validation cycle returns to the Captain.
Stop condition: the acceptance criterion passes and the Captain's UAT is recorded.

## Acceptance criteria

**AC-1**: When the vault list call times out, the picker shows a sentence that says the list took too long and names a next step, and does not tell the person to fix the 1Password connection; a connection failure still shows today's hint.
Verified by: an isolated Paseo with a fake `op` slow enough to hit the timeout, pictures at 1280 and 400 px of both cases, and a unit test that fails when the timeout branch is removed.

## FO alignment

Surfaces: ui
Visible change: A field picker that times out says the vault took too long to list instead of blaming the connection.
Direction alignment with the Captain: done — he answered 「開這批」 on 2026-11-05 to FO's proposed batch naming this task.
Result: the batch question and this Scope.
Release review: paseo-project-env/r1b at 637d05404ccafa198d9f283e1d7d2183c8304dea — signal 1: admitted into r1b under story pick-field ("release 1b bounds the browse and reports a slow or limited vault"); review-release runs at the batch's first implementation dispatch.
Map footprints: not needed: no map answer is recorded by this task.
