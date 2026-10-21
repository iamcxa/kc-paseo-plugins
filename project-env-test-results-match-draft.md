---
id:
title: Test results clear when the draft changes and say what set means
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
journey: paseo-project-env
journey-release: r1.5
journey-story: test-each-variable
journey-required-tasks: '["project-env-test-results-match-draft"]'
journey-mapping-complete: true
---

Release r1.5 of the paseo-project-env journey: on his own Mac, Kent stores a token only after it is checked, sees why a token fails, edits each variable where it sits, and sees test results that match his draft; his own use accepts it. Captain, 2026-10-20: 「我覺得UI不夠直覺」. Captain accepted this task list on 2026-10-21: 「可以」. Today results stay after the draft changes, and "set" does not say it only proves a value came back.

## Scope

In: editing the account, the vault, a reference, or adding or removing a variable clears the results; the screen says set only proves a value came back; a whitespace-only value counts as empty, and so failed (Captain 2026-10-21, journey test-each-variable/q5). Depends on: project-env-variable-row-edit (results live on each row). Stop condition: the acceptance criteria below pass.

## Acceptance criteria

**AC-1**: Changing the draft clears earlier Test results.
Verified by: Kent's own use on his Mac.

**AC-2**: The screen states that set does not prove the service accepts the key.
Verified by: a screenshot in the PR.

**AC-3**: A whitespace-only value is reported as empty, at Test and at session open.
Verified by: a unit test with the fakes.

## FO alignment

Surfaces: ui
Visible change: Stale Test results disappear, set is explained, and a blank value shows as failed.
Direction alignment with the Captain: not needed — follows the Captain's 2026-10-21 layout choice (one row per variable).
Release review: paseo-project-env/r1.5 at 9489e13
