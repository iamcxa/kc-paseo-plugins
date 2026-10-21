import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { classifyKeychainFailure, classifyTokenCheckFailure } from "../server/cause.ts";
import { createSecrets } from "../server/secrets.ts";
import type { TokenState } from "../shared/config.ts";
import { pickVault, tokenRowText } from "../shared/token.ts";
import { makeWorld, type Scenario } from "./world.ts";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const c of cleanups.splice(0)) c();
});

const SENTINEL = "SENTINEL-do-not-show-7f3a";
const ACCOUNT = "sa-x";
const withKeychain = (scenario: Scenario): Scenario => ({ keychain: { [ACCOUNT]: "x" }, ...scenario });
const accounts = { x: { vaults: ["Dev", "Prod"] } };

async function status(scenario: Scenario, tools?: { op?: string }) {
  const world = makeWorld(scenario);
  cleanups.push(world.cleanup);
  return createSecrets({ ...world.tools, ...tools }).tokenStatus(ACCOUNT);
}

describe("each token failure has its own state", () => {
  const cases: [string, Scenario, TokenState, { op?: string }?][] = [
    ["no item in the Keychain", { op: { accounts } }, "missing"],
    ["Keychain refuses with exit 128", withKeychain({ security: { find: { exit: 128, stderr: SENTINEL } }, op: { accounts } }), "locked"],
    ["Keychain refuses with exit 36", withKeychain({ security: { find: { exit: 36, stderr: SENTINEL } }, op: { accounts } }), "locked"],
    ["Keychain fails some other way", withKeychain({ security: { find: { exit: 1, stderr: SENTINEL } }, op: { accounts } }), "unexpected"],
    ["op is not installed", withKeychain({ op: { accounts } }), "op-missing", { op: "/nonexistent/op" }],
    ["op cannot decode the token", withKeychain({ op: { accounts, vaultListFail: { stderr: `[ERROR] failed to DecodeSACredentials: ${SENTINEL}`, code: 8 } } }), "rejected"],
    ["1Password answers 401", withKeychain({ keychain: { [ACCOUNT]: "unknown" }, op: { accounts } }), "rejected"],
    ["the network is down", withKeychain({ op: { accounts, vaultListFail: { stderr: `dial tcp: no such host ${SENTINEL}` } } }), "unreachable"],
    ["op fails in a way nobody has seen", withKeychain({ op: { accounts, vaultListFail: { stderr: `[ERROR] ${SENTINEL}` } } }), "unexpected"],
    ["the stored token is 128 characters", withKeychain({ keychain: { [ACCOUNT]: "x".repeat(119) }, op: { accounts } }), "truncated"],
    ["everything works", withKeychain({ op: { accounts } }), "ok"],
  ];
  for (const [label, scenario, expected, tools] of cases) {
    it(`${label} is ${expected}`, async () => {
      const result = await status(scenario, tools);
      assert.equal(result.state, expected);
      const shown = JSON.stringify([result, tokenRowText(result)]);
      assert.equal(shown.includes(SENTINEL), false, "tool output reached the rendered text");
    });
  }

  it("a locked Keychain or a killed lookup is locked, a crash is not", () => {
    assert.equal(classifyKeychainFailure({ code: null, killed: true, signal: "SIGTERM" }), "locked");
    assert.equal(classifyKeychainFailure({ code: null, killed: false, signal: "SIGSEGV" }), "unexpected");
    assert.equal(classifyKeychainFailure({ code: 44 }), "missing");
  });
  it("op ENOENT is op-missing; a killed op is unreachable", () => {
    assert.equal(classifyTokenCheckFailure({ code: "ENOENT", stderr: "" }), "op-missing");
    assert.equal(classifyTokenCheckFailure({ code: null, killed: true, signal: "SIGTERM" }), "unreachable");
    assert.equal(classifyTokenCheckFailure({ code: 8, stderr: "[ERROR] failed to DecodeSACredentials: invalid credentials provided" }), "rejected");
  });
});

describe("the token row text", () => {
  it("gives each of the eight states its own label", () => {
    const states: TokenState[] = ["missing", "locked", "op-missing", "unreachable", "rejected", "truncated", "unexpected", "ok"];
    const labels = states.map((state) => tokenRowText({ state, vaults: ["Dev"] }).label);
    assert.equal(new Set(labels).size, states.length);
  });
  it("lists the readable vaults, and a token that reads none says so in the headline", () => {
    assert.equal(tokenRowText({ state: "ok", vaults: ["Dev"] }).hint, "Can read 1 vault: Dev");
    assert.equal(tokenRowText({ state: "ok", vaults: ["Dev", "Prod"] }).hint, "Can read 2 vaults: Dev, Prod");
    assert.match(tokenRowText({ state: "ok", vaults: [] }).label, /no vault/);
  });
});

describe("pickVault", () => {
  it("chooses the only readable vault when none is chosen, and nothing else", () => {
    assert.equal(pickVault("", ["Dev"]), "Dev");
    assert.equal(pickVault("Prod", ["Dev"]), "Prod");
    assert.equal(pickVault("", ["Dev", "Prod"]), "");
    assert.equal(pickVault("", []), "");
  });
});

describe("checkToken takes the token itself", () => {
  it("checks a token that is in no Keychain", async () => {
    const world = makeWorld({ op: { accounts } });
    cleanups.push(world.cleanup);
    const secrets = createSecrets(world.tools);
    assert.deepEqual(await secrets.checkToken("ops_fake_x"), { state: "ok", vaults: ["Dev", "Prod"] });
    assert.equal((await secrets.checkToken("ops_fake_nobody")).state, "rejected");
    assert.equal(world.calls().some((c) => c.tool === "security"), false);
    const before = world.calls().length;
    assert.equal((await secrets.checkToken("  ")).state, "rejected");
    assert.equal(world.calls().length, before, "an empty token must not reach op, which would fall back to the desktop app");
  });
});
