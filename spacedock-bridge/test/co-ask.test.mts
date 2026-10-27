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
