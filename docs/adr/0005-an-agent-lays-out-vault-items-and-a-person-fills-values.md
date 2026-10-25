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

**Amendment, 2026-10-23** (「同意」 and 「可以，就這樣做規則」 — Captain, 2026-10-23, in the hand-off of the rule; 「注意應該是建議守則不是強迫性的，直到我們設計一個 skill 讓獨立的 agent 做這件事，且可以確保完全保密完全不外洩」 — Captain, 2026-10-23, relayed by the session that handed over the rule): four recommended rules for naming vaults, items and fields. They are guidance for a person laying out a vault, not a mandatory convention.

1. A vault an agent reads through a service account should be named `agent-<project>-<env>`, for example `agent-relay-dev`. The vault that holds service account tokens, read only by a person, should be `agent-tokens`. Reason: the hand-off observed on 2026-10-23 that 1Password lists vaults alphabetically with no manual order, so a shared prefix keeps them together; and the secret reference syntax page (https://www.1password.dev/cli/secret-reference-syntax/) lists the characters a reference supports (letters, digits, `-`, `_`, `.` and whitespace), and `@` is not among them, so `-` joins the parts.
2. An item's title should be the service name, lowercase, words joined by hyphens (`netlify`, `posthog`). It should take a `-<qualifier>` only when one vault holds two accounts of one service, and never carry a project prefix. Reason: the vault name already carries the project. This refines "titled with the service name" above.
3. A field label should be the environment variable name the agent receives (`NETLIFY_AUTH_TOKEN`). Reason: the field picker suggests the field whose label equals the variable name (`sameName` in `project-env/shared/field-picker.ts`), so the mapping needs no choice.
4. A service account token item in `agent-tokens` should be titled with the service account name, the same string as its Keychain service name. Reason: the plugin looks the token up in the login Keychain by that name (`find-generic-password ... -s <service account>` in `project-env/server/secrets.ts`), so one string finds it in both places.

The guidance authorizes no agent to create, rename or edit a vault or an item. This record's decision that an authorized agent lays out items through a skill shipped with this plugin, to the convention above, stays the target design; no such skill exists yet. Until one does, the guidance stays advisory. An agent lays out items only through a dedicated skill, run by an independent agent, that guarantees no secret value is exposed.

## Consequences

- Writing to the vault uses the person's own sign-in; the plugin's service account stays
  read-only, so creating structure and reading values never share a credential.
- No secret value passes through the agent: fields are created empty and the person fills them.
- Whether a 1Password MCP exists for this is unverified. Three facts were verified on 2026-10-23:
  - `op item create --category "Secure Note"` with `NAME[password]=` creates an empty password field (op 2.30.3), which settles the point this record left open.
  - Secret references are case-insensitive. That is a property of 1Password's resolver: project-env still requires a mapping's vault segment to match the saved vault's spelling exactly (`isOutsideVault` in `project-env/server/cause.ts` compares with `!==`, and `project-env/test/vault-boundary.test.ts` covers a different letter case), so `op://dev/...` under a saved vault `Dev` is blanked as outside the vault.
  - Renaming a vault breaks project-env mappings stored by vault name, because a reference is matched by the prefix `op://<saved vault>/`.
- The plugin checks none of the four names, and they bind no one: they are advice to a person until that skill exists.
- Secure Notes with typed custom fields, and items laid out before this convention, still
  resolve; an item typed SSH Key or Document can still fail to read.

**Amendment, 2026-10-25** (「准」 — Captain, 2026-10-23, approving that picking the new vault in Change re-points the references written with the old vault, and that the screen marks references outside the saved vault.) The consequence "Renaming a vault breaks project-env mappings stored by vault name, because a reference is matched by the prefix `op://<saved vault>/`" now holds only until the person chooses the new vault in Change: pressing Done points every mapping written with the old vault (its name, or its id when the vault was saved by id) at the new one, and Cancel changes none. A mapping outside the saved vault is marked on its row before Test (`markedOutside` in `project-env/shared/ref.ts`), and a mapping into a third vault is left as written and marked. Identity by vault id stays deferred: a vault renamed in 1Password after it was saved by name still breaks its mappings until the person chooses the new name in Change.
