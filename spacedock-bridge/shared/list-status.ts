import type { SourceState, SourceStates } from "./board-empty";
import type { QueueKind } from "./queue";

export interface ItemProgress {
  sent?: boolean;
  relayed?: boolean;
  recorded?: boolean;
  closed?: boolean;
  overdue?: boolean;
  problem?: boolean;
}
interface StatusInput extends ItemProgress {
  kind: QueueKind;
  sourceState?: SourceState;
  source?: string;
  assigned?: boolean;
  tabClosed?: boolean;
}

export function itemStatus(item: StatusInput): { state: "check" | "done" | "waiting" | "your-turn"; icon: string; text: string } {
  if (item.sourceState === "failed" || item.problem || item.overdue) return { state: "check", icon: "!", text: "Check" };
  if (item.sourceState === "loading") return { state: "waiting", icon: "◷", text: "Loading" };
  if (item.recorded || item.closed) return { state: "done", icon: "✓", text: "Done" };
  if (item.relayed) return { state: "waiting", icon: "◷", text: "Waiting for record" };
  if (item.sent) return { state: "waiting", icon: "◷", text: "Waiting for relay" };
  return { state: "your-turn", icon: "◆", text: "Your turn" };
}

export function filterCounts(items: readonly (ItemProgress & { kind: QueueKind })[], sources: SourceStates): Record<"all" | QueueKind, string> {
  const pending = items.filter(item => !item.recorded && !item.closed);
  const complete = (kind: "all" | QueueKind) => {
    const dependencies: Record<"all" | QueueKind, (keyof SourceStates)[]> = {
      all: ["fos", "gates", "reviews", "comms"], permission: ["fos"], review: ["fos", "reviews"], gate: ["fos", "gates"], ask: ["fos", "comms"],
    };
    const states = dependencies[kind].map(source => sources[source]);
    const count = pending.filter(item => kind === "all" || item.kind === kind).length;
    return states.includes("failed") ? count ? `${count}+` : "?" : states.includes("loading") ? count ? `${count}+` : "…" : String(count);
  };
  return { all: complete("all"), permission: complete("permission"), review: complete("review"), gate: complete("gate"), ask: complete("ask") };
}
