import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { PluginServerContext } from "@getpaseo/plugin/server";
import * as rpc from "../shared/config.ts";
import { causeText } from "../shared/cause.ts";
import { contribute } from "../server/contribute.ts";
import { makeWorld, type FakeItem, type Scenario } from "./world.ts";

const worlds: ReturnType<typeof makeWorld>[] = [];
afterEach(() => {
  for (const w of worlds.splice(0)) w.cleanup();
});

const STDERR = "SNTNL-4f2a";
const VALUE = "VALUE-SENTINEL-9c1d";

const login: FakeItem = {
  id: "i-login",
  title: "Linear",
  category: "LOGIN",
  fields: [
    { label: "username", type: "STRING", purpose: "USERNAME", value: VALUE },
    { label: "password", type: "CONCEALED", purpose: "PASSWORD", value: VALUE },
  ],
};
const note: FakeItem = {
  id: "i-note",
  title: "Deploy notes",
  category: "SECURE_NOTE",
  fields: [
    { label: "notesPlain", type: "STRING", purpose: "NOTES", value: VALUE },
    { label: "api_key", type: "CONCEALED", value: VALUE },
    { label: "region", type: "STRING", value: VALUE },
  ],
};
const sshKey: FakeItem = { id: "i-ssh", title: "Deploy key", category: "SSH_KEY", fields: [] };

const READABLE_REFS = [
  "op://Dev/Linear/username",
  "op://Dev/Linear/password",
  "op://Dev/Deploy notes/api_key",
  "op://Dev/Deploy notes/region",
];

function listRefsHandler(op: NonNullable<Scenario["op"]>, keychain: Scenario["keychain"] = { "sa-a": "a" }) {
  const world = makeWorld({ keychain, op });
  worlds.push(world);
  const handlers = new Map<string, (input: unknown) => Promise<unknown>>();
  const server = {
    registerSettings: () => ({
      read: async () => ({ status: "ready", values: { projects: [] } }),
      subscribe: () => () => {},
    }),
    before: () => {},
    on: () => () => {},
    handle: (contract: { name: string }, fn: never) => void handlers.set(contract.name, fn),
  } as unknown as PluginServerContext;
  contribute(server, world.tools);
  const call = () => handlers.get(rpc.listRefs.name)!({ serviceAccount: "sa-a", vault: "Dev" });
  return { call };
}

const account = (items: FakeItem[]) => ({ accounts: { a: { items } } });

describe("Browse vault with an item that cannot be read", () => {
  it("lists the other items' fields and names the skipped item with a plain reason", async () => {
    const { call } = listRefsHandler({
      ...account([login, sshKey, note]),
      fail: { "item get i-ssh": { stderr: "[ERROR] invalid PEM private key passed in" } },
    });
    const result = rpc.listRefs.output.parse(await call());
    assert.deepEqual(result.refs, READABLE_REFS);
    assert.deepEqual(result.skipped, [
      { item: "Deploy key", reason: "1Password could not read this item (ssh key)" },
    ]);
  });

  it("leaves the type out when op gives no usable category", async () => {
    const { call } = listRefsHandler({
      ...account([login, { ...sshKey, category: "ssh key!" }]),
      fail: { "item get i-ssh": { stderr: "[ERROR] invalid PEM private key passed in" } },
    });
    const result = rpc.listRefs.output.parse(await call());
    assert.deepEqual(result.skipped, [{ item: "Deploy key", reason: "1Password could not read this item" }]);
  });

  it("lists a Secure Note's custom fields but not its notes body", async () => {
    const { call } = listRefsHandler(account([note]));
    const result = rpc.listRefs.output.parse(await call());
    assert.deepEqual(result.refs, ["op://Dev/Deploy notes/api_key", "op://Dev/Deploy notes/region"]);
    assert.deepEqual(result.skipped, []);
  });

  for (const [label, stderr, cause] of [
    ["a rejected token", "[ERROR] 401 Authentication: invalid service account token", "rejected-token"],
    ["an unreachable 1Password", "[ERROR] network is unreachable", "unreachable"],
  ] as const) {
    it(`stops the whole list on ${label} instead of naming every item`, async () => {
      const { call } = listRefsHandler({
        ...account([login, sshKey, note]),
        fail: { "item get i-ssh": { stderr } },
      });
      await assert.rejects(call, { message: causeText[cause] });
    });
  }

  it("stops with fixed text when no token is stored", async () => {
    const { call } = listRefsHandler(account([login]), {});
    await assert.rejects(call, { message: causeText["no-token"] });
  });
});

describe("Browse vault never shows op output or a value", () => {
  const cases: [string, NonNullable<Scenario["op"]>][] = [
    ["a failing item list", { ...account([login, note]), fail: { "item list": { stderr: `[ERROR] ${STDERR}` } } }],
    ["a skipped item's failing get", { ...account([login, sshKey, note]), fail: { "item get i-ssh": { stderr: `[ERROR] ${STDERR}` } } }],
    ["a rejected-token get", { ...account([login, note]), fail: { "item get i-login": { stderr: `[ERROR] 401 ${STDERR}` } } }],
    ["malformed item list output", { ...account([login, note]), raw: { "item list": `${STDERR} not json` } }],
    ["malformed item get output", { ...account([login, sshKey, note]), raw: { "item get i-ssh": `${STDERR} not json` } }],
  ];

  for (const [label, op] of cases) {
    it(label, async () => {
      const { call } = listRefsHandler(op);
      let shown: string;
      try {
        shown = JSON.stringify(await call());
      } catch (error) {
        shown = (error as Error).message;
      }
      assert.ok(!shown.includes(STDERR), `stderr sentinel in: ${shown}`);
      assert.ok(!shown.includes(VALUE), `value sentinel in: ${shown}`);
    });
  }

  it("a malformed get still lists the other items", async () => {
    const { call } = listRefsHandler(cases[4][1]);
    const result = rpc.listRefs.output.parse(await call());
    assert.deepEqual(result.refs, READABLE_REFS);
    assert.deepEqual(result.skipped.map((s) => s.item), ["Deploy key"]);
  });
});
