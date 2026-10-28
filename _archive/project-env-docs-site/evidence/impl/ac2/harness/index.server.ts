import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";
const item = (id: string, title: string, fields: string[]) => ({
  id, title, category: "SECURE_NOTE",
  fields: fields.map((label) => ({ label, type: "CONCEALED", purpose: undefined })),
});
const items = [
  item("i1", "sentry", ["SENTRY_AUTH_TOKEN", "SENTRY_PROJECT"]),
  item("i2", "stripe", ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]),
  item("i3", "posthog", ["POSTHOG_API_KEY", "POSTHOG_HOST"]),
];
const refs: Record<string, string> = {};
for (const it of items) for (const f of it.fields) refs[`op://agent-shop-api-dev/${it.title}/${f.label}`] = `fake-${it.title}-${f.label}`;
const world = makeWorld({
  keychain: { "agent-shop-api-dev-read": "a" },
  op: { accounts: { a: { vaults: ["agent-shop-api-dev"], items, refs } } },
  git: { answers: {} },
});
export default function plugin(server: PluginServerContext) {
  return contribute(server, { ...world.tools, git: "/usr/bin/git" });
}
