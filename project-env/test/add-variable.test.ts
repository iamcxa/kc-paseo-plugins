import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { newVariable, nameFromLabel, project, unsavedCount, type Project } from "../shared/config.ts";
import { pickerRows } from "../shared/field-picker.ts";
import { createSecrets } from "../server/secrets.ts";
import { makeWorld } from "./world.ts";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const c of cleanups.splice(0)) c();
});

const saved: Project = {
  root: "/w",
  serviceAccount: "sa-a",
  vault: "Dev",
  prompt: "",
  variables: [{ name: "A", ref: "op://Dev/x/a" }],
};
const withRows = (...variables: Project["variables"]): Project => ({ ...saved, variables: [...saved.variables, ...variables] });

describe("a row added from a field is one unsaved change", () => {
  it("counts an unnamed row, each unnamed row on its own, and not the naming of it", () => {
    const unnamed = { name: "", ref: "op://Dev/x/path" };
    assert.equal(unsavedCount(saved, withRows(unnamed)), 1);
    assert.equal(unsavedCount(saved, withRows(unnamed, { name: "", ref: "op://Dev/x/other" })), 2);
    assert.equal(unsavedCount(saved, withRows({ ...unnamed, name: "MY_PATH" })), 1);
  });
});

describe("a variable added by name has no field yet", () => {
  it("is accepted by the settings schema as a row with an empty reference", () => {
    const row = newVariable(nameFromLabel("NEW_API_KEY", ["A"]).name);
    assert.deepEqual(row, { name: "NEW_API_KEY", ref: "" });
    assert.equal(project.safeParse({ ...saved, variables: [row] }).success, true);
  });

  it("reads field-not-found at Test and never reaches 1Password", async () => {
    const world = makeWorld({ keychain: { "sa-a": "a" }, op: { accounts: { a: { vaults: ["Dev"] } } } });
    cleanups.push(world.cleanup);
    const { results } = await createSecrets(world.tools).resolveProject({
      ...saved,
      variables: [newVariable("NEW_API_KEY")],
    });
    assert.deepEqual(results, [{ name: "NEW_API_KEY", ok: false, cause: "missing-field" }]);
    assert.equal(world.calls().filter((c) => c.tool === "op" && c.argv[0] === "read").length, 0);
  });
});

describe("the picker in add mode", () => {
  const refs = ["op://Dev/Twilio/PATH", "op://Dev/Twilio/api key", "op://Dev/Sentry/SENTRY_AUTH_TOKEN", "op://Dev/Sentry/SENTRY_PROJECT"];
  const taken = ["SENTRY_AUTH_TOKEN"];
  const note = (label: string) => nameFromLabel(label, taken).state === "refused" ? "no name" : null;
  const rows = (holders: { name: string; ref: string }[]) =>
    pickerRows({ vault: "Dev", refs, skipped: [], name: null, current: "", holders, query: "", fieldNote: note });
  const field = (all: ReturnType<typeof rows>, label: string) => {
    const row = all.find((r) => r.kind === "field" && r.field === label);
    assert.ok(row && row.kind === "field");
    return row;
  };

  it("has no Suggested group and tags only the fields whose label would be refused", () => {
    const all = rows([]);
    assert.equal(all.some((r) => r.kind === "heading"), false);
    assert.equal(field(all, "PATH").note, "no name");
    assert.equal(field(all, "SENTRY_AUTH_TOKEN").note, "no name");
    assert.equal(field(all, "api key").note, null);
  });

  it("shows one note: the used-by mark wins, and a row with no name is not a holder", () => {
    const all = rows([{ name: "TOKEN", ref: "op://Dev/Sentry/SENTRY_AUTH_TOKEN" }, { name: "", ref: "op://Dev/Twilio/api key" }]);
    const used = field(all, "SENTRY_AUTH_TOKEN");
    assert.deepEqual([used.usedBy, used.note], [["TOKEN"], null]);
    assert.deepEqual(field(all, "api key").usedBy, []);
  });

  it("without a field note a field carries none", () => {
    const all = pickerRows({ vault: "Dev", refs, skipped: [], name: null, current: "", holders: [], query: "" });
    assert.equal(field(all, "PATH").note, null);
  });
});
