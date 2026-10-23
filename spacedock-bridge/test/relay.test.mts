import assert from "node:assert/strict";
import { test } from "node:test";
import { deliveryState, gateDecisionMessage, needsReason, newDecisionId } from "../shared/relay";

const gate = {
  foTitle: "kc-plugin dev2 FO",
  foId: "2e87a82e",
  slug: "release-acceptance",
  stage: "ideation",
  briefingId: "briefing:release-acceptance:ideation:attempt-1:revision-1",
  digest: "sha256:3f2a9c1e0b7d4a6f00",
};

test("a chip becomes a relay order carrying the decision and the Captain's exact words", () => {
  const text = gateDecisionMessage(gate, "准", "", "d-abc123");
  assert.match(text, /^Relay my gate decision d-abc123 to kc-plugin dev2 FO \(agent 2e87a82e\)/);
  assert.match(text, /put d-abc123 in the reason/);
  assert.match(text, /For you, not the FO: when it reports back, answer me in one line: ✓ release-acceptance recorded \(d-abc123\)/);
  assert.match(text, /only if the gate's open briefing is still briefing:release-acceptance:ideation:attempt-1:revision-1/);
  assert.match(text, /Decision: approve/);
  assert.match(text, /My words: 「准」/);
  assert.match(text, /briefing:release-acceptance:ideation:attempt-1:revision-1 · sha256:3f2a9c1e0b7d/);
});

test("text already typed joins the chip word as the Captain's words", () => {
  assert.match(gateDecisionMessage(gate, "要求修改", " 先補 CI ", "d-abc123"), /Decision: revise\nMy words: 「要求修改，先補 CI」/);
  assert.match(gateDecisionMessage(gate, "暫緩", "", "d-abc123"), /Decision: hold/);
});

test("a decision id is d- and six base-36 characters", () => {
  assert.equal(newDecisionId(() => 0), "d-000000");
  assert.match(newDecisionId(), /^d-[0-9a-z]{6}$/);
});

test("delivery moves sent, relayed, recorded, and asks for a check after ten minutes", () => {
  const base = { sentAt: 0, now: 1_000, relayed: false, recordedReason: null, decisionId: "d-1", words: "准" };
  assert.equal(deliveryState(base), "sent");
  assert.equal(deliveryState({ ...base, relayed: true }), "relayed");
  assert.equal(deliveryState({ ...base, recordedReason: "Captain: 「准」 (d-1)" }), "recorded");
  assert.equal(deliveryState({ ...base, recordedReason: "Captain: 「准」" }), "recorded-elsewhere");
  assert.equal(deliveryState({ ...base, recordedReason: "Captain approved (d-1)" }), "recorded-elsewhere");
  assert.equal(deliveryState({ ...base, now: 11 * 60_000 }), "check");
});

test("revise and hold need a typed reason; approve does not", () => {
  assert.equal(needsReason("准"), false);
  assert.equal(needsReason("要求修改"), true);
  assert.equal(needsReason("暫緩"), true);
});
