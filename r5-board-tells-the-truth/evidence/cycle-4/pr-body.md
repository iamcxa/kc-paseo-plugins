Both Bridge list views now use the same checked/loading/failed source state for their notices and counts. By FO no longer shows a checked zero or no-agents message while a source is loading or failed. Per-FO unread-question reads settle before the FO source is complete, and independent workflow reads retain healthy gates/tasks while identifying failed directories.

A closed or recorded gate card shows its result with ordinary FO discussion, without decision chips, a decision-reason prompt or a waiting age. More appears only when the measured full feedback exceeds its displayed one-line status/two-line detail preview, and opens the full feedback dialog. The back label is “← Queue”. Reopening a closed gate finds its latest resolution without a briefing ID; returning from a recorded card refreshes gates once and updates the existing snapshot.

Checks at `04dfa6779a9968fa2110dfe53bf2b26f032d9d46`:

- `npm test`: 110 passed; `npm run typecheck`: passed.
- Browser assertions at 380×820: both views show loading/failed notices and unknown counts, then a checked empty list; no-agents text appears only after success.
- Recorded and no-longer-open card screenshots: no decision controls or waiting age; ordinary discussion remains; short feedback has no More.
- Forty-line feedback: the visible detail is 32 px versus 640 px full text; More is present and opens the feedback dialog after its animation.
- Existing source/server regressions cover pending/failed FO question reads, mixed healthy/removed workflows, reconnect refetch status, and fresh-then-cached gate reads.

The old By-FO count and closed-card controls fail the same runtime assertions at parent `22040541b15ea147a43db9d7d77ac377ec127726`. Fixtures use synthetic agents/tasks and an empty coordinator SDK timeline; this does not prove a real provider turn or Android rendering. Earlier question-arrival browser evidence remains pinned to its original commit. Draft storage, keyboard hooks, decision logic, claim/release and relay text are unchanged. No dependency, persisted load/ask state, retry, background job, new server cache or workflow-state write was added.

Independent validation and the local review gate remain with the first officer. Flywheel round 5, stacked on #46 (`spacedock-ensign/r4-phone-layout`); keep this PR Draft and unmerged.
