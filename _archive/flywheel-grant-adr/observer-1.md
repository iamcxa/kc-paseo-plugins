# Observer report — flywheel-grant-adr (codex gpt-6-astra, 2026-10-23)

Window 86a8873..7daa39a; rules docs/dev2-poc/README.md at c143dc7. Result: 5 violations.

1. Low — Schema "Record `id`, `title`, `status`, `variant: kc-dev-flow-2`, and the user's selected `profile`.": top-level `id` empty in the task frontmatter.
2. Medium — Stages "Stage workers run on the workflow's default model.": README says `model: sonnet`; dispatch records name codex gpt-6.1-sol / gpt-6-astra with no recorded exception in those records.
3. Low — Stages "with the absolute root substituted, never the bare script name": "adr_lint passes" in dispatch/implementation-1-followup-1.md and -followup-2.md.
4. Low — FO steps: review findings, step 5 "FO counts rounds and records the count in the committed gate summary.": the merge ask lists the Codex verdict without a round count.
5. Low, tooling mismatch — design_surfaces backlog replay exits 1 on Surfaces; README asks for it only on the five-stage route (package gap 2).

OK: dispatch records complete with full Candidate hashes; sufficiency and necessity confirmed; sentinel waits for this report.
Can't tell: chat provenance of Captain rulings (outside state); worker investigation before the one-line repair; presentation time of the merge ask.

FO process repairs (applied from the next dispatch):
- 2: every dispatch record's Model line quotes the Captain's ruling 「接下來都用codex astra /sol 作為 ensgin 以節省額度，推理至少爲 high」 (chat, 2026-10-23) as the model exception.
- 3: every checklist and scope line names package scripts by absolute path, including "adr_lint"; the FO greps dispatch records for bare script stems before committing them.
- 4: every merge ask text carries "External review rounds: N (Codex …)".
- 1: id left as minted by `spacedock new`; raised as a question to the dev2 maintainer FO via the round log.
