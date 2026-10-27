# Dispatch record: project-env-docs-site validation-1

Candidate: 48ecb5f38bac6d8de9382a5bfddf52d38a70bddb
Dispatched: 48ecb5f38bac6d8de9382a5bfddf52d38a70bddb
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Independently check candidate 48ecb5f38bac6d8de9382a5bfddf52d38a70bddb (PR iamcxa/kc-paseo-plugins#58, base main bed5a66) against AC-1 and AC-2 and the approved revision 2 design: rebuild from git archive with the github-pages gem set, crawl it, confirm every internal path is absent (pages and search index), the six pages and seven pictures, scrollWidth at 400 and 1280 px, and the search label at or above 4.5:1; read every install and 1Password preparation statement against code, Paseo's docs or a run, and follow the Install and Prepare pages' words yourself on an isolated Paseo home up to an agent that starts with one mapped variable set, recording where the words fall short; check ADR 0009 quotes the Captain's words with the questions they answered; give a verdict.
Run the built screen review your validation principles require (design-director pass 2a on your own screenshots of the built site at 1280 and 400 px) and write its Built screen review lines; write the minimal acceptance script FO will rerun in a fresh shell.
Record what the Captain should see in the screenshots and every unverified obligation (real Pages build, real 1Password account).

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.0 (run check scripts from this root)
Send your completion message to `main`.
Candidate: 48ecb5f38bac6d8de9382a5bfddf52d38a70bddb
Work from `git archive` of the candidate, not the shared worktree. Evidence goes under this task's state folder (evidence/val/). Report findings as findings; add no checklist lines of your own.
Turning on GitHub Pages or any repository setting is outward-facing and not yours. Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins. Runtime probes and servers use their own folder and ports (not 6920-7410 or ones the implementation used), removed afterwards.
