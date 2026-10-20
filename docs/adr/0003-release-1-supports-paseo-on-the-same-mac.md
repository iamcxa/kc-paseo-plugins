# 3. Release 1 supports Paseo running on the same Mac

Date: 2026-10-20

## Status

Accepted

## Context

Settings are scoped to the Paseo host, and the token is stored in the login
Keychain of the machine running the daemon. A client on a phone or another
computer can open the same settings screen.

## Decision

**Words:** 「接受」 — Captain, 2026-10-20 (rulings D5, D6)

**Options considered:**
- support only a daemon on the user's own Mac in release 1, and say on screen that
  the token is stored on the Mac running Paseo (chosen)
- support remote and headless daemons now

Any client authorized on that Paseo host may store a token or run a test, as Paseo's
own permission model allows.

## Consequences

- A remote or headless daemon is unsupported until a later decision.
