The Bridge board shows checked source state for both list views and their counts. FO question reads settle before loading completes; workflow failures retain healthy gates and tasks while naming failed directories. Comms-officer question detection uses the same displayed-message grouping as chat and checks only its final assistant message, so earlier FO work cannot mask a later Captain question.

Gate cards keep decision controls for a newer open briefing when a poll returns an older briefing's resolution. A resolution finishes the card only for the displayed briefing or when no attempt is open. Finished cards retain ordinary discussion and hide decision controls and the waiting age. More appears only when feedback exceeds the displayed preview.

Checks at `6f16429c24d4853c15698091f0fb42830185c951`:

- `npm test`: 113 passed; `npm run typecheck`: passed.
- Mounted hook regression: a reconnect with earlier FO work followed by a Captain question detects the final question.
- Mounted card regression: first briefing → newer briefing with older resolution preserves controls and polling → matching resolution hides controls. Reopening with no open attempt shows the recorded decision.
- Both final regression fixtures fail against `04dfa6779a9968fa2110dfe53bf2b26f032d9d46`.
- Shared display grouping tests cover adjacent chunks, visible tool boundaries and hidden agent-message tools.

Browser evidence from cycle 4 remains pinned to `04dfa6779a9968fa2110dfe53bf2b26f032d9d46`: 380×820 loading/failure/empty states in both views, recorded and withdrawn cards, and measured More/full-feedback behavior. Those screenshots were not rerun for this repair. Fixtures use synthetic agents/tasks; native Android and real provider turns remain unproven.

Draft storage, keyboard hooks, decision submission, claim/release and relay behavior remain unchanged. No dependency, persistent load/ask state, cache, background job, retry or workflow-state write was added.

Independent validation and the local review gate remain with the first officer. Flywheel round 5, stacked on #46 (`spacedock-ensign/r4-phone-layout`); keep this PR Draft and unmerged.
