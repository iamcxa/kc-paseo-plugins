import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";

const item = (id: string, title: string, labels: string[]) => ({
  id,
  title,
  category: "SECURE_NOTE",
  fields: labels.map((label) => ({ label, type: "CONCEALED", value: "x" })),
});

const world = makeWorld({
  keychain: { "sa-a": "a" },
  op: {
    accounts: {
      a: {
        vaults: ["demo-dev"],
        refs: {
          "op://demo-dev/SENTRY/SENTRY_AUTH_TOKEN": "x",
          "op://demo-dev/SENTRY/SENTRY_PROJECT": "",
          "op://demo-dev/stripe/secret-key": "x",
          "op://demo-dev/TWILIO/TWILIO_ACCOUNT_SID": "x",
          "op://demo-dev/POSTHOG/POSTHOG_CLI_API_KEY": "x",
          "op://demo-dev/POSTHOG/POSTHOG_CLI_HOST": "x",
        },
        items: [
          item("i1", "SENTRY", ["SENTRY_AUTH_TOKEN", "SENTRY_PROJECT"]),
          item("i2", "stripe", ["secret-key"]),
          item("i3", "TWILIO", ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]),
          item("i4", "POSTHOG", ["POSTHOG_CLI_API_KEY", "POSTHOG_CLI_HOST"]),
        ],
      },
    },
  },
  git: { answers: {} },
});

export default function plugin(server: PluginServerContext) {
  return contribute(server, world.tools);
}
