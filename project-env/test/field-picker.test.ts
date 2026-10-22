import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasFields, pickerRows, sameName, splitRef, type PickerRow } from "../shared/field-picker.ts";
import { usableReference } from "../shared/ref.ts";

const refs = [
  "op://Dev/Twilio/TWILIO_ACCOUNT_SID",
  "op://Dev/Twilio/TWILIO_AUTH_TOKEN",
  "op://Dev/Sentry/SENTRY_AUTH_TOKEN",
  "op://Dev/Sentry/SENTRY_PROJECT",
  "op://Dev/Billing/Team/api_key",
  "op://Dev/Archive/SENTRY_AUTH_TOKEN",
];
const base = { vault: "Dev", refs, skipped: [], name: null, current: "", holders: [], query: "" };
const text = (rows: PickerRow[]) =>
  rows.map((r) =>
    r.kind === "field" ? `${r.item}>${r.field}` : r.kind === "item" ? `# ${r.item}` : r.kind === "heading" ? `## ${r.text}` : r.kind,
  );

describe("splitRef", () => {
  it("splits at the last slash so an item title may hold one", () => {
    assert.deepEqual(splitRef("op://Dev/Billing/Team/api_key", "Dev"), { item: "Billing/Team", field: "api_key" });
  });
  it("refuses a reference from another vault or without a field", () => {
    assert.equal(splitRef("op://Prod/Twilio/x", "Dev"), null);
    assert.equal(splitRef("op://Dev/Twilio", "Dev"), null);
  });
});

describe("grouping", () => {
  it("groups fields under their item, items by title", () => {
    assert.deepEqual(text(pickerRows(base)), [
      "# Archive", "Archive>SENTRY_AUTH_TOKEN",
      "# Billing/Team", "Billing/Team>api_key",
      "# Sentry", "Sentry>SENTRY_AUTH_TOKEN", "Sentry>SENTRY_PROJECT",
      "# Twilio", "Twilio>TWILIO_ACCOUNT_SID", "Twilio>TWILIO_AUTH_TOKEN",
    ]);
  });
});

describe("search", () => {
  it("keeps fields whose label matches, case-insensitively", () => {
    assert.deepEqual(text(pickerRows({ ...base, query: " project" })), ["# Sentry", "Sentry>SENTRY_PROJECT"]);
  });
  it("keeps every field of an item whose title matches", () => {
    assert.deepEqual(text(pickerRows({ ...base, query: "twil" })), [
      "# Twilio", "Twilio>TWILIO_ACCOUNT_SID", "Twilio>TWILIO_AUTH_TOKEN",
    ]);
  });
  it("has no field when nothing matches", () => {
    assert.equal(hasFields(pickerRows({ ...base, query: "zzz" })), false);
  });
});

describe("suggestion", () => {
  it("lists every field labelled like the variable first, once, with its item", () => {
    const rows = pickerRows({ ...base, name: "SENTRY_AUTH_TOKEN" });
    assert.deepEqual(text(rows).slice(0, 4), ["## Suggested", "Archive>SENTRY_AUTH_TOKEN", "Sentry>SENTRY_AUTH_TOKEN", "# Billing/Team"]);
    assert.equal(text(rows).filter((t) => t.endsWith(">SENTRY_AUTH_TOKEN")).length, 2);
  });
  it("suggests nothing for a different case or for no variable", () => {
    assert.ok(!text(pickerRows({ ...base, name: "sentry_project" })).includes("## Suggested"));
    assert.ok(!text(pickerRows(base)).includes("## Suggested"));
  });
  it("respects the search", () => {
    assert.ok(!text(pickerRows({ ...base, name: "SENTRY_PROJECT", query: "twilio" })).includes("## Suggested"));
  });
});

describe("marks", () => {
  it("marks a field another variable holds, not the variable being edited", () => {
    const holders = [
      { name: "A", ref: "op://Dev/Sentry/SENTRY_PROJECT" },
      { name: "B", ref: "op://Dev/Sentry/SENTRY_PROJECT" },
      { name: "ME", ref: "op://Dev/Sentry/SENTRY_PROJECT" },
    ];
    const row = pickerRows({ ...base, name: "ME", current: "op://Dev/Sentry/SENTRY_PROJECT", holders }).find(
      (r) => r.kind === "field" && r.field === "SENTRY_PROJECT",
    );
    assert.deepEqual(row && row.kind === "field" ? [row.usedBy, row.current] : null, [["A", "B"], true]);
  });
  it("shows a reference missing from the vault as Current, whatever the search", () => {
    const rows = pickerRows({ ...base, current: "op://Dev/Stripe/secret-key", query: "twilio" });
    assert.deepEqual(rows.slice(0, 2), [
      { kind: "heading", text: "Current" },
      { kind: "stale", ref: "op://Dev/Stripe/secret-key", label: "Stripe › secret-key" },
    ]);
  });
  it("puts the suggestion first and the current choice second, each once", () => {
    const rows = pickerRows({ ...base, name: "SENTRY_PROJECT", current: "op://Dev/Twilio/TWILIO_AUTH_TOKEN" });
    assert.deepEqual(text(rows).slice(0, 4), ["## Suggested", "Sentry>SENTRY_PROJECT", "## Current", "Twilio>TWILIO_AUTH_TOKEN"]);
    assert.equal(text(rows).filter((t) => t === "Twilio>TWILIO_AUTH_TOKEN").length, 1);
  });
  it("does not repeat the current choice when it is the suggestion", () => {
    const rows = pickerRows({ ...base, name: "SENTRY_PROJECT", current: "op://Dev/Sentry/SENTRY_PROJECT" });
    assert.ok(!text(rows).includes("## Current"));
    assert.equal(rows.filter((r) => r.kind === "field" && r.current).length, 1);
  });
  it("treats a reference into another vault as missing", () => {
    assert.equal(pickerRows({ ...base, current: "op://Prod/Sentry/x" })[1].kind, "stale");
  });
  it("does not call a field of an unreadable item missing", () => {
    const skipped = [{ item: "Deploy key", reason: "1Password could not read this item (ssh key)" }];
    assert.ok(!pickerRows({ ...base, skipped, current: "op://Dev/Deploy key/private" }).some((r) => r.kind === "stale"));
  });
  it("shows no stale row for a listed or empty reference", () => {
    assert.ok(!pickerRows({ ...base, current: refs[0] }).some((r) => r.kind === "stale"));
    assert.ok(!pickerRows(base).some((r) => r.kind === "stale"));
  });
});

describe("not listed", () => {
  const skipped = [{ item: "Deploy key", reason: "1Password could not read this item (ssh key)" }];
  it("closes the list with unreadable items and their reason", () => {
    const rows = pickerRows({ ...base, skipped });
    assert.deepEqual(rows.slice(-2), [
      { kind: "heading", text: "Not listed" },
      { kind: "not-listed", item: "Deploy key", reason: "1Password could not read this item (ssh key)" },
    ]);
  });
  it("follows the search by item title", () => {
    assert.ok(!pickerRows({ ...base, skipped, query: "twilio" }).some((r) => r.kind === "not-listed"));
    assert.ok(pickerRows({ ...base, skipped, query: "deploy" }).some((r) => r.kind === "not-listed"));
  });
});

describe("sameName", () => {
  it("compares a label with the variable name exactly", () => {
    assert.equal(sameName("SENTRY_PROJECT", "SENTRY_PROJECT"), true);
    assert.equal(sameName("sentry_project", "SENTRY_PROJECT"), false);
    assert.equal(sameName("SENTRY_PROJECT ", "SENTRY_PROJECT"), false);
  });
});

describe("typed reference", () => {
  it("accepts a reference in the project's vault, trimmed, with a section in the item", () => {
    assert.equal(usableReference("  op://Dev/Notary scan/scan ", "Dev"), true);
    assert.equal(usableReference("op://Dev/Billing/Team/api_key", "Dev"), true);
  });
  it("refuses a reference with an empty or blank path segment, as the server's parseRef does", () => {
    assert.equal(usableReference("op://Dev/item//field", "Dev"), false);
    assert.equal(usableReference("op://Dev/ /field", "Dev"), false);
    assert.equal(usableReference("op://Dev//field", "Dev"), false);
    assert.equal(usableReference("op://Dev/item/field/", "Dev"), false);
  });
  it("refuses a reference without a field, from another vault, or without op://", () => {
    assert.equal(usableReference("op://Dev/item", "Dev"), false);
    assert.equal(usableReference("op://Prod/item/field", "Dev"), false);
    assert.equal(usableReference("Dev/item/field", "Dev"), false);
  });
});
