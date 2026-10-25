# Dispatch record: project-env-built-in-agent-notice ideation-1

Dispatched: 7e038cd6047a525b1f5125ad6f07a85afe5f51da
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design the change your Scope names as amended by Captain amendment 1 (remove the default-prompt box from the settings screen; the built-in notice is the only text project-env adds to a new agent): the notice text (no variable name or value), when it is added (only when at least one variable is injected), how a previously saved prompt is treated, and the OVERVIEW.md troubleshooting document covering every cause in shared/cause.ts; keep each acceptance criterion and give it a reproducible evidence clause, and say where amendment 1 makes a criterion's wording moot.
Produce the artifact the ui surface owes: whole-page previews from a running build at desktop and 400 px of the settings screen without the prompt box, the full notice text as an agent receives it, and the document draft, plus the design review, with each finding dispositioned.
Name any decision the Captain must make (at most one), with a recommendation; not listing variable names is FO's recommendation, confirmed at this ideation gate.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Source: the Captain's backlog approval (2026-10-24, 「開，但是是否不需要列出有哪些金鑰？」) and amendment 1 (2026-10-25, 「拿掉避免誤會」) in the task file. Base: main 7e038cd6047a525b1f5125ad6f07a85afe5f51da (vault re-point merged in PR #50). Injection today: server/contribute.ts adds the project's prompt to the system prompt only when it is non-empty; both live projects have an empty prompt.
Harness: docs/dev2/.spacedock-state/ux-review-a5-polish/harness/ (CHECKOUT, S, PORT env vars) with your own S and PORT, not /tmp/pe-astra, /tmp/pe-vcr* or ports 6920, 6971, 6972, 6981, 6991, 6993.
Evidence goes under this task's folder in the state checkout, never on a branch. Report review findings as findings; add no checklist lines of your own.
Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
