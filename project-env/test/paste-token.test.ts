import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { afterEach, describe, it } from "node:test";
import { createSecrets } from "../server/secrets.ts";
import type { Project } from "../shared/config.ts";
import { addTokenCommand, projectsUsingName, serviceAccountNameError, tokenShapeError } from "../shared/token.ts";
import { makeWorld, type Scenario } from "./world.ts";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const c of cleanups.splice(0)) c();
});

const ACCOUNT = "sa-x";
const accounts = { x: { vaults: ["Dev"] }, old: { vaults: ["Old"] } };
const withOld = (scenario: Scenario): Scenario => ({ keychain: { [ACCOUNT]: "old" }, ...scenario });

function setup(scenario: Scenario, tools?: { op?: string }) {
  const world = makeWorld(scenario);
  cleanups.push(world.cleanup);
  const secrets = createSecrets({ ...world.tools, ...tools });
  const keychain = () =>
    execFileSync(world.tools.security, ["find-generic-password", "-a", "op-service-account-token", "-s", ACCOUNT, "-w"], {
      encoding: "utf8",
    }).trim();
  const securityCalls = () => world.calls().filter((c) => c.tool === "security");
  return { world, secrets, keychain, securityCalls };
}

const project = (root: string, serviceAccount: string): Project => ({
  root,
  serviceAccount,
  vault: "",
  variables: [],
});

describe("a token is written only after 1Password accepts it", () => {
  const refused: [string, Scenario, string, { op?: string }?][] = [
    ["rejected", withOld({ op: { accounts } }), "rejected"],
    ["unreachable", withOld({ op: { accounts, vaultListFail: { stderr: "dial tcp: no such host" } } }), "unreachable"],
    ["op missing", withOld({ op: { accounts } }), "op-missing", { op: "/nonexistent/op" }],
  ];
  for (const [label, scenario, state, tools] of refused) {
    it(`a ${label} token is not written and the token stored earlier stays`, async () => {
      const { secrets, keychain, securityCalls } = setup(scenario, tools);
      const pasted = label === "rejected" ? "ops_fake_nobody" : "ops_fake_x";
      const result = await secrets.storeToken(ACCOUNT, pasted);
      assert.deepEqual(result, { stored: false, state, vaults: [], vaultIds: [] });
      assert.deepEqual(securityCalls(), []);
      assert.equal(keychain(), "ops_fake_old");
    });
  }

  it("an accepted token is written, trimmed, and read back", async () => {
    const { secrets, keychain } = setup({ op: { accounts } });
    const result = await secrets.storeToken(ACCOUNT, "  ops_fake_x\n");
    assert.deepEqual(result, { stored: true, state: "ok", vaults: ["Dev"], vaultIds: ["vid-Dev"] });
    assert.equal(keychain(), "ops_fake_x");
  });

  it("a token with non-ASCII characters survives the hex route", async () => {
    const { secrets, keychain } = setup({ op: { accounts: { "é-ü": { vaults: [] } } } });
    assert.equal((await secrets.storeToken(ACCOUNT, "ops_fake_é-ü")).stored, true);
    assert.equal(keychain(), "ops_fake_é-ü");
  });
});

describe("projectsUsingName", () => {
  const projects = [project("/a", "shared"), project("/b", " shared "), project("/c", "other"), project("/d", "")];
  it("returns the other projects that use the name, trimmed, and none for the project's own", () => {
    assert.deepEqual(projectsUsingName(projects, "/c", "shared"), ["/a", "/b"]);
    assert.deepEqual(projectsUsingName(projects, "/a", "  shared"), ["/b"]);
    assert.deepEqual(projectsUsingName(projects, "/a", "other"), ["/c"]);
    assert.deepEqual(projectsUsingName(projects, "/c", "other"), []);
    assert.deepEqual(projectsUsingName(projects, "/c", "unused"), []);
  });
  it("an unsaved draft owns nothing, and an empty name matches no project", () => {
    assert.deepEqual(projectsUsingName(projects, "/new", "unused"), []);
    assert.deepEqual(projectsUsingName(projects, "/new", ""), []);
    assert.deepEqual(projectsUsingName(projects, "/new", "Shared"), []);
  });
});

describe("the shape of a token", () => {
  const tokenOf = (length: number) => `ops_${"a".repeat(length - 4)}`;
  it("refuses a token without ops_ and one of exactly 128 characters, accepts 127 and 129", () => {
    assert.match(tokenShapeError("abc_fake") ?? "", /ops_/);
    assert.match(tokenShapeError(tokenOf(128)) ?? "", /128 characters/);
    assert.equal(tokenShapeError(tokenOf(127)), null);
    assert.equal(tokenShapeError(tokenOf(129)), null);
  });

  it("refuses a token whose security command line would pass 3840 bytes, 256 under the measured 4096", () => {
    const fits = (account: string, length: number) =>
      new TextEncoder().encode(addTokenCommand(account, tokenOf(length))).length <= 3840;
    for (const account of [ACCOUNT, "", "é".repeat(200)]) {
      let longest = 128;
      while (fits(account, longest + 1)) longest += 1;
      assert.ok(longest > 1000 && longest < 1950, `${account.length}: ${longest}`);
      assert.equal(tokenShapeError(tokenOf(longest), account), null);
      assert.match(tokenShapeError(tokenOf(longest + 1), account) ?? "", /longer than this plugin can store safely/);
    }
    assert.match(tokenShapeError(tokenOf(2000), ACCOUNT) ?? "", /longer than this plugin can store safely/);
  });

  it("storeToken refuses an over-long token before any op or security call", async () => {
    const { secrets, world } = setup({ op: { accounts } });
    await assert.rejects(secrets.storeToken(ACCOUNT, tokenOf(2000)), /longer than this plugin can store safely/);
    assert.deepEqual(world.calls(), []);
  });

  it("storeToken makes each refusal before any op or security call", async () => {
    const { secrets, world } = setup({ op: { accounts } });
    for (const token of ["abc_fake_x", tokenOf(128), "ops_fake x", 'ops_fa"ke', "ops_fa'ke", "ops_fa\\ke", "ops_fake\nadd-generic-password", "ops_fa\u0007ke"]) {
      await assert.rejects(secrets.storeToken(ACCOUNT, token), JSON.stringify(token));
    }
    for (const name of ['sa"x', "sa\\x", "sa\nx", "sa\u0001x"]) {
      await assert.rejects(secrets.storeToken(name, "ops_fake_x"), JSON.stringify(name));
    }
    assert.deepEqual(world.calls(), []);
  });

  it("storeToken goes on to 1Password with 127 and 129 characters", async () => {
    for (const length of [127, 129]) {
      const account = "a".repeat(length - "ops_fake_".length);
      const { secrets } = setup({ op: { accounts: { [account]: { vaults: [] } } } });
      assert.equal((await secrets.storeToken(ACCOUNT, `ops_fake_${account}`)).stored, true, String(length));
    }
  });

  it("names with a quote, backslash or control character are refused", () => {
    assert.equal(serviceAccountNameError("relay-dev-read"), null);
    for (const name of ['a"b', "a\\b", "a\nb", "a\tb"]) assert.notEqual(serviceAccountNameError(name), null);
  });
});

describe("the token stays off the security command line", () => {
  const SENTINEL = "SENTINEL-4c1d9e";
  const hexOf = (text: string) => Buffer.from(text, "utf8").toString("hex");

  it("every security argv is -i or a read, and the token is in none of them", async () => {
    const { secrets, securityCalls } = setup({ op: { accounts: { [SENTINEL]: { vaults: [] } } } });
    assert.equal((await secrets.storeToken(ACCOUNT, `ops_fake_${SENTINEL}`)).stored, true);
    const calls = securityCalls();
    assert.ok(calls.length >= 2);
    for (const call of calls) {
      const reads = call.argv[0] === "find-generic-password";
      assert.ok(reads || call.argv.join(" ") === "-i", call.argv.join(" "));
      const shown = JSON.stringify(call);
      for (const secret of [SENTINEL, hexOf(`ops_fake_${SENTINEL}`)]) assert.ok(!shown.includes(secret), shown);
    }
  });

  it("a line break in a token cannot start a second command", async () => {
    const { secrets, world, keychain } = setup({ op: { accounts } });
    const injected = 'ops_fake_x\nadd-generic-password -U -a op-service-account-token -s "injected" -X 41';
    await secrets.writeToken(ACCOUNT, injected);
    const [call] = world.calls().filter((c) => c.tool === "security");
    assert.equal(call.commands?.length, 1);
    assert.equal(keychain(), injected);
    assert.throws(() => execFileSync(world.tools.security, ["find-generic-password", "-s", "injected", "-w"], { stdio: "pipe" }));
  });

  it("the write refuses a name that could end its quoted word", async () => {
    const { secrets, world } = setup({ op: { accounts } });
    for (const name of ['sa" -s "y', "sa\\", "sa\nadd-generic-password"]) {
      await assert.rejects(secrets.writeToken(name, "ops_fake_x"), JSON.stringify(name));
    }
    assert.deepEqual(world.calls(), []);
  });
});
