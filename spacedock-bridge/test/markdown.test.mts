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


test("GitHub pipe tables parse headers, alignment and rows with inline formatting and escaped pipes", () => {
  const source = ["Before", "", "| Item | Decision |", "| :--- | ---: |", "| **CSV** | use `alpha\\|beta` |", "| next | line one<br>line two |", "", "After"].join("\n");
  const blocks = parseMarkdown(source);
  assert.deepEqual(blocks.map(b => b.kind), ["paragraph", "table", "paragraph"]);
  const table: any = blocks[1];
  assert.deepEqual(table.header, [[{ text: "Item" }], [{ text: "Decision" }]]);
  assert.deepEqual(table.align, ["left", "right"]);
  assert.deepEqual(table.rows[0], [[{ text: "CSV", bold: true }], [{ text: "use " }, { text: "alpha|beta", code: true }]]);
  assert.deepEqual(table.rows[1][1], [{ text: "line one\nline two" }]);
});

test("tables allow optional edge pipes and normalize missing or excess cells", () => {
  const blocks: any = parseMarkdown("One | Two\n--- | :---:\na | b | extra\nonly |\n\nDone");
  assert.equal(blocks[0].kind, "table");
  assert.deepEqual(blocks[0].align, ["left", "center"]);
  assert.deepEqual(blocks[0].rows, [[[ { text: "a" } ], [ { text: "b" } ]], [[{ text: "only" }], []]]);
  assert.equal(blocks[1].kind, "paragraph");
});

test("ordinary pipes, malformed separators and fenced pipe text stay unchanged", () => {
  for (const source of ["Choose alpha | beta, not a table.", "a | b\n-- wrong | ---", "a | b\n| --- |", "escaped \\| pipe\n---"]) {
    const blocks = parseMarkdown(source);
    assert.deepEqual(blocks, [{ kind: "paragraph", inline: parseInline(source.replace(/\n/g, " ")) }]);
  }
  assert.deepEqual(parseMarkdown("```\n| a | b |\n| --- | --- |\n```"), [{ kind: "code", text: "| a | b |\n| --- | --- |" }]);
});

test("table line breaks stay literal inside inline code", () => {
  const blocks: any = parseMarkdown("| Message (`<br>` means newline) |\n| --- |\n| a<br/>b |\n");
  assert.deepEqual(blocks[0].header[0], [{ text: "Message (" }, { text: "<br>", code: true }, { text: " means newline)" }]);
  assert.deepEqual(blocks[0].rows[0][0], [{ text: "a\nb" }]);
});
