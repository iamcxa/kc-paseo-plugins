The Bridge now distinguishes loading and failed sources from a checked empty list, using the same result for its empty text and decision count. Comms-officer question detection lives in the Bridge so questions appear on the compact FOs tab while chat is unmounted.

Closed gate cards return the latest decision for their stage when opened without a briefing ID, or show a neutral “no longer open” message. Returning from a recorded card reads gates once with a fresh snapshot. The card's back label is “← Queue”.

Validation at `a3674e14595c7830e95de43d6d935c2496832c12`:

- `npm test`: 105 passed; `npm run typecheck`: passed.
- Isolated 380 px browser proof: loading, review failure, successful empty list, a question on the FOs tab without chat mounted, timeline failure and recovery.
- Isolated closed-gate proof: recorded decision, neutral withdrawal, exactly one fresh gate read on recorded return and none on neutral return.
- Restoring only the old empty-list predicate in a disposable copy fails the same UI assertion.

The question proof uses a synthetic coordinator timeline at the host SDK boundary; it does not prove a real provider turn or Android device behavior. Draft storage and keyboard hooks are unchanged. No persisted load/ask state, retry, background job, server cache, workflow-state write, or dependency was added. Independent validation and the local review gate remain with the first officer.

Flywheel round 5, stacked on #46 (`spacedock-ensign/r4-phone-layout`). Keep this PR Draft and unmerged.
