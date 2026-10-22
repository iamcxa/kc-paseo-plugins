# Dispatch record: project-env-field-pill-one-control validation-1

Candidate: c5336781701bd1425b287dc693af0ee58f1dbac1
Dispatched: c5336781701bd1425b287dc693af0ee58f1dbac1
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate c5336781701bd1425b287dc693af0ee58f1dbac1 (PR iamcxa/kc-paseo-plugins#24, base main d61e243) against AC-1 to AC-3, the approved design and Captain amendment 1: rebuild and run it yourself on an isolated Paseo; confirm each row shows one `ITEM › field` pill that opens the picker, no Browse vault row exists, the ≠ mark shows its detail on hover and tap without opening the picker, ✕ carries `Remove <name>` and removes only its draft row at desktop and 400 px, and the vault is read once on the first pill press; confirm the new tests fail when their behaviour is removed; give a verdict. The two picker files are FO-approved stand-ins copied from the picker-grouped design and will be replaced by project-env-field-picker-grouped; check they are byte-identical to project-env-field-pill-one-control/design/spike/picker-stand-in/ and do not judge their internals. FO has already dispositioned the two roborev findings (stand-in search text kept after a pick: routed to picker-grouped; no vault refresh after load: deferred, AC-1 requires the second press to read nothing); report any new finding only.
Write the minimal acceptance script FO will rerun in a fresh shell, and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9` recording its exit code.
Look at the whole-page screenshots at 1280 and 400 px and record what the Captain should see; record every unverified obligation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Candidate: c5336781701bd1425b287dc693af0ee58f1dbac1
Known flaky: session-open's deadline test can fail under load and pass alone; rerun it alone before counting it.
Never read or print a secret value; run no op or security command that can raise a 1Password desktop authorization prompt. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Any runtime probe uses an isolated daemon, a throwaway plugin id and its own agent-browser session, removed afterwards.
