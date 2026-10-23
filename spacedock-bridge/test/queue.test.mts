import assert from "node:assert/strict";
import { test } from "node:test";
import type { BoardRow } from "../shared/board";
import { buildQueue, isNew } from "../shared/queue";

const row = (over: Partial<BoardRow> & { attentionAt?: string }): BoardRow & { attentionAt?: string } => ({
  id: "x",
  title: "FO",
  repo: "r",
  task: "",
  status: "idle",
  lastActivityAt: "2026-10-23T05:00:00Z",
  permission: "",
  next: "",
  hasNextOwner: false,
  workflowDir: "/w",
  gates: [],
  offline: false,
  ...over,
});

test("items sort by kind first, then oldest first; one FO can own several items", () => {
  const rows = [
    row({ id: "a", status: "waiting on Kent", next: "pick A or B", attentionAt: "2026-10-23T01:00:00Z" }),
    row({
      id: "b",
      status: "waiting on Kent",
      gates: [
        { slug: "late", title: "Late gate", stage: "ideation", preparedAt: "2026-10-23T04:00:00Z" },
        { slug: "early", title: "Early gate", stage: "validation", preparedAt: "2026-10-23T02:00:00Z" },
      ],
    }),
    row({ id: "c", permission: "Permission: Write", lastActivityAt: "2026-10-23T06:00:00Z" }),
  ];
  const reviews = [
    { url: "u1", repo: "r", owner: "o", number: 1, title: "PR one", author: "w", firstSeenAt: Date.parse("2026-10-23T03:00:00Z") },
  ];
  assert.deepEqual(
    buildQueue(rows, reviews).map((item) => [item.kind, item.title, item.fo?.id ?? null]),
    [
      ["permission", "Permission: Write", "c"],
      ["review", "PR one", "a"],
      ["gate", "Early gate", "b"],
      ["gate", "Late gate", "b"],
      ["ask", "pick A or B", "a"],
    ],
  );
});

test("a review with no FO has none, and an item is new for fifteen minutes", () => {
  const items = buildQueue([], [{ url: "u", repo: "z", owner: "o", number: 2, title: "PR", author: "w", firstSeenAt: 0 }]);
  assert.equal(items[0].fo, null);
  assert.equal(isNew({ ...items[0], since: "2026-10-23T05:00:00Z" }, Date.parse("2026-10-23T05:10:00Z")), true);
  assert.equal(isNew({ ...items[0], since: "2026-10-23T05:00:00Z" }, Date.parse("2026-10-23T05:20:00Z")), false);
});
