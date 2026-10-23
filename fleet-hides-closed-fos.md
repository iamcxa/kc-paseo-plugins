---
title: The Fleet board stops listing FOs whose Paseo tab is closed on every device
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
---

FOs the Captain has closed in Paseo still appear on the Fleet board, because closing a conversation closes its tab without archiving the agent, and the board hides only archived agents.

Captain, 2026-10-23: 「已經在 passeo 內關閉的 FO 對話，仍會出現在 fleet 內，該怎麼辦？怎樣偵測才合理？」. He received the proposed detection below in chat and approved the move PR in the next message; the detection itself is not yet approved — this task's backlog gate is where he rules on it.

bite: on 2026-10-23, `mcp__paseo__list_agents` (cwd `~/.local/share/paseo-fo-coordinator`, includeArchived) showed role=fo agents with `archivedAt: null` and status `error` or `idle` whose `paseo.open-agent-tab.<client>` label was `"false"`; the board's `boardStatus` in `shared/board.ts` treats only `archivedAt` or status `closed` as offline, so they stay listed.
consumer: the Captain, reading the Fleet board.

## Scope

- Depends on the move task `spacedock-bridge-plugin` (PR #31): work in `spacedock-bridge/` after it merges.
- Signal: Paseo stores a per-client label `paseo.open-agent-tab.<client-id>` = `"true"`/`"false"` on each agent, and its own app code defines `hasOpenAgentTab(labels)` as "any such label equals true" (seen in the Paseo 0.12.0 app bundle, 2026-10-23). It is not in the plugin SDK documentation, so a Paseo upgrade may rename it.
- Proposed rule (for the Captain's ruling at the backlog gate):
  - Every `paseo.open-agent-tab.*` label is `"false"` and the agent is not running → closed: hidden from the Fleet board.
  - A closed FO that still has a gate, permission or question waiting on the Captain stays visible, in a collapsed "Closed" group.
  - No `paseo.open-agent-tab.*` label at all (never opened, e.g. started by the comms officer) → shown as today.
  - Archived → hidden as today.
- Non-goals: archiving or stopping agents from the board; changing Paseo.

## Acceptance criteria

**AC-1**: The board classifies closed FOs by the rule above.
Verified by: `npm test` in `spacedock-bridge/` with cases for all-false labels, one true label, no labels, running with all-false labels, and closed-with-gate.

**AC-2**: A real closed FO disappears from the Captain's board.
Verified by: the Captain's own check after install, or a screenshot from an isolated daemon with one FO whose tab label is false.

## FO alignment

Alignment: needed at the backlog gate: the rule above is FO-proposed, not yet the Captain's.
Release review: not needed: spacedock-bridge has no journey map yet.
