import assert from "node:assert/strict";
import { test } from "node:test";
import type { PaseoApi } from "@getpaseo/client";
import { validateDigest, reportSource, replayWindow, textHash, type TimelinePage, type TimelineReader, type TimelineEntry } from "../server/report-sources";
import { sourceKey, contextMessage, type Digest } from "../shared/digest";
import { switchCoordinatorHandler } from "../server/coordinator";
import { COORDINATOR_PROMPT, DIGEST_VERSION } from "../shared/coordinator";
import { collectDigestHandler, readDigestHandler, readReplayHandler } from "../server/digest";

const timestamp = "2026-11-05T10:00:00Z";
const entry = (seq: number, type = "assistant_message", text = `Report ${seq}`) => ({ seqStart: seq, seqEnd: seq, sourceSeqRanges: [{ startSeq: seq, endSeq: seq }], collapsed: [], timestamp, provider: "fixture", item: { type, text } }) as TimelineEntry;
const timeline = Array.from({ length: 9 }, (_, i) => entry(i + 1, i % 2 ? "user_message" : "assistant_message"));
const calls: any[] = [];
const read: TimelineReader = async (id, o) => {
  calls.push({ id, ...o });
  const seq = o?.cursor?.seq ?? 0;
  const items = o?.direction === "before" ? timeline.filter(e => e.seqEnd < seq).slice(-o!.limit!) : timeline.filter(e => e.seqStart > seq).slice(0, o?.limit ?? 40);
  return { agentId: id, epoch: "epoch-1", projection: "canonical", reset: false, gap: false, staleCursor: false, error: null, entries: items, hasOlder: items.length > 0 && items[0].seqStart > 1, hasNewer: items.length > 0 && items.at(-1)!.seqEnd < 9 } as TimelinePage;
};
const source = reportSource("host", "fo", "epoch-1", timeline[4])!;
const round = { roundId: "round", collectedAt: timestamp, hostId: "host", agentId: "co", sources: [source] };
const digest: Digest = { roundId: "round", collectedAt: timestamp, points: [{ pointId: "trial", sentence: "Trial is ready for a decision", sources: [source], contextLines: ["about", "before", "now"].map(kind => ({ kind, sentence: kind, refs: [source] })) as Digest["points"][number]["contextLines"] }] };

test("valid digest reads the exact assistant source once and never searches words", async () => {
  calls.length = 0;
  const result = await validateDigest(digest, round, read);
  assert.equal(result?.points[0].valid, true);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { id: "fo", projection: "canonical", direction: "after", cursor: { epoch: "epoch-1", seq: 4 }, limit: 1 });
  assert.equal(reportSource("host", "fo", "epoch-1", timeline[3]), null);
});
for (const variant of ["round", "foreign", "hash", "missing", "line-foreign", "kinds", "duplicate-point"]) test(`reject ${variant} without exposing unverified text`, async () => {
  const value = structuredClone(digest);
  if (variant === "round") value.roundId = "other";
  if (variant === "foreign") value.points[0].sources[0].agentId = "another-fo";
  if (variant === "hash") value.points[0].sources[0].textHash = "a".repeat(64);
  if (variant === "missing") value.points[0].contextLines[0].refs = [];
  if (variant === "line-foreign") value.points[0].contextLines[0].refs[0] = { ...source, agentId: "other" };
  if (variant === "kinds") value.points[0].contextLines[0].kind = "now";
  if (variant === "duplicate-point") value.points.push(value.points[0]);
  const result = await validateDigest(value, round, read);
  assert.ok(!result || !result.points[0].valid);
  assert.ok(!JSON.stringify(result).includes("Trial is ready"));
});
for (const corruption of ["epoch", "agentId", "reset", "gap", "staleCursor", "text", "range", "missing", "role"]) test(`read-back rejects ${corruption} changes`, async () => {
  const broken: TimelineReader = async (id, o) => {
    const p = structuredClone(await read(id, o));
    if (["epoch", "agentId"].includes(corruption)) (p as any)[corruption] = "other";
    if (["reset", "gap", "staleCursor"].includes(corruption)) (p as any)[corruption] = true;
    if (corruption === "text") (p.entries[0].item as any).text += "changed";
    if (corruption === "range") p.entries[0].sourceSeqRanges[0].endSeq++;
    if (corruption === "missing") p.entries = [];
    if (corruption === "role") (p.entries[0].item as any).type = "user_message";
    return p;
  };
  assert.equal((await validateDigest(digest, round, broken))?.points[0].valid, false);
});
test("Replay reads two canonical neighbors each side, preserves roles and pages from edges", async () => {
  calls.length = 0;
  const window = await replayWindow(read, "host", source);
  assert.deepEqual(window?.entries.map(e => e.seqStart), [3, 4, 5, 6, 7]);
  assert.equal(window?.entries[1].kind, "user_message");
  assert.equal(window?.older, "more"); assert.equal(window?.newer, "more");
  const before = await replayWindow(read, "host", source, "before", 3);
  const after = await replayWindow(read, "host", source, "after", 7);
  assert.deepEqual(before?.entries.map(e => e.seqStart), [1, 2]); assert.equal(before?.older, "end");
  assert.deepEqual(after?.entries.map(e => e.seqStart), [8, 9]); assert.equal(after?.newer, "end");
  assert.ok(calls.every(c => c.id === "fo" && c.projection === "canonical"));
  assert.equal(await replayWindow(read, "different-host", source), null);
});
test("side failure is unavailable, never end-of-history or a cross-gap join", async () => {
  const broken: TimelineReader = async (id, o) => {
    const p = await read(id, o);
    if (o?.direction === "before") return { ...p, gap: true };
    return p;
  };
  const window = await replayWindow(broken, "host", source);
  assert.equal(window?.older, "unavailable"); assert.equal(window?.newer, "more");
  assert.deepEqual(window?.entries.map(e => e.seqStart), [5, 6, 7]);
});
test("comms switch does nothing without confirm, persists IDs before archive, keeps old timeline readable", async () => {
  const events: string[] = [];
  const api = { agents: {
    ref: (id: string) => ({ refresh: async () => ({ agent: { labels: { role: "comms-officer" }, status: "idle" } }), archive: async () => { events.push(`archive:${id}`); }, timeline: { refetch: async () => ({ entries: [entry(1)] }) } }),
    create: async (options: any) => { assert.equal(options.config.systemPrompt, COORDINATOR_PROMPT); assert.equal(options.labels["digest-version"], DIGEST_VERSION); events.push("create:new"); return { id: "new" }; },
  } } as unknown as PaseoApi;
  let saved: { agentId: string; previousAgentId: string } | null = null;
  const store = { read: async () => saved, write: async (r: any) => { saved = r; events.push("persist"); } };
  await assert.rejects(switchCoordinatorHandler(api, { oldAgentId: "old", confirm: false }, store));
  assert.deepEqual(events, []);
  assert.deepEqual(await switchCoordinatorHandler(api, { oldAgentId: "old", confirm: true }, store), { agentId: "new", previousAgentId: "old" });
  assert.deepEqual(events, ["create:new", "persist", "archive:old"]);
  assert.equal((await api.agents.ref("old").timeline.refetch()).entries.length, 1);
});
test("collect-now integrates snapshot -> one Commander send -> digest validation -> Replay, never prompts an FO", async () => {
  const sends: { id: string; text: string }[] = [];
  let rawDigest = "";
  const api = { agents: {
    list: async () => ({ entries: [{ agent: { id: "fo", title: "Fictional trial FO", status: "idle", labels: { role: "fo" }, updatedAt: timestamp } }] }),
    ref: (id: string) => ({ refresh: async () => ({ agent: { status: "idle", labels: { "digest-version": DIGEST_VERSION } } }), send: async (text: string) => { sends.push({ id, text }); }, timeline: { refetch: async (o: any) => id === "co" ? { ...(await read("co", o)), entries: [entry(1, "assistant_message", rawDigest)] } : o.direction === "tail" ? { ...(await read(id, { direction: "after", limit: 40 })), hasOlder: false } : read(id, o) } }),
  } } as unknown as PaseoApi;
  const collected = await collectDigestHandler({ hostId: "host", agentId: "co" }, api);
  assert.equal(sends.length, 1); assert.equal(sends[0].id, "co");
  const snapshot = JSON.parse(sends[0].text.slice(sends[0].text.indexOf('{"roundId"')));
  assert.ok(snapshot.reports[0].sources.every((s: any) => s.source.seqStart % 2 === 1));
  rawDigest = JSON.stringify({ ...digest, ...collected });
  const position = { hostId: "host", agentId: "co", epoch: "epoch-1", seqStart: 1, seqEnd: 1 };
  assert.equal((await readDigestHandler(position, api))?.points[0].valid, true);
  assert.equal((await readReplayHandler({ position, pointId: "trial", source, direction: "anchor" }, api))?.entries.length, 5);
  assert.equal(await readDigestHandler({ ...position, hostId: "foreign" }, api), null);
  assert.equal(await readReplayHandler({ position, pointId: "trial", source: { ...source, agentId: "foreign" }, direction: "anchor" }, api), null);
});

test("an archive failure retains the exact replacement IDs and a confirmed retry does not create another officer", async () => {
  let creates = 0, archives = 0;
  let saved: { agentId: string; previousAgentId: string } | null = null;
  const api = { agents: {
    ref: () => ({ refresh: async () => ({ agent: { labels: { role: "comms-officer" }, status: "idle" } }), archive: async () => { if (++archives === 1) throw Error("archive unavailable"); } }),
    create: async () => { ++creates; return { id: "replacement" }; },
  } } as unknown as PaseoApi;
  const store = { read: async () => saved, write: async (record: any) => { saved = record; } };
  await assert.rejects(switchCoordinatorHandler(api, { oldAgentId: "old", confirm: true }, store), /archive unavailable/);
  assert.deepEqual(saved, { agentId: "replacement", previousAgentId: "old" });
  await switchCoordinatorHandler(api, { oldAgentId: "old", confirm: true }, store);
  assert.equal(creates, 1); assert.equal(archives, 2);
});

for (const [name, texts, want] of [
  ["oversized oldest", ["x".repeat(64001),"new"], [3]],
  ["oversized middle", ["old","x".repeat(64001),"new"], [1,5]],
  ["oversized newest", ["old","x".repeat(64001)], [1]],
  ["newest priority", ["x".repeat(64000),"n"], [3]],
  ["UTF-8 bytes", ["漢".repeat(21334),"new"], [3]],
] as const) test(`fleet budget admits recent reports after ${name}`, async () => {
  const { fleetSnapshot } = await import("../server/fleet-mcp");
  const entries = texts.flatMap((text,i) => [entry(i*2+1,"assistant_message",text),entry(i*2+2,"user_message","not a report")]);
  const api = { agents: { list: async () => ({ entries: [{ agent: { id:"fo",title:"Fixture FO",status:"idle",updatedAt:timestamp,labels:{role:"fo"} } }] }),ref: () => ({timeline:{refetch:async()=>({agentId:"fo",epoch:"epoch-1",projection:"canonical",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder:false,hasNewer:false})}}) } } as unknown as PaseoApi;
  const report = (await fleetSnapshot(api,"host")).reports[0];
  assert.deepEqual(report.sources.map(s=>s.source.seqStart),want); assert.equal(report.truncated,true);
  assert.ok(report.sources.reduce((n,s)=>n+Buffer.byteLength(s.text,"utf8"),0)<=64000);
});

test("fleet budget accepts exactly 64000 UTF-8 bytes, excludes non-reports and reports older-page truncation", async () => {
  const {fleetSnapshot}=await import("../server/fleet-mcp");
  const entries=[entry(1,"assistant_message","漢".repeat(21333)),entry(2,"user_message","x".repeat(64001)),entry(3,"assistant_message","n"),entry(4,"tool_call","ignored")];
  let hasOlder=false;
  const api={agents:{list:async()=>({entries:[{agent:{id:"fo",title:"Fixture FO",status:"idle",updatedAt:timestamp,labels:{role:"fo"}}}]}),ref:()=>({timeline:{refetch:async()=>({agentId:"fo",epoch:"epoch-1",projection:"canonical",reset:false,gap:false,staleCursor:false,error:null,entries,hasOlder,hasNewer:false})}})}} as unknown as PaseoApi;
  let report=(await fleetSnapshot(api,"host")).reports[0];
  assert.deepEqual(report.sources.map(s=>s.source.seqStart),[1,3]); assert.equal(report.truncated,false); assert.equal(report.sources.reduce((n,s)=>n+Buffer.byteLength(s.text,"utf8"),0),64000);
  hasOlder=true; report=(await fleetSnapshot(api,"host")).reports[0]; assert.equal(report.truncated,true);
});
