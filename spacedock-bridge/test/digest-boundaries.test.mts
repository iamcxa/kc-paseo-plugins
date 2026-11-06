import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { act } from "react";
import { FetchAgentTimelineRequestMessageSchema } from "@getpaseo/protocol/messages";
import { collectDigestHandler, readDigestHandler, readReplayHandler } from "../server/digest";
import { readSource, reportSource, replayWindow, validateDigest } from "../server/report-sources";
import { DIGEST_VERSION } from "../shared/coordinator";
import { mountBridge } from "./helpers/bridge-host.mjs";

const at = "2026-11-05T10:00:00Z";
const entry = (seq: number, text: string, type = "assistant_message"): any => ({ seqStart: seq, seqEnd: seq, sourceSeqRanges: [{ startSeq: seq, endSeq: seq }], collapsed: [], timestamp: at, provider: "fixture", item: { type, text } });
async function fixture(sourceSeq = 3, start = 10, parts = 1) {
  const fo = Array.from({ length: 9 }, (_, seq) => entry(seq, `Report ${seq}`, seq === sourceSeq || seq % 2 ? "assistant_message" : "user_message"));
  let co: any[] = [], mode = "ok", exactReads = 0;
  const calls: any[] = [];
  const read: any = async (id: string, options: any) => {
    FetchAgentTimelineRequestMessageSchema.parse({ type: "fetch_agent_timeline_request", requestId: "fixture", agentId: id, ...options });
    calls.push({ id, ...options });
    if (id === "co" && mode === "commander-throw") throw Error("Commander unavailable");
    if (id === "a" && options.direction === "after" && options.limit === 120) {
      exactReads++;
      if (mode === "source-throw" || (mode === "anchor-throw" && exactReads === 2)) throw Error("Source unavailable");
    }
    if (id === "a" && options.limit === 2 && options.direction === "before" && mode === "side-throw") throw Error("Earlier side unavailable");
    const all = id === "co" ? co : fo;
    const matching = options.direction === "tail" ? all : all.filter(e => options.direction === "before" ? e.seqEnd < options.cursor.seq : options.cursor === undefined || e.seqStart > options.cursor.seq);
    const selected = options.direction === "before" ? matching.slice(-options.limit) : options.direction === "tail" ? matching : matching.slice(0, options.limit);
    const page: any = { agentId: id, epoch: "epoch", projection: "projected", reset: false, gap: false, staleCursor: false, error: null, entries: structuredClone(selected), hasOlder: !!selected.length && selected[0].seqStart > all[0].seqStart, hasNewer: !!selected.length && selected.at(-1).seqEnd < all.at(-1).seqEnd };
    if (id === "co" && mode === "commander-invalid") page.epoch = "other";
    if (id === "a" && options.limit === 120 && mode === "point-invalid") page.entries = [];
    return page;
  };
  const api: any = { agents: { list: async () => ({ entries: [{ agent: { id: "a", title: "A FO", status: "idle", updatedAt: at, labels: { role: "fo" } } }] }), ref: (id: string) => ({ refresh: async () => ({ agent: { status: "idle", labels: { "digest-version": DIGEST_VERSION } } }), send: async () => {}, timeline: { refetch: (o: any) => read(id, o) } }) } };
  const round = await collectDigestHandler({ hostId: "fixture-host", agentId: "co" }, api);
  const source = reportSource("fixture-host", "a", "epoch", fo[sourceSeq])!;
  const data: any = { ...round, points: [{ pointId: "p", sentence: "Sourced point", sources: [source], contextLines: ["about", "before", "now"].map(kind => ({ kind, sentence: `Context ${kind}`, refs: [source] })) }] };
  const text = JSON.stringify(data);
  co = [{ ...entry(start, text), seqEnd: start + parts - 1, sourceSeqRanges: [{ startSeq: start, endSeq: start + parts - 1 }], collapsed: parts > 1 ? ["assistant_merge"] : [] }];
  const position = { hostId: "fixture-host", agentId: "co", epoch: "epoch", seqStart: start, seqEnd: start + parts - 1 };
  return { api, read, calls, source, data, position, co, set mode(value: string) { mode = value; exactReads = 0; } };
}

test("sequence-zero source validates every context ref and Replay reads its first two neighbors without a negative cursor", async () => {
  const f = await fixture(0);
  assert.equal((await readSource(f.read, "fixture-host", f.source))?.seqStart, 0);
  const round = { ...f.data, hostId: "fixture-host", agentId: "co", sources: [f.source] };
  assert.equal((await validateDigest(f.data, round, f.read))?.points[0].valid, true);
  const result = await replayWindow(f.read, "fixture-host", f.source);
  assert.deepEqual(result?.entries.map(e => e.seqStart), [0, 1, 2]);
  assert.equal(result?.older, "end"); assert.equal(result?.newer, "more");
  assert.equal((await replayWindow(f.read, "fixture-host", f.source, "before", 0))?.older, "end");
  assert.ok(f.calls.every(c => !c.cursor || c.cursor.seq >= 0));
  assert.equal(f.calls.find(c => c.direction === "after" && c.limit === 120).cursor, undefined);
});
for (const start of [0, 1]) for (const parts of [1, 2]) test(`Commander interval starts at ${start}, ${parts} fragments: digest and Replay use a legal exact-start read`, async () => {
  const f = await fixture(3, start, parts);
  assert.equal((await readDigestHandler(f.position, f.api))?.points[0].valid, true);
  assert.ok(await readReplayHandler({ position: f.position, pointId: "p", source: f.source, direction: "anchor" }, f.api));
  const reads = f.calls.filter(c => c.id === "co");
  assert.ok(reads.every(c => c.limit === 120));
  assert.deepEqual(reads[0].cursor, start ? { epoch: "epoch", seq: 0 } : undefined);
});
test("sequence one still reads after zero; zero sources reject epoch, hash, range, gap and missing-row changes", async () => {
  const positive = await fixture(1);
  assert.ok(await readSource(positive.read, "fixture-host", positive.source));
  assert.deepEqual(positive.calls.at(-1).cursor, { epoch: "epoch", seq: 0 });
  const f = await fixture(0);
  for (const mode of ["epoch", "hash", "range", "gap", "missing"]) {
    const read: any = async (id: string, o: any) => {
      const p = await f.read(id, o);
      if (mode === "epoch") p.epoch = "other";
      if (mode === "hash") p.entries[0].item.text += "changed";
      if (mode === "range") p.entries[0].sourceSeqRanges[0].endSeq++;
      if (mode === "gap") p.gap = true;
      if (mode === "missing") p.entries = [];
      return p;
    };
    assert.equal(await readSource(read, "fixture-host", f.source), null, mode);
  }
});

async function mounted(t: TestContext) {
  const f = await fixture();
  const h = await mountBridge(t, true, rpc => {
    rpc["digest.read"] = (input: any) => readDigestHandler(input, f.api);
    rpc["digest.replay"] = (input: any) => readReplayHandler(input, f.api);
  }, false, {}, true);
  h.timeline.set("co", [entry(9, "[Bridge plugin, automated — not the Captain]\nCollect now.", "user_message"), ...f.co]);
  await h.refresh("co"); await h.click("Replay p");
  assert.match(h.container.querySelector('[role="dialog"]')!.textContent!, /Context about/);
  return { f, h };
}
function globalFailure(h: Awaited<ReturnType<typeof mountBridge>>) {
  const text = h.container.querySelector('[role="dialog"]')!.textContent!;
  assert.match(text, /來源不可用/); assert.match(text, /請求的原文 · A FO · #3/);
  assert.ok(text.indexOf("來源不可用") < text.indexOf("Sourced point"));
  for (const kind of ["about", "before", "now"]) assert.ok(!text.includes(`Context ${kind}`));
  assert.ok(!text.includes("Report 3"));
  for (const exit of ["開啟 FO", "繼續討論", "回覆新決定", "重讀原文"]) assert.ok(h.find(exit));
  assert.equal(h.sent.length, 0);
}
for (const direction of ["before", "after"] as const) for (const mode of ["commander-throw", "transport-throw", "commander-invalid", "point-invalid", "source-throw", "anchor-throw"]) test(`Replay ${direction}: ${mode} is a whole failure, never an unverifiable context with a side warning`, async t => {
  const { f, h } = await mounted(t);
  f.mode = mode;
  if (mode === "transport-throw") h.rpc["digest.replay"] = async () => { throw Error("Transport unavailable"); };
  await h.click(direction === "before" ? "更早的對話" : "更後的對話");
  globalFailure(h);
});
for (const result of ["throw", "null"]) test(`initial anchor ${result} is globally unavailable`, async t => {
  const { h } = await mounted(t);
  await h.click("繼續討論");
  h.rpc["digest.replay"] = async () => { if (result === "throw") throw Error("Transport"); return null; };
  await h.click("Replay p"); globalFailure(h);
});
test("typed side failures retain verified context; a successful empty page remains end-of-history", async t => {
  const { f, h } = await mounted(t);
  f.mode = "side-throw"; await h.click("更早的對話");
  const dialog = () => h.container.querySelector('[role="dialog"]')!.textContent!;
  assert.match(dialog(), /前段未能讀取/); assert.match(dialog(), /Context about/); assert.match(dialog(), /Report 3/); assert.ok(!dialog().includes("來源不可用"));
  f.mode = "ok"; await h.click("更早的對話");
  assert.match(dialog(), /沒有更早的對話/); assert.match(dialog(), /Context about/); assert.ok(!dialog().includes("來源不可用"));
});
test("a global warning survives pending and failed retries; only verified recovery restores context", async t => {
  const { f, h } = await mounted(t);
  f.mode = "commander-invalid"; await h.click("更後的對話"); globalFailure(h);
  let resolve!: (value: any) => void;
  h.rpc["digest.replay"] = () => new Promise(done => { resolve = done; });
  await h.click("重讀原文"); globalFailure(h); assert.match(h.container.textContent!, /正在讀取原文/);
  await act(async () => resolve(null)); globalFailure(h);
  f.mode = "ok"; h.rpc["digest.replay"] = (input: any) => readReplayHandler(input, f.api);
  await h.click("重讀原文");
  const text = h.container.querySelector('[role="dialog"]')!.textContent!;
  assert.ok(!text.includes("來源不可用")); assert.match(text, /Context about/); assert.match(text, /Report 3/);
});
test("a superseded paging rejection cannot clear a newly verified Replay", async t => {
  const { f, h } = await mounted(t);
  let reject!: (reason: Error) => void;
  h.rpc["digest.replay"] = () => new Promise((_, fail) => { reject = fail; });
  await h.click("更早的對話"); await h.click("繼續討論");
  h.rpc["digest.replay"] = (input: any) => readReplayHandler(input, f.api);
  await h.click("Replay p"); await act(async () => reject(Error("Late transport failure")));
  assert.match(h.container.querySelector('[role="dialog"]')!.textContent!, /Context about/);
  assert.ok(!h.container.querySelector('[role="dialog"]')!.textContent!.includes("來源不可用"));
});
