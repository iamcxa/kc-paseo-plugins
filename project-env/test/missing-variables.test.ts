import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it, mock } from "node:test";
import type { PluginServerContext, PluginSessionOpenRequest } from "@getpaseo/plugin/server";
import { causeWords, missingVariablesTitle } from "../shared/cause.ts";
import * as rpc from "../shared/config.ts";
import type { Project } from "../shared/config.ts";
import { contribute } from "../server/contribute.ts";
import { createNotices, PENDING_TTL_MS } from "../server/missing-variables-notice.ts";
import { makeWorld, type Scenario } from "./world.ts";

const cleanups: (() => void)[] = [];
afterEach(() => {
  mock.restoreAll();
  mock.timers.reset();
  for (const c of cleanups.splice(0)) c();
});

const VALUE = "SECRET_FAKE_VALUE-91c4";
const STDERR = "RAW_TOOL_STDERR-7f3a";

function silenceConsole() {
  const logged: string[] = [];
  for (const method of ["log", "info", "warn", "error", "debug"] as const) {
    mock.method(console, method, (...args: unknown[]) => void logged.push(args.map(String).join(" ")));
  }
  return logged;
}

function harness(variables: [string, string][], scenario: Scenario, appendFails = false) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "project-env-root-")));
  cleanups.push(() => rmSync(root, { recursive: true, force: true }));
  const world = makeWorld({
    ...scenario,
    git: {
      answers: {
        [["-C", root, "rev-parse", "--path-format=absolute", "--git-common-dir"].join("\0")]: `${root}/.git\n`,
        [["-C", root, "rev-parse", "--show-toplevel"].join("\0")]: `${root}\n`,
        [["-C", root, "worktree", "list", "--porcelain"].join("\0")]: `worktree ${root}\n`,
      },
    },
  });
  cleanups.push(world.cleanup);
  const p: Project = {
    root,
    serviceAccount: "sa-a",
    vault: "V",
    variables: variables.map(([name, ref]) => ({ name, ref })),
  };
  const before = new Map<string, (input: { request: unknown }) => Promise<unknown>>();
  const on = new Map<string, (event: unknown, ctx: unknown) => unknown>();
  const appended: { agentId: string; item: unknown }[] = [];
  const ctx = {
    paseo: {
      agents: {
        ref: (agentId: string) => ({
          timeline: {
            append: async (item: unknown) => {
              if (appendFails) throw new Error("Request failed: Unknown agent");
              appended.push({ agentId, item });
              return { seq: appended.length, epoch: "e" };
            },
          },
        }),
      },
    },
  };
  const server = {
    registerSettings: () => ({
      read: async () => ({ status: "ready", values: { projects: [p] } }),
      subscribe: () => () => {},
    }),
    before: (name: string, fn: never) => void before.set(name, fn),
    on: (name: string, fn: never) => void on.set(name, fn),
    handle: () => {},
  } as unknown as PluginServerContext;
  contribute(server, world.tools);
  const open = (overrides: Partial<PluginSessionOpenRequest> = {}) =>
    before.get("agent.session_open")!({
      request: {
        agentId: "a1",
        workspaceId: null,
        provider: "claude",
        cwd: root,
        reason: "create",
        purpose: "interactive",
        env: {},
        ...overrides,
      },
    });
  const fire = (name: "agent.created" | "agent.closed" | "agent.turn_ended", agentId = "a1") =>
    on.get(name)!({ agent: { id: agentId } }, ctx);
  const setScenario = (next: Scenario) => {
    const current = JSON.parse(readFileSync(join(world.dir, "scenario.json"), "utf8"));
    writeFileSync(join(world.dir, "scenario.json"), JSON.stringify({ ...next, git: current.git }));
  };
  return { open, fire, appended, world, setScenario };
}

const accounts = {
  a: { refs: { "op://V/i/good": VALUE, "op://V/i/blank": "" } },
};
const failing: [string, string][] = [
  ["GOOD", "op://V/i/good"],
  ["MISSING", "op://V/i/nope"],
  ["BLANK", "op://V/i/blank"],
  ["ODD", "op://V/i/odd"],
];
const scenario: Scenario = {
  keychain: { "sa-a": "a" },
  op: { accounts, fail: { "op://V/i/odd": { stderr: `[ERROR] ${STDERR}`, code: 1 } } },
};

describe("the missing-variables row", () => {
  it("row holds only name and cause", async () => {
    silenceConsole();
    const h = harness(failing, scenario);
    await h.open();
    await h.fire("agent.created");
    assert.equal(h.appended.length, 1);
    assert.deepEqual(h.appended[0], {
      agentId: "a1",
      item: {
        type: "plugin",
        id: rpc.missingVariablesRowId,
        kind: "missing-variables",
        version: 1,
        data: {
          variables: [
            { name: "MISSING", cause: "missing-field" },
            { name: "BLANK", cause: "empty" },
            { name: "ODD", cause: "unexpected" },
          ],
        },
      },
    });
    const text = JSON.stringify(h.appended);
    assert.ok(!text.includes(VALUE), text);
    assert.ok(!text.includes(STDERR), text);
    assert.doesNotThrow(() => rpc.missingVariablesData.parse((h.appended[0].item as { data: unknown }).data));
  });

  it("a failed append is swallowed and logged once", async () => {
    const logged = silenceConsole();
    const h = harness(failing, scenario, true);
    await h.open();
    await assert.doesNotReject(async () => h.fire("agent.created"));
    const notices = logged.filter((l) => l.includes("could not add the missing-variables line"));
    assert.deepEqual(notices, [
      "[project-env] could not add the missing-variables line for agent a1: Request failed: Unknown agent",
    ]);
  });

  it("the line is added once per agent, never twice", async () => {
    silenceConsole();
    const h = harness(failing, scenario);
    await h.open();
    await h.fire("agent.created");
    await h.fire("agent.created");
    assert.equal(h.appended.length, 1);
  });

  it("a history opening resolves nothing and adds no line", async () => {
    silenceConsole();
    const h = harness(failing, scenario);
    assert.equal(await h.open({ purpose: "history" }), undefined);
    await h.fire("agent.created");
    assert.equal(h.appended.length, 0);
    assert.equal(h.world.calls().filter((c) => c.tool === "op").length, 0);
  });

  for (const reason of ["refresh", "import"] as const) {
    it(`a ${reason} opening still resolves but adds no line`, async () => {
      silenceConsole();
      const h = harness(failing, scenario);
      const opened = (await h.open({ reason })) as { env: Record<string, string> };
      assert.equal(opened.env.GOOD, VALUE);
      await h.fire("agent.created");
      await h.fire("agent.turn_ended");
      assert.equal(h.appended.length, 0);
    });
  }

  describe("a resumed agent", () => {
    it("shows a line naming each unreadable variable when the next turn ends, not at the opening", async () => {
      silenceConsole();
      const h = harness(failing, scenario);
      const opened = (await h.open({ reason: "resume" })) as { env: Record<string, string> };
      assert.equal(opened.env.GOOD, VALUE);
      assert.equal(opened.env.MISSING, "");
      assert.equal(h.appended.length, 0);
      await h.fire("agent.turn_ended");
      assert.equal(h.appended.length, 1);
      const row = h.appended[0].item as { id: string; kind: string; data: { resumed?: true; variables: { name: string; cause: string }[] } };
      assert.equal(row.kind, "missing-variables");
      assert.equal(row.data.resumed, true);
      assert.deepEqual(row.data.variables.map((v) => v.name), ["MISSING", "BLANK", "ODD"]);
      assert.notEqual(row.id, rpc.missingVariablesRowId);
      assert.doesNotThrow(() => rpc.missingVariablesData.parse(row.data));
      assert.ok(!JSON.stringify(h.appended).includes(VALUE));
    });

    it("adds the line once per opening, never again at a later turn end", async () => {
      silenceConsole();
      const h = harness(failing, scenario);
      await h.open({ reason: "resume" });
      await h.fire("agent.turn_ended");
      await h.fire("agent.turn_ended");
      assert.equal(h.appended.length, 1);
    });

    it("does not repeat the line when it is released and resumed again with the same failure", async () => {
      silenceConsole();
      const h = harness(failing, scenario);
      for (let i = 0; i < 3; i++) {
        await h.open({ reason: "resume" });
        await h.fire("agent.turn_ended");
        await h.fire("agent.closed");
      }
      assert.equal(h.appended.length, 1);
    });

    it("does not repeat a failure the new agent already showed when it started", async () => {
      silenceConsole();
      const h = harness(failing, scenario);
      await h.open();
      await h.fire("agent.created");
      await h.fire("agent.closed");
      await h.open({ reason: "resume" });
      await h.fire("agent.turn_ended");
      assert.equal(h.appended.length, 1);
      assert.equal((h.appended[0].item as { id: string }).id, rpc.missingVariablesRowId);
    });

    it("adds a new line at the end when the failure changes", async () => {
      silenceConsole();
      const h = harness(failing, scenario);
      await h.open({ reason: "resume" });
      await h.fire("agent.turn_ended");
      await h.fire("agent.closed");
      h.setScenario({ ...scenario, op: { accounts: { a: { refs: { "op://V/i/good": VALUE, "op://V/i/blank": "" } } } } });
      await h.open({ reason: "resume" });
      await h.fire("agent.turn_ended");
      assert.equal(h.appended.length, 2);
      const ids = h.appended.map((a) => (a.item as { id: string }).id);
      assert.notEqual(ids[0], ids[1]);
    });

    it("shows the same failure again after a resume in which every variable was readable", async () => {
      silenceConsole();
      const notices = createNotices();
      const rows: unknown[] = [];
      const failure = [{ name: "GOOD", cause: "empty" as const }];
      for (const failures of [failure, failure, [], failure]) {
        notices.record("a1", failures, { resumed: true });
        await notices.flush("a1", async (row) => void rows.push(row));
      }
      assert.equal(rows.length, 2);
    });

    it("shows the same failure again after a refresh in which every variable was readable", async () => {
      silenceConsole();
      const h = harness(failing, scenario);
      await h.open({ reason: "resume" });
      await h.fire("agent.turn_ended");
      await h.fire("agent.closed");
      h.setScenario({ keychain: scenario.keychain, op: { accounts: { a: { refs: { "op://V/i/good": VALUE, "op://V/i/nope": VALUE, "op://V/i/blank": VALUE, "op://V/i/odd": VALUE } } } } });
      await h.open({ reason: "refresh" });
      h.setScenario(scenario);
      mock.timers.enable({ apis: ["Date"], now: Date.now() + 16 * 60 * 1000 });
      await h.open({ reason: "resume" });
      await h.fire("agent.turn_ended");
      assert.equal(h.appended.length, 2);
    });

    it("waits beyond ten minutes for the turn to end", async () => {
      silenceConsole();
      let t = 0;
      const notices = createNotices({ now: () => t });
      notices.record("a1", [{ name: "GOOD", cause: "empty" }], { resumed: true });
      t = 3 * 60 * 60 * 1000;
      notices.record("a2", [{ name: "GOOD", cause: "empty" }], { resumed: true });
      const rows: unknown[] = [];
      await notices.flush("a1", async (row) => void rows.push(row));
      assert.equal(rows.length, 1);
    });

    it("adds nothing when the agent is released before a turn ends", async () => {
      silenceConsole();
      const h = harness(failing, scenario);
      await h.open({ reason: "resume" });
      await h.fire("agent.closed");
      await h.fire("agent.turn_ended");
      assert.equal(h.appended.length, 0);
    });

    it("adds no line when every variable is readable", async () => {
      silenceConsole();
      const h = harness([["GOOD", "op://V/i/good"]], scenario);
      await h.open({ reason: "resume" });
      await h.fire("agent.turn_ended");
      assert.equal(h.appended.length, 0);
    });
  });

  it("an opening with every variable set adds no line", async () => {
    silenceConsole();
    const h = harness([["GOOD", "op://V/i/good"]], scenario);
    await h.open();
    await h.fire("agent.created");
    assert.equal(h.appended.length, 0);
  });

  it("agent.closed drops what was remembered", async () => {
    silenceConsole();
    const h = harness(failing, scenario);
    await h.open();
    await h.fire("agent.closed");
    await h.fire("agent.created");
    assert.equal(h.appended.length, 0);
  });

  it("an entry is kept for other agents and keyed by agent id", async () => {
    silenceConsole();
    const h = harness(failing, scenario);
    await h.open({ agentId: "a1" });
    await h.fire("agent.created", "a2");
    assert.equal(h.appended.length, 0);
    await h.fire("agent.created", "a1");
    assert.equal(h.appended.length, 1);
  });
});

describe("the pending notices", () => {
  const failure = { name: "X", cause: "empty" as const };

  it("prunes an entry older than ten minutes on the next record", async () => {
    let clock = 1_000;
    const n = createNotices({ now: () => clock, log: () => {} });
    n.record("old", [failure]);
    clock += PENDING_TTL_MS + 1;
    n.record("new", [failure]);
    const rows: string[] = [];
    for (const id of ["old", "new"]) await n.flush(id, async () => void rows.push(id));
    assert.deepEqual(rows, ["new"]);
  });

  it("an entry younger than ten minutes survives", async () => {
    let clock = 0;
    const n = createNotices({ now: () => clock, log: () => {} });
    n.record("a", [failure]);
    clock += PENDING_TTL_MS - 1;
    n.record("b", [failure]);
    const rows: string[] = [];
    await n.flush("a", async () => void rows.push("a"));
    assert.deepEqual(rows, ["a"]);
  });

  it("record and flush never throw, whatever fails inside", async () => {
    const n = createNotices({
      now: () => {
        throw new Error("clock");
      },
      log: () => {
        throw new Error("log");
      },
    });
    assert.doesNotThrow(() => n.record("a", [failure]));
    const ok = createNotices({
      log: () => {
        throw new Error("log");
      },
    });
    ok.record("a", [failure]);
    await assert.doesNotReject(ok.flush("a", async () => Promise.reject(new Error("append"))));
    await assert.doesNotReject(ok.flush("missing", async () => {}));
  });

  it("records nothing for an empty failure list", async () => {
    const n = createNotices({ log: () => {} });
    n.record("a", []);
    let called = false;
    await n.flush("a", async () => void (called = true));
    assert.equal(called, false);
  });
});

describe("the row's words", () => {
  it("names each known class and falls back for an unknown one", () => {
    assert.equal(causeWords("rejected-token"), "1Password rejected the token");
    assert.equal(causeWords("from-a-newer-daemon"), "reason not available");
    assert.equal(causeWords("toString"), "reason not available");
  });

  it("counts the variables in the title", () => {
    assert.equal(missingVariablesTitle(1), "Started without 1 project variable");
    assert.equal(missingVariablesTitle(3), "Started without 3 project variables");
    assert.equal(missingVariablesTitle(1, true), "Resumed without 1 project variable");
    assert.equal(missingVariablesTitle(2, true), "Resumed without 2 project variables");
  });
});
