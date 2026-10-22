import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { connectionLine, type TokenStatus } from "../shared/token.ts";

const ok = (vaults: string[]): TokenStatus => ({ state: "ok", vaults, vaultIds: vaults.map((v) => `vid-${v}`) });
const line = (over: Partial<Parameters<typeof connectionLine>[0]>) =>
  connectionLine({ vault: "Dev", fetching: false, failed: false, status: ok(["Dev"]), ...over });

describe("the connection line", () => {
  it("is connected only when the token works and the chosen vault is readable", () => {
    assert.deepEqual(line({}), { kind: "connected" });
    assert.deepEqual(line({ vault: "vid-Dev" }), { kind: "connected" });
  });
  it("says checking while a check runs or has not answered", () => {
    assert.deepEqual(line({ fetching: true }), { kind: "checking" });
    assert.deepEqual(line({ status: undefined }), { kind: "checking" });
  });
  it("is a problem naming the cause for each failed token state", () => {
    for (const state of ["missing", "locked", "op-missing", "unreachable", "rejected", "truncated", "unexpected"] as const) {
      const result = line({ status: { state, vaults: [], vaultIds: [] } });
      assert.equal(result.kind, "problem", state);
    }
    assert.deepEqual(line({ status: { state: "rejected", vaults: [], vaultIds: [] } }), {
      kind: "problem",
      label: "1Password rejected the token",
    });
  });
  it("is a problem when the vault is unreadable, empty, or the token reads none", () => {
    assert.deepEqual(line({ vault: "Prod" }), { kind: "problem", label: "This token cannot read Prod" });
    assert.deepEqual(line({ vault: "" }), { kind: "problem", label: "No vault chosen" });
    assert.equal(line({ status: ok([]) }).kind, "problem");
  });
  it("is a problem when the check itself failed", () => {
    assert.deepEqual(line({ status: undefined, failed: true }), { kind: "problem", label: "Could not check the connection" });
  });
  it("is a problem when a recheck failed even though an earlier check succeeded", () => {
    assert.deepEqual(line({ failed: true }), { kind: "problem", label: "Could not check the connection" });
  });
});
