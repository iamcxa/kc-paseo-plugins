import { createHash } from "node:crypto";
import { digestSchema, sourceKey, type ReportSource, type ReplayWindow, type VerifiedDigest } from "../shared/digest";

export type { TimelinePage, TimelineEntry, TimelineReader } from "../shared/timeline";
import { displayEntry as validEntry, entryIsWriting, healthyTimeline, readTimeline, TIMELINE_ENTRY_LIMIT, type TimelineEntry, type TimelineReader, type TimelinePage } from "../shared/timeline";
export const textHash = (text: string): string => createHash("sha256").update(text, "utf8").digest("hex");
export const goodPage = healthyTimeline;
export function reportSource(hostId: string, agentId: string, epoch: string, e: TimelineEntry): ReportSource | null {
  if (!validEntry(e) || e.item.type !== "assistant_message" || !e.item.text.trim()) return null;
  return { hostId, agentId, epoch, seqStart: e.seqStart, seqEnd: e.seqEnd, textHash: textHash(e.item.text), timestamp: e.timestamp };
}
export function readProjectedStart(read: TimelineReader, agentId: string, epoch: string, start: number, limit: number): Promise<TimelinePage> {
  return readTimeline(read, agentId, { direction: "after", ...(start > 0 ? { cursor: { epoch, seq: start - 1 } } : {}), limit }, epoch);
}
export async function readSource(read: TimelineReader, hostId: string, source: ReportSource): Promise<TimelineEntry | null> {
  if (hostId !== source.hostId) return null;
  const page = await readProjectedStart(read, source.agentId, source.epoch, source.seqStart, TIMELINE_ENTRY_LIMIT).catch(() => null);
  if (!page) return null;
  const entry = page.entries.find(e => e.seqStart === source.seqStart && e.seqEnd === source.seqEnd);
  if (!entry || entryIsWriting(page, entry) || !validEntry(entry) || sourceKey(reportSource(hostId, source.agentId, page.epoch, entry) ?? { ...source, textHash: "" }) !== sourceKey(source)) return null;
  return entry;
}
export interface SourceRound { roundId: string; collectedAt: string; hostId: string; agentId: string; sources: ReportSource[]; sourceLabels?: Record<string, string> }
export async function validateDigest(raw: unknown, round: SourceRound, read: TimelineReader): Promise<VerifiedDigest | null> {
  const parsed = digestSchema.safeParse(raw);
  if (!parsed.success || parsed.data.roundId !== round.roundId || parsed.data.collectedAt !== round.collectedAt) return null;
  const members = new Set(round.sources.map(sourceKey));
  const cache = new Map<string, Promise<boolean>>();
  const exact = (s: ReportSource) => {
    const key = sourceKey(s);
    if (!cache.has(key)) cache.set(key, members.has(key) ? readSource(read, round.hostId, s).then(Boolean).catch(() => false) : Promise.resolve(false));
    return cache.get(key)!;
  };
  const points = await Promise.all(parsed.data.points.map(async point => {
    const keys = new Set(point.sources.map(sourceKey));
    const refs = [...point.sources, ...point.contextLines.flatMap(l => l.refs)];
    const valid = point.contextLines.every(l => l.refs.every(s => keys.has(sourceKey(s)))) && (await Promise.all(refs.map(exact))).every(Boolean);
    return valid ? { valid: true as const, point } : { valid: false as const };
  }));
  return { roundId: round.roundId, collectedAt: round.collectedAt, sourceLabels: round.sourceLabels, points };
}
async function side(read: TimelineReader, source: ReportSource, direction: "before" | "after", edge: number) {
  try {
    const page = await readTimeline(read, source.agentId, { direction, cursor: { epoch: source.epoch, seq: edge }, limit: 2 }, source.epoch);
    if (!goodPage(page, source.agentId, source.epoch)) throw new Error("Source changed");
    const entries = [...page.entries].sort((a, b) => a.seqStart - b.seqStart);
    if (entries.some(e => !validEntry(e) || (direction === "before" ? e.seqEnd >= edge : e.seqStart <= edge))) throw new Error("Wrong side");
    const stable = entries.filter(e => !entryIsWriting(page, e));
    if (stable.length !== entries.length) return { entries: stable, state: "unavailable" as const };
    const more = direction === "before" ? page.hasOlder : page.hasNewer;
    if (!entries.length && more) throw new Error("Non advancing page");
    return { entries, state: more ? "more" as const : "end" as const };
  } catch { return { entries: [], state: "unavailable" as const }; }
}
const displayEntry = (e: TimelineEntry) => ({ seqStart: e.seqStart, seqEnd: e.seqEnd, timestamp: e.timestamp, kind: e.item.type, text: "text" in e.item && typeof e.item.text === "string" ? e.item.text : JSON.stringify(e.item) });
export async function replayWindow(read: TimelineReader, hostId: string, source: ReportSource, direction: "anchor" | "before" | "after" = "anchor", edge?: number): Promise<ReplayWindow | null> {
  const anchor = await readSource(read, hostId, source).catch(() => null);
  if (!anchor) return null;
  if (direction !== "anchor") {
    if (edge === undefined || (direction === "before" ? edge > source.seqStart : edge < source.seqEnd)) return null;
    const result = await side(read, source, direction, edge);
    return { source, entries: result.entries.map(displayEntry), older: direction === "before" ? result.state : "end", newer: direction === "after" ? result.state : "end" };
  }
  const before = await side(read, source, "before", source.seqStart);
  const after = await side(read, source, "after", source.seqEnd);
  return { source, entries: [...before.entries, anchor, ...after.entries].map(displayEntry), older: before.state, newer: after.state };
}
