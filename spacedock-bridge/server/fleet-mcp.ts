import { readTimeline, entryIsWriting } from "../shared/timeline";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { type IncomingMessage, type Server, type ServerResponse, createServer } from "node:http";
import { homedir } from "node:os";
import { join } from "node:path";
import type { PaseoApi } from "@getpaseo/client";
import { type BoardAgent, FO_FILTER, attachGates, toRows } from "../shared/board";
import { goodPage, reportSource } from "./report-sources";
import { readGatesHandler, readTasksHandler } from "./tasks";

export const FLEET_SERVER_NAME = "fleet";
export const FLEET_TOOL = "fleet_status";
const PORT = 6787;
const HOME = join(homedir(), ".local", "share", "paseo-fo-coordinator");

let paseo: PaseoApi | null = null;

export function rememberPaseo(api: PaseoApi): void {
  paseo ??= api;
}

export function rememberedPaseo(): PaseoApi | null {
  return paseo;
}

async function token(): Promise<string> {
  const file = join(HOME, "fleet-token");
  try {
    return (await readFile(file, "utf8")).trim();
  } catch {
    await mkdir(HOME, { recursive: true });
    const value = randomBytes(16).toString("hex");
    await writeFile(file, value, { mode: 0o600 });
    return value;
  }
}

export async function fleetSnapshot(api: PaseoApi, hostId = "") {
  const { entries } = await api.agents.list({ filter: FO_FILTER });
  const rows = toRows(entries.map((entry) => entry.agent as BoardAgent));
  const { tasks, failedWorkflowDirs: taskFailures } = await readTasksHandler({
    requests: rows
      .filter((row) => row.workflowDir && row.task)
      .map((row) => ({ agentId: row.id, workflowDir: row.workflowDir, task: row.task })),
  });
  if (taskFailures.length) throw new Error(`Could not check tasks for ${taskFailures.join(", ")}`);
  const { gates, failedWorkflowDirs: gateFailures } = await readGatesHandler({
    workflowDirs: rows.map((row) => row.workflowDir).filter(Boolean),
  });
  if (gateFailures.length) throw new Error(`Could not check gates for ${gateFailures.join(", ")}`);
  const reports = await Promise.all(rows.map(async row => {
    try {
      if (!hostId) throw new Error("Collect now in Bridge to establish the source host");
      const page = await readTimeline((id, options) => api.agents.ref(id).timeline.refetch(options), row.id, { direction: "tail", limit: 40 });
      if (!goodPage(page, row.id)) throw new Error("Timeline unavailable");
      let bytes = 0;
      let omitted = false;
      const sources = [...page.entries].sort((a,b) => b.seqStart - a.seqStart).flatMap(entry => {
        const source = entryIsWriting(page, entry) ? null : reportSource(hostId, row.id, page.epoch, entry);
        if (!source || entry.item.type !== "assistant_message") return [];
        const size = Buffer.byteLength(entry.item.text, "utf8");
        if (bytes + size > 64000) { omitted = true; return []; }
        bytes += size;
        return [{ source, text: entry.item.text }];
      }).reverse();
      return { agentId: row.id, state: sources.length ? "reports" : "unknown", truncated: page.hasOlder || omitted, sources };
    } catch { return { agentId: row.id, state: "unavailable", truncated: false, sources: [] }; }
  }));
  return { roundId: randomUUID(), collectedAt: new Date().toISOString(), hostId, reports, fleet: attachGates(rows, gates).map((row) => ({
    agentId: row.id,
    title: row.title,
    repo: row.repo,
    status: row.status,
    offline: row.offline,
    next: row.next,
    permission: row.permission,
    task: tasks[row.id] ? { slug: row.task, ...tasks[row.id] } : row.task || null,
    gatesAwaitingCaptain: row.gates,
    lastActivityAt: row.lastActivityAt,
  })) };
}

const collected = new WeakMap<PaseoApi, Awaited<ReturnType<typeof fleetSnapshot>>>();
export function rememberCollection(api: PaseoApi, snapshot: Awaited<ReturnType<typeof fleetSnapshot>>) { collected.set(api, snapshot); }

const TOOL = {
  name: FLEET_TOOL,
  description:
    "Read the current state of every FO (agents labelled role=fo) without messaging them: " +
    "Paseo status, unread replies, pending permissions, next step and owner labels, the spacedock " +
    "task and stage, and spacedock gates awaiting the Captain.",
  inputSchema: { type: "object", properties: { roundId: { type: "string", description: "Read the pinned collect-now round; omit for a fresh state read" } }, additionalProperties: false },
};

async function answer(message: { id?: unknown; method?: string; params?: { arguments?: { roundId?: string } } }): Promise<unknown> {
  switch (message.method) {
    case "initialize":
      return {
        protocolVersion: "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "paseo-fo-fleet", version: "0.0.0" },
      };
    case "tools/list":
      return { tools: [TOOL] };
    case "tools/call": {
      if (!paseo) throw new Error("The fleet reader has no Paseo session yet.");
      const pinned = collected.get(paseo);
      const roundId = message.params?.arguments?.roundId;
      if (roundId && pinned?.roundId !== roundId) throw new Error("Collection round unavailable");
      const snapshot = roundId ? pinned : await fleetSnapshot(paseo, pinned?.hostId);
      return { content: [{ type: "text", text: JSON.stringify(snapshot, null, 1) }] };
    }
    case "ping":
      return {};
    default:
      throw new Error(`Unsupported method ${message.method}`);
  }
}

async function body(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

function send(response: ServerResponse, status: number, payload?: unknown) {
  response.writeHead(status, payload === undefined ? {} : { "content-type": "application/json" });
  response.end(payload === undefined ? undefined : JSON.stringify(payload));
}

export async function startFleetServer(): Promise<{ url: string; server: Server }> {
  const path = `/mcp/${await token()}`;
  const server = createServer(async (request, response) => {
    if (request.url !== path) return send(response, 404);
    if (request.method !== "POST") return send(response, 405);
    let message: Parameters<typeof answer>[0];
    try {
      message = JSON.parse(await body(request));
    } catch {
      return send(response, 400, { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    }
    if (message.id === undefined) return send(response, 202);
    try {
      send(response, 200, { jsonrpc: "2.0", id: message.id, result: await answer(message) });
    } catch (error) {
      send(response, 200, {
        jsonrpc: "2.0",
        id: message.id,
        error: { code: -32603, message: error instanceof Error ? error.message : String(error) },
      });
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, "127.0.0.1", () => resolve());
  });
  return { url: `http://127.0.0.1:${PORT}${path}`, server };
}
