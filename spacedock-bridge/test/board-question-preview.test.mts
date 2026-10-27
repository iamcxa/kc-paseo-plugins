import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("By FO shows the unread question preview when its FO has no next label", async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  const agent = { id: "question-fo", title: "Question FO", cwd: "/repo", status: "idle", updatedAt: "2026-10-27T00:00:00Z", requiresAttention: true, attentionReason: "finished", labels: { role: "fo", repo: "bridge" } };
  const paseo = { agents: {
    list: async () => ({ subscription: {
      subscribe: (handlers: { snapshot(value: unknown): void }) => handlers.snapshot({ entries: [{ agent }] }),
      release: () => {},
    } }),
    ref: () => ({ timeline: { refetch: async () => ({ entries: [{ item: { type: "assistant_message", text: "The two release windows are ready.\nNext: Choose the release window (you)" } }] }) } }),
  } };
  const readReviews = async () => ({ requests: [], checkedAt: Date.now(), error: null, nextCheckAt: null });
  const noWork = async () => ({ gates: [], tasks: {}, failedWorkflowDirs: [] });
  type ElementProps = { children?: ReactNode; onPress?: () => void; accessibilityRole?: string; accessibilityLabel?: string; disabled?: boolean };
  const element = ({ children, onPress, accessibilityRole, accessibilityLabel, disabled }: ElementProps) => createElement("div", { role: accessibilityRole, "aria-label": accessibilityLabel, onClick: disabled ? undefined : onPress }, children);
  const loader = Module as unknown as { _load(id: string, ...args: unknown[]): unknown };
  const originalLoad = loader._load;
  const restore = t.mock.method(loader, "_load", function (this: unknown, id: string, ...args: unknown[]) {
    if (id === "@getpaseo/plugin/client") return { usePaseo: () => paseo, useRpc: (rpc: { name: string }) => rpc.name === "reviews.read" ? readReviews : noWork };
    if (id === "react-native") return { Text: element, View: element, ScrollView: element, Platform: { OS: "web" } };
    if (id === "./feedback-pressable") return { FeedbackPressable: element };
    if (id === "./decision-card") return { DecisionCard: ({ fo }: { fo: { id: string } }) => createElement("output", null, fo.id) };
    return originalLoad.call(this, id, ...args);
  });
  const { Board } = createRequire(import.meta.url)("../client/board");
  restore.mock.restore();
  await act(async () => root.render(createElement(Board, { theme: { colors: {} }, layout: { compact: true }, navigation: {} })));
  const byFo = [...container.querySelectorAll("[role=tab]")].find((e) => e.textContent!.startsWith("By FO"))!;
  await act(async () => (byFo as HTMLElement).click());
  assert.match(container.textContent!, /Question FO\s*· 1 waiting/);
  assert.match(container.textContent!, /Choose the release window \(you\)/);
  assert.doesNotMatch(container.textContent!, /Has a question for you/);
  const question = container.querySelector('[aria-label="Choose the release window (you) — Question FO"]');
  assert.ok(question, "the separate question row must show its actual reply preview");
  await act(async () => (question as HTMLElement).click());
  assert.equal(container.querySelector("output")!.textContent, "question-fo");
});
