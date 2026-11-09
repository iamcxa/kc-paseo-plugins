import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { afterEach, describe, it } from "node:test";
import type { Project } from "../shared/config.ts";
import { createSecrets } from "../server/secrets.ts";
import { makeWorld, type Scenario } from "./world.ts";

const REF = "op://Dev/i/f";
const project: Project = {
  root: "/repo",
  serviceAccount: "sa-x",
  vault: "Dev",
  variables: [{ name: "F", ref: REF }],
};

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const c of cleanups.splice(0)) c();
});

function setup() {
  const scenario: Scenario = {
    keychain: { "sa-x": "x" },
    op: { accounts: { x: { vaults: ["Dev"], refs: { [REF]: "old" } } }, delayMs: { [REF]: 400 } },
  };
  const world = makeWorld(scenario);
  cleanups.push(world.cleanup);
  const reads = () => world.calls().filter((c) => c.tool === "op" && c.argv[0] === "read");
  const changeTo = (value: string) => {
    scenario.op!.accounts!.x.refs![REF] = value;
    writeFileSync(join(world.dir, "scenario.json"), JSON.stringify(scenario));
  };
  const readStarted = async () => {
    for (let waited = 0; reads().length === 0; waited += 10) {
      assert.ok(waited < 5000, "the value read never started");
      await sleep(10);
    }
  };
  return { secrets: createSecrets(world.tools), reads, changeTo, readStarted };
}

describe("a read that started before a clear is returned but not kept", () => {
  it("when Test or a settings change clears the cache", async () => {
    const { secrets, reads, changeTo, readStarted } = setup();
    const first = secrets.resolveProject(project);
    await readStarted();
    secrets.clearCache();
    changeTo("new");
    assert.equal((await first).env.F, "old");
    assert.equal((await secrets.resolveProject(project)).env.F, "new");
    assert.equal(reads().length, 2);
  });

  it("when a new token is stored", async () => {
    const { secrets, reads, changeTo, readStarted } = setup();
    const first = secrets.resolveProject(project);
    await readStarted();
    assert.equal((await secrets.storeToken("sa-x", "ops_fake_x")).stored, true);
    changeTo("new");
    assert.equal((await first).env.F, "old");
    assert.equal((await secrets.resolveProject(project)).env.F, "new");
    assert.equal(reads().length, 2);
  });

  it("a read with no clear in between is still reused", async () => {
    const { secrets, reads } = setup();
    await secrets.resolveProject(project);
    await secrets.resolveProject(project);
    assert.equal(reads().length, 1);
  });
});
