import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { connectionOpenReason, replaceProject, saveRule, type Project } from "../shared/config.ts";

const open = { pending: true, saving: false, unnamed: 0, changing: false };

describe("save rule", () => {
  it("allows Save when something is pending and nothing blocks it", () => {
    assert.deepEqual(saveRule(open), { canSave: true, reason: null });
  });

  it("blocks Save with a reason while the connection change is open", () => {
    assert.deepEqual(saveRule({ ...open, changing: true }), { canSave: false, reason: connectionOpenReason });
  });

  it("gives no reason when nothing is pending, since Save is off anyway", () => {
    assert.deepEqual(saveRule({ ...open, pending: false, changing: true }), { canSave: false, reason: null });
  });

  it("keeps the older blocks: saving and unnamed rows", () => {
    assert.equal(saveRule({ ...open, saving: true }).canSave, false);
    assert.equal(saveRule({ ...open, unnamed: 1 }).canSave, false);
  });
});

const at = (root: string, vault = "Dev"): Project => ({ root, serviceAccount: "sa-a", vault, variables: [] });

describe("replaceProject", () => {
  it("keeps a saved project where it was", () => {
    const list = [at("/a"), at("/b"), at("/c")];
    const saved = replaceProject(list, at("/b", "edited"));
    assert.deepEqual(saved.map((p) => p.root), ["/a", "/b", "/c"]);
    assert.equal(saved[1].vault, "edited");
  });

  it("adds a project not in the list at the end", () => {
    const saved = replaceProject([at("/a"), at("/b")], at("/new"));
    assert.deepEqual(saved.map((p) => p.root), ["/a", "/b", "/new"]);
  });
});
