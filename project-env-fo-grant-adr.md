---
id:
title: ADR 0007 records which project-env decisions the FO makes by record
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-fo-grant-adr:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-fo-grant-adr-backlog-1
              briefing:
                id: briefing:project-env-fo-grant-adr:backlog:attempt-1:revision-1
                digest: sha256:75f044144d1d94ede58ef3b522b6ab9b41060e979e6e0dd94cfdb88569d7cdef
                room-ref: ./project-env-fo-grant-adr/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-fo-grant-adr:backlog:1
                briefing: briefing:project-env-fo-grant-adr:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T12:25:13.794808Z"
                decision: approve
                reason: 'Captain 2026-10-23: 「准」 — answers the FO''s question in chat; approves drafting ADR 0007 for review at the ideation gate. He added: 「注意這一份 ADR 可能要在 dev2 更新流程後被更新或替換」.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-23T12:25:39Z
---

A grant record for project-env, in the form the Bridge FO used for spacedock-bridge (ADR 0006, merged in PR #36) under kc-dev-flow-2 ADR 0011's L3 rule. The Captain approved drafting it on 2026-10-23 with 「准」, answering 「要不要我照這個格式，幫 project-env 起草一份授權 ADR（會是 ADR 0007）交給你審？」. His earlier split for this project, from the same day: 「這個專案我想給你更大的彈性，我想只抓backlog，設計預覽與uat，其他都授權你做。列一下哪些是我預授權的範圍」.

## Scope

In: a new ADR (number reserved under this README's number guards) granting the project-env FO the classes the Captain did not keep for himself, as an explicit, Captain-authorized exception to the one README sentence that says authority, a gate approval and a merge are always asked. Proposed classes: the validation gate when it has no Material or Needs decision finding; merge and plugin reload after an approved validation; dispositions of review findings (fix, defer with trigger, decline) within approved scope. Kept with the Captain: the backlog gate, the ideation (design preview) gate, UAT, any change to how a secret is read, stored, injected or logged, any edit to his live settings file, releases, anything outward, data deletion, leaving the pilot profile. Recording, expiry, demotion and revocation follow ADR 0006's shape. The record is provisional: the Captain said on 2026-10-23 「注意這一份 ADR 可能要在 dev2 更新流程後被更新或替換」, so it states that when a kc-dev-flow-2 release ships an authorization framework covering this repository, the record is reviewed and then amended to point at that framework or superseded by it. Out: the grant takes effect only when its PR merges; this task's own gates stay with the Captain. Stop condition: the acceptance criterion passes.

## Acceptance criteria

**AC-1**: The new ADR names the granted classes, the classes kept with the Captain, the exact README sentence it excepts, the recording command, expiry, demotion and revocation, and quotes the Captain's words verbatim; adr_lint passes.
Verified by: `python3 <package>/scripts/adr_lint.py docs/adr --since 60799d9 --require 7` exits 0; `number_guards.py check` passes with this task's `ADR:` line; a reviewer ticks each named element against the record.

## Number guards

ADR: 0007

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: done — the Captain approved drafting on 2026-10-23 (「准」); he reviews the draft at the ideation gate.
Release review: not needed: a process record with no journey story or product behaviour change.
Map footprints: not needed: no journey story or open map question is attached to this docs task.
