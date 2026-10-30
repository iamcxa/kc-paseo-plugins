---
id:
title: An agent that resumes without a project variable tells the person why
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-resume-blank-notice:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-resume-blank-notice-backlog-1
              briefing:
                id: briefing:project-env-resume-blank-notice:backlog:attempt-1:revision-1
                digest: sha256:c5e6c599004f3e61597c795c17b036c63db4e778a61786cf111ee12ad75cf3d6
                room-ref: ./project-env-resume-blank-notice/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-resume-blank-notice:backlog:1
                briefing: briefing:project-env-resume-blank-notice:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-30T14:41:48.149008Z"
                decision: approve
                reason: '「開」 — Captain in FO chat, 2026-10-30. Asked: 「要不要開一個小任務，在隔離環境用 0.14.0 實測「agent 恢復時讀不到變數」的情況，有問題就補上提示？我建議開…回「開」或「先不用」。」 FO had recommended opening it.'
              application:
                target-stage: ideation
                state: consumed
---

Paseo 0.14.0 (released 2026-10-29) "Release eligible agent runtimes after one idle hour, resuming the saved session on the next prompt" (its release notes, read with `gh release view v0.14.0 -R getpaseo/paseo` on 2026-10-30). In `agent.session_open` in `project-env/server/contribute.ts` on main, a variable that cannot be read is blanked for every opening, but the "Started without N project variables" line is recorded only when `request.reason === "create"`. FO has not run this on 0.14.0; whether a release and resume fires `agent.session_open` is unverified. Asked whether to open a small task to test it on 0.14.0 and add the notice if it is a problem, recommending it, the Captain answered 「開」 on 2026-10-30.

## Scope

In: on an isolated Paseo 0.14.0, observe what `agent.session_open` does when an agent's runtime is released and resumed, with a variable readable and with it unreadable; if a resumed agent can lose a variable with no line in its conversation, show the same kind of line there and keep the notice text true.
Non-goals: upgrading the Captain's own Paseo; agent tools or MCP servers from 0.14.0; agent-organised vaults; retrying 1Password reads; changing which variables are injected.
Budget: one ideation, implementation and validation round; a second validation cycle returns to the Captain. If ideation's run shows no gap, the task stops there with the evidence and no code.
Stop condition: the acceptance criterion holds on 0.14.0 and the Captain's UAT is recorded, or ideation's evidence shows no gap and the Captain accepts that.

## Acceptance criteria

**AC-1**: On an isolated Paseo 0.14.0, when an agent's runtime is released and resumed while one mapped variable cannot be read, the conversation shows a line naming that variable and its reason; with every variable readable it shows no such line.
Verified by: a runtime run of both cases on an isolated Paseo 0.14.0 with fake `op` and `security`, recording the `agent.session_open` reason seen, plus a unit test that fails when the resume branch is removed. A real 1Password account is not used.

## FO alignment

Surfaces: ui
Visible change: A resumed agent that lost a project variable shows a line in its conversation naming the variable and the reason.
Direction alignment with the Captain: done — he answered 「開」 on 2026-10-30 to FO's recommendation to test this before he upgrades.
Release review: not needed: it follows a host release and adds no journey story.
Map footprints: not needed: no open map question is answered by this task.
