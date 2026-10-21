import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CAUSES, causeText, rowHint } from "../shared/cause.ts";
import { classifyOpFailure, failureLine, parseRef } from "../server/cause.ts";

describe("classifyOpFailure", () => {
  const table: [string, Parameters<typeof classifyOpFailure>[0], string][] = [
    ["an authentication error", { code: 1, stderr: "[ERROR] 401 Authentication: invalid service account token\n" }, "rejected-token"],
    ["an undecodable service account token", { code: 8, stderr: "[ERROR] failed to DecodeSACredentials: invalid credentials provided" }, "rejected-token"],
    ["a missing item", { code: 1, stderr: `[ERROR] "op://V/i/f" isn't an item in the vault\n` }, "missing-field"],
    ["a missing vault", { code: 1, stderr: `[ERROR] "V" isn't a vault in this account\n` }, "missing-field"],
    ["a missing field", { code: 1, stderr: `[ERROR] "f" isn't a field in the item\n` }, "missing-field"],
    ["an unresolvable host", { code: 1, stderr: "dial tcp: lookup my.1password.com: no such host" }, "unreachable"],
    ["a killed process", { code: null, killed: true, signal: "SIGTERM", stderr: "" }, "unreachable"],
    ["a missing binary", { code: "ENOENT", stderr: "" }, "unexpected"],
    ["unrecognised wording", { code: 1, stderr: "[ERROR] something new" }, "unexpected"],
    ["an item named like an auth error", { code: 1, stderr: `[ERROR] "op://V/invalid token/f" isn't an item in the vault` }, "missing-field"],
  ];
  for (const [label, exit, expected] of table) {
    it(`${label} is ${expected}`, () => assert.equal(classifyOpFailure(exit), expected));
  }

  it("never throws, and answers unexpected, on input of the wrong shape", () => {
    for (const bad of [{}, { stderr: undefined }, { stderr: 42 }, { code: {}, stderr: null }, { signal: 9 }]) {
      assert.equal(classifyOpFailure(bad as never), "unexpected");
    }
  });
});

describe("parseRef", () => {
  it("splits vault, item and field", () => {
    assert.deepEqual(parseRef("op://V/item/field"), { vault: "V", item: "item", field: "field" });
    assert.deepEqual(parseRef("op://V/item/section/field"), { vault: "V", item: "item", field: "field" });
  });
  it("refuses a reference without vault, item and field", () => {
    for (const ref of ["op://V/item", "op://V//f", "op://", "https://V/i/f"]) assert.equal(parseRef(ref), null, ref);
  });
});

describe("cause text", () => {
  it("has one plain phrase per id and no placeholder for tool text", () => {
    assert.deepEqual(Object.keys(causeText).sort(), [...CAUSES].sort());
    for (const text of Object.values(causeText)) assert.match(text, /^[a-z0-9 ]+$/i);
  });
  it("the Test row reads set, or failed with the phrase", () => {
    assert.equal(rowHint({ ok: true }), "set");
    assert.equal(rowHint({ ok: false, cause: "rejected-token" }), "failed: 1Password rejected the token");
    assert.equal(
      rowHint({ ok: false, cause: "outside-vault" }),
      "failed: reference points outside the chosen vault",
    );
  });
  it("the log line carries the id, never the phrase", () => {
    assert.equal(failureLine("/repo", "TOKEN", "outside-vault"), "[project-env] /repo TOKEN: outside-vault");
  });
});
