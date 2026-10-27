import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("failed board sources reuse guarded reads; FO rows count and open each waiting destination", async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  type Reply = { gates?: unknown[]; tasks?: object; failedWorkflowDirs: string[] };
  const pending = { gates: [] as { resolve(value: Reply): void; reject(error: Error): void; fresh?: boolean }[], tasks: [] as { resolve(value: Reply): void; reject(error: Error): void }[] };
  const callGates = (input: { fresh?: boolean }) => new Promise<Reply>((resolve, reject) => pending.gates.push({ resolve, reject, fresh: input.fresh }));
  const callTasks = () => new Promise<Reply>((resolve, reject) => pending.tasks.push({ resolve, reject }));
  const callReviews = async () => ({ requests: [], checkedAt: 1, error: "offline", nextCheckAt: Date.now() + 30_000 });
  const polls: (() => void)[] = [];
  t.mock.method(globalThis, "setInterval", (callback: () => void) => { polls.push(callback); return polls.length; });
  t.mock.method(globalThis, "clearInterval", () => {});
  let subscriptions = 0;
  let released = 0;
  const agent = { id: "fo", title: "Bridge FO", cwd: "/repo", status: "idle", updatedAt: "2026-10-27T00:00:00Z", labels: { role: "fo", "next-owner": "captain", next: "Choose the release window", task: "first", "workflow-dir": "/workflow" } };
  const paseo = { agents: { list: async () => {
    subscriptions++;
    if (subscriptions === 1) throw Error("offline");
    return { subscription: { subscribe: (handlers: { snapshot(value: unknown): void }) => handlers.snapshot({ entries: [{ agent }] }), release: () => { released++; } } };
  } } };
  type ElementProps = { children?: ReactNode; onPress?: () => void; accessibilityRole?: string; accessibilityLabel?: string; disabled?: boolean };
  const element = ({ children, onPress, accessibilityRole, accessibilityLabel, disabled }: ElementProps) => createElement("div", { role: accessibilityRole, "aria-label": accessibilityLabel, onClick: disabled ? undefined : onPress }, children);
  const loader = Module as unknown as { _load(id: string, ...args: unknown[]): unknown };
  const originalLoad = loader._load;
  const restore = t.mock.method(loader, "_load", function (this: unknown, id: string, ...args: unknown[]) {
    if (id === "@getpaseo/plugin/client") return { usePaseo: () => paseo, useRpc: (rpc: { name: string }) => ({ "gates.read": callGates, "tasks.read": callTasks, "reviews.read": callReviews })[rpc.name] };
    if (id === "react-native") return { Text: element, View: element, ScrollView: element, Platform: { OS: "web" } };
    if (id === "./feedback-pressable") return { FeedbackPressable: element };
    if (id === "./decision-card") return { DecisionCard: ({ gate, onBack }: { gate?: { slug: string }; onBack(): void }) => createElement("div", null, createElement("output", null, gate?.slug ?? "question"), createElement("button", { onClick: () => onBack() }, "Queue")) };
    return originalLoad.call(this, id, ...args);
  });
  const { Board } = createRequire(import.meta.url)("../client/board");
  restore.mock.restore();
  const click = async (label: string) => {
    const button = [...container.querySelectorAll("[role=button],[role=tab],button")].find((e) => e.getAttribute("aria-label") === label || e.textContent === label);
    assert.ok(button, label);
    await act(async () => (button as HTMLElement).click());
  };
  const render = async () => act(async () => root.render(createElement(Board, { theme: { colors: {} }, layout: { compact: true }, navigation: {}, coAsk: { text: "Choose the release window", since: null, onPress: () => {} } })));
  await render();
  await click("Check FOs again");
  assert.equal(subscriptions, 2);
  await act(async () => { pending.gates[0].reject(Error("offline")); pending.tasks[0].reject(Error("offline")); });
  assert.match(container.textContent!, /Next automatic review check:/);
  assert.doesNotMatch(container.textContent!, /Check again · reviews/);
  await click("Check gates again");
  assert.equal(pending.gates[1].fresh, true);
  assert.match(container.textContent!, /Checking gates/);
  await act(async () => pending.gates[1].resolve({ gates: [], failedWorkflowDirs: ["/workflow"] }));
  assert.match(container.textContent!, /Check again · gates/);
  await click("Check tasks again");
  assert.match(container.textContent!, /Reading tasks/);
  await act(async () => pending.tasks[1].resolve({ tasks: {}, failedWorkflowDirs: ["/workflow"] }));
  await click("Check gates again");
  await click("Check tasks again");
  // Existing interval reads supersede the two manual reads still in flight.
  await act(async () => { for (const poll of polls.slice(-3)) poll(); });
  const gates = ["first", "second", "third", "fourth"].map((slug) => ({ workflowDir: "/workflow", slug, title: `Approve ${slug} complete proposal`, stage: "validation" }));
  await act(async () => { pending.gates.at(-1)!.resolve({ gates, failedWorkflowDirs: [] }); pending.tasks.at(-1)!.resolve({ tasks: {}, failedWorkflowDirs: [] }); });
  await act(async () => { pending.gates[2].reject(Error("stale")); pending.tasks[2].reject(Error("stale")); });
  assert.doesNotMatch(container.textContent!, /Check again · gates|Check again · tasks/);
  await click([...container.querySelectorAll("[role=tab]")].find((e) => e.textContent!.startsWith("By FO"))!.textContent!);
  assert.match(container.textContent!, /5 waiting/);
  const destinationRows = [...container.querySelectorAll("[aria-label]")].filter((e) => e.getAttribute("aria-label")?.endsWith("— Bridge FO"));
  assert.equal(destinationRows.length, 5);
  assert.equal([...container.querySelectorAll("[role=button]")].filter((e) => e.textContent!.includes("Choose the release window")).length, 2, "identical text from comms and FO remains separately attributed");
  for (const slug of ["first", "second", "third", "fourth"]) {
    await click(`Approve ${slug} complete proposal — Bridge FO`);
    assert.equal(container.querySelector("output")!.textContent, slug);
    await click("Queue");
  }
  await click("Choose the release window — Bridge FO");
  assert.equal(container.querySelector("output")!.textContent, "question");
  await click("Queue");
  assert.ok(container.textContent!.includes("unknown"));
  await act(() => root.unmount());
  assert.equal(released, 1);
});
