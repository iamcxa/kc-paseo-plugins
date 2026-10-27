# Round 7 whole-product walk

Captured on 2026-10-28: **31 PNGs; no requested states not captured**.

Build: `/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge` at `316c9eff7bd6ce2f5e15db7382dea1aba1197a26`.

Desktop: 1440×1000. Phone: 360×780, compact browser layout. All agents, reviews, gates, recorded outcomes and timeline messages are synthetic. All drafts are unsent; the fixture recorded zero message or decision sends. The recorded and no-longer-open gate states come from disposable synthetic files, not an action on a real gate.

Reused the isolated [round 6 capture flow](../round-6/index.md), its [queue harness](../../../r6-queue-you-can-scan/evidence/validation-1/capture-ac1.py), [unlabelled unread question fixture](../../../r6-queue-you-can-scan/evidence/validation-1/capture-question.py) and [source-state fixture](../../../r5-board-tells-the-truth/evidence/validation-2/capture.py). The round 7 [decision harness](../../../r7-one-clear-way-to-decide/evidence/validation-1/capture.py), [composer harness](../../../r7-one-clear-way-to-decide/evidence/validation-1/composer_acceptance.py) and [queue harness](../../../r7-one-clear-way-to-decide/evidence/validation-1/queue_acceptance.py) supplied the separate-control selectors, simulated keyboard boundary and review-source boundary. Adaptations were confined to new disposable harness copies, synthetic data and SDK boundaries, the copied plugin entry wrappers, the copied review RPC boundary and its fleet listener port. The client and shared component files matched the installed build byte for byte.

The desktop board contains two reviews, two gates and both kinds of question. The phone board uses two reviews, one gate and both questions, with shorter synthetic titles so the next card, long wrapping review title, gate and unread question fit together. Bridge FO has unread attention and an assistant reply without `next-owner` or `next` labels; its question remains separate from its gate. Both By FO images include individual waiting rows and the Tab closed badge. Hover images target a regular queue row; its computed background changed from transparent to `rgb(37, 43, 42)` under the pointer.

The phone keyboard images retain the 360×780 viewport and use the existing synthetic native keyboard metrics/events, with a labelled 280-pixel overlay. The actual gate card and composer remain mounted; one screenshot shows the long drafts and the other shows their controls after scrolling. These images do not represent a physical phone keyboard.

## Screenshots

| File | Viewport | State | On screen |
| --- | --- | --- | --- |
| [1440-board-by-decision.png](screenshots/1440-board-by-decision.png) | 1440×1000 | Board: By decision | The next review, another review with repository and number, gates and both comms and unlabelled unread First Officer questions appear, with the unread question separate from its owner’s gate. |
| [1440-board-by-fo.png](screenshots/1440-board-by-fo.png) | 1440×1000 | Board: By FO | Review requests and the waiting group show individual rows, including a Bridge FO with a Tab closed badge and its separate gate and unread question. |
| [1440-queue-row-hover.png](screenshots/1440-queue-row-hover.png) | 1440×1000 | Queue: row hover | The unowned release-handover review row has a visible hover background while its repository reference and separate external link remain visible. |
| [1440-board-loading.png](screenshots/1440-board-loading.png) | 1440×1000 | Board: loading | Loading… appears with unchecked counts while the synthetic review source has not been checked. |
| [1440-board-could-not-check.png](screenshots/1440-board-could-not-check.png) | 1440×1000 | Board: could not check | Could not check the comms officer — this list may be incomplete appears with question-mark counts and Check again · comms officer. |
| [1440-board-empty.png](screenshots/1440-board-empty.png) | 1440×1000 | Board: truly empty | Nothing is waiting on you appears with zero counts after the empty sources have been checked. |
| [1440-gate-open-expanded.png](screenshots/1440-gate-open-expanded.png) | 1440×1000 | Open gate: briefing expanded | The open gate shows its question, expanded synthetic briefing, scoped First Officer discussion and separate message and decision controls. |
| [1440-gate-decision-reason-empty.png](screenshots/1440-gate-decision-reason-empty.png) | 1440×1000 | Open gate: chosen decision, empty reason | 要求修改 is selected and its separate required reason field is empty above Confirm and Cancel, while the officer message field remains separate. |
| [1440-gate-decision-reason-typed.png](screenshots/1440-gate-decision-reason-typed.png) | 1440×1000 | Open gate: chosen decision, typed reason | 要求修改 is selected and its required reason field contains Please confirm the remaining release checks before approval, with Confirm and Cancel visible. |
| [1440-gate-recorded.png](screenshots/1440-gate-recorded.png) | 1440×1000 | Gate: recorded | Recorded: approve and Synthetic recorded approval appear above ordinary officer discussion and its message composer, without decision controls. |
| [1440-gate-no-longer-open.png](screenshots/1440-gate-no-longer-open.png) | 1440×1000 | Gate: no longer open | This gate is no longer open appears above ordinary officer discussion and its message composer, without decision controls. |
| [1440-comms-question.png](screenshots/1440-comms-question.png) | 1440×1000 | Comms officer: question | The comms chat asks which release window to use above its empty message composer. |
| [1440-composer-empty.png](screenshots/1440-composer-empty.png) | 1440×1000 | Composer: empty | The comms composer shows its placeholder and inactive send arrow below the release-window question. |
| [1440-composer-typed.png](screenshots/1440-composer-typed.png) | 1440×1000 | Composer: typed | The comms composer contains Please use the afternoon release window and an active send arrow; the draft is unsent. |
| [360-board-by-decision.png](screenshots/360-board-by-decision.png) | 360×780 | Board: By decision | The next review, another review with repository and number, gates and both comms and unlabelled unread First Officer questions appear, with the unread question separate from its owner’s gate. |
| [360-board-by-fo.png](screenshots/360-board-by-fo.png) | 360×780 | Board: By FO | Review requests and the waiting group show individual rows, including a Bridge FO with a Tab closed badge and its separate gate and unread question. |
| [360-queue-row-hover.png](screenshots/360-queue-row-hover.png) | 360×780 | Queue: row hover | The unowned release-handover review row has a visible hover background while its repository reference and separate external link remain visible. |
| [360-board-loading.png](screenshots/360-board-loading.png) | 360×780 | Board: loading | Loading… appears with unchecked counts while the synthetic review source has not been checked. |
| [360-board-could-not-check.png](screenshots/360-board-could-not-check.png) | 360×780 | Board: could not check | Could not check the comms officer — this list may be incomplete appears with question-mark counts and Check again · comms officer. |
| [360-board-empty.png](screenshots/360-board-empty.png) | 360×780 | Board: truly empty | Nothing is waiting on you appears with zero counts after the empty sources have been checked. |
| [360-gate-open-expanded.png](screenshots/360-gate-open-expanded.png) | 360×780 | Open gate: briefing expanded | The open gate shows its question, expanded synthetic briefing, scoped First Officer discussion and separate message and decision controls. |
| [360-gate-open-collapsed.png](screenshots/360-gate-open-collapsed.png) | 360×780 | Open gate: briefing collapsed | The compact gate shows its question and Show briefing control above the scoped discussion and composer. |
| [360-gate-decision-reason-empty.png](screenshots/360-gate-decision-reason-empty.png) | 360×780 | Open gate: chosen decision, empty reason | 要求修改 is selected and its separate required reason field is empty above Confirm and Cancel, while the officer message field remains separate. |
| [360-gate-decision-reason-typed.png](screenshots/360-gate-decision-reason-typed.png) | 360×780 | Open gate: chosen decision, typed reason | 要求修改 is selected and its required reason field contains Please confirm the remaining release checks before approval, with Confirm and Cancel visible. |
| [360-gate-recorded.png](screenshots/360-gate-recorded.png) | 360×780 | Gate: recorded | Recorded: approve and Synthetic recorded approval appear above ordinary officer discussion and its message composer, without decision controls. |
| [360-gate-no-longer-open.png](screenshots/360-gate-no-longer-open.png) | 360×780 | Gate: no longer open | This gate is no longer open appears above ordinary officer discussion and its message composer, without decision controls. |
| [360-comms-question.png](screenshots/360-comms-question.png) | 360×780 | Comms officer: question | The comms chat asks which release window to use above its empty message composer. |
| [360-composer-empty.png](screenshots/360-composer-empty.png) | 360×780 | Composer: empty | The comms composer shows its placeholder and inactive send arrow below the release-window question. |
| [360-composer-typed.png](screenshots/360-composer-typed.png) | 360×780 | Composer: typed | The comms composer contains Please use the afternoon release window and an active send arrow; the draft is unsent. |
| [360-gate-composer-keyboard-long-drafts.png](screenshots/360-gate-composer-keyboard-long-drafts.png) | 360×780 | Phone gate composer: keyboard and long drafts | The gate briefing is collapsed above separate long message and reason drafts, with a labelled simulated 280-pixel keyboard occupying the bottom of the viewport. |
| [360-gate-composer-keyboard-long-drafts-controls.png](screenshots/360-gate-composer-keyboard-long-drafts-controls.png) | 360×780 | Phone gate composer: long-draft controls scrolled into view | The composer is scrolled to show the separate reason field and Confirm and Cancel above the simulated 280-pixel keyboard while the long message draft remains present. |

## Not captured

None of the requested states. Briefing collapse was requested only on phone and is captured there; the installed build exposes it only in compact layout.

## Isolation and cleanup

Captures ran one at a time. The live Paseo daemon, `~/.paseo`, installed source worktree, product branches, pull requests, task entities and product configuration were not changed. Every daemon had its own `--home` and `HOME`, and every browser had a fresh profile with `MAP localhost ~NOTFOUND`. All daemon and fleet ports were outside 6767, 6787 and 6860–6935. Every captured daemon PID was verified stopped, and its isolated home and browser profile were removed before the next capture. One initial sandbox port-bind attempt started no daemon.

| Capture session | Daemon PID | Daemon / fleet ports | Cleanup |
| --- | --- | --- | --- |
| desktop-v2 | 58475 | 61790 / 61791 | PID stopped; isolated home and browser profile removed |
| phone-v1 | 60266 | 61897 / 61898 | PID stopped; isolated home and browser profile removed |
| phone-boards-v2 | 67917 | 62202 / 62203 | PID stopped; isolated home and browser profile removed |
| desktop-boards-v3 | 74938 | 62326 / 62327 | PID stopped; isolated home and browser profile removed |
| phone-boards-v3 | 77801 | 62431 / 62432 | PID stopped; isolated home and browser profile removed |

All 31 indexed PNGs have the stated viewport dimensions. The installed source commit and clean source worktree were rechecked. Only this index and its screenshots are included in the walk folder.
