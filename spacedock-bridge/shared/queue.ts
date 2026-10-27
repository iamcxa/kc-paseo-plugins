import type { BoardRow, ReplyFact } from "./board";
import { replyPreview } from "./preview";
import { type ReviewRequestData, reviewOwner, reviewRef } from "./reviews";
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
  link?: { ref: string; url: string };
}

export function openLink(item: Pick<QueueItem, "link">, open: (url: string) => unknown): void {
  if (item.link) void open(item.link.url);
}

export interface QueueRow extends BoardRow {
  attentionAt?: string | null;
}

export function buildQueue(
  rows: readonly QueueRow[],
  reviews: readonly ReviewRequestData[],
  questionRows: readonly QueueRow[] = rows,
  replies: Readonly<Record<string, ReplyFact>> = {},
): QueueItem[] {
  const items: QueueItem[] = [];
  const asking = new Set(questionRows.filter((row) => row.status === "waiting on Kent" && !row.permission).map((row) => row.id));
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
    const next = row.next.trim();
    const normalize = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase();
    const restatesGate = next && row.gates.some((gate) =>
      [gate.title, gate.slug].filter(Boolean).some((name) =>
        [name, `gate: ${name}`, `${gate.stage} · ${name}`, `${name} · ${gate.stage}`, `review ${name}`, `approve ${name}`, `decide on ${name}`]
          .some((label) => normalize(next) === normalize(label)),
      ),
    );
    const reply = replies[row.id];
    if (asking.has(row.id) && (row.gates.length === 0 || (next && !restatesGate)))
      items.push({ key: `a:${row.id}`, kind: "ask", title: row.next || reply?.preview || "Has a question for you", detail: "", since, fo: row });
    if (reply?.onCaptain && reply.preview) {
      const represented = items.some((item) => item.fo?.id === row.id && item.kind === "ask" && replyPreview(item.title) === reply.preview);
      if (!represented)
        items.push({ key: `unread:${row.id}`, kind: "ask", title: reply.preview, detail: "", since, fo: row });
    }
  }
  for (const review of reviews)
    items.push({
      key: `r:${review.url}`,
      kind: "review",
      title: review.title,
      detail: `${review.owner}/${review.repo}#${review.number} · by ${review.author}`,
      link: { ref: reviewRef(review, reviews), url: review.url },
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
