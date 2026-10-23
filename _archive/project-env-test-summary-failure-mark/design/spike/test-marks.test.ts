import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CAUSES, causeSentence } from "../shared/cause.ts";
import type { Project } from "../shared/config.ts";
import { rowReason, summaryText, summaryParts, type Run } from "../shared/test-marks.ts";

const v = (name: string, ref = `op://V/${name}/x`) => ({ name, ref });
const project = (variables: Project["variables"], over: Partial<Project> = {}): Project => ({
  root: "/r", serviceAccount: "sa", vault: "V", prompt: "", variables, ...over,
});
const draft = project([v("A"), v("B"), v("C"), v("D"), v("E", "")]);
const run: Run = {
  sent: draft,
  results: [
    { name: "A", ok: true },
    { name: "B", ok: false, cause: "empty" },
    { name: "C", ok: false, cause: "missing-field" },
    { name: "D", ok: true },
    { name: "E", ok: false, cause: "missing-field" },
  ],
};
const text = (d: Project, r: Run | undefined, testing = false) => summaryText(summaryParts(d, r, testing));
const edit = (d: Project, name: string, ref: string) =>
  project(d.variables.map((x) => (x.name === name ? { ...x, ref } : x)));

describe("the sentence a (!) opens", () => {
  it("is a capitalised sentence for every cause", () => {
    for (const c of CAUSES) assert.match(causeSentence(c), /^[A-Z0-9][A-Za-z0-9 ]+\.$/);
    assert.equal(causeSentence("empty"), "The 1Password field is empty.");
    assert.equal(causeSentence(undefined), causeSentence("unexpected"));
  });
});

describe("a row's mark", () => {
  it("is the reason of a failed row and nothing for set or no-field rows", () => {
    assert.equal(rowReason(draft, run, v("B")), "The 1Password field is empty.");
    assert.equal(rowReason(draft, run, v("A")), null);
    assert.equal(rowReason(draft, run, v("E", "")), null);
  });
  it("clears for the edited row only, and returns when the edit is undone", () => {
    const edited = edit(draft, "B", "op://V/B/y");
    assert.equal(rowReason(edited, run, v("B", "op://V/B/y")), null);
    assert.equal(rowReason(edited, run, v("C")), "Field not found in the vault.");
    assert.equal(rowReason(draft, run, v("B")), "The 1Password field is empty.");
  });
  it("clears for every row when the account or the vault changes", () => {
    for (const other of [{ serviceAccount: "sb" }, { vault: "W" }]) {
      const d = project(draft.variables, other);
      assert.equal(rowReason(d, run, v("B")), null);
      assert.equal(rowReason(d, run, v("C")), null);
    }
  });
  it("is absent on a row added after Test and on a saved reserved name it is always there", () => {
    assert.equal(rowReason(project([...draft.variables, v("F")]), run, v("F")), null);
    assert.match(rowReason(draft, undefined, v("DYLD_X")) ?? "", /^Not applied: .*\.$/);
  });
});

describe("the summary beside Test", () => {
  it("is empty before any Test, and with no variables", () => {
    assert.equal(text(draft, undefined), "");
    assert.equal(text(project([]), { sent: project([]), results: [] }), "");
  });
  it("counts failed, set and rows with no field", () => {
    assert.equal(text(draft, run), "2 failed · 2 set · 1 no field");
  });
  it("says All N set only when every row is set", () => {
    const d = project([v("A"), v("B")]);
    const r: Run = { sent: d, results: [{ name: "A", ok: true }, { name: "B", ok: true }] };
    assert.equal(text(d, r), "All 2 set");
    const withBlank = project([v("A"), v("B", "")]);
    assert.equal(text(withBlank, { sent: withBlank, results: [{ name: "A", ok: true }] }), "1 set · 1 no field");
  });
  it("omits a zero count", () => {
    const d = project([v("A"), v("B")]);
    const r: Run = { sent: d, results: [{ name: "A", ok: false, cause: "empty" }, { name: "B", ok: false, cause: "empty" }] };
    assert.equal(text(d, r), "2 failed");
  });
  it("reads Not tested since changes after any edit, add, remove, account or vault change", () => {
    const says = "Not tested since changes";
    assert.equal(text(edit(draft, "A", "op://V/A/y"), run), says);
    assert.equal(text(project([...draft.variables, v("F")]), run), says);
    assert.equal(text(project(draft.variables.slice(1)), run), says);
    assert.equal(text(project(draft.variables, { vault: "W" }), run), says);
    assert.equal(text(project(draft.variables, { serviceAccount: "sb" }), run), says);
    assert.equal(text(draft, run), "2 failed · 2 set · 1 no field");
  });
  it("reads Testing… while a Test runs", () => {
    assert.equal(text(draft, run, true), "Testing…");
  });
});
