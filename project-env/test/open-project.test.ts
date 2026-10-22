import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { openProject } from "../client/open-project.ts";
import type { Project } from "../shared/config.ts";

const project = (prompt = ""): Project => ({
  root: "/work/app",
  serviceAccount: "sa-a",
  vault: "Dev",
  variables: [],
  prompt,
});

afterEach(() => openProject.close());

describe("open project store", () => {
  it("holds nothing until a project is opened", () => {
    assert.equal(openProject.get(), null);
  });

  it("begin opens the project with an unedited draft and the revision it was given", () => {
    openProject.begin(project("a"), "rev-1");
    const open = openProject.get();
    assert.deepEqual(open?.initial, project("a"));
    assert.deepEqual(open?.draft, project("a"));
    assert.equal(open?.edits, 0);
    assert.equal(open?.revision, "rev-1");
  });

  it("update changes the draft, keeps initial and revision, and counts the edit", () => {
    openProject.begin(project(), "rev-1");
    openProject.update((d) => ({ ...d, vault: "Prod" }), true);
    openProject.update((d) => ({ ...d, vault: "Stage" }), true);
    const open = openProject.get();
    assert.equal(open?.draft.vault, "Stage");
    assert.equal(open?.initial.vault, "Dev");
    assert.equal(open?.edits, 2);
    assert.equal(open?.revision, "rev-1");
  });

  it("update with countsAsEdit false changes the draft and leaves edits", () => {
    openProject.begin(project(), "rev-1");
    openProject.update((d) => ({ ...d, prompt: "typed" }), false);
    assert.equal(openProject.get()?.draft.prompt, "typed");
    assert.equal(openProject.get()?.edits, 0);
  });

  it("close empties the store and a later update is ignored", () => {
    openProject.begin(project(), "rev-1");
    openProject.close();
    openProject.update((d) => ({ ...d, prompt: "late" }), true);
    assert.equal(openProject.get(), null);
  });

  it("update tagged with a session that is no longer open is ignored", () => {
    openProject.begin(project(), "rev-1");
    const stale = openProject.get()?.session;
    openProject.begin({ ...project(), root: "/work/other" }, "rev-1");
    openProject.update((d) => ({ ...d, prompt: "from the old import" }), true, stale);
    assert.equal(openProject.get()?.draft.prompt, "");
    assert.equal(openProject.get()?.edits, 0);
    openProject.update((d) => ({ ...d, prompt: "current" }), true, openProject.get()?.session);
    assert.equal(openProject.get()?.draft.prompt, "current");
  });

  it("close tagged with a session that is no longer open leaves the open project alone", () => {
    openProject.begin(project(), "rev-1");
    const stale = openProject.get()?.session;
    openProject.begin({ ...project(), root: "/work/other" }, "rev-1");
    openProject.close(stale);
    assert.equal(openProject.get()?.initial.root, "/work/other");
    openProject.close(openProject.get()?.session);
    assert.equal(openProject.get(), null);
  });

  it("begin twice yields different sessions and drops the earlier draft", () => {
    openProject.begin(project(), "rev-1");
    const first = openProject.get()?.session;
    openProject.update((d) => ({ ...d, prompt: "old" }), true);
    openProject.begin(project(), "rev-2");
    assert.notEqual(openProject.get()?.session, first);
    assert.equal(openProject.get()?.draft.prompt, "");
    assert.equal(openProject.get()?.revision, "rev-2");
  });

  it("a Change in progress stays through draft updates, is not an edit, and is cleared by close and begin", () => {
    const before = { serviceAccount: "sa-a", vault: "Dev" };
    openProject.begin(project(), "rev-1");
    assert.equal(openProject.get()?.changing, null);
    const session = openProject.get()?.session;
    openProject.setChanging(before, session);
    openProject.update((d) => ({ ...d, serviceAccount: "sa-b" }), true);
    assert.deepEqual(openProject.get()?.changing, before);
    assert.equal(openProject.get()?.edits, 1);
    openProject.setChanging(null, session);
    assert.equal(openProject.get()?.changing, null);
    openProject.setChanging(before, session);
    openProject.begin(project(), "rev-2");
    assert.equal(openProject.get()?.changing, null);
    openProject.setChanging(before);
    openProject.close();
    openProject.begin(project(), "rev-3");
    assert.equal(openProject.get()?.changing, null);
  });

  it("setChanging tagged with a session that is no longer open is ignored", () => {
    openProject.begin(project(), "rev-1");
    const stale = openProject.get()?.session;
    openProject.begin(project(), "rev-1");
    openProject.setChanging({ serviceAccount: "x", vault: "y" }, stale);
    assert.equal(openProject.get()?.changing, null);
  });
});
