# Bridge POC flywheel — outcome report

The flywheel under ADR 0008 ran its full window (10 rounds, 2026-10-23 to 2026-11-05): it took the Spacedock Bridge from a decision card beside a chat to a commander-first board with a sidebar count, all as eight stacked, unmerged PRs (#40 → #69, GitHub stack #43); the product improved every round, the FO's own record-keeping failed observer checks in rounds 5–7 and 9 and was clean only in rounds 3 and 10. No pilot task is created; merging, extending or moving to pilot/prod is the Captain's decision.

Source of every fact below: `_l3-dogfood/rounds.md` (the round log), the round task files and their `evidence/` folders in this state checkout.

## What was built

| Round | Task (PR) | The Captain's theme, his words | Delivered |
|---|---|---|---|
| 1 | r1-hover-and-row-owner (#37, merged before the stack) | hover feedback, decision buttons, FO name on rows | hover/press feedback, distinct decision buttons, owner on each row |
| 2 | fleet-hides-closed-fos (#40) | 「區分關閉的 FO (Recommended)」 | "Tab closed" badge that follows the host's tab state |
| 3 | r3-reply-clear-and-safe (#42) | 「回覆清楚又安全」 | recipient named, drafts kept, no double send, prefill never overwrites |
| 4 | r4-phone-layout (#46) | 「手機版 (Recommended)」 | collapsible briefing, composer above the keyboard and the Android bar |
| 5 | r5-board-tells-the-truth (#49) | 「看板說真話 (Recommended)」 | loading / "could not check" instead of a false empty board; recorded gates shown as recorded; "← Queue" |
| 6 | r6-queue-you-can-scan (#54) | 「掃一眼就懂的清單」 | full wrapping titles, per-item FO rows with honest counts, question ages, "Check again" |
| 7 | r7-one-clear-way-to-decide (#57) | 「決定畫面變清楚 (Recommended)」 | message and decision separated (reason field, explicit Confirm), conversation scope named, larger phone controls, the Captain's colour-difference fix |
| 8 | design only: r8-simplest-way-to-decide, r8-list-and-wide-detail (no PR) | 「我想先做設計稿先不要動手改…」; 「可以，注意要先找出適用情境中最簡單易用的 UX再做設計」 | interaction-model counts, an Agent Observatory reference evaluation, mockups of a narrow list beside a wide detail; his go 「照這個方向做可以」 |
| 9 | r9-commander-first design + r9-list-and-detail-layout (#68) | 「…讓 comm officier 可以成為指揮官…」; 「就這樣」 | Bridge opens on the comms officer as the Commander; board beside a wide detail with grouping, one status per row, filters; one-step return; session Done section |
| 10 | r10-sidebar-count-popover (#69) | 「先做側欄數字跟彈出，右側先不動」; amended 「應該越新的越上面」 | amber count on the Bridge sidebar row ("?" while unchecked, none at zero) and a popover of gates and questions (newest first: the amendment is being built and re-validated) |

## What the flywheel showed

- **The Captain's UAT drove every theme.** Ten themes, ten choices by him; the FO's recommended next theme was overridden twice (after rounds 5 and 7).
- **Design before code paid off where it was used.** Rounds 5–7 each built a UI change whose surroundings were wrong (round 7: oversized desktop buttons, the decision area still narrow). Round 8's design passes caught two direction changes (list-beside-detail, then commander-first) before any code; round 9 built the accepted design with no design rework. A step of counted interaction models before visuals, as the qnow FO learned the same week, found the simplest model; the first pass still missed master-detail, which the Captain found by looking at another plugin.
- **The whole-product walk before the Captain's questions** (two picky users and the design director) surfaced most of what he later raised, and turned his questions into ranked options.
- **Repair tails were the main cost in code rounds.** Roborev (FO-run) found one Medium (or High) per head for six heads in round 6 and six heads in round 9; each repair tended to open the next finding in the same class. What shortened tails: a chief-engineer call on drift, class-level repairs, tests named up front, and (round 10) a separate read-only investigation before each fix.
- **The Captain stayed in the loop on what is his**: two known-risk rulings (decision records matched by briefing id; phone sheet clipping when a source fails), one model mapping, and every scope change after a backlog gate.

## FO record reliability

| Round | Observer FO record violations | Classes |
|---|---|---|
| 2 | 2 | missing push-grant quote; empty `id` |
| 3 | 0 | — |
| 4 | 2 | `pr:` not set; decline placement |
| 5 | 2 | chief-engineer calls unrecorded; decline placement (recurrence) |
| 6 | 1 | a blanket rule routing findings to declines (plus a wrong grant date found by FO) |
| 7 | 2 | scope added after the backlog gate without a ruling; diagnosis and fix in one dispatch |
| 8 | not run | FO omission — the design tasks had no observer pass |
| 9 | 5 | missing seed fields; amendment not recorded as such; an FO "implementation choice" that changed the accepted design; fixes without a separate investigation; decline placement |
| 10 | 0 | — |

Each stop went to the Captain (rounds 5, 6, 7, 9; round 10's second unsatisfied team pass); he ruled to repair the records and continue each time. Every class, once seen, became a check in `_l3-dogfood/pregate_check.py` (12 checks, each falsified against the record that had the defect); new classes kept appearing until round 10. The record rules hold only where a script checks them.

## Package gaps for the dev2 FO

1. README "always asked, whatever an ADR says" versus ADR 0011 L3 decision classes (reconciled here by an ADR 0006 exception).
2. `design_surfaces.py` requires `Surfaces:` / `Visible change:` on POC tasks, which the README asks only on the five-stage route (every task here).
3. `number_guards.py` R4 versus "a POC task reserves no number".
4. No "delivered to the stack" terminal for unmerged POC rounds; design tasks with `merge: pr` and no PR sit at approved-awaiting-merge.
5. The Codex worker sandbox cannot reach the roborev daemon; the FO ran every roborev gate.
6. `spacedock new` leaves `id` empty until set by hand.
7. The codex review reader reads "not reviewed" when Codex posts only a security review summary.
8. `role_triggers.py` ranks reviewer models by Claude names only, so a codex/gpt-6-astra:xhigh call (the Captain's opus mapping) reads as owed.

## Still open

- The right-side review panel opened by a header button (native gate now; an SD review page only in Paseo's browser tab, desktop app only; a TUI is not available to plugins) — the Captain deferred it: 「右側先不動」.
- Round 7–9's planned detail work: reading order, action wording, desktop button proportions, phone bottom actions; real-phone keyboard reachability.
- Pinning the view switch and filters while the board scrolls (his decision); message times in the Commander conversation.
- Known risks he ruled: decision records match by briefing id only; the phone popover clips a row when a source fails. FO decline: an attempt replaced by someone else before confirmation does not enter the Done section.
- Cost: worker tokens and wall time were not measured.
