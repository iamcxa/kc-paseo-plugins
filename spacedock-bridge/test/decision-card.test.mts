import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

test("polling a newer open briefing ignores the older briefing's resolution", async (t) => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  const briefing = (briefingId: string) => ({ briefingId, slug: "task", stage: "validation", digest: "digest", question: briefingId, artifacts: [] });
  const record = { decision: "approved", reason: "decision accepted", at: "2026-10-25" };
  const answers = [
    { briefing: briefing("first"), recorded: null, error: null },
    { briefing: briefing("second"), recorded: record, error: null },
    { briefing: briefing("second"), recorded: record, error: null },
    { briefing: null, recorded: record, error: null },
  ];
  const requested: (string | undefined)[] = [];
  const callBriefing = async (input: { briefingId?: string }) => { requested.push(input.briefingId); return answers.shift()!; };
  const callRead = async () => ({ record: { foId: "fo", decisionId: "decision", words: "accepted", decision: "approved", at: Date.now() } });
  const intervals = new Map<number, () => void>();
  let timerId = 0;
  t.mock.method(globalThis, "setInterval", (callback: () => void, delay: number) => { const id = ++timerId; if (delay === 15_000) intervals.set(id, callback); return id; });
  t.mock.method(globalThis, "clearInterval", (id: number) => { intervals.delete(id); });
  const element = ({ children }: { children?: ReactNode }) => createElement("div", null, children);
  const Modal = Object.assign(() => null, { Content: element });
  const loader = Module as unknown as { _load(id: string, ...args: unknown[]): unknown };
  const originalLoad = loader._load;
  const restore = t.mock.method(loader, "_load", function (this: unknown, id: string, ...args: unknown[]) {
    if (id === "@getpaseo/plugin/client") return {
      useRpc: (rpc: { name: string }) => rpc.name === "gate.briefing" ? callBriefing : callRead,
      usePaseo: () => ({ agents: { ref: () => ({ timeline: { refetch: async () => ({ entries: [] }) } }) } }),
    };
    if (id === "@getpaseo/plugin/client/react-native") return { Modal };
    if (id === "react-native") return { Text: element, View: element, ScrollView: element, Pressable: element, Keyboard: {}, PanResponder: { create: () => ({ panHandlers: {} }) } };
    if (id === "./co-chat") return { CoChat: (props: { chips?: string[]; placeholder: string }) => createElement("output", null, `${props.chips?.join(",") ?? "no decisions"}|${props.placeholder}`) };
    return originalLoad.call(this, id, ...args);
  });
  const { DecisionCard } = createRequire(import.meta.url)("../client/decision-card");
  restore.mock.restore();
  const props = {
    theme: { colors: {} }, layout: { platform: "web", compact: false }, navigation: {},
    fo: { id: "fo", title: "FO", workflowDir: "/workflow", repo: "repo", lastActivityAt: new Date().toISOString() },
    gate: { slug: "task", stage: "validation", title: "Task" }, onBack: () => {},
  };
  await act(async () => { root.render(createElement(DecisionCard, props)); });
  const poll = async () => { const callback = [...intervals.values()][0]; assert.ok(callback, "an unresolved briefing keeps polling"); await act(async () => callback()); };
  assert.match(container.querySelector("output")!.textContent!, /add a reason/);
  await poll();
  assert.match(container.textContent!, /second/);
  assert.match(container.querySelector("output")!.textContent!, /add a reason/);
  assert.doesNotMatch(container.textContent!, /Recorded: approved/);
  await poll();
  assert.equal(container.querySelector("output")!.textContent, "no decisions|Message FO directly");
  assert.match(container.textContent!, /Recorded: approved/);
  assert.deepEqual(requested, [undefined, "first", "second"]);
  await act(async () => { root.render(createElement(DecisionCard, { ...props, key: "reopened" })); });
  assert.match(container.textContent!, /Recorded: approved/);
  assert.equal(container.querySelector("output")!.textContent, "no decisions|Message FO directly");
});
