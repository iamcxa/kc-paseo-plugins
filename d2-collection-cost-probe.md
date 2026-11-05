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

- Start one isolated Paseo daemon (its own `--home`, a port outside 6767, 6787 and 6860–6935) with no Bridge plugin; the Commander gets the roster from Paseo's own agent list (`list_agents`, labels `role=fo`) instead of `fleet_status`, so no Bridge code runs and nothing of the live Bridge is touched; the missing tasks/gates summary is reported as an approximation.
- Seed a synthetic fleet matching the live roster shape, read by the FO on 2026-11-05 (`paseo ls -g -a --label role=fo`, `paseo logs <id> --filter text --tail 10 | wc -c`): 18 agents labelled `role=fo` — 6 closed, 10 idle with 6–17 KB of recent text each (median about 9 KB), 2 idle and nearly empty. All content fictional; seed with the cheapest available model or without a model where the SDK allows.
- Probe round: one Commander on `claude/claude-opus-5-5` (the live comms officer's provider) runs one collection with a throwaway digest prompt approximating d1-commander-digest's design with the existing tools only: Paseo's agent list for the roster, `get_agent_activity` per FO for report text, then a digest in its own words with three context lines (about / before / now) and a source per line in whatever provisional reference the existing tools allow.
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

## Captain amendments

### Amendment 1 — 2026-11-05, chat
Captain: 「複製一份改了埠的 Bridge 來跑」
Asked: 這次量測沒跑成，代理照規則在動手前停下。原因是 Bridge 的內部服務寫死佔用 6787 埠，那是你正在用的 Bridge 的埠；它還會讀你現有通訊官的連線金鑰檔。所以在獨立副本裡裝 Bridge，一定會跟你現有的 Bridge 撞在一起。下一步要怎麼量？ (options: 「不裝 Bridge 再跑一次 (Recommended)」; 「複製一份改了埠的 Bridge 來跑」 — "在 /tmp 放一份改過埠和金鑰路徑的 Bridge，產品程式不動。量到的路徑最接近正式版，但跑的不是正式那份程式，要多一點準備。"; 「先不量，等寫程式時再量」)
Supersedes: none
Design: "Start one isolated Paseo daemon (its own `--home`, a port outside 6767, 6787 and 6860–6935) with a throwaway copy of the Bridge plugin from `.worktrees/flywheel-live/spacedock-bridge` at 33952f9b3d02fceab104ba09272d65e432a3d095, made under /tmp with only the fleet server's port (a free port outside those ranges) and its token directory (inside the isolated daemon home) changed, so `fleet_status` is available as in production without touching the live Bridge; the product checkout stays unchanged." (## Scope)

Superseded text:

- Start one isolated Paseo daemon (its own `--home`, a port outside 6767, 6787 and 6860–6935) with the Bridge plugin installed from `.worktrees/flywheel-live/spacedock-bridge` at 33952f9b3d02fceab104ba09272d65e432a3d095, so `fleet_status` is available as in production.

### Amendment 2 — 2026-11-05, chat
Captain: 「不裝 Bridge 量 (Recommended)」
Asked: 第二次量測也停了，還是沒有數字。改了埠的複本又碰到一個問題：Bridge 的 PR 審查輪詢會讀寫你現有的 reviews.json，也會去查 GitHub。我自己檢查過，還有 decisions.json、通訊官工作目錄、直接呼叫你現有 Paseo 的指令，全都寫死在你的家目錄。Bridge 本來就是要接你現有的環境，所以一個一個補會補不完。同一個做法已經失敗兩次，我不會再試第三次。接下來怎麼量？ (options: 「不裝 Bridge 量 (Recommended)」 — "獨立副本裡只放指揮官，用 Paseo 內建的代理清單看名冊，再逐個讀 FO 回報。完全不跑 Bridge 的程式，所以不會碰到你現有的檔案。花費大多在讀 FO 回報；少的是 Bridge 的任務／關卡摘要，那部分很小，報告會註明。"; 「先不量，等寫程式時再量」; 「讓複本整個用獨立家目錄」)
Supersedes: none
Design: "Start one isolated Paseo daemon (its own `--home`, a port outside 6767, 6787 and 6860–6935) with no Bridge plugin; the Commander gets the roster from Paseo's own agent list (`list_agents`, labels `role=fo`) instead of `fleet_status`, so no Bridge code runs and nothing of the live Bridge is touched; the missing tasks/gates summary is reported as an approximation." (## Scope); probe round reads "with the existing tools only: Paseo's agent list for the roster," (## Scope)

Superseded text:

- Start one isolated Paseo daemon (its own `--home`, a port outside 6767, 6787 and 6860–6935) with a throwaway copy of the Bridge plugin from `.worktrees/flywheel-live/spacedock-bridge` at 33952f9b3d02fceab104ba09272d65e432a3d095, made under /tmp with only the fleet server's port (a free port outside those ranges) and its token directory (inside the isolated daemon home) changed, so `fleet_status` is available as in production without touching the live Bridge; the product checkout stays unchanged.
(probe round) with the existing tools only: `fleet_status` for the roster,

## FO alignment

Alignment: not needed: the Captain asked for this one measurement on 2026-11-05 (「跑一次」), scoped in the seed.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: none
Visible change: none

### FO notes

- 2026-11-05: followup-2's first turn ended with "Selected model is at capacity" after read-only reads of the Paseo app bundle and before any daemon start (agent activity); FO resumed the same worker once on the same model. No retry loop.

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

## Stage Report: implementation (cycle 2)

- DONE: Captain amendment 1 (task file, ## Captain amendments): copy /Users/kent/Project/kc-paseo-plugins/.worktrees/flywheel-live/spacedock-bridge at 33952f9b3d02fceab104ba09272d65e432a3d095 into a new mktemp directory under /tmp; in the copy only, change the fleet server PORT to a free port outside 6767, 6787 and 6860-6935 and its token directory to a path inside the isolated daemon home; save the exact diff as d2-collection-cost-probe/evidence/copy-diff.patch; the product checkout stays unchanged
  Exported the pinned tracked plugin into a fresh /tmp directory; changed only fleet-mcp.ts PORT and token-directory constants. Exact two-line copy-diff.patch retained; cycle-2/safety.json records free-port checks, hashes and cleanup; product files unchanged.
- FAILED: Start the isolated daemon (own --home, port outside those ranges) with that copy installed; confirm fleet_status answers on the copy's port and record the daemon PID
  Preflight found another forbidden live-file path: index.server.ts:26 auto-starts reviews.ts poller; reviews.ts:11–12,25–36,58–82 reads/writes real-HOME reviews.json after its first 30-second timer and queries real GitHub PRs. Stopped per follow-up before plugin/daemon startup; no fleet_status result or daemon PID exists.
- SKIPPED: Then the original checklist items 2-6 of implementation-1 unchanged: seed the fictional 18-FO fleet; probe round; baseline round; usage by turn id; RESULT.md with probe, baseline and increment (AC-1, AC-2)
  Original items 2–6 were not executed after that explicit stop: no fictional fleet, probe, baseline, usage events or measured increment. RESULT.md reports all values as not measured/unavailable, not zero; planned probe-prompt.md remains unexecuted.
- DONE: Read the live roster count and comms officer status before and after; stop the isolated daemon by captured PID, delete its home and the /tmp copy (AC-3)
  cycle-2/safety.json: live FO count 18 before/after; same idle comms-officer status/provider; exact /tmp copy and planned daemon home deleted and absence checked. No daemon PID was allocated; all three code worktrees clean on original revisions/branches.
- DONE: Recheck the corrected design-surface metadata
  cycle-2/checks.json: design_surfaces.py exit 0 after FO added Surfaces: none and Visible change: none; this resolves only the metadata defect, not collection feasibility.
- SKIPPED: roborev
  roborev not run: a measurement task with no code change and no candidate branch, as the follow-up explicitly records.

### Summary

Prepared and removed the Captain-authorized two-line disposable copy; its exact diff is retained. The unchanged review poller independently reaches the live Bridge review store and can generate unbudgeted activity, so the follow-up stop condition applies before daemon/provider startup; AC-1 and AC-2 still have no measurement. The FO must resolve that additional automatic path before a new dispatch; no broader copy edit, product change, PR, live text access, credential access or model round was performed.

## Stage Report: implementation (cycle 3)

- DONE: Captain amendment 2 (task file, ## Captain amendments): start the isolated daemon (own --home, port outside 6767, 6787 and 6860-6935) with no Bridge plugin and no Bridge code running; record the daemon PID
  cycle-3/runtime.json and isolated-plugins.json: own /tmp home, port 49770, captured PID 83019, plugins disabled/empty and relay disabled; no Bridge module imported or executed.
- DONE: Seed the fictional 18-FO fleet as in implementation-1 item 2 inside that daemon
  fixture.json and seed timelines: 18 role=fo agents, 6 closed, 10 populated idle (6,163–15,772 assistant B; median 9,289 B), 2 empty idle. Sixteen Haiku 4.5 seed turns; six largest histories assigned closed; setup excluded from measurement.
- DONE: Probe round and baseline round as in implementation-1 items 3-4, each on a fresh Commander created directly in the isolated daemon with provider claude/claude-opus-5-5, the pinned COORDINATOR_PROMPT text as its system prompt and the Paseo tools it allows; the roster comes from Paseo's own agent list (labels role=fo), not fleet_status; keep the probe instruction in evidence/probe-prompt.md
  probe-run.json and baseline-run.json: separate fresh Claude Opus 5.5 agents/sessions, exact resolved pinned system prompt and allowed Paseo tools; one requested user message each. No round retry or FO messaging. Cache disabled for both; probe-prompt.md retained.
- DONE: Usage by turn id and RESULT.md with probe, baseline and increment, per-FO scaling, and every approximation (no fleet_status: tasks/gates summary missing) (AC-1, AC-2)
  RESULT.md: probe 336,753 input / 7,397 output, 5 requests, 107.472s; baseline 203,540 / 1,482, 4 requests, 64.852s; cached input 0 both. Events reconcile with deduplicated provider metadata per (agentId, turnId); per-FO files record 18 reads, 216,106 delivered B, one preview-only result and missing Bridge summaries.
- DONE: Read the live roster count and comms officer status before and after; stop the isolated daemon by captured PID and delete its home (AC-3)
  safety.json: live 18 FOs and idle comms officer unchanged; only captured PID stopped, PID gone/port closed and own /tmp home deleted. Removed only new fictional provider transcript/debug artifacts. Three code worktrees clean; no live text, prompt, permission action or credential-file access.
- DONE: Verify saved measurement attribution, byte totals and cleanup
  verify-evidence.py: five checks pass; changing a terminal token counter, duplicating a provider response or dropping an FO/byte total causes failure. Evidence is retained, so verification needs no live provider or daemon.
- DONE: Applicable no-code workflow checks
  cycle-3/checks.json: comment_ratio/doc_impact/number_guards/design_surfaces all exit 0; zero product lines and affected documents, migration guard skipped (no migrations-path), original dispatch code base 6709c7283b0906cbdf8d6155048e198625520e8e unchanged.
- SKIPPED: roborev
  roborev not run: a measurement task with no code change and no candidate branch, as the dispatch explicitly records.

### Summary

Completed one probe and one baseline; the measured increment is 133,213 input tokens, 5,915 output tokens, one provider request and 42.621s. This is a single cache-off, no-Bridge comparison: baseline sees 12 unarchived FOs versus probe coverage of all 18, one long closed history is preview-only, and activity reads load synthetic closed runtimes (restored before baseline); it is not a production frequency or billed-cost prediction. Isolated runtime cleanup and bounded live-state checks passed; no product code, PR, enduring runtime or decision about collection frequency/cap was created.
