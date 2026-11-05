# Commander collection cost probe — cycle 2 stopped before startup

Outcome: no cost measurement. Captain amendment 1 authorized a disposable copy with only the fleet server port and token directory changed. That copy was prepared and removed, but preflight found another automatic live-file access in its unchanged review poller. The follow-up explicitly requires stopping if anything else in the copy reaches the live Bridge files or ports. No daemon, plugin, synthetic agent, probe round or baseline round was started.

## Requested comparison (AC-1 and AC-2 remain unmet)

| Round | Input tokens | Cached-input tokens | Output tokens | Provider requests | Wall time | Per-FO bytes / pages |
| --- | --- | --- | --- | --- | --- | --- |
| Probe | not measured | not measured | not measured | not measured | not measured | not read |
| Baseline | not measured | not measured | not measured | not measured | not measured | not read |
| Increment | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable |

Missing measurements are not zero. Per-FO scaling is unavailable: the requested fictional 18-FO fleet (6 closed, 10 idle with 6–17 KB each, 2 nearly empty) was not seeded. No provider authentication was attempted, no turn IDs or usage events exist, cumulative/per-turn usage semantics remain unestablished, and no account totals or dollars were reported. The one-probe/one-baseline budget and round-retry allowance remain unused. These results cannot set a collection frequency or cost cap.

## What was prepared

Pinned source: `.worktrees/flywheel-live/spacedock-bridge` at `33952f9b3d02fceab104ba09272d65e432a3d095`. Exported tracked plugin files into a new mktemp directory under /tmp, without product-checkout edits. In `server/fleet-mcp.ts`, changed only the PORT constant and HOME token-directory constant, with the latter inside the planned isolated daemon home. Both planned ports were free when checked and outside 6767, 6787 and 6860–6935; they were not reserved for a daemon. `copy-diff.patch` is the exact two-line patch. `cycle-2/safety.json` records paths, ports, source hashes, changed-file verification and deletion.

## Additional stopping evidence

At the pinned source and in the copy, `index.server.ts:26` calls `startReviewPoller(rememberedPaseo)` without a configuration guard. `server/reviews.ts:11–12` independently defines HOME as `homedir()/.local/share/paseo-fo-coordinator` and FILE as its `reviews.json`; it does not use the amended fleet token-directory constant. Its `load` and `save` functions read that file and write/rename it, and `checkReviews` runs `gh search prs --review-requested=@me` before saving success or error. The poller schedules its first check after 30 seconds and later checks every five minutes. If new review requests are found, it can also call ensureCoordinator and send a wake message. Thus the two allowed edits do not isolate this automatically active third path; it could access real review data and generate unbudgeted Commander activity.

No review store, token or credential was opened. The poller was not executed to demonstrate the violation, because doing so would itself cross the explicit boundary. No additional product edits, timer interception, poller bypass or alternate home arrangement was introduced. Other homedir references were found in server/coordinator.ts and server/decisions.ts, but their handlers were not invoked; the unconditional review-poller path alone establishes this stop. A daemon --home does not redirect this plugin's explicit os.homedir-based store.

## Planned method and approximations

`probe-prompt.md` remains the planned, NOT EXECUTED fictional-only collection prompt. The probe would use fleet_status and get_agent_activity, then synthesize about/before/now lines with provisional FO/entry-position/timestamp sources. The baseline would use a separate fresh Commander, the pinned COORDINATOR_PROMPT and claude/claude-opus-5-5, with one message: `What is the fleet's status?` No inherited Commander conversation would be reused.

Relative to d1-commander-digest/design/DIGEST.md: recent activity summaries and provisional references approximate exact per-line source links; synthetic text volumes/status counts approximate the fleet, not real project complexity or historical causality; context would be returned in a response, with no rendered Replay, source navigation or expansion. The two-line disposable patch would also differ from the installed production bytes. Provider cache isolation, paging/summary losses and usage semantics were not exercised. None of these plans or approximations produced a model result.

## Safety and cleanup (AC-3)

`cycle-2/safety.json` records 18 live FOs before and after and an unchanged idle comms officer/provider. Only the permitted count/status fields were retained; no live conversation text, prompts, permissions, command lines or credentials were collected. The exact mktemp root, including the plugin copy and planned daemon-home directory, was deleted and its absence checked. No daemon PID existed, so stopping a running daemon and answering fleet_status were not exercised. Main, the pinned plugin checkout and the unused dispatch worktree remained clean on their original revisions/branches.

FO-added Surfaces: none and Visible change: none resolve the previous task-metadata check; `cycle-2/checks.json` records the rerun. The earlier stopped attempt and evidence remain in git at `a74499c315cc62dd59073c7925c048192502d65d`; this file is the latest outcome. roborev not run: a measurement task with no code change and no candidate branch.

Next action belongs to the FO: resolve the newly identified automatic review-poller access before another measurement dispatch. This report authorizes no extra source edit, runtime bypass, provider call or additional model round.
