---
id: project-env-release-1
title: A recce teammate connects one repository to 1Password
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: docs/journey/project-env/give-agents-their-project-setup.yaml
journey-release: r1
---

Kent wants the recce team using the project-env Paseo plugin soon (2026-10-20,
「我短期要的是讓 recce team 也可用」). The proof of concept works for Kent but its
settings screen is not intuitive (「我覺得UI不夠直覺」).

## Scope

Release r1 of the journey above, as accepted by Kent on 2026-10-20 (「可以」): a
recce teammate installs the plugin from GitHub, follows in-app steps to prepare
1Password, connects one repository, picks a vault field per variable, tests, and
new agents in that repository, worktrees included, start with the variables.
Non-goals: standing instructions, Conductor import, rotation and sharing (r2, r3).

## Acceptance criteria

**AC-1**: A teammate on another Mac installs the plugin with one command and reaches a working connection by following only the in-app steps.
Verified by: a recorded install and setup run on a machine other than Kent's daemon host.

**AC-2**: A new agent in the connected repository, and one in a registered worktree of it, starts with each configured variable.
Verified by: an agent reporting set or missing per variable without printing values.

**AC-3**: A variable that cannot be resolved shows a plain reason in the settings screen, and no secret value appears in the app, a log or a chat.
Verified by: a test with a wrong field reference and a revoked token, and a search of plugin logs for the value.
