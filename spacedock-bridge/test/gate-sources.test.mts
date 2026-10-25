import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readGatesHandler, readTasksHandler } from "../server/tasks";
import { fleetSnapshot } from "../server/fleet-mcp";
import type { PaseoApi } from "@getpaseo/client";

test("gate read failures reach the board, and a return refresh replaces the existing snapshot", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "bridge-gate-source-"));
  const previousPath = process.env.PATH;
  t.after(async () => { process.env.PATH = previousPath; await rm(root, { recursive: true, force: true }); });
  await mkdir(join(root, "bin"));
  await writeFile(join(root, "README.md"), "---\ncommissioned-by: spacedock@0.27.3\n---\n");
  const fixture = join(root, "answer.json");
  await writeFile(join(root, "bin/spacedock"), `#!${process.execPath}\nconst fs=require('node:fs');const text=fs.readFileSync(${JSON.stringify(fixture)},'utf8');if(text==='fail')process.exit(1);console.log(text);\n`, { mode: 0o755 });
  process.env.PATH = `${join(root, "bin")}:${previousPath}`;
  await writeFile(fixture, "fail");
  assert.deepEqual(await readGatesHandler({ workflowDirs: [root] }), { gates: [], failedWorkflowDirs: [root] });
  await writeFile(fixture, JSON.stringify({ entities: [{ slug: "gate", title: "Old gate", status: "validation", "gate-readiness": "awaiting-captain" }] }));
  assert.equal((await readGatesHandler({ workflowDirs: [root] })).gates.length, 1);
  await writeFile(fixture, JSON.stringify({ entities: [] }));
  assert.equal((await readGatesHandler({ workflowDirs: [root] })).gates.length, 1);
  assert.deepEqual((await readGatesHandler({ workflowDirs: [root], fresh: true })).gates, []);
  await writeFile(fixture, "fail");
  assert.deepEqual((await readGatesHandler({ workflowDirs: [root] })).gates, []);
});

test("a removed workflow does not hide another workflow's gates or tasks", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "bridge-workflow-source-"));
  const healthy = join(root, "healthy");
  const removed = join(root, "removed");
  const previousPath = process.env.PATH;
  t.after(async () => { process.env.PATH = previousPath; await rm(root, { recursive: true, force: true }); });
  await mkdir(join(root, "bin"));
  for (const workflow of [healthy, removed]) {
    await mkdir(workflow);
    await writeFile(join(workflow, "README.md"), "---\ncommissioned-by: spacedock@0.27.3\n---\n");
  }
  await rm(removed, { recursive: true });
  await writeFile(join(root, "bin/spacedock"), `#!${process.execPath}\nconsole.log(${JSON.stringify(JSON.stringify({ entities: [{ slug: "gate", title: "Healthy task", status: "validation", "gate-readiness": "awaiting-captain" }] }))});\n`, { mode: 0o755 });
  process.env.PATH = `${join(root, "bin")}:${previousPath}`;
  const gates = await readGatesHandler({ workflowDirs: [healthy, removed] });
  assert.equal(gates.gates.length, 1);
  assert.equal(gates.gates[0].workflowDir, healthy);
  assert.deepEqual(gates.failedWorkflowDirs, [removed]);
  const tasks = await readTasksHandler({ requests: [
    { agentId: "good", workflowDir: healthy, task: "gate" },
    { agentId: "gone", workflowDir: removed, task: "gate" },
  ] });
  assert.deepEqual(tasks, { tasks: { good: { title: "Healthy task", stage: "validation" } }, failedWorkflowDirs: [removed] });
  const api = (withTask: boolean) => ({ agents: { list: async () => ({ entries: [healthy, removed].map((workflowDir, index) => ({ agent: {
    id: String(index), cwd: root, status: "idle", updatedAt: "2026-10-25T00:00:00Z",
    labels: { role: "fo", "workflow-dir": workflowDir, ...(withTask ? { task: "gate" } : {}) },
  } })) }) } }) as unknown as PaseoApi;
  await assert.rejects(fleetSnapshot(api(true)), { message: `Could not check tasks for ${removed}` });
  await assert.rejects(fleetSnapshot(api(false)), { message: `Could not check gates for ${removed}` });
});
