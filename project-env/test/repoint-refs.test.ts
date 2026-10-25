import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countPointingAt, markedOutside, repointLine, repointRefs, settleConnection } from "../shared/ref.ts";

const v = (name: string, ref: string) => ({ name, ref });
const dev = [
  v("SENTRY_AUTH_TOKEN", "op://Dev/SENTRY/SENTRY_AUTH_TOKEN"),
  v("STRIPE_KEY", "op://Dev/stripe/secret-key"),
  v("POSTHOG_CLI_API_KEY", "op://Dev/POSTHOG/POSTHOG_CLI_API_KEY"),
];
const refs = (list: { ref: string }[]) => list.map((x) => x.ref);

describe("repointRefs", () => {
  it("moves every reference written with the old vault, keeping names and the rest of the path", () => {
    const moved = repointRefs([...dev, v("FROM", "op://Dev/TWILIO/Legacy section/FROM")], "Dev", "agent-dev");
    assert.deepEqual(refs(moved), [
      "op://agent-dev/SENTRY/SENTRY_AUTH_TOKEN",
      "op://agent-dev/stripe/secret-key",
      "op://agent-dev/POSTHOG/POSTHOG_CLI_API_KEY",
      "op://agent-dev/TWILIO/Legacy section/FROM",
    ]);
    assert.deepEqual(moved.map((x) => x.name), [...dev.map((x) => x.name), "FROM"]);
  });
  it("leaves a reference into a third vault alone", () => {
    const list = [dev[0], v("TWILIO_AUTH_TOKEN", "op://Other/TWILIO/TWILIO_ACCOUNT_SID")];
    assert.deepEqual(refs(repointRefs(list, "Dev", "agent-dev")), ["op://agent-dev/SENTRY/SENTRY_AUTH_TOKEN", "op://Other/TWILIO/TWILIO_ACCOUNT_SID"]);
  });
  it("moves nothing when the previous vault is empty", () => {
    assert.deepEqual(repointRefs(dev, "", "agent-dev"), dev);
  });
  it("moves nothing when the new vault is empty or the same", () => {
    assert.deepEqual(repointRefs(dev, "Dev", ""), dev);
    assert.deepEqual(repointRefs(dev, "Dev", "Dev"), dev);
  });
  it("moves the references written with a vault id when the vault was saved by id, and only those", () => {
    const list = [v("A", "op://vid-Dev/a/A"), v("B", "op://Dev/b/B")];
    assert.deepEqual(refs(repointRefs(list, "vid-Dev", "agent-dev")), ["op://agent-dev/a/A", "op://Dev/b/B"]);
  });
  it("matches the vault exactly: another letter case or a longer name does not move", () => {
    const list = [v("A", "op://dev/a/A"), v("B", "op://Dev2/b/B"), v("C", "op://Development/c/C")];
    assert.deepEqual(repointRefs(list, "Dev", "agent-dev"), list);
  });
  it("leaves an empty reference and a reference that is not item and field as they are", () => {
    const list = [v("A", ""), v("B", "op://Dev")];
    assert.deepEqual(repointRefs(list, "Dev", "agent-dev"), list);
  });
});

describe("settleConnection", () => {
  const before = { serviceAccount: "sa-r", vault: "Dev" };
  const draft = { serviceAccount: "sa-r", vault: "agent-dev", variables: dev };
  it("Done points the old vault's references at the picked vault and keeps the picked vault", () => {
    const done = settleConnection(before, draft, "done");
    assert.equal(done.vault, "agent-dev");
    assert.deepEqual(refs(done.variables), refs(dev).map((r) => r.replace("op://Dev/", "op://agent-dev/")));
  });
  it("Cancel restores the previous connection and changes no reference", () => {
    const cancelled = settleConnection(before, { ...draft, serviceAccount: "sa-x" }, "cancel");
    assert.deepEqual(cancelled, { serviceAccount: "sa-r", vault: "Dev", variables: dev });
  });
});

describe("countPointingAt", () => {
  it("counts exact matches only, and nothing for an empty vault", () => {
    assert.equal(countPointingAt([...dev, v("X", "op://Other/x/X"), v("Y", "")], "Dev"), 3);
    assert.equal(countPointingAt(dev, ""), 0);
  });
});

describe("markedOutside", () => {
  it("marks a reference into another vault, and a different letter case", () => {
    assert.equal(markedOutside("op://Other/a/b", "Dev"), true);
    assert.equal(markedOutside("op://dev/a/b", "Dev"), true);
  });
  it("does not mark a reference in the vault, an empty or raw one, or any reference while no vault is chosen", () => {
    assert.equal(markedOutside("op://Dev/a/b", "Dev"), false);
    assert.equal(markedOutside("", "Dev"), false);
    assert.equal(markedOutside("op://Dev", "Dev"), false);
    assert.equal(markedOutside("op://Dev/a/b", ""), false);
  });
});

describe("repointLine", () => {
  it("says how many variables point at the old vault and that Done points them at the new one", () => {
    assert.deepEqual(repointLine(3, "Dev", "agent-dev"), {
      label: "3 variables point at Dev.",
      hint: "Done points them at agent-dev. Test then shows whether each field is there.",
    });
  });
  it("uses the singular for one variable", () => {
    assert.deepEqual(repointLine(1, "Dev", "agent-dev"), {
      label: "1 variable points at Dev.",
      hint: "Done points it at agent-dev. Test then shows whether each field is there.",
    });
  });
});
