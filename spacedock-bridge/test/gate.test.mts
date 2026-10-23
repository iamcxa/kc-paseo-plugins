import assert from "node:assert/strict";
import { test } from "node:test";
import { findOpenAttempt, findResolution, parseGitRootUri } from "../shared/gate";

const frontmatter = {
  gates: {
    records: [
      {
        stage: "ideation",
        attempts: [
          { briefing: { id: "b:i:1", digest: "sha256:a", "room-ref": "./s/review/ideation/briefing-1" }, withdrawal: { reason: "stale" } },
          { briefing: { id: "b:i:2", digest: "sha256:b", "room-ref": "./s/review/ideation/briefing-2" } },
        ],
      },
      {
        stage: "backlog",
        attempts: [
          {
            briefing: { id: "b:b:1", digest: "sha256:c", "room-ref": "./s/review/backlog/briefing-1" },
            resolution: { briefing: "b:b:1", decision: "approve", reason: "Captain: 「准」", at: "2026-10-20T00:00:00Z" },
          },
        ],
      },
    ],
  },
};

test("the open attempt is the latest one neither withdrawn nor resolved, for that stage", () => {
  assert.deepEqual(findOpenAttempt(frontmatter, "ideation"), {
    stage: "ideation",
    briefingId: "b:i:2",
    digest: "sha256:b",
    roomRef: "./s/review/ideation/briefing-2",
  });
  assert.equal(findOpenAttempt(frontmatter, "backlog"), null);
  assert.equal(findOpenAttempt({}, "ideation"), null);
});

test("a resolution is found by the briefing it answered", () => {
  assert.equal(findResolution(frontmatter, "b:b:1")?.decision, "approve");
  assert.equal(findResolution(frontmatter, "b:i:2"), null);
});

test("a git-root state URI gives the commit and path", () => {
  assert.deepEqual(parseGitRootUri("git-root://state/4fc35842/try-auto-refresh.md"), {
    commit: "4fc35842",
    path: "try-auto-refresh.md",
  });
  assert.equal(parseGitRootUri("https://example.com/x.md"), null);
});
