import type { AwaitingGate } from "./tasks";

export function cardLabel(gate: Pick<AwaitingGate, "stage"> | null, repo: string): string {
  return [gate ? "GATE" : "QUESTION", gate?.stage, repo].filter(Boolean).join(" · ").toUpperCase();
}

// An FO title ends with its model in parentheses, which the Captain does not decide by.
export function foName(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, "").trim() || title;
}

export function waiting(sinceIso: string, nowMs: number): string {
  const seconds = Math.max(0, Math.round((nowMs - Date.parse(sinceIso)) / 1000));
  if (seconds < 90) return `waiting ${seconds}s`;
  if (seconds < 5400) return `waiting ${Math.round(seconds / 60)}m`;
  return `waiting ${Math.round(seconds / 3600)}h`;
}

export interface DiscussionLine {
  key: string;
  role: string;
}

// Collapsed, the discussion starts at the FO's latest message, so a reply the Captain typed after it stays visible.
export function discussionWindow<T extends DiscussionLine>(
  lines: readonly T[],
  expanded: boolean,
): { shown: T[]; earlier: number } {
  const messages = lines.filter((line) => line.role !== "tools");
  const roles = lines.map((line) => line.role);
  const lastFo = roles.lastIndexOf("assistant");
  const lastMessage = roles.length - 1 - [...roles].reverse().findIndex((role) => role !== "tools");
  const start = lastFo >= 0 ? lastFo : Math.max(0, lastMessage);
  const earlier = messages.filter((line) => lines.indexOf(line) < start).length;
  return expanded || earlier === 0 ? { shown: [...lines], earlier } : { shown: lines.slice(start), earlier };
}
