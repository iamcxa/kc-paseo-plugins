import assert from "node:assert/strict";
import { test } from "node:test";
import { findOpenAttempt, findResolution, parseGitRootUri } from "../shared/gate";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stringify } from "yaml";
import { readGateBriefingHandler } from "../server/gate";

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

test("opening a closed gate without a briefing ID returns its latest stage resolution", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "bridge-gate-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, ".spacedock-state"));
  await writeFile(join(root, "README.md"), "---\nstate: .spacedock-state\n---\n");
  const latest = { briefing: "b:b:2", decision: "revise", reason: "Latest decision", at: "2026-10-25T00:00:00Z" };
  const entity = structuredClone(frontmatter);
  entity.gates.records[1].attempts.push({ briefing: { id: "b:b:2", digest: "sha256:d", "room-ref": "unused" }, resolution: latest });
  await writeFile(join(root, ".spacedock-state/task.md"), `---\n${stringify(entity)}---\n`);
  const input = { workflowDir: root, slug: "task", stage: "backlog" };
  assert.deepEqual(await readGateBriefingHandler(input), {
    briefing: null, recorded: { decision: latest.decision, reason: latest.reason, at: latest.at }, error: null,
  });
  const old = await readGateBriefingHandler({ ...input, briefingId: "b:b:1" });
  assert.equal(old.recorded?.decision, "approve");
  assert.deepEqual(await readGateBriefingHandler({ ...input, stage: "validation" }), {
    briefing: null, recorded: null, error: null,
  });
});

test("a git-root state URI gives the commit and path", () => {
  assert.deepEqual(parseGitRootUri("git-root://state/4fc35842/try-auto-refresh.md"), {
    commit: "4fc35842",
    path: "try-auto-refresh.md",
  });
  assert.equal(parseGitRootUri("https://example.com/x.md"), null);
});
