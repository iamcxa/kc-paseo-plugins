# 1. Agents receive secrets as environment variables from one vault

Date: 2026-10-20

## Status

Accepted

## Context

project-env release 1 gives a repository's agents the secrets they need. The
interrogation of release 1 (two read-only reviewers on a history-free snapshot of
`main`, 2026-10-20) asked whether the plugin can promise that secrets stay safe.
Two weaknesses hold for any variable an agent receives: the agent can read and
print its own environment, and the service-account token in the macOS login
Keychain can be read by any process running as the user, so a process with a shell
can read every secret the token can reach.

## Decision

**Words:** 「第一個切片這樣沒關係」 — Captain, 2026-10-20 (accepting the two
weaknesses for release 1); 「接受」 — Captain, 2026-10-20 (rulings D2, D3, D4)

**Options considered:**
- inject resolved values into the agent's environment at session open (chosen
  for release 1)
- a broker the agent calls without ever holding the key (deferred: an MCP tool
  served by the plugin; a later release)

Each repository reads one vault through one read-only service account. Every
variable reference must point into the repository's chosen vault; the plugin
refuses a reference to any other vault. The plugin itself never shows, logs or
sends a secret value; what an agent does with a value it received is outside that
promise. "Read-only" is asked of the user in the setup steps and is not verified
by the plugin.

## Consequences

- Blast radius of a leaked token or a misled agent is the one vault, so a vault
  holds only what that repository's agents need, preferably narrow agent-specific
  keys, and a service account is created with an expiry.
- The settings screen and the plugin overview state both weaknesses in plain words.
- A broker mode per variable is the path to agents that never hold a key.
