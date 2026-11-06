import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";
import { AUTOMATED_MARKER } from "./reviews";

export const BATCH_MARKER = `${AUTOMATED_MARKER}\nChief batch: `;
export const RESPONSE_MARKER = "[Bridge batch response: ";
export const eventSchema = z.object({
  key: z.string(), version: z.string(), kind: z.enum(["gate", "permission", "ask", "review"]),
  title: z.string(), waiter: z.string().nullable().optional(), since: z.string(), agentId: z.string().nullable(), target: z.string(),
});
export type ChiefEvent = z.infer<typeof eventSchema>;
export const batchSchema = z.object({ id: z.string(), events: z.array(eventSchema), reason: z.enum(["threshold", "exception"]), checkedAt: z.string(), score: z.number() });
export type ChiefBatch = z.infer<typeof batchSchema>;
export const focusSchema = z.object({ batchId: z.string(), targetKey: z.string(), sentence: z.string().min(1).max(800) });
export type ChiefFocus = z.infer<typeof focusSchema>;
export const chiefStateSchema = z.object({
  agentId: z.string().nullable(), total: z.string(), phase: z.enum(["quiet", "preparing", "calling", "unknown", "failed"]),
  batch: batchSchema.nullable(), focus: focusSchema.nullable(), entered: z.boolean(), soundAttempted: z.boolean(), error: z.string().nullable(),
});
export type ChiefState = z.infer<typeof chiefStateSchema>;
export const readChief = defineRpc({ name: "chief.read", input: z.object({}), output: chiefStateSchema });
export const markChief = defineRpc({ name: "chief.mark", input: z.object({ batchId: z.string(), action: z.enum(["entered", "sound"]) }), output: z.object({ accepted: z.boolean() }) });
export const eventVersion = (event: ChiefEvent) => JSON.stringify([event.key, event.version]);
export function eligibleBatch(events: readonly ChiefEvent[], now: number, complete = true) {
  const unique = [...new Map(events.map(event => [event.key, event])).values()]
    .filter(event => Number.isFinite(Date.parse(event.since)) && Date.parse(event.since) <= now)
    .sort((a, b) => a.since.localeCompare(b.since) || a.key.localeCompare(b.key));
  const factor = unique.filter(event => now - Date.parse(event.since) <= 300_000).length >= 3 ? 1.5 : 1;
  const weights = { gate: 4, permission: 4, ask: 3, review: 2 };
  const score = unique.reduce((total, event) => total + weights[event.kind], 0) * factor;
  const exception = unique.find(event => ["gate", "permission"].includes(event.kind) && now - Date.parse(event.since) > 1_800_000);
  if (exception) return { events: [exception], reason: "exception" as const, score: weights[exception.kind] };
  return complete && unique.length >= 4 && now - Date.parse(unique[0].since) >= 300_000 && score > 8
    ? { events: unique, reason: "threshold" as const, score } : null;
}

export class BatchTracker {
  private baseline: Map<string, string> | null = null;
  private pending = new Map<string, ChiefEvent>();
  private consumed = new Set<string>();
  consume(events: readonly ChiefEvent[]) { events.forEach(event => { this.consumed.add(eventVersion(event)); this.pending.delete(event.key); }); }
  reset() { this.baseline = null; this.pending.clear(); }
  observe(events: readonly ChiefEvent[], now: number, complete: boolean) {
    const current = new Map(events.map(event => [event.key, event]));
    if (!this.baseline) { this.baseline = new Map(events.map(event => [event.key, event.version])); return null; }
    for (const [key, event] of current) {
      if (this.baseline.get(key) !== event.version && !this.consumed.has(eventVersion(event))) this.pending.set(key, event);
    }
    for (const key of this.pending.keys()) if (!current.has(key)) this.pending.delete(key);
    this.baseline = new Map(events.map(event => [event.key, event.version]));
    return eligibleBatch([...this.pending.values()], now, complete);
  }
}

export function batchRequest(text: string): ChiefBatch | null {
  if (!text.startsWith(BATCH_MARKER)) return null;
  try { return batchSchema.parse(JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0])); } catch { return null; }
}
export const batchResponse = (id: string, text: string) => `${RESPONSE_MARKER}${id}]\n${text}`;
