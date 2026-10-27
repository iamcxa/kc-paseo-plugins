# Round 6 whole-product walk

Captured on 2026-10-27: **23 PNGs; 1 requested viewport/state unavailable**.

Build: `/Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge` at `f10a3f29a43fb09adff4beda268799f514f7b43b`.

Desktop: 1440×1000. Phone: 360×780, compact browser layout. All agents, reviews, gates and timeline messages are synthetic; no message or decision was sent.

Reused the [queue capture harness](../../../r6-queue-you-can-scan/evidence/validation-1/capture-ac1.py), the [unlabelled unread question fixture](../../../r6-queue-you-can-scan/evidence/validation-1/capture-question.py), the [comms failure fixture](../../../r6-queue-you-can-scan/evidence/validation-1/capture-runtime.py), and the [source-state capture flow](../../../r5-board-tells-the-truth/evidence/validation-2/capture.py) referenced by the [round 5 walk](../round-5/index.md). The [earlier phone harness](../../../r4-phone-layout/evidence/cycle-4/capture.py) supplied the briefing and closed-tab fixture shape. Adaptations were made only in a new disposable folder: synthetic SDK timeline/list boundaries, synthetic local data, screenshot steps, and the copied server’s fleet listener port. Client and shared component files matched the installed source byte for byte.

The desktop board fixture contains two reviews, two gates, a comms question and an unread First Officer question. The phone board fixture contains two reviews, one gate and the same two kinds of question, so the gate and unread question both fit within 360×780. Long titles remain in both fixtures. Bridge FO has unread attention and an assistant reply, with no `next-owner` or `next` labels; its question remains a separate row beside its gate. The second gate is used separately for the closed-card capture.

## Screenshots

| File | Viewport | State | On screen |
| --- | --- | --- | --- |
| [1440-board-by-decision.png](screenshots/1440-board-by-decision.png) | 1440×1000 | Board: By decision | A next review card, another review, gates and comms and First Officer questions appear, with the unread question separate from its owner’s gate. |
| [1440-board-by-fo.png](screenshots/1440-board-by-fo.png) | 1440×1000 | Board: By FO | Review requests and waiting and idle groups appear, with individual waiting rows and a Tab closed badge on Bridge FO. |
| [1440-board-loading.png](screenshots/1440-board-loading.png) | 1440×1000 | Board: loading | Loading… appears with unchecked counts while the synthetic review source has not been checked. |
| [1440-board-could-not-check.png](screenshots/1440-board-could-not-check.png) | 1440×1000 | Board: could not check | Could not check the comms officer — this list may be incomplete appears with question-mark counts and Check again · comms officer. |
| [1440-board-empty.png](screenshots/1440-board-empty.png) | 1440×1000 | Board: truly empty | Nothing is waiting on you appears with zero counts after all empty sources have been checked. |
| [1440-gate-open-expanded.png](screenshots/1440-gate-open-expanded.png) | 1440×1000 | Open gate: briefing expanded | The open gate shows its question, expanded synthetic briefing, First Officer discussion and decision composer. |
| [1440-gate-recorded.png](screenshots/1440-gate-recorded.png) | 1440×1000 | Recorded gate | Recorded: approve and Synthetic recorded approval appear above ordinary discussion, without decision controls. |
| [1440-gate-no-longer-open.png](screenshots/1440-gate-no-longer-open.png) | 1440×1000 | Gate: no longer open | This gate is no longer open appears above ordinary discussion, without decision controls. |
| [1440-comms-question.png](screenshots/1440-comms-question.png) | 1440×1000 | Comms officer: question | The desktop comms chat asks which release window to use beside the decision board. |
| [1440-composer-empty.png](screenshots/1440-composer-empty.png) | 1440×1000 | Composer: empty | The comms composer shows its placeholder and inactive send arrow below the release-window question. |
| [1440-composer-typed.png](screenshots/1440-composer-typed.png) | 1440×1000 | Composer: typed | The focused comms composer contains Please use the afternoon release window and an active send arrow; the draft is unsent. |
| [360-board-by-decision.png](screenshots/360-board-by-decision.png) | 360×780 | Board: By decision | A next review card, another review, a gate and both comms and First Officer questions fit on screen, with the unread question separate from its owner’s gate. |
| [360-board-by-fo.png](screenshots/360-board-by-fo.png) | 360×780 | Board: By FO | Review requests and waiting and idle groups appear, with individual waiting rows and a Tab closed badge on Bridge FO. |
| [360-board-loading.png](screenshots/360-board-loading.png) | 360×780 | Board: loading | Loading… appears with unchecked counts while the synthetic review source has not been checked. |
| [360-board-could-not-check.png](screenshots/360-board-could-not-check.png) | 360×780 | Board: could not check | Could not check the comms officer — this list may be incomplete appears with question-mark counts and Check again · comms officer. |
| [360-board-empty.png](screenshots/360-board-empty.png) | 360×780 | Board: truly empty | Nothing is waiting on you appears with zero counts after all empty sources have been checked. |
| [360-gate-open-expanded.png](screenshots/360-gate-open-expanded.png) | 360×780 | Open gate: briefing expanded | The open gate shows its question, expanded synthetic briefing, First Officer discussion and decision composer. |
| [360-gate-open-collapsed.png](screenshots/360-gate-open-collapsed.png) | 360×780 | Open gate: briefing collapsed | The compact gate shows a one-line briefing and Show briefing control above discussion and the decision composer. |
| [360-gate-recorded.png](screenshots/360-gate-recorded.png) | 360×780 | Recorded gate | Recorded: approve and Synthetic recorded approval appear above ordinary discussion, without decision controls. |
| [360-gate-no-longer-open.png](screenshots/360-gate-no-longer-open.png) | 360×780 | Gate: no longer open | This gate is no longer open appears above ordinary discussion, without decision controls. |
| [360-comms-question.png](screenshots/360-comms-question.png) | 360×780 | Comms officer: question | The comms officer asks which release window to use, with the Comms officer tab selected on phone. |
| [360-composer-empty.png](screenshots/360-composer-empty.png) | 360×780 | Composer: empty | The comms composer shows its placeholder and inactive send arrow below the release-window question. |
| [360-composer-typed.png](screenshots/360-composer-typed.png) | 360×780 | Composer: typed | The focused comms composer contains Please use the afternoon release window and an active send arrow; the draft is unsent. |

## Not captured

| Viewport | State | Reason |
| --- | --- | --- |
| 1440×1000 | Open gate: briefing collapsed | The installed build exposes collapse only in compact mode: `briefingCollapsed = layout.compact && (collapsed || keyboardHeight > 0)` in `client/decision-card.tsx`. The desktop screenshot shows a resize grip and no collapse control; the phone expanded and collapsed states were both captured. |

## Isolation and cleanup

Captures ran one at a time. The live daemon, `~/.paseo`, product code, branches, pull requests, task entities and product configuration were not changed. Each isolated daemon used its own `--home` and `HOME`; every browser used a fresh profile with `MAP localhost ~NOTFOUND`. Each captured daemon PID was stopped before its isolated home and browser profile were deleted. All eight started capture sessions, including incomplete attempts, passed the final stopped-PID and removed-home checks. An earlier sandbox port-bind attempt started no daemon.

| Capture session | Daemon PID | Daemon / fleet ports | Cleanup |
| --- | --- | --- | --- |
| empty-1440-v1 | 19775 | 49384 / 49385 | PID stopped; isolated home and fresh browser profile removed |
| empty-1440-v2 | 56260 | 51080 / 51081 | PID stopped; isolated home and fresh browser profile removed |
| empty-360-v1 | 64175 | 62406 / 62407 | PID stopped; isolated home and fresh browser profile removed |
| empty-360-v2 | 90170 | 63495 / 63496 | PID stopped; isolated home and fresh browser profile removed |
| empty-360-v3 | 80271 | 52742 / 52743 | PID stopped; isolated home and fresh browser profile removed |
| rich-1440-v2 | 28044 | 60639 / 60640 | PID stopped; isolated home and fresh browser profile removed |
| rich-360-v1 | 46191 | 61391 / 61392 | PID stopped; isolated home and fresh browser profile removed |
| rich-360-v2 | 16339 | 65274 / 65275 | PID stopped; isolated home and fresh browser profile removed |

All 23 indexed PNGs have the stated viewport dimensions. Source commit, clean source worktree, source file hashes and evidence-only output scope were checked before committing.
