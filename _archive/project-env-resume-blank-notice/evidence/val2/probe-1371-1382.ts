import { createNotices } from "/tmp/val2-cand/project-env/server/missing-variables-notice.ts";
const A = { name: "A", cause: "missing-field" } as any;
const B = { name: "B", cause: "missing-field" } as any;
const run = async (label: string, steps: (n: ReturnType<typeof createNotices>, rows: any[]) => Promise<void>) => {
  const n = createNotices({ log: () => {} });
  const rows: any[] = [];
  await steps(n, rows);
  console.log(`${label}: rows shown = ${rows.length}`);
};
const show = (rows: any[]) => async (d: any) => { rows.push(d); };
// 1371: resume(A fails) -> refresh reads everything -> turn ends -> later resume(A fails again) -> turn ends
await run("1371 expect 2 rows if every failure is shown (got fewer = suppressed)", async (n, rows) => {
  n.record("x", [A], { resumed: true }); n.retain("x", []); await n.flush("x", show(rows));
  n.record("x", [A], { resumed: true }); await n.flush("x", show(rows));
});
// 1382: row [A,B] shown; resume reads only [A] (B recovered), released before a turn ends; later resume reads [A,B]
await run("1382 expect 2 rows if every failure is shown (got fewer = suppressed)", async (n, rows) => {
  n.record("x", [A, B], { resumed: true }); await n.flush("x", show(rows));
  n.record("x", [A], { resumed: true }); n.drop("x");
  n.record("x", [A, B], { resumed: true }); await n.flush("x", show(rows));
});
// control: the same recovery but the turn ends (no release) is remembered
await run("control: partial recovery then its turn ends, later [A,B] again", async (n, rows) => {
  n.record("x", [A, B], { resumed: true }); await n.flush("x", show(rows));
  n.record("x", [A], { resumed: true }); await n.flush("x", show(rows));
  n.record("x", [A, B], { resumed: true }); await n.flush("x", show(rows));
});
// control: full recovery then release is forgotten immediately
await run("control: all readable at a resume, release, later [A,B] again", async (n, rows) => {
  n.record("x", [A, B], { resumed: true }); await n.flush("x", show(rows));
  n.record("x", [], { resumed: true }); n.drop("x");
  n.record("x", [A, B], { resumed: true }); await n.flush("x", show(rows));
});
