import assert from "node:assert/strict";
import { test } from "node:test";
import { mountBridge } from "./helpers/bridge-host.mjs";

for (const nextStage of ["implementation", "validation"]) {
  test(`a recorded gate does not suppress a new ${nextStage} attempt of the same task`, async t => {
    const h = await mountBridge(t);
    await h.click("Approve a? — A FO");
    await h.click("Choose 要求修改"); await h.type("Reason for 要求修改", "Keep the old result");
    await h.click("Confirm 要求修改 via chief of staff");
    const old = h.claims.get("brief-a");
    h.records.set("brief-a", { decision: "revise", reason: `${old.decisionId} ${old.words}` });
    await h.poll(); await h.click("Back to Chief of staff");
    assert.match(h.text(), /Board · 1/);
    h.attempts.set("a", { stage: nextStage, briefingId: `next-${nextStage}`, title: "Approve the next attempt?" });
    await h.pollGates();
    assert.match(h.text(), /Board · 2/, "the later attempt has its own pending count");
    await h.click("Approve the next attempt? — A FO");
    assert.ok(h.find("Choose 准"), "a newer attempt is actionable even if the prior gate was recorded");
    assert.doesNotMatch(h.text(), /Recorded: revise/, "the old result stays with the old detail");
    await h.click("Back to Chief of staff"); await h.click("Approve a? — A FO");
    assert.match(h.text(), /Recorded: revise/);
    assert.match(h.text(), /Keep the old result/);
    assert.equal(h.find("Choose 准"), undefined, "the recorded attempt never becomes actionable");
    assert.equal(h.sent.length, 1);
  });
}

for (const failure of ["throw", "answer"]) {
  test(`a failed first briefing read retries on reopen and keeps its draft (${failure})`, async t => {
    const h = await mountBridge(t);
    const read = h.rpc["gate.briefing"];
    let calls = 0;
    h.rpc["gate.briefing"] = async (input: unknown) => {
      if (++calls === 1) {
        if (failure === "throw") throw new Error("First briefing read failed");
        return { briefing: null, recorded: null, error: "First briefing read failed" };
      }
      return read(input);
    };
    await h.click("Approve a? — A FO");
    assert.match(h.text(), /First briefing read failed/);
    await h.type("Message A FO", "Keep the question draft");
    await h.click("Back to Chief of staff"); await h.click("Approve a? — A FO");
    assert.equal(calls, 2, "reactivating the unresolved card retries its reader");
    assert.doesNotMatch(h.text(), /First briefing read failed/);
    assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value, "Keep the question draft");
    const beforePoll = calls;
    await h.poll();
    assert.ok(calls > beforePoll, "a loaded open briefing is polled without needing a prior send");
    assert.equal(h.sent.length, 0);
  });
}

test("a retained active attempt never adopts its replacement's briefing", async t => {
  const h = await mountBridge(t);
  await h.click("Approve a? — A FO");
  h.attempts.set("a", { stage: "validation", briefingId: "replacement", title: "Approve the replacement?" });
  await h.pollGates(); await h.poll();
  assert.equal(h.find("Choose 准"), undefined, "the superseded detail cannot decide for its replacement");
  assert.match(h.text(), /This gate is no longer open/);
  await h.click("Approve the replacement? — A FO");
  assert.ok(h.find("Choose 准"));
  assert.equal(h.sent.length, 0);
});

test("a late failure from the first read cannot overwrite a successful reopen", async t => {
  const h = await mountBridge(t);
  const read = h.rpc["gate.briefing"];
  let reject!: (error: Error) => void;
  let calls = 0;
  h.rpc["gate.briefing"] = (input: unknown) => ++calls === 1 ? new Promise((_resolve, fail) => { reject = fail; }) : read(input);
  await h.click("Approve a? — A FO");
  await h.type("Message A FO", "Keep this through the retry");
  await h.click("Back to Chief of staff"); await h.click("Approve a? — A FO");
  assert.equal(calls, 2);
  const { act } = await import("react");
  await act(async () => reject(new Error("Stale first read failed")));
  assert.doesNotMatch(h.text(), /Stale first read failed/);
  assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value, "Keep this through the retry");
});
