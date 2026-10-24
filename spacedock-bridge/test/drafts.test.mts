import assert from "node:assert/strict";
import { test } from "node:test";
import { composerHandlers } from "../shared/composer";
import { draftKey, readDraft, seedDraft, writeDraft } from "../shared/drafts";

test("drafts survive remount reads, isolated by agent, gate and stage", () => {
  const key = draftKey("fo-a", { slug: "gate-a", stage: "validation" });
  writeDraft(key, "Unfinished reply");
  assert.equal(readDraft(draftKey("fo-a", { slug: "gate-a", stage: "validation" })), "Unfinished reply");
  for (const other of [
    draftKey("fo-a", { slug: "gate-b", stage: "validation" }),
    draftKey("fo-b", { slug: "gate-a", stage: "validation" }),
    draftKey("fo-a", { slug: "gate-a", stage: "backlog" }),
    draftKey("fo-a"),
  ]) assert.equal(readDraft(other), "");
  assert.notEqual(draftKey("fo:a", { slug: "b", stage: "c" }), draftKey("fo", { slug: "a:b", stage: "c" }));
  writeDraft(key, "");
});

test("a comms officer seed fills an empty draft and preserves non-empty text", () => {
  const key = draftKey("seed-co");
  assert.equal(seedDraft(key, "Suggested question"), "Suggested question");
  writeDraft(key, "My unfinished question");
  assert.equal(seedDraft(key, "Another question"), "My unfinished question");
  assert.equal(readDraft(key), "My unfinished question");
  writeDraft(key, " ");
  assert.equal(seedDraft(key, "Another question"), " ");
  writeDraft(key, "");
});

for (const action of ["send", "decision"] as const) {
  for (const refused of [false, true]) {
    test(`stored draft ${refused ? "survives refused" : "clears after successful"} ${action}`, async () => {
      const key = draftKey(`${action}-${refused}`, { slug: "gate-a", stage: "validation" });
      const other = draftKey(`${action}-${refused}`, { slug: "gate-b", stage: "validation" });
      writeDraft(key, "My reason");
      writeDraft(other, "Other reason");
      const sent: string[] = [];
      const decisions: [string, string][] = [];
      const handlers = composerHandlers({
        draft: () => readDraft(key),
        setDraft: (text) => writeDraft(key, text),
        setError: () => {},
        sending: () => false,
        setSending: () => {},
        beforeSend: async () => refused ? "Briefing changed" : null,
        sendToAgent: async (text) => { sent.push(text); },
        onChip: async (word, text) => {
          decisions.push([word, text]);
          return refused ? "Decision refused" : null;
        },
      });
      if (action === "send") await handlers.send();
      else await handlers.chip("要求修改");
      assert.equal(readDraft(key), refused ? "My reason" : "");
      assert.equal(readDraft(other), "Other reason");
      assert.deepEqual(sent, action === "send" && !refused ? ["My reason"] : []);
      assert.deepEqual(decisions, action === "decision" ? [["要求修改", "My reason"]] : []);
      writeDraft(key, "");
      writeDraft(other, "");
    });
  }
}
