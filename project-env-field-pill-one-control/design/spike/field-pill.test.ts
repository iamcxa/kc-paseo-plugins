import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRef, pillView, rpcReason, typedRefError } from "../shared/ref.ts";
import { variableLine } from "../shared/config.ts";

describe("pillView", () => {
  it("reads item and field without the project's vault", () => {
    assert.deepEqual(pillView("op://Dev/SENTRY/SENTRY_PROJECT", "SENTRY_PROJECT", "Dev"), {
      kind: "ref", vault: null, item: "SENTRY", field: "SENTRY_PROJECT", differs: false,
    });
  });
  it("marks a field whose label differs from the variable name, and only then", () => {
    const view = (name: string) => pillView("op://Dev/stripe/secret-key", name, "Dev");
    assert.equal((view("STRIPE_KEY") as { differs: boolean }).differs, true);
    assert.equal((view("secret-key") as { differs: boolean }).differs, false);
    assert.equal((view("SECRET-KEY") as { differs: boolean }).differs, true);
  });
  it("names the vault only when the reference is not in the project's vault", () => {
    assert.equal((pillView("op://Prod/a/b", "B", "Dev") as { vault: string | null }).vault, "Prod");
    assert.equal((pillView("op://Dev/a/b", "B", "") as { vault: string | null }).vault, "Dev");
  });
  it("keeps the whole path after the item, so a section is not hidden", () => {
    const v = pillView("op://Dev/TWILIO/Legacy section/TWILIO_FROM_NUMBER", "TWILIO_FROM_NUMBER", "Dev");
    assert.deepEqual(v, { kind: "ref", vault: null, item: "TWILIO", field: "Legacy section / TWILIO_FROM_NUMBER", differs: false });
  });
  it("shows a reference that does not parse as typed, and an empty one as no field", () => {
    assert.deepEqual(pillView("op://Dev", "X", "Dev"), { kind: "raw", text: "op://Dev" });
    assert.deepEqual(pillView("", "X", "Dev"), { kind: "empty" });
  });
});

describe("the picker's typed reference and failure text", () => {
  it("accepts only a reference the server can read", () => {
    assert.equal(typedRefError("op://Dev/item/field"), null);
    assert.equal(typedRefError(" op://Dev/item/field "), null);
    for (const bad of ["hello", "op://Dev/item", "op://Dev//f"]) assert.notEqual(typedRefError(bad), null, bad);
  });
  it("drops the host's request wrapper from a failure", () => {
    assert.equal(
      rpcReason("Request failed: 1Password could not be reached requestType=plugin.rpc.invoke.request code=handler_error"),
      "1Password could not be reached",
    );
    assert.equal(rpcReason("no token stored"), "no token stored");
  });
  it("keeps parseRef's contract", () => {
    assert.deepEqual(parseRef("op://V/item/section/field"), { vault: "V", item: "item", field: "field" });
  });
});

describe("a row without a field", () => {
  it("has no status line of its own: the pill says it", () => {
    assert.equal(variableLine({ name: "X", ref: "" }, undefined), null);
    assert.equal(variableLine({ name: "X", ref: "" }, { ok: false, cause: "missing-field" }), null);
  });
});
