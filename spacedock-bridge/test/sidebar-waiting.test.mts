import assert from "node:assert/strict";
import { test } from "node:test";
import { act } from "react";
import { filterCounts, waitsForCaptain } from "../shared/list-status";
import { mountBridge } from "./helpers/bridge-host.mjs";

const loaded = { fos: "loaded", gates: "loaded", reviews: "loaded", comms: "loaded" } as const;
test("Captain counts share status priority and exclude sent, relayed, finished and other waiting kinds", () => {
  const items = [
    { kind: "gate" }, { kind: "ask" }, { kind: "gate", sent: true }, { kind: "gate", relayed: true },
    { kind: "gate", recorded: true }, { kind: "ask", closed: true }, { kind: "review" }, { kind: "permission" },
  ] as const;
  assert.deepEqual(items.map(waitsForCaptain), [true, true, false, false, false, false, false, false]);
  assert.equal(filterCounts(items, loaded, "captain").all, "2");
  assert.equal(filterCounts([], loaded, "captain").all, "0");
  for (const source of ["fos", "gates", "comms"])
    for (const state of ["failed", "loading"])
      assert.equal(filterCounts(items, { ...loaded, [source]: state }, "captain").all, "?");
  assert.equal(filterCounts(items, { ...loaded, reviews: "failed" }, "captain").all, "2");
});

test("sidebar updates without Bridge mounted, hides zero, marks failures, retries and reads claims", async t => {
  let gateFailure = false;
  let gates: any[] = [];
  const host = await mountBridge(t, false, rpc => {
    rpc["gates.read"] = async () => { if (gateFailure) throw new Error("unavailable"); return { gates, failedWorkflowDirs: [] }; };
  }, true);
  assert.ok(host.find("Bridge"));
  assert.equal(host.find("Waiting items: sources incomplete"), undefined);
  assert.equal(host.text().trim(), "Bridge");
  assert.equal(host.screens.length, 0);
  gates = [{ workflowDir: "/workflow-a", slug: "a", title: "Gate A", stage: "validation", briefingId: "brief-a" }];
  await host.pollGates();
  assert.ok(host.find("1 gates and questions waiting for you"));
  host.claims.set("brief-a", { at: Date.now() });
  await host.pollGates();
  assert.equal(host.text().trim(), "Bridge");
  host.claims.clear();
  gateFailure = true;
  await host.pollGates();
  await host.click("Waiting items: sources incomplete");
  assert.match(host.text(), /Could not check gates/);
  gateFailure = false;
  await host.click("Check waiting sources again");
  assert.ok(host.find("1 gates and questions waiting for you"));
  assert.equal(host.screens.length, 0);
});

test("popover sorts gates and questions together newest first; item routes to that Bridge detail and Open Bridge to board", async t => {
  const host = await mountBridge(t, true, rpc => {
    rpc["gates.read"] = async () => ({ gates: ["a", "b"].map(id => ({ workflowDir: `/workflow-${id}`, slug: id, title: `Approve ${id}?`, stage: "validation", briefingId: `brief-${id}`, preparedAt: "2026-11-03T10:00:00Z" })), failedWorkflowDirs: [] });
  }, true);
  Object.assign(host.agents[0].labels, { "next-owner": "captain", next: "Choose the retry limit" });
  Object.assign(host.agents[0], { attentionTimestamp: "2026-11-02T09:00:00Z" });
  await host.publishAgents();
  await host.click("3 gates and questions waiting for you");
  assert.match(host.text(), /Gates · 2/);
  assert.match(host.text(), /Questions · 1/);
  const text = host.text();
  assert.ok(text.indexOf("Approve a?") < text.indexOf("Choose the retry limit"), "newer gate must precede the older question");
  assert.match(text, /A FO · Question ·/);
  await host.click("Open Choose the retry limit");
  assert.equal(host.screens.at(-1).screenId, "board");
  assert.match(host.screens.at(-1).params.item, /Choose the retry limit/);
  assert.ok(host.find("Message A FO"));
  assert.match(host.text(), /Choose the retry limit/);
  await host.click("3 gates and questions waiting for you");
  await host.click("Open Approve a?");
  assert.ok(host.find("Choose 要求修改"), host.text());
  await host.click("3 gates and questions waiting for you");
  await host.click("Open Bridge");
  assert.equal(host.screens.at(-1).params.item, "queue");
  assert.ok(host.find("Approve a? — A FO"));
});

test("label opens Bridge directly and Commander questions are read without creating a coordinator", async t => {
  let creates = 0;
  const host = await mountBridge(t, false, rpc => { rpc["coordinator.open"] = async () => { ++creates; return { agentId: "co" }; }; }, true);
  host.timeline.set("co", [{ seqStart: 0, item: { type: "user_message", text: "Discuss the direction" } }, { seqStart: 1, timestamp: "2026-11-01T10:00:00Z", item: { type: "assistant_message", text: "Next: Choose the next direction (you)" } }]);
  await host.refresh("co");
  assert.ok(host.find("3 gates and questions waiting for you"));
  assert.equal(creates, 0);
  await host.click("3 gates and questions waiting for you");
  assert.match(host.text(), /Commander · Question ·/);
  await host.click("Open Choose the next direction (you)");
  assert.equal(host.screens.at(-1).params.item, "comms");
  assert.ok(host.find("Message Comms officer"));
  await host.click("Bridge");
  assert.deepEqual(host.screens.at(-1), { screenId: "board" });
});


test("loading gates show a question mark and an incomplete note before any Bridge screen mounts", async t => {
  const host = await mountBridge(t, false, rpc => { rpc["gates.read"] = () => new Promise(() => {}); }, true);
  await host.click("Waiting items: sources incomplete");
  assert.match(host.text(), /Checking sources — this list may be incomplete/);
  assert.match(host.text(), /Gates · \?/);
  assert.equal(host.screens.length, 0);
});

for (const phase of ["loading", "failed"]) test(`a changed workflow excludes previous gates while ${phase}`, async t => {
  let changed = false;
  const pending: { reject(error: Error): void }[] = [];
  const gate = { workflowDir: "/workflow-a", slug: "shared", title: "Old workflow gate", stage: "validation", briefingId: "old-brief" };
  const host = await mountBridge(t, false, rpc => {
    rpc["gates.read"] = () => changed
      ? new Promise((_resolve, reject) => pending.push({ reject }))
      : Promise.resolve({ gates: [gate], failedWorkflowDirs: [] });
  }, true);
  await host.click("1 gates and questions waiting for you");
  assert.match(host.text(), /A FO · Gate/);
  changed = true;
  const next = { ...host.agents[1], labels: { ...host.agents[1].labels, "workflow-dir": "/workflow-new", task: "shared" } };
  host.agents.splice(0, host.agents.length, next);
  await host.publishAgents();
  if (phase === "failed") await act(async () => { for (const read of pending) read.reject(new Error("new workflow unavailable")); });
  assert.ok(host.find("Waiting items: sources incomplete"));
  assert.equal(Boolean(host.find("Open Old workflow gate")), false, "previous workflow must not be assigned to the new fleet");
});

test("a successful new workflow read shows only its own gate, owner and Bridge destination", async t => {
  let changed = false;
  let ready = false;
  const pending: { resolve(value: unknown): void }[] = [];
  const oldGate = { workflowDir: "/workflow-a", slug: "shared", title: "Old workflow gate", stage: "validation", briefingId: "old-brief" };
  const newGate = { workflowDir: "/workflow-new", slug: "b", title: "New workflow gate", stage: "validation", briefingId: "brief-b" };
  const host = await mountBridge(t, true, rpc => {
    rpc["gates.read"] = () => !changed ? Promise.resolve({ gates: [oldGate], failedWorkflowDirs: [] })
      : ready ? Promise.resolve({ gates: [newGate], failedWorkflowDirs: [] })
      : new Promise(resolve => pending.push({ resolve }));
  }, true);
  await host.click("1 gates and questions waiting for you");
  changed = true;
  const next = { ...host.agents[1], labels: { ...host.agents[1].labels, "workflow-dir": "/workflow-new", task: "shared" } };
  host.agents.splice(0, host.agents.length, next);
  await host.publishAgents();
  ready = true;
  await act(async () => { for (const read of pending) read.resolve({ gates: [newGate], failedWorkflowDirs: [] }); });
  assert.ok(host.find("1 gates and questions waiting for you"));
  assert.equal(Boolean(host.find("Open Old workflow gate")), false);
  assert.match(host.text(), /B FO · Gate/);
  assert.doesNotMatch(host.text(), /A FO/);
  await host.click("Open New workflow gate");
  assert.equal(host.screens.at(-1).params.item, '["g","/workflow-new","b","validation","brief-b"]');
  assert.ok(host.find("Message B FO"));
  assert.ok(host.find("Choose 要求修改"));
  assert.equal(Boolean(host.find("Message A FO")), false);
});

test("same-workflow refresh keeps its own cached gate during loading and failure", async t => {
  let refreshing = false;
  const pending: { reject(error: Error): void }[] = [];
  const gate = { workflowDir: "/workflow-a", slug: "a", title: "Current workflow gate", stage: "validation", briefingId: "brief-a" };
  const host = await mountBridge(t, false, rpc => {
    rpc["gates.read"] = () => refreshing
      ? new Promise((_resolve, reject) => pending.push({ reject }))
      : Promise.resolve({ gates: [gate], failedWorkflowDirs: [] });
  }, true);
  await host.click("1 gates and questions waiting for you");
  refreshing = true;
  await host.pollGates();
  assert.ok(host.find("Waiting items: sources incomplete"));
  assert.ok(host.find("Open Current workflow gate"));
  assert.match(host.text(), /A FO · Gate/);
  await act(async () => { for (const read of pending) read.reject(new Error("current workflow unavailable")); });
  assert.ok(host.find("Waiting items: sources incomplete"));
  assert.ok(host.find("Open Current workflow gate"));
  assert.match(host.text(), /A FO · Gate/);
});

test("sidebar badge and popover actions use attention theme colors instead of accent", async t => {
  const host = await mountBridge(t, false, undefined, true, {
    statusWarning: "#edaa33", surface0: "#101112", accent: "#116633", accentForeground: "#ffffff",
  });
  const badge = host.find("2 gates and questions waiting for you")!.firstElementChild as HTMLElement;
  assert.equal(badge.style.backgroundColor, "rgb(237, 170, 51)");
  assert.equal(badge.style.color, "rgb(16, 17, 18)");
  await host.click("2 gates and questions waiting for you");
  const actionColor = (label: string) => (host.find(label)!.firstElementChild as HTMLElement).style.color;
  assert.equal(actionColor("Open Bridge"), "rgb(237, 170, 51)");
  host.rpc["gates.read"] = async () => { throw new Error("unavailable"); };
  await host.pollGates();
  assert.equal(actionColor("Check waiting sources again"), "rgb(237, 170, 51)");
});

for (const compact of [true, false]) test(`scroll cue follows measured overflow on ${compact ? "compact" : "wide"} popovers`, async t => {
  const host = await mountBridge(t, compact, undefined, true, { foregroundMuted: "#aabbcc" });
  await host.click("2 gates and questions waiting for you");
  await host.measure("Waiting items", 200, 400);
  assert.equal(host.text().includes("Scroll to see all 2 items"), compact);
  if (compact) {
    const hint = [...host.container.querySelectorAll<HTMLElement>("div")].find(node => !node.children.length && node.textContent === "Scroll to see all 2 items")!;
    assert.equal(hint.style.color, "rgb(170, 187, 204)");
    assert.equal(host.find("Waiting items")!.contains(hint), false);
  }
  await host.measure("Waiting items", 200, 150);
  assert.equal(host.text().includes("Scroll to see all 2 items"), false);
  await host.measure("Waiting items", 100, 150);
  assert.equal(host.text().includes("Scroll to see all 2 items"), compact);
  await host.measure("Waiting items", 200, 200.5);
  assert.equal(host.text().includes("Scroll to see all 2 items"), false);
  assert.ok(host.find("Open Bridge"));
});

test("empty next text still counts a Captain-owned question, and only a checked empty fleet hides all count controls", async t => {
  const host = await mountBridge(t, false, rpc => { rpc["gates.read"] = async () => ({ gates: [], failedWorkflowDirs: [] }); }, true);
  const countControls = () => host.container.querySelectorAll('[aria-label$="gates and questions waiting for you"], [aria-label="Waiting items: sources incomplete"]');
  assert.equal(countControls().length, 0);
  Object.assign(host.agents[0].labels, { "next-owner": "captain", next: "" });
  await host.publishAgents();
  await host.click("1 gates and questions waiting for you");
  assert.ok(host.find("Open Has a question for you"));
  Reflect.deleteProperty(host.agents[0].labels, "next-owner");
  await host.publishAgents();
  assert.equal(countControls().length, 0);
  assert.match(host.text(), /Questions · 0/);
});
