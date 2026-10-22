import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRef, pillView } from "../shared/ref.ts";
import { variableLine } from "../shared/config.ts";

const ref = (r: string, name: string, vault = "Dev") => pillView(r, name, vault) as Extract<ReturnType<typeof pillView>, { kind: "ref" }>;

describe("pillView", () => {
  it("reads item and field without the project's vault", () => {
    assert.deepEqual(pillView("op://Dev/SENTRY/SENTRY_PROJECT", "SENTRY_PROJECT", "Dev"), {
      kind: "ref", vault: null, item: "SENTRY", field: "SENTRY_PROJECT", differs: false,
    });
  });
  it("marks a field whose label differs from the variable name, and only then", () => {
    assert.equal(ref("op://Dev/stripe/secret-key", "STRIPE_KEY").differs, true);
    assert.equal(ref("op://Dev/stripe/secret-key", "secret-key").differs, false);
    assert.equal(ref("op://Dev/stripe/secret-key", "SECRET-KEY").differs, true);
  });
  it("names the vault only when the reference is not in the project's vault", () => {
    assert.equal(ref("op://Prod/a/b", "B").vault, "Prod");
    assert.equal(ref("op://Dev/a/b", "B", "").vault, "Dev");
    assert.equal(ref("op://Dev/a/b", "B").vault, null);
  });
  it("keeps everything between the vault and the field as the item, as the picker does", () => {
    const v = ref("op://Dev/TWILIO/Legacy section/TWILIO_FROM_NUMBER", "TWILIO_FROM_NUMBER");
    assert.deepEqual([v.item, v.field, v.differs], ["TWILIO/Legacy section", "TWILIO_FROM_NUMBER", false]);
  });
  it("shows a reference that is not item and field as typed, and an empty one as no field", () => {
    assert.deepEqual(pillView("op://Dev", "X", "Dev"), { kind: "raw", text: "op://Dev" });
    assert.deepEqual(pillView("", "X", "Dev"), { kind: "empty" });
  });
  it("keeps parseRef's contract for the server", () => {
    assert.deepEqual(parseRef("op://V/item/section/field"), { vault: "V", item: "item", field: "field" });
  });
});

describe("a row without a field", () => {
  it("has no status line of its own: the dashed pill says it", () => {
    assert.equal(variableLine({ name: "X", ref: "" }, undefined), null);
    assert.equal(variableLine({ name: "X", ref: "" }, { ok: false, cause: "missing-field" }), null);
  });
});
