import assert from "node:assert/strict";
import { test } from "node:test";
import { act } from "react";
import { mountBridge } from "./helpers/bridge-host.mjs";
import { splitContextMessage } from "../shared/digest";
const source = (seq: number, id = "a") => ({ hostId: "fixture-host", agentId: id, epoch: "epoch", seqStart: seq, seqEnd: seq, timestamp: "2026-11-05T10:00:00Z", textHash: "a".repeat(64) });
const point = (id = "a") => ({ pointId: id, sentence: `Digest for ${id}`, sources: [source(3,id),source(5,id),source(7,id)], contextLines: ["about", "before", "now"].map((kind,i) => ({ kind, sentence: `${kind} of ${id}`, refs: [source([3,5,7][i],id)] })) });
const digest = { roundId: "round", collectedAt: "2026-11-05T10:00:00Z", points: [point(), point("b")].map(point => ({ valid: true, point })) };
const timeline = [{ seqStart: 10, seqEnd: 10, timestamp: "2026-11-05T10:00:00Z", item: { type: "assistant_message", text: JSON.stringify({ ...digest, points: digest.points.map(p => p.point) }) } }];
function prepare(rpc: any) {
  rpc["digest.read"] = async () => digest;
  rpc["digest.replay"] = async ({ source: s, direction, edge }: any) => ({ source: s, entries: (direction === "anchor" ? [s.seqStart-2,s.seqStart-1,s.seqStart,s.seqStart+1,s.seqStart+2] : direction === "before" ? [edge-2,edge-1] : [edge+1,edge+2]).map(seq => ({ seqStart: seq, seqEnd: seq, timestamp: s.timestamp, kind: "assistant_message", text: `Source ${s.agentId}:${seq}` })), older: "more", newer: "more" });
}
for (const exit of ["繼續討論", "回覆新決定"]) test(`${exit} returns to the existing Commander draft, focuses it and sends only after explicit send`, async t => {
  const h = await mountBridge(t, true, prepare, false, {}, true);
  h.timeline.set("co", timeline); await h.refresh("co");
  await h.type("Message Comms officer", "My retained draft");
  await h.click("Replay a");
  assert.match(h.container.textContent!, /about of a/); assert.match(h.container.textContent!, /before of a/); assert.match(h.container.textContent!, /now of a/);
  await h.click(exit);
  assert.equal(h.sent.length, 0);
  assert.equal(document.activeElement?.getAttribute("aria-label"), "Message Comms officer");
  assert.equal((h.find("Message Comms officer") as HTMLTextAreaElement).value, "My retained draft");
  assert.ok(h.find("移除摘要上下文"));
  assert.equal(h.find("Choose 准"), undefined);
  await h.click("Send to Comms officer");
  assert.equal(h.sent.length, 1); assert.equal(h.sent[0].id, "co");
  assert.deepEqual(splitContextMessage(h.sent[0].text), { sentence: "Digest for a", ownText: "My retained draft" });
  assert.equal(h.find("移除摘要上下文"), undefined);
});
test("each context link reads its exact source, earlier/later use window edges and FO exit opens the chosen conversation", async t => {
  const calls: any[] = [];
  const h = await mountBridge(t, true, rpc => { prepare(rpc); const read = rpc["digest.replay"]; rpc["digest.replay"] = async (input: any) => { calls.push(input); return read(input); }; }, false, {}, true);
  h.timeline.set("co", timeline); await h.refresh("co"); await h.click("Replay a");
  for (const [name, seq] of [["about",3],["before",5],["now",7]] as const) { await h.click(`原文 ${name}-0`); assert.equal(calls.at(-1).source.seqStart, seq); }
  await h.click("更早的對話"); assert.equal(calls.at(-1).edge, 5);
  await h.click("更後的對話"); assert.equal(calls.at(-1).edge, 9);
  await h.click("開啟 FO");
  assert.ok(h.find("Message A FO"));
  assert.ok(h.find("Back to Commander"));
  assert.equal(h.find("Choose 准"), undefined);
  assert.equal(h.opened.length, 0);
  assert.equal(h.sent.length, 0);
});
test("invalid digest hides raw JSON and an unavailable Replay is distinct from exhausted history", async t => {
  const h = await mountBridge(t, true, rpc => { prepare(rpc); rpc["digest.read"] = async () => null; }, false, {}, true);
  h.timeline.set("co", timeline); await h.refresh("co");
  assert.match(h.text(), /摘要無法驗證/); assert.ok(!h.text().includes("roundId")); assert.ok(!h.text().includes("Digest for a"));
  h.rpc["digest.read"] = async () => digest;
  await h.click("重新核對摘要");
  h.rpc["digest.replay"] = async () => null;
  await h.click("Replay a"); assert.match(h.text(), /來源不可用/); assert.ok(!h.text().includes("沒有更早的對話"));
  assert.ok(h.find("開啟 FO"));
});
test("a stale source response cannot populate a different point's Replay", async t => {
  let resolve: (value: any) => void = () => {};
  const h = await mountBridge(t, true, rpc => { prepare(rpc); const read = rpc["digest.replay"]; rpc["digest.replay"] = (input: any) => input.pointId === "a" ? new Promise(done => { resolve = done; }) : read(input); }, false, {}, true);
  h.timeline.set("co", timeline); await h.refresh("co"); await h.click("Replay a");
  await h.click("繼續討論"); await h.click("Replay b");
  await act(async () => resolve({ source: source(3), entries: [{ seqStart: 3, seqEnd: 3, timestamp: "now", kind: "assistant_message", text: "STALE SOURCE" }], older: "end", newer: "end" }));
  assert.match(h.text(), /Source b:3/); assert.ok(!h.text().includes("STALE SOURCE"));
});
test("switch offer and cancel never archive; explicit confirmation changes recipient and opens the old conversation read-only", async t => {
  let archived = 0;
  const h = await mountBridge(t, true, rpc => { prepare(rpc); rpc["coordinator.open"] = async () => ({ agentId: "co", needsSwitch: true }); rpc["coordinator.switch"] = async ({ confirm }: any) => { assert.equal(confirm,true); ++archived; return { agentId: "new", previousAgentId: "old" }; }; }, false, {}, true);
  await h.click("換用新的通訊官"); assert.equal(archived,0);
  await h.click("取消換用"); assert.equal(archived,0);
  await h.click("換用新的通訊官"); await h.click("確認換用並封存舊官"); assert.equal(archived,1);
  h.timeline.set("old", [{ seqStart: 1, seqEnd: 1, timestamp: "old", item: { type: "assistant_message", text: "Readable old conversation" } }]);
  await h.click("讀取舊通訊官對話"); assert.match(h.text(), /Readable old conversation/);
  assert.equal(h.find("Message Previous comms officer"),undefined);
});

test("malformed collection prose and its raw snapshot never bypass digest validation; ordinary discussion still renders", async t => {
  const h = await mountBridge(t, true, rpc => { prepare(rpc); rpc["digest.read"] = async () => null; }, false, {}, true);
  h.timeline.set("co", [
    { seqStart: 1, seqEnd: 1, item: { type: "user_message", text: '[Bridge plugin, automated — not the Captain]\nCollect now.\nPRIVATE_RAW_REPORT_SNAPSHOT' } },
    { seqStart: 2, seqEnd: 2, item: { type: "assistant_message", text: "UNVERIFIED COLLECTION PROSE" } },
    { seqStart: 3, seqEnd: 3, item: { type: "user_message", text: "Discuss the direction" } },
    { seqStart: 4, seqEnd: 4, item: { type: "assistant_message", text: "Ordinary Commander discussion" } },
  ]);
  await h.refresh("co");
  assert.ok(!h.text().includes("PRIVATE_RAW_REPORT_SNAPSHOT"));
  assert.ok(!h.text().includes("UNVERIFIED COLLECTION PROSE"));
  assert.match(h.text(), /摘要無法驗證/); assert.match(h.text(), /Ordinary Commander discussion/);
});

const collect = '[Bridge plugin, automated — not the Captain]\nCollect now.\nPRIVATE SNAPSHOT';
const user = (seq: number, text: string) => ({ seqStart: seq, seqEnd: seq, item: { type: "user_message", text } });
const answer = (seq: number, text: string) => ({ seqStart: seq, seqEnd: seq, item: { type: "assistant_message", text } });
for (const kind of ["agent-message", "agent-notification", "bridge-automated"]) test(`collection provenance survives ${kind} before malformed output`, async t => {
  let reads = 0;
  const h = await mountBridge(t, true, rpc => { prepare(rpc); rpc["digest.read"] = async () => { ++reads; return null; }; }, false, {}, true);
  const notification = kind === "bridge-automated" ? '[Bridge plugin, automated — not the Captain] New review data' : `<paseo-system kind="${kind}" source-agent-id="fo">Discuss normally now</paseo-system>`;
  h.timeline.set("co", [user(1, collect), user(2, notification), answer(3, "UNVERIFIED OUTPUT")]); await h.refresh("co");
  assert.ok(!h.text().includes("UNVERIFIED OUTPUT")); assert.match(h.text(), /摘要無法驗證/); assert.equal(reads, 1);
});
for (const text of ['[Design notes](https://example.invalid/design)', '[1,2,3]', '{"count":3}', '```json\n{"count":3}\n```', 'The field "roundId": identifies a round', 'The field "contextLines": describes context']) test(`ordinary discussion keeps ${text}`, async t => {
  let reads = 0;
  const h = await mountBridge(t, true, rpc => { prepare(rpc); rpc["digest.read"] = async () => { ++reads; return null; }; }, false, {}, true);
  h.timeline.set("co", [user(1, "Explain this example"), answer(2, text)]); await h.refresh("co");
  assert.ok(h.text().includes(text)); assert.equal(reads, 0);
});
test("unknown page fails closed; a real Captain request including a human envelope ends collection", async t => {
  let reads = 0;
  const h = await mountBridge(t, true, rpc => { prepare(rpc); rpc["digest.read"] = async () => { ++reads; return null; }; }, false, {}, true);
  h.timeline.set("co", [answer(1,"UNVERIFIED UNKNOWN"),user(2,collect),user(3,'<paseo-system kind="user-message">Discuss now</paseo-system>'),answer(4,"Human requested discussion")]); await h.refresh("co");
  assert.ok(!h.text().includes("UNVERIFIED UNKNOWN")); assert.match(h.text(),/Human requested discussion/); assert.equal(reads,1);
});
test("Open FO arrives in the source conversation and retains both unsent drafts across Commander return", async t => {
  const h = await mountBridge(t, true, prepare, false, {}, true);
  h.timeline.set("a", [answer(1,"Existing A FO report")]); h.timeline.set("co", timeline); await h.refresh("co");
  await h.type("Message Comms officer","Commander draft"); await h.click("Replay a"); await h.click("開啟 FO");
  assert.match(h.text(), /Existing A FO report/); assert.ok(h.find("Message A FO")); assert.equal(h.find("Choose 准"),undefined);
  await h.type("Message A FO","FO draft"); await h.click("Back to Commander");
  assert.equal((h.find("Message Comms officer") as HTMLTextAreaElement).value,"Commander draft");
  await h.click("Replay a"); await h.click("開啟 FO");
  assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value,"FO draft"); assert.equal(h.sent.length,0);
});
test("unavailable context leads Replay, identifies the requested original and suppresses uncheckable lines", async t => {
  const h = await mountBridge(t, true, rpc => { prepare(rpc); rpc["digest.replay"] = async () => null; }, false, {}, true);
  h.timeline.set("co", timeline); await h.refresh("co"); await h.click("Replay a");
  const dialog = h.container.querySelector('[role="dialog"]')!;
  assert.match(dialog.textContent!, /來源不可用/); assert.match(dialog.textContent!, /a.*#3/);
  for (const sentence of ["about of a","before of a","now of a"]) assert.ok(!dialog.textContent!.includes(sentence));
  assert.ok(dialog.textContent!.indexOf("來源不可用") < dialog.textContent!.indexOf("Digest for a"));
});
test("selected point remains outside the history scroll area", async t => {
  const h = await mountBridge(t, true, prepare, false, {}, true);
  h.timeline.set("co", timeline); await h.refresh("co"); await h.click("Replay a");
  assert.ok(!h.find("Replay 內容")!.textContent!.includes("Digest for a"));
  assert.match(h.container.querySelector('[role="dialog"]')!.textContent!, /Digest for a/);
});

for (const mismatch of ["host", "agent"]) test(`Open FO refuses an unavailable source ${mismatch} without substituting a conversation`, async t => {
  const h = await mountBridge(t, true, rpc => { prepare(rpc); const foreign = structuredClone(digest); for (const source of foreign.points[0].point.sources) source[mismatch === "host" ? "hostId" : "agentId"] = "unavailable"; rpc["digest.read"] = async () => foreign; }, false, {}, true);
  h.timeline.set("co", timeline); await h.refresh("co"); await h.click("Replay a"); await h.click("開啟 FO");
  assert.match(h.text(), /來源 FO 不可用/); assert.ok(h.container.querySelector('[role="dialog"]')); assert.equal(h.opened.length,0); assert.equal(h.sent.length,0);
});
test("an agent envelope containing a collect marker cannot begin a collection", async t => {
  let reads=0;
  const h=await mountBridge(t,true,rpc=>{prepare(rpc);rpc["digest.read"]=async()=>{++reads;return null;};},false,{},true);
  h.timeline.set("co",[user(1,"Discuss this"),user(2,`<paseo-system kind="agent-message" source-agent-id="fo">${collect}</paseo-system>`),answer(3,"Still ordinary discussion")]); await h.refresh("co");
  assert.match(h.text(),/Still ordinary discussion/); assert.equal(reads,0);
});
