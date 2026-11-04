import { usePaseo, useRpc } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { attachGates, observeBoard, ROLE_COORDINATOR, withReplies, type BoardRow, type ReplyFact } from "../shared/board";
import { type SourceState, type SourceStates } from "../shared/board-empty";
import { readDecision } from "../shared/decisions";
import { readGates } from "../shared/tasks";
import { buildQueue } from "../shared/queue";
import { useCoAsk } from "./use-co-ask";

const listeners = new WeakMap<object, Set<() => void>>();
export function invalidateWaiting(host: object) {
  listeners.get(host)?.forEach(refresh => refresh());
}

export function useWaiting() {
  const paseo = usePaseo();
  const callGates = useRpc(readGates);
  const callDecision = useRpc(readDecision);
  const [fleet, setFleet] = useState<{ rows: BoardRow[]; replies: Record<string, ReplyFact>; state: SourceState }>({ rows: [], replies: {}, state: "loading" });
  const [co, setCo] = useState<{ id: string; state: SourceState }>({ id: "", state: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let release: (() => void) | undefined;
    setFleet(old => ({ ...old, state: "loading" }));
    const failed = () => { if (active) setFleet(old => ({ ...old, state: "failed" })); };
    void observeBoard(paseo, (rows, replies, state) => { if (active) setFleet({ rows, replies, state }); }, failed)
      .then(stop => { if (active) release = stop; else stop(); }, failed);
    return () => { active = false; release?.(); };
  }, [paseo, attempt]);

  useEffect(() => {
    let active = true;
    let release: (() => void) | undefined;
    setCo({ id: "", state: "loading" });
    const failed = () => { if (active) setCo({ id: "", state: "failed" }); };
    void paseo.agents.list({ filter: { labels: { role: ROLE_COORDINATOR } }, subscribe: {} }).then(({ subscription }) => {
      if (!active) { void subscription.release(); return; }
      const known = new Map<string, string>();
      const emit = () => { if (active) setCo({ id: known.keys().next().value ?? "", state: "loaded" }); };
      subscription.subscribe({
        error: failed,
        snapshot: ({ entries }) => { known.clear(); entries.forEach(({ agent }) => known.set(agent.id, agent.id)); emit(); },
        update: message => {
          if (message.type !== "agent_update") return;
          const update = message.payload;
          if (update.kind === "upsert") known.set(update.agent.id, update.agent.id);
          else known.delete(update.agentId);
          emit();
        },
      });
      release = () => { void subscription.release(); };
    }, failed);
    return () => { active = false; release?.(); };
  }, [paseo, attempt]);

  const question = useCoAsk(co.id);
  const workflowKey = [...new Set(fleet.rows.map(row => row.workflowDir).filter(Boolean))].sort().join("\n");
  const [result, setResult] = useState<{ key: string; gates: Parameters<typeof attachGates>[1]; claimed: Set<string>; state: SourceState; failed: string[] }>({ key: "", gates: [], claimed: new Set(), state: "loading", failed: [] });
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setResult(old => old.key === workflowKey
      ? { ...old, state: "loading" }
      : { key: workflowKey, gates: [], claimed: new Set(), state: "loading", failed: [] });
    try {
      const data = workflowKey ? await callGates({ workflowDirs: workflowKey.split("\n") }) : { gates: [], failedWorkflowDirs: [] };
      const claimed = new Set<string>();
      await Promise.all(data.gates.map(async gate => {
        if (gate.briefingId && (await callDecision({ briefingId: gate.briefingId })).record) claimed.add(gate.briefingId);
      }));
      if (request === generation.current) setResult({ key: workflowKey, gates: data.gates, claimed, state: data.failedWorkflowDirs.length ? "failed" : "loaded", failed: data.failedWorkflowDirs });
    } catch {
      if (request === generation.current) setResult(old => ({ ...old, state: "failed" }));
    }
  }, [workflowKey, callGates, callDecision]);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    const changes = listeners.get(paseo) ?? new Set();
    const changed = () => { setAttempt(value => value + 1); question.retry(); void refresh(); };
    changes.add(changed); listeners.set(paseo, changes);
    return () => { ++generation.current; clearInterval(timer); changes.delete(changed); };
  }, [paseo, refresh, question.retry]);

  const sources: SourceStates = { fos: fleet.state, gates: result.key === workflowKey ? result.state : "loading", reviews: "loaded", comms: co.state !== "loaded" ? co.state : co.id ? question.state : "loaded" };
  const rows = withReplies(fleet.rows, fleet.replies);
  const gates = result.key === workflowKey ? result.gates : [];
  const items = buildQueue(attachGates(rows, gates), [], rows, fleet.replies);
  if (co.id && question.ask) items.push({ key: "comms", kind: "ask", title: question.ask, detail: "Commander", since: question.since ?? "", fo: null });
  const progress = Object.fromEntries(items.map(item => [item.key, { sent: Boolean(item.gate?.briefingId && result.claimed.has(item.gate.briefingId)) }]));
  return { items, progress, sources, failed: result.failed, retry: () => invalidateWaiting(paseo) };
}
