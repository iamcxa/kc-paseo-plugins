Dispatched: from cad57e0ce2279c4d88f2eca3283528ae58d19158
Model: sonnet

## Checklist

The By decision view renders the chosen layout: a larger next card on top for the first buildQueue item, the rest as one-line rows grouped under Comms officer / Reviews / Gates / Questions with counts and the wait time on the right, with a screenshot from an isolated Paseo daemon (AC-1)
npm test in spacedock-bridge/ passes, with a new test that the next card is the first buildQueue item and the remaining rows keep its order inside each section (AC-2)
Roborev gate run on the committed candidate with its evidence= or incomplete: line in the report, and a Draft PR open

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main` (SendMessage(to="main", ...)); the completion block below names `team-lead`, but this FO session listens as `main`.

Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <your worktree> --base cad57e0ce2279c4d88f2eca3283528ae58d19158`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.

Design reference: the Captain chose the third column ("Alternative: Next up + one-line rows") of the mockup at /tmp/bridge-density-preview/index.html (screenshot /tmp/bridge-density-preview/preview2.png). It is a hand-made HTML mockup with invented data, not code to copy; build it with React Native primitives in the existing board.tsx styles. Leave out its "Skip" button.

Hard limits:
- Work only in the dispatch worktree. Never switch branch on, or leave dirty, /Users/kent/Project/kc-paseo-plugins (it is the live source of the Captain's installed project-env and spacedock-bridge plugins).
- Never install into, stop, or restart the live Paseo daemon (~/.paseo); it runs paseo-spacedock-bridge, which holds port 6787. For the AC-1 screenshot use an isolated daemon with its own --home and HOME on a port outside 6767, 6787 and 6860-6935, and stop it and delete its home afterwards; the fleet MCP EADDRINUSE on 6787 there is expected. If you cannot get a screenshot of the plugin screen from the isolated daemon, report AC-1 as not run with the reason; do not touch the live daemon to get one.
- Never print full Paseo agent command lines or process args (bearer tokens).
- Commit as `feat(spacedock-bridge): ...`; stage files by name; commit hooks run normally. Push and open a Draft PR in iamcxa/kc-paseo-plugins; do not merge; do not touch Release PR #18.
