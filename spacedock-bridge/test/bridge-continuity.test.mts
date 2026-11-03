import assert from "node:assert/strict";
import { test } from "node:test";
import { act } from "react";
import { mountBridge } from "./helpers/bridge-host.mjs";

const openA = (h: Awaited<ReturnType<typeof mountBridge>>) => h.click("Approve a? — A FO");
const detour = async (h: Awaited<ReturnType<typeof mountBridge>>) => { await h.click("Commander"); await openA(h); };

test("reopen keeps the confirmed choice and reason", async t => {
  const h = await mountBridge(t);
  await openA(h);
  await h.click("Choose 要求修改");
  await h.type("Reason for 要求修改", "Keep the retry visible");
  await h.click("Confirm 要求修改 via comms officer");
  assert.equal(h.sent.length, 1);
  await detour(h);
  assert.match(h.text(), /revise.*要求修改，Keep the retry visible/);
  assert.equal(h.find("Choose 准"), undefined);
});

test("sent and relayed progress survives a comms detour", async t => {
  const h = await mountBridge(t);
  await openA(h);
  await h.click("Choose 准"); await h.click("Confirm 准 via comms officer");
  await detour(h);
  assert.match(h.text(), /Sent to the comms officer/);
  const claim = h.claims.get("brief-a");
  h.timeline.set("a", [{ item: { type: "user_message", text: claim.decisionId } }]);
  await h.poll(); await detour(h);
  assert.match(h.text(), /Relayed to A FO/);
  assert.equal(h.sent.length, 1);
});

test("a recorded item never becomes actionable again", async t => {
  const h = await mountBridge(t);
  await openA(h); await h.click("Choose 准"); await h.click("Confirm 准 via comms officer");
  const claim = h.claims.get("brief-a");
  h.records.set("a", { decision: "approve", reason: `${claim.decisionId} ${claim.words}` });
  await h.poll();
  assert.match(h.text(), /Recorded: approve/);
  assert.equal(h.find("Choose 准"), undefined);
  assert.match(h.text(), /Waiting on you · 1/, "finished item leaves pending counts");
  await h.click("Commander");
  assert.match(h.text(), /Done this session/);
  assert.equal(h.sent.length, 1);
});

test("switching items keeps separate drafts and rejects stale actions", async t => {
  const h = await mountBridge(t);
  await openA(h); await h.type("Message A FO", "Draft for A");
  await h.click("Choose 暫緩"); await h.type("Reason for 暫緩", "A reason");
  await h.click("Approve b? — B FO"); await h.type("Message B FO", "Draft for B");
  await openA(h);
  assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value, "Draft for A");
  assert.equal((h.find("Reason for 暫緩") as HTMLTextAreaElement).value, "A reason");
  const finish = h.deferBriefing();
  const confirm = h.find("Confirm 暫緩 via comms officer")!;
  await act(async () => confirm.click());
  await h.click("Commander");
  await finish();
  assert.equal(h.find("Confirm 暫緩 via comms officer"), undefined);
  assert.equal(h.claims.size, 0, "a card hidden during a target check cannot claim a decision");
  assert.equal(h.sent.length, 0);

});

test("errors and progress stay with their own source and owner", async t => {
  const h = await mountBridge(t);
  h.failures.add("co");
  await h.refresh("co");
  await h.click("Commander");
  assert.match(h.text(), /Cannot read co|Could not read/);
  assert.equal(h.find("Message Comms officer")?.parentElement?.textContent?.includes("No messages yet"), false);
  await openA(h);
  assert.doesNotMatch(h.text(), /Cannot read co/);
  await h.click("Choose 准"); await h.click("Confirm 准 via comms officer");
  await h.click("Approve b? — B FO");
  assert.doesNotMatch(h.text(), /Sent to the comms officer/);
  assert.ok(h.find("Choose 准"));
});


test("every drill-down returns to the commander in one step keeping drafts and progress", async t => {
  const h = await mountBridge(t, true);
  assert.ok(h.find("Message Comms officer"), "phone opens on the commander");
  await h.type("Message Comms officer", "Commander draft");
  const commander = h.find("Message Comms officer");
  await h.click("Board");
  assert.ok(h.find("Back to Commander"), "the phone board has a fixed return");
  await openA(h);
  await h.type("Message A FO", "A message");
  await h.click("Choose 暫緩"); await h.type("Reason for 暫緩", "Need proof");
  await h.click("Back to Commander");
  assert.equal(h.find("Message Comms officer"), commander, "commander stays mounted with its conversation position");
  assert.equal((commander as HTMLTextAreaElement).value, "Commander draft");
  await h.click("Board"); await openA(h);
  assert.equal((h.find("Message A FO") as HTMLTextAreaElement).value, "A message");
  assert.equal((h.find("Reason for 暫緩") as HTMLTextAreaElement).value, "Need proof");
  await h.click("Confirm 暫緩 via comms officer"); await h.click("Back to Commander");
  await h.click("Board"); await openA(h);
  assert.match(h.text(), /Sent to the comms officer/);
  assert.equal(h.sent.length, 1);
});

test("an FO with nothing waiting is reachable from By FO", async t => {
  const h = await mountBridge(t);
  await h.click("Filter gate"); await h.click("By FO");
  await h.click("Conversation with Research FO");
  assert.ok(h.find("Message Research FO"));
  await h.click("Back to Commander");
  assert.ok(h.find("Message Comms officer"));
});

test("a recorded item reopens to its result and reason this session and is never actionable", async t => {
  const h = await mountBridge(t);
  await openA(h); await h.click("Choose 要求修改");
  await h.type("Reason for 要求修改", "Preserve the observed failure");
  await h.click("Confirm 要求修改 via comms officer");
  const claim = h.claims.get("brief-a");
  h.records.set("a", { decision: "revise", reason: `${claim.decisionId} ${claim.words}` });
  await h.poll(); await h.click("Back to Commander");
  await h.click("Filter permission");
  assert.match(h.text(), /Done this session/);
  await openA(h);
  assert.match(h.text(), /Recorded: revise/);
  assert.match(h.text(), /Preserve the observed failure/);
  assert.equal(h.find("Choose 准"), undefined);
  assert.equal(h.sent.length, 1);
  assert.match(h.text(), /Waiting on you · 1/);
  assert.match(h.text(), /Permissions 0/);
});


test("an ordinary message never consumes the gate decision controls", async t => {
  const h = await mountBridge(t); await openA(h);
  await h.type("Message A FO", "Clarify this proof first");
  await h.click("Send to A FO");
  assert.ok(h.find("Choose 准"));
  assert.equal(h.claims.size, 0);
  assert.equal(h.sent[0].id, "a");
});

test("desktop board navigation keeps the commander as the default detail", async t => {
  const h = await mountBridge(t); await openA(h);
  await h.click("Board");
  assert.ok(h.find("Message Comms officer"));
});
