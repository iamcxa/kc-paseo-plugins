import { makeWorld } from "/tmp/pe-t4-match-draft/plugin/test/world.ts";
const w = makeWorld({
  keychain: { "sa-a": "a" },
  op: { accounts: { a: { vaults: ["V"], refs: {
    "op://V/api/key": "ok-value-1",
    "op://V/api/blank": "",
    "op://V/api/spaces": "   \t ",
    "op://V/db/url": "ok-value-2",
  } } } },
});
console.log(w.dir);
