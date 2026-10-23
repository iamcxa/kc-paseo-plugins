import assert from "node:assert/strict";
import { test } from "node:test";
import { type BoardAgent, attachGates, boardStatus, toRows, withReplies } from "../shared/board";

const base: BoardAgent = {
  id: "a",
  cwd: "/x",
  status: "idle",
  updatedAt: "2026-10-19T11:00:00.000Z",
  labels: { role: "fo", repo: "r" },
};

test("a pending permission is waiting on Kent even when requiresAttention is false", () => {
  const agent = {
    ...base,
    status: "running",
    requiresAttention: false,
    attentionReason: null,
    pendingPermissions: [{}],
  };
  assert.equal(boardStatus(agent), "waiting on Kent");
});

test("Paseo's own permission attention is waiting on Kent", () => {
  assert.equal(
    boardStatus({
      ...base,
      requiresAttention: true,
      attentionReason: "permission",
    }),
    "waiting on Kent",
  );
});

test("running without a prompt is busy, a read idle agent is idle", () => {
  assert.equal(boardStatus({ ...base, status: "running" }), "busy");
  assert.equal(boardStatus({ ...base, requiresAttention: false }), "idle");
});

test("an unread finished reply is a new reply until its next step names Kent", () => {
  assert.equal(
    boardStatus({
      ...base,
      requiresAttention: true,
      attentionReason: "finished",
    }),
    "new reply",
  );
});

test("a new reply whose next step is the Captain's moves to waiting", () => {
  const rows = toRows([
    { ...base, id: "mine", title: "a", requiresAttention: true, attentionReason: "finished" },
    { ...base, id: "yours", title: "b", requiresAttention: true, attentionReason: "finished" },
  ]);
  const grouped = withReplies(rows, {
    mine: { preview: "wait for review (我)", onCaptain: false },
    yours: { preview: "decide #675 (你)", onCaptain: true },
  });
  assert.deepEqual(
    grouped.map((r) => [r.id, r.status]),
    [
      ["yours", "waiting on Kent"],
      ["mine", "new reply"],
    ],
  );
});

test("only role=fo agents are rows, grouped waiting, error, new reply, busy, idle, then by title", () => {
  const rows = toRows([
    { ...base, id: "idle-b", title: "b" },
    { ...base, id: "busy", title: "z", status: "running", updatedAt: "2026-10-19T12:00:00.000Z" },
    { ...base, id: "idle-a", title: "a", updatedAt: "2026-10-19T09:00:00.000Z" },
    { ...base, id: "wait", title: "y", pendingPermissions: [{ name: "Write" }] },
    { ...base, id: "reply", title: "w", requiresAttention: true, attentionReason: "finished" },
    { ...base, id: "err", title: "x", status: "error" },
    { ...base, id: "coord", labels: { role: "comms-officer" } },
    { ...base, id: "none", labels: undefined },
  ]);
  assert.deepEqual(
    rows.map((r) => r.id),
    ["wait", "err", "reply", "busy", "idle-a", "idle-b"],
  );
});

test("a next-owner label decides the group without reading the reply", () => {
  const rows = toRows([
    { ...base, id: "cap", title: "a", requiresAttention: true, attentionReason: "finished",
      labels: { role: "fo", "next-owner": "captain", next: "decide #675" } },
    { ...base, id: "fo", title: "b", requiresAttention: true, attentionReason: "finished",
      labels: { role: "fo", "next-owner": "fo", next: "wait for review" } },
  ]);
  assert.deepEqual(
    rows.map((r) => [r.id, r.status, r.next]),
    [
      ["cap", "waiting on Kent", "decide #675"],
      ["fo", "new reply", "wait for review"],
    ],
  );
});

test("an FO that is running again is busy even with an unread earlier reply", () => {
  assert.equal(
    boardStatus({
      ...base,
      status: "running",
      requiresAttention: true,
      attentionReason: "finished",
      labels: { role: "fo", "next-owner": "captain" },
    }),
    "busy",
  );
});

test("an FO's spacedock gates sit under it and make it wait on the Captain", () => {
  const rows = toRows([
    { ...base, id: "kc", title: "kc FO", status: "running",
      labels: { role: "fo", "workflow-dir": "/kc/docs/dev2" } },
    { ...base, id: "relay", title: "relay FO", labels: { role: "fo", "workflow-dir": "/relay/a/docs/dev2", task: "t2" } },
    { ...base, id: "installer", title: "installer FO", labels: { role: "fo", "workflow-dir": "/relay/b/docs/dev2", task: "t1" } },
  ]);
  const grouped = attachGates(rows, [
    { workflowDir: "/kc/docs/dev2", slug: "g1", title: "G1", stage: "ideation" },
    { workflowDir: "/kc/docs/dev2", slug: "g2", title: "G2", stage: "backlog" },
    { workflowDir: "/relay/a/docs/dev2", slug: "t1", title: "T1", stage: "validation" },
  ]);
  assert.deepEqual(
    grouped.map((r) => [r.id, r.status, r.gates.map((g) => g.slug)]),
    [
      ["installer", "waiting on Kent", ["t1"]],
      ["kc", "waiting on Kent", ["g1", "g2"]],
      ["relay", "idle", []],
    ],
  );
});

test("an archived or closed FO is offline, and its gates still show under it", () => {
  const rows = toRows([
    { ...base, id: "gone", title: "a", status: "closed", archivedAt: "2026-10-21T11:22:10Z",
      labels: { role: "fo", "workflow-dir": "/w" } },
    { ...base, id: "closed", title: "b", status: "closed" },
  ]);
  assert.deepEqual(rows.map((r) => [r.id, r.status, r.offline]), [
    ["gone", "offline", true],
    ["closed", "offline", true],
  ]);
  const grouped = attachGates(rows, [{ workflowDir: "/w", slug: "g", title: "G", stage: "ideation" }]);
  assert.deepEqual(grouped.map((r) => [r.id, r.status, r.offline, r.gates.length]), [
    ["gone", "waiting on Kent", true, 1],
  ]);
});

test("an offline FO with no gate waiting is left off the board", () => {
  const rows = toRows([
    { ...base, id: "old", title: "old FO", status: "closed", archivedAt: "2026-10-20T00:00:00Z" },
    { ...base, id: "live", title: "live FO" },
  ]);
  assert.deepEqual(attachGates(rows, []).map((r) => r.id), ["live"]);
});

test("an idle FO whose next step is the Captain's waits on him even after its reply is read", () => {
  assert.equal(
    boardStatus({ ...base, requiresAttention: false, labels: { role: "fo", "next-owner": "captain" } }),
    "waiting on Kent",
  );
});
