# Commander collection cost probe — stopped before execution

Outcome: blocked by the specified unmodified Bridge build's isolation boundary. No daemon or model round was started; no token cost, latency or increment was measured. This is not an authentication failure: provider authentication was not attempted.

## Requested comparison

| Round | Input tokens | Cached input tokens | Output tokens | Provider requests | Wall time | FO text bytes / pages |
| --- | --- | --- | --- | --- | --- | --- |
| Probe | not measured | not measured | not measured | not measured | not measured | not read |
| Baseline | not measured | not measured | not measured | not measured | not measured | not read |
| Increment | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable |

A missing measurement is not zero. No imputed or billed dollar amount is reported. Per-FO scaling is unavailable because no fictional fleet was seeded and no activity pages were fetched. The supplied target shape was 18 FOs: 6 closed, 10 idle holding 6–17 KB each (median about 9 KB), and 2 idle nearly empty; these are dispatch inputs, not measured fixture bytes.

## Exact stopping evidence

Read-only checkout: `.worktrees/flywheel-live`, HEAD `33952f9b3d02fceab104ba09272d65e432a3d095`, clean before and after inspection. File hashes are in `source-identity.json`.

- `spacedock-bridge/server/fleet-mcp.ts:12` sets `const PORT = 6787` with no option or environment override. Lines 106–107 call `token()` before creating the server; lines 128–132 bind `127.0.0.1:6787` and publish that same port.
- `server/fleet-mcp.ts:13,25–32` derives `fleet-token` from `os.homedir()/.local/share/paseo-fo-coordinator`, then reads it or creates it. With the real HOME retained for Claude authentication, starting this plugin would access the real coordinator token path. No token or credential file was opened by this probe.
- `index.server.ts:20–24` unconditionally starts that fleet server during plugin contribution. Lines 54–64 inject it only after startup succeeds; failure returns without the fleet server. A daemon `--home` selects daemon storage, but this source does not consult it for its fleet port or token path.

The dispatch explicitly excludes 6787 and forbids product-code edits. A different daemon port alone cannot move this second listener. An isolated HOME alone would not fix its fixed port. Starting a Commander after fleet startup fails would omit the required production fleet_status tool and would not measure the assigned path. No product patch, alternate fleet implementation, interception, credential copying or connection to the live fleet endpoint was attempted. The recorded stop condition therefore applies: the required collection cannot be approximated with this unchanged plugin through its supported configuration while retaining the assigned isolation boundaries.

## Method and evidence limits

Inspected the exact pinned plugin's startup path before installing it, preventing prohibited port/token access. The two measurement rounds and their one-retry allowance remain unused. `probe-prompt.md` preserves the planned fictional-only instruction, explicitly not executed. The baseline's planned one-message input was `What is the fleet's status?`; both planned Commanders would have used the pinned COORDINATOR_PROMPT and claude/claude-opus-5-5.

Usage-event semantics (usage_updated and turn_completed.usage, cumulative versus per-turn), turn IDs and provider-request attribution remain unestablished. No events were summed and no account usage endpoint was queried. AC-1 (probe cost) and AC-2 (baseline increment) are not satisfied. A frequency or cost cap cannot be derived from this report.

## Approximations versus the digest design

The planned prompt used get_agent_activity's existing recent-entry summaries and provisional FO/entry-position/timestamp references rather than the design's exact immutable per-line source links. It requested about/before/now context in one response, not a rendered Replay; opening, expanding and navigating Replay were excluded. A synthetic fleet would approximate live status counts and text volume, not real projects, workflow gates, content complexity or historical causality. Fresh Commanders would avoid inherited conversation context, but provider cache isolation and usage semantics were not exercised. None of these approximations was executed.

## Safety and cleanup (AC-3)

`safety.json` records only allowed live roster count and comms-officer status/provider, before and after the stopped probe. No live text, prompts, agent command lines, permission contents or credentials were collected. No daemon PID or home was allocated, so there was nothing to kill or delete; cleanup of a running isolated daemon was not exercised. Main, the pinned plugin checkout and the unused dispatch worktree stayed on their initial revisions and clean; only this task's state evidence/report changed. No product branch, product commit or PR was created.

Next action belongs to the FO: resolve the conflict between the pinned plugin's fixed port and the approved isolation boundary before any new measurement dispatch. This report neither authorizes a plugin repair nor spends another model round.
