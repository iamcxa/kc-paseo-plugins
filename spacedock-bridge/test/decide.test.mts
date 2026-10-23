import assert from "node:assert/strict";
import { test } from "node:test";
import { type DecidePorts, decideGate } from "../shared/decide";

const gate = { slug: "release-acceptance", title: "T", stage: "ideation" };
const briefing = {
  slug: "release-acceptance",
  stage: "ideation",
  briefingId: "briefing:release-acceptance:ideation:attempt-1:revision-1",
  digest: "sha256:3f2a9c1e0b7d4a6f00",
  question: "Q",
  artifacts: [],
};
const ctx = { gate, briefing, fo: { id: "2e87a82e", title: "dev2 FO" } };

function ports(over: Partial<DecidePorts> = {}) {
  const log = { claims: [] as { words: string; decision: string }[], sent: [] as [string, string][], marked: [] as string[] };
  const p: DecidePorts = {
    beforeSend: async () => null,
    claim: async (input) => {
      log.claims.push({ words: input.words, decision: input.decision });
      return { claimed: true, record: { ...input, at: 1 } };
    },
    setClaim: () => {},
    openCoordinator: async () => ({ agentId: "co" }),
    sendToCoordinator: async (agentId, text) => void log.sent.push([agentId, text]),
    release: async () => ({ released: true }),
    markSent: ({ text }) => log.marked.push(text),
    newId: () => "d-abc123",
    ...over,
  };
  return { p, log };
}

test("要求修改 and 暫緩 refuse an empty reason before claiming or sending anything", async () => {
  for (const word of ["要求修改", "暫緩"]) {
    for (const draft of ["", "   "]) {
      const { p, log } = ports();
      assert.match((await decideGate(p, ctx, word, draft)) ?? "", new RegExp(`^${word} needs your reason first`));
      assert.deepEqual(log.claims, []);
      assert.deepEqual(log.sent, []);
    }
  }
});

test("准 goes through with an empty box, via the comms officer", async () => {
  const { p, log } = ports();
  assert.equal(await decideGate(p, ctx, "准", ""), null);
  assert.deepEqual(log.claims, [{ words: "准", decision: "approve" }]);
  assert.equal(log.sent[0][0], "co");
  assert.match(log.sent[0][1], /Decision: approve\nMy words: 「准」/);
});

test("a decision chip sends the typed text as the reason", async () => {
  const { p, log } = ports();
  assert.equal(await decideGate(p, ctx, "要求修改", " 先補 CI "), null);
  assert.deepEqual(log.claims, [{ words: "要求修改，先補 CI", decision: "revise" }]);
  assert.match(log.sent[0][1], /Decision: revise\nMy words: 「要求修改，先補 CI」/);
  assert.match(log.sent[0][1], /put d-abc123 in the reason/);
  assert.deepEqual(log.marked, ["要求修改，先補 CI (d-abc123, via comms officer)"]);
});

test("a second decision on the same briefing is refused and sends nothing", async () => {
  const { p, log } = ports({
    claim: async (input) => ({ claimed: false, record: { ...input, decisionId: "d-old", at: 1 } }),
  });
  assert.match((await decideGate(p, ctx, "准", "")) ?? "", /You already sent approve 「准」 for this briefing \(d-old\)/);
  assert.deepEqual(log.sent, []);
});

test("a failed send releases the claim and rethrows", async () => {
  const released: string[] = [];
  const claims: unknown[] = [];
  const { p } = ports({
    sendToCoordinator: async () => {
      throw new Error("offline");
    },
    release: async (id) => void released.push(id),
    setClaim: (record) => void claims.push(record),
  });
  await assert.rejects(decideGate(p, ctx, "准", ""), /offline/);
  assert.deepEqual(released, ["d-abc123"]);
  assert.equal(claims[claims.length - 1], null);
});

test("a changed briefing refuses before claiming", async () => {
  const { p, log } = ports({ beforeSend: async () => "The briefing changed" });
  assert.equal(await decideGate(p, ctx, "准", ""), "The briefing changed");
  assert.deepEqual(log.claims, []);
});

test("an unloaded briefing refuses", async () => {
  const { p } = ports();
  assert.equal(await decideGate(p, { ...ctx, briefing: null }, "准", ""), "The briefing has not loaded yet.");
});
