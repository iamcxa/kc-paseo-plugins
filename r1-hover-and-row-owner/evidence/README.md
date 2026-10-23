# Bridge hover and ownership proof

Captured against `c3c818e27146ac13e66a91f1a9241cfa55ea1c40`, based on `f849058121e61120d91e460bedca081c71a1aaea`. The follow-up changes evidence placement only; client/shared bytes are unchanged.

These are screenshots of the real plugin in a separate Paseo 0.12.0 daemon, with synthetic agents, reviews and gate data. They prove rendering and local interactions, not live agent delivery, gate recording, deployment or Captain acceptance. No message or decision was sent.

## Observed

- `board-normal.png`: both gate rows and the separate OMP question show `OMP FO`; the unmatched review says `no FO`.
- `row-hover.png` / `row-pressed.png`: the gate row changes from transparent to the theme border background on hover, then to surface2 with opacity 0.65 while held down. Wait 250 ms for React Native's press delay before capturing.
- `composer-hover.png` / `composer-focused.png`: the composer border changes from border (`rgb(37, 43, 42)`) to foregroundMuted (`rgb(161, 165, 164)`) on hover and accent (`rgb(32, 116, 74)`) on focus.
- `decision-colors.png`: 准 uses statusSuccess, 要求修改 uses statusWarning, 暫緩 uses foregroundMuted; the last two retain dashed borders without a reason.
- `decision-with-reason.png`: typing a reason makes those borders solid without sending it.
- `observed-states.json`: browser-computed backgrounds, opacity and chip borders, including cancelled presses on 11 board/chat controls and five decision controls.

The regression test `a captain question survives alongside the same FO's gate` fails against the base queue: the actual result contains only the gate. The candidate yields the gate plus the separate question. The second added test prevents a blank label or an exact restatement of a gate title/slug from creating a duplicate question, and preserves a longer question mentioning that title.

## Follow-up disposition

The FO moved this per-task evidence from PR #37 into task state. The screenshots and observed-states.json are byte-identical to the captured artifacts. The temporary capture.py was dropped because no test consumes it; it is not shipped product or maintained test infrastructure.

The proof used an isolated Paseo 0.12.0 daemon with its own HOME and --home on ports 7043/7044, a fresh agent-browser 0.32.0 profile blocking localhost, and synthetic agents, reviews and gates. All 16 held presses were cancelled outside their targets. The captured daemon/browser stopped and the isolated HOME/profile were removed after the run. No live daemon or external decision was changed.
