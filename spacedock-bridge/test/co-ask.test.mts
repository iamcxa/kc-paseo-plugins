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
