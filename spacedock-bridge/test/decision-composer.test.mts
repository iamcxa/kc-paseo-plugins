import assert from "node:assert/strict";
import { test } from "node:test";
import { checkComposerTarget, decisionComposerHandlers, readDecisionDraft } from "../shared/decision-composer";
import { decideGate, type DecideContext, type DecidePorts } from "../shared/decide";
import { captainWords, DECISION_CHIPS, gateDecisionMessage, type ChipWord } from "../shared/relay";

let sequence = 0;
function harness() {
  const key = `decision-composer-${++sequence}`;
  const state = { draft: "Message draft", sending: false, error: "", target: "briefing-a", fail: false };
  const messages: string[] = [];
  const decisions: [string, string][] = [];
  let preflight = async (): Promise<string | null> => null;
  const handlers = (target = state.target) => decisionComposerHandlers(key, target, {
    draft: () => state.draft,
    setDraft: (text) => { state.draft = text; },
    sending: () => state.sending,
    setSending: (value) => { state.sending = value; },
    setError: (text) => { state.error = text; },
    footer: "(existing footer)",
    beforeSend: () => checkComposerTarget(() => state.target === target, preflight),
    sendToAgent: async (text) => {
      if (state.fail) throw Error("Send failed");
      messages.push(text);
    },
    onChip: async (word, reason) => {
      const refusal = await checkComposerTarget(() => state.target === target, preflight);
      if (refusal) return refusal;
      if (state.fail) throw Error("Send failed");
      decisions.push([word, reason]);
      return null;
    },
  });
  return { key, state, messages, decisions, handlers, draft: () => readDecisionDraft(key),
    preflight: (fn: typeof preflight) => { preflight = fn; } };
}

const words = Object.keys(DECISION_CHIPS) as ChipWord[];
const enter = { nativeEvent: { key: "Enter" }, preventDefault() {} };
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

test("message never decides", async () => {
  for (const word of words) {
    const h = harness();
    const c = h.handlers();
    c.choose(word);
    c.setReason("決定理由");
    await c.onKeyPress({ nativeEvent: { key: "Enter", isComposing: true } });
    await c.onKeyPress({ nativeEvent: { key: "Enter", keyCode: 229 } });
    await c.onKeyPress({ nativeEvent: { key: "Enter", shiftKey: true } });
    assert.deepEqual(h.messages, []);
    h.state.draft = " 中文訊息 ";
    await c.onKeyPress(enter);
    assert.deepEqual(h.messages, ["中文訊息\n\n(existing footer)"]);
    h.state.draft = "Arrow message";
    await c.send();
    assert.deepEqual(h.messages, ["中文訊息\n\n(existing footer)", "Arrow message\n\n(existing footer)"]);
    assert.deepEqual(h.decisions, []);
    assert.equal(h.draft().reason, "決定理由");
    assert.equal(h.draft().word, word);
  }
});

test("decision uses only its reason", async () => {
  for (const word of words) {
    const h = harness();
    const c = h.handlers();
    c.choose(word);
    assert.deepEqual(h.decisions, []);
    assert.equal(h.draft().reason, "");
    c.cancel();
    await c.confirm();
    assert.deepEqual(h.decisions, []);
    c.choose(word);
    await c.confirm();
    assert.deepEqual(h.decisions, word === "准" ? [[word, ""]] : []);
    c.choose(word);
    c.setReason(" 決定理由 ");
    await c.confirm();
    assert.deepEqual(h.decisions.at(-1), [word, " 決定理由 "]);
    assert.equal(h.state.draft, "Message draft");
    assert.deepEqual(h.messages, []);

    const relay: string[] = [];
    const claims: unknown[] = [];
    const context = {
      gate: { slug: "gate-a" },
      briefing: { briefingId: "briefing-a", digest: "sha256:abc", stage: "validation" },
      fo: { id: "officer-a", title: "Officer A" },
    } as DecideContext;
    const ports: DecidePorts = {
      beforeSend: async () => null,
      claim: async (input) => { claims.push(input); return { claimed: true, record: { ...input, at: 1 } }; },
      setClaim() {}, openCoordinator: async () => ({ agentId: "comms" }),
      sendToCoordinator: async (id, text) => { assert.equal(id, "comms"); relay.push(text); },
      release: async () => {}, markSent() {}, newId: () => "d-fixed",
    };
    await decideGate(ports, context, word, " 決定理由 ");
    assert.deepEqual(claims, [{ decisionId: "d-fixed", briefingId: "briefing-a", slug: "gate-a",
      foId: "officer-a", decision: DECISION_CHIPS[word], words: captainWords(word, " 決定理由 ") }]);
    assert.deepEqual(relay, [gateDecisionMessage({ foId: "officer-a", foTitle: "Officer A", slug: "gate-a",
      briefingId: "briefing-a", digest: "sha256:abc", stage: "validation" }, word, " 決定理由 ", "d-fixed")]);
    assert.ok(!relay[0].includes("Message draft"));
  }
});

test("both actions keep the other draft", async () => {
  for (const word of words) {
    for (const action of ["message", "decision"]) {
      const h = harness();
      const c = h.handlers();
      c.choose(word);
      c.setReason("Original reason");
      c.cancel();
      assert.equal(h.draft().reason, "Original reason");
      const remounted = h.handlers();
      remounted.choose(word);
      const pending = deferred();
      h.preflight(async () => { await pending.promise; return null; });
      const work = action === "message" ? remounted.send() : remounted.confirm();
      const again = h.handlers();
      h.state.draft = "New message while pending";
      again.setReason("New reason while pending");
      pending.resolve();
      await work;
      assert.equal(h.state.draft, "New message while pending");
      assert.equal(h.draft().reason, "New reason while pending");
      h.preflight(async () => null);
      await (action === "message" ? again.send() : again.confirm());
      assert.equal(h.state.draft, action === "message" ? "" : "New message while pending");
      assert.equal(h.draft().reason, action === "decision" ? "" : "New reason while pending");
    }
  }
});

test("a changed briefing or officer cannot receive a stale action", async () => {
  for (const target of ["briefing-b", "officer-b"]) {
    for (const action of ["message", "decision"]) {
      const h = harness();
      const old = h.handlers();
      old.choose("要求修改");
      old.setReason("Kept reason");
      const preflight = deferred();
      h.preflight(async () => { await preflight.promise; return null; });
      const work = action === "message" ? old.send() : old.confirm();
      h.state.target = target;
      preflight.resolve();
      await work;
      assert.deepEqual(h.messages, []);
      assert.deepEqual(h.decisions, []);
      assert.equal(h.state.draft, "Message draft");
      assert.equal(h.draft().reason, "Kept reason");
      assert.match(h.state.error, /changed/);
      const next = h.handlers();
      await next.confirm();
      assert.deepEqual(h.decisions, []);
      const otherOfficer = harness();
      assert.equal(otherOfficer.draft().reason, "");
      h.preflight(async () => "The briefing changed");
      next.choose("准");
      await next.confirm();
      assert.deepEqual(h.decisions, []);
    }
  }
});

test("pending, failure and duplicate presses keep existing behavior", async () => {
  for (const word of words) {
    for (const action of ["message", "decision"]) {
      const h = harness();
      const c = h.handlers();
      c.choose(word);
      c.setReason("Original reason");
      const check = deferred();
      h.preflight(async () => { await check.promise; return null; });
      const pending = action === "message" ? c.send() : c.confirm();
      assert.equal(h.state.sending, true);
      const remounted = h.handlers();
      await remounted.send();
      await remounted.confirm();
      await remounted.onKeyPress(enter);
      remounted.cancel();
      remounted.choose("暫緩");
      assert.equal(h.draft().word, word);
      check.resolve();
      await pending;
      assert.equal(h.messages.length + h.decisions.length, 1);
      assert.equal(h.state.sending, false);
      h.state.draft = "Retained message";
      c.choose(word);
      c.setReason("Retained reason");
      h.state.fail = true;
      await (action === "message" ? c.send() : c.confirm());
      assert.match(h.state.error, /Send failed/);
      assert.equal(h.state.draft, "Retained message");
      assert.equal(h.draft().reason, "Retained reason");
      assert.equal(h.state.sending, false);
      assert.equal(h.messages.length + h.decisions.length, 1);
    }
  }
});
