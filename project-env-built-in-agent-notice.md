---
id:
title: Every agent that receives project variables is told where they come from and what to do when one is blank
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-built-in-agent-notice:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-built-in-agent-notice-backlog-1
              briefing:
                id: briefing:project-env-built-in-agent-notice:backlog:attempt-1:revision-1
                digest: sha256:e1171d167ab3d52f6cbdd32b5badef6997ca4afdc5a5891b94dc0af70cadc40a
                room-ref: ./project-env-built-in-agent-notice/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-built-in-agent-notice:backlog:1
                briefing: briefing:project-env-built-in-agent-notice:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-24T01:15:35.218834Z"
                decision: approve
                reason: 'Captain 2026-10-24: 「開，但是是否不需要列出有哪些金鑰？」 — approves opening the task; his question on variable names is answered by FO''s recommendation (do not list them) in Scope and confirmed at the ideation gate.'
              application:
                target-stage: ideation
                state: pending
---

From the Captain's UAT discussion on 2026-10-24. He found the default-prompt box 「稍嫌多餘」 but liked using it to tell agents 「這個 repo 的金鑰都已經在環境變數裡，不要叫使用者貼 token，也不要把值印出來」, and asked whether a default like that should also 「讓agent 知道有這個套件存在，有問題可以知道排查方向，例如讀取套件文件」. He approved opening the task with 「開」, and asked 「是否不需要列出有哪些金鑰？」; the FO recommends not listing them, and he confirms at the ideation gate.

## Scope

In: when project-env injects variables into a new agent, the plugin adds a fixed notice ahead of the project's own prompt. The notice says the session's environment variables come from the Paseo project-env plugin's 1Password mapping; that the agent must not ask the user to paste a token or print, log or commit a value; and that a blank variable means it did not resolve, with the steps to find out why (Paseo settings, Plugins, Project environment, Test) and where the plugin's troubleshooting notes are. It names no variable. A short troubleshooting document for people and agents (`project-env/OVERVIEW.md`, today an empty template) explains where variables come from, why one can be blank (vault changed, field missing, token rejected, reference outside the saved vault) and how Test shows the reason. The default-prompt box stays for the project's own instructions. Out: listing variable names or values; changing which variables are injected. Stop condition: the acceptance criteria pass. Runs after project-env-vault-change-repoints-refs, since both touch what an agent receives at session open.

## Acceptance criteria

**AC-1**: A new agent in a project with at least one injected variable receives the notice in its system prompt, ahead of the project's prompt, and the notice contains no variable name or value; a project with no variables adds no notice.
Verified by: a unit test on the agent.create hook output for both cases that fails when the notice is dropped or a name appears in it; a runtime check on an isolated Paseo reading the created agent's system prompt.

**AC-2**: The troubleshooting document explains each blank-variable cause the screen's Test can report and how to see it.
Verified by: a reviewer ticks each cause in shared/cause.ts against the document.

## FO alignment

Surfaces: ui
Visible change: Agents in a configured project are told where their variables come from and how to check a blank one; the plugin gets a troubleshooting page.
Direction alignment with the Captain: done — he approved opening the task on 2026-10-24 (「開」); the no-names choice is confirmed at the ideation gate.
Result: this task's Scope; the ideation gate shows the notice text and the document.
Release review: not needed: a small addition to what the r1 injection already does; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this task.

## Captain amendments

### Amendment 1 — 2026-10-25, chat
Captain: 「拿掉避免誤會」 (FO chat, 2026-10-25)
Asked: "**One decision for you:** I recommend removing the prompt box in that next task, so only the built-in notice remains. Neither project uses the box. The cost: if a project someday needs its own instructions, there's no place to put them, and we'd have to add the box back. Reply 「拿掉」 to remove it, or 「保留」 to keep it."
Supersedes: none
Design: Scope sentence "The default-prompt box stays for the project's own instructions."
