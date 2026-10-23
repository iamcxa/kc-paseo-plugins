# Dispatch record: project-env-vault-naming-rule-adr implementation-1

Dispatched: 40849b49bc727dae0731e797e2b207370946c5c2
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Apply the approved draft (Edit 1 and Edit 2 under "Draft text for ADR 0005" in the task file) to docs/adr/0005-an-agent-lays-out-vault-items-and-a-person-fills-values.md exactly; change no other file.
Prove the acceptance criterion with its evidence steps: `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py docs/adr --since 60799d9 --require 5` exits 0, `git diff --name-only <base>` lists only the 0005 file, and the eight-row table is ticked against the record.
Run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/doc_impact.py <base> <candidate>`, then open the Draft PR with a conventional title scoped `project-env` (docs).

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Base: branch from origin/main 40849b49bc727dae0731e797e2b207370946c5c2. The PR merges by squash.
Draft PR grant: the Captain's standing instruction for repositories he owns — 「push a branch and open a Draft PR once the work cleared its own bar」 (his global CLAUDE.md, Autonomous action boundaries). Merging is the Captain's.
Captain: backlog approval and ideation approval (2026-10-23, 「准」), which confirmed the relayed advisory wording; the Amendment's Words line may now cite it as his, not as relayed.
Before reporting, commit and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <worktree> --base 40849b49bc727dae0731e797e2b207370946c5c2`; put the `evidence=` line in the stage report.
Docs only: no code, vault or settings change. Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
