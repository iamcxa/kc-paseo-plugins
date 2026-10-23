import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";

const item = (id: string, title: string, fields: string[]) => ({
  id, title, category: "SECURE_NOTE",
  fields: fields.map((label) => ({ label, type: "CONCEALED", purpose: undefined })),
});
const world = makeWorld({
  keychain: { "sa-a": "a" },
  op: { accounts: { a: { vaults: ["Dev"], items: [
    item("i1", "SENTRY", ["SENTRY_AUTH_TOKEN", "SENTRY_PROJECT"]),
    item("i2", "stripe", ["secret-key", "STRIPE_WEBHOOK_SECRET", "Publishable key"]),
    item("i3", "POSTHOG", ["POSTHOG_CLI_API_KEY", "POSTHOG_CLI_HOST"]),
    item("i4", "TWILIO", ["TWILIO_ACCOUNT_SID", "apiKey", "PATH", "2fa code"]),
  ] } } },
  git: { answers: {} },
});
export default function plugin(server: PluginServerContext) {
  return contribute(server, world.tools);
}
