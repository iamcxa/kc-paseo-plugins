import assert from "node:assert/strict";
import { test } from "node:test";
import { ChiefObserver, prepareBatch } from "../server/chief";
import { BATCH_MARKER, type ChiefEvent } from "../shared/chief";
import { COORDINATOR_VERSION } from "../shared/coordinator";

const at = Date.parse("2026-11-10T10:00:00Z");
const event: ChiefEvent = { key: "fictional-gate", version: "one", kind: "gate", title: "Fictional CSV gate", waiter: "Fictional FO", since: new Date(at - 1_900_000).toISOString(), agentId: "fo", target: "fictional-gate" };
function fixture() {
  let events: ChiefEvent[] = [];
  const entries: any[] = [], messages: string[] = [];
  let chiefRuns = 0, helperRuns = 0, creates = 0;
  const entry = (type: string, text = "", extra = {}): any => ({ seqStart: entries.length + 1, seqEnd: entries.length + 1, sourceSeqRanges: [{ startSeq: entries.length + 1, endSeq: entries.length + 1 }], collapsed: [], timestamp: new Date(at).toISOString(), turnId: "fictional-turn", item: { type, text, ...extra } });
  const page = (id: string, rows: any[]) => ({ agentId: id, epoch: "fixture", projection: "projected", entries: rows, hasOlder: false, hasNewer: false, reset: false, gap: false, staleCursor: false, error: null });
  const api: any = { agents: {
    list: async () => ({ entries: [{ agent: { id: "co", cwd: "/fictional", status: "idle", labels: { role: "comms-officer", "coordinator-version": COORDINATOR_VERSION } } }] }),
    create: async () => { creates++; return { id: "helper", status: "idle", lastUsage: { outputTokens: 1 }, refresh: async () => {}, run: async () => { helperRuns++; } }; },
    ref: (id: string) => ({ status: "idle", lastError: null, timeline: { refetch: async () => page(id, id === "co" ? entries : [entry("assistant_message", "Fictional supplied facts")]) }, run: async (text: string) => {
      chiefRuns++; messages.push(text); entries.push(entry("user_message", text));
      const batch = JSON.parse(text.slice(BATCH_MARKER.length).split("\n")[0]);
      const result = await prepareBatch(batch.id);
      entries.push(entry("tool_call", "", { name: "mcp__fleet__prepare_batch", status: "completed", detail: { type: "unknown", input: { batchId: batch.id }, output: { output: result } } }));
      entries.push(entry("assistant_message", "Fictional gate — recommend checking the CSV evidence."));
    } }),
  } };
  return { api, observer: new ChiefObserver(async () => ({ events, total: String(events.length), complete: true, rows: [] })), qualify: () => { events = [event]; }, counts: () => ({ chiefRuns, helperRuns, creates, messages: messages.length }), messages };
}
function restoreEnvironment(t: any) {
  const old = process.env.BRIDGE_CHIEF_AUTOCALL;
  t.after(() => { if (old === undefined) delete process.env.BRIDGE_CHIEF_AUTOCALL; else process.env.BRIDGE_CHIEF_AUTOCALL = old; });
  t.mock.method(Date, "now", () => at);
}

test("automatic calls default off: absent and every non-on switch keep a qualifying batch silent and its plain total", async t => {
  restoreEnvironment(t);
  for (const value of [undefined, "", "off", "ON", "true", "1", "on "]) {
    if (value === undefined) delete process.env.BRIDGE_CHIEF_AUTOCALL; else process.env.BRIDGE_CHIEF_AUTOCALL = value;
    const h = fixture(); await h.observer.read(h.api); h.qualify();
    const state = await h.observer.read(h.api); await new Promise(setImmediate); await h.observer.read(h.api);
    assert.deepEqual(h.counts(), { chiefRuns: 0, helperRuns: 0, creates: 0, messages: 0 }, `switch ${String(value)} must not post an automated message or run models`);
    assert.equal(state.total, "1"); assert.equal(state.phase, "quiet"); assert.equal(state.batch, null);
  }
});

test("only explicit on preserves one automatic batch message, one chief run and one preparation", async t => {
  restoreEnvironment(t); process.env.BRIDGE_CHIEF_AUTOCALL = "on";
  const h = fixture(); await h.observer.read(h.api); h.qualify(); await h.observer.read(h.api); await new Promise(setImmediate);
  assert.deepEqual(h.counts(), { chiefRuns: 1, helperRuns: 1, creates: 1, messages: 1 });
  assert.ok(h.messages[0].startsWith(BATCH_MARKER)); assert.equal(h.observer.state.phase, "calling"); assert.equal(h.observer.state.total, "1");
  await h.observer.read(h.api); assert.equal(h.counts().chiefRuns, 1);
});
