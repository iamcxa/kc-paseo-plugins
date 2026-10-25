import assert from "node:assert/strict";
import { test } from "node:test";
import { boardEmptyState, type SourceStates } from "../shared/board-empty";

const loaded: SourceStates = { fos: "loaded", gates: "loaded", reviews: "loaded", comms: "loaded" };

test("only checked, empty sources can claim nothing is waiting and a zero count", () => {
  assert.deepEqual(boardEmptyState(loaded, 0), { message: "Nothing is waiting on you.", count: "0" });
  assert.deepEqual(boardEmptyState(loaded, 2), { message: null, count: "2" });
  for (const source of Object.keys(loaded) as (keyof SourceStates)[]) {
    const result = boardEmptyState({ ...loaded, [source]: "loading" }, 0);
    assert.equal(result.message, "Loading…");
    assert.equal(result.count, "…");
  }
});

test("a source failure makes both the empty text and the count incomplete until success", () => {
  const failed: SourceStates = { ...loaded, reviews: "failed" };
  assert.deepEqual(boardEmptyState(failed, 0), {
    message: "Could not check reviews — this list may be incomplete", count: "?",
  });
  assert.equal(boardEmptyState(failed, 3).count, "3+");
  assert.match(boardEmptyState(failed, 3).message!, /Could not check reviews/);
  assert.equal(boardEmptyState(loaded, 0).count, "0");
});

test("gate failures name only the failed workflows while successful gates stay counted", () => {
  const result = boardEmptyState({ ...loaded, gates: "failed" }, 1, ["/removed/workflow"]);
  assert.deepEqual(result, { message: "Could not check gates for /removed/workflow — this list may be incomplete", count: "1+" });
});
