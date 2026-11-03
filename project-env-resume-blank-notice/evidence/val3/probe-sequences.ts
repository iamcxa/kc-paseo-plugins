import { createNotices } from "/tmp/val3-cand/project-env/server/missing-variables-notice.ts";
type Set_ = string[];
const names = ["A", "B", "C"];
const f = (ks: Set_) => ks.map((name) => ({ name, cause: "empty" as const }));
const inter = (a: Set_, b: Set_) => a.filter((x) => b.includes(x));
const same = (a: Set_, b: Set_) => a.length === b.length && a.every((x) => b.includes(x));

// Explicit sequences: [label, steps, expected rows]
type Step = ["resume" | "refresh" | "create", Set_] | ["flush"] | ["drop"];
const explicit: [string, Step[], number][] = [
  ["identical set across a refresh that read the same failure adds nothing", [["resume", ["A"]], ["flush"], ["refresh", ["A"]], ["resume", ["A"]], ["flush"]], 1],
  ["resume twice with a release before the first turn ended shows the line once", [["resume", ["A"]], ["drop"], ["resume", ["A"]], ["flush"]], 1],
  ["a clean resume cancels a pending line and clears memory", [["resume", ["A"]], ["flush"], ["resume", []], ["resume", ["A"]], ["flush"]], 2],
  ["a clean resume while a line is pending cancels it", [["resume", ["A"]], ["resume", []], ["flush"], ["resume", ["A"]], ["flush"]], 1],
  ["create row then resume with the same failure adds nothing", [["create", ["A"]], ["flush"], ["resume", ["A"]], ["flush"]], 1],
  ["create row, a clean resume, then the failure at a resume shows again", [["create", ["A"]], ["flush"], ["resume", []], ["resume", ["A"]], ["flush"]], 2],
  ["a different set adds a row", [["resume", ["A"]], ["flush"], ["resume", ["B"]], ["flush"]], 2],
  ["refresh-only recovery then refresh-only re-failure, then resume with the shown set", [["resume", ["A", "B"]], ["flush"], ["refresh", ["B"]], ["refresh", ["A", "B"]], ["resume", ["A", "B"]], ["flush"]], 2],
  ["a refresh that fixes the variable during the turn still shows the opening's row, then a later failure shows again", [["resume", ["A"]], ["refresh", []], ["flush"], ["resume", ["A"]], ["flush"]], 2],
];
const run = async (steps: Step[]) => {
  const n = createNotices({ log: () => {} });
  let rows = 0;
  for (const s of steps) {
    if (s[0] === "resume") n.record("x", f(s[1]), { resumed: true });
    else if (s[0] === "create") n.record("x", f(s[1]));
    else if (s[0] === "refresh") n.retain("x", f(s[1]));
    else if (s[0] === "flush") await n.flush("x", async () => void rows++);
    else n.drop("x");
  }
  return rows;
};
let bad = 0;
for (const [label, steps, want] of explicit) {
  const got = await run(steps);
  if (got !== want) bad++;
  console.log(`${got === want ? "ok  " : "FAIL"} rows=${got} want=${want}  ${label}`);
}

// Differential fuzz against an oracle written from the Captain-approved rule, not from the code.
let seed = 12345;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = () => names.filter(() => rnd() < 0.5);
let mismatches = 0, total = 0;
for (let i = 0; i < 30000; i++) {
  const n = createNotices({ log: () => {} });
  let S: Set_ = [];            // last displayed set, narrowed by every later observation
  let latest: Set_ = [];       // latest observation
  let pend: { keys: Set_; resumed: boolean } | null = null;
  let want = 0, got = 0;
  const trace: string[] = [];
  const obs = (k: Set_) => { latest = k; S = inter(S, k); };
  for (let j = 0; j < 14; j++) {
    const r = rnd();
    if (r < 0.35) {
      const k = pick(); trace.push(`resume${JSON.stringify(k)}`);
      n.record("x", f(k), { resumed: true });
      pend = null;
      if (k.length > 0 && !same(S, k)) pend = { keys: k, resumed: true };
      obs(k);
    } else if (r < 0.5) {
      const k = pick(); trace.push(`refresh${JSON.stringify(k)}`);
      n.retain("x", f(k)); obs(k);
    } else if (r < 0.58) {
      const k = pick(); trace.push(`create${JSON.stringify(k)}`);
      n.record("x", f(k));
      if (k.length > 0) pend = { keys: k, resumed: false };
      obs(k);
    } else if (r < 0.85) {
      trace.push("flush");
      await n.flush("x", async () => void got++);
      if (pend) { want++; S = inter(pend.keys, latest); pend = null; }
    } else {
      trace.push("drop"); n.drop("x"); pend = null;
    }
  }
  total++;
  if (want !== got) { mismatches++; if (mismatches <= 3) console.log("MISMATCH want", want, "got", got, trace.join(" ")); }
}
console.log(`fuzz: ${total} sequences, ${mismatches} mismatches against the oracle`);
process.exit(bad || mismatches ? 1 : 0);
