import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { createRequire } from "node:module";
import type { PaseoApi, PaseoAgentTimelineEvent } from "@getpaseo/client";
import { useCoAsk } from "../client/use-co-ask";

const { PaseoApiProvider } = createRequire(import.meta.url)("@getpaseo/plugin/client/host") as typeof import("@getpaseo/plugin/client/host");

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("a reconnect detects the last displayed Captain question after earlier FO work", { timeout: 3000 }, async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  let status = "running";
  let completedOffline = false;
  let event!: (value: PaseoAgentTimelineEvent) => void;
  let refreshed!: () => void;
  const reconnectRead = new Promise<void>((resolve) => { refreshed = resolve; });
  const handle = {
    get status() { return status; },
    subscribe: () => () => {},
    timeline: {
      subscribe: (listener: typeof event) => {
        event = listener;
        return Object.assign(() => {}, { ready: Promise.resolve() });
      },
      refetch: async () => {
        status = completedOffline ? "idle" : "running";
        const page = {
          agent: { status },
          entries: completedOffline ? [
            { seqStart: 1, item: { type: "assistant_message", text: "Next: Run the checks (me)\n" } },
            { seqStart: 2, item: { type: "tool_call", name: "exec_command" } },
            { seqStart: 3, item: { type: "assistant_message", text: "Next: Choose the theme (you)" } },
          ] : [],
        };
        if (completedOffline) refreshed();
        return page;
      },
    },
  };
  const paseo = { agents: { ref: () => handle } } as unknown as PaseoApi;
  function Question() {
    const { ask, state } = useCoAsk("co");
    return createElement("output", null, `${state}: ${ask ?? "none"}`);
  }
  await act(async () => { root.render(createElement(PaseoApiProvider, { paseo, children: createElement(Question) })); });
  assert.equal(container.textContent, "loaded: none");
  completedOffline = true;
  await act(async () => {
    event({ agentId: "co", subscriptionId: "restored", event: { type: "subscription_restored" } });
    await reconnectRead;
  });
  assert.equal(container.textContent, "loaded: Choose the theme (you)");
});


test("manual comms reads retain timestamp, expose pending/failure and drop stale overlapping responses", async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  type Page = { entries: { seqStart: number; timestamp?: string; item: { type: string; text: string } }[] };
  const reads: { resolve(page: Page): void; reject(error: Error): void }[] = [];
  const scheduled: (() => void)[] = [];
  t.mock.method(globalThis, "setTimeout", (fn: () => void) => { scheduled.push(fn); return 1; });
  t.mock.method(globalThis, "clearTimeout", () => {});
  let event!: (value: PaseoAgentTimelineEvent) => void;
  let retry!: () => void;
  const handle = { status: "idle", subscribe: () => () => {}, timeline: {
    refetch: () => new Promise<Page>((resolve, reject) => reads.push({ resolve, reject })),
    subscribe: (fn: typeof event) => { event = fn; return Object.assign(() => {}, { ready: Promise.resolve() }); },
  } };
  const paseo = { agents: { ref: () => handle } } as unknown as PaseoApi;
  function Question() {
    const result = useCoAsk("co"); retry = result.retry;
    return createElement("output", null, `${result.state}|${result.ask}|${result.since}`);
  }
  const page = (timestamp?: string): Page => ({ entries: [{ seqStart: 2, timestamp, item: { type: "assistant_message", text: "Next: Choose release (you)" } }] });
  await act(async () => root.render(createElement(PaseoApiProvider, { paseo, children: createElement(Question) })));
  await act(async () => reads[0].reject(Error("offline")));
  assert.match(container.textContent!, /^failed/);
  await act(async () => retry());
  assert.match(container.textContent!, /^loading/);
  await act(async () => reads[1].reject(Error("still offline")));
  assert.match(container.textContent!, /^failed/);
  await act(async () => retry());
  await act(async () => reads[2].resolve(page("2026-10-27T00:00:00Z")));
  assert.match(container.textContent!, /^loaded\|Choose release \(you\)\|2026-10-27T00:00:00Z$/);
  await act(async () => {
    event({ agentId: "co", subscriptionId: "fixture", event: { type: "subscription_restored" } });
    scheduled.pop()!();
  });
  await act(async () => retry());
  await act(async () => reads[4].resolve(page()));
  assert.equal(container.textContent, "loaded|Choose release (you)|null");
  await act(async () => reads[3].reject(Error("stale")));
  assert.equal(container.textContent, "loaded|Choose release (you)|null");
});

test("Check again restores an errored subscription and waits for live readiness plus history before later questions appear", async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
  };
  type Page = { entries: { seqStart: number; item: { type: string; text: string } }[] };
  const reads: ReturnType<typeof deferred<Page>>[] = [];
  const subscriptions: { listener(value: PaseoAgentTimelineEvent): void; ready: ReturnType<typeof deferred<void>>; active: boolean }[] = [];
  const timers = new Map<number, () => void>();
  let timerId = 0;
  t.mock.method(globalThis, "setTimeout", (fn: () => void) => { timers.set(++timerId, fn); return timerId; });
  t.mock.method(globalThis, "clearTimeout", (id: number) => { timers.delete(id); });
  let handleChanged!: () => void;
  const handle = { status: "idle", subscribe: (fn: () => void) => { handleChanged = fn; return () => {}; }, timeline: {
    refetch: () => { const read = deferred<Page>(); reads.push(read); return read.promise; },
    subscribe: (listener: (value: PaseoAgentTimelineEvent) => void) => {
      const record = { listener, ready: deferred<void>(), active: true };
      subscriptions.push(record);
      return Object.assign(() => { record.active = false; }, { ready: record.ready.promise });
    },
  } };
  const emit = (index: number, type: "error" | "turn_completed") => {
    const subscription = subscriptions[index];
    if (!subscription?.active) return;
    if (type === "error") subscription.active = false;
    subscription.listener({ agentId: "co", subscriptionId: String(index), event: { type } } as PaseoAgentTimelineEvent);
  };
  const flush = () => { const pending = [...timers.values()]; timers.clear(); pending.forEach((fn) => fn()); };
  const page = (text = ""): Page => ({ entries: text ? [{ seqStart: 1, item: { type: "assistant_message", text } }] : [] });
  const paseo = { agents: { ref: () => handle } } as unknown as PaseoApi;
  function Question() {
    const { ask, state, retry } = useCoAsk("co");
    return createElement("div", null, createElement("output", null, `${state}: ${ask ?? "none"}`), createElement("button", { onClick: retry }, "Check again"));
  }
  const retry = async () => act(async () => container.querySelector("button")!.click());
  t.after(async () => { await act(() => root.unmount()); assert.equal(subscriptions.filter((sub) => sub.active).length, 0); dom.window.close(); });
  await act(async () => root.render(createElement(PaseoApiProvider, { paseo, children: createElement(Question) })));
  await act(async () => { reads[0].resolve(page()); subscriptions[0].ready.resolve(); });
  assert.equal(container.querySelector("output")!.textContent, "loaded: none");
  await act(async () => emit(0, "error"));
  assert.equal(container.querySelector("output")!.textContent, "failed: none");
  await retry();
  await act(async () => reads[1].resolve(page()));
  assert.equal(container.querySelector("output")!.textContent, "loading: none", "history alone cannot prove live updates are connected");
  await act(async () => subscriptions[1].ready.resolve());
  assert.equal(container.querySelector("output")!.textContent, "loaded: none");
  await act(async () => { emit(1, "turn_completed"); flush(); });
  await act(async () => reads[2].resolve(page("Next: Choose the later release window (you)")));
  assert.equal(container.querySelector("output")!.textContent, "loaded: Choose the later release window (you)");
  await act(async () => emit(1, "error"));
  await act(async () => { handleChanged(); flush(); });
  assert.equal(container.querySelector("output")!.textContent, "failed: none");
  assert.equal(subscriptions.length, 2, "handle changes must not resubscribe automatically");
  assert.equal(reads.length, 3, "a disconnected source must not become healthy through an automatic history read");
  await retry();
  await act(async () => subscriptions[2].ready.reject(Error("still disconnected")));
  await act(async () => reads[3].resolve(page()));
  assert.equal(container.querySelector("output")!.textContent, "failed: none");
  await retry();
  await act(async () => subscriptions[3].ready.resolve());
  assert.equal(container.querySelector("output")!.textContent, "loading: none", "subscription alone cannot replace history");
  await act(async () => reads[4].resolve(page("Next: Choose the final release window (you)")));
  assert.equal(container.querySelector("output")!.textContent, "loaded: Choose the final release window (you)");
});
