---
title: Flywheel candidate — one polled-source hook replaces the board's hand-built poll and stale-response rules
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
id: flywheel-polled-source-hook
---

Candidate theme for a later flywheel round under ADR 0008, filed by the FO from chief-engineer triage of round 5; not admitted until a backlog gate records it.

bite: round 5 (r5-board-tells-the-truth, PR #49) took five repair cycles; roborev 1158, 1160, 1169 and half of 1168 were each a different copy of one per-source poll pattern — `useEffect` + `setInterval(60_000)` with its own late-response rule in `client/board.tsx` (tasks, gates, reviews), `client/use-co-ask.ts` and `client/decision-card.tsx`, plus a separate cache/in-flight/slot layer in `server/tasks.ts` (chief-engineer, 2026-10-25).
consumer: the Captain (the board stops flickering "Loading…" each minute and cannot get stuck loading); the FO (later load-state changes stop regressing).

## Scope

- One client hook `usePolledSource(key, fetch, intervalMs)` returning `{ data, state, failed }`, implementing once: skip a tick while a request is in flight; stay loaded while refreshing a key that already has a result; drop a response only when the key changes or the component unmounts; clear a failure on the next success. The four client consumers move onto it; `boardEmptyState` is unchanged.
- Closes roborev:1169 (declined in round 5) and the per-minute "Loading…" flicker.
- Non-goals: server cache redesign beyond what the hook needs, retry or backoff, persisted state.

## Acceptance criteria

**AC-1**: The four sources share one poll rule.
Verified by: tests of the hook for in-flight skip, refresh-without-flicker, stale-drop only on key change or unmount, and failure clearing; the board, co-ask and decision-card polls use it.

## FO alignment

Alignment: needed at the backlog gate: this theme is FO- and chief-engineer-proposed; the Captain picks themes in UAT.
Release review: not needed: spacedock-bridge has no journey map yet.
