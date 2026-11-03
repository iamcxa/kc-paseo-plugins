import assert from "node:assert/strict";
import { test } from "node:test";
import { act } from "react";
import { mountBridge } from "./helpers/bridge-host.mjs";
import { draftKey, readDraftSending } from "../shared/drafts";
import { readDecisionDraft } from "../shared/decision-composer";

type Gate = { workflowDir: string; slug: string; title: string; stage: string; briefingId: string };
const briefing = (gate: Gate) => ({ briefingId: gate.briefingId, slug: gate.slug, stage: gate.stage, digest: `digest-${gate.briefingId}`, question: gate.title, artifacts: [{ summary: gate.title, markdown: "Evidence" }] });
function reader(gates: Gate[]) {
  return async (input: { workflowDir: string; briefingId?: string }) => {
    const gate = gates.find(g => g.workflowDir === input.workflowDir && g.briefingId === input.briefingId) ?? [...gates].reverse().find(g => g.workflowDir === input.workflowDir);
    return { briefing: gate ? briefing(gate) : null, recorded: null, error: null };
  };
}

test("identical slugs in two workflows keep separate recipients", async t => {
  const h = await mountBridge(t);
  for (const agent of h.agents.slice(0, 2)) agent.labels = { ...agent.labels, task: "shared-task" } as any;
  const gates = ["a", "b"].map(id => ({ workflowDir: `/workflow-${id}`, slug: "shared-task", stage: "validation", briefingId: `shared-${id}`, title: `Approve ${id.toUpperCase()} workflow?` }));
  h.rpc["gates.read"] = async () => ({ gates, failedWorkflowDirs: [] });
  h.rpc["gate.briefing"] = reader(gates);
  await h.publishAgents(); await h.pollGates();
  for (const id of ["a", "b"]) {
    await h.click(`Approve ${id.toUpperCase()} workflow? — ${id.toUpperCase()} FO`);
    await h.click("Choose 要求修改"); await h.type("Reason for 要求修改", `Reason for ${id}`);
    await h.click("Confirm 要求修改 via comms officer");
    assert.equal(h.claims.get(`shared-${id}`).foId, id);
    assert.ok(h.sent.at(-1)!.text.includes(`to ${id.toUpperCase()} FO (agent ${id})`));
    await h.click("Back to Commander");
  }
});

for (const changed of ["workflow", "briefing"] as const) {
  test(`two retained gates sharing officer, slug and stage keep separate drafts, choices and sending state (${changed})`, async t => {
    const h = await mountBridge(t);
    h.agents[0].labels = { ...h.agents[0].labels, task: "shared-task" } as any;
    const first: Gate = { workflowDir: "/workflow-a", slug: "shared-task", stage: "validation", briefingId: "first-attempt", title: "First retained gate?" };
    const second: Gate = { ...first, workflowDir: changed === "workflow" ? "/other-workflow" : first.workflowDir, briefingId: "second-attempt", title: "Second retained gate?" };
    const gates = [first];
    h.rpc["gates.read"] = async () => ({ gates: [...gates], failedWorkflowDirs: [] });
    h.rpc["gate.briefing"] = reader(gates);
    await h.publishAgents(); await h.pollGates(); await h.click("First retained gate? — A FO");
    await h.type("Message A FO", "First message");
    await h.click("Choose 暫緩"); await h.type("Reason for 暫緩", "First reason");
    const oldComposer = h.find("Message A FO");
    let finish!: () => void;
    let sends = 0;
    h.sendOverrides.set("a", () => ++sends === 1 ? new Promise<void>(resolve => { finish = resolve; }) : Promise.resolve());
    await h.click("Send to A FO"); assert.ok(finish);
    assert.equal(readDraftSending(draftKey("a", first)), true);
    gates.push(second); await h.pollGates(); await h.click("Second retained gate? — A FO");
    const newComposer = h.find("Message A FO");
    assert.ok(oldComposer !== newComposer, "each gate retains its own mounted composer");
    assert.equal((newComposer as HTMLTextAreaElement).value, "", "the first gate's message cannot appear in the second");
    assert.equal(readDraftSending(draftKey("a", second)), false, "the first gate's sending lock cannot block the second");
    assert.equal(readDecisionDraft(draftKey("a", second)).word, null);
    await h.type("Message A FO", "Second message");
    await h.click("Choose 要求修改"); await h.type("Reason for 要求修改", "Second reason");
    assert.equal(readDecisionDraft(draftKey("a", first)).word, "暫緩");
    assert.equal(readDecisionDraft(draftKey("a", first)).reason, "First reason");
    await h.click("Confirm 要求修改 via comms officer");
    assert.equal(h.claims.get("second-attempt").words, "要求修改，Second reason");
    assert.equal(h.claims.has("first-attempt"), false);
    await h.click("First retained gate? — A FO");
    assert.ok(h.find("Message A FO") === oldComposer);
    assert.equal((oldComposer as HTMLTextAreaElement).value, "First message");
    assert.equal((h.find("Reason for 暫緩") as HTMLTextAreaElement).value, "First reason");
    await act(async () => finish());
    assert.equal((oldComposer as HTMLTextAreaElement).value, "");
    assert.equal(readDraftSending(draftKey("a", first)), false);
    await h.click("Second retained gate? — A FO");
    assert.ok(h.find("Message A FO") === newComposer);
    assert.equal((newComposer as HTMLTextAreaElement).value, "Second message");
    assert.match(h.text(), /Sent to the comms officer/);
    assert.equal(h.sent.length, 2);
  });
}
