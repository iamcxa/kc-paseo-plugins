---
id:
title: A reference outside the repository's chosen vault is never read
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1
journey-story: pick-vault
journey-required-tasks: '["project-env-vault-boundary"]'
journey-mapping-complete: true
gates:
    version: 1
    records:
        - id: gate:project-env-vault-boundary:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-vault-boundary-backlog-1
              briefing:
                id: briefing:project-env-vault-boundary:backlog:attempt-1:revision-1
                digest: sha256:c8c7d3f7c4976bc56e5b36d0760d8f69994825ac094cbe4971b11901b351294a
                room-ref: ./project-env-vault-boundary/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-vault-boundary:backlog:1
                briefing: briefing:project-env-vault-boundary:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-20T14:17:31.403685Z"
                decision: approve
                reason: 'Captain 2026-10-20: 「准。」 — accepts this release r1 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
---

ADR 0001 rules that the plugin refuses a reference outside the chosen vault. Today any `op://` reference is read, including one typed by hand or imported.

## Scope

In: refusing, at agent start, a reference whose vault is not the repository's chosen vault; the variable is blanked with the outside-the-vault cause class. Non-goals: refusing it on save in the settings screen (r1.5). Residual: an existing configuration with such references, possibly Kent's own, will have those variables blanked. Depends on: project-env-new-agent-env, project-env-plain-failure-reason. Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: At agent start, a reference to a vault other than the chosen one is not read and its variable is blanked with the outside-the-vault cause.
Verified by: a fake-op unit test asserting `op` is not called for that reference.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: not needed — the outcome follows rulings already recorded (docs/adr/0001, docs/adr/0002, and the Captain's 2026-10-20 rulings in the journey map); release r1 was marked changed by signal 2 (the Captain narrowed r1 on 2026-10-20: 「可以改成兩段，不用第一時間給隊友，要先我用到覺得可以」, 「就五個，剩下做 r1.5」). kc-journey-map review-release ran on r1 at 60799d9; after the rulings, a fresh audit, the map split and an interrogation of the changed stories, this task split was re-derived from the map at 760bfaa (branch docs/project-env-r1-split, PR #6).
Release review: paseo-project-env/r1 at 760bfaa
