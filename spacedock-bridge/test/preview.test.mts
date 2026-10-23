import assert from "node:assert/strict";
import { test } from "node:test";
import { lastReply, nextStepIsCaptains, parseEnvelope, permissionPreview, replyPreview } from "../shared/preview";

test("the last reply joins assistant text after the last user message", () => {
  assert.equal(
    lastReply([
      { type: "assistant_message", text: "old" },
      { type: "user_message", text: "question" },
      { type: "assistant_message", text: "first " },
      { type: "tool_call" },
      { type: "assistant_message", text: "second" },
    ]),
    "first second",
  );
});

test("a status block's next step is the preview", () => {
  const reply = [
    "Done with the review.",
    "```",
    "剩餘:   one gate",
    "下一步: 決定 #675 是否交付（你）",
    "可收線: 否",
    "```",
  ].join("\n");
  assert.equal(replyPreview(reply), "決定 #675 是否交付（你）");
});

test("without a next step the first line is the preview, clipped", () => {
  assert.equal(replyPreview("Short answer.\nMore detail."), "Short answer.");
  assert.equal(replyPreview("x".repeat(200)).length, 140);
});

test("a permission shows what it asks for", () => {
  assert.equal(permissionPreview({ name: "Write" }), "Permission: Write");
  assert.equal(permissionPreview(undefined), "");
});

test("the next step is the Captain's when it names 你 or you", () => {
  assert.equal(nextStepIsCaptains("下一步: 決定 #675 是否交付（你）"), true);
  assert.equal(nextStepIsCaptains("Next: merge it (you); then sync (me)"), true);
  assert.equal(nextStepIsCaptains("下一步: 等 Web FO 回覆（我）"), false);
  assert.equal(nextStepIsCaptains("No status block here."), false);
});

test("a Paseo agent envelope is read as its sender, kind and body", () => {
  const text =
    '<paseo-system version="1" kind="agent-notification" source-agent-id="72eb" source-agent-title="installer FO" event="finished">\nAgent finished.\n&lt;agent-response&gt;\nDone &amp; dusted\n&lt;/agent-response&gt;\n</paseo-system>';
  const envelope = parseEnvelope(text);
  assert.equal(envelope?.kind, "agent-notification");
  assert.equal(envelope?.from, "installer FO");
  assert.equal(envelope?.event, "finished");
  assert.match(envelope?.body ?? "", /Done & dusted/);
  assert.doesNotMatch(envelope?.body ?? "", /agent-response/);
  assert.equal(parseEnvelope("plain words"), null);
});

test("a user-message envelope or an unclosed one is not shown as coming from an agent", () => {
  assert.equal(parseEnvelope('<paseo-system version="1" kind="user-message">hi</paseo-system>'), null);
  assert.equal(parseEnvelope('<paseo-system kind="agent-message" source-agent-title="FO">no close'), null);
  assert.equal(
    parseEnvelope('<paseo-system kind="agent-message" xsource-agent-title="Fake" source-agent-id="a1">x</paseo-system>')?.from,
    "a1",
  );
});
