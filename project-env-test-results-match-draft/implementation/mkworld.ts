import { makeWorld } from "/tmp/pe-t4-impl/plugin/test/world.ts";
const w = makeWorld({
  keychain: { "sa-a": "a", "sa-b": "b" },
  op: { accounts: {
    a: { vaults: ["V", "W"], refs: {
      "op://V/api/key": "ok-value-1", "op://V/api/blank": "", "op://V/api/spaces": "   \t ", "op://V/db/url": "ok-value-2",
    }, items: [] },
    b: { vaults: ["V"], refs: { "op://V/api/key": "ok-b" } },
  }, delayMs: { "op://V/db/url": 5000 } },
});
console.log(w.dir);
