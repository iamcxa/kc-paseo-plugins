# Release review: paseo-project-env/r1b

Reviewed 2026-10-28, signal 4, before `project-env-docs-site` is first dispatched. Map and code read at origin/main bed5a66.

## Conclusion

The docs-site task can go ahead, but it does not finish r1b. It writes the words for 8 of the 11 open stories and carries only one of them (`install-one-command`). Three stories need screen-code tasks that do not exist yet, and `agent-lays-out-vault` has no owner. The map also holds stale entries.

The one decision for the Captain first: does `agent-lays-out-vault` leave r1b? Without it a teammate still connects by the manual steps the pages teach, so the removal test says it can wait.

Not done: the interrogation step; no record exists for r1b. It is owed before the task split is final. This file is not the checked record format.

## Map edit (proposed, not written)

1. Add story `read-the-docs` under `get-plugin`, `release: r1b`, `status: gap`: "Read what the plugin does, how to set it up and what a blank variable means, on a public page". Source: the Captain's 「plugin 介紹，文件說明」, 2026-10-27, in the task file. The Introduction, Reference and Changelog pages belong to no story today.
2. `agent-lays-out-vault`: remove `release: r1b`; it stays on the map.
3. Replace r1b's `slice_because`. It says Kent's setup already covers each story and the 1Password stories carry no plugin code; that is false for `pick-repository`, `pick-field`, `setup-guide` and `find-settings`.
4. `paste-token`, `token-works`, `add-remove-variable`, `test-each-variable` (r1.5): `gap` to `exists`. Their evidence symbols grep in `project-env/`; their tasks merged (#21, #15, #17, #20); `journey-progress.mjs` reads each as 1 of 1 done. r1 was marked built the same way (#13). Their "Gap:" answers come from the fold tool, not by hand. Lint not run on this edit.
5. Status card: "r1.5 and r1b are not built" becomes "r1.5 is merged; r1b is not built"; update `as_of`.
6. The Captain's words, his call: r1b's goal says "by following the in-app steps", but a teammate cannot see an in-app step before installing.

## Walk

| Step | Actor | Identity | Context | Shown | Story | Task | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Find the docs | Teammate | public reader | none | Home, Introduction | none | docs-site | hole |
| Prerequisites, install command | Teammate | Mac user | own Mac running Paseo | Install page | install-one-command | docs-site | planned |
| Turn plugins on | Teammate | Mac user | same Paseo | Install step 2 | enable-plugins | none tagged | planned |
| Install `op`, sign in | Teammate | own 1Password account | which account, if several: unknown | Install 3a-3c | install-one-command | docs-site | needs real account |
| Open settings | Teammate | Mac user | same Paseo | Install step 4; screen hint names "this Mac" | find-settings | none tagged | words planned, hint open |
| Create vault, add items | Teammate | 1Password member | who may create vaults: unknown | Prepare 1-2 | create-vault, add-secrets | none tagged | planned |
| Create read-only account | Teammate or admin | whether teammate may: unknown | team account | Prepare 3 | create-service-account | none tagged | open q2 |
| Pick repository | Teammate | Mac user | Paseo project list | nothing when list empty or failed | pick-repository | none | gap |
| Paste token, choose vault | Teammate | service account | that vault | token row names failures | paste-token, pick-vault | done | built |
| Pick fields | Teammate | service account | chosen vault | grouped picker; references still use titles | pick-field | none | gap |
| Test, Save | Teammate | service account | chosen vault | set or failed per variable | test-each-variable | done | built |
| Agent starts | Agent | Paseo agent | main checkout or worktree | notice, "Started without N" line | new-agent-env | done | built |
| Blank variable | Teammate | Mac user | same | settings reasons; Reference page | plain-failure-reason | done | built |
| Token expires | Teammate | Mac user | same | Reference "rejected" cause | rotate-token | none tagged | words unclaimed |

## Holes

- Step with no story: "Find the docs" (map edit 1).
- Story with no task: `pick-repository`, `pick-field`, the screen halves of `find-settings` and `setup-guide`, `agent-lays-out-vault`. `rotate-token` can be answered by the pages, but the task's story table omits it.
- Task with no story: the docs-site pages Introduction, Reference, Changelog (fixed by edit 1). Several merged picker and row tasks carry no journey fields, so `pick-field` shows 0 tasks.
- Actor without identity or context: the 1Password administrator, if the teammate cannot create a service account, is in no story and no step. `pick-repository` shows nothing at all when the list is empty or fails to load. 1Password account choice and vault-creation rights are `unknown`.

## Slice

11 stories are not `exists`; the limit is 5. `lint` calls this accepted only because of the stale `slice_because`. After edits 1 and 2 the count stays 11. I recommend one release, not sub-slices: 8 stories are words on one page set, and one teammate-Mac run accepts them together.

Limit: the progress tool joins one task to one story. Docs-site counts only for `install-one-command`; the other docs stories read 0 tasks. Either add thin per-story tasks, or accept that the tool under-reports them and rely on the release walk.

## Tasks

| Task | journey-story | Required tasks | Carries |
| --- | --- | --- | --- |
| project-env-docs-site (exists; add `rotate-token` to its story table) | install-one-command | docs-site | - |
| new: pages' words for the other docs stories | enable-plugins, create-vault, add-secrets, create-service-account, rotate-token, read-the-docs | decision needed | - |
| new: show a load error and how to add a project | pick-repository | itself | - |
| new: references from item and field IDs, text fields only, slow-vault notice | pick-field | itself | - |
| new: screen says "the Mac running Paseo" | find-settings | itself | - |
| new: in-app setup steps, Keychain weakness on screen | setup-guide | itself | - |

Stay open: `agent-lays-out-vault` (no skill; ADR 0005); `create-service-account` q2 (needs a real team account); the sign-in steps (Captain's real-account run); r1b acceptance by one teammate-Mac run, which docs-site's fake-`op` run does not replace.
