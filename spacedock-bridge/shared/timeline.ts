import type { PaseoApi } from "@getpaseo/client";
export type TimelinePage = Awaited<ReturnType<ReturnType<PaseoApi["agents"]["ref"]>["timeline"]["refetch"]>>;
export type TimelineEntry = TimelinePage["entries"][number];
export type TimelineReader = (agentId: string, options: Parameters<ReturnType<PaseoApi["agents"]["ref"]>["timeline"]["refetch"]>[0]) => Promise<TimelinePage>;
export const TIMELINE_ENTRY_LIMIT = 120;
const sequence = (n: number) => Number.isSafeInteger(n) && n >= 0;
export function displayEntry(entry: TimelineEntry): boolean {
  const ranges = entry.sourceSeqRanges;
  return sequence(entry.seqStart) && sequence(entry.seqEnd) && entry.seqEnd >= entry.seqStart &&
    Array.isArray(entry.collapsed) && entry.collapsed.every(k => ["assistant_merge", "reasoning_merge", "tool_lifecycle", "identity"].includes(k)) &&
    Array.isArray(ranges) && ranges.length > 0 && ranges[0].startSeq === entry.seqStart && ranges.at(-1)!.endSeq === entry.seqEnd &&
    ranges.every((r, i) => sequence(r.startSeq) && sequence(r.endSeq) && r.endSeq >= r.startSeq && (i === 0 || r.startSeq > ranges[i - 1].endSeq));
}
export function healthyTimeline(page: TimelinePage, agentId: string, epoch?: string): boolean {
  if (!agentId || page.agentId !== agentId || typeof page.epoch !== "string" || !page.epoch || (epoch && page.epoch !== epoch) ||
    page.projection !== "projected" || page.reset || page.staleCursor || page.gap || page.error || page.entries.length > TIMELINE_ENTRY_LIMIT) return false;
  if (!page.entries.every((e, i) => displayEntry(e) && (i === 0 || e.seqStart > page.entries[i - 1].seqStart))) return false;
  const ranges = page.entries.flatMap(e => e.sourceSeqRanges).sort((a,b) => a.startSeq-b.startSeq);
  if (ranges.some((r,i) => i > 0 && r.startSeq <= ranges[i-1].endSeq)) return false;
  const w = page.window;
  return !w || (sequence(w.minSeq) && Number.isSafeInteger(w.maxSeq) && sequence(w.nextSeq) && w.nextSeq > w.maxSeq &&
    ranges.every(r => r.startSeq >= w.minSeq && r.endSeq <= w.maxSeq));
}
export async function readTimeline(read: TimelineReader, agentId: string, options: Parameters<TimelineReader>[1], epoch?: string): Promise<TimelinePage> {
  const page = await read(agentId, { ...options, projection: "projected" });
  if (!healthyTimeline(page, agentId, epoch)) throw new Error("Timeline unavailable");
  return page;
}
export function entryIsWriting(page: TimelinePage, entry: TimelineEntry): boolean {
  return (page.agent?.status === "running" || page.agent?.status === "initializing") && !page.hasNewer &&
    page.entries.at(-1)?.seqStart === entry.seqStart && entry.item.type === "assistant_message";
}
