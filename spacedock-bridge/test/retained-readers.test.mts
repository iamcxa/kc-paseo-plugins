import assert from "node:assert/strict";
import { test } from "node:test";
import { act } from "react";
import { mountBridge } from "./helpers/bridge-host.mjs";

type Host = Awaited<ReturnType<typeof mountBridge>>;
const surfaces = [
  { name: "gate briefing", mode: "gate", reader: "briefing", retry: "Retry briefing" },
  { name: "gate conversation", mode: "gate", reader: "conversation", retry: "Retry conversation with A FO" },
  { name: "assigned review conversation", mode: "review", reader: "conversation", retry: "Retry conversation with A FO" },
  { name: "FO conversation", mode: "fo", reader: "conversation", retry: "Retry conversation with A FO" },
  { name: "commander conversation", mode: "commander", reader: "conversation", retry: "Retry conversation with Comms officer" },
  { name: "decision record", mode: "gate", reader: "claim", retry: "Retry decision record" },
  { name: "relay status", mode: "gate", reader: "relay", retry: "Retry delivery status" },
  { name: "commander question", mode: "commander", reader: "question", retry: "Retry conversation with Comms officer" },
] as const;
type Surface = typeof surfaces[number];
const claim = { decisionId: "kept-decision", briefingId: "brief-a", slug: "a", foId: "a", decision: "approve", words: "准", at: Date.now() };
const label = (s: Surface) => `Message ${s.mode === "commander" ? "Comms officer" : "A FO"}`;
async function open(h: Host, s: Surface, shifted = false) {
  if (s.mode === "review") {
    h.rpc["reviews.read"] = async () => ({ requests: [{ owner: "org", repo: "a", number: 42, url: "https://github.com/org/a/pull/42", title: "Review the change", author: "author", firstSeenAt: 1 }], checkedAt: 1, nextCheckAt: null, error: null });
    await h.pollGates(); await h.click(`Review the change — ${shifted ? "Shifted FO" : "A FO"}`); return;
  }
  if (s.mode === "commander") { await h.click("Commander"); return; }
  if (s.mode === "fo") { await h.click("By FO"); await h.click(`Conversation with ${shifted ? "Shifted FO" : "A FO"}`); return; }
  await h.click(`Approve a? — ${shifted ? "Shifted FO" : "A FO"}`);
}
async function away(h: Host, s: Surface) {
  if (s.mode === "commander") await h.click("Approve b? — B FO");
  else await h.click("Back to Commander");
}
function fault(h: Host, s: Surface) {
  let broken = true;
  if (s.reader === "briefing" || s.reader === "claim") {
    const name = s.reader === "briefing" ? "gate.briefing" : "decisions.read";
    const read = h.rpc[name];
    h.rpc[name] = (input: unknown) => broken ? Promise.reject(new Error(`Unavailable ${s.name}`)) : read(input);
  } else if (s.reader === "relay") h.readFailures.add("a:canonical");
  else h.failures.add(s.mode === "commander" ? "co" : "a");
  return () => { broken = false; h.failures.clear(); h.readFailures.clear(); };
}

for (const surface of surfaces) {
  test(`retained surface table: ${surface.name} × identity changed upstream`, async t => {
    const h = await mountBridge(t);
    h.agents[0].labels = { ...h.agents[0].labels, task: "a" } as any;
    const readBriefing = h.rpc["gate.briefing"];
    const inputs: any[] = [];
    h.rpc["gate.briefing"] = (input: any) => {
      inputs.push(input);
      return input.workflowDir === "/workflow-a" ? readBriefing(input) : Promise.resolve({ briefing: null, recorded: null, error: null });
    };
    if (surface.reader === "relay") h.claims.set("brief-a", claim);
    await open(h, surface);
    await h.type(label(surface), `Draft for ${surface.name}`);
    const composer = h.find(label(surface));
    await away(h, surface);
    const gates = await h.rpc["gates.read"]({});
    h.rpc["gates.read"] = async () => gates;
    h.agents[0].labels["workflow-dir"] = "/moved-workflow";
    h.agents[0].title = "Shifted FO";
    h.rpc["coordinator.open"] = async () => ({ agentId: "replacement-co" });
    await h.publishAgents(); await h.pollGates();
    await open(h, surface, true); await h.poll();
    assert.ok(h.find(label(surface)) === composer, "the retained recipient/title and composer must not change");
    assert.equal((composer as HTMLTextAreaElement).value, `Draft for ${surface.name}`);
    if (surface.mode === "gate") {
      assert.ok(inputs.length > 1);
      assert.ok(inputs.every(input => input.workflowDir === "/workflow-a" && input.slug === "a" && input.stage === "validation"));
      assert.doesNotMatch(h.text(), /This gate is no longer open/);
    }
    await h.click(`Send to ${surface.mode === "commander" ? "Comms officer" : "A FO"}`);
    assert.equal(h.sent.at(-1)?.id, surface.mode === "commander" ? "co" : "a");
  });
  for (const recovery of ["reactivate", "retry control"]) {
    test(`retained surface table: ${surface.name} × failed read then ${recovery}`, async t => {
      const h = await mountBridge(t);
      if (surface.reader === "relay") h.claims.set("brief-a", claim);
      const restore = fault(h, surface);
      if (surface.mode === "commander") await h.refresh("co");
      await open(h, surface);
      await h.type(label(surface), `Keep ${surface.name}`);
      const composer = h.find(label(surface));
      if (recovery === "retry control") assert.ok(h.find(surface.retry), "each failed reader offers a visible retry");
      else assert.match(h.text(), /Unavailable|Cannot read|Could not read/, "the reader actually failed before the detour");
      restore();
      h.timeline.set(surface.mode === "commander" ? "co" : "a", [{ seqStart: 1, item: { type: "assistant_message", text: "Recovered conversation" } }]);
      if (surface.reader === "relay") h.timeline.set("a", [{ seqStart: 1, item: { type: "user_message", text: claim.decisionId } }]);
      if (recovery === "reactivate") { await away(h, surface); await open(h, surface); }
      else await h.click(surface.retry);
      assert.ok(h.find(label(surface)) === composer, "the mounted composer is retained");
      assert.equal((composer as HTMLTextAreaElement).value, `Keep ${surface.name}`);
      assert.ok(!h.find(surface.retry), "successful read clears its own failure");
      assert.doesNotMatch(h.text(), /Cannot read|Unavailable|Could not check/);
      if (surface.reader === "relay") assert.match(h.text(), /Relayed to A FO/);
      else if (surface.reader === "conversation" || surface.reader === "question") assert.match(h.text(), /Recovered conversation/);
      else assert.ok(h.find("Choose 准"));
      assert.equal(h.sent.length, 0, "retry only reads");
    });
  }
}

test("a gate uses its own source workflow even when first opened under another officer workflow", async t => {
  const h = await mountBridge(t);
  h.agents[0].labels = { ...h.agents[0].labels, task: "a" } as any;
  const original = await h.rpc["gates.read"]({});
  original.gates[0].workflowDir = "/source-workflow";
  h.rpc["gates.read"] = async () => original;
  const read = h.rpc["gate.briefing"];
  const inputs: any[] = [];
  h.rpc["gate.briefing"] = (input: any) => { inputs.push(input); return read(input); };
  await h.publishAgents(); await h.pollGates(); await h.click("Approve a? — A FO");
  await h.click("Choose 准"); await h.click("Confirm 准 via comms officer");
  assert.ok(inputs.length >= 2);
  assert.ok(inputs.every(input => input.workflowDir === "/source-workflow"));
});


for (const surface of surfaces) {
  test(`retained surface table: ${surface.name} × unresolved read then reactivate`, async t => {
    const h = await mountBridge(t);
    if (surface.reader === "relay") h.claims.set("brief-a", claim);
    let reject!: (error: Error) => void;
    const blocked = () => new Promise((_resolve, fail) => { reject = fail; });
    let restore: () => void;
    if (surface.reader === "briefing" || surface.reader === "claim") {
      const name = surface.reader === "briefing" ? "gate.briefing" : "decisions.read";
      const read = h.rpc[name]; h.rpc[name] = blocked; restore = () => { h.rpc[name] = read; };
    } else {
      const key = `${surface.mode === "commander" ? "co" : "a"}:${surface.reader === "relay" ? "canonical" : "projected"}`;
      h.readOverrides.set(key, blocked); restore = () => { h.readOverrides.delete(key); };
      if (surface.mode === "commander") await h.refresh("co");
    }
    await open(h, surface); await h.type(label(surface), "Pending draft");
    assert.ok(reject, "the unresolved reader has actually started");
    assert.ok(h.find(surface.retry), "unresolved readers also expose retry");
    await away(h, surface); restore(); await open(h, surface);
    await act(async () => reject(new Error("Late rejected read")));
    assert.ok(!h.find(surface.retry));
    assert.doesNotMatch(h.text(), /Late rejected read/);
    assert.equal((h.find(label(surface)) as HTMLTextAreaElement).value, "Pending draft");
  });
}

for (const mode of ["gate", "fo", "commander"] as const) {
  for (const failure of ["ready", "event"] as const) {
    test(`retained subscription: ${mode} × ${failure} failure recovers with draft`, async t => {
      const surface = surfaces.find(s => s.mode === mode && s.reader === "conversation")!;
      const h = await mountBridge(t);
      const id = mode === "commander" ? "co" : "a";
      if (failure === "ready" && mode !== "commander") h.subscriptionFailures.add(id);
      await open(h, surface); await h.type(label(surface), "Subscription draft");
      if (failure === "event" || mode === "commander") await h.emitTimeline(id, "error");
      assert.ok(h.find(surface.retry));
      h.subscriptionFailures.delete(id);
      h.timeline.set(id, [{ seqStart: 1, item: { type: "assistant_message", text: "Subscription recovered" } }]);
      await away(h, surface); await open(h, surface);
      assert.ok(!h.find(surface.retry));
      assert.match(h.text(), /Subscription recovered/);
      assert.equal((h.find(label(surface)) as HTMLTextAreaElement).value, "Subscription draft");
    });
  }
}

for (const recovery of ["reactivate", "retry control"]) {
  test(`commander connection reader × failed read then ${recovery}`, async t => {
    let broken = true;
    const h = await mountBridge(t, false, rpc => {
      rpc["coordinator.open"] = async () => { if (broken) throw new Error("Connection failed"); return { agentId: "co" }; };
    });
    assert.match(h.text(), /Connection failed/);
    assert.ok(h.find("Retry commander connection"));
    broken = false;
    if (recovery === "reactivate") { await h.click("Approve a? — A FO"); await h.click("Back to Commander"); }
    else await h.click("Retry commander connection");
    await h.type("Message Comms officer", "Connected draft");
    h.rpc["coordinator.open"] = async () => ({ agentId: "replacement-co" });
    await h.click("Approve a? — A FO"); await h.click("Back to Commander");
    assert.equal((h.find("Message Comms officer") as HTMLTextAreaElement).value, "Connected draft");
    await h.click("Send to Comms officer"); assert.equal(h.sent.at(-1)?.id, "co");
  });
}


for (const source of ["gates", "tasks", "review source"] as const) {
  for (const recovery of ["reactivate", "retry control"]) {
    test(`retained phone board: ${source} × failed read then ${recovery}`, async t => {
      const h = await mountBridge(t, true);
      h.agents[0].labels = { ...h.agents[0].labels, task: "a" } as any;
      await h.publishAgents();
      const name = source === "review source" ? "reviews.read" : `${source}.read`;
      const read = h.rpc[name];
      h.rpc[name] = async () => { throw new Error("Board source failed"); };
      await h.pollGates(); await h.click("Board");
      assert.ok(h.find(`Check ${source} again`));
      h.rpc[name] = read;
      if (recovery === "reactivate") { await h.click("Back to Commander"); await h.click("Board"); }
      else await h.click(`Check ${source} again`);
      assert.ok(!h.find(`Check ${source} again`));
      assert.match(h.text(), /Waiting on you · 2/);
    });
  }
}


for (const source of ["gates", "tasks", "review source"] as const) {
  for (const recovery of ["reactivate", "retry control"]) {
    test(`retained phone board: ${source} × unresolved read then ${recovery}`, async t => {
      const h = await mountBridge(t, true);
      h.agents[0].labels = { ...h.agents[0].labels, task: "a" } as any;
      await h.publishAgents();
      const name = source === "review source" ? "reviews.read" : `${source}.read`;
      const read = h.rpc[name];
      const rejects: ((error: Error) => void)[] = [];
      h.rpc[name] = () => new Promise((_resolve, reject) => rejects.push(reject));
      await h.pollGates(); await h.click("Board");
      assert.ok(rejects.length);
      assert.ok(h.find(`Check ${source} again`));
      h.rpc[name] = read;
      if (recovery === "reactivate") { await h.click("Back to Commander"); await h.click("Board"); }
      else await h.click(`Check ${source} again`);
      await act(async () => { for (const reject of rejects) reject(new Error("Late board read failed")); });
      assert.ok(!h.find(`Check ${source} again`));
      assert.match(h.text(), /Waiting on you · 2/);
    });
  }
}

for (const recovery of ["reactivate", "retry control"]) {
  test(`retained phone board: FO question reader × failed read then ${recovery}`, async t => {
    const h = await mountBridge(t, true);
    Object.assign(h.agents[0], { requiresAttention: true, attentionReason: "finished" });
    h.readFailures.add("a:projected");
    await h.publishAgents(); await h.click("Board");
    assert.ok(h.find("Check FOs again"));
    h.readFailures.clear();
    if (recovery === "reactivate") { await h.click("Back to Commander"); await h.click("Board"); }
    else await h.click("Check FOs again");
    assert.ok(!h.find("Check FOs again"));
    assert.match(h.text(), /Waiting on you · 2/);
  });
}
