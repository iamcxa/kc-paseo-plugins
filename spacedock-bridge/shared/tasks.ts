import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const WORKFLOW_DIR_LABEL = "workflow-dir";

export interface TaskStatus {
  title: string;
  stage: string;
}

export function parseTaskStatus(output: string): TaskStatus | null {
  try {
    const entity = JSON.parse(output)?.entities?.[0];
    if (!entity?.status) return null;
    return { title: String(entity.title ?? ""), stage: String(entity.status) };
  } catch {
    return null;
  }
}

export interface AwaitingGate {
  slug: string;
  title: string;
  stage: string;
  preparedAt?: string;
}

export function parseAwaitingGates(output: string): AwaitingGate[] {
  try {
    const entities: unknown = JSON.parse(output)?.entities;
    if (!Array.isArray(entities)) return [];
    return entities
      .filter((entity) => entity?.["gate-readiness"] === "awaiting-captain")
      .map((entity) => ({
        slug: String(entity.slug),
        title: String(entity.title ?? ""),
        stage: String(entity.status ?? ""),
      }));
  } catch {
    return [];
  }
}

export function isSpacedockReadme(readme: string): boolean {
  return /^commissioned-by:\s*spacedock@/m.test(readme);
}

export const readTasks = defineRpc({
  name: "tasks.read",
  input: z.object({
    requests: z.array(
      z.object({ agentId: z.string(), workflowDir: z.string(), task: z.string() }),
    ),
  }),
  output: z.object({
    tasks: z.record(z.string(), z.object({ title: z.string(), stage: z.string() })),
    failedWorkflowDirs: z.array(z.string()),
  }),
});

export const readGates = defineRpc({
  name: "gates.read",
  input: z.object({ workflowDirs: z.array(z.string()), fresh: z.boolean().optional() }),
  output: z.object({
    failedWorkflowDirs: z.array(z.string()),
    gates: z.array(
      z.object({
        workflowDir: z.string(),
        slug: z.string(),
        title: z.string(),
        stage: z.string(),
        preparedAt: z.string().optional(),
      }),
    ),
  }),
});
