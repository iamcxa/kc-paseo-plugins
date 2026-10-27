import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("queue highlights have their own symmetric clipped bounds and links keep their action", async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  const agent = { id: "owner", title: "Review owner FO", cwd: "/repo", status: "idle", updatedAt: "2026-10-27T00:00:00Z", labels: { role: "fo", repo: "bridge" } };
  const paseo = { agents: { list: async () => ({ subscription: {
    subscribe: (handlers: { snapshot(value: unknown): void }) => handlers.snapshot({ entries: [{ agent }] }),
    release() {},
  } }) } };
  const reviews = [1, 2].map((number) => ({
    url: `https://github.com/example/bridge/pull/${number}`, owner: "example", repo: "bridge", number,
    title: `Review proposal ${number}`, author: "fixture", firstSeenAt: number,
  }));
  const urls: string[] = [];
  const readReviews = async () => ({ requests: reviews, checkedAt: 1, error: null, nextCheckAt: null });
  const noWork = async () => ({ gates: [], tasks: {}, failedWorkflowDirs: [] });
  const navigation = { openExternalUrl: async (url: string) => { urls.push(url); } };
  function flatten(style: unknown): Record<string, unknown> {
    return Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
  }
  type Props = { children?: ReactNode; onPress?: (event: unknown) => void; accessibilityRole?: string; accessibilityLabel?: string; style?: unknown };
  const element = ({ children, onPress, accessibilityRole, accessibilityLabel, style }: Props) =>
    createElement("div", { role: accessibilityRole, "aria-label": accessibilityLabel, onClick: onPress, style: flatten(style) }, children);
  const loader = Module as unknown as { _load(id: string, ...args: unknown[]): unknown };
  const original = loader._load;
  const restore = t.mock.method(loader, "_load", function (this: unknown, id: string, ...args: unknown[]) {
    if (id === "@getpaseo/plugin/client") return {
      usePaseo: () => paseo,
      openExternalUrl: navigation.openExternalUrl,
      useRpc: (rpc: { name: string }) => rpc.name === "reviews.read" ? readReviews : noWork,
    };
    if (id === "react-native") return { Text: element, View: element, ScrollView: element, Platform: { OS: "web" } };
    if (id === "./feedback-pressable") return { FeedbackPressable: element };
    if (id === "./decision-card") return { DecisionCard: () => createElement("output", null, "opened") };
    return original.call(this, id, ...args);
  });
  const { Board } = createRequire(import.meta.url)("../client/board");
  restore.mock.restore();
  await act(async () => root.render(createElement(Board, { theme: { colors: {} }, layout: { compact: true }, navigation })));
  for (const view of ["decision", "FO"]) {
    const tab = [...container.querySelectorAll<HTMLElement>("[role=tab]")].find((e) => e.textContent!.startsWith(`By ${view}`))!;
    await act(() => tab.click());
    const row = container.querySelector<HTMLElement>('[aria-label="Review proposal 2 — Review owner FO"]')!;
    assert.ok(row);
    const bounds = row.parentElement!;
    assert.equal(bounds.style.padding, "4px");
    assert.equal(bounds.style.overflow, "hidden");
    assert.equal(bounds.style.borderRadius, "10px");
    const link = row.querySelector<HTMLElement>('[aria-label="Open bridge#2 on GitHub"]')!;
    assert.ok(link, "the separate GitHub action remains inside the row's feedback bounds");
    await act(() => link.click());
    assert.deepEqual(urls, Array(view === "decision" ? 1 : 2).fill(reviews[1].url));
    assert.equal(container.querySelector("output"), null, "the link must not open the decision card");
  }
  const row = container.querySelector<HTMLElement>('[aria-label="Review proposal 2 — Review owner FO"]')!;
  await act(() => row.click());
  assert.equal(container.querySelector("output")!.textContent, "opened");
});
