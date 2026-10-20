---
id:
title: New agents start with each resolved variable, and a failed or empty one arrives empty
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1
journey-story: new-agent-env
journey-required-tasks: '["project-env-new-agent-env"]'
journey-mapping-complete: true
---

Release r1 of the paseo-project-env journey: Kent, on his own Mac, connects one repository to 1Password, and new agents there start with its secrets safely. ADR 0002 rules that a variable that cannot be resolved is blanked; the Captain ruled on 2026-10-20 that an empty value is a failed variable (「算失敗」). Today a failed variable is left out of the merge, so a value the daemon inherited under that name survives, and an empty value passes as set.

## Scope

In: the `agent.session_open` merge, the value cache, the hook's time budget, and test fakes for `op`, the macOS `security` tool and `git` that later r1 tasks reuse. Open for ideation, not decided here: which variable names are refused (journey `new-agent-env/q6`). Non-goals: the timeline line (project-env-notice-missing-variable), cause text (project-env-plain-failure-reason), settings-screen changes (r1.5). Stop condition: the acceptance criteria below pass on Kent's daemon.

## Acceptance criteria

**AC-1**: A new agent in the connected repository starts with each configured variable that resolves.
Verified by: an agent on Kent's daemon reporting set or missing per variable without printing values.

**AC-2**: A variable that fails, or resolves to an empty value, reaches the agent as empty, even when the daemon's own environment holds that name.
Verified by: a unit test with the fakes, the daemon environment carrying the name.

**AC-3**: A value fetched with one service account's token is never returned for a lookup made with another account's token.
Verified by: a fake-op unit test with two tokens and one reference.

**AC-4**: A slow 1Password does not stop the agent from starting; variables not resolved within Paseo's 30-second hook limit are blanked.
Verified by: a fake-op unit test with a delayed response.

**AC-5**: The test suite runs without the real `op`, Keychain or `git`.
Verified by: `npm test` with those tools off `PATH`.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: not needed — the outcome follows rulings already recorded (docs/adr/0001, docs/adr/0002, and the Captain's 2026-10-20 rulings in the journey map); release r1 was marked changed by signal 2 (the Captain narrowed r1 on 2026-10-20: 「可以改成兩段，不用第一時間給隊友，要先我用到覺得可以」, 「就五個，剩下做 r1.5」). kc-journey-map review-release ran on r1 at 60799d9; after the rulings, a fresh audit, the map split and an interrogation of the changed stories, this task split was re-derived from the map at 760bfaa (branch docs/project-env-r1-split, PR #6).
Release review: paseo-project-env/r1 at 760bfaa
