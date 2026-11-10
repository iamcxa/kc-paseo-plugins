import { parseEnvelope } from "./preview";
import { healthyTimeline, readTimeline, TIMELINE_ENTRY_LIMIT, type TimelinePage, type TimelineEntry, type TimelineReader } from "./timeline";
import { AUTOMATED_MARKER } from "./reviews";
import { batchRequest, batchResponseId, focusSchema, eventSchema, eventVersion, type ChiefBatch, type ChiefEvent, type ChiefFocus } from "./chief";

export const COMMANDER_ENTRY_LIMIT = TIMELINE_ENTRY_LIMIT;
export type CommanderReply = Pick<TimelineEntry, "seqStart" | "seqEnd" | "timestamp" | "item" | "turnId"> & {
  provenance: "ordinary" | "automated" | "unknown";
  batchId: string | null; responseId: string | null; focus: ChiefFocus | null;
};
function preparedBy(item: TimelineEntry["item"], batch: ChiefBatch): boolean {
  if (item.type !== "tool_call" || !["prepare_batch", "mcp__fleet__prepare_batch"].includes(item.name) || item.status !== "completed" || item.error || item.detail?.type !== "unknown") return false;
  try {
    const input = item.detail.input as { batchId?: string };
    let output = item.detail.output as any;
    if (typeof output === "string") output = JSON.parse(output);
    if (output?.isError) return false;
    if (output && typeof output === "object" && "output" in output && !("batchId" in output)) output = output.output;
    if (typeof output === "string") output = JSON.parse(output);
    if (output?.isError) return false;
    if (output?.content?.length === 1 && output.content[0].type === "text") output = JSON.parse(output.content[0].text);
    return !output?.isError && input?.batchId === batch.id && output?.batchId === batch.id && typeof output.preparation === "string" && Boolean(output.preparation.trim()) && JSON.stringify(eventSchema.array().parse(output.facts)) === JSON.stringify(batch.events);
  } catch { return false; }
}
type WaitingContext = { events: readonly ChiefEvent[]; complete: boolean };
function interpret(entries: readonly TimelineEntry[], waiting?: WaitingContext) {
  let provenance: CommanderReply["provenance"] = "unknown";
  let current: ChiefBatch | null = null;
  let prepared = false, preparationCalls = 0;
  const replies: CommanderReply[] = [], attempts = new Map<string, ChiefBatch>();
  const unresolved = new Map<string, { batch: ChiefBatch; focus: ChiefFocus }>();
  const responses = new Set<string>(), uncertain = new Set<string>(), failed = new Set<string>();
  const outstanding = new Map<string, ChiefEvent>(), answeredVersions = new Set<string>();
  const currentVersions = waiting?.complete ? new Set(waiting.events.map(eventVersion)) : null;
  const remains = (event: ChiefEvent) => !answeredVersions.has(eventVersion(event)) && (!currentVersions || currentVersions.has(eventVersion(event)));
  const remaining = (batch: ChiefBatch) => batch.events.filter(remains);
  const covers = (next: ChiefBatch, prior: ChiefBatch) => remaining(prior).every(old => next.events.some(event => event.key === old.key));
  const batchTurns = new Map<string, string>(), turnBatches = new Map<string, string>();
  const peerTurns = new Set<string>();
  const invalidate = (id: string, failure: boolean) => {
    unresolved.delete(id);
    if (failure) { failed.add(id); uncertain.delete(id); } else if (!failed.has(id)) uncertain.add(id);
  };
  const bindTurn = (id: string, turnId?: string) => {
    if (!turnId) return true;
    if (batchTurns.has(id) && batchTurns.get(id) !== turnId || turnBatches.has(turnId) && turnBatches.get(turnId) !== id) {
      invalidate(id, false); return false;
    }
    batchTurns.set(id, turnId); turnBatches.set(turnId, id); return true;
  };
  for (const entry of entries) {
    const item = entry.item;
    const text = "text" in item ? item.text : "";
    if ((item.type === "assistant_message" || item.type === "user_message") && typeof text !== "string") throw new Error("Chief message unavailable");
    let responseId: string | null = null, focus: ChiefFocus | null = null;
    const peer = item.type === "user_message" && parseEnvelope(item.text) || item.type === "tool_call" && item.agentMessage;
    if (peer && entry.turnId && !turnBatches.has(entry.turnId)) peerTurns.add(entry.turnId);
    if (peer || entry.turnId && peerTurns.has(entry.turnId)) {
      replies.push({ ...entry, item: { ...item }, provenance: "automated", batchId: null, responseId: null, focus: null });
      continue;
    }
    if (item.type === "user_message" && !parseEnvelope(item.text)) {
      current = batchRequest(item.text);
      provenance = item.text.startsWith(AUTOMATED_MARKER) ? "automated" : "ordinary";
      prepared = false; preparationCalls = 0;
      if (current) {
        attempts.set(current.id, current); bindTurn(current.id, entry.turnId);
        if (current.outputMode === "list") for (const event of current.events) if (!answeredVersions.has(eventVersion(event))) outstanding.set(event.key, event);
      }
      else if (provenance === "ordinary") {
        const candidate = batchResponseId(item.text);
        const latest = [...unresolved.values()].at(-1)?.batch;
        responseId = candidate && attempts.has(candidate) ? candidate
          : !item.text.startsWith("[Bridge batch response:") && latest?.outputMode === "list" ? latest.id : null;
        if (responseId) {
          const answered = attempts.get(responseId)!;
          if (answered.outputMode === "list") for (const event of answered.events) {
              answeredVersions.add(eventVersion(event));
              if (outstanding.has(event.key) && eventVersion(outstanding.get(event.key)!) === eventVersion(event)) outstanding.delete(event.key);
          }
          for (const attempt of attempts.values()) if (attempt.id === responseId || answered.outputMode === "list" && attempt.outputMode === "list" && !remaining(attempt).length) {
            responses.add(attempt.id); unresolved.delete(attempt.id); uncertain.delete(attempt.id);
          }
        }
      }
    } else if (item.type === "error") {
      const attributed = entry.turnId ? turnBatches.get(entry.turnId) : undefined;
      const contextual = current && (!entry.turnId || !batchTurns.has(current.id)) ? current.id : undefined;
      if (attributed || contextual) invalidate((attributed || contextual)!, true);
    } else if (current && item.type === "tool_call") {
      if (["prepare_batch", "mcp__fleet__prepare_batch"].includes(item.name)) {
        if (!bindTurn(current.id, entry.turnId)) prepared = false;
        else if (++preparationCalls > 1 || item.status === "failed" || item.status === "canceled") { prepared = false; invalidate(current.id, true); }
        else {
          prepared = preparedBy(item, current);
          if (!prepared) invalidate(current.id, false);
        }
      }
    } else if (current && item.type === "assistant_message" && !responses.has(current.id) && !failed.has(current.id)) {
      let candidate: ChiefFocus | null = null;
      try { candidate = focusSchema.parse(JSON.parse(item.text)); } catch {
        if (current.outputMode === "list" && prepared && item.text.trim() && current.events.length) candidate = {
          batchId: current.id, targetKey: current.events[0].key, sentence: current.events[0].title.slice(0, 800),
        };
      }
      if (candidate?.batchId === current.id && current.events.some(event => event.key === candidate!.targetKey)) {
        if (bindTurn(current.id, entry.turnId) && prepared && !uncertain.has(current.id)) {
          focus = candidate;
          unresolved.set(current.id, { batch: current, focus });
        } else invalidate(current.id, false);
      }
    }
    replies.push({ ...entry, item: { ...item }, provenance, batchId: current?.id ?? null, responseId, focus: current?.outputMode === "list" ? null : focus });
  }
  return { replies: replies.map(reply => reply.batchId && (failed.has(reply.batchId) || uncertain.has(reply.batchId)) ? { ...reply, focus: null } : reply), attempts: [...attempts.values()], unresolved: [...unresolved.values()].filter((value, index, all) => value.batch.outputMode !== "list" || remaining(value.batch).length && !all.slice(index + 1).some(next => next.batch.outputMode === "list" && covers(next.batch, value.batch))), outstanding: [...outstanding.values()].filter(remains), responses, uncertain, failed };
}
export function commanderReplies(page: TimelinePage, agentId: string, epoch?: string): CommanderReply[] | null {
  if (!healthyTimeline(page, agentId, epoch)) return null;
  try { return interpret(page.entries).replies; } catch { return null; }
}
export async function readCommanderConversation(read: TimelineReader, agentId: string, waiting?: WaitingContext) {
  const entries: TimelineEntry[] = [];
  let cursor: { epoch: string; seq: number } | undefined;
  for (let pages = 0; pages < 100; pages++) {
    const page = await readTimeline(read, agentId, { direction: cursor ? "before" : "tail", cursor, limit: COMMANDER_ENTRY_LIMIT }, cursor?.epoch);
    if (cursor && (page.entries.at(-1)?.seqEnd ?? cursor.seq) >= cursor.seq) throw new Error("Chief history did not advance");
    entries.unshift(...page.entries);
    if (!page.hasOlder) return { ...interpret(entries, waiting), coverage: "complete" as const };
    const first = page.entries[0]?.seqStart;
    if (first === undefined) throw new Error("Chief history unavailable");
    cursor = { epoch: page.epoch, seq: first };
  }
  return { ...interpret(entries, waiting), coverage: "older-unavailable" as const };
}
