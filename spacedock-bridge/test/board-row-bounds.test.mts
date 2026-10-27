import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("queue rows keep visible repository and number with icon-only sibling actions inside symmetric clipped bounds", async (t) => {
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
  reviews.push({ ...reviews[0], number: 3, repo: "other", title: "Unassigned proposal", url: "https://github.com/example/other/pull/3", firstSeenAt: 3 });
  const urls: string[] = [];
  const asks: string[] = [];
  const readReviews = async () => ({ requests: reviews, checkedAt: 1, error: null, nextCheckAt: null });
  const noWork = async () => ({ gates: [], tasks: {}, failedWorkflowDirs: [] });
  const navigation = { openExternalUrl: async (url: string) => { urls.push(url); } };
  function flatten(style: unknown): Record<string, unknown> {
    return Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : (style ?? {}) as Record<string, unknown>;
  }
  type Props = { children?: ReactNode; onPress?: (event: unknown) => void; accessibilityRole?: string; accessibilityLabel?: string; style?: unknown; accessible?: boolean; numberOfLines?: number };
  const element = ({ children, onPress, accessibilityRole, accessibilityLabel, style, accessible, numberOfLines }: Props) =>
    createElement("div", { role: accessibilityRole, "aria-label": accessibilityLabel, onClick: onPress, style: flatten(style), "data-accessible": accessible, "data-lines": numberOfLines }, children);
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
  await act(async () => root.render(createElement(Board, { theme: { colors: {} }, layout: { compact: true }, navigation, onAskCo: (text: string) => asks.push(text) })));
  function pair(rowLabel: string, linkLabel: string) {
    const row = container.querySelector<HTMLElement>(`[aria-label="${rowLabel}"]`)!;
    const link = container.querySelector<HTMLElement>(`[aria-label="${linkLabel}"]`)!;
    assert.ok(row, rowLabel);
    assert.ok(link, linkLabel);
    assert.equal(row.getAttribute("role"), "button");
    assert.equal(link.getAttribute("role"), "link");
    assert.equal(link.textContent, "↗", "repository references belong in the full accessible label, never the link layout");
    assert.equal(row.parentElement === link.parentElement, true, "screen readers need sibling row and link controls");
    assert.equal(row.getAttribute("data-accessible"), "true");
    assert.equal(link.getAttribute("data-accessible"), "true");
    assert.equal(row.querySelector("[role=button],[role=link]"), null, "an accessible row cannot swallow another action");
    let bounds = row.parentElement!;
    while (bounds && bounds.style.overflow !== "hidden") bounds = bounds.parentElement!;
    assert.ok(bounds);
    assert.equal(bounds.style.padding, "4px");
    assert.equal(bounds.style.borderRadius, "10px");
    const number = linkLabel.match(/#\d+/)![0];
    const ref = [...row.querySelectorAll<HTMLElement>("div")].find((e) => e.textContent === number);
    assert.ok(ref, "every review action must visibly retain its pull request number");
    assert.equal(ref.style.flexShrink, "0", "the number must never truncate");
    const repo = ref.previousElementSibling as HTMLElement;
    assert.ok(repo.textContent && !repo.textContent.includes("#"));
    assert.equal(repo.getAttribute("data-lines"), "1", "the repository truncates to one line");
    assert.equal(repo.style.flexShrink, "1");
    return { row, link };
  }
  for (const view of ["decision", "FO"]) {
    const tab = [...container.querySelectorAll<HTMLElement>("[role=tab]")].find((e) => e.textContent!.startsWith(`By ${view}`))!;
    await act(() => tab.click());
    for (const number of [2, 1]) {
      const label = view === "decision" && number === 1 ? "Open Review proposal 1 with Review owner FO" : `Review proposal ${number} — Review owner FO`;
      const { link } = pair(label, `Open bridge#${number} on GitHub`);
      await act(() => link.click());
      assert.equal(urls.at(-1), reviews[number - 1].url);
      assert.equal(container.querySelector("output"), null);
    }
    const { row, link } = pair(view === "decision" ? "Unassigned proposal — no FO" : "Ask comms officer about Unassigned proposal", "Open other#3 on GitHub");
    await act(() => link.click());
    assert.equal(urls.at(-1), reviews[2].url);
    assert.equal(asks.length, 0, "a GitHub link must not invoke the row's comms action");
    if (view === "FO") {
      await act(() => row.click());
      assert.match(asks[0], /Who should review example\/other#3/);
    }
  }
  const row = container.querySelector<HTMLElement>('[aria-label="Review proposal 2 — Review owner FO"]')!;
  await act(() => row.click());
  assert.equal(container.querySelector("output")!.textContent, "opened");
});
