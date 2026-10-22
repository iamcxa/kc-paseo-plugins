import assert from "node:assert/strict";
import { it } from "node:test";
import { unsavedCount, type Project } from "../shared/config.ts";

const base: Project = {
  root: "/w",
  serviceAccount: "sa-a",
  vault: "Dev",
  prompt: "",
  variables: [
    { name: "A", ref: "op://Dev/x/a" },
    { name: "B", ref: "op://Dev/x/b" },
  ],
};
const with_ = (change: Partial<Project>): Project => ({ ...base, ...change });

it("counts what Save would write", () => {
  assert.equal(unsavedCount(base, base), 0);
  assert.equal(unsavedCount(base, with_({ serviceAccount: " sa-a " })), 1);
  assert.equal(unsavedCount(with_({ serviceAccount: " sa-a " }), base), 1);
  assert.equal(unsavedCount(base, with_({ serviceAccount: "sa-b" })), 1);
  assert.equal(unsavedCount(base, with_({ vault: "Prod" })), 1);
  assert.equal(unsavedCount(base, with_({ prompt: "x" })), 1);
  assert.equal(unsavedCount(base, with_({ variables: [base.variables[0]] })), 1);
  assert.equal(unsavedCount(base, with_({ variables: [...base.variables, { name: "C", ref: "" }] })), 1);
  assert.equal(unsavedCount(base, with_({ variables: [{ name: "A", ref: "op://Dev/x/z" }, base.variables[1]] })), 1);
  assert.equal(
    unsavedCount(base, with_({ prompt: "x", variables: [{ name: "A", ref: "op://Dev/x/z" }] })),
    3,
  );
});

it("removing then re-adding the same variable is no change", () => {
  const removedThenBack = with_({ variables: [base.variables[1], base.variables[0]] });
  assert.equal(unsavedCount(base, removedThenBack), 0);
});
