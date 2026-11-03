import Module, { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import { act, createElement, forwardRef, useImperativeHandle, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const flatten = (s: any): any => Array.isArray(s) ? Object.assign({}, ...s.map(flatten)) : s ?? {};
const element = forwardRef<any, any>((p, ref) => {
  useImperativeHandle(ref, () => ({ scrollToEnd() {}, scrollTo() {} }));
  return createElement("div", { role: p.accessibilityRole, "aria-label": p.accessibilityLabel, "aria-selected": p.accessibilityState?.selected, "data-lines": p.numberOfLines, style: flatten(p.style), onClick: p.disabled ? undefined : p.onPress }, p.children);
});
const input = (p: any) => createElement("textarea", { "aria-label": p.accessibilityLabel, value: p.value, onInput: (e: any) => p.onChangeText(e.target.value) });
let current: any;
let Bridge: any;
const calls = new Map<string, (...args: any[]) => any>();
export async function mountBridge(t: TestContext, compact = false) {
  const dom = new JSDOM("<!doctype html><div id='root'></div>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  const timers = new Map<number, { callback: () => void; ms: number }>();
  let serial = 0;
  t.mock.method(globalThis, "setInterval", (callback: () => void, ms: number) => { timers.set(++serial, { callback, ms }); return serial; });
  t.mock.method(globalThis, "clearInterval", (id: number) => timers.delete(id));
  const agents = ["a", "b"].map(id => ({ id, title: `${id.toUpperCase()} FO`, cwd: "/repo", status: "idle", updatedAt: "2026-11-03T10:00:00Z", labels: { role: "fo", repo: id, "workflow-dir": `/workflow-${id}` } }));
  agents.push({ ...agents[0], id: "idle", title: "Research FO", labels: { role: "fo", repo: "research", "workflow-dir": "" } });
  const records = new Map<string, any>();
  const claims = new Map<string, any>();
  const timeline = new Map<string, any[]>([["co", []], ["a", []], ["b", []]]);
  const failures = new Set<string>();
  const sent: { id: string; text: string }[] = [];
  const briefing = (slug: string) => ({ briefingId: `brief-${slug}`, digest: `digest-${slug}`, slug, stage: "validation", question: `Approve ${slug}?`, artifacts: [{ summary: `Summary ${slug}`, markdown: "Evidence" }] });
  let deferred: ((value: any) => void) | null = null;
  let hold = false;
  const rpc: any = {
    "coordinator.open": async () => ({ agentId: "co" }),
    "tasks.read": async () => ({ tasks: {}, failedWorkflowDirs: [] }),
    "gates.read": async () => ({ gates: agents.filter(a => a.id !== "idle").map(a => ({ ...briefing(a.id), title: `Approve ${a.id}?`, workflowDir: a.labels["workflow-dir"] })), failedWorkflowDirs: [] }),
    "reviews.read": async () => ({ requests: [], checkedAt: 1, nextCheckAt: null, error: null }),
    "gate.briefing": async ({ slug }: any) => { if (hold) { hold = false; return new Promise(resolve => { deferred = resolve; }); } return { briefing: briefing(slug), recorded: records.get(slug) ?? null, error: null }; },
    "decision.read": async ({ briefingId }: any) => ({ record: claims.get(briefingId) ?? null }),
    "decision.claim": async (record: any) => { const full = { ...record, at: Date.now() }; claims.set(record.briefingId, full); return { claimed: true, record: full }; },
    "decision.release": async () => ({}),
  };
  // RPC names are taken from the declarations so the fixture follows the host contract.
  const require = createRequire(import.meta.url);
  const { openCoordinator } = require("../../shared/coordinator");
  const { readDecision, claimDecision, releaseDecision } = require("../../shared/decisions");
  rpc[openCoordinator.name] = rpc["coordinator.open"];
  rpc[readDecision.name] = rpc["decision.read"];
  rpc[claimDecision.name] = rpc["decision.claim"];
  rpc[releaseDecision.name] = rpc["decision.release"];
  const listeners = new Map<string, Set<() => void>>();
  const paseo = { agents: {
    list: async () => ({ subscription: { subscribe: (h: any) => h.snapshot({ entries: agents.map(agent => ({ agent })) }), release() {} } }),
    ref: (id: string) => ({ status: "idle", subscribe: (fn: () => void) => { const set = listeners.get(id) ?? new Set(); set.add(fn); listeners.set(id, set); return () => set.delete(fn); }, send: async (text: string) => { sent.push({ id, text }); }, timeline: {
      refetch: async () => { if (failures.has(id)) throw new Error(`Cannot read ${id}`); return { entries: timeline.get(id) ?? [], agent: { status: "idle" } }; },
      subscribe: () => Object.assign(() => {}, { ready: Promise.resolve() }),
    } }),
  } };
  current = { paseo, rpc };
  if (!Bridge) {
    const loader = Module as any;
    const original = loader._load;
    const restore = t.mock.method(loader, "_load", function(this: unknown, id: string, ...args: unknown[]) {
      if (id === "@getpaseo/plugin/client") return { usePaseo: () => current.paseo, useRpc: (r: any) => { if (!calls.has(r.name)) calls.set(r.name, (...values) => current.rpc[r.name](...values)); return calls.get(r.name); }, openExternalUrl: () => {} };
      if (id === "@getpaseo/plugin/client/react-native") return { TextInput: input, Icon: () => null, Modal: Object.assign(() => null, { Content: element }) };
      if (id === "react-native") return { Text: element, View: element, ScrollView: element, Pressable: element, Platform: { OS: "web" }, Keyboard: {}, PanResponder: { create: () => ({ panHandlers: {} }) } };
      if (id === "./feedback-pressable") return { FeedbackPressable: element };
      if (id === "./markdown-view") return { MarkdownView: ({ source }: { source: string }) => createElement("span", null, source) };
      return original.call(this, id, ...args);
    });
    Bridge = require("../../client/bridge").Bridge;
    restore.mock.restore();
  }
  const visible = (e: Element) => { for (let node: Element | null = e; node; node = node.parentElement) if ((node as HTMLElement).style?.display === "none") return false; return true; };
  const find = (label: string) => [...container.querySelectorAll<HTMLElement>("[aria-label]")].find(e => e.getAttribute("aria-label") === label && visible(e));
  const click = async (label: string) => { const node = find(label); assert.ok(node, `visible control: ${label}`); await act(async () => node.click()); };
  const render = async () => { await act(async () => root.render(createElement(Bridge, { theme: { colors: {} }, layout: { compact, platform: "web" }, navigation: { openAgent() {} } }))); };
  const text = () => [...container.querySelectorAll<HTMLElement>("div,span")].filter(e => visible(e) && !e.children.length).map(e => e.textContent).join("\n");
  const type = async (label: string, value: string) => {
    const node = find(label) as HTMLTextAreaElement; assert.ok(node, label);
    await act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value")!.set!.call(node, value);
      node.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      node.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    });
  };
  const poll = async () => { await act(async () => { for (const timer of [...timers.values()]) if (timer.ms === 15_000) timer.callback(); }); };
  t.after(async () => { await act(() => root.unmount()); dom.window.close(); });
  await render();
  return { deferBriefing: () => { hold = true; return async () => { assert.ok(deferred); await act(async () => deferred!({ briefing: briefing("a"), recorded: null, error: null })); }; }, refresh: async (id: string) => { await act(async () => { for (const fn of listeners.get(id) ?? []) fn(); await new Promise(resolve => setTimeout(resolve, 200)); }); }, click, find, type, text, poll, render, rpc, records, claims, sent, failures, timeline, container, briefing };
}
