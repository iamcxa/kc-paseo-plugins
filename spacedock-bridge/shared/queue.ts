import type { BoardRow } from "./board";
import { type ReviewRequestData, reviewOwner } from "./reviews";
import type { AwaitingGate } from "./tasks";

export type QueueKind = "permission" | "review" | "gate" | "ask";

const TIER: Record<QueueKind, number> = { permission: 1, review: 2, gate: 3, ask: 4 };

export interface QueueItem {
  key: string;
  kind: QueueKind;
  title: string;
  detail: string;
  since: string;
  fo: BoardRow | null;
  gate?: AwaitingGate;
  review?: ReviewRequestData;
}

export interface QueueRow extends BoardRow {
  attentionAt?: string | null;
}

export function buildQueue(rows: readonly QueueRow[], reviews: readonly ReviewRequestData[]): QueueItem[] {
  const items: QueueItem[] = [];
  for (const row of rows) {
    const since = row.attentionAt || row.lastActivityAt;
    if (row.permission)
      items.push({ key: `p:${row.id}`, kind: "permission", title: row.permission, detail: "", since, fo: row });
    for (const gate of row.gates)
      items.push({
        key: `g:${row.workflowDir}:${gate.slug}`,
        kind: "gate",
        title: gate.title || gate.slug,
        detail: `gate · ${gate.stage}`,
        since: gate.preparedAt || since,
        fo: row,
        gate,
      });
    if (row.status === "waiting on Kent" && !row.permission && row.gates.length === 0)
      items.push({ key: `a:${row.id}`, kind: "ask", title: row.next || "Has a question for you", detail: "", since, fo: row });
  }
  for (const review of reviews)
    items.push({
      key: `r:${review.url}`,
      kind: "review",
      title: review.title,
      detail: `${review.owner}/${review.repo}#${review.number} · by ${review.author}`,
      since: new Date(review.firstSeenAt).toISOString(),
      fo: reviewOwner(review, rows) ?? null,
      review,
    });
  return items.sort((a, b) => TIER[a.kind] - TIER[b.kind] || a.since.localeCompare(b.since));
}

export interface QueueSection {
  kind: QueueKind;
  items: QueueItem[];
}

export function splitQueue(queue: readonly QueueItem[]): { next: QueueItem | null; sections: QueueSection[] } {
  const [next = null, ...rest] = queue;
  const sections: QueueSection[] = [];
  for (const item of rest) {
    const last = sections[sections.length - 1];
    if (last?.kind === item.kind) last.items.push(item);
    else sections.push({ kind: item.kind, items: [item] });
  }
  return { next, sections };
}
