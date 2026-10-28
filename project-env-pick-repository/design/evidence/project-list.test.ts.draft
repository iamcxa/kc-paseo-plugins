import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ADD_REPOSITORY_STEPS, addProjectLine, addProjectState } from "../shared/project-list.ts";

const shop = { projectDisplayName: "shop-api", projectRootPath: "/work/shop-api" };
const web = { projectDisplayName: "web-app", projectRootPath: "/work/web-app" };
const ok = (...projects: (typeof shop)[]) => ({ status: "success" as const, data: { projects } });

describe("add a project: what the section says", () => {
  it("Paseo has no project: says so and names how to add one", () => {
    const state = addProjectState(ok(), []);
    assert.equal(state.kind, "none");
    assert.match(addProjectLine(state as never).hint, /Paseo has no project yet/);
    assert.ok(addProjectLine(state as never).hint.includes(ADD_REPOSITORY_STEPS));
  });

  it("every project already configured: not the select, and names how to add another", () => {
    const state = addProjectState(ok(shop, web), ["/work/shop-api", "/work/web-app"]);
    assert.equal(state.kind, "all-configured");
    assert.ok(addProjectLine(state as never).hint.includes(ADD_REPOSITORY_STEPS));
  });

  it("the list failed and nothing was ever loaded: failed, so the screen offers Try again", () => {
    const state = addProjectState({ status: "error" }, []);
    assert.equal(state.kind, "failed");
    assert.match(addProjectLine(state as never).hint, /did not return its project list/);
  });

  it("a refetch fails after a list was loaded: keeps choosing from the list it has", () => {
    const state = addProjectState({ status: "error", data: { projects: [shop] } }, []);
    assert.equal(state.kind, "choose");
  });

  it("still loading: says it is loading, never none or failed", () => {
    assert.equal(addProjectState({ status: "pending" }, []).kind, "loading");
  });

  it("an unconfigured project: choose, with only the unconfigured ones", () => {
    const state = addProjectState(ok(shop, web), ["/work/shop-api"]);
    assert.deepEqual(state, { kind: "choose", candidates: [web] });
  });
});
