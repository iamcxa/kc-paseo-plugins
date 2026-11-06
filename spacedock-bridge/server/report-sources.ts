import { createHash } from "node:crypto";
import type { PaseoApi } from "@getpaseo/client";
import { digestSchema, sourceKey, type ReportSource, type ReplayWindow, type VerifiedDigest } from "../shared/digest";

export type TimelinePage = Awaited<ReturnType<ReturnType<PaseoApi["agents"]["ref"]>["timeline"]["refetch"]>>;
export type TimelineEntry = TimelinePage["entries"][number];
export type TimelineReader = (agentId: string, options: Parameters<ReturnType<PaseoApi["agents"]["ref"]>["timeline"]["refetch"]>[0]) => Promise<TimelinePage>;
export const textHash = (text: string): string => createHash("sha256").update(text, "utf8").digest("hex");
export function goodPage(page: TimelinePage, agentId: string, epoch?: string): boolean {
  return page.agentId === agentId && (!epoch || page.epoch === epoch) && Boolean(page.epoch) &&
    !page.reset && !page.staleCursor && !page.gap && !page.error && page.projection === "canonical";
}
function canonical(e: TimelineEntry): boolean {
  return e.seqStart === e.seqEnd && e.collapsed.length === 0 && e.sourceSeqRanges.length === 1 &&
    e.sourceSeqRanges[0].startSeq === e.seqStart && e.sourceSeqRanges[0].endSeq === e.seqEnd;
}
export function reportSource(hostId: string, agentId: string, epoch: string, e: TimelineEntry): ReportSource | null {
  if (!canonical(e) || e.item.type !== "assistant_message" || !e.item.text.trim()) return null;
  return { hostId, agentId, epoch, seqStart: e.seqStart, seqEnd: e.seqEnd, textHash: textHash(e.item.text), timestamp: e.timestamp };
}
export function readCanonicalStart(read: TimelineReader, agentId: string, epoch: string, start: number, limit: number): Promise<TimelinePage> {
  return read(agentId, { projection: "canonical", direction: "after", ...(start > 0 ? { cursor: { epoch, seq: start - 1 } } : {}), limit });
}
export async function readSource(read: TimelineReader, hostId: string, source: ReportSource): Promise<TimelineEntry | null> {
  if (hostId !== source.hostId) return null;
  const page = await readCanonicalStart(read, source.agentId, source.epoch, source.seqStart, 1);
  if (!goodPage(page, source.agentId, source.epoch)) return null;
  const entry = page.entries[0];
  if (!entry || !canonical(entry) || sourceKey(reportSource(hostId, source.agentId, page.epoch, entry) ?? { ...source, textHash: "" }) !== sourceKey(source)) return null;
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
    const page = await read(source.agentId, { projection: "canonical", direction, cursor: { epoch: source.epoch, seq: edge }, limit: 2 });
    if (!goodPage(page, source.agentId, source.epoch)) throw new Error("Source changed");
    const entries = [...page.entries].sort((a, b) => a.seqStart - b.seqStart);
    if (entries.some(e => !canonical(e) || (direction === "before" ? e.seqEnd >= edge : e.seqStart <= edge))) throw new Error("Wrong side");
    const sequence = direction === "before" ? [...entries.map(e => e.seqStart), edge] : [edge, ...entries.map(e => e.seqStart)];
    if (sequence.some((s, i) => i > 0 && s !== sequence[i - 1] + 1)) throw new Error("Missing entry");
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
