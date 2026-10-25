import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readGatesHandler } from "../server/tasks";

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
  await assert.rejects(readGatesHandler({ workflowDirs: [root] }));
  await writeFile(fixture, JSON.stringify({ entities: [{ slug: "gate", title: "Old gate", status: "validation", "gate-readiness": "awaiting-captain" }] }));
  assert.equal((await readGatesHandler({ workflowDirs: [root] })).gates.length, 1);
  await writeFile(fixture, JSON.stringify({ entities: [] }));
  assert.equal((await readGatesHandler({ workflowDirs: [root] })).gates.length, 1);
  assert.deepEqual((await readGatesHandler({ workflowDirs: [root], fresh: true })).gates, []);
  await writeFile(fixture, "fail");
  assert.deepEqual((await readGatesHandler({ workflowDirs: [root] })).gates, []);
});
