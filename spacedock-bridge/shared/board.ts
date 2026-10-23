import type { PaseoApi } from "@getpaseo/client";
import { type PermissionLike, permissionPreview } from "./preview";
import type { AwaitingGate } from "./tasks";

export const ROLE_LABEL = "role";
export const ROLE_FO = "fo";
export const ROLE_COORDINATOR = "comms-officer";
export const NEXT_OWNER_LABEL = "next-owner";
export const NEXT_LABEL = "next";
export const FO_FILTER = { labels: { role: "fo" }, includeArchived: true };

export type BoardStatus = "busy" | "idle" | "waiting on Kent" | "new reply" | "error" | "offline";

export interface BoardAgent {
  id: string;
  title?: string | null;
  cwd: string;
  status: string;
  labels?: Record<string, string>;
  requiresAttention?: boolean;
  attentionReason?: string | null;
  pendingPermissions?: readonly PermissionLike[];
  archivedAt?: string | null;
  attentionTimestamp?: string | null;
  updatedAt: string;
}

export interface BoardRow {
  id: string;
  title: string;
  repo: string;
  task: string;
  status: BoardStatus;
  lastActivityAt: string;
  permission: string;
  next: string;
  hasNextOwner: boolean;
  workflowDir: string;
  gates: AwaitingGate[];
  offline: boolean;
  attentionAt?: string | null;
}

export function boardStatus(agent: BoardAgent): BoardStatus {
  if (agent.pendingPermissions?.length) return "waiting on Kent";
  if (agent.requiresAttention && agent.attentionReason === "permission")
    return "waiting on Kent";
  if (agent.archivedAt || agent.status === "closed") return "offline";
  if (agent.status === "error" || agent.attentionReason === "error")
    return "error";
  if (agent.status === "running" || agent.status === "initializing")
    return "busy";
  if (agent.labels?.[NEXT_OWNER_LABEL] === "captain") return "waiting on Kent";
  if (agent.requiresAttention && agent.attentionReason === "finished") return "new reply";
  return "idle";
}

export function isFo(agent: BoardAgent): boolean {
  return agent.labels?.[ROLE_LABEL] === ROLE_FO;
}

export function toRow(agent: BoardAgent): BoardRow {
  return {
    id: agent.id,
    title: agent.title ?? "",
    repo: agent.labels?.repo ?? "",
    task: agent.labels?.task ?? "",
    status: boardStatus(agent),
    lastActivityAt: agent.updatedAt,
    permission: permissionPreview(agent.pendingPermissions?.[0]),
    next: agent.labels?.[NEXT_LABEL] ?? "",
    hasNextOwner: Boolean(agent.labels?.[NEXT_OWNER_LABEL]),
    workflowDir: (agent.labels?.["workflow-dir"] ?? "").startsWith("/") ? agent.labels!["workflow-dir"] : "",
    gates: [],
    offline: Boolean(agent.archivedAt) || agent.status === "closed",
    attentionAt: agent.attentionTimestamp ?? null,
  };
}

export const STATUS_ORDER: readonly BoardStatus[] = [
  "waiting on Kent",
  "error",
  "new reply",
  "busy",
  "idle",
  "offline",
];

export interface ReplyFact {
  preview: string;
  onCaptain: boolean;
}

function byGroupThenTitle(a: BoardRow, b: BoardRow): number {
  return (
    STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
    (a.title || a.id).localeCompare(b.title || b.id)
  );
}

export function toRows(agents: Iterable<BoardAgent>): BoardRow[] {
  return [...agents].filter(isFo).map(toRow).sort(byGroupThenTitle);
}

export function withReplies(
  rows: readonly BoardRow[],
  facts: Readonly<Record<string, ReplyFact>>,
): BoardRow[] {
  return rows
    .map((row): BoardRow =>
      row.status === "new reply" && facts[row.id]?.onCaptain
        ? { ...row, status: "waiting on Kent" }
        : row,
    )
    .sort(byGroupThenTitle);
}

export async function observeBoard(
  paseo: PaseoApi,
  onRows: (rows: BoardRow[]) => void,
): Promise<() => void> {
  const known = new Map<string, BoardAgent>();
  const emit = () => onRows(toRows(known.values()));
  const { subscription } = await paseo.agents.list({ subscribe: {}, filter: FO_FILTER });
  subscription.subscribe({
    snapshot: ({ entries }) => {
      known.clear();
      for (const { agent } of entries) known.set(agent.id, agent as BoardAgent);
      emit();
    },
    update: (message) => {
      if (message.type !== "agent_update") return;
      const update = message.payload;
      if (update.kind === "upsert")
        known.set(update.agent.id, update.agent as BoardAgent);
      else known.delete(update.agentId);
      emit();
    },
  });
  return () => subscription.release();
}

export interface WorkflowGate extends AwaitingGate {
  workflowDir: string;
}

export function attachGates(
  rows: readonly BoardRow[],
  gates: readonly WorkflowGate[],
): BoardRow[] {
  const byId = new Map(rows.map((row) => [row.id, { ...row, gates: [] as AwaitingGate[] }]));
  for (const gate of gates) {
    const owner =
      rows.find((row) => row.task === gate.slug) ??
      rows.find((row) => row.workflowDir === gate.workflowDir);
    if (!owner) continue;
    byId.get(owner.id)?.gates.push({
      slug: gate.slug,
      title: gate.title,
      stage: gate.stage,
      preparedAt: gate.preparedAt,
    });
  }
  return [...byId.values()]
    .filter((row) => !row.offline || row.gates.length > 0)
    .map((row): BoardRow =>
      row.gates.length && row.status !== "error" ? { ...row, status: "waiting on Kent" } : row,
    )
    .sort(byGroupThenTitle);
}
