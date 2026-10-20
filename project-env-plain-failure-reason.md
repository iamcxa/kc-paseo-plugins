---
id:
title: A failed variable names its cause class, never raw tool output
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1
journey-story: plain-failure-reason
journey-required-tasks: '["project-env-plain-failure-reason"]'
journey-mapping-complete: true
---

ADR 0002 rules that an unresolved variable is shown with the reason it failed. Today the first line of raw `op` stderr reaches the daemon log and the settings Test row.

## Scope

In: one list of failure cause classes covering ADR 0002's causes, an empty value (Captain, 2026-10-20) and a reference outside the chosen vault (ADR 0001); the daemon log line and the settings Test row use it. The exact class names are settled in ideation. Non-goals: the timeline line, settings-screen layout. Depends on: project-env-new-agent-env (fakes). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: Each failure is reported as the variable name plus exactly one cause class.
Verified by: a unit test feeding each fake failure.

**AC-2**: No raw `op` or `security` output and no value appears in the daemon log or the settings Test row.
Verified by: a test with a fixed stderr string and a fixed fake value, searching both outputs for them.

## FO alignment

Surfaces: ui
Visible change: The settings Test row shows a cause class such as a rejected token instead of raw op output.
Direction alignment with the Captain: not needed — the outcome follows rulings already recorded (docs/adr/0001, docs/adr/0002, and the Captain's 2026-10-20 rulings in the journey map); release r1 was marked changed by signal 2 (the Captain narrowed r1 on 2026-10-20: 「可以改成兩段，不用第一時間給隊友，要先我用到覺得可以」, 「就五個，剩下做 r1.5」). kc-journey-map review-release ran on r1 at 60799d9; after the rulings, a fresh audit, the map split and an interrogation of the changed stories, this task split was re-derived from the map at 760bfaa (branch docs/project-env-r1-split, PR #6).
Release review: paseo-project-env/r1 at 760bfaa
