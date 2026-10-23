---
id:
title: ADR 0005 records how agent vaults, items and fields are named
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

The vault naming rule handed over on 2026-10-23 by the kc-paseo-plugins session that renamed Kent's vaults (Paseo agent fb988bc1), written into the project's decision record. The Captain approved opening this task on 2026-10-23 with 「准」, answering the FO's question "要不要開一個小的文件任務，把這條命名規則寫進 ADR 0005？"; the hand-off quotes his approval of the rule itself as 「同意」 and 「可以，就這樣做規則」.

## Scope

In: ADR 0005 (`docs/adr/0005-an-agent-lays-out-vault-items-and-a-person-fills-values.md`) gains the naming rule, in the form this repo's ADR conventions require (an amendment or a superseding record, decided in ideation):
1. Every vault an agent reads through a service account is named `agent-<project>-<env>` (for example `agent-relay-dev`); the vault holding service account tokens, read only by a person, is `agent-tokens`. Reason: 1Password lists vaults alphabetically with no manual order, and `@` is not allowed in `op://` references (https://www.1password.dev/cli/secret-reference-syntax/).
2. An item's title is the service name, lowercase, words joined by hyphens (`netlify`, `posthog`); a `-<qualifier>` only when one vault holds two accounts of one service; no project prefix.
3. A field label is the environment variable name the agent receives (`NETLIFY_AUTH_TOKEN`).
4. A service account token item in `agent-tokens` is titled with the service account name, the same string as its Keychain service name.
It also records the facts verified on 2026-10-23 that settle ADR 0005's unverified point: `op item create --category "Secure Note"` with `NAME[password]=` creates an empty password field (op 2.30.3); references are case-insensitive; renaming a vault breaks project-env mappings stored by vault name.
Out: any vault, item or settings change; storing vault IDs instead of names (a separate backlog candidate). Stop condition: the acceptance criterion passes.

## Acceptance criteria

**AC-1**: The decision record states the four naming rules, their reasons and the three verified facts, and passes the repository's ADR lint.
Verified by: `python3 <package>/scripts/adr_lint.py docs/adr --since 60799d9` exits 0; a reviewer reads each of the four rules and three facts in the record against this task's Scope.

## FO alignment

Surfaces: docs
Visible change: none in the plugin; the decision record names the vault, item and field naming rule.
Direction alignment with the Captain: done — the Captain approved writing the rule into ADR 0005 on 2026-10-23 (「准」).
Release review: not needed: a decision-record update with no journey story or product behaviour change.
Map footprints: not needed: no journey story or open map question is attached to this docs task.
