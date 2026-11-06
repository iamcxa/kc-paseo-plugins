import { chiefBoard, prepareBatch, PREPARE_TOOL } from "./chief";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { type IncomingMessage, type Server, type ServerResponse, createServer } from "node:http";
import { homedir } from "node:os";
import { join } from "node:path";
import type { PaseoApi } from "@getpaseo/client";

export const FLEET_SERVER_NAME = "fleet";
export const FLEET_TOOL = "fleet_status";
const PORT = Number(process.env.BRIDGE_FLEET_PORT ?? 6787);
const DATA_DIR = process.env.BRIDGE_DATA_HOME || join(homedir(), ".local", "share", "paseo-fo-coordinator");

let paseo: PaseoApi | null = null;

export function rememberPaseo(api: PaseoApi): void {
  paseo ??= api;
}

export function rememberedPaseo(): PaseoApi | null {
  return paseo;
}

async function token(): Promise<string> {
  const file = join(DATA_DIR, "fleet-token");
  try {
    return (await readFile(file, "utf8")).trim();
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    const value = randomBytes(16).toString("hex");
    await writeFile(file, value, { mode: 0o600 });
    return value;
  }
}

export async function fleetSnapshot(api: PaseoApi) {
  const board = await chiefBoard(api);
  return { checkedAt: new Date().toISOString(), complete: board.complete, total: board.total, events: board.events, fleet: board.rows };
}

const TOOL = {
  name: FLEET_TOOL,
  description:
    "Read the current state of every FO (agents labelled role=fo) without messaging them: " +
    "Paseo status, unread replies, pending permissions, next step and owner labels, the spacedock " +
    "task and stage, and spacedock gates awaiting the Captain.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
};

async function answer(message: { id?: unknown; method?: string; params?: { name?: string; arguments?: { batchId?: string } } }): Promise<unknown> {
  switch (message.method) {
    case "initialize":
      return {
        protocolVersion: "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "paseo-fo-fleet", version: "0.0.0" },
      };
    case "tools/list":
      return { tools: [TOOL, { name: PREPARE_TOOL, description: "Prepare one supplied chief batch with one Terra low pass. No outward actions. Never retry.", inputSchema: { type: "object", properties: { batchId: { type: "string" } }, required: ["batchId"], additionalProperties: false } }] };
    case "tools/call": {
      if (!paseo) throw new Error("The fleet reader has no Paseo session yet.");
      const snapshot = message.params?.name === PREPARE_TOOL
        ? await prepareBatch(message.params.arguments?.batchId ?? "") : await fleetSnapshot(paseo);
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
