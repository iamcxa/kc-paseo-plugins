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
const log = (o: object) => appendFileSync(`${S}/probe.jsonl`, JSON.stringify({ at: new Date().toISOString(), ...o }) + "\n");
const row = (rowId: string, names: string[]) => ({
  type: "plugin" as const, id: rowId, kind: "missing-variables", version: 1,
  data: { variables: names.map((name) => ({ name, cause: "unreachable" })) },
});
const pending = new Map<string, string[]>();
async function tryAppend(ctx: any, agentId: string, where: string, rowId: string, names: string[]) {
  try {
    const r = await ctx.paseo.agents.ref(agentId).timeline.append(row(rowId, names));
    log({ probe: "append", where, agentId, rowId, ok: true, seq: r?.seq });
  } catch (e) {
    log({ probe: "append", where, agentId, rowId, ok: false, error: String((e as Error).message).slice(0, 120) });
  }
}
export default function plugin(server: PluginServerContext) {
  const spy = new Proxy(server, {
    get(target: any, prop) {
      if (prop === "before") {
        return (name: string, fn: any) =>
          target.before(name, async (arg: any, ctx: any) => {
            const out = await fn(arg, ctx);
            if (name === "agent.session_open") {
              const got = out?.env ?? arg.request.env ?? {};
              const blank = ["SENTRY_AUTH_TOKEN", "STRIPE_KEY"].filter((k) => got[k] === "");
              log({ hook: name, reason: arg.request.reason, purpose: arg.request.purpose, agentId: arg.request.agentId, blank });
              if (arg.request.purpose === "interactive" && arg.request.reason !== "create" && blank.length > 0) {
                const id = arg.request.agentId;
                pending.set(id, blank);
                await tryAppend(ctx, id, "in-hook", "probe-inhook", blank);
                setTimeout(() => void tryAppend(ctx, id, "after-300ms", "probe-300", blank), 300);
                setTimeout(() => void tryAppend(ctx, id, "after-3s", "probe-3s", blank), 3000);
              }
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
  for (const name of ["agent.turn_started", "agent.turn_ended"] as const) {
    (server as any).on(name, async (arg: any, ctx: any) => {
      const id = arg.agent.id;
      log({ probe: "event", name, agentId: id, hasPending: pending.has(id) });
      if (name === "agent.turn_started" && pending.has(id)) {
        await tryAppend(ctx, id, "turn_started", "probe-turn-row", pending.get(id)!);
        pending.delete(id);
      }
      if (name === "agent.turn_ended") await tryAppend(ctx, id, "turn_ended (same id again)", "probe-turn-row", ["REPLACED"]);
    });
  }
  return contribute(spy as PluginServerContext, { ...world.tools, git: "/usr/bin/git" });
}
