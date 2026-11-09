import { appendFileSync, writeFileSync } from "node:fs";
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";
const S = "__S__";
const items = [{ id: "i1", title: "stripe", category: "SECURE_NOTE", fields: [{ label: "STRIPE_KEY", type: "CONCEALED" }] }];
const world = makeWorld({ keychain: __KEYCHAIN__, op: { accounts: { a: { vaults: ["Dev"], items, refs: { "op://Dev/stripe/STRIPE_KEY": "fake-stripe-value" } } } } });
writeFileSync(`${S}/out/world-dir`, world.dir);
const log = (o: object) => appendFileSync(`${S}/out/events.jsonl`, JSON.stringify({ at: new Date().toISOString(), ...o }) + "\n");
export default function plugin(server: PluginServerContext) {
  const spy = new Proxy(server, {
    get(target: any, prop) {
      if (prop === "before") {
        return (name: string, fn: any) =>
          target.before(name, async (arg: any, ...rest: any[]) => {
            const out = await fn(arg, ...rest);
            if (name === "agent.session_open") {
              const got = out?.env ?? arg.request.env ?? {};
              log({ hook: name, reason: arg.request.reason, agentId: arg.request.agentId,
                STRIPE_KEY: "STRIPE_KEY" in got ? (got.STRIPE_KEY === "" ? "blank" : "filled") : "absent" });
            }
            return out;
          });
      }
      const v = target[prop];
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
  return contribute(spy as PluginServerContext, { ...world.tools, git: "/usr/bin/git" });
}
