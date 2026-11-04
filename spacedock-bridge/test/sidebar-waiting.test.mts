import assert from "node:assert/strict";
import { test } from "node:test";
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

test("popover sorts gates and questions together by age; item routes to that Bridge detail and Open Bridge to board", async t => {
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
  assert.ok(text.indexOf("Choose the retry limit") < text.indexOf("Approve a?"));
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
  host.timeline.set("co", [{ seqStart: 1, timestamp: "2026-11-01T10:00:00Z", item: { type: "assistant_message", text: "Next: Choose the next direction (you)" } }]);
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
