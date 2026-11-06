import type { PaseoApi } from "@getpaseo/client";
import { parseEnvelope } from "./preview";
import { healthyTimeline, TIMELINE_ENTRY_LIMIT } from "./timeline";
import { AUTOMATED_MARKER } from "./reviews";

type Page = Awaited<ReturnType<ReturnType<PaseoApi["agents"]["ref"]>["timeline"]["refetch"]>>;
type Entry = Page["entries"][number];
export const COMMANDER_ENTRY_LIMIT = TIMELINE_ENTRY_LIMIT;
export const isCollectionRequest = (text: string): boolean => text.startsWith(`${AUTOMATED_MARKER}\nCollect now.`);
export type CommanderReply = Pick<Entry, "seqStart" | "seqEnd" | "timestamp" | "item"> & { provenance: "ordinary" | "collection" | "unknown" };

export function commanderReplies(page: Page, agentId: string, epoch?: string): CommanderReply[] | null {
  if (!healthyTimeline(page, agentId, epoch)) return null;
  let provenance: CommanderReply["provenance"] = "unknown";
  const replies: CommanderReply[] = [];
  for (const entry of page.entries) {
    const text = "text" in entry.item ? entry.item.text : "";
    if ((entry.item.type === "assistant_message" || entry.item.type === "user_message") && typeof text !== "string") return null;
    if (entry.item.type === "user_message" && typeof text === "string" && !parseEnvelope(text)) {
      if (isCollectionRequest(text)) provenance = "collection";
      else if (!text.startsWith(AUTOMATED_MARKER)) provenance = "ordinary";
    }
    replies.push({ seqStart: entry.seqStart, seqEnd: entry.seqEnd, timestamp: entry.timestamp, item: { ...entry.item }, provenance });
  }
  return replies;
}
