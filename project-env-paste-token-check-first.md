---
id:
title: A token is stored only after 1Password accepts it
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1.5
journey-story: paste-token
journey-required-tasks: '["project-env-paste-token-check-first"]'
journey-mapping-complete: true
gates:
    version: 1
    records:
        - id: gate:project-env-paste-token-check-first:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-paste-token-check-first-backlog-1
              briefing:
                id: briefing:project-env-paste-token-check-first:backlog:attempt-1:revision-1
                digest: sha256:bff7fdb7603e47c890709aed8cb74fe4cc58f3a65fde85fab009382fc99e1a9b
                room-ref: ./project-env-paste-token-check-first/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-paste-token-check-first:backlog:1
                briefing: briefing:project-env-paste-token-check-first:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-21T08:40:27.125996Z"
                decision: approve
                reason: 'Captain 2026-10-21: 「准」 — accepts this release r1.5 task''s outcome, scope and acceptance criteria on the pilot profile, into ideation.'
              application:
                target-stage: ideation
                state: consumed
---

Release r1.5 of the paseo-project-env journey: on his own Mac, Kent stores a token only after it is checked, sees why a token fails, edits each variable where it sits, and sees test results that match his draft; his own use accepts it. Captain, 2026-10-20: 「我覺得UI不夠直覺」. Captain accepted this task list on 2026-10-21: 「可以」. Today storeToken writes the Keychain first and checks afterwards, and a name another project uses is overwritten without a warning.

## Scope

In: check the pasted token before writing it; refuse a rejected or unreachable token with its cause; warn before replacing a token another saved project uses, and replace the project's own without a warning; keep the token off the security command line if feasible, else return to the Captain. Settled in ideation: journey paste-token/q3, q4, q5. Depends on: project-env-token-works-cause (the check and cause states). Non-goals: rotation (r1b). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: A rejected or unreachable token is not written to the Keychain, and the error names the cause.
Verified by: a test whose fake security log shows no add-generic-password call.

**AC-2**: A name another saved project uses shows a warning naming that project before it is replaced; the project's own token is replaced without one.
Verified by: a test, and Kent's own use on his Mac.

**AC-3**: The ops_ prefix check and the 128-character guard still apply.
Verified by: the existing tests.

## FO alignment

Surfaces: ui
Visible change: A bad token is refused before it is saved, and replacing another project's token asks first.
Direction alignment with the Captain: not needed for the outcome — the Captain approved it on 2026-10-21 (「可以」); the warning's form is settled in ideation.
Release review: paseo-project-env/r1.5 at 9489e13
