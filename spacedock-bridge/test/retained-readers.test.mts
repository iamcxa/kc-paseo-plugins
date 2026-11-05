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
      h.timeline.set(surface.mode === "commander" ? "co" : "a", [...(surface.mode === "commander" ? [{ seqStart: 0, item: { type: "user_message", text: "Discuss current work" } }] : []), { seqStart: 1, item: { type: "assistant_message", text: "Recovered conversation" } }]);
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
      const key = `${surface.mode === "commander" ? "co" : "a"}:${surface.mode === "commander" || surface.reader === "relay" ? "canonical" : "projected"}`;
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
      h.timeline.set(id, [...(id === "co" ? [{ seqStart: 0, item: { type: "user_message", text: "Discuss current work" } }] : []), { seqStart: 1, item: { type: "assistant_message", text: "Subscription recovered" } }]);
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
      assert.match(h.text(), /Board · 2/);
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
      assert.match(h.text(), /Board · 2/);
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
    assert.match(h.text(), /Board · 2/);
  });
}


for (const surface of surfaces) {
  test(`retained surface table: ${surface.name} × loaded value changes then reactivate`, async t => {
    const h = await mountBridge(t);
    if (surface.reader === "relay" || surface.reader === "claim") h.claims.set("brief-a", claim);
    await open(h, surface); await h.type(label(surface), "Freshness draft");
    const composer = h.find(label(surface));
    await away(h, surface);
    if (surface.reader === "briefing") {
      const read = h.rpc["gate.briefing"];
      h.rpc["gate.briefing"] = async (input: unknown) => { const reply = await read(input); return { ...reply, briefing: { ...reply.briefing, artifacts: [{ summary: "Fresh briefing", markdown: "Fresh evidence" }] } }; };
    } else if (surface.reader === "claim") h.claims.delete("brief-a");
    else h.timeline.set(surface.mode === "commander" ? "co" : "a", [...(surface.mode === "commander" ? [{ seqStart: 0, item: { type: "user_message", text: "Discuss current work" } }] : []), { seqStart: 1, item: { type: surface.reader === "relay" ? "user_message" : "assistant_message", text: surface.reader === "relay" ? claim.decisionId : "Next: Fresh conversation (you)" } }]);
    await open(h, surface);
    assert.ok(h.find(label(surface)) === composer, "refresh preserves the mounted surface");
    assert.equal((composer as HTMLTextAreaElement).value, "Freshness draft");
    if (surface.reader === "briefing") assert.match(h.text(), /Fresh briefing/);
    else if (surface.reader === "claim") { assert.ok(h.find("Choose 准"), "released claim no longer blocks a decision"); assert.doesNotMatch(h.text(), /Sent to the comms officer/); }
    else if (surface.reader === "relay") assert.match(h.text(), /Relayed to A FO/);
    else assert.match(h.text(), /Fresh conversation/);
    if (surface.reader === "question") assert.match(h.text(), /Board · 3/);
  });
}

test("retained surface table: claim released by another client then reopen", async t => {
  const h = await mountBridge(t);
  h.claims.set("brief-a", claim);
  await h.click("Approve a? — A FO");
  assert.match(h.text(), /Sent to the comms officer/);
  await h.type("Message A FO", "Keep released-claim draft");
  await h.click("Back to Commander"); h.claims.delete("brief-a");
  await h.click("Approve a? — A FO");
  assert.ok(h.find("Choose 准"));
  assert.doesNotMatch(h.text(), /Sent to the comms officer|Relayed to A FO/);
  assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value, "Keep released-claim draft");
  await h.click("Choose 准"); await h.click("Confirm 准 via comms officer");
  assert.equal(h.sent.length, 1);
});

for (const oldRecord of [null, { ...claim, decisionId: "older-external-claim" }]) {
  test(`retained surface table: refresh read overlaps a local send (${oldRecord ? "old claim" : "null"}); the local send wins`, async t => {
    const h = await mountBridge(t);
    await h.click("Approve a? — A FO"); await h.click("Back to Commander");
    let finishRead!: (reply: { record: typeof oldRecord }) => void;
    h.rpc["decisions.read"] = () => new Promise(resolve => { finishRead = resolve; });
    await h.click("Approve a? — A FO");
    assert.ok(finishRead, "a loaded claim is refreshed on reopen");
    let finishOpen!: (reply: { agentId: string }) => void;
    h.rpc["coordinator.open"] = () => new Promise(resolve => { finishOpen = resolve; });
    await h.click("Choose 暫緩"); await h.type("Reason for 暫緩", "New local reason");
    await h.click("Confirm 暫緩 via comms officer");
    assert.ok(finishOpen, "the local submission is in progress");
    const local = h.claims.get("brief-a");
    await act(async () => finishRead({ record: oldRecord }));
    assert.match(h.text(), /New local reason/);
    assert.ok(!h.find("Choose 准"));
    assert.doesNotMatch(h.text(), /older-external-claim/);
    await h.click("Back to Commander"); await h.click("Approve a? — A FO");
    assert.ok(!h.find("Choose 准"), "reactivation during a send does not clear its claim");
    const finishDuringSend = finishRead;
    await act(async () => finishOpen({ agentId: "co" }));
    await act(async () => finishDuringSend({ record: oldRecord }));
    assert.ok(!h.find("Choose 准"), "a read started during the send stays stale after completion");
    assert.match(h.text(), /New local reason/);
    assert.equal(h.sent.length, 1);
    assert.equal(h.claims.get("brief-a").decisionId, local.decisionId);
    assert.match(h.sent[0].text, /New local reason/);
  });
}

test("reactivation refreshes gate closure and recorded results without reviving recorded actions", async t => {
  const h = await mountBridge(t); await h.click("Approve a? — A FO");
  await h.click("Back to Commander");
  h.records.set("brief-a", { decision: "revise", reason: "Recorded by another client" });
  await h.click("Approve a? — A FO");
  assert.match(h.text(), /Recorded: revise/); assert.ok(!h.find("Choose 准"));
  await h.click("Back to Commander"); h.records.delete("brief-a"); h.claims.delete("brief-a");
  await h.click("Approve a? — A FO");
  assert.match(h.text(), /Recorded: revise/); assert.ok(!h.find("Choose 准"));
});

for (const source of ["gates", "tasks", "review source"]) {
  test(`retained phone board: ${source} × loaded value changes then reactivate`, async t => {
    const h = await mountBridge(t, true);
    h.agents[0].labels = { ...h.agents[0].labels, task: "a" } as any; await h.publishAgents();
    await h.click("Board"); await h.click("Back to Commander");
    const name = source === "review source" ? "reviews.read" : `${source}.read`;
    const read = h.rpc[name]; let calls = 0;
    h.rpc[name] = (input: unknown) => { ++calls; return read(input); };
    await h.click("Board"); assert.ok(calls > 0, "a successful live source is refreshed on return too");
  });
}


for (const result of ["closed", "recorded"] as const) {
  test(`retained surface table: briefing refresh overlaps a local send (${result})`, async t => {
    const h = await mountBridge(t); await h.click("Approve a? — A FO"); await h.click("Back to Commander");
    const read = h.rpc["gate.briefing"]; let calls = 0;
    let finishRead!: (value: any) => void;
    h.rpc["gate.briefing"] = (input: unknown) => ++calls === 1 ? new Promise(resolve => { finishRead = resolve; }) : read(input);
    await h.click("Approve a? — A FO"); assert.ok(finishRead);
    let finishOpen!: (value: { agentId: string }) => void;
    h.rpc["coordinator.open"] = () => new Promise(resolve => { finishOpen = resolve; });
    await h.click("Choose 准"); await h.click("Confirm 准 via comms officer"); assert.ok(finishOpen);
    await act(async () => finishRead({ briefing: null, error: null, recorded: result === "recorded" ? { decision: "approve", reason: "Authoritative recorded result" } : null }));
    assert.ok(!h.find("Choose 准"));
    assert.match(h.text(), result === "recorded" ? /Authoritative recorded result/ : /Board · 2/);
    await act(async () => finishOpen({ agentId: "co" }));
    assert.equal(h.sent.length, 1);
    if (result === "recorded") { await h.click("Back to Commander"); await h.click("Approve a? — A FO"); assert.ok(!h.find("Choose 准")); }
  });
}

test("an authoritative released claim clears cached local sent progress on reopen", async t => {
  const h = await mountBridge(t); await h.click("Approve a? — A FO");
  await h.click("Choose 准"); await h.click("Confirm 准 via comms officer");
  await h.click("Back to Commander"); h.claims.delete("brief-a");
  await h.click("Approve a? — A FO");
  assert.ok(h.find("Choose 准")); assert.doesNotMatch(h.text(), /Sent to the comms officer|Sent · not recorded yet/);
});
