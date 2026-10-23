Known Paseo tabs that are all closed now add a neutral Closed badge beside the owning first officer in By FO, decision rows and the next card. Missing labels, any open client tab, and running agents stay unbadged; grouping, actions and the archived/offline path are preserved. The web composer suppresses its rectangular browser outline while retaining the rounded border's hover and focus colors.

Verified with 78 passing tests, TypeScript checking, live read-only tab-label observations, and isolated Paseo screenshots of both lists and the typed composer. The rule test also fails when the Closed signal is removed. Evidence is in the split-root task state at `fleet-hides-closed-fos/evidence/`; it is not shipped in this branch.

First unmerged layer of the POC flywheel under ADR 0008, based on main. Keep this PR Draft; external review rounds belong to the First Officer. No live installation or daemon was changed, and native appearance and Captain acceptance remain unverified.
