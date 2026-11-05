import type { PaseoApi } from "@getpaseo/client";
import { parseEnvelope } from "./preview";
import { AUTOMATED_MARKER } from "./reviews";

type Page = Awaited<ReturnType<ReturnType<PaseoApi["agents"]["ref"]>["timeline"]["refetch"]>>;
type Entry = Page["entries"][number];
export const COMMANDER_ENTRY_LIMIT = 120;
export const isCollectionRequest = (text: string): boolean => text.startsWith(`${AUTOMATED_MARKER}\nCollect now.`);
export type CommanderReply = Pick<Entry, "seqStart" | "seqEnd" | "timestamp" | "item"> & { provenance: "ordinary" | "collection" | "unknown" };

export function commanderReplies(page: Page, agentId: string, epoch?: string): CommanderReply[] | null {
  if (!agentId || page.agentId !== agentId || !page.epoch || (epoch && page.epoch !== epoch) ||
    page.projection !== "canonical" || page.reset || page.gap || page.staleCursor || page.error ||
    page.entries.length > COMMANDER_ENTRY_LIMIT) return null;
  let provenance: CommanderReply["provenance"] = "unknown";
  const replies: CommanderReply[] = [];
  for (const [i, entry] of page.entries.entries()) {
    if (!Number.isSafeInteger(entry.seqStart) || entry.seqStart < 0 || entry.seqStart !== entry.seqEnd ||
      entry.collapsed.length || entry.sourceSeqRanges.length !== 1 ||
      entry.sourceSeqRanges[0].startSeq !== entry.seqStart || entry.sourceSeqRanges[0].endSeq !== entry.seqEnd ||
      (i > 0 && entry.seqStart !== page.entries[i - 1].seqEnd + 1)) return null;
    const text = "text" in entry.item ? entry.item.text : "";
    if ((entry.item.type === "assistant_message" || entry.item.type === "user_message") && typeof text !== "string") return null;
    if (entry.item.type === "user_message" && typeof text === "string" && !parseEnvelope(text)) {
      if (isCollectionRequest(text)) provenance = "collection";
      else if (!text.startsWith(AUTOMATED_MARKER)) provenance = "ordinary";
    }
    const last = replies.at(-1);
    if (entry.item.type === "assistant_message" && last?.item.type === "assistant_message") {
      last.item.text += entry.item.text;
      last.seqEnd = entry.seqEnd;
    } else replies.push({ seqStart: entry.seqStart, seqEnd: entry.seqEnd, timestamp: entry.timestamp, item: { ...entry.item }, provenance });
  }
  return replies;
}
