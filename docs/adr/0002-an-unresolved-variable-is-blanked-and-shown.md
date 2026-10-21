# 2. An unresolved variable is blanked and shown, not fatal

Date: 2026-10-20

## Status

Accepted

## Context

When a variable cannot be resolved at session open (missing token, wrong field,
1Password unreachable), the proof of concept logged the failure to the daemon and
started the agent without that variable, silently keeping any value of the same
name the daemon already had.

## Decision

**Words:** 「接受」 — Captain, 2026-10-20 (ruling D1)

**Options considered:**
- start the agent, blank the variable, and append a visible line to the agent's
  timeline naming the variable and the reason (chosen)
- refuse to open the session until every variable resolves
- start silently (the proof of concept)

**Recommended:** not recorded

**Amendment, 2026-10-21** (「算失敗」 — Captain, 2026-10-20, journey question new-agent-env/q7; 「可以」 — Captain, 2026-10-21, journey question test-each-variable/q5): a value that is empty, or only whitespace, is a failed variable: blanked and shown at session open as this decision rules, and reported as failed by Test.

## Consequences

- An agent never runs on a stale value of a mapped name.
- The reason shown names the cause class (no token, rejected token, missing field,
  1Password unreachable) and never contains a value.
