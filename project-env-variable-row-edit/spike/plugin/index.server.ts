import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";

// Disposable spike: fake op/security/git so no Keychain or 1Password is touched.
const world = makeWorld({
  keychain: { "sa-a": "a" },
  op: {
    accounts: {
      a: {
        vaults: ["Dev"],
        refs: {
          "op://Dev/linear/credential": "x",
          "op://Dev/stripe/secret-key": "x",
          "op://Dev/sentry/auth-token": "x",
          "op://Dev/blank/credential": "",
        },
      },
    },
  },
  git: { answers: {} },
});

export default function plugin(server: PluginServerContext) {
  return contribute(server, world.tools);
}
