import assert from "node:assert/strict";
import { test } from "node:test";
import { isSpacedockReadme, parseAwaitingGates, parseTaskStatus } from "../shared/tasks";

test("a spacedock status answer gives the task's title and stage", () => {
  const out = JSON.stringify({
    command: "status",
    entities: [{ slug: "spacedock-install-beta", status: "validation", title: "One command installs Spacedock" }],
  });
  assert.deepEqual(parseTaskStatus(out), {
    title: "One command installs Spacedock",
    stage: "validation",
  });
});

test("no matching task or unreadable output gives nothing", () => {
  assert.equal(parseTaskStatus(JSON.stringify({ command: "status", entities: [] })), null);
  assert.equal(parseTaskStatus("Error: missing required id"), null);
});

test("only a commissioned workflow README counts as a workflow directory", () => {
  assert.equal(isSpacedockReadme("---\ncommissioned-by: spacedock@0.26.0\n---\n"), true);
  assert.equal(isSpacedockReadme("# Some notes\n"), false);
});

test("only tasks whose gate readiness is awaiting-captain are gates waiting on the Captain", () => {
  const out = JSON.stringify({
    command: "status",
    entities: [
      { slug: "a", status: "ideation", title: "A", "gate-readiness": "awaiting-captain" },
      { slug: "b", status: "backlog", title: "B", "gate-readiness": "needs-preparation" },
      { slug: "c", status: "validation", title: "C", "gate-readiness": "approved-awaiting-merge" },
      { slug: "d", status: "implementation", title: "D" },
    ],
  });
  assert.deepEqual(parseAwaitingGates(out), [{ slug: "a", title: "A", stage: "ideation" }]);
  assert.deepEqual(parseAwaitingGates("not json"), []);
});
