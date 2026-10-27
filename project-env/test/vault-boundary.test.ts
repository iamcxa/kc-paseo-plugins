import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { PluginSessionOpenRequest } from "@getpaseo/plugin/server";
import type { Project } from "../shared/config.ts";
import { createSecrets } from "../server/secrets.ts";
import { openSession } from "../server/session-open.ts";
import { makeWorld, type Scenario } from "./world.ts";

const worlds: ReturnType<typeof makeWorld>[] = [];
afterEach(() => {
  for (const w of worlds.splice(0)) w.cleanup();
});

const VAULT_ID = "abcdefghijklmnopqrstuvwxyz";

const project = (vault: string, variables: [string, string][]): Project => ({
  root: "/repo",
  serviceAccount: "sa-a",
  vault,
  variables: variables.map(([name, ref]) => ({ name, ref })),
});

function setup(refs: string[]) {
  const scenario: Scenario = {
    keychain: { "sa-a": "a" },
    op: { accounts: { a: { refs: Object.fromEntries(refs.map((ref) => [ref, "secret"])) } } },
  };
  const world = makeWorld(scenario);
  worlds.push(world);
  const reads = () => world.calls().filter((c) => c.tool === "op" && c.argv[0] === "read");
  return { secrets: createSecrets(world.tools), reads };
}

describe("a reference outside the chosen vault is never read", () => {
  // Every ref exists in the fake account, so a read that happens would succeed and show up as ok.
  const rows: [string, string, string, "read" | "outside-vault" | "missing-field"][] = [
    ["the saved name, exactly", "Dev", "op://Dev/i/x", "read"],
    ["a different vault", "Dev", "op://Prod/i/x", "outside-vault"],
    ["the vault's id while a name is saved", "Dev", `op://${VAULT_ID}/i/x`, "outside-vault"],
    ["the vault's name while an id is saved", VAULT_ID, "op://Dev/i/x", "outside-vault"],
    ["a different letter case", "Dev", "op://dev/i/x", "outside-vault"],
    ["a variable placeholder", "Dev", "op://$VAULT/i/x", "outside-vault"],
    ["a bare op://name", "Dev", "op://Dev", "missing-field"],
    ["no vault saved", "", "op://Dev/i/x", "outside-vault"],
  ];

  for (const [label, vault, ref, expected] of rows) {
    it(label, async () => {
      const { secrets, reads } = setup([ref]);
      const { env, results } = await secrets.resolveProject(project(vault, [["X", ref]]));
      if (expected === "read") {
        assert.equal(reads().length, 1);
        assert.deepEqual(results, [{ name: "X", ok: true }]);
        assert.equal(env.X, "secret");
      } else {
        assert.equal(reads().length, 0);
        assert.deepEqual(results, [{ name: "X", ok: false, cause: expected }]);
        assert.equal(env.X, "");
      }
    });
  }

  it("is refused before the cache: a value cached under an earlier vault setting is not returned", async () => {
    const ref = "op://Dev/i/x";
    const { secrets, reads } = setup([ref]);
    await secrets.resolveProject(project("Dev", [["X", ref]]));
    assert.equal(reads().length, 1);
    const { env, results } = await secrets.resolveProject(project("Prod", [["X", ref]]));
    assert.equal(reads().length, 1);
    assert.equal(env.X, "");
    assert.equal(results[0].cause, "outside-vault");
  });

  it("blanks only the outside variable at session open and applies the rest", async () => {
    const { secrets, reads } = setup(["op://Dev/i/in", "op://Prod/i/out"]);
    const request: PluginSessionOpenRequest = {
      agentId: "a1",
      workspaceId: null,
      provider: "claude",
      cwd: "/repo",
      reason: "create",
      purpose: "interactive",
      env: { OUT: "from-daemon" },
    };
    const opened = await openSession(
      secrets,
      project("Dev", [["IN", "op://Dev/i/in"], ["OUT", "op://Prod/i/out"]]),
      request,
    );
    assert.deepEqual(opened.request.env, { IN: "secret", OUT: "" });
    assert.deepEqual(opened.results.map((r) => [r.name, r.ok, r.cause]), [
      ["IN", true, undefined],
      ["OUT", false, "outside-vault"],
    ]);
    assert.deepEqual(reads().map((c) => c.argv.at(-1)), ["op://Dev/i/in"]);
  });
});
