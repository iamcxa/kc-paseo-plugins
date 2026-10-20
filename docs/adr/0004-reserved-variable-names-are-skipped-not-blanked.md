# 4. Reserved variable names are skipped, not blanked

Date: 2026-10-20

## Status

Accepted

## Context

ADR 0002 blanks a variable that cannot be resolved so an agent never runs on a stale
value of a mapped name. Some names cannot follow that rule. The name check admits any
identifier, and the session-open hook spreads resolved values over the agent's launch
environment. Blanking `PATH` or `HOME` breaks the agent; applying them replaces the
agent's own. After the hooks Paseo sets `PASEO_AGENT_ID` and `PASEO_AGENT_CWD` and
deletes `PASEO_NODE_ENV`, `PASEO_DESKTOP_MANAGED`, `PASEO_SUPERVISED`,
`ELECTRON_RUN_AS_NODE`, `ELECTRON_NO_ATTACH_CONSOLE`, `ESBUILD_BINARY_PATH`,
`CLAUDECODE`, `CLAUDE_CODE_ENTRYPOINT`, `CLAUDE_CODE_SSE_PORT` and
`CLAUDE_AGENT_SDK_VERSION`, so mapping any of them has no effect (read from the
installed Paseo.app, `buildLaunchContext` and `buildExternalProcessEnv`, 2026-10-20).

## Decision

**Words:** 「做法一」 — Captain, 2026-10-20 (journey question new-agent-env/q6)

**Options considered:**
- skip a reserved name: neither apply nor blank it, the agent keeps its own value, and
  the name is reported as a failed variable with a reserved-name cause (chosen)
- blank it, as ADR 0002 blanks any failed variable
- apply the resolved value like any other

**Recommended:** skip a reserved name.

The reserved set is `PATH`, `HOME`, `NODE_OPTIONS`, `OP_SERVICE_ACCOUNT_TOKEN` and the
twelve Paseo names above, kept in one predicate, `isReservedName` in
`project-env/shared/config.ts`. This is the one exception to ADR 0002's rule that an
agent never runs on a stale value of a mapped name.

## Consequences

- A reserved name never reaches `op`, and the agent keeps the value it already has.
- The reason shown for a failed variable gains a fifth class, "reserved name".
- Refusing a reserved name when a variable is added (release 1.5) reuses the same
  predicate.
- Changing the set, or ruling otherwise, changes `isReservedName` and its handling in
  `resolveProject`.
