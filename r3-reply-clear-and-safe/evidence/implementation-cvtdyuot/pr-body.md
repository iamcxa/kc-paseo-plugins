## Summary

Unfinished replies now stay in memory per agent and gate while switching cards or compact tabs. The send label names the recipient; decision buttons still go through the comms officer. Asking the comms officer preserves an existing draft, and consumes the prefill once so clearing the draft does not resurrect it.

This is flywheel round 3 under ADR 0008, stacked on PR #40 with base `spacedock-ensign/fleet-hides-closed-fos`. Keep this PR draft and unmerged.

## Validation

- `npm test`: 84 passing tests, including target isolation, remount reads, successful/refused sends and decisions, and seed preservation.
- `npm run typecheck`: passed.
- Isolated-daemon web walkthrough evidence is in the split-root task record; independent validation remains pending.

Known limit: drafts are lost on plugin or app reload. Drafts use only a module-level memory store; no browser storage or server persistence is added.
