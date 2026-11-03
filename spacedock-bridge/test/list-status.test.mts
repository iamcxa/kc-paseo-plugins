import assert from "node:assert/strict";
import { test } from "node:test";
import { itemStatus, filterCounts } from "../shared/list-status";

 test("status priority covers every waiting kind in LIST-AND-DETAIL", () => {
  const cases = [
    [{ kind: "permission" }, "your-turn"], [{ kind: "gate" }, "your-turn"],
    [{ kind: "gate", sent: true }, "waiting"], [{ kind: "gate", relayed: true }, "waiting"],
    [{ kind: "gate", recorded: true }, "done"], [{ kind: "gate", closed: true }, "done"],
    [{ kind: "ask" }, "your-turn"], [{ kind: "ask", source: "comms" }, "your-turn"],
    [{ kind: "review", assigned: true }, "your-turn"], [{ kind: "review", assigned: false }, "your-turn"],
    [{ kind: "ask", sourceState: "loading" }, "waiting"], [{ kind: "ask", sourceState: "failed" }, "check"],
    [{ kind: "gate", tabClosed: true }, "your-turn"],
    [{ kind: "gate", recorded: true, sent: true, sourceState: "failed" }, "check"],
    [{ kind: "gate", recorded: true, sent: true }, "done"], [{ kind: "gate", overdue: true, relayed: true }, "check"],
  ] as const;
  for (const [input, expected] of cases) assert.equal(itemStatus(input).state, expected, JSON.stringify(input));
 });
 test("counts retain pending progress, exclude finished items and distinguish incomplete from zero", () => {
  const items = [{ kind: "gate", sent: true }, { kind: "gate", relayed: true }, { kind: "gate", recorded: true }, { kind: "ask" }, { kind: "review", closed: true }] as const;
  const sources = { fos: "loaded", gates: "loaded", reviews: "loaded", comms: "loaded" } as const;
  assert.deepEqual(filterCounts(items, sources), { all: "3", permission: "0", review: "0", gate: "2", ask: "1" });
  assert.deepEqual(filterCounts([], { ...sources, comms: "failed" }), { all: "?", permission: "0", review: "0", gate: "0", ask: "?" });
  assert.equal(filterCounts(items, { ...sources, gates: "loading" }).gate, "2+");
 });
