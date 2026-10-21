import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { isReservedName } from "../shared/config.ts";
import { createSecrets } from "../server/secrets.ts";
import { makeWorld } from "./world.ts";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const c of cleanups.splice(0)) c();
});

describe("token storage", () => {
  it("a stored token is read back and checked against 1Password", async () => {
    const world = makeWorld({ op: { accounts: { x: { vaults: ["Dev"] } } } });
    cleanups.push(world.cleanup);
    const secrets = createSecrets(world.tools);
    assert.deepEqual(await secrets.tokenStatus("sa-x"), { state: "missing", vaults: [], vaultIds: [] });
    const stored = await secrets.storeToken("sa-x", "ops_fake_x");
    assert.deepEqual(stored, { stored: true, state: "ok", vaults: ["Dev"], vaultIds: ["vid-Dev"] });
    const written = world.calls().flatMap((c) => c.commands ?? []);
    assert.deepEqual(written, ['add-generic-password -U -a op-service-account-token -s sa-x -X <redacted>']);
  });
});

describe("main checkout", () => {
  function repo() {
    const dir = realpathSync(mkdtempSync(join(tmpdir(), "project-env-repo-")));
    cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
    mkdirSync(join(dir, "repo"));
    return join(dir, "repo");
  }
  const answers = (root: string, registered: string) => ({
    [["-C", root, "rev-parse", "--path-format=absolute", "--git-common-dir"].join("\0")]: `${root}/.git\n`,
    [["-C", root, "rev-parse", "--show-toplevel"].join("\0")]: `${root}\n`,
    [["-C", root, "worktree", "list", "--porcelain"].join("\0")]: `worktree ${registered}\n`,
  });

  it("names the repository root when git registers the worktree", async () => {
    const root = repo();
    const world = makeWorld({ git: { answers: answers(root, root) } });
    cleanups.push(world.cleanup);
    assert.equal(await createSecrets(world.tools).mainCheckout(root), root);
  });

  it("refuses a worktree the repository did not register", async () => {
    const root = repo();
    const world = makeWorld({ git: { answers: answers(root, "/somewhere/else") } });
    cleanups.push(world.cleanup);
    assert.equal(await createSecrets(world.tools).mainCheckout(root), null);
  });
});

describe("reserved names", () => {
  it("covers the names Paseo overwrites or deletes and the ones that break the agent", () => {
    for (const name of ["PATH", "HOME", "OP_SERVICE_ACCOUNT_TOKEN", "PASEO_AGENT_CWD", "CLAUDECODE"]) {
      assert.equal(isReservedName(name), true, name);
    }
    assert.equal(isReservedName("DATABASE_URL"), false);
  });
});
