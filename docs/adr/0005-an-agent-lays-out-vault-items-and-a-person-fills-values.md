# 5. An agent lays out vault items; a person reviews them and fills the values

Date: 2026-10-21

## Status

Accepted

## Context

Agents read project secrets through `op://<vault>/<item>/<field>` references (ADR 0001). How
items were laid out was left to each user: one repository's vault mixed one item per variable,
Secure Notes with custom fields, and an item mis-typed as SSH Key that made Browse vault fail
for the whole vault (2026-10-21). A reference resolves by title and field label, so an
inconsistent layout makes references hard to predict and easy to break. Creating items needs
write access to the vault, while the plugin reads with a read-only service account (ADR 0001),
and no secret value may pass through an agent's context.

## Decision

**Words:** 「可以」 — Captain, 2026-10-21, approving the proposal that an authorized agent uses a
skill shipped with this plugin, with the 1Password CLI or MCP, to create vault items to one
convention; a person reviews before creation and fills every value; the agents that run then use
the vault keys built that way.

**Options considered:**
- the agent creates structure only (items, field labels, field types) after a person reviews it,
  using the person's own unlocked 1Password sign-in; the person fills each value in 1Password
  (chosen)
- the agent also writes values
- in-app written steps only, the user lays out items by hand

**Recommended:** the agent creates structure only.

The convention: one Secure Note item per service, titled with the service name; a secret is a
field of type password, a non-secret setting a field of type text; the note body stays empty;
titles are unique in the vault; no field sits inside a section; no field label contains `/`.
This replaces the layout recorded on 2026-10-21 as journey question setup-guide/q3 (one API
Credential item per service).

## Consequences

- Writing to the vault uses the person's own sign-in; the plugin's service account stays
  read-only, so creating structure and reading values never share a credential.
- No secret value passes through the agent: fields are created empty and the person fills them.
- Whether `op` can create an empty password field, and whether a 1Password MCP exists for this,
  is unverified; the first task's ideation proves it before building.
- Secure Notes with typed custom fields, and items laid out before this convention, still
  resolve; an item typed SSH Key or Document can still fail to read.
