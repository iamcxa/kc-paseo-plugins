import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createSecrets } from "../server/secrets.ts";
import { makeWorld } from "./world.ts";

const OP_NAMES = ["OP_CONNECT_HOST", "OP_CONNECT_TOKEN", "OP_SESSION_my"];
const before = Object.fromEntries(OP_NAMES.map((name) => [name, process.env[name]]));
const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const [name, value] of Object.entries(before)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  for (const c of cleanups.splice(0)) c();
});

describe("every op call signs in as the configured service account", () => {
  it("passes no 1Password setting but the token, whatever the daemon carries", async () => {
    for (const name of OP_NAMES) process.env[name] = "fake-not-a-secret";
    const world = makeWorld({
      keychain: { "sa-x": "x" },
      op: {
        accounts: {
          x: {
            vaults: ["Dev"],
            refs: { "op://Dev/i/f": "v" },
            items: [{ id: "i1", title: "i", fields: [{ label: "f" }] }],
          },
        },
      },
    });
    cleanups.push(world.cleanup);
    const secrets = createSecrets(world.tools);

    await secrets.tokenStatus("sa-x");
    await secrets.storeToken("sa-x", "ops_fake_x");
    await secrets.listRefs("sa-x", "Dev");
    await secrets.resolveProject({
      root: "/repo",
      serviceAccount: "sa-x",
      vault: "Dev",
      variables: [{ name: "F", ref: "op://Dev/i/f" }],
    });

    const ops = world.calls().filter((c) => c.tool === "op");
    const kinds = new Set(ops.map((c) => c.argv.slice(0, 2).join(" ")));
    for (const kind of ["vault list", "item list", "item get", "read --no-newline"]) {
      assert.ok(kinds.has(kind), `no ${kind} call was made`);
    }
    for (const call of ops) {
      assert.deepEqual(call.opVars, ["OP_SERVICE_ACCOUNT_TOKEN"], call.argv.join(" "));
      assert.equal(call.account, "x", call.argv.join(" "));
    }
  });
});
