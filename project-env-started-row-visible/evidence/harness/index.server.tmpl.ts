import { appendFileSync, writeFileSync } from "node:fs";
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";
const S = "__S__";
const item = (id: string, title: string, fields: string[]) => ({
  id, title, category: "SECURE_NOTE",
  fields: fields.map((label) => ({ label, type: "CONCEALED", purpose: undefined })),
});
const items = [item("i1", "SENTRY", ["SENTRY_AUTH_TOKEN"]), item("i2", "stripe", ["secret-key"])];
const refs: Record<string, string> = {};
for (const it of items) for (const f of it.fields) refs[`op://Dev/${it.title}/${f.label}`] = `fake-${it.title}-${f.label}`;
const world = makeWorld({ keychain: { "sa-a": "a" }, op: { accounts: { a: { vaults: ["Dev"], items, refs } } } });
writeFileSync(`${S}/world-dir`, world.dir);
const log = (o: object) => appendFileSync(`${S}/events.jsonl`, JSON.stringify({ at: new Date().toISOString(), ...o }) + "\n");
export default function plugin(server: PluginServerContext) {
  const spy = new Proxy(server, {
    get(target: any, prop) {
      if (prop === "before") {
        return (name: string, fn: any) =>
          target.before(name, async (arg: any, ...rest: any[]) => {
            const out = await fn(arg, ...rest);
            if (name === "agent.session_open") {
              const sent = arg.request.env ?? {};
              const got = out?.env ?? sent;
              log({ hook: name, reason: arg.request.reason, purpose: arg.request.purpose, agentId: arg.request.agentId,
                env: Object.fromEntries(["SENTRY_AUTH_TOKEN", "STRIPE_KEY"].map((k) => [k, k in got ? (got[k] === "" ? "blank" : "filled") : "absent"])) });
            }
            return out;
          });
      }
      if (prop === "on") {
        return (name: string, fn: any) =>
          target.on(name, (arg: any, ctx: any) => {
            log({ event: name, agentId: arg?.agent?.id });
            return fn(arg, ctx);
          });
      }
      const v = target[prop];
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
  for (const name of ["agent.turn_started", "agent.turn_ended"]) {
    (server as any).on(name, (arg: any) => log({ event: name, agentId: arg.agent.id, probe: true }));
  }
  return contribute(spy as PluginServerContext, { ...world.tools, git: "/usr/bin/git" });
}
