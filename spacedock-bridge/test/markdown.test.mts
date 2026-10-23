import assert from "node:assert/strict";
import { test } from "node:test";
import { isSendKey, isStatusBlock, parseInline, parseMarkdown } from "../shared/markdown";

test("bold and inline code are split out of a line", () => {
  assert.deepEqual(parseInline("**要你決定：** 跑 `rr decision` 嗎"), [
    { text: "要你決定：", bold: true },
    { text: " 跑 " },
    { text: "rr decision", code: true },
    { text: " 嗎" },
  ]);
});

test("a reply becomes paragraphs, list items and a fenced status block", () => {
  const blocks = parseMarkdown(
    ["FO 還沒開成。", "", "- 第一點", "1. 第二點", "", "```", "剩餘:   開 FO", "可收線: 否", "```"].join("\n"),
  );
  assert.deepEqual(
    blocks.map((b) => b.kind),
    ["paragraph", "item", "item", "code"],
  );
  assert.equal(blocks[3].kind === "code" && blocks[3].text, "剩餘:   開 FO\n可收線: 否");
  assert.equal(blocks[1].kind === "item" && blocks[1].marker, "•");
});

test("a status block is recognised by its Remaining or 剩餘 line", () => {
  assert.equal(isStatusBlock("剩餘:   開 FO\n下一步: 給路徑（你）\n可收線: 否"), true);
  assert.equal(isStatusBlock("Remaining: one gate\nNext: merge (you)"), true);
  assert.equal(isStatusBlock("npm run test"), false);
});

test("quoted lines become one quote block that keeps its line breaks", () => {
  const blocks = parseMarkdown(["> first line", "> - second", "after"].join("\n"));
  assert.deepEqual(blocks.map((b) => b.kind), ["quote", "paragraph"]);
  assert.equal(blocks[0].kind === "quote" && blocks[0].text, "first line\n- second");
});

test("Enter sends, but not while an input method is composing or with Shift", () => {
  assert.equal(isSendKey({ key: "Enter" }), true);
  assert.equal(isSendKey({ key: "Enter", shiftKey: true }), false);
  assert.equal(isSendKey({ key: "Enter", isComposing: true }), false);
  assert.equal(isSendKey({ key: "Process", keyCode: 229 }), false);
  assert.equal(isSendKey({ key: "a" }), false);
});
