import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PaseoApi } from "@getpaseo/client";
import { stringify } from "yaml";
import { gateKey } from "../shared/gate-identity";
import { COORDINATOR_OPTIONS } from "../shared/coordinator";

test("fleet gate briefing reads the board's exact open attempt only, with bounded output and no writes", async t => {
  const root = await mkdtemp(join(tmpdir(), "fleet-briefing-"));
  const pathBefore = process.env.PATH;
  const dataBefore = process.env.BRIDGE_DATA_HOME;
  const portBefore = process.env.BRIDGE_FLEET_PORT;
  t.after(async () => {
    process.env.PATH = pathBefore;
    for (const [key, value] of [["BRIDGE_DATA_HOME", dataBefore], ["BRIDGE_FLEET_PORT", portBefore]]) {
      if (value === undefined) delete process.env[key!]; else process.env[key!] = value;
    }
    await rm(root, { recursive: true, force: true });
  });
  process.env.BRIDGE_DATA_HOME = join(root, "data");
  process.env.BRIDGE_FLEET_PORT = "0";
  const state = join(root, ".spacedock-state");
  const room = join(state, "task/review/validation/briefing-1");
  await mkdir(room, { recursive: true });
  await mkdir(join(root, "bin"));
  await mkdir(process.env.BRIDGE_DATA_HOME);
  await writeFile(join(process.env.BRIDGE_DATA_HOME, "fleet-token"), "fictional-token");
  await writeFile(join(root, "README.md"), "---\ncommissioned-by: spacedock@0.27.3\nstate: .spacedock-state\n---\n");
  const status = { entities: [{ slug: "task", title: "Fictional CSV gate", status: "validation", "gate-readiness": "awaiting-captain" }] };
  await writeFile(join(root, "bin/spacedock"), `#!${process.execPath}\nconsole.log(${JSON.stringify(JSON.stringify(status))});\n`, { mode: 0o755 });
  process.env.PATH = `${join(root, "bin")}:${pathBefore}`;
  const entity = join(state, "task.md");
  const writeAttempt = (id: string, closed = false) => writeFile(entity, `---\n${stringify({ gates: { records: [{ stage: "validation", attempts: [{ briefing: { id, digest: "sha256:fictional", "room-ref": "./task/review/validation/briefing-1" }, ...(closed ? { resolution: { decision: "approve", briefing: id } } : {}) }] }] } })}---\n`);
  await writeAttempt("brief:one");
  const index = join(room, "index.json");
  await writeFile(index, JSON.stringify({ question: "CSV checks passed; approve the fictional gate?", artifacts: [] }));
  const mutations: string[] = [];
  const api = { agents: {
    list: async ({ filter }: any) => ({ entries: filter.labels.role === "fo" ? [{ agent: { id: "fictional-fo", cwd: root, title: "Fictional FO", status: "idle", updatedAt: new Date().toISOString(), labels: { role: "fo", "workflow-dir": root, task: "task" } } }] : [] }),
    create: async () => { mutations.push("create"); throw Error("no write"); },
    ref: () => { mutations.push("ref"); throw Error("no agent access needed"); },
  } } as unknown as PaseoApi;
  const { fleetGateBriefing, rememberPaseo, startFleetServer } = await import("../server/fleet-mcp");
  const key = gateKey({ workflowDir: root, slug: "task", stage: "validation", briefingId: "brief:one" });
  const before = [await readFile(entity, "utf8"), await readFile(index, "utf8"), await readdir(process.env.BRIDGE_DATA_HOME)];
  const result = await fleetGateBriefing(api, key);
  assert.equal(result.key, key);
  assert.equal(result.briefing.briefingId, "brief:one");
  assert.match(result.briefing.question, /CSV checks passed/);
  assert.deepEqual([await readFile(entity, "utf8"), await readFile(index, "utf8"), await readdir(process.env.BRIDGE_DATA_HOME)], before);
  await assert.rejects(fleetGateBriefing(api, "unknown"), /not on the current board/);
  await writeAttempt("brief:two");
  await assert.rejects(fleetGateBriefing(api, key), /stale|not on the current board/);
  await writeAttempt("brief:one", true);
  await assert.rejects(fleetGateBriefing(api, key), /stale|not on the current board/);
  await writeAttempt("brief:one");
  await writeFile(index, JSON.stringify({ question: "界".repeat(16000), artifacts: [] }));
  await assert.rejects(fleetGateBriefing(api, key), /size limit/);
  await writeFile(index, before[1] as string);
  rememberPaseo(api);
  const { server, url } = await startFleetServer();
  t.after(() => new Promise<void>(resolve => server.close(() => resolve())));
  const address = server.address() as { port: number };
  const endpoint = new URL(url); endpoint.port = String(address.port);
  const call = async (method: string, params = {}) => (await fetch(endpoint, { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) })).json() as Promise<any>;
  assert.ok((await call("tools/list")).result.tools.some((tool: any) => tool.name === "gate_briefing"));
  const answer = await call("tools/call", { name: "gate_briefing", arguments: { key } });
  assert.equal(JSON.parse(answer.result.content[0].text).briefing.briefingId, "brief:one");
  assert.match((await call("tools/call", { name: "gate_briefing", arguments: { key: "unknown" } })).error.message, /not on the current board/);
  assert.match((await call("tools/call", { name: "unexpected" })).error.message, /Unknown fleet tool/);
  assert.deepEqual(mutations, []);
  assert.ok(COORDINATOR_OPTIONS.allowedTools.includes("mcp__fleet__gate_briefing"));
  assert.ok(COORDINATOR_OPTIONS.allowedTools.includes("mcp__paseo__get_agent_activity"));
});
