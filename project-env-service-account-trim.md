---
id:
title: A service account name with surrounding spaces still gets its variables
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-service-account-trim:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-service-account-trim-backlog-1
              briefing:
                id: briefing:project-env-service-account-trim:backlog:attempt-1:revision-1
                digest: sha256:e7a584f3f70476bce36eb6555ac933ea916b2d2d792477ddeae1bb508a4a6427
                room-ref: ./project-env-service-account-trim/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-service-account-trim:backlog:1
                briefing: briefing:project-env-service-account-trim:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-09T07:40:03.140078Z"
                decision: approve
                reason: '「開，幫我合併 78」 — Captain in FO chat, 2026-11-09, answering 「我建議：開一批「送審前修正」3 個任務，修上面第 1 到第 3 項，並補齊第 4 項的資料；做完再跑送審合規檢查。這一版會變成 v0.3.2。真正送出 Paseo 的申請之前，我還會再問你一次，因為那是對外的動作。」 (items 1-3: service account name spaces, op Connect credentials and cache race, item 4: registry listing data). Recommendation: followed.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-11-09T07:41:12Z
---

Batch: public-release-prep, approved by the Captain on 2026-11-09 (「開，幫我合併 78」, answering FO's 「…開一批「送審前修正」3 個任務…回「開」就開這批 3 個任務」) with three members: project-env-service-account-trim, project-env-op-auth-and-cache, project-env-registry-listing. Source: the Codex and Gemini release reviews of origin/main 2026-11-09 saved in research/2026-11-09-public-release-review/ (codex.md, gemini.md), each claim below re-read by FO in the code on main e4acaec. In `ProjectEditor` (`project-env/client/settings-screen.tsx`) the token is checked and stored under `draft.serviceAccount.trim()`, while the project is saved with the untrimmed `draft.serviceAccount`, which `resolveProject` in `project-env/server/secrets.ts` later uses for the Keychain lookup. Both reviewers report that a name typed with a trailing space passes the check and then gives every agent blank variables (codex.md P2 "Whitespace creates a false working connection", gemini.md P2 "Whitespace trimming inconsistency"); FO has read the code paths, not reproduced it.

## Scope

In: one service account name is used everywhere: what is saved, looked up in the Keychain, checked and compared for unsaved changes; reproduce the failure on main first.
Non-goals: renaming or migrating existing saved names; other settings fields.
Budget: one ideation, implementation and validation round.
Stop condition: the acceptance criterion passes and the Captain's UAT is recorded.

## Acceptance criteria

**AC-1**: A project whose service account name was typed with leading or trailing spaces passes the connection check and gives a new agent its mapped variables; an unchanged name with no spaces behaves as today.
Verified by: a reproduction on main and on the candidate on an isolated Paseo at the newest release with fake `op` and `security`, a unit test that fails on main, and `npm test` passing.

## FO alignment

Surfaces: ui
Visible change: A service account name typed with spaces no longer leaves agents with blank variables after the check says it works.
Direction alignment with the Captain: done — he answered 「開，幫我合併 78」 on 2026-11-09 to FO's proposed batch naming this fix.
Result: the batch question and this Scope.
Release review: not needed: a defect fix with no journey release goal change.
Map footprints: not needed: no map answer is recorded by this task.
