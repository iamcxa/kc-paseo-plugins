import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { PluginSessionOpenRequest } from "@getpaseo/plugin/server";
import { rowHint } from "../shared/cause.ts";
import type { Project } from "../shared/config.ts";
import { createSecrets } from "../server/secrets.ts";
import { openSession } from "../server/session-open.ts";
import { paseoLaunchEnv } from "./paseo-env.ts";
import { makeWorld, type Scenario } from "./world.ts";

const worlds: ReturnType<typeof makeWorld>[] = [];
afterEach(() => {
  for (const w of worlds.splice(0)) w.cleanup();
});

function setup(scenario: Scenario) {
  const world = makeWorld(scenario);
  worlds.push(world);
  return { world, secrets: createSecrets(world.tools) };
}

const request: PluginSessionOpenRequest = {
  agentId: "a1",
  workspaceId: null,
  provider: "claude",
  cwd: "/repo",
  reason: "create",
  purpose: "interactive",
  env: { KEEP: "request" },
};

const project = (variables: [string, string][], serviceAccount = "sa-a"): Project => ({
  root: "/repo",
  serviceAccount,
  vault: "V",
  prompt: "",
  variables: variables.map(([name, ref]) => ({ name, ref })),
});

const reads = (world: ReturnType<typeof makeWorld>) =>
  world.calls().filter((c) => c.tool === "op" && c.argv[0] === "read");

describe("session open", () => {
  it("applies each variable that resolves and keeps the request's other env", async () => {
    const { world, secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: { "op://V/i/one": "1", "op://V/i/two": "2" } } } },
    });
    const opened = await openSession(
      secrets,
      project([["ONE", "op://V/i/one"], ["TWO", "op://V/i/two"]]),
      request,
    );
    assert.deepEqual(opened.request.env, { KEEP: "request", ONE: "1", TWO: "2" });
    assert.deepEqual(opened.results, [{ name: "ONE", ok: true }, { name: "TWO", ok: true }]);
    assert.equal(reads(world).length, 2);
  });

  it("a failed variable arrives empty even when the daemon holds the name", async () => {
    const { secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: { "op://V/i/good": "ok" } } } },
    });
    const opened = await openSession(
      secrets,
      project([["STALE_NAME", "op://V/i/missing"], ["GOOD", "op://V/i/good"]]),
      request,
    );
    const launched = paseoLaunchEnv({ STALE_NAME: "daemon", GOOD: "daemon" }, opened.request.env);
    assert.equal(launched.STALE_NAME, "");
    assert.equal(launched.GOOD, "ok");
    assert.equal(opened.results[0].cause, "missing-field");
  });

  it("an empty value is a failed variable and is not cached", async () => {
    const { world, secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: { "op://V/i/blank": "" } } } },
    });
    const p = project([["BLANK", "op://V/i/blank"]]);
    const first = await openSession(secrets, p, request);
    assert.equal(paseoLaunchEnv({ BLANK: "daemon" }, first.request.env).BLANK, "");
    assert.deepEqual(first.results, [
      { name: "BLANK", ok: false, cause: "empty" },
    ]);
    await openSession(secrets, p, request);
    assert.equal(reads(world).length, 2);
  });

  it("a whitespace-only value is a failed variable, blanked and not cached", async () => {
    const { world, secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: { "op://V/i/sp": "   \t " } } } },
    });
    const p = project([["SP", "op://V/i/sp"]]);
    const tested = await secrets.resolveProject(p);
    assert.deepEqual(tested.results, [{ name: "SP", ok: false, cause: "empty" }]);
    assert.equal(reads(world).length, 1);
    await secrets.resolveProject(p);
    assert.equal(reads(world).length, 2);

    const opened = await openSession(secrets, p, request);
    assert.equal(opened.request.env.SP, "");
    assert.deepEqual(opened.results, [{ name: "SP", ok: false, cause: "empty" }]);
    assert.equal(rowHint(opened.results[0]), "failed: the 1Password field is empty");
  });

  it("a value with whitespace around text is delivered as read", async () => {
    const { secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: { "op://V/i/pad": " x " } } } },
    });
    const opened = await openSession(secrets, project([["PAD", "op://V/i/pad"]]), request);
    assert.equal(opened.request.env.PAD, " x ");
    assert.deepEqual(opened.results, [{ name: "PAD", ok: true }]);
  });

  for (const [label, scenario, cause] of [
    ["no token in the Keychain", { op: { accounts: { a: { refs: { "op://V/i/x": "v" } } } } }, "no-token"],
    [
      "a rejected token",
      { keychain: { "sa-a": "gone" }, op: { accounts: { a: { refs: { "op://V/i/x": "v" } } } } },
      "rejected-token",
    ],
    [
      "a missing field",
      { keychain: { "sa-a": "a" }, op: { accounts: { a: { refs: {} } } } },
      "missing-field",
    ],
  ] as [string, Scenario, string][]) {
    it(`blanks every variable on ${label}`, async () => {
      const { secrets } = setup(scenario);
      const opened = await openSession(
        secrets,
        project([["X", "op://V/i/x"], ["Y", "op://V/i/x"]]),
        request,
      );
      const launched = paseoLaunchEnv({ X: "daemon", Y: "daemon" }, opened.request.env);
      assert.deepEqual([launched.X, launched.Y], ["", ""]);
      assert.deepEqual(opened.results.map((r) => r.cause), [cause, cause]);
    });
  }

  it("never serves one service account's value to another", async () => {
    const ref = "op://V/i/shared";
    const { world, secrets } = setup({
      keychain: { "sa-a": "a", "sa-b": "b" },
      op: { accounts: { a: { refs: { [ref]: "from-a" } }, b: { refs: { [ref]: "from-b" } } } },
    });
    const a = await openSession(secrets, project([["V", ref]], "sa-a"), request);
    const b = await openSession(secrets, project([["V", ref]], "sa-b"), request);
    assert.equal(a.request.env.V, "from-a");
    assert.equal(b.request.env.V, "from-b");
    assert.deepEqual(reads(world).map((c) => c.account), ["a", "b"]);
  });

  it("serves a repeat lookup for the same account from the cache", async () => {
    const ref = "op://V/i/one";
    const { world, secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: { [ref]: "1" } } } },
    });
    await openSession(secrets, project([["ONE", ref]]), request);
    const again = await openSession(secrets, project([["ONE", ref]]), request);
    assert.equal(again.request.env.ONE, "1");
    assert.equal(reads(world).length, 1);
  });

  it("blanks a variable 1Password does not answer in time and returns at the deadline", async () => {
    const { world, secrets } = setup({
      keychain: { "sa-a": "a" },
      op: {
        accounts: { a: { refs: { "op://V/i/fast": "quick", "op://V/i/slow": "late" } } },
        delayMs: { "op://V/i/slow": 30_000 },
      },
    });
    const started = Date.now();
    const opened = await openSession(
      secrets,
      project([["FAST", "op://V/i/fast"], ["SLOW", "op://V/i/slow"]]),
      request,
      { budgetMs: 4_000 },
    );
    assert.ok(Date.now() - started < 10_000);
    const launched = paseoLaunchEnv({ SLOW: "daemon" }, opened.request.env);
    assert.equal(launched.FAST, "quick");
    assert.equal(launched.SLOW, "");
    assert.equal(opened.results[1].cause, "unreachable");

    const slow = reads(world).find((c) => c.argv.includes("op://V/i/slow"));
    assert.ok(slow);
    const gone = async () => {
      for (let i = 0; i < 40; i++) {
        try {
          process.kill(slow.pid, 0);
        } catch {
          return true;
        }
        await new Promise((r) => setTimeout(r, 50));
      }
      return false;
    };
    assert.equal(await gone(), true, "the slow op child was killed");
  });

  it("blanks everything when the Keychain tool crashes", async () => {
    const { secrets } = setup({ security: { crash: true } });
    const opened = await openSession(secrets, project([["X", "op://V/i/x"]]), request);
    assert.equal(opened.request.env.X, "");
  });

  it("blanks every name, and does not throw, if resolving itself throws", async () => {
    const throwing = {
      resolveProject: () => Promise.reject(new Error("boom")),
    } as unknown as ReturnType<typeof createSecrets>;
    const opened = await openSession(
      throwing,
      project([["X", "op://V/i/x"], ["PATH", "op://V/i/p"]]),
      request,
    );
    assert.deepEqual(opened.request.env, { KEEP: "request", X: "" });
    assert.deepEqual(opened.results.map((r) => r.cause), ["unexpected", "reserved-name"]);
  });

  it("neither applies nor blanks a reserved name, and reports it failed", async () => {
    const { world, secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: { "op://V/i/p": "/evil", "op://V/i/ok": "fine" } } } },
    });
    const opened = await openSession(
      secrets,
      project([["PATH", "op://V/i/p"], ["PASEO_AGENT_ID", "op://V/i/p"], ["OK", "op://V/i/ok"]]),
      { ...request, env: { PATH: "/usr/bin" } },
    );
    assert.deepEqual(opened.request.env, { PATH: "/usr/bin", OK: "fine" });
    assert.deepEqual(opened.results.map((r) => [r.name, r.ok, r.cause]), [
      ["PATH", false, "reserved-name"],
      ["PASEO_AGENT_ID", false, "reserved-name"],
      ["OK", true, undefined],
    ]);
    assert.equal(reads(world).length, 1);
  });

  it("does not call op for a DYLD_ or LD_PRELOAD name, and reports it reserved", async () => {
    const { world, secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: { "op://V/i/x": "/evil.dylib" } } } },
    });
    const opened = await openSession(
      secrets,
      project([["DYLD_INSERT_LIBRARIES", "op://V/i/x"], ["LD_PRELOAD", "op://V/i/x"]]),
      request,
    );
    assert.deepEqual(opened.request.env, { KEEP: "request" });
    assert.deepEqual(opened.results.map((r) => r.cause), ["reserved-name", "reserved-name"]);
    assert.equal(reads(world).length, 0);
  });

  it("blanks a variable whose field was never picked without asking op for it", async () => {
    const { world, secrets } = setup({
      keychain: { "sa-a": "a" },
      op: { accounts: { a: { refs: {} } } },
    });
    const opened = await openSession(secrets, project([["LINEAR_API_KEY", ""]]), request);
    assert.equal(opened.request.env.LINEAR_API_KEY, "");
    assert.equal(opened.results[0].ok, false);
    assert.equal(reads(world).length, 0);
  });
});
