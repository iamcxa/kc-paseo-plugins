The Bridge distinguishes loading and failed sources from a checked empty list, using the same result for its empty text and decision count. Comms-officer question detection lives in the Bridge so questions appear on the compact FOs tab while chat is unmounted. The FO source also waits for all per-FO question reads to settle and marks a failed read incomplete. Every timeline refetch updates its working status, including when a turn finished while disconnected.

Closed gate cards return the latest decision for their stage when opened without a briefing ID, or show a neutral “no longer open” message. Returning from a recorded card reads gates once with a fresh snapshot and replaces the existing cache, preventing a later cached read from reviving the removed gate. Workflow reads settle independently, preserving healthy workflows’ gates and tasks while naming only failed directories on the board. The existing fleet tool keeps its explicit error behavior for incomplete data. The card's back label is “← Queue”.

Current checks at `22040541b15ea147a43db9d7d77ac377ec127726`:

- `npm test`: 110 passed; `npm run typecheck`: passed.
- FO-source regressions: two deferred question reads remain loading until both settle; a failed read retains healthy questions and reports an incomplete list; the next successful normal snapshot clears that failure.
- Workflow-isolation regression: one healthy and one removed workflow preserve the healthy gate and task, report only the removed directory, and keep the fleet tool from returning a partial list as complete.
- Mounted-hook regression: a turn completes while disconnected and its question appears after the reconnect refetch, without a turn-completed or handle-update notification.
- Cache regression: a fresh read removes the gate and the next ordinary read within 30 seconds uses that updated snapshot, even when the CLI fixture would now fail.

Earlier isolated browser proof at `a3674e14595c7830e95de43d6d935c2496832c12` covered 380 px loading/failure/empty states, questions on the FOs tab without chat mounted, recorded/neutral closed gates, and one fresh read on recorded return. Restoring only the old empty-list predicate in a disposable copy failed the same UI assertion. Follow-up repairs were verified with source-observer, mounted-hook and server regressions; that browser proof was not rerun.

The question proof uses a synthetic coordinator timeline at the SDK boundary; it does not prove a real provider turn or Android device behavior. Draft storage and keyboard hooks are unchanged. No persisted load/ask state, retry, background job, server cache, workflow-state write, or dependency was added. Independent validation and the local review gate remain with the first officer.

Flywheel round 5, stacked on #46 (`spacedock-ensign/r4-phone-layout`). Keep this PR Draft and unmerged.
