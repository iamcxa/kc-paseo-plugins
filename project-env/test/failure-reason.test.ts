import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it, mock } from "node:test";
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { CAUSES, rowHint, type Cause } from "../shared/cause.ts";
import * as rpc from "../shared/config.ts";
import type { Project } from "../shared/config.ts";
import { contribute } from "../server/contribute.ts";
import { createSecrets } from "../server/secrets.ts";
import { makeWorld, type Scenario } from "./world.ts";

const cleanups: (() => void)[] = [];
afterEach(() => {
  mock.restoreAll();
  for (const c of cleanups.splice(0)) c();
});

const project = (variables: [string, string][], serviceAccount = "sa-a", root = "/repo"): Project => ({
  root,
  serviceAccount,
  vault: "V",
  prompt: "",
  variables: variables.map(([name, ref]) => ({ name, ref })),
});

async function causeOf(scenario: Scenario, ref = "op://V/i/x", options: { serviceAccount?: string; tools?: Partial<ReturnType<typeof makeWorld>["tools"]> } = {}) {
  const world = makeWorld(scenario);
  cleanups.push(world.cleanup);
  const secrets = createSecrets({ ...world.tools, ...options.tools });
  const { results } = await secrets.resolveProject(project([["X", ref]], options.serviceAccount ?? "sa-a"));
  assert.equal(results[0].ok, false);
  return { cause: results[0].cause, world };
}

const accounts = { a: { refs: { "op://V/i/x": "v", "op://V/i/blank": "" } } };

describe("each failure names exactly one cause class", () => {
  const produced = new Set<Cause>();
  const cases: [Cause, () => Promise<Cause | undefined>][] = [
    ["no-token", async () => (await causeOf({ op: { accounts } })).cause],
    ["no-token", async () => (await causeOf({ keychain: { "sa-a": "a" }, op: { accounts } }, "op://V/i/x", { serviceAccount: "" })).cause],
    ["rejected-token", async () => (await causeOf({ keychain: { "sa-a": "gone" }, op: { accounts } })).cause],
    ["missing-field", async () => (await causeOf({ keychain: { "sa-a": "a" }, op: { accounts } }, "op://V/i/nope")).cause],
    ["unreachable", async () => (await causeOf({ keychain: { "sa-a": "a" }, op: { accounts, fail: { "*": { stderr: "dial tcp: lookup my.1password.com: no such host" } } } })).cause],
    ["empty", async () => (await causeOf({ keychain: { "sa-a": "a" }, op: { accounts } }, "op://V/i/blank")).cause],
    ["outside-vault", async () => (await causeOf({ keychain: { "sa-a": "a" }, op: { accounts: { a: { refs: { "op://Other/i/x": "v" } } } } }, "op://Other/i/x")).cause],
    ["unexpected", async () => (await causeOf({ keychain: { "sa-a": "a" }, op: { accounts, fail: { "*": { stderr: "[ERROR] something new" } } } })).cause],
    ["unexpected", async () => (await causeOf({ keychain: { "sa-a": "a" }, op: { accounts } }, "op://V/i/x", { tools: { op: "/nonexistent/op" } })).cause],
  ];
  for (const [expected, run] of cases) {
    it(`${expected}`, async () => {
      const got = await run();
      assert.equal(got, expected);
      produced.add(expected);
    });
  }

  it("a malformed reference is missing-field and never reaches op", async () => {
    const { cause, world } = await causeOf({ keychain: { "sa-a": "a" }, op: { accounts } }, "op://V/i");
    assert.equal(cause, "missing-field");
    assert.equal(world.calls().filter((c) => c.tool === "op").length, 0);
  });

  it("a reserved name is reserved-name", async () => {
    const world = makeWorld({ keychain: { "sa-a": "a" }, op: { accounts } });
    cleanups.push(world.cleanup);
    const { results } = await createSecrets(world.tools).resolveProject(project([["PATH", "op://V/i/x"]]));
    assert.equal(results[0].cause, "reserved-name");
    produced.add("reserved-name");
  });

  it("every id is produced by a case here", () => {
    assert.deepEqual([...CAUSES].filter((c) => !produced.has(c)), []);
  });
});

describe("no tool output and no value reaches the log, the RPC result or the Test row", () => {
  const STDERR = "STDERR-SENTINEL-7f3a";
  const VALUE = "VALUE-SENTINEL-9c1d";

  for (const [label, stderr, expected] of [
    ["unrecognised wording", `[ERROR] ${STDERR} ${VALUE}`, "unexpected"],
    ["authentication wording", `[ERROR] 401 Authentication: ${STDERR} ${VALUE}`, "rejected-token"],
  ] as const) {
    it(`${label}: failed variable logs its id only`, async () => {
      const root = realpathSync(mkdtempSync(join(tmpdir(), "project-env-root-")));
      cleanups.push(() => rmSync(root, { recursive: true, force: true }));
      const world = makeWorld({
        keychain: { "sa-a": "a" },
        op: {
          accounts: { a: { refs: { "op://V/i/good": VALUE } } },
          fail: { "op://V/i/bad": { stderr, code: 1 } },
        },
        git: {
          answers: {
            [["-C", root, "rev-parse", "--path-format=absolute", "--git-common-dir"].join("\0")]: `${root}/.git\n`,
            [["-C", root, "rev-parse", "--show-toplevel"].join("\0")]: `${root}\n`,
            [["-C", root, "worktree", "list", "--porcelain"].join("\0")]: `worktree ${root}\n`,
          },
        },
      });
      cleanups.push(world.cleanup);
      const p = project([["BAD", "op://V/i/bad"], ["GOOD", "op://V/i/good"]], "sa-a", root);

      const logged: string[] = [];
      for (const method of ["log", "info", "warn", "error", "debug"] as const) {
        mock.method(console, method, (...args: unknown[]) => void logged.push(args.map(String).join(" ")));
      }
      const before = new Map<string, (input: { request: unknown }) => Promise<unknown>>();
      const handlers = new Map<string, (input: unknown) => Promise<unknown>>();
      const server = {
        registerSettings: () => ({
          read: async () => ({ status: "ready", values: { projects: [p] } }),
          subscribe: () => () => {},
        }),
        before: (name: string, fn: never) => void before.set(name, fn),
        on: () => () => {},
        handle: (contract: { name: string }, fn: never) => void handlers.set(contract.name, fn),
      } as unknown as PluginServerContext;
      contribute(server, world.tools);

      await before.get("agent.session_open")!({
        request: { agentId: "a1", workspaceId: null, provider: "claude", cwd: root, reason: "create", purpose: "interactive", env: {} },
      });
      const result = rpc.testProject.output.parse(await handlers.get(rpc.testProject.name)!({ project: p }));
      const rows = result.results.map((r) => rowHint(r));

      const surfaces = [logged.join("\n"), JSON.stringify(result), rows.join("\n")];
      for (const text of surfaces) {
        assert.ok(!text.includes(STDERR), `stderr sentinel in: ${text}`);
        assert.ok(!text.includes(VALUE), `value sentinel in: ${text}`);
      }
      assert.ok(logged.includes(`[project-env] ${root} BAD: ${expected}`), logged.join("\n"));
      assert.equal(result.results[0].cause, expected);
      assert.equal(rows[1], "set");
    });
  }
});

describe("a command that fails with no stderr", () => {
  it("does not put its arguments, a token included, in the error", async () => {
    const TOKEN = "ops_fake_TOKEN-SENTINEL-2b8e";
    const world = makeWorld({ security: { crash: true } });
    cleanups.push(world.cleanup);
    await assert.rejects(createSecrets(world.tools).storeToken("sa-a", TOKEN), (error: Error) => {
      assert.ok(!error.message.includes("TOKEN-SENTINEL-2b8e"), error.message);
      assert.ok(!error.message.includes("add-generic-password"), error.message);
      return true;
    });
  });
});
