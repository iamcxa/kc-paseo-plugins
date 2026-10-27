import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("message and reason share a shrinkable scroll area inside keyboard padding", async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  const stop = Object.assign(() => {}, { ready: Promise.resolve() });
  const handle = { timeline: { refetch: async () => ({ entries: [] }), subscribe: () => stop }, subscribe: () => () => {}, send: async () => {} };
  const paseo = { agents: { ref: () => handle } };
  const callStop = async () => ({ stopped: true });
  function flatten(style: unknown): Record<string, unknown> {
    return Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
  }
  type Props = { children?: ReactNode; onPress?: () => void; accessibilityLabel?: string; accessibilityRole?: string; style?: unknown; contentContainerStyle?: unknown; keyboardShouldPersistTaps?: string };
  const element = ({ children, onPress, accessibilityLabel, accessibilityRole, style }: Props) => createElement("div", { "aria-label": accessibilityLabel, role: accessibilityRole, onClick: onPress, style: flatten(style) }, children);
  const ScrollView = ({ children, style, contentContainerStyle, keyboardShouldPersistTaps }: Props) => createElement("div", { "data-scroll": true, "data-taps": keyboardShouldPersistTaps, style: flatten(style) }, createElement("div", { style: flatten(contentContainerStyle) }, children));
  const loader = Module as unknown as { _load(id: string, ...args: unknown[]): unknown };
  const original = loader._load;
  const restore = t.mock.method(loader, "_load", function (this: unknown, id: string, ...args: unknown[]) {
    if (id === "@getpaseo/plugin/client") return { usePaseo: () => paseo, useRpc: () => callStop };
    if (id === "@getpaseo/plugin/client/react-native") return { TextInput: element, Icon: () => null };
    if (id === "react-native") return { Text: element, View: element, ScrollView, Platform: { OS: "web" }, Keyboard: { metrics: () => ({ height: 280 }), addListener: () => ({ remove() {} }) } };
    if (id === "./feedback-pressable") return { FeedbackPressable: element };
    if (id === "./markdown-view") return { MarkdownView: () => null };
    return original.call(this, id, ...args);
  });
  const { CoChat } = createRequire(import.meta.url)("../client/co-chat");
  restore.mock.restore();
  await act(async () => root.render(createElement(CoChat, { theme: { colors: {} }, layout: { compact: true, platform: "ios" }, agentId: "scroll-proof", title: "Proof FO", chips: ["准", "要求修改", "先不要"], decisionTarget: "proof", onChip: async () => null })));
  await act(() => container.querySelector<HTMLElement>('[aria-label="Choose 要求修改"]')!.click());
  const message = container.querySelector<HTMLElement>('[aria-label="Message Proof FO"]')!;
  const reason = container.querySelector<HTMLElement>('[aria-label="Reason for 要求修改"]')!;
  const scroll = message.closest<HTMLElement>('[data-scroll]');
  assert.ok(scroll, "both composers must share a scroll area");
  assert.ok(scroll.contains(reason), "both composers must share a scroll area");
  assert.equal(scroll.style.flexShrink, "1");
  assert.equal(scroll.style.flexGrow, "0");
  assert.equal(scroll.style.minHeight, "0");
  assert.equal(scroll.getAttribute("data-taps"), "handled", "decision buttons must receive taps with keyboard open");
  assert.equal(scroll.parentElement!.style.paddingBottom, "280px");
  for (const label of ["Confirm 要求修改 via comms officer", "Cancel decision"]) {
    assert.ok(scroll.contains(container.querySelector(`[aria-label="${label}"]`)));
  }
});
