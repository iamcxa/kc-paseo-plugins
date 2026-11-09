---
id:
title: The plugin always signs in to 1Password with its own service account and never serves a value read before a token change
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Batch: public-release-prep, approved by the Captain on 2026-11-09 (「開，幫我合併 78」, answering FO's 「…開一批「送審前修正」3 個任務…回「開」就開這批 3 個任務」) with three members: project-env-service-account-trim, project-env-op-auth-and-cache, project-env-registry-listing. Source: the Codex and Gemini release reviews of origin/main 2026-11-09 saved in research/2026-11-09-public-release-review/ (codex.md, gemini.md), each claim below re-read by FO in the code on main e4acaec. `opEnv` in `project-env/server/secrets.ts` passes the whole daemon environment to `op` plus `OP_SERVICE_ACCOUNT_TOKEN`; the reviewer cites 1Password's service-account page saying Connect credentials (`OP_CONNECT_HOST`, `OP_CONNECT_TOKEN`) take precedence, so a Mac with those set would read through Connect instead (codex.md P1 "Wrong authentication identity"; FO has not re-read the 1Password page). `readVariable` stores a value with `cache.set` after its `op` call returns, so a read in flight when `clearCache` runs (token change, settings change, Test) can put an old value back for up to 15 minutes (codex.md P1 "Cache invalidation races"; FO read the code, not reproduced).

## Scope

In: `op` always uses the configured service account whatever other 1Password credentials the daemon environment carries; a value whose read started before the cache was cleared is never cached; verify the 1Password precedence claim from its own docs.
Non-goals: changing the cache lifetime; the field reference format; the other review findings.
Budget: one ideation, implementation and validation round.
Stop condition: the acceptance criterion passes.

## Acceptance criteria

**AC-1**: With Connect variables set in the daemon environment, every `op` call the plugin makes runs without them and with the configured token; a read that finishes after the cache was cleared is returned but not cached.
Verified by: unit tests that fail on main for each half, and `npm test` passing.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: done — he answered 「開，幫我合併 78」 on 2026-11-09 to FO's proposed batch naming this fix.
Result: the batch question and this Scope.
Release review: not needed: hardening with no journey release goal change.
Map footprints: not needed: no map answer is recorded by this task.
