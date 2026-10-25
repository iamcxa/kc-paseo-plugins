# Dispatch record: project-env-fo-grant-adr ideation-1

Dispatched: f849058121e61120d91e460bedca081c71a1aaea
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Draft the exact text of docs/adr/0007-<slug>.md in ADR 0006's shape: Context, Decision with a Words line quoting the Captain verbatim, the excepted README sentence quoted exactly from docs/dev2/README.md, granted classes, classes kept with the Captain, recording command, per-round records, expiry, demotion, revocation, the provisional clause, and Consequences; keep the acceptance criterion with its evidence clause.
Apply the draft to a temp copy of docs/adr and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/scripts/adr_lint.py <copy> --since 60799d9 --require 7` recording its exit code; do not write into the repo's docs/adr.
Name any decision the Captain must make with a recommendation (expiry and demotion numbers count: propose them and say they are unmeasured).

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Read: docs/adr/0006-the-bridge-fo-decides-three-classes-of-poc-gates-by-record.md on origin/main (the model to follow); kc-dev-flow-2 ADR 0011 in iamcxa/kc-claude-plugins (the L3 rule it cites; find it with gh or a local checkout under /Users/kent/conductor/repos or /Users/kent/conductor/workspaces/kc-claude-plugins, read-only); docs/dev2/README.md (the sentence near "always asked, whatever an ADR says"); the task's Scope for the Captain's words and split. The reserved number is ADR: 0007 (in this task's Number guards).
The record is provisional per the Captain's words in Scope; say how it is reviewed when dev2 ships an authorization framework.
Docs only. Evidence and drafts go under this task's state folder. Never read or print a secret value; run no op or security command. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
Code: main f849058121e61120d91e460bedca081c71a1aaea.
