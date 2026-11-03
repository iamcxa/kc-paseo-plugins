import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stringify } from "yaml";
import { readGatesHandler } from "../server/tasks";
import { attachGates, toRows } from "../shared/board";
import { buildQueue } from "../shared/queue";
import { readGates } from "../shared/tasks";

test("each active briefing identity survives the server, RPC schema, attachment and queue", async t => {
  const root = await mkdtemp(join(tmpdir(), "bridge-attempt-"));
  const previousPath = process.env.PATH;
  t.after(async () => { process.env.PATH = previousPath; await rm(root, { recursive: true, force: true }); });
  await mkdir(join(root, "bin"));
  await mkdir(join(root, ".spacedock-state"));
  await writeFile(join(root, "README.md"), "---\ncommissioned-by: spacedock@0.27.3\n---\n");
  const source = join(root, "answer.json");
  await writeFile(join(root, "bin/spacedock"), `#!${process.execPath}\nconsole.log(require('node:fs').readFileSync(${JSON.stringify(source)},'utf8'));\n`, { mode: 0o755 });
  process.env.PATH = `${join(root, "bin")}:${previousPath}`;
  const second = join(root, "second");
  await mkdir(second); await mkdir(join(second, ".spacedock-state"));
  await writeFile(join(second, "README.md"), "---\ncommissioned-by: spacedock@0.27.3\n---\n");
  const keys = new Set<string>();
  for (const [stage, briefingId] of [["ideation", "one"], ["validation", "two"], ["validation", "three"]]) {
    await writeFile(source, JSON.stringify({ entities: [{ slug: "task", title: "Same task", status: stage, "gate-readiness": "awaiting-captain" }] }));
    for (const workflow of [root, second]) await writeFile(join(workflow, ".spacedock-state/task.md"), "---\n" + stringify({ gates: { records: [{ stage, attempts: [{ briefing: { id: briefingId, digest: "digest", "room-ref": "room" } }] }] } }) + "---\n");
    const result = await readGatesHandler({ workflowDirs: [root, second], fresh: true });
    const checked = readGates.output.parse(result);
    assert.equal(checked.gates.length, 2, "identical task titles in distinct workflows must stay separate");
    assert.equal((checked.gates[0] as { briefingId?: string }).briefingId, briefingId, "a missing waiting-time commit must not discard the attempt identity");
    const rows = toRows([root, second].map((workflow, index) => ({ id: `fo-${index}`, title: "FO", cwd: workflow, status: "idle", updatedAt: "2026-11-03T00:00:00Z", labels: { role: "fo", task: "task", "workflow-dir": workflow } })));
    const queue = buildQueue(attachGates(rows, checked.gates), []);
    assert.equal(queue.length, 2);
    assert.ok(queue.every(item => item.gate?.workflowDir === item.fo?.workflowDir), "same slugs in different workflows retain their exact recipient through the pipeline");
    for (const item of queue) {
      assert.equal((item.gate as { briefingId?: string }).briefingId, briefingId);
      assert.ok(item.gate?.workflowDir === root || item.gate?.workflowDir === second);
      keys.add(item.key);
    }
  }
  assert.equal(keys.size, 6, "successive stages and same-stage attempts have independent queue identities");
});
