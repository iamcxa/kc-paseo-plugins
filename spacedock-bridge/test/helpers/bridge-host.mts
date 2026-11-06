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
  if (p.accessibilityLabel && (p.onLayout || p.onContentSizeChange)) current.measurements.set(p.accessibilityLabel, p);
  return createElement("div", { role: p.accessibilityRole, "aria-label": p.accessibilityLabel, "aria-selected": p.accessibilityState?.selected, "data-lines": p.numberOfLines, style: flatten(p.style), onClick: p.disabled ? undefined : p.onPress }, p.children);
});
const input = forwardRef<any, any>((p, ref) => createElement("textarea", { ref, "aria-label": p.accessibilityLabel, value: p.value, onInput: (e: any) => p.onChangeText(e.target.value) }));
let current: any;
let Bridge: any;
let BoardItem: any;
let Board: any;
const calls = new Map<string, (...args: any[]) => any>();
export async function mountBridge(t: TestContext, compact = false, prepare?: (rpc: any) => void, sidebar = false, colors: Record<string, string> = {}, showModals = false, identity = true, sdk?: any, surface: "bridge" | "fleet" = "bridge") {
  const dom = new JSDOM("<!doctype html><div id='root'></div>");
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  Object.assign(dom.window.HTMLElement.prototype, { attachEvent() {}, detachEvent() {} });
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
  const statuses = new Map<string, string>();
  const timeline = new Map<string, any[]>([["co", []], ["a", []], ["b", []]]);
  const failures = new Set<string>();
  const readFailures = new Set<string>();
  const subscriptionFailures = new Set<string>();
  const timelineListeners = new Map<string, Set<(event: any) => void>>();
  const sent: { id: string; text: string }[] = [];
  const sendOverrides = new Map<string, (text: string) => Promise<void>>();
  const attempts = new Map<string, { stage: string; briefingId: string; title: string }>();
  const briefing = (slug: string) => ({ briefingId: `brief-${slug}`, digest: `digest-${slug}`, slug, stage: "validation", question: `Approve ${slug}?`, artifacts: [{ summary: `Summary ${slug}`, markdown: "Evidence" }], ...attempts.get(slug) });
  let deferred: ((value: any) => void) | null = null;
  let hold = false;
  const rpc: any = {
    "coordinator.open": async () => ({ agentId: "co" }),
    "chief.read": async () => ({ agentId:"co",total:"2",phase:"quiet",batch:null,focus:null,entered:false,soundAttempted:true,error:null }),
    "chief.mark": async () => ({accepted:true}),
    "tasks.read": async () => ({ tasks: {}, failedWorkflowDirs: [] }),
    "gates.read": async () => ({ gates: agents.filter(a => a.id !== "idle").map(a => ({ ...briefing(a.id), title: attempts.get(a.id)?.title ?? `Approve ${a.id}?`, workflowDir: a.labels["workflow-dir"] })), failedWorkflowDirs: [] }),
    "reviews.read": async () => ({ requests: [], checkedAt: 1, nextCheckAt: null, error: null }),
    "gate.briefing": async ({ slug, stage, briefingId }: any) => { if (hold) { hold = false; return new Promise(resolve => { deferred = resolve; }); } return { briefing: briefing(slug).stage === stage ? briefing(slug) : null, recorded: records.get(briefingId) ?? records.get(slug) ?? null, error: null }; },
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
  const snapshots = new Set<(value: any) => void>();
  const reads: { id: string; projection: string }[] = [];
  const readOverrides = new Map<string, (options?: any) => Promise<any>>();
  const coordinator = { id: "co", title: "Chief of staff", labels: { role: "comms-officer" } };
  const agentList = (filter: any) => filter?.labels?.role === "comms-officer" ? [coordinator] : agents;
  const paseo = { agents: {
    list: async ({ filter }: any = {}) => ({ subscription: { subscribe: (h: any) => { const publish = () => h.snapshot({ entries: agentList(filter).map(agent => ({ agent })) }); snapshots.add(publish); publish(); }, release() {} } }),
    ref: (id: string) => ({ get status() { return statuses.get(id) ?? "idle"; }, subscribe: (fn: () => void) => { const set = listeners.get(id) ?? new Set(); set.add(fn); listeners.set(id, set); return () => set.delete(fn); }, send: async (text: string) => { sent.push({ id, text }); await sendOverrides.get(id)?.(text); }, timeline: {
      refetch: async (options: any) => { const { projection } = options; reads.push({ id, projection }); const override = readOverrides.get(`${id}:${projection}`); if (override) return override(options); if (failures.has(id) || readFailures.has(`${id}:${projection}`)) throw new Error(`Cannot read ${id}`); return { agentId: id, epoch: "epoch", projection, reset: false, gap: false, staleCursor: false, error: null, entries: (timeline.get(id) ?? []).map((e, i) => ({ seqStart: e.seqStart ?? i + 1, seqEnd: e.seqEnd ?? e.seqStart ?? i + 1, sourceSeqRanges: [{ startSeq: e.seqStart ?? i + 1, endSeq: e.seqEnd ?? e.seqStart ?? i + 1 }], collapsed: [], ...e })), agent: { status: "idle" } }; },
      subscribe: (fn: (event: any) => void) => { const set = timelineListeners.get(id) ?? new Set(); set.add(fn); timelineListeners.set(id, set); return Object.assign(() => set.delete(fn), { ready: subscriptionFailures.has(id) ? Promise.reject(new Error(`Subscription failed ${id}`)) : Promise.resolve() }); },
    } }),
  } };
  prepare?.(rpc);
  const measurements = new Map<string, any>();
  current = { paseo: sdk ?? paseo, rpc, measurements, showModals };
  if (!Bridge) {
    const loader = Module as any;
    const original = loader._load;
    const restore = t.mock.method(loader, "_load", function(this: unknown, id: string, ...args: unknown[]) {
      if (id === "@getpaseo/plugin/client") return { usePaseo: () => current.paseo, useRpc: (r: any) => { if (!calls.has(r.name)) calls.set(r.name, (...values) => current.rpc[r.name](...values)); return calls.get(r.name); }, openExternalUrl: () => {} };
      if (id === "@getpaseo/plugin/client/ui") return { SidebarRow: (p: any) => createElement("div", null, createElement("button", { "aria-label": p.label, onClick: p.onPress }, p.label), p.trailing) };
      if (id === "@getpaseo/plugin/client/react-native") return { ScrollView: element, TextInput: input, Icon: () => null, Modal: Object.assign(({ open, children }: any) => current.showModals && open ? createElement("div", { role: "dialog" }, children) : null, { Content: element }) };
      if (id === "react-native") return { Text: element, View: element, ScrollView: element, Pressable: element, Platform: { OS: "web" }, Keyboard: {}, PanResponder: { create: () => ({ panHandlers: {} }) } };
      if (id === "./feedback-pressable") return { FeedbackPressable: element };
      if (id === "./markdown-view") return { MarkdownView: ({ source }: { source: string }) => createElement("span", null, source) };
      return original.call(this, id, ...args);
    });
    Bridge = require("../../client/bridge").Bridge;
    Board = require("../../client/board").Board;
    BoardItem = require("../../client/sidebar-waiting").BoardItem;
    restore.mock.restore();
  }
  const visible = (e: Element) => { for (let node: Element | null = e; node; node = node.parentElement) if ((node as HTMLElement).style?.display === "none") return false; return true; };
  const find = (label: string) => [...container.querySelectorAll<HTMLElement>("[aria-label]")].find(e => e.getAttribute("aria-label") === label && visible(e));
  const click = async (label: string) => { const node = find(label); assert.ok(node, `visible control: ${label}`); await act(async () => node.click()); };
  const screens: any[] = [];
  const audio: any[] = [];
  let route: any = null;
  let Popover: any = null;
  const opened: any[] = [];
  const props = { ...(identity ? { host: { id: "fixture-host", label: "Fictional" } } : {}), theme: { colors }, layout: { compact, platform: "web" }, navigation: { openAgent(value: any) { opened.push(value); } } };
  const openScreen = (input: any) => { screens.push(input); route = input; Popover = null; draw(); };
  const draw = () => root.render(sidebar ? createElement("div", null,
    createElement(BoardItem, { ...props, playAudio: async (value:any)=>{audio.push(value);}, currentScreen: route, openScreen, openPopover: (content: any) => { Popover = content; draw(); } }),
    Popover ? createElement(Popover, { ...props, close() {}, openScreen }) : null,
    route ? createElement(Bridge, { ...props, params: route.params }) : null,
  ) : createElement(surface === "fleet" ? Board : Bridge, { ...props, params: route?.params }));
  const render = async () => { await act(async () => draw()); };
  const text = () => [...container.querySelectorAll<HTMLElement>("div,span,button")].filter(e => visible(e) && !e.children.length).map(e => e.textContent).join("\n");
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
  const measure = async (label: string, height: number, contentHeight: number) => {
    const props = measurements.get(label); assert.ok(props, `measurable: ${label}`);
    await act(async () => { props.onLayout?.({ nativeEvent: { layout: { height } } }); props.onContentSizeChange?.(300, contentHeight); });
  };
  return { navigate: async (params:any) => { await act(async () => openScreen({screenId:"board",params})); }, audio, statuses, setIdentity: async (present: boolean) => { Object.assign(props, { host: present ? { id: "fixture-host", label: "Fictional" } : undefined }); await render(); }, opened, measure, screens, sendOverrides, readOverrides, readFailures, subscriptionFailures, emitTimeline: async (id: string, type: string) => { await act(async () => { for (const fn of [...timelineListeners.get(id) ?? []]) fn({ event: { type } }); }); }, agents, reads, publishAgents: async () => { await act(async () => { for (const snapshot of snapshots) snapshot({ entries: agents.map(agent => ({ agent })) }); }); }, deferBriefing: () => { hold = true; return async () => { assert.ok(deferred); await act(async () => deferred!({ briefing: briefing("a"), recorded: null, error: null })); }; }, refresh: async (id: string) => { await act(async () => { for (const fn of listeners.get(id) ?? []) fn(); await new Promise(resolve => setTimeout(resolve, 200)); }); }, pollGates: async () => { await act(async () => { for (const timer of [...timers.values()]) if (timer.ms === 60_000) timer.callback(); }); }, timers, attempts, click, find, type, text, poll, render, rpc, records, claims, sent, failures, timeline, container, briefing };
}
