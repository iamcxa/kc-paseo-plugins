---
title: Probe — measure one Commander digest collection (tokens and time) on an isolated daemon
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d2-collection-cost-probe
status: implementation
gates:
    version: 1
    records:
        - id: gate:d2-collection-cost-probe:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d2-collection-cost-probe-backlog-1
              briefing:
                id: briefing:d2-collection-cost-probe:backlog:attempt-1:revision-1
                digest: sha256:b63bc967cd5b7a5ac922c295a07ef076c659ac170f1256763def368223d4b498
                room-ref: ./d2-collection-cost-probe/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d2-collection-cost-probe:backlog:1
                briefing: briefing:d2-collection-cost-probe:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T13:17:14.638668Z"
                decision: approve
                reason: Captain chat 2026-11-05, asked "May I run that one cost-measuring test? It only measures and doesn't build the feature.", answered 「跑一次」.
              application:
                target-stage: implementation
                state: consumed
started: 2026-11-05T13:19:14Z
worktree: .worktrees/spacedock-ensign-d2-collection-cost-probe
---

Measure, once, what one Commander digest collection costs in model tokens and wall time, so the Captain can set the collection frequency and a cost cap before any code.

Captain, 2026-11-05: after approving the d1-commander-digest design (「照這個方向可以」), asked "The question for you now: may I run that one cost-measuring test? It only measures and doesn't build the feature." (the plan stated just before: "one test run on a separate Paseo copy that doesn't touch your live setup, to see how many tokens and how long one collection takes"), he answered 「跑一次」.

bite: d1-commander-digest leaves frequency and cost cap to the Captain, and its EVIDENCE.md states no token, money or wait time was measured; he cannot set a cap without a number.
consumer: the Captain's next decision — collection frequency and cost cap.

## Scope

- Start one isolated Paseo daemon (its own `--home`, a port outside 6767, 6787 and 6860–6935) with the Bridge plugin installed from `.worktrees/flywheel-live/spacedock-bridge` at 33952f9b3d02fceab104ba09272d65e432a3d095, so `fleet_status` is available as in production.
- Seed a synthetic fleet matching the live roster shape, read by the FO on 2026-11-05 (`paseo ls -g -a --label role=fo`, `paseo logs <id> --filter text --tail 10 | wc -c`): 18 agents labelled `role=fo` — 6 closed, 10 idle with 6–17 KB of recent text each (median about 9 KB), 2 idle and nearly empty. All content fictional; seed with the cheapest available model or without a model where the SDK allows.
- Probe round: one Commander on `claude/claude-opus-5-5` (the live comms officer's provider) runs one collection with a throwaway digest prompt approximating d1-commander-digest's design with the existing tools only: `fleet_status` for the roster, `get_agent_activity` per FO for report text, then a digest in its own words with three context lines (about / before / now) and a source per line in whatever provisional reference the existing tools allow.
- Baseline round: the current `COORDINATOR_PROMPT`, same roster, one "what is the fleet's status?" turn.
- Per round, attributed by turn id, never by account delta: input, cached-input and output tokens; provider request count; wall time; per-FO bytes read and pages. Check whether `usage_updated` is cumulative before summing.
- Write `d2-collection-cost-probe/evidence/RESULT.md` (numbers, method, approximations) and keep the probe prompt there.
Non-goals: any Bridge product change (no `shared/coordinator.ts`, `fleetSnapshot` or Replay edit, no branch or PR); the real digest prompt; measuring Replay opens or expands; scheduling; touching the live daemon or the live comms officer beyond read-only listing; real conversation text in any file.
Budget: one isolated daemon session, one probe round and one baseline round; at most one retry of a round that failed for an environment reason.
Stop condition: the probe cannot approximate the collection without product code, or the Commander provider cannot authenticate on the isolated daemon without copying credentials — stop and report which, with no workaround.

## Acceptance criteria

**AC-1**: One probe collection's cost is reported as tokens (input, cached, output) and wall time, with per-FO bytes so it scales.
Verified by: RESULT.md table from usage attributed by turn id; dollars, if shown, labelled imputed (`totalCostUsd` from the claude provider is not a billed amount).

**AC-2**: The increment over today's Commander is shown.
Verified by: the baseline round on the same roster in the same table.

**AC-3**: Nothing outside the isolated daemon changed.
Verified by: live roster count and live comms officer status read before and after are equal; the isolated home is deleted and its PID gone.

## FO alignment

Alignment: not needed: the Captain asked for this one measurement on 2026-11-05 (「跑一次」), scoped in the seed.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- FAILED: Start one isolated Paseo daemon with its own --home on a port outside 6767, 6787 and 6860-6935; install the Bridge plugin from /Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge (read-only, at 33952f9b3d02fceab104ba09272d65e432a3d095) so the Commander has fleet_status as in production; capture the daemon PID
  Preflight source inspection found fleet-mcp.ts:12,107,130 fixed to forbidden 6787 and the real-HOME token path at :13,25–32; no daemon/plugin was started. See d2-collection-cost-probe/evidence/RESULT.md and source-identity.json.
- SKIPPED: Seed a fictional fleet shaped like the live one: 18 agents labelled role=fo — 6 closed, 10 idle each holding 6-17 KB of recent assistant text (median about 9 KB), 2 idle and nearly empty; cheapest available model; record the bytes each FO actually holds
  Not seeded after the isolation stop condition; no actual per-FO byte measurements or synthetic agents exist.
- SKIPPED: Probe round: a fresh Commander (provider claude/claude-opus-5-5, the live comms officer's provider and system prompt) receives one user message with a throwaway digest instruction approximating d1-commander-digest/design/DIGEST.md with existing tools only (fleet_status for the roster, get_agent_activity per FO for text, then a digest in its own words with about/before/now context lines and a provisional source per line); keep that instruction in d2-collection-cost-probe/evidence/probe-prompt.md
  Planned fictional-only instruction saved in d2-collection-cost-probe/evidence/probe-prompt.md, marked NOT EXECUTED; no Commander or provider call was made.
- SKIPPED: Baseline round: a second fresh Commander, same roster, one user message "What is the fleet's status?"
  Not run after the isolation stop condition; no Commander or provider call was made.
- SKIPPED: For each round, attributed by turn id (never by account totals): input, cached-input and output tokens, provider request count, wall time, and per-FO bytes and pages read; first establish whether usage_updated is cumulative or per-turn
  No usage events, turn IDs, token totals, request counts, elapsed-round time or pages exist; cumulative/per-turn semantics are unestablished. No account totals were queried.
- DONE: Write d2-collection-cost-probe/evidence/RESULT.md: one table (probe, baseline, increment), per-FO scaling, the method, and every approximation versus the d1 design (AC-1, AC-2)
  RESULT.md records a probe/baseline/increment table as not measured, unavailable scaling, the precise stopping method and all planned approximations; AC-1 and AC-2 remain unmet, not zero.
- DONE: Read the live roster count (paseo ls -g -a --label role=fo --json | jq length) and the live comms officer status (label role=comms-officer) before and after; stop the isolated daemon by its captured PID and delete its home (AC-3)
  safety.json: live count 18 before and after, same idle comms officer/provider, three code trees clean; daemon/home never allocated, so PID cleanup was not exercised. No live text, prompts, permissions or credentials read or changed.
- FAILED: design_surfaces.py check on the dispatched task
  Exit 1: FO alignment has no Surfaces: or Visible change: line. Recorded in evidence/checks.json; approved task specification was not amended.
- DONE: Applicable no-code workflow checks
  checks.json: comment_ratio exit 0 (0 code/comment lines); doc_impact exit 0 (0 affected documents); number_guards exit 0 (migration guard skipped: no migrations-path); source hashes and clean code worktrees rechecked.
- SKIPPED: roborev
  roborev not run: a measurement task with no code change and no candidate branch, as the FO dispatch explicitly records.

### Summary

Stopped before daemon or model execution because the pinned Bridge requires prohibited port 6787, and real HOME would also access the coordinator token path. No code, branch, PR, persistent runtime seam or model round was created; report evidence is the only deliverable, and there is no measured collection cost. The FO must resolve the isolation conflict and missing task metadata before a new dispatch; this report grants no product repair or additional-round authority.
