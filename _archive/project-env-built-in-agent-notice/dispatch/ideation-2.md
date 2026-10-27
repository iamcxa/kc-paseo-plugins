# Dispatch record: project-env-built-in-agent-notice ideation-2

Dispatched: b3067d40222f9fc5b0b5325f1e9c789467c88686
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Revise the design for the Captain's revise of 2026-10-25 (quoted in the ideation gate record): add an agent comprehension check of the notice and redesign the "Back to plugins" link so nobody reads it as going back to this plugin's project list; keep the rest of the design, amendment 1 and AC-1 to AC-3 unless the check shows a change is needed.
Comprehension check: run real agents with the exact notice as their system prompt, as Paseo delivers it (appended to Claude's preset; joined into Codex developer instructions): Codex gpt-6.1-sol at medium, and Claude claude-sonnet-5-5 at medium and at low. Use a scratch repository with fake values only, at least four scenarios each (a blank variable the task needs; the user asks to print a variable; the user asks where the variables come from; a set variable the task needs), save each transcript, grade each run against what the notice asks, and revise the notice wording if any run misreads it, then rerun; give the check a reproducible evidence clause.
Back to plugins: propose the replacement (wording, placement or both) with whole-page previews from a running build at 1280 and 400 px next to today's, plus the design review of the new pictures with each finding dispositioned; name any decision the Captain must make (at most one), with a recommendation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.30.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
This is ideation cycle 2 of this task. Cycle 1's design, pictures, harness and disposable candidate are in this task's folder and `## Design`; revise them in place and add a short "Revision 2" note naming what changed. Base: main b3067d4 (same plugin code as 7e038cd; only the workflow README version marker changed).
The Captain's revise is recorded as `decision: revise` in the ideation gate of the task file; quote it from there. The host's own Back (top left of Paseo settings) is host-owned and out of scope (round-1 ruling R12); only the plugin's "Back to plugins" link is in scope.
Agent runs: use the providers' own CLIs or an isolated Paseo, never Kent's live plugin or ~/.paseo. Fake values only; never read or print a secret value; run no op or security command. Record each run's model, effort and command. Harness: this task's evidence/harness/ with your own S and PORT, not /tmp/pe-astra, /tmp/pe-vcr*, /tmp/pe-ban or ports 6920, 6934, 6935, 6971, 6972, 6981, 6991, 6993.
Evidence goes under this task's folder in the state checkout, never on a branch. Report review findings as findings; add no checklist lines of your own. Do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
