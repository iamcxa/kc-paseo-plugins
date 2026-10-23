Dispatched: from abba4dfb9 head on spacedock-ensign/board-next-decision-first, base cad57e0ce2279c4d88f2eca3283528ae58d19158
Model: sonnet

## Checklist

When the next card's item is a review, the next card shows a second button labelled "PR ↗" beside its primary button, opening the review URL with openExternalUrl; other kinds show no such button (Captain amendment 1)
npm test and npm run typecheck in spacedock-bridge/ pass, with a test or an isolated-daemon screenshot showing the button on a review next card
Roborev gate rerun on the new head with its evidence= or incomplete: line in a new report section, and PR #32 updated

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
Send your completion message to `main`.
Captain amendment 1 (chat, 2026-10-23): 「add the button to the top card」, answering whether to add a GitHub button to the next card; on the label he asked 「能夠偵測是 github or gitlab or 其他的嗎？或是，就顯示 PR↗ or MR↗？」. FO ruling on the label: the review poller reads only `gh search prs` (GitHub), so every review item is a GitHub PR today; label it "PR ↗" with no host detection.
This resolves the roborev Medium finding (roborev:1086) about the removed GitHub button: the decision card stays unchanged; the link lives on the next card only.
Before reporting, commit your changes and run `python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0/extensions/roborev/roborev_gate.py --repo <your worktree> --base cad57e0ce2279c4d88f2eca3283528ae58d19158`. On exit 1 fix the findings inside your scope, commit and run it again, at most twice, and report the rest as findings for FO. Put the printed `evidence=` line, or the `incomplete:` line on exit 3, in the stage report.
Hard limits from implementation-1 still apply: dispatch worktree only; never touch the live Paseo daemon (~/.paseo) or leave /Users/kent/Project/kc-paseo-plugins dirty; isolated daemon outside ports 6767, 6787, 6860-6935; never print agent command lines; Draft PR only, no merge, Release PR #18 untouched.
