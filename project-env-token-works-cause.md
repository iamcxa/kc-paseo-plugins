---
id:
title: The token row names why a token fails and picks the only readable vault
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1.5
journey-story: token-works
journey-required-tasks: '["project-env-token-works-cause"]'
journey-mapping-complete: true
gates:
    version: 1
    records:
        - id: gate:project-env-token-works-cause:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-token-works-cause-backlog-1
              briefing:
                id: briefing:project-env-token-works-cause:backlog:attempt-1:revision-1
                digest: sha256:a57002b250af600379f48caac6a605ef7c57e654d390140053702424057074a2
                room-ref: ./project-env-token-works-cause/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-token-works-cause:backlog:1
                briefing: briefing:project-env-token-works-cause:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-21T08:40:14.816863Z"
                decision: approve
                reason: 'Captain 2026-10-21: 「准」 — accepts this release r1.5 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
started: 2026-10-21T08:41:45Z
---

Release r1.5 of the paseo-project-env journey: on his own Mac, Kent stores a token only after it is checked, sees why a token fails, edits each variable where it sits, and sees test results that match his draft; his own use accepts it. Captain, 2026-10-20: 「我覺得UI不夠直覺」. Captain accepted this task list on 2026-10-21: 「可以」. Today a locked Keychain reads as no token, and a missing op, an outage and a rejection all read as invalid; a token that reads exactly one vault still leaves the vault unchosen.

## Scope

In: one token state per cause (no token, locked Keychain, op missing, 1Password unreachable, rejected), fixed text without tool output or values; the readable vaults listed on the token row; when the token reads exactly one vault and none is chosen, that vault is chosen; the per-keystroke re-check of the account field; the "ADR 0027" comment in `tokenStatus`. Settled in ideation: journey token-works/q2 and q6. Non-goals: storing a token (project-env-paste-token-check-first). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: Each token failure cause shows its own fixed text, never op or security output and never a value.
Verified by: tests with fake security and op covering each cause, plus a sentinel search of the rendered text.

**AC-2**: A working token lists its readable vaults, and when it reads exactly one and no vault is chosen, that vault is chosen.
Verified by: a unit test, and Kent's own use on his Mac.

**AC-3**: The tokenStatus comment no longer cites an ADR from another project.
Verified by: `git grep "ADR 0027" project-env` prints nothing.

## FO alignment

Surfaces: ui
Visible change: The token row says why a token fails, lists the vaults it can read, and picks the only one.
Direction alignment with the Captain: not needed — follows r1's cause-class wording and the Captain's 2026-10-21 「可以」 on this task list; release r1.5 is reviewed and interrogated (signal 4).
Release review: paseo-project-env/r1.5 at 9489e13
