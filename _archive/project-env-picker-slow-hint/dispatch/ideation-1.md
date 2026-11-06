# Dispatch record: project-env-picker-slow-hint ideation-1

Dispatched: 3aeb2f1d7e4b
Model: sonnet (stage default emitted by spacedock dispatch build)

Reconstructed by FO on 2026-11-06, after the dispatch, from the dispatch build FO sent (checklist and scope files kept under /tmp/r1bpolish, builder output under /tmp/spacedock-dispatch). FO did not save this record at dispatch time. What the worker received is reproduced unchanged below; the scope notes it received carried no `Package root:` line and no completion-recipient line.

## Checklist

- Reproduce the 30 s timeout on main with a slow fake `op` on an isolated Paseo and record what the picker shows (picture at 1280 and 400 px).
- Find where a timeout can be told apart from a connection failure (server cause or client error) and propose the smallest change; quote the proposed sentence.
- Write the PRFAQ, Mermaid and the ui artifact the Surfaces value owes, plus AC-1 evidence clauses that a reviewer can rerun.
- Every project-env change you propose names how `npm test` in project-env stays green; run `npm test` on main once and record the result.
- Live probes run only on an isolated Paseo (own PASEO_HOME, fake `op`/`security`); never touch the Captain's live install `paseo-project-env` or its settings, and never read or print a secret value.

## Scope notes

Batch r1b-polish-1 has four members ideating in parallel; stay inside this task's Scope. Ideation writes no repository file, branch or commit.
