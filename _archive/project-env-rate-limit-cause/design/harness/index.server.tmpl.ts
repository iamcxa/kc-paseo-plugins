import { writeFileSync } from "node:fs";
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";
const S = "__S__";
const LIMIT = "[ERROR] 2026/11/05 10:00:00 Too Many Requests: You've reached the maximum number of this type of requests this service account is allowed to make. Please retry in 40 minutes.";
const item = (id: string, title: string, fields: string[]) => ({
  id, title, category: "API_CREDENTIAL",
  fields: fields.map((label) => ({ label, type: "CONCEALED", purpose: undefined })),
});
const items = [
  item("i1", "sentry", ["SENTRY_AUTH_TOKEN"]),
  item("i2", "stripe", ["STRIPE_SECRET_KEY"]),
  item("i3", "posthog", ["POSTHOG_API_KEY"]),
  item("i4", "linear", ["LINEAR_API_KEY"]),
  item("i5", "github", ["GITHUB_TOKEN"]),
  item("i6", "vercel", ["VERCEL_TOKEN"]),
];
const refs: Record<string, string> = {};
for (const it of items) for (const f of it.fields) refs[`op://Dev/${it.title}/${f.label}`] = `fake-${it.title}`;
const fail: Record<string, { stderr: string }> = {
  "op://Dev/stripe/STRIPE_SECRET_KEY": { stderr: LIMIT },
  "op://Dev/posthog/POSTHOG_API_KEY": { stderr: LIMIT },
};
for (const id of ["i4", "i5", "i6"]) fail[`item get ${id}`] = { stderr: LIMIT };
const world = makeWorld({ keychain: { "sa-a": "a" }, op: { accounts: { a: { vaults: ["Dev"], items, refs } }, fail } });
writeFileSync(`${S}/world-dir`, world.dir);
export default function plugin(server: PluginServerContext) {
  return contribute(server, { ...world.tools, git: "/usr/bin/git" });
}
