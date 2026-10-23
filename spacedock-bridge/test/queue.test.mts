import assert from "node:assert/strict";
import { test } from "node:test";
import { type BoardRow, attachGates, toRows } from "../shared/board";
import { buildQueue, openLink, splitQueue } from "../shared/queue";

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

test("a review with no FO has none", () => {
  const items = buildQueue([], [{ url: "u", repo: "z", owner: "o", number: 2, title: "PR", author: "w", firstSeenAt: 0 }]);
  assert.equal(items[0].fo, null);
});

test("the next card is the first queue item and the sections keep the queue order", () => {
  const rows = [
    row({ id: "a", status: "waiting on Kent", next: "pick A", attentionAt: "2026-10-23T01:00:00Z" }),
    row({
      id: "b",
      gates: [
        { slug: "late", title: "Late gate", stage: "ideation", preparedAt: "2026-10-23T04:00:00Z" },
        { slug: "early", title: "Early gate", stage: "validation", preparedAt: "2026-10-23T02:00:00Z" },
      ],
    }),
    row({ id: "c", permission: "Permission: Write" }),
  ];
  const reviews = [1, 2].map((n) => ({
    url: `u${n}`,
    repo: "r",
    owner: "o",
    number: n,
    title: `PR ${n}`,
    author: "w",
    firstSeenAt: Date.parse(`2026-10-23T0${n}:30:00Z`),
  }));
  const queue = buildQueue(rows, reviews);
  const { next, sections } = splitQueue(queue);
  assert.equal(next, queue[0]);
  assert.equal(next?.kind, "permission");
  assert.deepEqual(
    sections.map((s) => [s.kind, s.items.map((item) => item.title)]),
    [
      ["review", ["PR 1", "PR 2"]],
      ["gate", ["Early gate", "Late gate"]],
      ["ask", ["pick A"]],
    ],
  );
  assert.deepEqual(sections.flatMap((s) => s.items), queue.slice(1));
});

test("an empty queue has no next card and one item has no rows", () => {
  assert.deepEqual(splitQueue([]), { next: null, sections: [] });
  const one = buildQueue([row({ id: "c", permission: "P" })], []);
  assert.deepEqual(splitQueue(one), { next: one[0], sections: [] });
});

test("each review item carries its own repo#number and URL, and opening it passes that URL", () => {
  const reviews = [
    { url: "https://github.com/o/relay/pull/331", repo: "relay", owner: "o", number: 331, title: "fix(relay)", author: "w", firstSeenAt: 1 },
    { url: "https://github.com/o/infra/pull/1471", repo: "infra", owner: "o", number: 1471, title: "test(agent)", author: "w", firstSeenAt: 2 },
  ];
  const { next, sections } = splitQueue(buildQueue([], reviews));
  const opened: string[] = [];
  for (const item of [next!, ...sections.flatMap((section) => section.items)]) {
    openLink(item, (url) => opened.push(url));
    assert.equal(item.link?.url, item.review?.url);
  }
  assert.deepEqual(
    [next, ...sections.flatMap((section) => section.items)].map((item) => item!.link!.ref),
    ["relay#331", "infra#1471"],
  );
  assert.deepEqual(opened, ["https://github.com/o/relay/pull/331", "https://github.com/o/infra/pull/1471"]);
});

test("a gate or question has no link to open", () => {
  const items = buildQueue([row({ id: "a", status: "waiting on Kent", next: "pick A" })], []);
  const opened: string[] = [];
  openLink(items[0], (url) => opened.push(url));
  assert.deepEqual(opened, []);
});


test("a captain question survives alongside the same FO's gate", () => {
  const gate = { slug: "adapter-proof", title: "Adapter proof", stage: "validation" };
  const fo = row({ status: "waiting on Kent", hasNextOwner: true,
    next: "Does OMP need its own Spacedock host adapter?", gates: [gate] });
  const items = buildQueue([fo], []);
  assert.deepEqual(items.map((item) => [item.kind, item.title, item.fo?.id]), [
    ["gate", "Adapter proof", "x"],
    ["ask", "Does OMP need its own Spacedock host adapter?", "x"],
  ]);
});

test("a gate alone or its repeated label does not add an empty or duplicate question", () => {
  const gate = { slug: "adapter-proof", title: "Adapter proof", stage: "validation" };
  for (const next of ["", "  ", gate.title, gate.slug, "gate: Adapter proof", "validation · Adapter proof", "Review Adapter proof", "Approve Adapter proof", "Decide on adapter-proof"]) {
    const items = buildQueue([row({ status: "waiting on Kent", next, gates: [gate] })], []);
    assert.deepEqual(items.map((item) => item.kind), ["gate"], next);
  }
  const separate = "Adapter proof: should we keep a separate adapter?";
  assert.equal(buildQueue([row({ status: "waiting on Kent", next: separate, gates: [gate] })], [])[1].title, separate);
});


test("attaching a gate does not promote an FO-owned next step into a Captain question", () => {
  const original = toRows(["captain", "fo"].map((owner) => ({
    id: owner, title: owner, cwd: "/proof", status: "idle", updatedAt: "2026-10-23T05:00:00Z",
    labels: { role: "fo", task: `${owner}-gate`, "workflow-dir": `/proof/${owner}`,
      "next-owner": owner, next: owner === "captain" ? "Choose a host adapter?" : "Implement the host adapter" },
  })));
  const grouped = attachGates(original, original.map((fo) => ({
    workflowDir: fo.workflowDir, slug: fo.task, title: "Review the proof", stage: "validation",
  })));
  const queue = buildQueue(grouped, [], original);
  assert.equal(queue.filter((item) => item.kind === "gate").length, 2);
  assert.deepEqual(queue.filter((item) => item.kind === "ask").map((item) => item.fo?.id), ["captain"]);
});
