import assert from "node:assert/strict";
import { test } from "node:test";
import { mountBridge } from "./helpers/bridge-host.mjs";

type Host = Awaited<ReturnType<typeof mountBridge>>;
function detail(h: Host): string {
  let node: Element | null = h.find("Message A FO")!;
  while (node && !node.querySelector('[aria-label="Back to list"]')) node = node.parentElement;
  assert.ok(node);
  return node.textContent!;
}

for (const source of ["label", "reply"] as const) {
  for (const compact of [false, true]) {
    test(`one officer asks two questions in turn, keeping recipient and draft (${source}, ${compact ? 360 : 1440})`, async t => {
      const h = await mountBridge(t, compact);
      const agent = h.agents[0];
      const firstAt = new Date(Date.now() - 900_000).toISOString();
      const secondAt = new Date(Date.now() - 180_000).toISOString();
      const questions = ["Which release window? (you)", "Which rollback plan? (you)"];
      if (source === "label") agent.labels = { ...agent.labels, "next-owner": "captain", next: questions[0] } as any;
      else Object.assign(agent, { requiresAttention: true, attentionReason: "finished" });
      Object.assign(agent, { updatedAt: source === "label" ? firstAt : new Date(Date.now() - 30_000).toISOString(), attentionTimestamp: source === "label" ? firstAt : null });
      h.timeline.set("a", [{ seqStart: 1, timestamp: firstAt, item: { type: "assistant_message", text: `Next: ${questions[0]}` } }]);
      await h.publishAgents();
      if (compact) await h.click("Board");
      await h.click(`${questions[0]} — A FO`);
      await h.type("Message A FO", "Keep this officer discussion draft");
      const original = h.find("Message A FO") as HTMLTextAreaElement;
      await h.click("Back to Chief of staff");
      agent.updatedAt = source === "label" ? secondAt : new Date().toISOString();
      if (source === "label") { Object.assign(agent, { attentionTimestamp: secondAt }); Object.assign(agent.labels, { next: questions[1] }); }
      h.timeline.set("a", [{ seqStart: 2, timestamp: secondAt, item: { type: "assistant_message", text: `Next: ${questions[1]}` } }]);
      await h.publishAgents();
      if (compact) await h.click("Board");
      await h.click(`${questions[1]} — A FO`);
      assert.ok(h.find("Message A FO") !== original, "a new question has a distinct retained detail");
      assert.ok(original.isConnected, "the first question's surface stays mounted");
      assert.match(detail(h), /Which rollback plan/);
      assert.doesNotMatch(detail(h), /Which release window/);
      assert.match(detail(h), /waiting 3m/, "the detail uses the new question's own time");
      assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value, "Keep this officer discussion draft");
      await h.click("Back to Chief of staff"); if (compact) await h.click("Board");
      const second = h.container.querySelectorAll('[aria-label="Message A FO"]');
      await h.click(`${questions[1]} — A FO`);
      assert.equal(h.container.querySelectorAll('[aria-label="Message A FO"]').length, second.length, "reopening the same question reuses its detail");
      await h.click("Send to A FO");
      assert.deepEqual(h.sent, [{ id: "a", text: "Keep this officer discussion draft" }]);
    });
  }
}

for (const changed of ["message", "timestamp"] as const) {
  test(`an identical repeated question gets its own identity and time from its ${changed}`, async t => {
    const h = await mountBridge(t);
    const agent = h.agents[0];
    Object.assign(agent, { requiresAttention: true, attentionReason: "finished" });
    const firstAt = new Date(Date.now() - 900_000).toISOString();
    const secondAt = new Date(Date.now() - 180_000).toISOString();
    const question = "Choose the window (you)";
    h.timeline.set("a", [{ ...(changed === "message" ? { seqStart: 10 } : {}), timestamp: firstAt, item: { type: "assistant_message", text: `Next: ${question}` } }]);
    await h.publishAgents(); await h.click(`${question} — A FO`);
    const original = h.find("Message A FO");
    await h.type("Message A FO", "Repeated question draft"); await h.click("Back to Chief of staff");
    agent.updatedAt = new Date().toISOString();
    h.timeline.set("a", [{ ...(changed === "message" ? { seqStart: 11 } : {}), timestamp: changed === "message" ? firstAt : secondAt, item: { type: "assistant_message", text: `Next: ${question}` } }]);
    await h.publishAgents(); await h.click(`${question} — A FO`);
    assert.ok(h.find("Message A FO") !== original);
    assert.match(detail(h), changed === "message" ? /waiting 15m/ : /waiting 3m/);
    assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value, "Repeated question draft");
  });
}


test("a repeated label question uses its new attention timestamp", async t => {
  const h = await mountBridge(t); const agent = h.agents[0];
  const firstAt = new Date(Date.now() - 900_000).toISOString();
  const secondAt = new Date(Date.now() - 180_000).toISOString();
  agent.labels = { ...agent.labels, "next-owner": "captain", next: "Repeat the choice? (you)" } as any;
  Object.assign(agent, { updatedAt: firstAt, attentionTimestamp: firstAt });
  await h.publishAgents(); await h.click("Repeat the choice? (you) — A FO");
  const original = h.find("Message A FO"); await h.click("Back to Chief of staff");
  Object.assign(agent, { updatedAt: secondAt, attentionTimestamp: secondAt });
  await h.publishAgents(); await h.click("Repeat the choice? (you) — A FO");
  assert.ok(h.find("Message A FO") !== original); assert.match(detail(h), /waiting 3m/);
});

for (const source of ["label", "reply"] as const) {
  test(`an unrelated officer activity update keeps the same question detail (${source})`, async t => {
    const h = await mountBridge(t); const agent = h.agents[0];
    const timestamp = new Date(Date.now() - 180_000).toISOString();
    const question = "Keep the question open? (you)";
    if (source === "label") agent.labels = { ...agent.labels, "next-owner": "captain", next: question } as any;
    else Object.assign(agent, { requiresAttention: true, attentionReason: "finished" });
    Object.assign(agent, { updatedAt: timestamp });
    h.timeline.set("a", [{ seqStart: 10, timestamp, item: { type: "assistant_message", text: `Next: ${question}` } }]);
    await h.publishAgents(); await h.click(`${question} — A FO`);
    const original = h.find("Message A FO");
    await h.type("Message A FO", "Same-question draft"); await h.click("Back to Chief of staff");
    agent.updatedAt = new Date().toISOString();
    await h.publishAgents(); await h.click(`${question} — A FO`);
    assert.ok(h.find("Message A FO") === original, "officer activity is not question identity");
    assert.match(detail(h), /waiting 3m/);
    assert.equal((original as HTMLTextAreaElement).value, "Same-question draft");
  });
}
