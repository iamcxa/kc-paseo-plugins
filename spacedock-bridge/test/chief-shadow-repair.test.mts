import assert from "node:assert/strict";
import { test } from "node:test";
import { chiefBoard } from "../server/chief";
import { readQuestion, toRows, withReplies, observeBoard } from "../shared/board";
import { buildQueue } from "../shared/queue";
import { BatchTracker, eligibleBatch, type ChiefEvent } from "../shared/chief";
import { mountBridge } from "./helpers/bridge-host.mjs";

const start = Date.parse("2026-11-08T10:00:00Z");
const iso = (at: number) => new Date(at).toISOString();
const reviews = async () => ({ requests: [], checkedAt: start, error: null, nextCheckAt: null });
function source(text: string, owner?: string) {
  const agent: any = { id: "fictional-fo", title: "Fictional officer", cwd: "/fictional", status: "idle", updatedAt: iso(start), requiresAttention: true, attentionReason: "finished", labels: { role: "fo", ...(owner ? { "next-owner": owner } : {}) } };
  const state = { text, epoch: "projection-A", seq: 1, since: start + 1, messageId: "provider-message", turnId: undefined as string | undefined };
  const api: any = { agents: {
    list: async ({ filter }: any) => ({ entries: filter.labels.role === "fo" ? [{ agent }] : [] }),
    ref: (id: string) => ({ timeline: { refetch: async () => ({ agentId: id, epoch: state.epoch, projection: "projected", reset: false, gap: false, staleCursor: false, error: null, hasOlder: false, hasNewer: false, entries: [{ provider: "fixture", turnId: state.turnId, seqStart: state.seq, seqEnd: state.seq, sourceSeqRanges: [{ startSeq: state.seq, endSeq: state.seq }], collapsed: [], timestamp: iso(state.since), item: { type: "assistant_message", text: state.text, ...(state.messageId ? { messageId: state.messageId } : {}) } }] }) } }),
  } };
  return { agent, state, api };
}

for (const marker of ["（我）", "(me)", "(I)", "(FO)"]) test(`a self-only ${marker} step vetoes a stale captain label at the full board boundary`, async () => {
  const s = source(`Next: Complete fictional internal work ${marker}`, "captain");
  const result = await chiefBoard(s.api, reviews);
  assert.equal(result.events.length, 0);
  assert.equal(result.queue.filter(item => item.kind === "ask").length, 0);
  assert.equal(result.total, "0");
  assert.equal(result.rows.length, 1, "the officer remains visible");
});

for (const owner of ["captain", undefined]) test(`mixed ownership stays visible without an automatic event (${owner ?? "absent"} label)`, async () => {
  const s = source("Next: Fictional internal work（我）；fictional choice（你）", owner);
  const result = await chiefBoard(s.api, reviews);
  assert.equal(result.events.length, 0);
  assert.equal(result.queue.filter(item => item.kind === "ask").length, 1);
  assert.equal(result.rows.length, 1);
});

test("a single parenthesis with both owners is held too", async () => {
  const s = source("Next: Clarify fictional responsibility（你 / 我）", "captain");
  const result = await chiefBoard(s.api, reviews);
  assert.equal(result.events.length, 0);
  assert.equal(result.queue.filter(item => item.kind === "ask").length, 1);
});

test("self-only questions do not remove independent gates or permissions", async () => {
  const s = source("下一步：完成範例內部工作（我）", "captain");
  const fact = await readQuestion(s.api, s.agent.id, "captain");
  const row = { ...withReplies(toRows([s.agent]), { [s.agent.id]: fact })[0], permission: "Fictional permission", gates: [{ slug: "fictional-gate", title: "Fictional gate", stage: "validation", preparedAt: iso(start) }] };
  assert.deepEqual(buildQueue([row], [], [row], { [row.id]: fact }).map(item => item.kind).sort(), ["gate", "permission"]);
});

test("an actual reply ownership veto also beats a stale positive next label", async () => {
  const s = source("Next: Fictional internal work（我）", "captain");
  s.agent.labels.next = "Fictional choice（你）";
  assert.equal((await chiefBoard(s.api, reviews)).queue.filter(item => item.kind === "ask").length, 0);
});

test("a genuine Captain question still counts and FO ownership still vetoes it", async () => {
  const s = source("Next: Choose the fictional direction（你）", "captain");
  assert.equal((await chiefBoard(s.api, reviews)).events.length, 1);
  s.agent.labels["next-owner"] = "fo";
  assert.equal((await chiefBoard(s.api, reviews)).events.length, 0);
});

test("a next-label change with identical activity invalidates cached ownership", async () => {
  const s = source("Next: Fictional internal work（我）", "captain");
  let listener: any, latest: any;
  s.api.agents.list = async () => ({ subscription: { subscribe: (value: any) => { listener = value; }, release: async () => {} } });
  const stop = await observeBoard(s.api, (rows, facts, state) => { latest = { rows, facts, state }; });
  const publish = async () => { listener.snapshot({ entries: [{ agent: s.agent }] }); for (let n = 0; n < 5; n++) await new Promise(setImmediate); };
  await publish();
  assert.equal(latest.facts[s.agent.id].onCaptain, false);
  s.state.text = "Next: Choose a fictional option（你）";
  s.agent.labels.next = "Choose a fictional option（你）";
  await publish();
  assert.equal(latest.facts[s.agent.id].onCaptain, true);
  stop();
});

for (const identity of ["message", "turn"] as const) test(`question identity survives projection/range/time reconstruction with a provider ${identity}`, async () => {
  const s = source("Next: Choose the fictional direction（你）", "captain");
  if (identity === "turn") { s.state.messageId = ""; s.state.turnId = "provider-turn"; }
  const before = (await chiefBoard(s.api, reviews)).events[0];
  assert.ok(before);
  s.state.epoch = "projection-B"; s.state.seq = 900; s.state.since -= 16;
  const after = (await chiefBoard(s.api, reviews)).events[0];
  assert.equal(after.key, before.key);
  assert.equal(after.version, before.version);
});

test("a question without a provable source identity is visible but cannot trigger", async () => {
  const s = source("Next: Choose the fictional direction（你）", "captain");
  s.state.messageId = "";
  const result = await chiefBoard(s.api, reviews);
  assert.equal(result.queue.length, 1);
  assert.equal(result.events.length, 0);
});

test("real question details survive reprojection but a genuinely new provider message retains a distinct detail", async t => {
  const h = await mountBridge(t);
  const agent = h.agents[0]; Object.assign(agent, { requiresAttention: true, attentionReason: "finished" });
  const title = "Fictional repeated choice (you)", at = new Date(Date.now() - 900_000).toISOString();
  let epoch = "one", seq = 1, id = "source-one";
  h.readOverrides.set("a:projected", async () => ({ agentId: "a", epoch, projection: "projected", reset: false, gap: false, staleCursor: false, error: null, hasOlder: false, hasNewer: false, entries: [{ provider: "fixture", seqStart: seq, seqEnd: seq, sourceSeqRanges: [{ startSeq: seq, endSeq: seq }], collapsed: [], timestamp: at, item: { type: "assistant_message", text: `Next: ${title}`, messageId: id } }] }));
  await h.publishAgents(); await h.click(`${title} — A FO`); const first = h.find("Message A FO");
  await h.type("Message A FO", "Fictional retained draft"); await h.click("Back to Chief of staff");
  epoch = "two"; seq = 900; agent.updatedAt = new Date().toISOString();
  await h.publishAgents(); await h.click(`${title} — A FO`); assert.ok(h.find("Message A FO") === first, "projection changes retain the original question detail");
  await h.click("Back to Chief of staff"); id = "source-two"; agent.updatedAt = new Date(Date.now() + 1).toISOString();
  await h.publishAgents(); await h.click(`${title} — A FO`); assert.ok(h.find("Message A FO") !== first, "a new provider message has a distinct question detail");
  assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value, "Fictional retained draft");
  assert.equal(h.sent.length, 0); assert.equal(h.audio.length, 0);
});

const ask = (key: string, since: number, version = key): ChiefEvent => ({ key, version, kind: "ask", title: `Fictional question ${key}`, since: iso(since), agentId: key, target: key });
test("seven old questions do not become arrivals after a projection rebuild", () => {
  const events = Array.from({ length: 7 }, (_, n) => ask(`q${n}`, start - (n < 5 ? 172_800_000 : 1_200_000)));
  const tracker = new BatchTracker();
  assert.equal(tracker.observe(events, start, true), null);
  const rebuilt = events.map(event => ({ ...event, key: event.key + "-rebuilt", version: "new-projection", since: iso(Date.parse(event.since) - 16) }));
  assert.equal(tracker.observe(rebuilt, start + 60_000, true), null);
});

test("old questions first appearing or changing ownership after startup do not fill X", () => {
  const tracker = new BatchTracker(); tracker.observe([], start, true);
  assert.equal(tracker.observe([1, 2, 3, 4].map(n => ask(`old-${n}`, start - 86_400_000)), start + 60_000, true), null);
});

test("consumed old questions cannot replay after disappearance and a new projection", () => {
  const tracker = new BatchTracker(); tracker.observe([], start, true);
  const arrivals = [1, 2, 3, 4].map(n => ask(`new-${n}`, start + n));
  assert.equal(tracker.observe(arrivals, start + 60_000, true), null);
  assert.ok(tracker.observe(arrivals, start + 360_000, true)); tracker.consume(arrivals);
  tracker.observe([], start + 420_000, true);
  assert.equal(tracker.observe(arrivals.map(e => ({ ...e, key: e.key + "-rebuilt", version: "rebuilt" })), start + 480_000, true), null);
});

test("timestamp/source changes of a continuously waiting question are not new arrivals", () => {
  const tracker = new BatchTracker();
  const old = [1, 2, 3, 4].map(n => ask(`old-${n}`, start - 86_400_000)); tracker.observe(old, start, true);
  const restored = old.map(e => ({ ...e, version: "reconstructed", since: iso(start + 1) }));
  tracker.observe(restored, start + 60_000, true);
  assert.equal(tracker.observe(restored, start + 360_000, true), null);
});

test("new verified questions still wait five minutes, and a later resolved/reasked batch can qualify", () => {
  const tracker = new BatchTracker(); tracker.observe([], start, true);
  const arrivals = [1, 2, 3, 4].map(n => ask(`new-${n}`, start + n));
  assert.equal(tracker.observe(arrivals, start + 60_000, true), null);
  assert.equal(tracker.observe(arrivals, start + 300_000, true), null);
  const first = tracker.observe(arrivals, start + 300_001, true); assert.equal(first?.score, 18);
  tracker.consume(first!.events); tracker.observe([], start + 360_000, true);
  const reasked = arrivals.map(e => ({ ...e, version: "new-source", since: iso(start + 360_001) }));
  assert.equal(tracker.observe(reasked, start + 420_000, true), null);
  assert.equal(tracker.observe(reasked, start + 660_001, true)?.events.length, 4);
});

test("unknown identity/time and an incomplete-read recovery cannot manufacture a question arrival", () => {
  const tracker = new BatchTracker(); tracker.observe([], start, true);
  tracker.observe([], start + 60_000, false);
  const events = [1, 2, 3, 4].map(n => ask(`old-${n}`, start - 86_400_000));
  assert.equal(tracker.observe(events, start + 120_000, true), null);
  assert.equal(tracker.observe(events, start + 480_000, true), null);
});

const gate = (key: string, since: string, kind: "gate" | "permission" = "gate"): ChiefEvent => ({ key, version: key, kind, title: `Fictional ${key}`, since, agentId: "fictional-fo", target: key });
const pair = () => [gate("a", "2026-11-08T10:10:32Z"), gate("b", "2026-11-08T10:10:41Z")];
test("same-minute exceptions close together, sum existing weights and consume together", () => {
  const events = pair(), tracker = new BatchTracker();
  tracker.observe([], Date.parse("2026-11-08T10:09:00Z"), true);
  tracker.observe(events, Date.parse("2026-11-08T10:11:00Z"), true);
  assert.equal(tracker.observe(events, Date.parse("2026-11-08T10:40:51Z"), true), null);
  const cohort = tracker.observe(events, Date.parse("2026-11-08T10:41:00Z"), true);
  assert.deepEqual(cohort?.events.map(e => e.key), ["a", "b"]);
  assert.equal(cohort?.score, 8); assert.equal(cohort?.reason, "exception");
  tracker.consume(cohort!.events);
  assert.equal(tracker.observe(events, Date.parse("2026-11-08T10:42:00Z"), true), null);
});

test("a poll between two same-minute deadlines cannot split or call early", () => {
  const events = pair();
  assert.equal(eligibleBatch(events, Date.parse("2026-11-08T10:40:35Z")), null);
  assert.equal(eligibleBatch(events, Date.parse("2026-11-08T10:41:00Z"))?.events.length, 2);
});

test("gate and permission share a deadline cohort, while unknown/future times stay excluded", () => {
  const events = [pair()[0], gate("p", "2026-11-08T10:10:41Z", "permission"), gate("unknown", ""), gate("future", "2026-11-08T11:00:00Z")];
  const result = eligibleBatch(events, Date.parse("2026-11-08T10:41:00Z"));
  assert.deepEqual(result?.events.map(e => e.key), ["a", "p"]);
  assert.equal(result?.score, 8);
});

test("a true singleton waits at most one extra minute and exactly thirty minutes never qualifies", () => {
  const event = gate("single", "2026-11-08T10:10:00Z");
  assert.equal(eligibleBatch([event], Date.parse("2026-11-08T10:40:00Z")), null);
  assert.equal(eligibleBatch([event], Date.parse("2026-11-08T10:40:01Z")), null);
  assert.equal(eligibleBatch([event], Date.parse("2026-11-08T10:41:00Z"))?.events.length, 1);
});

test("separate deadline minutes remain separate and resolved cohort members disappear", () => {
  const first = pair()[0], later = gate("later", "2026-11-08T10:11:10Z"), tracker = new BatchTracker();
  tracker.observe([], start, true); tracker.observe([first, later], Date.parse("2026-11-08T10:12:00Z"), true);
  const one = tracker.observe([first, later], Date.parse("2026-11-08T10:41:00Z"), true);
  assert.deepEqual(one?.events.map(e => e.key), ["a"]); tracker.consume(one!.events);
  assert.deepEqual(tracker.observe([first, later], Date.parse("2026-11-08T10:42:00Z"), true)?.events.map(e => e.key), ["later"]);
  const removed = new BatchTracker(); removed.observe([], start, true); removed.observe(pair(), Date.parse("2026-11-08T10:11:00Z"), true);
  assert.deepEqual(removed.observe([first], Date.parse("2026-11-08T10:41:00Z"), true)?.events.map(e => e.key), ["a"]);
});
