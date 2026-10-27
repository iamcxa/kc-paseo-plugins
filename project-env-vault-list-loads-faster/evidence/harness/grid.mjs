// usage: node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON grid.mjs <srcRoot> <label> <N,N,..> <delayMs,..> [reps] [skipEvery]
// Times secrets.listRefs (server side only) against the fake op, and splits the wall time from the fake's own call log.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [src, label, sizesArg, delaysArg, repsArg = "3", skipArg = "10"] = process.argv.slice(2);
const root = join(src, "project-env");
const { createSecrets } = await import(join(root, "server/secrets.ts"));
const { makeWorld } = await import(join(root, "test/world.ts"));
const items = (n) => Array.from({ length: n }, (_, i) => ({
  id: `i${i}`, title: `Item ${i}`, category: "SECURE_NOTE",
  fields: [{ label: `KEY_${i}`, type: "CONCEALED" }, { label: `HOST_${i}`, type: "STRING" }, { label: "notesPlain", purpose: "NOTES" }],
}));
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
for (const n of sizesArg.split(",").map(Number)) for (const d of delaysArg.split(",").map(Number)) {
  const walls = []; let split = null, digest = null;
  for (let r = 0; r < Number(repsArg); r++) {
    const fail = {};
    if (Number(skipArg) > 0) for (let i = 0; i < n; i += Number(skipArg)) fail[`item get i${i}`] = { stderr: "[ERROR] invalid PEM private key passed in" };
    const world = makeWorld({ keychain: { "sa-a": "a" }, op: { accounts: { a: { items: items(n) } }, callDelayMs: d, fail } });
    const secrets = createSecrets(world.tools);
    const t0 = Date.now();
    const out = await secrets.listRefs("sa-a", "Dev");
    walls.push(Date.now() - t0);
    digest = createHash("sha256").update(JSON.stringify(out)).digest("hex").slice(0, 12);
    const jsonl = (name) => readFileSync(join(world.dir, name), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const ends = jsonl("ends.jsonl");
    const spans = jsonl("calls.jsonl").map((s) => ({ ...s, end: ends.find((e) => e.pid === s.pid).at }));
    const sec = spans.find((s) => s.tool === "security");
    const list = spans.find((s) => s.argv[1] === "list");
    const gets = spans.filter((s) => s.argv[1] === "get");
    let peak = 0; for (const g of gets) peak = Math.max(peak, gets.filter((o) => o.start <= g.start && o.end > g.start).length);
    split = {
      token_ms: sec.end - sec.start, list_ms: list.end - list.start, gets: gets.length,
      get_ms_each: Math.round(med(gets.map((g) => g.end - g.start))), peak_inflight: peak,
      first_get_after_list_ms: Math.min(...gets.map((g) => g.start)) - list.end,
      server_first_to_last_ms: Math.max(...spans.map((s) => s.end)) - Math.min(...spans.map((s) => s.start)),
      op_calls: spans.filter((s) => s.tool === "op").length,
      boot_overhead_ms_per_call: Math.round(((walls[walls.length - 1]) - sec.end + sec.start - (list.end - list.start) - gets.reduce((a, g) => a + g.end - g.start, 0)) / (1 + gets.length + 1)),
    };
    world.cleanup();
  }
  console.log(JSON.stringify({ label, items: n, delay_ms: d, wall_ms_median: med(walls), wall_ms_all: walls, output_digest: digest, ...split }));
}
