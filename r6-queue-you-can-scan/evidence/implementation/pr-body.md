Queue titles previously shared a single narrow line with their owner and age, while FO cards hid individual waiting items behind summaries. Titles now wrap across two lines with metadata below, and each FO card shows every waiting item as its own destination with a matching count. Comms questions show their message age or unknown; comms and FO questions remain separately attributed because a shared originating request identity was not established.

Failed FO, gate, task and comms sources can be checked again through their existing readers and request guards. Review failures show the existing poller's next scheduled check instead of offering an immediate GitHub retry.

Validation: 116 tests passed; typecheck passed; isolated browser fixtures at 360 and 1440 pixels in both views exercised wrapping, counts, destinations and honest ages. The same fixture fails on the base version. Evidence and stage report live in the separate workflow state checkout. The design-surface check is skipped under the recorded package gap; local RoboRev is delegated to the First Officer.

This is the fifth unmerged stack layer, based on `spacedock-ensign/r5-board-tells-the-truth` at `6f16429c24d4853c15698091f0fb42830185c951`. Keep this pull request Draft. Do not merge.
