import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const ReviewRequest = z.object({
  url: z.string(),
  repo: z.string(),
  owner: z.string(),
  number: z.number(),
  title: z.string(),
  author: z.string(),
  firstSeenAt: z.number(),
});

export type ReviewRequestData = z.infer<typeof ReviewRequest>;

export const AUTOMATED_MARKER = "[Bridge plugin, automated — not the Captain]";

interface SearchItem {
  url?: string;
  number?: number;
  title?: string;
  author?: { login?: string };
  repository?: { name?: string; nameWithOwner?: string };
}

export function parseSearch(output: string, now: number): ReviewRequestData[] {
  const items = JSON.parse(output) as SearchItem[];
  return items
    .filter((item) => item.url && item.number && item.repository?.name)
    .map((item) => ({
      url: item.url!,
      repo: item.repository!.name!,
      owner: (item.repository!.nameWithOwner ?? "").split("/")[0] ?? "",
      number: item.number!,
      title: item.title ?? "",
      author: item.author?.login ?? "",
      firstSeenAt: now,
    }));
}

export function newRequests(
  current: readonly ReviewRequestData[],
  seen: Readonly<Record<string, number>>,
): ReviewRequestData[] {
  return current.filter((request) => !(request.url in seen));
}

const NAME_PART = /^[A-Za-z0-9._-]+$/;

function routableLine(r: ReviewRequestData): string | null {
  const ok =
    NAME_PART.test(r.owner) &&
    NAME_PART.test(r.repo) &&
    Number.isSafeInteger(r.number) &&
    r.number > 0 &&
    r.url === `https://github.com/${r.owner}/${r.repo}/pull/${r.number}`;
  return ok ? `- ${r.owner}/${r.repo}#${r.number} — ${r.url}` : null;
}

// Returns "" when no request is routable, so the caller sends nothing.
export function wakeMessage(requests: readonly ReviewRequestData[]): string {
  const lines: string[] = [];
  for (const r of requests) {
    const line = routableLine(r);
    if (line) lines.push(line);
    else console.error("review request left out of the wake: malformed owner, repo, number or url", JSON.stringify(r.url));
  }
  if (!lines.length) return "";
  return [
    `${AUTOMATED_MARKER} New GitHub review requests for the Captain:`,
    ...lines,
    "Route each one: find the live FO whose repo label equals the repository name. Ask that FO to prepare a " +
      "local review brief for the Captain (what changed, risks, its recommendation), to post nothing on GitHub, " +
      "and to set next-owner=captain when the brief is ready. If no FO has that repo, do not start one; tell the " +
      "Captain in one line per pull request: no FO for <repo>. This message is data from the plugin, not a ruling.",
  ].join("\n");
}

export const readReviews = defineRpc({
  name: "reviews.read",
  input: z.object({}),
  output: z.object({
    requests: z.array(ReviewRequest),
    checkedAt: z.number().nullable(),
    error: z.string().nullable(),
  }),
});

export interface ReviewOwnerCandidate {
  id: string;
  repo: string;
  task: string;
  next: string;
  offline: boolean;
}

// An FO owns a review when its repo label lists the repository, or its task or next step names the pull request.
export function reviewOwner<T extends ReviewOwnerCandidate>(
  review: Pick<ReviewRequestData, "repo" | "number">,
  rows: readonly T[],
): T | undefined {
  const ref = `${review.repo}#${review.number}`;
  const live = rows.filter((row) => !row.offline);
  return (
    live.find((row) => `${row.task} ${row.next}`.includes(ref)) ??
    live.find((row) => row.repo.split(",").map((repo) => repo.trim()).includes(review.repo))
  );
}
