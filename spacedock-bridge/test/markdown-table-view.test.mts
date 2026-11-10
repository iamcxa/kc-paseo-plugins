import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

test("table cells retain inline formatting and switch from columns to wrapping labelled phone rows", async t => {
  const dom = new JSDOM("<div id='root'></div>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  const flatten = (style: any): any => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style ?? {};
  let layout: any;
  const element = (p: any) => {
    if (p.onLayout) layout = p.onLayout;
    return createElement("div", { "aria-label": p.accessibilityLabel, role: p.accessibilityRole, style: flatten(p.style) }, p.children);
  };
  const loader = Module as any, original = loader._load;
  const mock = t.mock.method(loader, "_load", function(this: unknown, id: string, ...args: unknown[]) {
    if (id === "react-native") return { Text: element, View: element, Platform: { OS: "web" } };
    return original.call(this, id, ...args);
  });
  const { MarkdownView } = createRequire(import.meta.url)("../client/markdown-view");
  mock.mock.restore();
  const container = document.getElementById("root")!, root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  const value = "x".repeat(180);
  await act(async () => root.render(createElement(MarkdownView, { theme: { colors: { foreground: "#eee", surface2: "#222", border: "#444" } }, source: `| **Item** | Message |\n| --- | --- |\n| CSV | exact \\| pipe and \`${value}\`<br>next line |` })));
  const table = container.querySelector<HTMLElement>('[aria-label="Markdown table"]');
  assert.ok(table, "a table must render instead of the raw pipe paragraph");
  assert.ok(table.textContent?.includes("exact | pipe"));
  assert.ok(!table.textContent?.includes("---"));
  assert.ok(!table.textContent?.includes("<br>"));
  assert.ok(table.textContent?.includes(value));
  assert.ok([...table.querySelectorAll<HTMLElement>("div")].some(e => e.textContent === value && e.style.fontFamily === "monospace"));
  assert.ok([...table.querySelectorAll<HTMLElement>("div")].some(e => e.textContent === "Item" && e.style.fontWeight === "600"));
  await act(async () => layout({ nativeEvent: { layout: { width: 320 } } }));
  assert.equal(table.children.length, 1, "phone rows replace the separate horizontal header");
  assert.equal((table.children[0] as HTMLElement).style.flexDirection, "column");
  assert.deepEqual([...table.querySelectorAll('[role="header"]')].map(e => e.textContent), ["Item", "Message"]);
  assert.ok([...table.querySelectorAll<HTMLElement>("div")].some(e => e.style.overflowWrap === "anywhere"));
  await act(async () => layout({ nativeEvent: { layout: { width: 1000 } } }));
  assert.equal(table.children.length, 2);
  assert.equal((table.children[1] as HTMLElement).style.flexDirection, "row");
});
