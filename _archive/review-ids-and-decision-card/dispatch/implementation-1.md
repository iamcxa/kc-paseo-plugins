Dispatched: from 2c60f172e7f35c39396c8b9eab963319326e2d23
Model: sonnet

## Checklist

Review next card and review rows show repo#number with a working ↗ PR link, with an isolated-daemon screenshot of two review requests and a test or stubbed-open check of each URL (AC-1)
The decision card shows label line, question, FO line, summary and Read full briefing with a one-line hint, then a Discussion divider with only the latest message and Show N earlier messages, with a screenshot (AC-2)
The Paseo-style composer keeps ↑/Enter to the FO and holds the decision chips left of ↑, with tests for the three send paths and screenshots empty and typed (AC-3); roborev gate run with its evidence= or incomplete: line, and a Draft PR open

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (SendMessage(to="main", ...)); the completion block below names `team-lead`, but this FO session listens as `main`.

Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <your worktree> --base 2c60f172e7f35c39396c8b9eab963319326e2d23`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.

Design references (hand-made HTML mockups with invented data, not code to copy): /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/review-ids-and-decision-card/design/board-and-card.png — columns 2 (board) and 4 (decision card) are chosen; /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/review-ids-and-decision-card/design/composer.png — the chosen composer, which replaces column 4's bottom part. Build with React Native primitives in the existing styles; keep the existing CoChat composer's look (bordered box, round ↑ inside) and add the decision row inside it.
The decision relay through the comms officer, the reason requirement for 要求修改/暫緩, the claim/release logic and delivery states must not change; the composer tests in AC-3 guard them.

Hard limits:
- Work only in the dispatch worktree. Never switch branch on, or leave dirty, /Users/kent/Project/kc-paseo-plugins (live source of the Captain's installed plugins).
- Never install into, stop, or restart the live Paseo daemon (~/.paseo). Screenshots come from an isolated daemon with its own --home and HOME on a port outside 6767, 6787 and 6860-6935; stop it and delete its home afterwards. Use a browser instance you start yourself; never drive another session's shared browser.
- Never print full Paseo agent command lines or process args (bearer tokens).
- Write any temporary file under a new uniquely named path; never overwrite an existing /tmp file.
- Commit as `feat(spacedock-bridge): ...`; stage files by name; commit hooks run normally. Push and open a Draft PR in iamcxa/kc-paseo-plugins; do not merge; Release PR #18 untouched.
