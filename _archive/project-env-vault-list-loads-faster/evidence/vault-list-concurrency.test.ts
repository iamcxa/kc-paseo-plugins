import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { causeText } from "../shared/cause.ts";
import { createSecrets } from "../server/secrets.ts";
import { makeWorld, type FakeItem, type Scenario } from "./world.ts";

const worlds: ReturnType<typeof makeWorld>[] = [];
afterEach(() => {
  for (const w of worlds.splice(0)) w.cleanup();
});

const items = (n: number): FakeItem[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `i${i}`,
    title: `Item ${i}`,
    category: "SECURE_NOTE",
    fields: [{ label: `KEY_${i}`, type: "CONCEALED" }],
  }));

const jsonl = (dir: string, name: string) =>
  readFileSync(join(dir, name), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

function spans(dir: string) {
  const ends = jsonl(dir, "ends.jsonl");
  return jsonl(dir, "calls.jsonl")
    .filter((l) => l.tool === "op" && l.argv[1] === "get")
    .map((s) => ({ id: s.argv[2] as string, start: s.start as number, end: ends.find((e) => e.pid === s.pid).at as number }));
}
const peak = (all: { start: number; end: number }[]) =>
  Math.max(...all.map((g) => all.filter((o) => o.start <= g.start && o.end > g.start).length));

function listing(op: NonNullable<Scenario["op"]>) {
  const world = makeWorld({ keychain: { "sa-a": "a" }, op });
  worlds.push(world);
  return { world, secrets: createSecrets(world.tools) };
}

describe("The vault list reads items a few at a time", () => {
  it("lists in item order even when a later item answers first, and reads each item once", async () => {
    const { world, secrets } = listing({
      accounts: { a: { items: items(8) } },
      callDelayMs: 150,
      delayMs: { "item get i0": 600 },
    });
    const out = await secrets.listRefs("sa-a", "Dev");
    assert.deepEqual(out.refs, items(8).map((_, i) => `op://Dev/Item ${i}/KEY_${i}`));
    assert.deepEqual(spans(world.dir).map((s) => s.id).sort(), items(8).map((i) => i.id).sort());
  });

  it("never has more than four item reads open at once, and does read together", async () => {
    const { world, secrets } = listing({ accounts: { a: { items: items(12) } }, callDelayMs: 150 });
    await secrets.listRefs("sa-a", "Dev");
    const p = peak(spans(world.dir));
    assert.ok(p > 1, `reads were one after another (peak ${p})`);
    assert.ok(p <= 4, `more than four reads open at once (peak ${p})`);
  });

  it("when two items fail the whole list, the earlier item's cause wins, as when read in order", async () => {
    const { secrets } = listing({
      accounts: { a: { items: items(10) } },
      callDelayMs: 100,
      delayMs: { "item get i1": 500 },
      fail: {
        "item get i1": { stderr: "[ERROR] could not connect: dial tcp: no such host" },
        "item get i2": { stderr: "[ERROR] 401 Authentication: invalid service account token" },
      },
    });
    await assert.rejects(() => secrets.listRefs("sa-a", "Dev"), { message: causeText.unreachable });
  });

  it("stops starting new reads after a whole-list failure", async () => {
    const { world, secrets } = listing({
      accounts: { a: { items: items(40) } },
      callDelayMs: 100,
      fail: { "item get i0": { stderr: "[ERROR] 401 Authentication: invalid service account token" } },
    });
    await assert.rejects(() => secrets.listRefs("sa-a", "Dev"), { message: causeText["rejected-token"] });
    assert.ok(spans(world.dir).length <= 8, `kept reading after the failure (${spans(world.dir).length} reads)`);
  });
});
