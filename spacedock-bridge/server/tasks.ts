import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { RpcInput } from "@getpaseo/plugin";
import {
  type AwaitingGate,
  type TaskStatus,
  isSpacedockReadme,
  parseAwaitingGates,
  readGates,
  readTasks,
} from "../shared/tasks";
import { gatePreparedAt } from "./gate";

const run = promisify(execFile);
const FRESH_MS = 30_000;
const TIMEOUT_MS = 30_000;
// Seven concurrent `spacedock status` calls took 16.7 s on this Mac (2026-10-22), past the old 10 s timeout.
const MAX_CONCURRENT = 2;
const SPACEDOCK_CANDIDATES = ["spacedock", join(homedir(), ".local", "bin", "spacedock")];

interface Entity {
  slug: string;
  status: string;
  title: string;
  "gate-readiness"?: string;
}

interface Snapshot {
  at: number;
  entities: Entity[];
}

const snapshots = new Map<string, Snapshot>();
const inFlight = new Map<string, Promise<Entity[]>>();
let running = 0;
const queue: (() => void)[] = [];

async function slot<T>(work: () => Promise<T>): Promise<T> {
  if (running >= MAX_CONCURRENT) await new Promise<void>((resolve) => queue.push(resolve));
  running++;
  try {
    return await work();
  } finally {
    running--;
    queue.shift()?.();
  }
}

async function spacedock(args: readonly string[]): Promise<string> {
  let lastError: unknown;
  for (const command of SPACEDOCK_CANDIDATES) {
    try {
      return (await run(command, [...args], { timeout: TIMEOUT_MS })).stdout;
    } catch (error) {
      lastError = error;
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") break;
    }
  }
  throw lastError;
}

async function fetchEntities(workflowDir: string): Promise<Entity[]> {
  const readme = await readFile(join(workflowDir, "README.md"), "utf8");
  if (!isSpacedockReadme(readme)) return [];
  const output = await slot(() =>
    spacedock([
      "status",
      "--workflow-dir",
      workflowDir,
      "--fields",
      "slug,status,title,gate-readiness",
      "--json",
    ]),
  );
  const entities: unknown = JSON.parse(output)?.entities;
  return Array.isArray(entities) ? (entities as Entity[]) : [];
}

async function workflowEntities(workflowDir: string): Promise<Entity[]> {
  const known = snapshots.get(workflowDir);
  if (known && Date.now() - known.at < FRESH_MS) return known.entities;
  let pending = inFlight.get(workflowDir);
  if (!pending) {
    pending = fetchEntities(workflowDir)
      .then((entities) => {
        snapshots.set(workflowDir, { at: Date.now(), entities });
        return entities;
      })
      .catch((error) => {
        console.error(`spacedock status ${workflowDir}:`, error);
        throw error;
      })
      .finally(() => inFlight.delete(workflowDir));
    inFlight.set(workflowDir, pending);
  }
  return pending;
}

export async function readTasksHandler({ requests }: RpcInput<typeof readTasks>) {
  const tasks: Record<string, TaskStatus> = {};
  await Promise.all(
    requests.map(async ({ agentId, workflowDir, task }) => {
      const entity = (await workflowEntities(workflowDir)).find((e) => e.slug === task);
      if (entity) tasks[agentId] = { title: String(entity.title ?? ""), stage: String(entity.status) };
    }),
  );
  return { tasks };
}

let gateCalls = 0;
export async function readGatesHandler({ workflowDirs, fresh }: RpcInput<typeof readGates>) {
  const call = ++gateCalls;
  const started = Date.now();
  console.log(`gates.read #${call} start dirs=${workflowDirs.length}`);
  try {
    return await readGatesInner(workflowDirs, fresh);
  } finally {
    console.log(`gates.read #${call} done ${Date.now() - started}ms`);
  }
}

async function readGatesInner(workflowDirs: readonly string[], fresh = false) {
  const lists = await Promise.all(
    [...new Set(workflowDirs)].map(async (workflowDir) =>
      Promise.all(
        parseAwaitingGates(JSON.stringify({ entities: await (fresh ? fetchEntities(workflowDir) : workflowEntities(workflowDir)) })).map(
          async (gate: AwaitingGate) => ({
            workflowDir,
            ...gate,
            preparedAt: await gatePreparedAt(workflowDir, gate.slug, gate.stage),
          }),
        ),
      ),
    ),
  );
  const seen = new Set<string>();
  const gates = lists.flat().filter((gate) => {
    const key = `${gate.slug}\n${gate.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { gates };
}
