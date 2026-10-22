import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nameFromLabel } from "./shared/config.ts";

const used = ["SENTRY_AUTH_TOKEN", "STRIPE_KEY"];
const cases: [string, string, string][] = [
  ["STRIPE_SECRET_KEY", "kept", "STRIPE_SECRET_KEY"],
  ["api_key", "kept", "api_key"],
  ["apiKey", "kept", "apiKey"],
  ["path", "kept", "path"],
  ["  TRIMMED  ", "kept", "TRIMMED"],
  ["secret-key", "converted", "SECRET_KEY"],
  ["Publishable key", "converted", "PUBLISHABLE_KEY"],
  ["2fa code", "converted", "_2FA_CODE"],
  ["--x--", "converted", "X"],
  ["PATH", "refused", ""],
  ["LD_PRELOAD", "refused", ""],
  ["dyld insert", "refused", ""],
  ["dyld-insert", "refused", ""],
  ["SENTRY_AUTH_TOKEN", "refused", ""],
  ["sentry auth token", "refused", ""],
  ["op service account token", "refused", ""],
  ["密碼", "refused", ""],
  ["", "refused", ""],
];
describe("nameFromLabel", () => {
  for (const [label, state, name] of cases) {
    it(`${JSON.stringify(label)} is ${state}`, () => {
      const r = nameFromLabel(label, used);
      assert.equal(r.state, state);
      if (r.state !== "refused") assert.equal(r.name, name);
      else assert.equal(r.name, "");
    });
  }
  it("says why a name is refused", () => {
    assert.equal((nameFromLabel("PATH", used) as { why: string }).why, "reserved");
    assert.equal((nameFromLabel("sentry auth token", used) as { why: string }).why, "used");
    assert.equal((nameFromLabel("!!!", used) as { why: string }).why, "shape");
  });
  it("reserved and used reasons come from refusal", () => {
    assert.match((nameFromLabel("PATH", used) as { reason: string }).reason, /PATH is reserved: the agent needs its own value/);
    assert.match((nameFromLabel("sentry auth token", used) as { reason: string }).reason, /SENTRY_AUTH_TOKEN is already in this project/);
    assert.match((nameFromLabel("密碼", used) as { reason: string }).reason, /no letters or digits/);
  });
});
