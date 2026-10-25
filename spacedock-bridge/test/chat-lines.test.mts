import assert from "node:assert/strict";
import { test } from "node:test";
import { toLines } from "../shared/chat-lines";

const entries = (items: { type: string; text?: string; name?: string }[]) => items.map((item, seqStart) => ({ item, seqStart }));

test("displayed replies join adjacent chunks but a visible tool separates them", () => {
  assert.deepEqual(toLines(entries([
    { type: "assistant_message", text: "first " },
    { type: "tool_call", name: "exec_command" },
    { type: "assistant_message", text: "last " },
    { type: "assistant_message", text: "chunk" },
  ])).at(-1), { key: "2", role: "assistant", text: "last chunk" });
});

test("hidden agent_message tools do not split a displayed reply; trailing visible tools do", () => {
  const items = entries([
    { type: "assistant_message", text: "first " },
    { type: "tool_call", name: "agent_message" },
    { type: "assistant_message", text: "last" },
  ]);
  assert.deepEqual(toLines(items).at(-1), { key: "0", role: "assistant", text: "first last" });
  assert.equal(toLines([...items, { seqStart: 3, item: { type: "tool_call", name: "exec_command" } }]).at(-1)?.role, "tools");
});
