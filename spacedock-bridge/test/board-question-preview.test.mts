import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("By FO keeps each unread question visible exactly once across waiting-item combinations", async (t) => {
  const preview = "Choose the release window (you)";
  const different = "Choose the rollback plan (you)";
  const cases = [
    { name: "unlabelled alone", gate: false, review: false, next: "", count: 1 },
    { name: "unlabelled with gate", gate: true, review: false, next: "", count: 2 },
    { name: "unlabelled with review", gate: false, review: true, next: "", count: 2 },
    { name: "label represents the same reply", gate: false, review: false, next: preview, count: 1 },
    { name: "different labelled question", gate: false, review: false, next: different, count: 2 },
    { name: "unlabelled with gate and review", gate: true, review: true, next: "", count: 3 },
    { name: "same reply label with gate", gate: true, review: false, next: preview, count: 2 },
    { name: "different label with gate", gate: true, review: false, next: different, count: 3 },
    { name: "same reply label with review", gate: false, review: true, next: preview, count: 2 },
    { name: "different label with review", gate: false, review: true, next: different, count: 3 },
    { name: "same reply label with gate and review", gate: true, review: true, next: preview, count: 3 },
    { name: "different label with gate and review", gate: true, review: true, next: different, count: 4 },
  ];
  let scenario = cases[0];
  const paseo = { agents: {
    list: async () => ({ subscription: {
      subscribe: (handlers: { snapshot(value: unknown): void }) => handlers.snapshot({ entries: [{ agent: {
        id: "question-fo", title: "Question FO", cwd: "/repo", status: "idle", updatedAt: "2026-10-27T00:00:00Z", requiresAttention: true, attentionReason: "finished",
        labels: { role: "fo", repo: "bridge", task: "gate-task", "workflow-dir": "/workflow", ...(scenario.next ? { next: scenario.next } : {}) },
      } }] }),
      release: () => {},
    } }),
    ref: () => ({ timeline: { refetch: async () => ({ entries: [{ item: { type: "assistant_message", text: "The two release windows are ready.\nNext: Choose the release window (you)" } }] }) } }),
  } };
  const readReviews = async () => ({ requests: scenario.review ? [{ url: "https://github.com/example/bridge/pull/12", owner: "example", repo: "bridge", number: 12, title: "Review the adapter", author: "fixture", firstSeenAt: Date.now() }] : [], checkedAt: Date.now(), error: null, nextCheckAt: null });
  const readGates = async () => ({ gates: scenario.gate ? [{ workflowDir: "/workflow", slug: "gate-task", title: "Approve the adapter", stage: "validation" }] : [], failedWorkflowDirs: [] });
  const readTasks = async () => ({ tasks: {}, failedWorkflowDirs: [] });
  type ElementProps = { children?: ReactNode; onPress?: () => void; accessibilityRole?: string; accessibilityLabel?: string; disabled?: boolean };
  const element = ({ children, onPress, accessibilityRole, accessibilityLabel, disabled }: ElementProps) => createElement("div", { role: accessibilityRole, "aria-label": accessibilityLabel, onClick: disabled ? undefined : onPress }, children);
  const loader = Module as unknown as { _load(id: string, ...args: unknown[]): unknown };
  const originalLoad = loader._load;
  const restore = t.mock.method(loader, "_load", function (this: unknown, id: string, ...args: unknown[]) {
    if (id === "@getpaseo/plugin/client") return { usePaseo: () => paseo, useRpc: (rpc: { name: string }) => ({ "reviews.read": readReviews, "gates.read": readGates, "tasks.read": readTasks })[rpc.name] };
    if (id === "react-native") return { Text: element, View: element, ScrollView: element, Platform: { OS: "web" } };
    if (id === "./feedback-pressable") return { FeedbackPressable: element };
    if (id === "./decision-card") return { DecisionCard: ({ fo, gate }: { fo: { id: string }; gate?: { slug: string } }) => createElement("output", null, `${fo.id}|${gate?.slug ?? "question"}`) };
    return originalLoad.call(this, id, ...args);
  });
  const { Board } = createRequire(import.meta.url)("../client/board");
  restore.mock.restore();
  for (const item of cases) await t.test(item.name, async (caseTest) => {
    scenario = item;
    const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
    Object.assign(globalThis, { window: dom.window, document: dom.window.document });
    const container = dom.window.document.getElementById("root")!;
    const root = createRoot(container);
    caseTest.after(async () => { await act(() => root.unmount()); dom.window.close(); });
    await act(async () => root.render(createElement(Board, { theme: { colors: {} }, layout: { compact: true }, navigation: {} })));
    const byFo = [...container.querySelectorAll("[role=tab]")].find((e) => e.textContent!.startsWith("By FO"))!;
    await act(async () => (byFo as HTMLElement).click());
    assert.equal([...container.querySelectorAll("div")].filter((e) => e.childElementCount === 0 && e.textContent === preview).length, 1, "show the actual unread question exactly once");
    assert.doesNotMatch(container.textContent!, /Has a question for you/);
    assert.match(container.textContent!, new RegExp(`Question FO\\s*· ${item.count} waiting`));
    assert.equal(container.querySelectorAll('[aria-label$="— Question FO"]').length, item.count, "waiting count equals displayed item rows");
    if (item.gate) assert.ok(container.querySelector('[aria-label="Approve the adapter — Question FO"]'));
    if (item.review) assert.ok(container.querySelector('[aria-label="Review the adapter — Question FO"]'));
    if (item.next === different) assert.ok(container.querySelector('[aria-label="Choose the rollback plan (you) — Question FO"]'));
    const question = container.querySelector('[aria-label="Choose the release window (you) — Question FO"]');
    assert.ok(question, "the unread question keeps its own destination");
    await act(async () => (question as HTMLElement).click());
    assert.equal(container.querySelector("output")!.textContent, "question-fo|question");
  });
});
