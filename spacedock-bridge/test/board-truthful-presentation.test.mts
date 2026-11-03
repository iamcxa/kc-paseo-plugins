import assert from "node:assert/strict";
import { test } from "node:test";
import { mountBridge } from "./helpers/bridge-host.mjs";

for (const compact of [false, true]) {
  for (const view of ["decision", "fo"]) {
    for (const progress of ["sent", "relayed"]) {
      test(`a ${progress} item never appears under a waiting-on-you claim (${compact ? 360 : 1440}, ${view})`, async t => {
        const h = await mountBridge(t, compact);
        if (compact) await h.click("Board");
        await h.click("Approve a? — A FO");
        await h.click("Choose 准"); await h.click("Confirm 准 via comms officer");
        if (progress === "relayed") {
          h.timeline.set("a", [{ seqStart: 1, item: { type: "user_message", text: h.claims.get("brief-a").decisionId } }]);
          await h.poll();
        }
        await h.click("Back to Commander");
        if (compact) await h.click("Board");
        if (view === "fo") await h.click("By FO");
        assert.match(h.text(), /Board · 2/);
        assert.doesNotMatch(h.text(), /waiting on you/i);
        assert.match(h.text(), progress === "sent" ? /◷ Waiting for relay/ : /◷ Waiting for record/);
        if (view === "decision") { assert.match(h.text(), /All 2/); assert.match(h.text(), /Gates 2/); }
        else assert.match(h.text(), /1 waiting/);
        assert.equal(h.sent.length, 1);
      });
    }
  }
  test(`an FO with nothing waiting opens only its conversation (${compact ? 360 : 1440})`, async t => {
    const h = await mountBridge(t, compact);
    if (compact) await h.click("Board");
    await h.click("By FO"); await h.click("Conversation with Research FO");
    assert.ok(h.find("Message Research FO"));
    assert.doesNotMatch(h.text(), /QUESTION|waiting \d+[smhd]/);
    assert.ok(!h.find("Show briefing") && !h.find("Hide briefing"));
    assert.ok(!h.find("Drag to resize the briefing; tap the grip to fit it to its content"));
    assert.ok(!h.find("Choose 准"));
    await h.type("Message Research FO", "Research discussion draft");
    const composer = h.find("Message Research FO");
    await h.click("Back to Commander");
    if (compact) await h.click("Board");
    await h.click("Conversation with Research FO");
    assert.ok(h.find("Message Research FO") === composer);
    assert.equal((composer as HTMLTextAreaElement).value, "Research discussion draft");
    await h.click("Send to Research FO");
    assert.deepEqual(h.sent, [{ id: "idle", text: "Research discussion draft" }]);
  });
}
