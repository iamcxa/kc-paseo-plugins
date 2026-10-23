import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addNote, nameFromLabel } from "../shared/config.ts";

const used = ["SENTRY_AUTH_TOKEN", "STRIPE_KEY"];

describe("nameFromLabel keeps a label that is already a name", () => {
  const kept: [string, string][] = [
    ["STRIPE_SECRET_KEY", "STRIPE_SECRET_KEY"],
    ["api_key", "api_key"],
    ["apiKey", "apiKey"],
    ["path", "path"],
    ["  TRIMMED  ", "TRIMMED"],
  ];
  for (const [label, name] of kept) {
    it(JSON.stringify(label), () => assert.deepEqual(nameFromLabel(label, used), { name, state: "kept" }));
  }
});

describe("nameFromLabel converts any other label to upper snake case", () => {
  const converted: [string, string][] = [
    ["secret-key", "SECRET_KEY"],
    ["Publishable key", "PUBLISHABLE_KEY"],
    ["2fa code", "_2FA_CODE"],
    ["--x--", "X"],
  ];
  for (const [label, name] of converted) {
    it(JSON.stringify(label), () => assert.deepEqual(nameFromLabel(label, used), { name, state: "converted" }));
  }
});

describe("nameFromLabel refuses with an empty name and says why", () => {
  const refused: [string, "reserved" | "used" | "shape", RegExp][] = [
    ["PATH", "reserved", /PATH is reserved: the agent needs its own value/],
    ["LD_PRELOAD", "reserved", /LD_PRELOAD is reserved/],
    ["dyld insert", "reserved", /DYLD_INSERT is reserved/],
    ["op service account token", "reserved", /OP_SERVICE_ACCOUNT_TOKEN is reserved/],
    ["SENTRY_AUTH_TOKEN", "used", /SENTRY_AUTH_TOKEN is already in this project/],
    ["sentry auth token", "used", /SENTRY_AUTH_TOKEN is already in this project/],
    ["密碼", "shape", /no letters or digits/],
    ["!!!", "shape", /no letters or digits/],
    ["", "shape", /Name this variable/],
  ];
  for (const [label, why, reason] of refused) {
    it(JSON.stringify(label), () => {
      const r = nameFromLabel(label, used);
      assert.equal(r.state, "refused");
      assert.equal(r.name, "");
      assert.equal(r.state === "refused" && r.why, why);
      assert.match(r.state === "refused" ? r.reason : "", reason);
    });
  }
});

describe("addNote tags a field whose label would be refused", () => {
  it("says who names it", () => {
    assert.equal(addNote("PATH", used), "reserved; you name it");
    assert.equal(addNote("sentry auth token", used), "name in use; you name it");
    assert.equal(addNote("密碼", used), "you name it");
    assert.equal(addNote("secret-key", used), null);
    assert.equal(addNote("STRIPE_WEBHOOK_SECRET", used), null);
  });
});
