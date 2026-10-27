import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("By FO keeps an idle review owner and its waiting count visible while idle rows are collapsed", async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  const agents = [
    { id: "owner", title: "Review owner FO", cwd: "/repo", status: "idle", updatedAt: "2026-10-27T00:00:00Z", labels: { role: "fo", repo: "bridge" } },
    { id: "idle", title: "Unoccupied FO", cwd: "/other", status: "idle", updatedAt: "2026-10-27T00:00:00Z", labels: { role: "fo", repo: "other" } },
  ];
  const paseo = { agents: { list: async () => ({ subscription: {
    subscribe: (handlers: { snapshot(value: unknown): void }) => handlers.snapshot({ entries: agents.map((agent) => ({ agent })) }),
    release: () => {},
  } }) } };
  const readReviews = async () => ({ requests: [{
    url: "https://github.com/example/bridge/pull/12", owner: "example", repo: "bridge", number: 12,
    title: "Review the pending adapter", author: "fixture", firstSeenAt: Date.now(),
  }], checkedAt: Date.now(), error: null, nextCheckAt: null });
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
  assert.match(container.textContent!, /Waiting on you · 1/);
  assert.match(container.textContent!, /Review owner FO\s*· 1 waiting/);
  const review = container.querySelector('[aria-label="Review the pending adapter — Review owner FO"]');
  assert.ok(review, "the assigned review must be reachable before expanding idle rows");
  assert.doesNotMatch(container.textContent!, /Unoccupied FO/);
  const idle = [...container.querySelectorAll("[role=button]")].find((e) => e.textContent!.startsWith("Idle · 1"))!;
  assert.ok(idle, "the unrelated idle FO keeps its collapsed group");
  await act(async () => (idle as HTMLElement).click());
  assert.match(container.textContent!, /Unoccupied FO/);
  assert.equal(container.querySelectorAll('[aria-label="Review the pending adapter — Review owner FO"]').length, 1);
  await act(async () => (review as HTMLElement).click());
  assert.equal(container.querySelector("output")!.textContent, "owner");
});
