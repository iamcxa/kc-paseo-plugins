# Round 5 whole-product walk

Captured on 2026-10-27: **23 PNGs; 1 requested state unavailable**.

Build: `/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge` at `6f16429c24d4853c15698091f0fb42830185c951`.

Desktop: 1440×1000. Phone: 360×780, compact browser layout. Agents, review requests, gates, and chat messages are synthetic; no messages or decisions were sent.

The [existing isolated capture harness](../../../r5-board-tells-the-truth/evidence/validation-2/capture.py) was reused in a disposable folder, with briefing, review, and closed-tab fixtures from the [earlier phone harness](../../../r4-phone-layout/evidence/cycle-4/capture.py). Candidate client and shared components were copied unchanged. Only the disposable entry-point timeline fixture and fleet listener port were adapted.

## Screenshots

| File | Viewport | State | On screen |
| --- | --- | --- | --- |
| [1440-board-by-decision.png](screenshots/1440-board-by-decision.png) | 1440×1000 | Board: By decision | The board shows a next review card, another review, two gates, a comms question, and a First Officer question. |
| [1440-board-by-fo.png](screenshots/1440-board-by-fo.png) | 1440×1000 | Board: By FO | Review requests and waiting and idle groups appear, with a Tab closed badge on Bridge FO. |
| [1440-board-loading.png](screenshots/1440-board-loading.png) | 1440×1000 | Board: loading | Loading… and unchecked counts appear while the synthetic review source has not been checked. |
| [1440-board-could-not-check.png](screenshots/1440-board-could-not-check.png) | 1440×1000 | Board: could not check | Could not check reviews — this list may be incomplete appears with question-mark counts. |
| [1440-board-empty.png](screenshots/1440-board-empty.png) | 1440×1000 | Board: truly empty | Nothing is waiting on you appears with zero counts after the empty sources are checked. |
| [1440-gate-open-expanded.png](screenshots/1440-gate-open-expanded.png) | 1440×1000 | Open gate: briefing expanded | The open adapter gate shows its question, briefing summary, discussion, and decision composer. |
| [1440-gate-recorded.png](screenshots/1440-gate-recorded.png) | 1440×1000 | Recorded gate | Recorded: approve and its synthetic reason appear above ordinary discussion, without decision chips. |
| [1440-gate-no-longer-open.png](screenshots/1440-gate-no-longer-open.png) | 1440×1000 | Gate: no longer open | This gate is no longer open appears above ordinary discussion, without decision chips. |
| [1440-comms-question.png](screenshots/1440-comms-question.png) | 1440×1000 | Comms officer: question | The comms officer asks which release window to use beside the decision board. |
| [1440-composer-empty.png](screenshots/1440-composer-empty.png) | 1440×1000 | Composer: empty | The empty comms composer shows its placeholder and inactive send arrow below the question. |
| [1440-composer-typed.png](screenshots/1440-composer-typed.png) | 1440×1000 | Composer: typed | The focused comms composer contains Please use the afternoon release window and an active send arrow; the draft is unsent. |
| [360-board-by-decision.png](screenshots/360-board-by-decision.png) | 360×780 | Board: By decision | The board shows a next review card, another review, two gates, a comms question, and a First Officer question. |
| [360-board-by-fo.png](screenshots/360-board-by-fo.png) | 360×780 | Board: By FO | Review requests and waiting and idle groups appear, with a Tab closed badge on Bridge FO. |
| [360-board-loading.png](screenshots/360-board-loading.png) | 360×780 | Board: loading | Loading… and unchecked counts appear while the synthetic review source has not been checked. |
| [360-board-could-not-check.png](screenshots/360-board-could-not-check.png) | 360×780 | Board: could not check | Could not check reviews — this list may be incomplete appears with question-mark counts. |
| [360-board-empty.png](screenshots/360-board-empty.png) | 360×780 | Board: truly empty | Nothing is waiting on you appears with zero counts after the empty sources are checked. |
| [360-gate-open-expanded.png](screenshots/360-gate-open-expanded.png) | 360×780 | Open gate: briefing expanded | The open adapter gate shows its question, briefing summary, discussion, and decision composer. |
| [360-gate-open-collapsed.png](screenshots/360-gate-open-collapsed.png) | 360×780 | Open gate: briefing collapsed | The compact gate shows a one-line briefing and Show briefing control above the discussion and decision composer. |
| [360-gate-recorded.png](screenshots/360-gate-recorded.png) | 360×780 | Recorded gate | Recorded: approve and its synthetic reason appear above ordinary discussion, without decision chips. |
| [360-gate-no-longer-open.png](screenshots/360-gate-no-longer-open.png) | 360×780 | Gate: no longer open | This gate is no longer open appears above ordinary discussion, without decision chips. |
| [360-comms-question.png](screenshots/360-comms-question.png) | 360×780 | Comms officer: question | The selected Comms officer tab shows a question asking which release window to use. |
| [360-composer-empty.png](screenshots/360-composer-empty.png) | 360×780 | Composer: empty | The empty comms composer shows its placeholder and inactive send arrow below the question. |
| [360-composer-typed.png](screenshots/360-composer-typed.png) | 360×780 | Composer: typed | The focused comms composer contains Please use the afternoon release window and an active send arrow; the draft is unsent. |

## Not captured

| Viewport | State | Reason |
| --- | --- | --- |
| 1440×1000 | Open gate: briefing collapsed | The installed build exposes briefing collapse only in compact mode. The desktop card has a resize grip and no collapse control; `briefingCollapsed` is gated by `layout.compact` in `client/decision-card.tsx`. |

## Isolation and cleanup

The live daemon, live worktree, product branches, pull requests, task entities, and product configuration were not changed. The daemon used its own `--home` and `HOME`; every browser used a fresh profile with `MAP localhost ~NOTFOUND`. All temporary daemon homes and browser profiles were removed after browser closure and captured-PID termination, including failed harness attempts. All 12 started harness sessions passed the final stopped-PID and removed-home check.

| Capture session | Daemon PID | Daemon / fleet ports | Cleanup |
| --- | --- | --- | --- |
| rich-1440-v4 | 42999 | 59384 / 59385 | Stopped; home and fresh browser profile removed |
| empty-1440-v4 | 51338 | 60495 / 60496 | Stopped; home and fresh browser profile removed |
| rich-360-v3 | 33629 | 58416 / 58417 | Stopped; home and fresh browser profile removed |
| empty-360 | 80470 | 53610 / 53611 | Stopped; home and fresh browser profile removed |

Screenshot dimensions, indexed files, source commit, and clean source worktree were checked before committing this evidence folder.
