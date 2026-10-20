---
id:
title: An agent's timeline shows each variable it started without
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1
journey-story: notice-missing-variable
journey-required-tasks: '["project-env-notice-missing-variable"]'
journey-mapping-complete: true
gates:
    version: 1
    records:
        - id: gate:project-env-notice-missing-variable:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-notice-missing-variable-backlog-1
              briefing:
                id: briefing:project-env-notice-missing-variable:backlog:attempt-1:revision-1
                digest: sha256:d10200920463a8f1d2ab5a24fbfc9bd205274498f7b8ab1d665960667213a1bb
                room-ref: ./project-env-notice-missing-variable/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-notice-missing-variable:backlog:1
                briefing: briefing:project-env-notice-missing-variable:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-20T14:17:08.80465Z"
                decision: approve
                reason: 'Captain 2026-10-20: 「准。」 — accepts this release r1 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-20T14:19:51Z
---

ADR 0002 rules that an unresolved variable is shown on the agent's timeline. Today the failure goes only to the daemon log, and the plugin registers no timeline renderer.

## Scope

In: appending a line to a new agent's timeline for its blanked variables, and a client renderer for it. Ideation first spikes whether a plugin can append from `agent.session_open` before the agent is saved, with the fallback of appending after the hook returns (journey `notice-missing-variable/q6`); one line per opening or per variable, and behaviour on history-only opens, are open for ideation (q3, q7). Non-goals: resumed agents (r2). Depends on: project-env-new-agent-env, project-env-plain-failure-reason. Stop condition: the acceptance criteria below pass on Kent's daemon.

## Acceptance criteria

**AC-1**: A new agent that started with a blanked variable shows a timeline line naming each such variable and its cause class, with no value and no raw tool output.
Verified by: Kent seeing the line on his own daemon for an agent with a wrong field reference.

**AC-2**: Adding the line never stops the agent from starting.
Verified by: a unit test where the append fails.

## FO alignment

Surfaces: ui
Visible change: A new agent's timeline shows a line naming each variable it started without and why.
Direction alignment with the Captain: not needed — the outcome follows rulings already recorded (docs/adr/0001, docs/adr/0002, and the Captain's 2026-10-20 rulings in the journey map); release r1 was marked changed by signal 2 (the Captain narrowed r1 on 2026-10-20: 「可以改成兩段，不用第一時間給隊友，要先我用到覺得可以」, 「就五個，剩下做 r1.5」). kc-journey-map review-release ran on r1 at 60799d9; after the rulings, a fresh audit, the map split and an interrogation of the changed stories, this task split was re-derived from the map at 760bfaa (branch docs/project-env-r1-split, PR #6).
Release review: paseo-project-env/r1 at 760bfaa
