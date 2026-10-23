# Bridge hover and ownership proof

Candidate: the code commit containing this folder, based on `f849058121e61120d91e460bedca081c71a1aaea`.

These are screenshots of the real plugin in a separate Paseo 0.12.0 daemon, with synthetic agents, reviews and gate data. They prove rendering and local interactions, not live agent delivery, gate recording, deployment or Captain acceptance. No message or decision was sent.

## Observed

- `board-normal.png`: both gate rows and the separate OMP question show `OMP FO`; the unmatched review says `no FO`.
- `row-hover.png` / `row-pressed.png`: the gate row changes from transparent to the theme border background on hover, then to surface2 with opacity 0.65 while held down. Wait 250 ms for React Native's press delay before capturing.
- `composer-hover.png` / `composer-focused.png`: the composer border changes from border (`rgb(37, 43, 42)`) to foregroundMuted (`rgb(161, 165, 164)`) on hover and accent (`rgb(32, 116, 74)`) on focus.
- `decision-colors.png`: 准 uses statusSuccess, 要求修改 uses statusWarning, 暫緩 uses foregroundMuted; the last two retain dashed borders without a reason.
- `decision-with-reason.png`: typing a reason makes those borders solid without sending it.
- `observed-states.json`: browser-computed backgrounds, opacity and chip borders, including cancelled presses on 11 board/chat controls and five decision controls.

The regression test `a captain question survives alongside the same FO's gate` fails against the base queue: the actual result contains only the gate. The candidate yields the gate plus the separate question. The second added test prevents a blank label or an exact restatement of a gate title/slug from creating a duplicate question, and preserves a longer question mentioning that title.

## Reproduce safely

Prerequisites: Node/npm, Python 3, the Paseo 0.12.0 CLI and its matching web UI distribution, and agent-browser 0.32.0 with Chromium installed. Run `npm ci` in `spacedock-bridge` first. All tools are local; no provider credentials are required.

Use `capture.py` in this folder; pass the absolute task worktree, CLI executables and matching web distribution. For example, on the proof machine:

```sh
python3 docs/evidence/r1-hover-and-row-owner/capture.py \
  --worktree "$PWD" \
  --paseo /Users/kent/.local/bin/paseo \
  --browser /Users/kent/.npm-global/bin/agent-browser \
  --web-dist /Applications/Paseo.app/Contents/Resources/app-dist
```

The script creates a uniquely named temporary directory under that worktree. It runs the daemon with a fresh HOME and --home at 127.0.0.1:7041, with relay disabled. A temporary plugin copy changes only the fleet listener from 6787 to 7042. Both ports are checked before launch; no live daemon is installed into, stopped or restarted. Test-only `spacedock` and `gh` executables return the synthetic fixtures. The fresh browser profile blocks localhost DNS so the app's automatic localhost:6767 probe cannot add the live daemon.

The script stops its captured daemon PID and browser session and removes the temporary directory. Screenshots and measured state JSON remain here. Remove this proof fixture when these acceptance screenshots are superseded by the product's maintained UI tests; it is not production infrastructure.
