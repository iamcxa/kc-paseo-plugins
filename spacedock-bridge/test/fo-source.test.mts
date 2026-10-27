import assert from "node:assert/strict";
import { test } from "node:test";
import type { PaseoApi } from "@getpaseo/client";
import { attachGates, observeBoard, withReplies, type BoardAgent, type ReplyFact } from "../shared/board";
import { boardEmptyState, type SourceState } from "../shared/board-empty";
import { buildQueue } from "../shared/queue";

const agent: BoardAgent = {
  id: "first", cwd: "/fixture", title: "First FO", status: "idle", updatedAt: "2026-10-25T00:00:00Z",
  labels: { role: "fo" }, requiresAttention: true, attentionReason: "finished",
};
const turn = () => new Promise<void>((resolve) => setImmediate(resolve));
const page = (text: string) => ({ entries: [{ item: { type: "assistant_message", text } }] });

async function source(read: (id: string) => Promise<ReturnType<typeof page>>) {
  let observer!: { snapshot(value: unknown): void };
  let shown = { message: null as string | null, count: "", state: "loading" as SourceState };
  const paseo = { agents: {
    list: async () => ({ subscription: { subscribe: (value: typeof observer) => { observer = value; }, release: async () => {} } }),
    ref: (id: string) => ({ timeline: { refetch: () => read(id) } }),
  } } as unknown as PaseoApi;
  const stop = await observeBoard(paseo, (rows, replies: Record<string, ReplyFact> = {}, state: SourceState = "loaded") => {
    const enriched = withReplies(rows, replies);
    const total = buildQueue(attachGates(enriched, []), [], enriched).length;
    shown = { ...boardEmptyState({ fos: state, gates: "loaded", reviews: "loaded", comms: "loaded" }, total), state };
  });
  return { stop, snapshot: (agents: BoardAgent[]) => observer.snapshot({ entries: agents.map((agent) => ({ agent })) }), shown: () => shown };
}

test("the FO source stays loading until every question read settles", async (t) => {
  let first!: (value: ReturnType<typeof page>) => void;
  let second!: (value: ReturnType<typeof page>) => void;
  const pages = { first: new Promise<ReturnType<typeof page>>((resolve) => { first = resolve; }), second: new Promise<ReturnType<typeof page>>((resolve) => { second = resolve; }) };
  const h = await source((id) => pages[id as keyof typeof pages]);
  t.after(h.stop);
  h.snapshot([agent, { ...agent, id: "second" }]);
  assert.deepEqual(h.shown(), { message: "Loading…", count: "…", state: "loading" });
  first(page("Next: Choose the theme (you)"));
  await turn();
  assert.equal(h.shown().state, "loading");
  second(page("Next: Continue implementation (me)"));
  await turn();
  assert.deepEqual(h.shown(), { message: null, count: "1", state: "loaded" });
});

test("a failed FO question read marks the source incomplete and keeps successful questions", async (t) => {
  let failed = true;
  const h = await source(async (id) => {
    if (id === "second" && failed) throw new Error("Synthetic timeline failure");
    return page("Next: Choose the theme (you)");
  });
  t.after(h.stop);
  h.snapshot([agent, { ...agent, id: "second" }]);
  await turn();
  assert.deepEqual(h.shown(), { message: "Could not check FOs — this list may be incomplete", count: "1+", state: "failed" });
  failed = false;
  h.snapshot([agent, { ...agent, id: "second" }]);
  await turn();
  assert.deepEqual(h.shown(), { message: null, count: "2", state: "loaded" });
});
