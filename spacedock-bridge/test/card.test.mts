import assert from "node:assert/strict";
import { test } from "node:test";
import { cardLabel, discussionWindow, foName, waiting } from "../shared/card";

test("the label line is kind, stage and repo, and a gate-less card is a question", () => {
  assert.equal(cardLabel({ stage: "backlog" }, "omp-trial"), "GATE · BACKLOG · OMP-TRIAL");
  assert.equal(cardLabel(null, "omp-trial"), "QUESTION · OMP-TRIAL");
  assert.equal(cardLabel(null, ""), "QUESTION");
});

test("the FO line drops the model name but keeps a title that is only a model name", () => {
  assert.equal(foName("OMP trial FO (claude-opus-5)"), "OMP trial FO");
  assert.equal(foName("(claude-opus-5)"), "(claude-opus-5)");
  assert.equal(foName("kc-plugin dev2 FO"), "kc-plugin dev2 FO");
});

test("waiting time reads in seconds, minutes and hours", () => {
  const at = "2026-10-23T05:00:00Z";
  const later = (seconds: number) => Date.parse(at) + seconds * 1000;
  assert.equal(waiting(at, later(30)), "waiting 30s");
  assert.equal(waiting(at, later(180)), "waiting 3m");
  assert.equal(waiting(at, later(3 * 3600)), "waiting 3h");
});

const line = (key: string, role: string) => ({ key, role });

test("collapsed, the discussion starts at the FO's latest message and counts the messages before it", () => {
  const lines = [
    line("1", "user"),
    line("2", "tools"),
    line("3", "assistant"),
    line("4", "user"),
    line("5", "tools"),
    line("6", "assistant"),
    line("7", "user"),
  ];
  const collapsed = discussionWindow(lines, false);
  assert.deepEqual(collapsed.shown.map((l) => l.key), ["6", "7"]);
  assert.equal(collapsed.earlier, 3);
  assert.deepEqual(discussionWindow(lines, true).shown.map((l) => l.key), ["1", "2", "3", "4", "5", "6", "7"]);
});

test("one message has nothing earlier, and no FO message falls back to the last message", () => {
  assert.equal(discussionWindow([line("1", "assistant")], false).earlier, 0);
  const onlyYours = discussionWindow([line("1", "user"), line("2", "user"), line("3", "tools")], false);
  assert.deepEqual(onlyYours.shown.map((l) => l.key), ["2", "3"]);
  assert.equal(onlyYours.earlier, 1);
  assert.deepEqual(discussionWindow([], false), { shown: [], earlier: 0 });
});
