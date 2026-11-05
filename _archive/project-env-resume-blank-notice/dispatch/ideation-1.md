# Dispatch record: project-env-resume-blank-notice ideation-1

Dispatched: 06aa5bee9dd0bf0f0741b09783ab75b87bb96c8c
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Run first, then design: on an isolated Paseo 0.14.0 observe what `agent.session_open` does when an agent's runtime is released and resumed, with a mapped variable readable and with it unreadable, recording the `reason` and whether the conversation shows any line; say how you forced the release if the one-hour idle wait can be shortened, and what you could not observe. If there is no gap, say so with the evidence and propose stopping.
If there is a gap, design the smallest change: the line on a resumed agent, how it avoids repeating on every resume with the same failure, whether the agent notice text stays true, keeping AC-1 with a reproducible evidence clause; produce the previews the ui surface owes at 1280 and 400 px and the design review, each finding dispositioned.
Name any decision the Captain must make (at most one), with a recommendation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.33.1
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Source: the Captain's 「開」 (2026-10-30) and the task's context. Base: main 06aa5bee9dd0bf0f0741b09783ab75b87bb96c8c. Read Paseo's own release notes and docs for how the idle release works and how to run a given version in isolation; do not infer it from another adopter.
Isolation: install or run Paseo 0.14.0 only under a throwaway folder with its own home and port, never replacing /Applications/Paseo.app or the global `paseo`; if that is impossible, stop and report it. Harness: docs/project-env/capture/ with your own folder and ports, not ones used earlier (6920-8815, 18491, 18492). Fake `op` and `security`.
Throwaway copies only, never a branch. Evidence under this task's folder in the state checkout. Report findings as findings; add no checklist lines of your own.
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
