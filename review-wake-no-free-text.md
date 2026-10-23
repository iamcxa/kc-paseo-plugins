---
title: The review wake message to the comms officer carries no pull-request free text
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
---

The review poller writes each pull request's title and author verbatim into the message that wakes the comms officer, an agent that can create agents and send them prompts, and agents it creates lose its tool restrictions; a title is free text set by whoever opened the pull request.

Captain, 2026-10-23, relayed by Dot: verify current main and the installed version and live exposure, and provide a fix or an evidence-based disposition before release PR #18 ships, within the established approval process. Source finding: https://github.com/iamcxa/kc-paseo-plugins/pull/31#discussion_r4357360508 (automated, posted after the PR #31 merge; the same path was flagged by a push security review and recorded as "Needs decision" in the `spacedock-bridge-plugin` validation report).

bite: verified 2026-10-23 17:0x Asia/Taipei by `git rev-parse origin/main` = 2c60f172e7f3 (shared/reviews.ts, server/reviews.ts, shared/coordinator.ts, index.server.ts unchanged since), `paseo plugin ls` (paseo-spacedock-bridge running from /Users/kent/Project/kc-paseo-plugins/spacedock-bridge at that commit) and `~/.local/share/paseo-fo-coordinator/reviews.json` (poller checked 2.7 minutes earlier, 2 wakes sent): `wakeMessage` interpolates `r.title` and `r.author`; `COORDINATOR_OPTIONS` allows `create_agent` and `send_agent_prompt`; the `before("agent.create")` hook removes `allowedTools` and `settings` from agents the comms officer creates. This is a code-path concern; no exploit was attempted or observed.
consumer: the Captain, whose comms officer receives these wake messages.

## Scope

- `wakeMessage` in `spacedock-bridge/shared/reviews.ts` stops carrying the title and author. Each line carries only `<owner>/<repo>#<number>` and the pull-request URL, and only for items whose owner and repo match `^[A-Za-z0-9._-]+$`, whose number is a positive integer, and whose URL equals `https://github.com/<owner>/<repo>/pull/<number>` rebuilt from those parts; any other item is left out of the wake and logged.
- The routing instruction to the comms officer keeps its meaning; it tells the FO to read the pull request itself.
- The board's display of titles is unchanged (titles are rendered as text, not sent to an agent).
- Non-goals: removing `create_agent` from the comms officer, changing the `before("agent.create")` restriction stripping, or a router outside the prompt. Those are a separate decision for the Captain.

## Acceptance criteria

**AC-1**: No free text from a pull request reaches the wake message.
Verified by: `npm test` in `spacedock-bridge/` with a test that a request whose title and author contain prompt-like text, newlines and quotes produces a wake message containing none of them, and tests that a malformed owner, repo, number or URL is left out.

**AC-2**: Routing still works.
Verified by: a test that a well-formed request produces one line with `<owner>/<repo>#<number>` and its URL, and the existing reviews tests pass.

## FO alignment

Alignment: needed at the backlog gate: the fix shape (drop free text from the wake, leave the comms officer's tools as they are) is FO-proposed.
Release review: not needed: spacedock-bridge has no journey map yet.
