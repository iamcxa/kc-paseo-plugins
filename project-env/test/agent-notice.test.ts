import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { CAUSES, causeSentence } from "../shared/cause.ts";
import * as rpc from "../shared/config.ts";
import type { Project } from "../shared/config.ts";
import { agentNotice } from "../server/agent-notice.ts";
import { contribute } from "../server/contribute.ts";
import { makeWorld } from "./world.ts";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const c of cleanups.splice(0)) c();
});

const NAMES = ["SENTRY_AUTH_TOKEN", "STRIPE_KEY"];
const REFS = ["op://Dev/SENTRY/SENTRY_AUTH_TOKEN", "op://Dev/stripe/secret-key"];

function create(variables: { name: string; ref: string }[], config: { systemPrompt?: string; internal?: boolean; cwd?: string } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "project-env-root-")));
  cleanups.push(() => rmSync(root, { recursive: true, force: true }));
  const world = makeWorld({
    git: {
      answers: {
        [["-C", root, "rev-parse", "--path-format=absolute", "--git-common-dir"].join("\0")]: `${root}/.git\n`,
        [["-C", root, "rev-parse", "--show-toplevel"].join("\0")]: `${root}\n`,
        [["-C", root, "worktree", "list", "--porcelain"].join("\0")]: `worktree ${root}\n`,
      },
    },
  });
  cleanups.push(world.cleanup);
  const project = { root, serviceAccount: "sa-a", vault: "Dev", variables, prompt: "LEGACY-PROMPT-TEXT" } as Project;
  const before = new Map<string, (input: { request: unknown }) => Promise<unknown>>();
  const server = {
    registerSettings: () => ({
      read: async () => ({ status: "ready", values: { projects: [project] } }),
      subscribe: () => () => {},
    }),
    before: (name: string, fn: never) => void before.set(name, fn),
    on: () => {},
    handle: () => {},
  } as unknown as PluginServerContext;
  contribute(server, world.tools);
  return before.get("agent.create")!({ request: { config: { cwd: root, ...config } } }) as Promise<
    { config: { systemPrompt?: string } } | undefined
  >;
}

const variables = NAMES.map((name, i) => ({ name, ref: REFS[i] }));

describe("the notice a new agent receives", () => {
  it("is added when the project injects at least one variable, after any prompt the agent already had", async () => {
    const out = await create(variables, { systemPrompt: "Existing instructions" });
    const prompt = out?.config.systemPrompt ?? "";
    assert.ok(prompt.startsWith("Existing instructions\n\n"));
    assert.ok(prompt.endsWith(agentNotice));
  });

  it("is the whole system prompt for an agent that had none", async () => {
    assert.equal((await create(variables))?.config.systemPrompt, agentNotice);
  });

  it("adds nothing for a project with no variables", async () => {
    assert.equal(await create([]), undefined);
  });

  it("adds nothing for an internal agent", async () => {
    assert.equal(await create(variables, { internal: true }), undefined);
  });

  it("never carries a prompt left in an older settings file", async () => {
    assert.ok(!(await create(variables))?.config.systemPrompt?.includes("LEGACY-PROMPT-TEXT"));
    const parsed = rpc.projectEnv.schema.parse({ projects: [{ root: "/r", prompt: "LEGACY-PROMPT-TEXT" }] });
    assert.ok(!("prompt" in parsed.projects[0]));
  });

  it("names no variable, reference or value", async () => {
    const notice = (await create(variables))?.config.systemPrompt ?? "";
    for (const text of [...NAMES, ...REFS, "op://"]) assert.ok(!notice.includes(text), text);
    assert.doesNotMatch(notice, /\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/);
  });

  it("says what a blank variable means and where to look", () => {
    assert.ok(agentNotice.includes("press Test"));
    assert.ok(agentNotice.includes("OVERVIEW.md"));
    assert.ok(agentNotice.includes("Setting it by hand is not the fix"));
    assert.ok(agentNotice.includes("do not suggest setting one in the environment"));
  });
});

describe("the troubleshooting notes", () => {
  const lines = readFileSync(join(import.meta.dirname, "../OVERVIEW.md"), "utf8").split("\n");
  for (const cause of CAUSES) {
    it(`explain ${cause} with the words the screen shows`, () => {
      const heading = `### ${causeSentence(cause).slice(0, -1)}`;
      assert.ok(lines.includes(heading), heading);
    });
  }
});
