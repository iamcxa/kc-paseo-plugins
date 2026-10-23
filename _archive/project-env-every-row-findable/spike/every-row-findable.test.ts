import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { openProject } from "../client/open-project.ts";
import { nextFieldless, type Project } from "../shared/config.ts";
import { summaryText, summaryParts, type Run } from "../shared/test-marks.ts";

const v = (name: string, ref = "") => ({ name, ref });
const rows = [v("A", "op://V/a/x"), v("B"), v("C", "op://V/c/x"), v("D"), v("E")];
const project = (variables = rows): Project => ({ root: "/r", serviceAccount: "sa", vault: "V", prompt: "", variables });

describe("nextFieldless", () => {
  it("starts at the first row with no field and steps through them in list order", () => {
    const seen: string[] = [];
    let after: string | null = null;
    for (let press = 0; press < 3; press++) {
      const i = nextFieldless(rows, after);
      after = rows[i].name;
      seen.push(after);
    }
    assert.deepEqual(seen, ["B", "D", "E"]);
  });

  it("wraps from the last such row back to the first", () => {
    assert.equal(rows[nextFieldless(rows, "E")].name, "B");
  });

  it("carries on from where the last visited row stood when that row now has a field", () => {
    const picked = rows.map((r) => (r.name === "B" ? { ...r, ref: "op://V/b/x" } : r));
    assert.equal(picked[nextFieldless(picked, "B")].name, "D");
  });

  it("ignores unnamed rows and finds nothing when every row has a field", () => {
    assert.equal(nextFieldless([v("", ""), v("A", "op://V/a/x")], null), -1);
    assert.equal(nextFieldless([], null), -1);
  });

  it("keeps returning the one row when only one has no field", () => {
    const one = [v("A", "op://V/a/x"), v("B")];
    assert.equal(nextFieldless(one, "B"), 1);
  });
});

describe("the last Test run lives in the open project", () => {
  afterEach(() => openProject.close());
  const run: Run = { sent: project(), results: [{ name: "A", ok: true }] };

  it("is kept by setRun, survives edits and is read back as the same summary", () => {
    openProject.begin(project([v("A", "op://V/a/x")]), "rev");
    openProject.setRun({ sent: project([v("A", "op://V/a/x")]), results: run.results }, undefined);
    openProject.update((d) => ({ ...d, prompt: "x" }), false);
    const open = openProject.get();
    assert.equal(summaryText(summaryParts(open!.draft, open!.run, false)), "All 1 set");
  });

  it("starts empty for a newly opened project and ignores a run from a closed session", () => {
    openProject.begin(project(), "rev");
    const stale = openProject.get()!.session;
    openProject.begin(project(), "rev");
    assert.equal(openProject.get()?.run, undefined);
    openProject.setRun(run, stale);
    assert.equal(openProject.get()?.run, undefined);
  });
});
