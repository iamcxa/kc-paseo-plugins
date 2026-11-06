import { parseEnvelope } from "./preview";
import { healthyTimeline, readTimeline, TIMELINE_ENTRY_LIMIT, type TimelinePage, type TimelineEntry, type TimelineReader } from "./timeline";
import { AUTOMATED_MARKER } from "./reviews";
import { batchRequest, batchResponseId, focusSchema, eventSchema, type ChiefBatch, type ChiefFocus } from "./chief";

export const COMMANDER_ENTRY_LIMIT = TIMELINE_ENTRY_LIMIT;
export type CommanderReply = Pick<TimelineEntry, "seqStart" | "seqEnd" | "timestamp" | "item"> & {
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
    if (output?.content?.length === 1 && output.content[0].type === "text") output = JSON.parse(output.content[0].text);
    return input?.batchId === batch.id && output?.batchId === batch.id && typeof output.preparation === "string" && Boolean(output.preparation.trim()) && JSON.stringify(eventSchema.array().parse(output.facts)) === JSON.stringify(batch.events);
  } catch { return false; }
}
function interpret(entries: readonly TimelineEntry[], livePreparedBatchId?: string) {
  let provenance: CommanderReply["provenance"] = "unknown";
  let current: ChiefBatch | null = null;
  let prepared = false, preparationCalls = 0;
  const replies: CommanderReply[] = [], attempts = new Map<string, ChiefBatch>();
  const unresolved = new Map<string, { batch: ChiefBatch; focus: ChiefFocus }>();
  const responses = new Set<string>(), uncertain = new Set<string>();
  for (const entry of entries) {
    const item = entry.item;
    const text = "text" in item ? item.text : "";
    if ((item.type === "assistant_message" || item.type === "user_message") && typeof text !== "string") throw new Error("Chief message unavailable");
    let responseId: string | null = null, focus: ChiefFocus | null = null;
    if (item.type === "user_message" && !parseEnvelope(item.text)) {
      current = batchRequest(item.text);
      provenance = item.text.startsWith(AUTOMATED_MARKER) ? "automated" : "ordinary";
      prepared = Boolean(current && current.id === livePreparedBatchId); preparationCalls = 0;
      if (current) attempts.set(current.id, current);
      else if (provenance === "ordinary") {
        const candidate = batchResponseId(item.text);
        responseId = candidate && attempts.has(candidate) ? candidate : null;
        if (responseId) { responses.add(responseId); unresolved.delete(responseId); uncertain.delete(responseId); }
      }
    } else if (current && item.type === "tool_call") {
      if (["prepare_batch", "mcp__fleet__prepare_batch"].includes(item.name)) prepared = ++preparationCalls === 1 && preparedBy(item, current);
    } else if (current && item.type === "assistant_message" && !responses.has(current.id)) {
      try {
        const candidate = focusSchema.parse(JSON.parse(item.text));
        if (candidate.batchId === current.id && current.events.some(event => event.key === candidate.targetKey)) {
          if (prepared) { focus = candidate; unresolved.set(current.id, { batch: current, focus }); uncertain.delete(current.id); }
          else uncertain.add(current.id);
        }
      } catch {}
    }
    replies.push({ ...entry, item: { ...item }, provenance, batchId: current?.id ?? null, responseId, focus });
  }
  return { replies, attempts: [...attempts.values()], unresolved: [...unresolved.values()], responses, uncertain };
}
export function commanderReplies(page: TimelinePage, agentId: string, epoch?: string): CommanderReply[] | null {
  if (!healthyTimeline(page, agentId, epoch)) return null;
  try { return interpret(page.entries).replies; } catch { return null; }
}
export async function readCommanderConversation(read: TimelineReader, agentId: string, livePreparedBatchId?: string) {
  const entries: TimelineEntry[] = [];
  let cursor: { epoch: string; seq: number } | undefined;
  for (let pages = 0; pages < 100; pages++) {
    const page = await readTimeline(read, agentId, { direction: cursor ? "before" : "tail", cursor, limit: COMMANDER_ENTRY_LIMIT }, cursor?.epoch);
    if (cursor && (page.entries.at(-1)?.seqEnd ?? cursor.seq) >= cursor.seq) throw new Error("Chief history did not advance");
    entries.unshift(...page.entries);
    if (!page.hasOlder) return interpret(entries, livePreparedBatchId);
    const first = page.entries[0]?.seqStart;
    if (first === undefined) throw new Error("Chief history unavailable");
    cursor = { epoch: page.epoch, seq: first };
  }
  throw new Error("Chief history could not be confirmed");
}
