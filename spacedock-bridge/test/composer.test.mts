import assert from "node:assert/strict";
import { test } from "node:test";
import { composerHandlers } from "../shared/composer";

function harness(over: Partial<Parameters<typeof composerHandlers>[0]> = {}) {
  const state = { draft: "", error: "", sending: false };
  const sent: string[] = [];
  const handlers = composerHandlers({
    draft: () => state.draft,
    setDraft: (text) => (state.draft = text),
    setError: (text) => (state.error = text),
    sending: () => state.sending,
    setSending: (value) => (state.sending = value),
    sendToAgent: async (text) => void sent.push(text),
    ...over,
  });
  return { state, sent, ...handlers };
}

const enter = { nativeEvent: { key: "Enter" }, preventDefault: () => {} };

test("Enter sends the typed text to the FO and clears the box", async () => {
  const sentTexts: string[] = [];
  const h = harness({ onSent: (text) => sentTexts.push(text) });
  h.state.draft = " 範圍 OK ";
  await h.onKeyPress(enter);
  assert.deepEqual(h.sent, ["範圍 OK"]);
  assert.deepEqual(sentTexts, ["範圍 OK"]);
  assert.equal(h.state.draft, "");
});

test("the round send button path sends the same text, with the footer, to the FO", async () => {
  const h = harness({ footer: "(Captain's reply on gate g)" });
  h.state.draft = "ok";
  await h.send();
  assert.deepEqual(h.sent, ["ok\n\n(Captain's reply on gate g)"]);
});

test("Shift+Enter and an IME confirm do not send; an empty box sends nothing", async () => {
  const h = harness();
  h.state.draft = "text";
  await h.onKeyPress({ nativeEvent: { key: "Enter", shiftKey: true } });
  await h.onKeyPress({ nativeEvent: { key: "Enter", isComposing: true } });
  h.state.draft = "  ";
  await h.onKeyPress(enter);
  assert.deepEqual(h.sent, []);
});

test("a refusal from beforeSend keeps the draft and shows the refusal", async () => {
  const h = harness({ beforeSend: async () => "The briefing changed" });
  h.state.draft = "ok";
  await h.send();
  assert.deepEqual(h.sent, []);
  assert.equal(h.state.draft, "ok");
  assert.equal(h.state.error, "The briefing changed");
  assert.equal(h.state.sending, false);
});

test("a decision chip passes the typed text to onChip, not to the FO, and clears the box on success", async () => {
  const calls: [string, string][] = [];
  const h = harness({
    onChip: async (word, draft) => {
      calls.push([word, draft]);
      return null;
    },
  });
  h.state.draft = "先補 CI";
  await h.chip("要求修改");
  assert.deepEqual(calls, [["要求修改", "先補 CI"]]);
  assert.deepEqual(h.sent, []);
  assert.equal(h.state.draft, "");
});

test("a chip refusal keeps the draft", async () => {
  const h = harness({ onChip: async (word) => `${word} needs your reason first` });
  await h.chip("暫緩");
  assert.equal(h.state.error, "暫緩 needs your reason first");
});
